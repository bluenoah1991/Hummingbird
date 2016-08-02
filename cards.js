"use strict";

var builder = require('botbuilder');
var models = require('./models');
var utils = require('./utils');

exports.SubscribeCard = function(session){

    return models.Category.find({})
        .then(function(docs){
            var buttons = [];
            for(var index in docs){
                buttons.push(builder.CardAction.dialogAction(
                    session, 'new', docs[index].id, docs[index].title));
            }
            buttons.push(builder.CardAction.dialogAction(session, 'finish', null, 'Finish'));
            var card = new builder.HeroCard(session)
                .title(`Hi, ${session.userData.profile.name}. Please tell me about your interest:`)
                .buttons(buttons);
            return card;
        });

};

exports.NewsCard = function(session, entry){

    var images = [new builder.CardImage(session)
        .url(entry.thumbnail)];
    var action = builder.CardAction
        .openUrl(session, utils.build_redirect_url(entry.link), 'Open');
    var card = new builder.HeroCard(session)
        .images(images)
        .title(entry.title)
        .buttons([action])
        .tap(action);
    return card;

};