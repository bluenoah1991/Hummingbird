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
					.each(function(entry){
						entry.timestamp = Date.parse(entry.pubDate);
					});
				if(lastTimeStamp != undefined){
					chain = chain.filter(function(entry){
						return entry.timestamp > lastTimeStamp;
					});
				}
				chain = chain.sortBy('timestamp').last(5);
				var spreads = Resource.processThumbnail(chain);
				return Q.all(spreads);
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

	Resource.processThumbnail = function(entries){
		return entries.map(function(entry){
			if(entry.thumbnail == undefined){
				return entry;
			}

			// Debug
			// if(global.JUST_ONCE != undefined){
			// 	return;
			// }
			// global.JUST_ONCE = true;
			// var image = new Image(
			// 	'http://img3.duitang.com/uploads/item/201404/23/20140423181756_j2ZXn.jpeg'
			// );

			return entry;

			// var image = new Image(
			// 	entry.thumbnail, 
			// 	entry.thumbnailWidth, 
			// 	entry.thumbnailHeight
			// );
			// return image.resizeBaseAspectRatio(16, 9)
			// 	.then(function(info){
			// 		entry.thumbnail = info.link;
			// 		entry.thumbnailWidth = info.width;
			// 		entry.thumbnailHeight = info.height;
			// 		return entry;
			// 	})
			// 	.catch(function(err){
			// 		return entry;
			// 	});
		}).value();
	};

	return Resource;
})();

/*rss.parseURL('http://feeds.bbci.co.uk/news/world/rss.xml', function(err, parsed){
	console.log(parsed.feed.title);
	parsed.feed.entries.forEach(function(entry){
		console.log(entry.title + ':' + entry.link);
	});
})*/