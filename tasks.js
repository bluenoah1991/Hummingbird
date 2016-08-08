"use strict";

var builder = require('botbuilder');
var Q = require('q');
var _ = require('underscore');

var Resource = require('./resource');
var Conversation = require('./conversation');
var models = require('./models');
var cards = require('./cards');

exports.IsolatedTask = (function(){
    function IsolatedTask(u, session){
        this.user = this.getUser(u);
        this.session = session;
    }

    IsolatedTask.prototype.getUser = function(u){
        if(_.isObject(this.u)){
            return Q.fcall(function(){
                return u;
            });
        } else {
            return models.User.findOne({id: u})
                .then(function(doc){
                    return doc;
                });
        }
    };

    IsolatedTask.prototype.start = function(){
        this.user.then(function(user){
            console.log(`${user.user.name}'s Isolated task start runing (${new Date().toString()})`);
            if(user.subscribes == undefined ||
                user.subscribes.length == 0){
                return;
            }
            var index = _.random(user.subscribes.length - 1);
            var subscribe = user.subscribes[index];
            Resource.recent(subscribe.category)
                .then(function(result){
                    result.entries.each(function(entry){
                        console.log(`Send message '${entry.title}' to user '${user.user.name}'`);
                        this.session.send(`${entry.title} ${entry.link}`);
                    }.bind(this));
                    this.session.beginDialog('hedwig:/', true);
                }.bind(this)).done();
        }.bind(this));
    };

    return IsolatedTask;
})();

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
        console.log(`Check user '${doc.user.name}' (${new Date().toString()})`);
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
                console.log(`Send message '${entry.title}' to user '${this.user.user.name}'`);
                this.sendMessage(_.partial(function(session, entry){
                    session.send(`${entry.title} ${entry.link}`);
                }, _, entry));// TODO complex message
            }.bind(this))
            .max('timestamp').value();
            if(_.isObject(lastEntry)){
                subscribe.timestamp = lastEntry.timestamp;
                subscribe.parent().save().then(function(doc){
                    console.log(`Update subscription time stamp that user '${doc.user.name}'`);
                });
            }
        }.bind(new Conversation(doc, this.bot, this.connector)));
    };

    return LoopTask;
})();


