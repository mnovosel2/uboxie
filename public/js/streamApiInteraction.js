Uboxie.StreamApiModule = (function() {
	return {
		getSearchResults: function(query) {
			return $.post('/api/1/getTracks', {
				query: query
			});
		},
		createSearchResultList: function(data, container, options) {
			var contentToDisplay = '<div id="search-result-container">';
			contentToDisplay += '<div class="result-list search-result-list">';
			$(data).each(function(index, element) {
				if(element[options.trackDuration]>0){
					contentToDisplay += '<div class="row result-item-ctn">';
					contentToDisplay += '<a href="#" class="result-item" data-key="' + element[options.trackKey] + '" data-duration="' + element[options.trackDuration] + '">';
					contentToDisplay += '<div class="col-xs-4 col-md-4 text-center">';
					contentToDisplay += '<img class="img-rounded img-responsive album-icon" src="' + element[options.iconKey] + '">';
					contentToDisplay += '</div>';
					contentToDisplay += '<div class="col-xs-7 col-md-7 section-box">';

					contentToDisplay += '<h5 class="song-title">' + element[options.trackNameKey] + '</h5>';
					contentToDisplay += '<p class="song-info"><b class="song-author">' + element[options.artistKey] + '</b> <span class="album-info">' + (element[options.albumKey] || "") + '</span></p>';
					contentToDisplay += '</div></a></div>';
				}
			});
			contentToDisplay += '</div></div>';
			$(container).empty().append(contentToDisplay).show(400,function(){
					Uboxie.Helpers.createDynamicScrollbar('#result-list','',{
						height: '400px',
						alwaysVisible: true,
						size: '5px'
					});
			});
		}
		
	};
})();
