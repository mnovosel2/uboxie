App.PlaybackModule = (function() {
    //Private vars
    var playbackContainer = null,
        QUEUE_CONTAINER = "#group-queue",
        tmpQueue = [],
        stateIndicator,
        currentSongDuration = 1,
        currentTrack = "",
        groupId = $('.group-container').data('group'),
        currentTrackFinished = false,
        currentPosition = 1,
        musicQueue = [],
        startTime,
        currentUserTime,
        songOffset;
    return {
        instanciatePlayback: function(container) {
            playbackContainer = container;
            /**
             * Production playback key
             */
            // $(container).rdio('GAlUWSac_____2R2cHlzNHd5ZXg3Z2M0OXdoaDY3aHdrbnVib3hpZS5tZUHg7C3eXtDx70b8NV9l9j8=');


            /**
             * Development playback key
             */
            $(container).rdio('GAlNi78J_____zlyYWs5ZG02N2pkaHlhcWsyOWJtYjkyN2xvY2FsaG9zdEbwl7EHvbylWSWFWYMZwfc=');


            $(container).bind('ready.rdio', function() {
                $.get('/api/1/group/' + groupId + '/fetch/current', function(currentGroup) {
                    currentUserTime = new Date().getTime();
                    if (currentGroup.songsInGroup.length > 0) {
                        musicQueue.length = 0;
                        for (var i = 0; i < currentGroup.songsInGroup.length; i++) {
                            if (currentGroup.currentSong.trackKey != null && currentGroup.songsInGroup[i].trackKey == currentGroup.currentSong.trackKey) {
                                startTime = new Date(currentGroup.songsInGroup[i].startTime).getTime();
                                songOffset = (currentUserTime - startTime) / 1000;
                                if (songOffset <= currentGroup.currentSong.duration) {
                                    $(playbackContainer).rdio().play(currentGroup.currentSong.trackKey, {
                                        initialPosition: Math.abs(songOffset)
                                    });
                                }
                                App.PlaybackModule.addListItem(QUEUE_CONTAINER, currentGroup.currentSong.trackKey, currentGroup.currentSong.title, true);
                            }
                            if (currentGroup.songsInGroup[i].finished == true) {
                                App.PlaybackModule.addListItem(QUEUE_CONTAINER, currentGroup.songsInGroup[i].trackKey, currentGroup.songsInGroup[i].title, false, true);
                            }
                            if (currentGroup.songsInGroup[i].finished == false && currentGroup.songsInGroup[i].trackKey != currentGroup.currentSong.trackKey) {
                                musicQueue.push(currentGroup.songsInGroup[i]);
                                App.PlaybackModule.addListItem(QUEUE_CONTAINER, currentGroup.songsInGroup[i].trackKey, currentGroup.songsInGroup[i].title, false);
                            }

                        }
                    }
                });
            });
            $(container).bind('playStateChanged.rdio', function(obj, state) {
                stateIndicator = state;
            });

            $(container).bind('playingTrackChanged.rdio', function(source, track) {
                currentSongDuration = track.duration;
                currentTrack = track.key;
                App.PlaybackModule.preserveSongState({
                    trackId: track.key,
                    duration: track.duration,
                    currentPlayTime: 0,
                    title: track.name
                });
            });
            $(container).bind('positionChanged.rdio', function(e, position) {
                currentPosition = Math.floor(100 * position / currentSongDuration);
                if (currentTrack && position != 0) {
                    if (currentPosition >= 99 && currentPosition <= 100) {
                        $(this).trigger('songFinished');
                    }
                }

            });
            $(container).on('songFinished', function(e) {
                var trackToPlay;
                App.PlaybackModule.songFinished(currentTrack);
                if (musicQueue.length > 0) {
                    trackToPlay = musicQueue.shift();
                } else {
                    trackToPlay = null;
                    $(QUEUE_CONTAINER).find('.active').removeClass('active');
                }
                if (trackToPlay !== null) {
                    $(playbackContainer).rdio().play(trackToPlay.trackKey, {
                        initialPosition: parseInt(trackToPlay.offset, 10)
                    });
                    $(QUEUE_CONTAINER).find('.active').removeClass('active').next('#' + trackToPlay.trackKey).addClass('active');
                }
            });
        },
        preserveSongState: function(trackInfo) {
            trackInfo.groupId = groupId;
            $.post('/api/1/group/' + groupId + '/state/current', trackInfo, function(data) {
                console.log(data);
            });
        },
        updateCurrentPlayTime: function(trackKey, currentPlayTime) {
            $.put('/api/1/group/' + groupId + '/state/playtime', {
                trackId: trackKey,
                currentPlayTime: currentPlayTime
            }, function(data) {
                console.log(data);
            });
        },
        addToGroupQueue: function(track, container, addToQueue) {
            var listItem = '<a href="#" class="list-group-item" id="' + track.trackKey + '">' + track.title + '</a>',
                childrenLength = 0,
                trackToPlay;

            musicQueue.push({
                trackKey: track.trackKey,
                title: track.title,
                duration: track.duration,
                info: track.info,
                offset: track.offset || 0
            });
            App.PlaybackModule.addListItem(QUEUE_CONTAINER, track.trackKey, track.title, false);
            if (stateIndicator != 1) {
                trackToPlay = musicQueue.shift();
                $(playbackContainer).rdio().play(trackToPlay.trackKey, {
                    initialPosition: parseInt(trackToPlay.offset, 10)
                });
                $(QUEUE_CONTAINER).find('#' + trackToPlay.trackKey).addClass('active');
            }
            $.post('/api/1/group/' + track.groupId + '/state/preserve', track, function(data) {
                console.log(data);
            });
        },
        songFinished: function(trackKey) {
            $.put('/api/1/group/' + groupId + '/state/songFinished', {
                trackKey: trackKey
            }, function(data) {});
        },
        addListItem: function(container, trackKey, title, active, prepend) {
            var listItem = "";
            if (active) {
                listItem = '<a href="#" class="list-group-item active" id="' + trackKey + '">' + title + '</a>';
            } else {
                listItem = '<a href="#" class="list-group-item" id="' + trackKey + '">' + title + '</a>';
            }
            if (prepend) {
                $(container).prepend(listItem);
            } else {
                $(container).append(listItem);
            }

        }
    };
})();
