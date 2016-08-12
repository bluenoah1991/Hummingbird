"use strict";

exports.CarnivalMiddleware = (function(){
    function EventMiddleware(event, next){
        console.log(event); // Debug
        if(event.source != 'directline'){
            next();
        } else {
            if(event.type == 'message'){
                console.log(`Directline message: ${event.text}`);
            }
        }
    }

    var MiddlewareMap = {
        'receive': EventMiddleware
    };

    return MiddlewareMap;
})();