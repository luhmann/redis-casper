var utils = require('utils');
var _ = require('lodash');
var fs = require('fs');

var casper = require('casper').create({
    verbose: true,
    logLevel: 'error',
    exitOnError: false,
    pageSettings: {
        javascriptEnabled: false,
        loadImages: false,
        loadPlugins: false,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5)"
    }
});

var templates = {
    incorrectStatus: _.template('<%= url %> does not resolve to http 200. HTTP Status Code: <%= statusCode %>'),
    correctStatus: _.template('<%= url %> seems to load okay'),
    tooSmall: _.template('<%= url %> page content seems to be too small <%= content %>'),
    wrongContentType: _.template('<%= url %> The document content-type seems to not match: <%= contentType %>'),
    noBodyTag: _.template('<%= url %> The document seems to contain no body-tag')
};

var options = {
    suites: [
        {
            fileName: 'content:v1:de:de:live:defaultRoutes.json',
            isJson: false
        }//,
        //{
        //    fileName: 'content:v1:de:de:live:jsonRoutes.json',
        //    isJson: true
        //}
    ],
    inputPath: './out/',
    logPath: './logs/',
    minPageChars: 1000
};

var selectors = {
    layoutContainer: '.layout--container',
    layout: '.layout'
};

var loadFromJsonFile = function (filename) {
    return require(options.inputPath + filename);
};

var testUrl = function (response) {
    if (response.status !== 200) {
        casper.echo(templates.incorrectStatus({
            url: response.url,
            statusCode: response.status
        }), 'ERROR');
    } else {
        casper.echo(templates.correctStatus( { url: response.url} ), 'INFO');
        checkPageSize(response);

        if (casper.getHTML().match(/<body class="layout/) === null) {
            this.echo(templates.noBodyTag({url: response.url}))
        }

        if (response.contentType.indexOf('html') === -1) {
            casper.echo(templates.wrongContentType({ url: response.url, contentType: response.contentType }))
        }
    }
};

var testJsonUrl = function (response) {
    if (response.status !== 200) {
        casper.echo(templates.incorrectStatus({
            url: response.url,
            statusCode: response.status
        }), 'ERROR');
    } else {
        casper.echo(templates.correctStatus( { url: response.url} ), 'INFO');
        checkPageSize(response);

        if (response.contentType.indexOf('json') === -1) {
            casper.echo(templates.wrongContentType({ url: response.url, contentType: response.contentType }))
        }
    }
};

var checkPageSize = function (response) {
    if (_.isString(casper.getPageContent()) && casper.getPageContent().length < options.minPageChars) {
        casper.echo(templates.tooSmall({ url: response.url, content: casper.getPageContent().length }), 'ERROR');
    }
};

var testUrls = function (urls, isJson) {
    var testFunction = (!isJson) ? testUrl : testJsonUrl;
    casper.start().each(urls, function(self, link) {
        self.thenOpen(link, testFunction);
    });
};

options.suites.forEach(function (suite) {
    var urls = loadFromJsonFile(suite.fileName);

    if (null !== urls ) {
        testUrls(urls, suite.isJson);
    } else {
        casper.echo('Input File could not be loaded: ' + inputFile, 'WARNING');
    }
});



casper.run(function () {
    casper.exit();
});



