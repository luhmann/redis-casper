var redis = require("redis");
var client = redis.createClient(6379, "mydevbox", {});
var _ = require('lodash');
var util = require('util');
var jf = require('jsonfile');
var path = require('path');
var logger = require('./logger');

jf.spaces = 4;

var options = {
    keyNamespaces: [ 'content:v1:de:de:live:', 'buzz:v1:de:de:live:' ],
    host: 'http://frontend.vag-jfd.magic-technik.de:81',
    partialRoutePrefix: '_partial',
    outDir: 'out'
};

var templates = {
    url: _.template('<%= host %><%= path %>'),
    jsonUrl: _.template('<%= host %><%= path %>?_format=json')
};

var routes = [];
var jsonRoutes = [];

var saveJsonToFile = function (filename, json) {
    var filepath = path.resolve(__dirname, options.outDir, filename);

    jf.writeFile(filepath, json, function (err) {
        if (null !== err) {
            logger.error(err);
        }
    });
};

var getRoutesFromRedis = function (namespace) {
    client.keys(namespace + '*', function (err, replies) {
        replies.forEach(function (key) {
            var path = key.replace(namespace, '');
            var isPartial = (path.indexOf(options.partialRoutePrefix) > -1);
            var templateFunction = (isPartial) ? templates.jsonUrl : templates.url;

            if (isPartial) {
                jsonRoutes.push(templateFunction({host: options.host, path: path}));
            } else {
                routes.push(templateFunction({host: options.host, path: path}));
            }
        });

        saveJsonToFile(namespace + 'defaultRoutes.json', routes);
        saveJsonToFile(namespace + 'jsonRoutes.json', jsonRoutes);
    });
};

client.on("error", function (err) {
    console.log("Error " + err);
});

getRoutesFromRedis(options.keyNamespaces[0]);

client.quit();