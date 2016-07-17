'use strict';

var restify = require('restify');
var assert = require('chai').assert;

describe('default test', function(done){
    this.timeout(20000);

    it('should respond Error', (done) => {
        var client = restify.createJsonClient({
            url: 'https://localhost:3978',
            version: '*'
        });
        client.get('/api/messages', function(err, req, res, obj){
            assert.ifError(!err);
            done();
        });
    });

}); 