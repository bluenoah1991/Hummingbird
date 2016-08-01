"use strict";

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

var SubscribeSchema = require('./Subscribe');

module.exports = (function(){
    var UserSchema = new Schema({
        id: String,
        name: String,
        user: Schema.Types.Mixed,
        address: Schema.Types.Mixed,
        subscribes: [SubscribeSchema]
    });
    return UserSchema;
})();