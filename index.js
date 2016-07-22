var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer({
    certificate: fs.readFileSync('cert/instflow.org.crt'),
    key: fs.readFileSync('cert/instflow.org.key')
});
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/profile', [function(session){
    builder.Prompts.text(session, 'Hi! What is your name?');
},
function(session, results){
    session.userData.name = results.response;
    session.endDialog();
}]);

bot.dialog('/gender', [function(session){
    builder.Prompts.choice(session, 'What is your gender?', ['male', 'female']);
},
function(session, results){
    session.userData.gender = results.response;
    session.endDialog();
}]);

bot.dialog('/age', [function(session){
    builder.Prompts.number(session, 'How old are you?');
},
function(session, results){
    session.userData.age = results.response;
    session.endDialog();
}]);

bot.dialog('/push', function(session){
    session.send('You have a message!');
});

bot.dialog('/', function(session){
    if(session.message != undefined && session.message.address != undefined){
        var address = session.message.address;
        setTimeout(function(){
            connector.startConversation(address, function(err, address){
                bot.beginDialog(address, '/push');
                //var message = new builder.Message(session);
                //message.address = address;
                //message.text('You have a new message');
                //bot.send(message);
            })
        }, 10000);
    }
    var message = new builder.Message(session);
    var heroCard = new builder.HeroCard(session);
    heroCard.title('Main title');
    heroCard.subtitle('Sub title');
    heroCard.text('This is a piece of text');
    var cardImage = new builder.CardImage.create(session, 'https://github.com/codemeow5/Scripts/raw/master/avatar.jpg');
    heroCard.images([cardImage]);
    var cardAction = new builder.CardAction.openUrl(session, 'http://www.baidu.com', 'Open Baidu');
    heroCard.buttons([cardAction]);
    message.addAttachment(heroCard.toAttachment());
    session.send(message);
});

bot.dialog('/temp', [function (session, args, next) {
    if(!session.userData.name){
        session.beginDialog('/profile');
    } else {
        next();
    }
},
function(session, results, next) {
    if(!session.userData.gender){
        session.beginDialog('/gender');
    } else {
        next();
    }
},
function(session, results, next) {
    if(!session.userData.age){
        session.beginDialog('/age');
    } else {
        next();
    }
},
function(session, results){
    session.send('Hello %s!', session.userData.name);
}]);
