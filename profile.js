"use strict";

var models = require('./models');

module.exports = (function(){
    function Profile(){

    }

    Profile.login = function(session){
        var id = session.message.user.id;
        return models.User.findOne({id: id})
            .then(function(doc){
                if(!doc){
                    return models.User.create({
                        id: id, 
                        user: session.message.user, 
                        address: session.message.address});
                } else {
                    return doc;
                }
            })
            .then(function(doc){
                session.userData.profile = doc;
                return doc;
            })
            .catch(function(err){
                console.log(err);
            });
    };

    Profile.isNew = function(id){
        return models.User.findOne({id: id})
            .then(function(doc){
                if(doc == undefined ||
                    doc.subscribes == undefined ||
                    doc.subscribes.length == 0){
                    return true;
                }
                return false;
            })
            .catch(function(err){
                console.log(err);
                return true;
            });
    };

    Profile.delete = function(id){
        return models.User.remove({id: id}).exec()
            .then(function(){
                return true;
            })
            .catch(function(err){
                console.log(err);
                return false;
            });
    };

    return Profile;
})();