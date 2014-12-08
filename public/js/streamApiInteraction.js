Uboxie.StreamApiModule = (function() {
    return {
        getSearchResults: function(query) {
            return $.post('/api/1/getTracks', {
                query: query
            });
        },
        createSearchResultList: function(data, container, options) {
            var contentToDisplay = '<div id="search-result-container" class="col-md-12">';
            contentToDisplay += '<div class="result-list row">';
            contentToDisplay += '<div class="col-md-12">';
            $(data).each(function(index, element) {
                contentToDisplay += '<div class="row result-item-ctn">';
                contentToDisplay += '<a href="#" class="result-item" data-key="' + element[options.trackKey] + '" data-duration="' + element[options.trackDuration] + '">';
                contentToDisplay += '<div class="col-xs-4 col-md-4 text-center">';
                contentToDisplay += '<img class="img-rounded img-responsive album-icon" src="' + element[options.iconKey] + '">';
                contentToDisplay += '</div>';
                contentToDisplay += '<div class="col-xs-7 col-md-7 section-box">';

                contentToDisplay += '<h5 class="song-title">' + element[options.trackNameKey] + '</h5>';
                contentToDisplay += '<p class="song-info"><b>' + element[options.artistKey] + "</b> " + (element[options.albumKey] || "") + '</p>';
                contentToDisplay += '</div></a></div>';
            });
            contentToDisplay += '</div></div>';
            $(container).empty().append(contentToDisplay).show();
        }
    };
})();
