"use strict";

module.exports = (function(){
    function Conversation(user, bot, connector){
        this.user = user;
        this.bot = bot;
        this.connector = connector;
    }

    Conversation.prototype.sendMessage = function(callback){
        this.connector.startConversation(
            this.user.address, function(err, address){
                this.bot.beginDialog(address, 'proactive:/send', callback);
            }.bind(this));
    };

    return Conversation;
})();