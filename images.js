"use strict";

var Q = require('q');
// var http = require('http');
var request = require('request');
var url = require('url');
var path = require('path');
var Stream = require('stream').Transform;
var sharp = require('sharp');
var _ = require('underscore');
var config = require('./config');

module.exports = (function(){
    function Image(u, width, height){
        this.url = u;
        this.ext = this.extname(u);
        this.width = width == undefined ? width : parseInt(width);
        this.height = height == undefined ? height: parseInt(height);
        this.raw = this.download();
    }

    Image.prototype.extname = function(u){
        var uo = url.parse(u);
        return path.extname(uo.path);
    }

    Image.prototype.sharpObject = function(){
        return this.raw.then(function(buffer){
            return sharp(buffer);
        });
    };

    Image.prototype.metadata = function(){
        return this.sharpObject().then(function(sharpObject){
            return sharpObject.metadata();
        });
    };

    Image.prototype.download = function(){
        var deferred = Q.defer();
        var stream = new Stream();
        var rs = request(this.url, {timeout: 30000});
        rs.on('data', function(chunk){
            stream.push(chunk);
        });
        rs.on('end', function(){
            deferred.resolve(stream.read());
        });
        rs.on('error', function(err){
            console.log(err);
        });
        return deferred.promise;
    };

    Image.prototype.resize = function(width, height){
        // TODO based on restify static middleware 
        var fileName = _.uniqueId('image_') + this.ext;
        var fullName = path.resolve(config.STATIC_IMAGES_DIR, fileName);
        var uo = {
            protocol: 'https',
            hostname: config.HOSTNAME,
            port: config.PORT,
            pathname: '/static/images/',
        }
        var link = url.format(uo);
        link = url.resolve(link, fileName);
        return this.sharpObject()
            .then(function(sharpObject){     
                // TODO check exist dir
                return sharpObject.resize(width, height)
                .toFile(fullName);
            })
            .then(function(info){
                info.fullName = fullName;
                info.link = link;
                return info;
            });
    };

    Image.prototype.resizeBaseAspectRatio = function(w, h){
        w = parseInt(w);
        h = parseInt(h);
        if(this.width == undefined || this.height == undefined){
            return this.metadata()
                .then(function(metadata){
                    return this.resizeBaseAspectRatio_(
                        metadata.width, metadata.height, w, h);
                }.bind(this));
        } else {
            return this.resizeBaseAspectRatio_(
                this.width, this.height, w, h);
        }
    };

    Image.prototype.resizeBaseAspectRatio_ = function(rw, rh, w, h){
        var width = rw;
        var height = rh;
        if(rw / rh > w / h){
            width = height * w / h;
        } else {
            height = width * h / w;
        }
        return this.resize(width, height);
    }

    return Image;
})();

