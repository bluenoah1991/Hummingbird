"use strict";

var builder = require('botbuilder');

exports.SubscribeCard = function(session){
    var buttons = [];
    for(var name in category){
        buttons.push(new builder.CardAction.dialogAction(
            session, 'new', name, category[name].title));
    }
    buttons.push(new builder.CardAction.dialogAction(session, 'finish', null, 'Finish'));
    var card = new builder.HeroCard(session)
        .title(`Hi, ${session.userData.name}. Please tell me about your interest:`)
        .buttons(buttons);
    return card;
};