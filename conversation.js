"use strict";

module.exports = (function(){
    function Conversation(user, bot, connector){
        this.user = user;
        this.bot = bot;
        this.connector = connector;
    }

    Conversation.prototype.sendMessage = function(message){
        this.connector.startConversation(
            this.user.address, function(err, address){
                this.bot.beginDialog(address, 'proactive:/send', message);
            }.bind(this));
    };

    Conversation.prototype.sendMessageUseCallback = function(callback){
        this.connector.startConversation(
            this.user.address, function(err, address){
                this.bot.beginDialog(address, 'proactive:/sendUseCallback', callback);
            }.bind(this));
    };

    return Conversation;
})();