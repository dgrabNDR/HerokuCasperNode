#!/usr/bin/env node

var express = require("express");
var app = express();
var Spooky = require('spooky');
var bodyParser = require('body-parser');
var jQuery = require('jquery');
//var nforce = require('nforce');

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
	var endpoint = 'https://www.google.com/search?q='+searchTermURL+'&ip=0.0.0.0&source_ip=0.0.0.0&ie=UTF-8&oe=UTF-8&hl=en&adtest=on&noj=1&igu=1&adsdiag=9104623049776225757&uule='+location;
	if(device != null && device != ''){
		endpoint += '&adtest-useragent='+device;
	}
	console.log('endpoint: '+endpoint);
	
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

			spooky.start(endpoint, function(){
				console.log('spooky started');
				this.waitForSelector('.ads-ad');
			});		
			
			spooky.then(function(){
				console.log('spooky.then() started');
				var selector = '.ads-visurl > cite';
				function getAds(){
					var ads = document.querySelectorAll('.ads-visurl > cite');
					return Array.prototype.map.call(ads, function(e) {
						return e.innerHTML;
					});
				};
				
				if(this.exists(selector)) {
					console.log(selector+' found');
					try{
						var theAds = this.evaluate(getAds);
						console.log('getAds success');
						console.log('theAds: '+theAds);
						if(theAds != null){
							/*
							var org = nforce.createConnection({
							  clientId: '3MVG9yZ.WNe6byQBrEHW_cRm._dp_BF.2h1xhv1.qUNdo9mllhb6wLTwiF1e5vhIH1eu9Ojvl0UiD6Y62FGr6',
							  clientSecret: '7740176649279426585',
							  redirectUri: 'http://localhost:3000/oauth/_callback',
							  apiVersion: 'v34.0',  // optional, defaults to current salesforce API version
							  environment: 'sandbox',  // optional, salesforce 'sandbox' or 'production', production default
							  mode: 'multi' // optional, 'single' or 'multi' user mode, multi default
							});
							var oauth;
							org.authenticate({ username: 'll_api@ndr.com.spring17', password: 'fdjk3@#dfzOI3213cOzvWMHCKZQi0mddhJ6YWFu'}, function(err, resp){
							  // store the oauth object for this user
							  if(!err) oauth = resp;
							});
							console.log('oauth: '+oauth);
							*/
						}
					} catch (e) {
						console.log('getAds failed');
					}
					console.log('done with '+selector);
				} else {
					console.log(selector+' NOT found');
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
    startSpooky(request.body.searchterm, request.body.location, request.body.device);
    //response.send(gGreeting);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
