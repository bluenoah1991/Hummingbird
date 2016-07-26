"use strict";

var builder = require('botbuilder');
var url = require('url');
var querystring = require('querystring');
var utils = require('./utils');
var cards = require('./cards');
var category = require('./category');

// define all dialogs

exports.ProactiveLibrary = (function(){
    var lib = new builder.Library('proactive');
    lib.dialog('/send', new builder.SimpleDialog(function(session, message){
        session.send(message);
    }));
    return lib;
}.bind(this))();

exports.SubscribeLibrary = (function(){
    var lib = new builder.Library('subscribe');
    lib.dialog('/root', function(session, args, next){
        var u = url.parse(session.message.text);
        var qs = querystring.parse(u.query);
        if(u.pathname != 'action'){
            var message = new builder.Message(session);
            message.addAttachment(new cards.SubscribeCard(session));
            session.send(message);
        } else {
            for(var action in qs){
                if(action == 'new'){
                    var name = qs[action];
                    // TODO save subscribe
                    var message = new builder.Message(session);
                    message.text(`You subscribe to the ${category[name].title} news`);
                    session.send(message);
                } else if(action == 'finish'){
                    session.endDialog();
                }
            }
        }
    });
    return lib;
}.bind(this))();

exports.HedwigLibrary = (function(){
    var lib = new builder.Library('hedwig');
    lib.library(this.SubscribeLibrary);
    lib.dialog('/welcome', function(session, args, next){
        var message = new builder.Message(session);
        var thumbnail = {
            'contentType': 'image/jpeg',
            'contentUrl': 'https://github.com/codemeow5/InstFlow/raw/master/hedwig.jpg'
        };
        message.addAttachment(thumbnail);
        message.text([
            'Hi there, I am Hedwig. I will provide you with the most up-to-date information.'
        ]);
        session.send(message);
        session.endDialog();
    });
    lib.dialog('/askName', [function(session, args, next){
        builder.Prompts.text(session, 'Could I have your name please?');
    }, 
    function(session, results){
        session.userData.name = results.response;
        session.endDialog();
    }]);
    lib.dialog('/profile', [function(session, args, next){
        if(session.userData.name == undefined ||
            session.userData.name.length == 0){
            session.beginDialog('/askName');
        } else {
            next();
        }
    },
    function(session, results, next){
        session.beginDialog('subscribe:/root');
    },
    function(session, results, next){
        session.send('Thank you for your cooperation, I will provide you with the latest information on time.');
        session.endDialog();
    }]);
    lib.dialog('/root', function(session){
        // Hack
        if(session.message.text == 'delete'){
            for(var m in session.userData){
                delete session.userData[m];
            }
            session.send('Delete success!');
            return;
        }
        // TODO check whether user is first log in
        if(utils.checkFirstLogin(session.userData)){
            session.send('Welcome to Owl Push Service :)');
            session.send('I am Hedwig. First of all, I need you to provide some information in order to better serve you.');
            session.beginDialog('/profile');
        } else {
            session.send('I will provide you with the latest information on time :)');
        }
    });
    return lib;
}.bind(this))();