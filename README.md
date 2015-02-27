Redis-Casper
============

This project provides a way to get the routes that are configured via redis and checks if they resolve
correctly.


## Installation

#### Get a node stack
You need a valid node stack:

> brew install nodejs

Get the latest version

> npm install -g n

> n latest


#### Install dependencies

Go to the project folder and do:

> npm install


You need casperjs and it should have been installed as `node_module` but might not find phantomjs where it expects it.
If that is the case take a look at the output of `npm install'. It should say something like

> Phantomjs binary available at /Users/jfd/Dev/redis-casper/node_modules/casperjs/node_modules/phantomjs/lib/phantom/bin/phantomjs

Add that path to your `$PATH` and you should be set

## Get the current live data and import it into your local ez

1. Go to jenkins and trigger the "DB Sync"-Job
2. Once it is done, get the sql dump file and import it into ez (complicated process, get Andreas to help you :-) )


## Run script

0. Create a directory called `out` and one called `logs` in the project folder (not sure if that is necessary)
1. Adapt the `options.host` in `test.js` to point to your redis within you development box
2. Execute `node test.js`. Two files should be created in the `out`-folder
3. Run `./node_modules/.bin/casperjs casper-test.js`
4. Wait. Be aware that there is no logging output as casper right now does not play well with node. If you need
to persist the output redirect it to a file.

## Check output

If something goes wrong, check the url in your local devbox. Beware that many failures are actually issues with the
live data. So if something sounds weird and unconnected to redis, check the live version to be sure that this
is not a false positive.

