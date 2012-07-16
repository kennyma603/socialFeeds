if(typeof console === "undefined") {
	console={
		dir: function () {},
		log: function () {}
	}
}

var Twitter = (function($, window){
	var self = {};

	var options = {
		showDate : true,
		showUserName : true
	}

	self.twitterObjArr = [];
	self.twitterPromise;

	self.init = function(userOptions){
		console.log("twitter init");
		options = $.extend(options, userOptions || {});
		self.twitterPromise = getTwitterPromise();
	}

	var getTwitterPromise = function(){
		var allAjaxCalls = [];

		for (var i=0, length=options.users.length; i<length; i++) {

			var url = "https://search.twitter.com/search.json?include_entities=true&"
				+"from=" + options.users[i]
				+"&rpp=" + options.num_feeds
				+"&with_twitter_user_id=true"
				+"&callback=?";
			var tempajax = $.getJSON( url );
			allAjaxCalls.push(tempajax);
			console.log(url);

			$.when(tempajax).then(function (data) { 
				console.log(data);
				renderTwitterObjs(data);
			});
		}

		return $.when.apply(null, allAjaxCalls); // return ajax promises when the calls are finished	
	}

	var renderTwitterObjs = function(data){
		for(var i=0, length=data.results.length; i<length; i++){
			self.twitterObjArr.push(data.results[i]);

			var currObj = data.results[i];

			var created_at = currObj.created_at;
			var text = currObj.text;
			var from_user = currObj.from_user;
			var $itemHtml = $('<div class="tweetItem"></div>');

			$itemHtml.append('<div class="itemBody">'+ text +'</div>');

			if(options.showDate == true)
				$itemHtml.append('<div class="itemTime">'+ created_at +'</div>');
			if(options.showUserName == true)
				$itemHtml.append('<div class="itemFromUser">'+ from_user +'</div>');

			currObj.validDateForSorting = created_at;
			currObj.itemHtml = $itemHtml;

			self.twitterObjArr.push(currObj); //add modified twitter json objs to twitterObjArr. will be used later.
		}
	}

	return self;

})(jQuery, window);



var Pinterest = (function($, window){
	var self = {};
	var options = {
		showDate : true,
		showUserName : true,
		showImage : true
	}

	self.pinterestObjArr = [];
	self.pinterestPromise;

	self.init = function(userOptions){
		console.log(" pinterest init");
		options = $.extend(options, userOptions || {});
		self.pinterestPromise = getPinterestPromise();
	}

	var getPinterestPromise = function(){
		var allAjaxCalls = [];

		for (var i=0, length=options.users.length; i<length; i++) {
			var pinteest_feed_url = "http://pinterest.com/" + options.users[i] + "/feed.rss";
			var url = "https:" + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num='+ options.num_feeds +'&callback=?&q=' + encodeURIComponent(pinteest_feed_url);
			var tempajax = $.getJSON( url ); console.log(url);
			allAjaxCalls.push(tempajax);

			$.when(tempajax).then(function (data) { 
				console.log(data);
				renderPinterestObjs(data);
			});
		}

		return $.when.apply(null, allAjaxCalls); // return ajax promises when the calls are finished	
	}

	var renderPinterestObjs = function(data){
		for(var i=0, length=data.responseData.feed.entries.length; i<length; i++){
			self.pinterestObjArr.push(data.responseData.feed.entries[i]);

			var currObj = data.responseData.feed.entries[i];

			var created_at = currObj.publishedDate;
			var text = currObj.contentSnippet;
			var from_user = currObj.author;
			var post_link = currObj.link;

			var $itemHtml = $('<div class="pinterestItem"></div>');

			$itemHtml.append('<div class="itemBody">'+ text +'</div>');

			if(options.showDate == true)
				$itemHtml.append('<div class="itemTime">'+ created_at +'</div>');
			if(options.showImage == true){
				var image_url = currObj.content.match(/src=(.+")/)[1].replace(/\"/g, '');
				$itemHtml.append('<div class="itemImage"><img src="'+ image_url +'" /></div>');
			}
			if(options.showUserName == true)
				$itemHtml.append('<div class="itemFromUser">'+ from_user +'</div>');


			currObj.validDateForSorting = created_at;
			currObj.itemHtml = $itemHtml;

			self.pinterestObjArr.push(currObj); //add modified twitter json objs to twitterObjArr. will be used later.
		}
	}

	return self;

})(jQuery, window);


(function($, window, undefined){
	$.fn.socialFeeds = function(userOptions){
		var allSocialFeedsObjArr = [];
		var allSocialFeedsPromise = [];
		var $socialFeedsHtml = $('<div class="allFeeds"></div>');
		var twitterPromises;
		var pinterestPromises;
		var $obj = $(this);
		options = {
			num_feeds: 8,
			twitter_options : {},
			pinterest_options : {},
		};	

		options = $.extend(options, userOptions || {});
	

		var getTwitterPromises = function(){
			var deferred = $.Deferred();
			var user_twitter_options = options.twitter_options;
			user_twitter_options.num_feeds = options.num_feeds; // add this info to twitter_options
			console.log("2");
			Twitter.init(user_twitter_options);
			

			Twitter.twitterPromise.then(
				function (data) {
					allSocialFeedsPromise.push(Twitter.twitterPromise);
					console.log(allSocialFeedsPromise);
					

					for(var i=0; i<Twitter.twitterObjArr.length; i++){
						allSocialFeedsObjArr.push(Twitter.twitterObjArr[i]);
					}

					deferred.resolve();
				},
				function () {
					console.log('failed');
				}
			);	
			return deferred.promise();
		}	

		var getPinterestPromises = function(){
			var deferred = $.Deferred();
			var user_pinterest_options = options.pinterest_options;
			user_pinterest_options.num_feeds = options.num_feeds; // add this info to twitter_options
			
			Pinterest.init(user_pinterest_options);

			Pinterest.pinterestPromise.then(
				function (data) {
					allSocialFeedsPromise.push(Pinterest.pinterestPromise);
					console.log(allSocialFeedsPromise);
					

					for(var i=0; i<Pinterest.pinterestObjArr.length; i++){
						allSocialFeedsObjArr.push(Pinterest.pinterestObjArr[i]);
					}

					deferred.resolve();
				},
				function () {
					console.log('failed');
				}
			);	
			return deferred.promise();
		}		


		return this.each(function(){
			
			if( !$.isEmptyObject(options.twitter_options.users)){
				console.log("1");
				twitterPromises = getTwitterPromises();
				allSocialFeedsPromise.push(twitterPromises);

			}	
			if( !$.isEmptyObject(options.pinterest_options.users)){

				pinterestPromises = getPinterestPromises();
				allSocialFeedsPromise.push(pinterestPromises);

			}		

			$.when.apply(null, allSocialFeedsPromise).then(
				function(){
					console.log('allSocialFeedsPromise' + allSocialFeedsPromise);
						for(var i=0; i<allSocialFeedsObjArr.length; i++){
							var currentObj =allSocialFeedsObjArr[i];
							$socialFeedsHtml.append(currentObj.itemHtml);
						}
						$obj.append($socialFeedsHtml);
				},
				function(){

				}
			);
			
		});

	}// end of socialFeeds plugin
})(jQuery, window);