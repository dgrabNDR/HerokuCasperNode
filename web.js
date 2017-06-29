#!/usr/bin/env node

var express = require("express");
var app = express();
var Spooky = require('spooky');
var bodyParser = require('body-parser')
var $j = require('jquery')

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
					console.log('iframe: '+$j('.aw-diagnostic-preview-iframe-v2').size());
					var iframe = document.querySelector('.aw-diagnostic-preview-iframe-v2');
					var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
					var links = iframeDocument.querySelectorAll('li.ads-ad');
					console.log(links.length);
					for (var index = 0; index < links.length; index++) {
						console.log(links[index]);
					}
					/*if (this.exists('li.ads-ad')) {
						console.log('li.ads-ad exists');
						var links = document.querySelectorAll('li.ads-ad');
						console.log(links.length);
						
						for (var index = 0; index < links.length; index++) {
							console.log(links[index]);
						}
						
						links.forEach( 
						  function(value, key, listObj) { 
							console.log(value + ' ' + key + "/" + this); 
						  },
						  "myThisArg"
						);
					} else {
						console.log('li.ads-ad not found');
					}*/
					//links = document.querySelctorAll('._WGk');
					//console.log('._WGk');
					//for (var index = 0; index < links.length; index++) {
					//	console.log(links[index]);
					//}
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
    console.log('app.post');
	console.log('searchterm: '+request.body.searchterm);
    startSpooky(request.body.searchterm);
    //response.send(gGreeting);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
