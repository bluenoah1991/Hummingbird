"use strict";

var builder = require('botbuilder');
var _ = require('underscore');
var models = require('./models');
var utils = require('./utils');

exports.EntryCard = function(session){

    var button = builder.CardAction.imBack(
        session, 'YES', 'YES');
    return new builder.HeroCard(session)
        .text('Ready to use?')
        .buttons([button]);

};

exports.SubscribeCard = function(session){

    return models.Category.find({})
        .then(function(docs){

            var buttons = _.chain(docs)
                .map(function(doc){
                    return builder.CardAction.imBack(session, doc.title, doc.title);
                }).value();
            buttons.push(builder.CardAction.imBack(session, 'Finish', 'Finish'));

            var cardGroup = _.chain(buttons)
                .groupBy(function(doc, index){
                    return Math.floor(index / 6);
                })
                .toArray()
                .map(function(buttonGroup, index){
                    var card = new builder.HeroCard(session);
                    if(index == 0){
                        card.title(`Hi, ${session.userData.profile.user.name}. Please choose your interests:`);
                    }
                    return card.buttons(buttonGroup);
                }).value();

            return cardGroup;
        });

};

exports.MenuCard = function(session){

    var buttons = [
        builder.CardAction.imBack(session, 'Latest News', 'Latest News'),
        builder.CardAction.imBack(session, 'Feedback', 'Feedback'),
        builder.CardAction.imBack(session, 'Cancel my subscription', 'Cancel my subscription')
    ];
    return new builder.HeroCard(session)
        .text(`Do you need anything else?`)
        .buttons(buttons);

};
