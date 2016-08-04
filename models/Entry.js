"use strict";

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

module.exports = (function(){
    var EntrySchema = new Schema({
        title: String,
        description: String,
        link: String,
        timestamp: String,
        thumbnail: String,
        thumbnailWidth: Number,
        thumbnailHeight: Number
    });
    return EntrySchema;
})();