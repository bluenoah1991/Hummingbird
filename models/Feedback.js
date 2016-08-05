"use strict";

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

module.exports = (function(){
    var FeedbackSchema = new Schema({
        name: String,
        content: String,
    });
    return FeedbackSchema;
})();