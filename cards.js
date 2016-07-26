"use strict";

var builder = require('botbuilder');
var category = require('./category');

exports.SubscribeCard = function(session){
    var title = 'Choose the options you are interested in:';
    // TODO check the user has at least one subscription
    if(true){
        title = 'For the first time, please choose at least one category:';
    }
    var buttons = [];
    for(var name in category){
        buttons.push(new builder.CardAction.dialogAction(
            session, 'new', name, category[name].title));
    }
    buttons.push(new builder.CardAction.dialogAction(session, 'finish', null, 'Finish'));
    var card = new builder.HeroCard(session)
        .title(title)
        .buttons(buttons);
    return card;
};