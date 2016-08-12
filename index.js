"use strict";

var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');

var config = require('./config');
var libs = require('./libs');
var tasks = require('./tasks');
var Scheduler = require('./scheduler');
var middleware = require('./middleware');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer({
    certificate: fs.readFileSync('cert/instflow.org.crt'),
    key: fs.readFileSync('cert/instflow.org.key')
});
server.listen(config.PORT, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

// Support gzip
server.use(restify.gzipResponse());

// Set queryParser
server.use(restify.queryParser());

// Set timeout
server.use(function (req, res, next) {
    req.connection.setTimeout(600 * 1000);
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

// Serve static images
server.get(/\/static\/images\/?.*/, restify.serveStatic({
    directory: '../InstFlow', // TODO Issue on windows platform
    default: 'default.jpg'
}));

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

bot.use(middleware.CarnivalMiddleware);

//bot.library(libs.SubscribeLibrary);
bot.library(libs.HedwigLibrary);

bot.dialog('/', function(session){
    session.beginDialog('hedwig:/');
});

bot.on('contactRelationUpdate', function(event){
    switch(event.action){
        case 'add':
            bot.beginDialog(event.address, 'hedwig:/welcome');
            break;
        case 'remove':
            bot.beginDialog(event.address, 'hedwig:/delete');
            break;
    }
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
            if(config.LOOP_TASK_BOOT_EXEC){
                callback();
            }
            scheduler.loop(2, callback);
        });

}.bind(db));

mongoose.connect(config.MONGOCONNECT);
