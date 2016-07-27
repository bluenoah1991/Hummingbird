"use strict";

var storage = require('./storage');
var models = require('./models');

module.exports = (function(){
    function Seeds(){
        var seeds = [
            new models.Category('top', 'Top Stories','http://feeds.bbci.co.uk/news/rss.xml'),
            new models.Category('world', 'World', 'http://feeds.bbci.co.uk/news/world/rss.xml'),
            new models.Category('business', 'Business', 'http://feeds.bbci.co.uk/news/business/rss.xml'),
            new models.Category('politics', 'Politics', 'http://feeds.bbci.co.uk/news/politics/rss.xml'),
            new models.Category('health', 'Health', 'http://feeds.bbci.co.uk/news/health/rss.xml'),
            new models.Category('education', 'Education', 'http://feeds.bbci.co.uk/news/education/rss.xml'),
            new models.Category('science_and_environment', 'Science & Environment', 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml'),
            new models.Category('technology', 'Technology', 'http://feeds.bbci.co.uk/news/technology/rss.xml'),
            new models.Category('entertainment_and_arts', 'Entertainment & Arts', 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml')
        ];

        storage.findDocument('settings', {'key': 'inited'})
            .then(function(doc){
                if(!doc || !doc.value){
                    return storage.insertDocument('settings', 
                        new models.Settings('inited', true));
                }
            })
            .then(function(r){
                if(r != undefined && r.insertedCount){
                    return storage.insertDocuments('categorys', seeds);
                }
            })
            .then(function(r){
                return r != undefined && r.insertedCount;
            })
            .catch(function(err){
                console.log(err);
            })
            .then(function(done){
                if(done){
                    console.log('done!');
                }
            });
    }
    return Seeds;
})();
