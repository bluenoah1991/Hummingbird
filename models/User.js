"use strict";

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

module.exports = (function(){
    var UserSchema = new Schema({
        id: String,
        user: {},
        address: {}
    });
    return UserSchema;
})();