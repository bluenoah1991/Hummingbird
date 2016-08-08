"use strict";

// news sources

var Q = require('q');
var _ = require('underscore');
var rss = require('rss-parser');

var models = require('./models');
var Image = require('./images');

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
					lastTimeStamp = parseInt(lastTimeStamp_.value);
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
				if(_.isObject(lastEntry)){
					return models.Settings.update({id: 'lastTimeStamp'}, 
						{value: lastEntry.timestamp}, {upsert: true})
						.then(function(raw){
							return result;
						});
				} else {
					return result;
				}
			});
	}

	Resource.recent = function(category, lastTimeStamp){
		if(_.isString(category)){
			return models.Category.findOne({id: category})
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
					.each(function(entry){
						entry.timestamp = Date.parse(entry.pubDate);
					});
				if(lastTimeStamp != undefined){
					chain = chain.filter(function(entry){
						return entry.timestamp > lastTimeStamp;
					});
				}
				var entries = chain.sortBy('timestamp').last(3).value();
				if(lastTimeStamp != undefined){
					return Resource.processEntry(entries);
				}
				return entries;
				//return Resource.processThumbnail(entries);
			})
			.then(function(entires){
				return {
					category: category, 
					entries: _.chain(entires)
				};
			})
			.catch(function(err){
				console.log(err);
			});
	};

	Resource.processEntry = function(entries){
		return Q.all(_.map(entries, function(entry){
			return models.Entry.findOne({link: entry.link})
				.then(function(doc){
					if(doc != undefined){
						return null;
					}
					return new models.Entry(entry).save()
						.then(function(doc){
							return entry;
						});
				});
		}))
		.then(function(entries){
			return _.filter(entries, _.isObject);
		});
	};

	Resource.processThumbnail = function(entries){
		return Q.all(_.map(entries, function(entry){
			if(entry.thumbnail == undefined){
				return entry;
			}

			var image = new Image(
				entry.thumbnail, 
				entry.thumbnailWidth, 
				entry.thumbnailHeight
			);
			return image.resizeBaseAspectRatio(16, 9)
				.then(function(info){
					entry.thumbnail = info.link;
					entry.thumbnailWidth = info.width;
					entry.thumbnailHeight = info.height;
					return entry;
				})
				.catch(function(err){
					return entry;
				});
		}));
	};

	return Resource;
})();

/*rss.parseURL('http://feeds.bbci.co.uk/news/world/rss.xml', function(err, parsed){
	console.log(parsed.feed.title);
	parsed.feed.entries.forEach(function(entry){
		console.log(entry.title + ':' + entry.link);
	});
})*/