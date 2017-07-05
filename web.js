#!/usr/bin/env node

var express = require("express");
var app = express();
var Spooky = require('spooky');
var bodyParser = require('body-parser')
var jQuery = require('jquery')

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
			//$ = jQuery.noConflict();
			spooky.start('https://adwords.google.com/apt/anon/AdPreview?aptenv_v2=ZG9tYWluPXd3dy5nb29nbGUuY29tLGxhbmc9ZW4sbG9jPTEwMjMxOTF8VVMscGxhdD1ERVNLVE9Q&st='+searchTermURL+'&run=true',function(){				
				console.log('Spooky started');
					
			});
			
			spooky.waitForSelector('.aw-diagnostic-preview-iframe-v2', function(){
				console.log('iframe found');
				if (this.exists('.aw-diagnostic-preview-iframe-v2')) {
					console.log('.aw-diagnostic-preview-iframe-v2 exists!');
					var iFrameName = this.getElementsAttribute('.aw-diagnostic-preview-iframe-v2','name');
					console.log('iFrameName: '+iFrameName);
					
					var FrameURL = this.withFrame(iFrameName, function(){
						console.log('here');
						this.test.assertVisible('#searchform')
						return this.src;
					});
					console.log('FrameURL: '+FrameURL);
					/*
					var iFrameClass = this.getElementsAttribute('.aw-diagnostic-preview-iframe-v2','class');
					console.log('iFrameClass: '+iFrameClass);
					
					var iFrameSrc = this.evaluate(function(){
						var theQuery = document.querySelector('.aw-diagnostic-preview-iframe-v2');
						return theQuery.src;
					});
					console.log('iFrameSrc: '+JSON.stringify(iFrameSrc));

					var adClasses = this.evaluate(function(){
						var theQuery = document.querySelector('.aw-diagnostic-preview-iframe-v2');
						//var theIframe = theQuery.contentDocument.body.innerHTML || theQuery.contentWindow.document.body.innerHTML;
						//var classes = theIframe.querySelectorAll('li');
						//return classes;
						return $(theQuery)
					});
					console.log('adClasses: '+JSON.stringify(adClasses));
					for (var cls in adClasses){
						console.log(cls);
					}
					*/
					
				} else {
					console.log('doesnt exist');
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
