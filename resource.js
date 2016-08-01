"use strict";

// news sources

var Q = require('q');
var _ = require('underscore');
var rss = require('rss-parser');

var models = require('./models');

module.exports = (function(){
	function Resource(){

	}

	Resource.all = function(categories){
		var query = {};
		if(categories != undefined){
			query = {
				'id': {$in: categories}
			};
		}
		return models.Category.find(query)
			.then(function(docs){
				return [models.Settings.findOne({id: 'lastTimeStamp'}), docs];
			})
			.spread(function(lastTimeStamp_, docs){
				var lastTimeStamp;
				if(lastTimeStamp_ == undefined){
					var now = new Date();
					var today = new Date(
						now.getFullYear(),
						now.getMonth(),
						now.getDate()
					);
					lastTimeStamp = today.getTime();
				} else {
					lastTimeStamp = lastTimeStamp_.value;
				}
				return _.map(docs, _.partial(Resource.recent, _, lastTimeStamp));
			})
			.spread(function(){
				var result = arguments;
				var lastEntry = _.chain(arguments)
					.map(_.property('entries'))
					.map(function(entries){
						return entries.max('timestamp').value();
					})
					.max('timestamp').value();
				return models.Settings.update({id: 'lastTimeStamp'}, 
					{value: lastEntry.timestamp}, {upsert: true})
					.then(function(raw){
						return result;
					});
			});
	}

	Resource.recent = function(category, lastTimeStamp){
		if(_.isString(category)){
			models.Category.find({id: category})
				.then(function(doc){
					return Resource.recent_(doc, lastTimeStamp);
				});
		} else {
			return Resource.recent_(category, lastTimeStamp);
		}
	};

	Resource.recent_ = function(category, lastTimeStamp){
		return Q.nfcall(rss.parseURL, category.source)
			.then(function(doc){
				var chain = _.chain(doc.feed.entries)
					.map(function(entry){
						entry.timestamp = Date.parse(entry.pubDate);
						return entry;
					});
				if(lastTimeStamp != undefined){
					chain = chain.filter(function(entry){
						return entry.timestamp > lastTimeStamp;
					});
				}
				return {
					category: category, 
					entries: chain.sortBy('timestamp')
				};
			})
			.catch(function(err){
				console.log(err);
			});
	};

	return Resource;
})();

/*rss.parseURL('http://feeds.bbci.co.uk/news/world/rss.xml', function(err, parsed){
	console.log(parsed.feed.title);
	parsed.feed.entries.forEach(function(entry){
		console.log(entry.title + ':' + entry.link);
	});
})*/