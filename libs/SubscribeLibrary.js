"use strict";

var _ = require('underscore');
var builder = require('botbuilder');

var cards = require('../cards');
var models = require('../models');

module.exports = (function(){
    var lib = new builder.Library('subscribe');

    lib.dialog('/', function(session, args, next){
        var message = session.message.text;
        var id = session.message.user.id;
        if(message == 'Finish'){
            session.send('Thank you for your cooperation, I will provide you with the latest information on time.');
            session.endDialog();
            return;
        }
        models.Category.findOne({title: message}).then(function(doc){
            if(doc == undefined){
                var message = new builder.Message(session);
                cards.SubscribeCard(session).then(function(card){
                    message.addAttachment(card);
                    session.send(message);
                });
                return;
            }
            models.User.findOne({id: id}).then(_.partial(function(doc, category){
                if(doc == undefined){
                    return;
                }
                if(_.find(doc.subscribes, _.matcher({category: category.id}))){
                    return;
                }
                doc.subscribes.push({
                    category: category.id
                });
                return doc.save();
            }, _, doc))
            .then(function(){
                session.send(`You subscribe to the ${doc.title} news`);
            });
        })
        .catch(function(err){
            console.log(err);
        });
    });

    return lib;
}.bind(this))();
