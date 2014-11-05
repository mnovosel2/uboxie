var globalPlaybackContainer = null,
    globalQueueContainer,
    queueLength,
    playbackCounter = 0,
    tmpQueue = [],
    globalStateIndicator;
var playback = {
    instanciatePlayback: function(container) {
        globalPlaybackContainer = container;
        $(container).rdio('GAlUWSac_____2R2cHlzNHd5ZXg3Z2M0OXdoaDY3aHdrbnVib3hpZS5tZUHg7C3eXtDx70b8NV9l9j8=');
        $(container).bind('queueChanged.rdio', function(e, newQueue) {
        	queueLength=newQueue.length;
        	if(newQueue.length==0){
        		playbackCounter=0;
        	}
        	console.log(newQueue);
        });
        $(container).bind('playStateChanged.rdio', function(obj,state) {
	        globalStateIndicator=state;
        });
        $(container).bind('playingTrackChanged.rdio', function(source,track) {
	       $(globalQueueContainer).children().removeClass('active');
	       $(globalQueueContainer).find("#"+track.key).addClass('active');
        });
    },
    playTrack: function(key) {
        if (globalPlaybackContainer) {
            $(globalPlaybackContainer).rdio().play(key);
        }
    },
    addToGroupQueue: function(title, info, trackKey, container) {
        var listItem = '<a href="#" class="list-group-item" id="'+trackKey+'">' + title + '</a>',
            childrenLength = 0,
            trackToPlay;
        globalQueueContainer = container;
        $(container).append(listItem).each(function() {
            childrenLength = $(this).children().length;
            console.log(globalStateIndicator);
            if(playbackCounter==0 && globalStateIndicator!==1){
            	 $(globalPlaybackContainer).rdio().play(trackKey);
            	 playbackCounter+=1;
            }else{
            	  $(globalPlaybackContainer).rdio().queue(trackKey);
            	  $(globalPlaybackContainer).rdio().play();
            }
        });
    }
};
