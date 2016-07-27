"use strict";

// cache proxy
var Q = require('q');

var node_cache = require('node-cache');

exports.Cache = (function(){
    var instance;

    return {
        getInstance: function(){
            if(!instance){
                instance = new node_cache();
            }
            return instance;
        },
        flush: function(){
            if(!!instance){
                instance.flushAll();
                instance = null;
            }
        },
        close: function(){
            if(!!instance){
                instance.close();
                instance = null;
            }
        }
    };
}.bind(this))();

exports.set = (function(){
    function set(key, val, ttl){
        var deferred = Q.defer();
        this.Cache.getInstance().set(key, val, ttl, function(err, success){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(success);
            }
        });
        return deferred.promise;
    }
    return set;
}.bind(this))();

exports.get = (function(){
    function get(key){
        var deferred = Q.defer();
        this.Cache.getInstance().get(key, function(err, value){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(value);
            }
        });
        return deferred.promise;
    }
    return get;
}.bind(this))();

exports.mget = (function(){
    function mget(keys){
        var deferred = Q.defer();
        this.Cache.getInstance().mget(keys, function(err, value){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(value);
            }
        });
        return deferred.promise;
    }
    return mget;
}.bind(this))();

exports.del = (function(){
    function del(key){
        var deferred = Q.defer();
        this.Cache.getInstance().del(key, function(err, count){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(count);
            }
        });
        return deferred.promise;
    }
    return del;
}.bind(this))();

exports.ttl = (function(){
    function ttl(key, ttl){
        var deferred = Q.defer();
        this.Cache.getInstance().ttl(key, ttl, function(err, changed){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(changed);
            }
        });
        return deferred.promise;
    }
    return ttl;
}.bind(this))();

exports.getTtl = (function(){
    function getTtl(key){
        var deferred = Q.defer();
        this.Cache.getInstance().getTtl(key, function(err, ts){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(ts);
            }
        });
        return deferred.promise;
    }
    return getTtl;
}.bind(this))();

exports.keys = (function(){
    function keys(){
        var deferred = Q.defer();
        this.Cache.getInstance().keys(function(err, keys){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(keys);
            }
        });
        return deferred.promise;
    }
    return keys;
}.bind(this))();

exports.onSet = (function(){
    function onSet(callback){// callback args : key, value
        this.Cache.getInstance().on('set', callback);
    }
    return onSet;
}.bind(this))();

exports.onDel = (function(){
    function onDel(callback){
        this.Cache.getInstance().on('del', callback);
    }
    return onDel;
}.bind(this))();

exports.onExpired = (function(){
    function onExpired(callback){
        this.Cache.getInstance().on('expired', callback);
    }
    return onExpired;
}.bind(this))();

exports.onFlush = (function(){
    function onFlush(callback){
        this.Cache.getInstance().on('flush', callback);
    }
    return onFlush;
}.bind(this))();