"use strict";

var storage = require('./storage');
var utils = require('./utils');

exports.Settings = (function(super_){
    utils.extends(Settings, super_);
    function Settings(key, value){
        super_.apply(this, arguments);
        this._key_ = 'key';
        this.key = key;
        this.value = value;
    }
    return Settings;
})(storage.Cacheable);

exports.Category = (function(super_){
    utils.extends(Category, super_);
    function Category(id, title, source){
        super_.apply(this, arguments); 
        this.id = id;
        this.title = title;
        this.source = source;
    }
    return Category;
})(storage.Cacheable);