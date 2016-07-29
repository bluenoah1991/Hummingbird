"use strict";

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

var CacheSchema = require('./Cache');

module.exports = (function(){
    var CategorySchema = CacheSchema.extend({
        id: String,
        title: String,
        source: String
    });
    return CategorySchema;
})();