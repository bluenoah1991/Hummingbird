"use strict";

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

module.exports = (function(){
    var CacheSchema = new Schema({
        __keyfield__: String,
        __ttl__: Number
    });
    CacheSchema.methods.__key__ = function(){
        return this[this.__keyfield__];
    }
    return CacheSchema;
})();