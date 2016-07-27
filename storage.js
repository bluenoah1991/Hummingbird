"use strict";

// persistent data
var Q = require('q');

var cache = require('./cache');

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

exports.Cacheable = (function(){
    function Cacheable(){
        this._key_ = 'id';
        this._ttl_ = 1000 * 10;
    }
    Cacheable.prototype.__key__ = function(){
        return this[this._key_];
    }
    return Cacheable;
}.bind(this))();

exports.database = (function(){
    var instance;

    return {
        getInstance: function(){
            if(!instance){
                var url = 'mongodb://localhost:27017/instflow';
                instance = MongoClient.connect(url);
            }
            return instance;
        },
        close: function(){
            if(!!instance){
                return instance.then(function(db){
                    db.close();
                    cache.Cache.close();
                    instance = null;
                });
            } else {
                return Q.fcall(function(){});
            }
        }
    };
}.bind(this))();

exports.insertDocument = (function(){
    function insertDocument(collectionName, document){
        return this.database.getInstance()
            .then(function(db){
                var spread;
                if(document instanceof this.Cacheable){
                    spread = [db, cache.set(document.__key__(), document, document._ttl_)];
                } else {
                    spread = [db];
                }
                return Q.spread(spread, function(db, success){
                    var collection = db.collection(collectionName);
                    return collection.insertOne(document);
                });
            }.bind(this));
    }
    return insertDocument;
}.bind(this))();

exports.insertDocuments = (function(){
    function insertDocuments(collectionName, documents){
        return this.database.getInstance()
            .then(function(db){
                var collection = db.collection(collectionName);
                return collection.insertMany(documents);
            });
    }
    return insertDocuments;
}.bind(this))();

exports.findDocument = (function(){
    function findDocument(collectionName, query){
        return this.database.getInstance()
            .then(function(db){
                var collection = db.collection(collectionName);
                return collection.findOne(query);
            });
    }
    return findDocument;
}.bind(this))();

exports.findDocuments = (function(){
    function findDocuments(collectionName, query){
        return this.database.getInstance()
            .then(function(db){
                var collection = db.collection(collectionName);
                return collection.find(query).toArray();
            });
    }
    return findDocuments;
}.bind(this))();

exports.deleteDocument = (function(){
    function deleteDocument(collectionName, filter){
        return this.database.getInstance()
            .then(function(db){
                var collection = db.collection(collectionName);
                return collection.deleteOne(filter);
            });
    }
    return deleteDocument;
}.bind(this))();

exports.updateDocument = (function(){
    function updateDocument(collectionName, filter, update){
        return this.database.getInstance()
            .then(function(db){
                var collection = db.collection(collectionName);
                return collection.updateOne(filter, update);
            });
    }
    return updateDocument;
}.bind(this))();

exports.updateDocuments = (function(){
    function updateDocuments(collectionName, filter, update){
        return this.database.getInstance()
            .then(function(db){
                var collection = db.collection(collectionName);
                return collection.updateMany(filter, update);
            });
    }
    return updateDocuments;
}.bind(this))();
