"use strict";

var builder = require('botbuilder');

module.exports = (function(){
    var lib = new builder.Library('proactive');

    lib.dialog('/send', new builder.SimpleDialog(function(session, callback){
        callback(session);
        session.sendBatch();
    }));
    
    return lib;
}.bind(this))();

