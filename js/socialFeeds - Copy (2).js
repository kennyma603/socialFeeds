if(typeof console === "undefined") {
	console={
		dir: function () {},
		log: function () {}
	}
}

var Twitter = (function($, window){

	var options = {
		num_feeds : 5,
	}

	var num_users = 1;
	this.twitterObjArr = [];
	this.twitterPromise;

	init = function(userOptions){
		options = $.extend(options, userOptions || {});
		num_users = options.users.length;
		twitterPromise = getTwitterPromise();
		
	}


	getTwitterPromise = function(){
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
					twitterObjArr.push(data.results[i]);
				}
			});
		}

		return $.when.apply(null, allAjaxCalls);	
	}

	getTwitterObjs = function(){
		this.twitterObjArr.goodDate = "hi";

		for(var i=0; i<this.twitterObjArr.length; i++){
			var currObj = this.twitterObjArr[i];
			var created_at = currObj.created_at;
			var text = currObj.text;
			var from_user = currObj.from_user;
			var $itemHtml = $('<div class="tweetItem"></div>');

			$itemHtml.append('<div class="itemBody">'+ text +'</div>');
			$itemHtml.append('<div class="itemTime">'+ created_at +'</div>');
			$itemHtml.append('<div class="itemFromUser">'+ from_user +'</div>');

			this.twitterObjArr[i].validDateForSorting = created_at;
			this.twitterObjArr[i].itemHtml = $itemHtml;
			console.log(this.twitterObjArr[i]);
		}
	}

	return this;

})(jQuery, window);

(function($, window, undefined){
	$.fn.socialFeeds = function(userOptions){
		var allSocialFeedsArr = [];
		var allSocialFeedsPromise = [];
		var $socialFeedsHtml = $('<div class="allFeeds"></div>');

		options = {
			background: 'red',
			twitter_options : {},
		};	

		options = $.extend(options, userOptions || {});


		return this.each(function(){
			console.log(options.background);
						
			var $obj = $(this);
			
			if( !$.isEmptyObject(options.twitter_options.users)){


				Twitter.init(options.twitter_options);

				Twitter.twitterPromise.then(
					function (data) {
						allSocialFeedsPromise.push(Twitter.twitterPromise);
						console.log(allSocialFeedsPromise);
						Twitter.getTwitterObjs();
						for(var i=0; i<Twitter.twitterObjArr.length; i++){
							$socialFeedsHtml.append(Twitter.twitterObjArr[i].itemHtml);
						}
						$obj.append($socialFeedsHtml);
					},
					function () {
						console.log('bad');
						//return "<h2>bad</h2>";
					}
				);
			}			

			$.when.apply(null, allSocialFeedsPromise).then(
				function(){
					console.log(allSocialFeedsPromise);
					//console.log(Twitter.twitterObjArr[0]);
				},
				function(){

				}
			);


			
		});

	}// end of socialFeeds plugin
})(jQuery, window);