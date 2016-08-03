"use strict";

var builder = require('botbuilder');
var Q = require('q');
var _ = require('underscore');

var Resource = require('./resource');
var Conversation = require('./conversation');
var models = require('./models');
var cards = require('./cards');

exports.LoopTask = (function(){
    function LoopTask(bot, connector){
        this.bot = bot;
        this.connector = connector;
    }

    LoopTask.prototype.start = function(){
        console.log(`Loop task start running (${new Date().toString()})`);
        this.feedsMap().then(function(feedsMap){
            var cursor = models.User.find({}).cursor();
            cursor.on('data', _.bind(_.partial(this.next, feedsMap), this));
            cursor.on('end', function(){
                console.log(`Check finished (${new Date().toString()})`);
            });
        }.bind(this));
    };

    LoopTask.prototype.feedsMap = function(){
        return Resource.all().then(function(feeds){
            return _.chain(feeds)
                .map(function(feed){
                    return [feed.category.id, feed.entries];
                })
                .object().value();
        });
    };

    LoopTask.prototype.next = function(feedsMap, doc){
        if(doc == undefined){
            return;
        }
        console.log(`Check user '${doc.name}' (${new Date().toString()})`);
        _.each(doc.subscribes, function(subscribe){
            var entries = feedsMap[subscribe.category];
            if(entries == undefined){
                return;
            }
            var timestamp = subscribe.timestamp;
            if(timestamp == undefined){
                timestamp = 0;
            } else {
                timestamp = parseInt(subscribe.timestamp);
            }
            var lastEntry = entries.filter(function(entry){
                return entry.timestamp > timestamp;
            }).each(function(entry){
                console.log(`Send message '${entry.title}' to user '${this.user.name}'`);
                this.sendMessageUseCallback(function(session){
                    var message = new builder.Message(session);
                    var card = cards.NewsCard(session, this);
                    message.addAttachment(card.toAttachment());
    	            return message;
                }.bind(entry));// TODO complex message
            }.bind(this))
            .max('timestamp').value();
            if(_.isObject(lastEntry)){
                subscribe.timestamp = lastEntry.timestamp;
                subscribe.parent().save().then(function(doc){
                    console.log(`Update subscription time stamp that user '${doc.name}'`);
                });
            }
        }.bind(new Conversation(doc, this.bot, this.connector)));
    };

    return LoopTask;
})();


