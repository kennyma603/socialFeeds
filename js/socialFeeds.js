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


var Instagram = (function($, window){
	var self = {};

	var options = {
		showDate : true,
		showUserName : true,
		showImage : true,
		hyperlinkImage : true,
		imageSize: "small",
		showLikes: true,
		showTotalLikes: true
	}

	self.instagramObjArr = [];
	self.instagramPromise;

	self.init = function(userOptions){
		console.log("instagram init");
		options = $.extend(options, userOptions || {});
		self.instagramPromise = getInstagramPromise();
	}

	var getInstagramPromise = function(){
		var allAjaxCalls = [];
		var accessToken = "197019245.28c53d9.cf82bfb63efc410f934eec52d416b12b";
		var userID = options.users[i];
		var count = options.num_feeds;

		for (var i=0, length=options.users.length; i<length; i++) {

			var url = "https://api.instagram.com/v1/users/"
				+ options.users[i] + "/media/recent/?access_token="
				+ accessToken
				+"&count=" + count;
			

			var tempajax = $.ajax({
			  type: "GET",
			  dataType: "jsonp",
			  cache: false,
			  url: url
			  
			});

			allAjaxCalls.push(tempajax);
			console.log(url);

			$.when(tempajax).then(function (data) { 
				console.log(data);
				renderInstagramObjs(data);
			});
		}

		return $.when.apply(null, allAjaxCalls); // return ajax promises when the calls are finished	
	}

	var renderInstagramObjs = function(data){
		console.log(data);
		var totalLikes = 0;
		for(var i=0, length=data.data.length; i<length; i++){

			var currObj = data.data[i];

			var created_at = currObj.created_time;
			var text = currObj.caption;
			var from_user = currObj.user.username;
			var post_link = currObj.link;
			var image_like = currObj.likes.count;

			totalLikes = totalLikes + image_like;

			if(currObj.caption != null)
				text = currObj.caption.text;

			var image_url = "";
			if (options.imageSize == "medium")
				image_url = currObj.images.low_resolution.url;
			else if (options.imageSize == "large")
				image_url = currObj.images.standard_resolution.url;
			else 
				image_url = currObj.images.thumbnail.url;


			var $itemHtml = $('<div class="tweetItem"></div>');

			$itemHtml.append('<div class="itemBody">'+ text +'</div>');

			if(options.showDate == true)
				$itemHtml.append('<div class="itemTime">'+ created_at +'</div>');
			if(options.showUserName == true)
				$itemHtml.append('<div class="itemFromUser">'+ from_user +'</div>');
			if(options.showImage == true) //add image
				if(options.hyperlinkImage == true) // add link to image
					$itemHtml.append('<div class="itemImage"><a href="' + currObj.link + '" target="_blank"> \
						<img src="'+ image_url +'"/></a></div>');
				else // no link to image
				$itemHtml.append('<div class="itemImage"><img src="'+ image_url +'"/></div>');

			if(options.showLikes == true)
				$itemHtml.append('<div class="itemLikesNum">'+ image_like +'</div>');

			currObj.validDateForSorting = created_at;
			currObj.itemHtml = $itemHtml;

			self.instagramObjArr.push(currObj); //add modified twitter json objs to twitterObjArr. will be used later.
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
		var instagramPromises;
		var $obj = $(this);
		options = {
			num_feeds: 8,
			twitter_options : {},
			pinterest_options : {},
			instagram_options : {}
		};	

		options = $.extend(options, userOptions || {});
	

		var getTwitterPromises = function(){
			var deferred = $.Deferred();
			var user_twitter_options = options.twitter_options;
			user_twitter_options.num_feeds = options.num_feeds; // add this info to twitter_options
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

		var getInstagramPromises = function(){
			var deferred = $.Deferred();
			var user_instagram_options = options.instagram_options;
			user_instagram_options.num_feeds = options.num_feeds; // add this info to twitter_options
			
			Instagram.init(user_instagram_options);

			Instagram.instagramPromise.then(
				function (data) {
					allSocialFeedsPromise.push(Instagram.instagramPromise);
					console.log(allSocialFeedsPromise);
					

					for(var i=0; i<Instagram.instagramObjArr.length; i++){
						allSocialFeedsObjArr.push(Instagram.instagramObjArr[i]);
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
				twitterPromises = getTwitterPromises();
				allSocialFeedsPromise.push(twitterPromises);

			}	
			if( !$.isEmptyObject(options.pinterest_options.users)){

				pinterestPromises = getPinterestPromises();
				allSocialFeedsPromise.push(pinterestPromises);

			}	
			if( !$.isEmptyObject(options.instagram_options.users)){

				instagramPromises = getInstagramPromises();
				allSocialFeedsPromise.push(instagramPromises);

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