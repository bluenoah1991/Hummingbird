"use strict";

var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');

var libs = require('./libs');

// Init Database

var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected!');

    // Seeds

    var seeds = require('./seeds');
    seeds();
});

mongoose.connect('mongodb://localhost:27017/instflow');

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

//bot.library(libs.SubscribeLibrary);
bot.library(libs.HedwigLibrary);

bot.dialog('/', function(session){
    session.beginDialog('hedwig:/root');
});

bot.on('contactRelationUpdate', function(event){
    bot.beginDialog(event.address, 'hedwig:/welcome');
});