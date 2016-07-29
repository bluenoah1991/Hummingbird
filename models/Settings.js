"use strict";

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

var CacheSchema = require('./Cache');

module.exports = (function(){
    var SettingsSchema = CacheSchema.extend({
        id: String,
        value: String
    });
    return SettingsSchema;
})();