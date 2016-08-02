"use strict";

var models = require('./models');

module.exports = (function(){
    function Seeds(){

    }

    Seeds.fillWithDropDb = function(db){
        return db.dropDatabase()
            .then(function(){
                return Seeds.fill();
            });
    };

    Seeds.fill = function(){
        var seeds = [
            {id: 'top', title: 'Top Stories', source: 'http://feeds.bbci.co.uk/news/rss.xml'},
            {id: 'world', title: 'World', source: 'http://feeds.bbci.co.uk/news/world/rss.xml'},
            {id: 'business', title: 'Business', source: 'http://feeds.bbci.co.uk/news/business/rss.xml'},
            {id: 'politics', title: 'Politics', source: 'http://feeds.bbci.co.uk/news/politics/rss.xml'},
            {id: 'health', title: 'Health', source: 'http://feeds.bbci.co.uk/news/health/rss.xml'},
            {id: 'education', title: 'Education', source: 'http://feeds.bbci.co.uk/news/education/rss.xml'},
            {id: 'science_and_environment', title: 'Science & Environment', source: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml'},
            {id: 'technology', title: 'Technology', source: 'http://feeds.bbci.co.uk/news/technology/rss.xml'},
            {id: 'entertainment_and_arts', title: 'Entertainment & Arts', source: 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml'}
        ];

        return models.Settings.findOne({id: 'seed'})
            .then(function(doc){
                if(!doc || !doc.value){
                    return new models.Settings({id: 'seed', value: true}).save()
                        .then(function(doc){
                            return models.Category.insertMany(seeds);
                        });
                }
            })
            .catch(function(err){
                console.log(err);
            })
            .then(function(){
                console.log('Seed data has been filled!');
            });
    };

    return Seeds;
})();
