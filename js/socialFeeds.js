if(typeof console === "undefined") {
	console={
		dir: function () {},
		log: function () {}
	}
}

var Twitter = (function($, window){

	var options = {
		showDate : true,
		showUserName : true
	}

	this.twitterObjArr = [];
	this.twitterPromise;

	init = function(userOptions){
		options = $.extend(options, userOptions || {});
		twitterPromise = getTwitterPromise();
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

			$.when(tempajax).then(function (data) { 
				console.log(data);
				renderTwitterObjs(data);
			});
		}

		return $.when.apply(null, allAjaxCalls); // return ajax promises when the calls are finished	
	}

	var renderTwitterObjs = function(data){
		for(var i=0, length=data.results.length; i<length; i++){
			twitterObjArr.push(data.results[i]);

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

			twitterObjArr.push(currObj); //add modified twitter json objs to twitterObjArr. will be used later.
		}
	}

	return this;

})(jQuery, window);

(function($, window, undefined){
	$.fn.socialFeeds = function(userOptions){
		var allSocialFeedsObjArr = [];
		var allSocialFeedsPromise = [];
		var $socialFeedsHtml = $('<div class="allFeeds"></div>');
		var twitterPromises;
		var $obj = $(this);
		options = {
			num_feeds: 8,
			twitter_options : {},
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


		return this.each(function(){
			
			if( !$.isEmptyObject(options.twitter_options.users)){

				twitterPromises = getTwitterPromises();
				allSocialFeedsPromise.push(twitterPromises);

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