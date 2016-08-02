"use strict";

var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');

var libs = require('./libs');
var tasks = require('./tasks');
var Scheduler = require('./scheduler');

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

// Set queryParser
server.use(restify.queryParser());

// Set timeout
server.use(function (req, res, next) {
    req.connection.setTimeout(600 * 1000);
    res.connection.setTimeout(600 * 1000);
    next();
});

// Redirect service
server.get('/r', function(req, res, next){
    if('u' in req.query){
        res.redirect(req.query.u, next);
    } else {
        res.redirect('https://www.instflow.org', next);
    }
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

// Bootstrap

var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

var db = mongoose.connection;
var scheduler = new Scheduler();
var task = new tasks.LoopTask(bot, connector);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Successfully connected to Mongodb!');

    // Seeds

    var Seeds = require('./seeds');
    Seeds.fillWithDropDb(this.db)
        .then(function(){
            // background loop

            var callback = task.start.bind(task);
            scheduler.loop(2, callback);
        });

}.bind(db));

mongoose.connect('mongodb://localhost:27017/instflow');
