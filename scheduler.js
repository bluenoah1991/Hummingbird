"use strict";

// create and trigger tasks

var schedule = require('node-schedule');

module.exports = (function(){
    function Scheduler(){

    }

    Scheduler.prototype.loop = function(interval, callback){
        interval = interval == undefined ? 3 : interval;
        var rule = `*/${interval} * * * *`;
        this.j = schedule.scheduleJob(rule, callback);
    };

    Scheduler.prototype.cancel = function(){
        this.j.cancel();
    }

    return Scheduler;
})();