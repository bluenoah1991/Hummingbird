"use strict";

var _ = require('underscore');

var builder = require('botbuilder');
var url = require('url');
var querystring = require('querystring');
var utils = require('./utils');
var cards = require('./cards');
var models = require('./models');

// define all dialogs

exports.ProactiveLibrary = (function(){
    var lib = new builder.Library('proactive');
    lib.dialog('/send', new builder.SimpleDialog(function(session, message){
        session.send(message);
        session.sendBatch();
    }));
    lib.dialog('/sendUseCallback', new builder.SimpleDialog(function(session, callback){
        session.send(callback(session));
        session.sendBatch();
    }));
    return lib;
}.bind(this))();

exports.ProfileLibrary = (function(){
    var lib = new builder.Library('profile');
    lib.dialog('/root', new builder.SimpleDialog(function(session){
        var id = session.message.user.id;
        models.User.findOne({id: id})
            .then(function(doc){
                if(!doc){
                    return models.User.create({
                        id: id, 
                        user: session.message.user, 
                        address: session.message.address});
                } else {
                    return doc;
                }
            })
            .then(function(doc){
                session.userData.profile = doc;
                session.endDialogWithResult({
                    resumed: builder.ResumeReason.completed, 
                    response: doc, 
                    childId: session.curDialog().id 
                });
            });
    }));
    lib.dialog('/check', new builder.SimpleDialog(function(session){
        var id = session.message.user.id;
        models.User.findOne({id: id})
            .then(function(doc){
                // TODO check subscribe state
                session.endDialogWithResult({ 
                    resumed: builder.ResumeReason.completed, 
                    response: !!doc, 
                    childId: session.curDialog().id 
                });
            });
    }));
    lib.dialog('/delete', new builder.SimpleDialog(function(session){
        var id = session.message.user.id;
        // TODO delete relation data
        models.User.remove({id: id}).exec()
            .then(function(){
                session.endDialogWithResult({ 
                    resumed: builder.ResumeReason.completed, 
                    response: true, 
                    childId: session.curDialog().id 
                });
            });
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
            cards.SubscribeCard(session).then(function(card){
                message.addAttachment(card);
                session.send(message);
            });
        } else {
            for(var action in qs){
                if(action == 'new'){
                    var name = qs[action];
                    // TODO save subscribe
                    models.Category.findOne({id: name})
                        .then(function(doc){
                            if(!doc || !doc.value){
                                var id = session.message.user.id;
                                models.User.findOne({id: id})
                                    .then(function(doc){
                                        if(doc != undefined && !_.find(doc.subscribes, _.matcher({category: name}))){
                                            doc.subscribes.push({
                                                category: name
                                            });
                                            return doc.save();
                                        }
                                    })
                                    .then(function(){
                                        var message = new builder.Message(session);
                                        message.text(`You subscribe to the ${doc.title} news`);
                                        session.send(message);
                                    });
                            }
                        });
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
    lib.library(this.ProfileLibrary);
    lib.library(this.ProactiveLibrary);
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
    lib.dialog('/askName', [function(session){
        builder.Prompts.text(session, 'Could I have your name please?');
    }, 
    function(session, results){
        session.userData.profile.name = results.response;
        models.User.update({id: session.userData.profile.id}, {name: results.response}).exec()
            .then(function(raw){
                session.endDialog();
            });
    }]);
    lib.dialog('/profile', [function(session){
        session.beginDialog('profile:/root');
    },
    function(session, results, next){
        //session.userData.profile = results.response;
        if(session.userData.profile.name == undefined ||
            session.userData.profile.name.length == 0){
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
    lib.dialog('/root', [function(session){
        // Hack
        if(session.message.text == 'd'){
            for(var m in session.userData){
                delete session.userData[m];
            }
            session.send('Delete success!');
            return;
        }
        if(session.message.text == 'dd'){
            var id = session.message.user.id;
            models.User.remove({id: id}).exec()
                .then(function(){
                    session.send('Delete database success!');
                });
            return;
        }
        session.beginDialog('profile:/check');
    },
    function(session, results){      
        if(results.response){
            session.send(`Hi, ${session.userData.profile.name}. I will provide you with the latest information on time :)`);
        } else {
            session.send('Welcome to Owl Push Service :)');
            session.send('I am Hedwig. First of all, I need you to provide some information in order to serve you better.');
            session.beginDialog('/profile');
        }
    }]);
    return lib;
}.bind(this))();