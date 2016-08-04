"use strict";

var url = require('url');
var config = require('./config');

exports.extends = function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

exports.build_redirect_url = function(u){
    var uo = {
        protocol: 'https',
        hostname: config.HOSTNAME,
        port: config.PORT,
        pathname: 'r',
        query: {
            u: u
        }
    }
    return url.format(uo);
};

exports.build_absolute_url = function(pathname, filename){
    var uo = {
        protocol: 'https',
        hostname: config.HOSTNAME,
        port: config.PORT,
        pathname: pathname,
    }
    var link = url.format(uo);
    if(filename != undefined){
        link = url.resolve(link, filename);
    }
    return link;
};

