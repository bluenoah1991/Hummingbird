"use strict";

exports.CarnivalMiddleware = (function(){
    function EventMiddleware(event, next){
        console.log(event);
    }

    var MiddlewareMap = {
        'receive': EventMiddleware
    };

    return MiddlewareMap;
})();