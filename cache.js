"use strict";

// cache proxy
var Q = require('q');

var node_cache = require('node-cache');
var utils = require('./utils');

module.exports = (function(){

    function Cache(){
        this.cache = new node_cache();
    }

    Cache.prototype.flush = function(){
        this.cache.flushAll();
    };

    Cache.prototype.close = function(){
        this.cache.close();
    };

    Cache.prototype.set = function(key, val, ttl){
        var deferred = Q.defer();
        this.cache.set(key, val, ttl, function(err, success){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(success);
            }
        });
        return deferred.promise;
    };

    Cache.prototype.get = function(key){
        var deferred = Q.defer();
        this.cache.get(key, function(err, value){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(value);
            }
        });
        return deferred.promise;
    };

    Cache.prototype.mget = function(keys){
        var deferred = Q.defer();
        this.cache.mget(keys, function(err, value){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(value);
            }
        });
        return deferred.promise;
    };

    Cache.prototype.del = function(key){
        var deferred = Q.defer();
        this.cache.del(key, function(err, count){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(count);
            }
        });
        return deferred.promise;
    };

    Cache.prototype.ttl = function(key, ttl){
        var deferred = Q.defer();
        this.cache.ttl(key, ttl, function(err, changed){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(changed);
            }
        });
        return deferred.promise;
    };

    Cache.prototype.getTtl = function(key){
        var deferred = Q.defer();
        this.cache.getTtl(key, function(err, ts){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(ts);
            }
        });
        return deferred.promise;
    };

    Cache.prototype.keys = function(){
        var deferred = Q.defer();
        this.cache.keys(function(err, keys){
            if(err){
                deferred.reject(err);
            } else {
                deferred.resolve(keys);
            }
        });
        return deferred.promise;
    };

    Cache.prototype.onSet = function(callback){// callback args : key, value
        this.Cache.getInstance().on('set', callback);
    };

    Cache.prototype.onDel = function(callback){
        this.Cache.getInstance().on('del', callback);
    };

    Cache.prototype.onExpired = function(callback){
        this.Cache.getInstance().on('expired', callback);
    };

    Cache.prototype.onFlush = function(callback){
        this.Cache.getInstance().on('flush', callback);
    };

    return Cache;
}.bind(this))();

