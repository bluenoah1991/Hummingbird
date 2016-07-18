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

bot.dialog('/', [function (session, args, next) {
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
