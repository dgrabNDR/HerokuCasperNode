#!/usr/bin/env node

var express = require("express");
var app = express();
var Spooky = require('spooky');
var bodyParser = require('body-parser')

// adoped from Heroku's [Getting Started][] and [Spooky][]'s sample
// [Getting Started]: https://devcenter.heroku.com/articles/getting-started-with-nodejs
// [Spooky]: https://github.com/WaterfallEngineering/SpookyJS

var spooky;
var gGreeting;
function startSpooky(searchTerm){
	var searchTermURL = JSON.stringify(searchTerm).replace(/ /g,'+');
	console.log('searchTermURL: '+searchTermURL);
	spooky = new Spooky({
			child: {
				transport: 'http'
			},
			casper: {
				logLevel: 'debug',
				verbose: true
			}
		}, function (err) {
			if (err) {
				e = new Error('Failed to initialize SpookyJS');
				e.details = err;
				throw e;
			}
			console.log('start');
			spooky.start('https://adwords.google.com/apt/anon/AdPreview?aptenv_v2=ZG9tYWluPXd3dy5nb29nbGUuY29tLGxhbmc9ZW4sbG9jPTEwMjMxOTF8VVMscGxhdD1ERVNLVE9Q&st='+searchTermURL+'&run=true',function(){
				if (this.exists('.aw-diagnostic-preview-iframe-v2')) {
					console.log('iframe exists');
				} else {
					console.log('iframe not found');
				}
			});
			spooky.run();
		});

	spooky.on('error', function (e, stack) {
		console.log('error');
		console.error(e);

		if (stack) {
			console.log(stack);
		}
	});

	
	// Uncomment this block to see all of the things Casper has to say.
	// There are a lot.
	// He has opinions.
	spooky.on('console', function (line) {
		console.log(line);
	});
	
	gGreeting = 'Hello World';

	spooky.on('hello', function (greeting) {
		console.log('>>>>>>>>>>>>>>>> IT WORKS! <<<<<<<<<<<<<<<<');
		console.log(greeting);
		gGreeting = greeting;
	});

	spooky.on('log', function (log) {
		if (log.space === 'remote') {
			console.log(log.message.replace(/ \- .*/, ''));
		}
	});
}

app.use(express.logger());
app.use( bodyParser.json() );
app.use(express.json());
app.post('/', function(request, response) {
    console.log('get');
	console.log('body: '+request.body);
	console.log('searchterm: '+request.body.searchterm);
    startSpooky(request.body.searchterm);
    response.send(gGreeting);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
