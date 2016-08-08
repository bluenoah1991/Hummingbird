"use strict";

var builder = require('botbuilder');
var moment = require('moment');

var Profile = require('../profile');
var utils = require('../utils');
var cards = require('../cards');
var models = require('../models');
var tasks = require('../tasks');

var SubscribeLibrary = require('./SubscribeLibrary');
var ProactiveLibrary = require('./ProactiveLibrary');

module.exports = (function(){
    var lib = new builder.Library('hedwig');

    lib.library(SubscribeLibrary);
    lib.library(ProactiveLibrary);

    lib.dialog('/welcome', function(session, args, next){
        var message = new builder.Message(session);
        var link = utils.build_absolute_url('/static/images/', 'greeting.jpg');
        var image = {
            'contentType': 'image/jpeg',
            'contentUrl': link
        };
        message.addAttachment(image);
        message.text([
            'Hi there, I am Hedwig. I will deliver to you with the Latest News & Topics.'
        ]);
        message.addAttachment(cards.EntryCard(session));
        session.send(message);
    });

    lib.dialog('/feedback', [function(session, args, next){
        builder.Prompts.text(session, 'Your feedback:');
    },
    function(session, results){
        var name = session.message.user.name;
        var content = results.response;
        new models.Feedback({name: name, content: content}).save()
            .then(function(doc){
                session.send('Thank you for your feedback. :)');
                session.endDialog();
            })
            .catch(function(err){
                console.log(err);
                session.endDialog();
            });
    }]);

    lib.dialog('/delete', function(session, args, next){
        for(var m in session.userData){
            delete session.userData[m];
        }
        Profile.delete(session.message.user.id)
            .then(function(){
                console.log(`Delete user ${session.message.user.name}`);
            });
    });

    lib.dialog('/', function(session){
        var id = session.message.user.id;

        // Hack
        if(session.message.text == 'delete'){
            for(var m in session.userData){
                delete session.userData[m];
            }
            Profile.delete(id)
                .then(function(){
                    session.send('Delete success!');
                });
            return;
        }

        if(session.userData.processing != undefined){
            var now = moment();
            var processTime = moment(session.userData.processing);
            var duration = moment.duration(now - processTime);
            if(duration.asMinutes() < 3){
                return;
            }
        }

        session.userData.processing = moment().valueOf();

        Profile.login(session).then(function(doc){
            return Profile.isNew(id);
        })
        .then(function(result){
            session.userData.processing = null; // issue Put in the end
            if(result){
                session.beginDialog('subscribe:/');
            } else {
                switch(session.message.text){
                    case 'Latest News':
                        var task = new tasks.IsolatedTask(session.message.user.id, session);
                        task.start();
                        break;
                    case 'Cancel my subscription':
                        for(var m in session.userData){
                            delete session.userData[m];
                        }
                        Profile.delete(id)
                            .then(function(){
                                session.send('You have cancelled your subscription successfully.');
                            });
                        break;
                    case 'Feedback':
                        session.beginDialog('/feedback');
                        break;
                    default:
                        var message = new builder.Message(session);
                        message.addAttachment(cards.MenuCard(session));
                        session.send(message);
                        break;
                }
            }
        })
        .catch(function(err){
            console.log(err);
            session.userData.processing = null;
        });
    });

    return lib;
}.bind(this))();