"use strict";

var builder = require('botbuilder');
var models = require('./models');

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
    var buttons = [builder.CardAction
        .openUrl(session, entry.link, 'Read')];
    var card = new builder.HeroCard(session)
        .images(images)
        .title(entry.title)
        .buttons(buttons);
    return card;
    
};