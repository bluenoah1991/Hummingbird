"use strict";

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

module.exports = (function(){
    var SubscribeSchema = new Schema({
        category: String,
        timestamp: String
    });
    return SubscribeSchema;
})();