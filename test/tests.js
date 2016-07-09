'use strict';

var restify = require('restify');
var assert = require('chai').assert;

describe('default test', function(done){
    
    it('should respond MethodNotAllowedError', (done) => {
        var client = restify.createJsonClient({
            url: 'http://127.0.0.1:3978',
            version: '*'
        });
        client.get('/api/messages', function(err, req, res, obj){
            assert.isObject(err);
            assert.equal(err.statusCode, 405);
            done();
        });
    });

}); 