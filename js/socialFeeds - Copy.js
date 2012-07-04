(function($, window){

 Twitter = {
	options : {
		num_feeds : 5,
	},

	num_users : 1,
	tweetCache : [],

	init : function(userOptions){
		options = $.extend(options, userOptions || {});
		num_users = options.users.length;
		this.twitterPromise = this.getTwitterPromise();
	},


	getTwitterPromise : function(){
		var allAjaxCalls = [];

		for (var i=0, length=options.users.length; i<length; i++) {

			var url = "https://search.twitter.com/search.json?include_entities=true&"
				+"from=" + options.users[i]
				+"&rpp=" + Math.ceil(options.num_feeds / num_users)
				+"&with_twitter_user_id=true"
				+"&callback=?";
			var tempajax = $.getJSON( url );
			allAjaxCalls.push(tempajax);

			$.when(tempajax).then(function (data) { 
				for (var i=0, length=data.results.length; i<length; i++) {
					this.tweetCache.push(data.results[i]);
				}
			});
		}

		return $.when.apply(null, allAjaxCalls);

		//return this;	
	}

}

})(jQuery, window);

(function($, window, undefined){
	$.fn.socialFeeds = function(userOptions){
		var allSocialFeedsArr = [];

		 options = {
			background: 'red',
			twitter_options : {},
		};

		

		 options = $.extend(options, userOptions || {});

		return this.each(function(){
			console.log(options.background);
			var $obj = $(this);
			var $socialFeedsHtml = $('<div class="allFeeds"></div>');

			if( !$.isEmptyObject(options.twitter_options.users)){
				Twitter.init(options.twitter_options);
				//var feeds = Twitter.getFeeds();

			Twitter.twitterPromise.then(
				function (data) {
					console.log(Twitter.tweetCache);
					$socialFeedsHtml.append(data);
				},
				function () {
					console.log('bad');
					//return "<h2>bad</h2>";
				}
			);

				//$socialFeedsHtml.append(feeds);
			}


			$obj.append($socialFeedsHtml);
			console.log("2");
		});

	}// end of socialFeeds plugin
})(jQuery, window);