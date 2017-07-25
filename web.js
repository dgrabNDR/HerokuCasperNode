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
function startSpooky(searchTerm, location, device){
	var searchTermURL = searchTerm.replace(/ /g,'+');
	console.log('searchTermURL: '+searchTermURL);
	console.log('location: '+location);
	console.log('device: '+device);
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


			var endpoint = 'https://www.google.com/search?q='+searchTermURL+'&ip=0.0.0.0&source_ip=0.0.0.0&ie=UTF-8&oe=UTF-8&hl=en&adtest=on&noj=1&igu=1&uule='+location+'&adsdiag=9104623049776225757';
			if(device != null && device != ''){
				endpoint += '&adtest-useragent='+device;
			}
			console.log('endpoint: '+endpoint);


			spooky.start(endpoint, function(){
				console.log('spooky started');
			});
			
			spooky.waitForSelector('.ads-ad', function(){
				function getAds(selector){
					var links = document.querySelectorAll(selector);
					return Array.prototype.map.call(links, function(e) {
						return e.getAttribute('class');
					});
				};
				
				if(this.exists('.ads-ad')) {
					console.log('.ads-ad found');
					try{
						var theAds = this.evaluate(function(){
							return document.querySelectorAll('.ads-ad');
						});
						console.log('getAds success');
						console.log('theAds: '+theAds);						
					} catch (e) {
						console.log('getAds failed');
					}
					console.log('done with .ads-ad');
				} else {
					console.log('.ads-ad NOT found');
				}
			}, function(){
				console.log('timed out looking for .ads-ad')
			}, 30000);	
			
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
		//console.log(line);
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

function getLinks() {
    
}

app.use(express.logger());
app.use( bodyParser.json() );
app.use(express.json());
app.post('/', function(request, response) {
    console.log('app.post');
    startSpooky(request.body.searchterm, request.body.location, request.body.device);
    //response.send(gGreeting);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
