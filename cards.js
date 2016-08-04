"use strict";

var builder = require('botbuilder');
var models = require('./models');
var utils = require('./utils');

exports.EntryCard = function(session){

    var button = builder.CardAction.imBack(
        session, 'OK', 'OK');
    return new builder.HeroCard(session)
        .text('Ready to use?')
        .buttons([button]);

};

exports.SubscribeCard = function(session){

    return models.Category.find({})
        .then(function(docs){
            var buttons = [];
            for(var index in docs){
                buttons.push(builder.CardAction.imBack(
                    session, docs[index].title, docs[index].title));
            }
            buttons.push(builder.CardAction.imBack(session, 'Finish', 'Finish'));
            var card = new builder.HeroCard(session)
                .title(`Hi, ${session.userData.profile.user.name}. Please tell me about your interest:`)
                .buttons(buttons);
            return card;
        });

};

