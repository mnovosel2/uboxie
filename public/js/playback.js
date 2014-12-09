Uboxie.PlaybackModule = (function() {
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
        player;
    return {
        instanciatePlayback: function(container) {
            player = this;
            playbackContainer = container;
            /**
             * Production playback key
             */
            $(playbackContainer).rdio('GAlUha0N_____3BiNTRiMmFud2N3dGMycG1naDM1YWdxZXVib3hpZS5tZeQZemKsAiQFgvsEycOdv_Q=');


            /**
             * Development playback key
             */
            // $(playbackContainer).rdio('GAlNi78J_____zlyYWs5ZG02N2pkaHlhcWsyOWJtYjkyN2xvY2FsaG9zdEbwl7EHvbylWSWFWYMZwfc=');

            $(playbackContainer).bind('ready.rdio', function() {
                player.restoreGroupState();
            });
            $(playbackContainer).bind('playStateChanged.rdio', function(obj, state) {
                stateIndicator = state;
            });

            $(playbackContainer).bind('playingTrackChanged.rdio', function(source, track) {
                currentSongDuration = track.duration;
                player.displaySongEnd('.player-song-end');
                currentTrack = track.key;
                player.preserveSongState({
                    trackId: track.key
                });
            });
            $(playbackContainer).bind('positionChanged.rdio', function(e, position) {
                currentPosition = Math.floor(100 * position / currentSongDuration);
                if(currentPosition>0){
                    $('.player-progress-bar').css('width', currentPosition + '%');
                }
                player.displaySongDuration('.player-song-start', position);
                if (currentTrack && position != 0) {
                    if (currentPosition >= 99 && currentPosition <= 100) {
                        $(this).trigger('songFinished');
                    }
                }

            });
            $(playbackContainer).on('queueShift', function(e, trackKey) {
                player.updateSongStartTime(trackKey);
            });
            $(playbackContainer).on('songFinished', function(e) {
                var trackToPlay = null;
                player.songFinished(currentTrack);
                if (musicQueue.length > 0) {
                    trackToPlay = musicQueue.shift();
                    $(playbackContainer).trigger('queueShift', trackToPlay.trackKey);

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
            $.post('/api/1/group/' + groupId + '/state/current', trackInfo, function(data) {
                console.log(data);
            });
        },
        restoreGroupState: function() {
            $.get('/api/1/group/' + groupId + '/fetch/current', function(currentGroup) {
                var currentUserTime = new Date().getTime(),
                    songsInGroup = currentGroup.songsInGroup,
                    startTime,
                    songOffset,
                    currentSong = currentGroup.currentSong;
                if (songsInGroup.length > 0) {
                    musicQueue.length = 0;
                    for (var i = 0; i < songsInGroup.length; i++) {
                        if (songsInGroup[i].finished == true) {
                            player.addListItem(QUEUE_CONTAINER, songsInGroup[i].trackKey, songsInGroup[i].name, false);
                        }
                    }
                    for (var j = 0; j < songsInGroup.length; j++) {
                        if (currentSong.trackKey != null && songsInGroup[j].trackKey == currentSong.trackKey) {
                            startTime = new Date(songsInGroup[j].startTime).getTime();
                            songOffset = (currentUserTime - startTime) / 1000;
                            console.log('Offset');
                            console.log(songOffset);
                            if (songOffset <= currentSong.duration) {
                                $(playbackContainer).rdio().play(currentSong.trackKey, {
                                    initialPosition: Math.abs(songOffset)
                                });
                            }
                            player.addListItem(QUEUE_CONTAINER, currentSong.trackKey, currentSong.name, true);
                        }
                        if (songsInGroup[j].finished == false && songsInGroup[j].trackKey != currentSong.trackKey) {
                            musicQueue.push(songsInGroup[j]);
                            player.addListItem(QUEUE_CONTAINER, songsInGroup[j].trackKey, songsInGroup[j].name, false);
                        }

                    }
                }
            });
        },
        updateSongStartTime: function(trackKey) {
            var startTime = new Date().getTime();
            $.put('/api/1/group/' + groupId + '/state/playtime', {
                trackId: trackKey,
                startTime: startTime
            }, function(data) {
                console.log(data);
            });
        },
        addToGroupQueue: function(track, container, addToQueue) {
            var listItem = '<a href="#" class="list-group-item" id="' + track.trackKey + '">' + track.name + '</a>',
                childrenLength = 0,
                trackToPlay;

            musicQueue.push(track);
            player.addListItem(QUEUE_CONTAINER, track.trackKey, track.name, false);
            $.post('/api/1/group/' + track.groupId + '/state/preserve', track, function(data) {
                if (data.status) {
                    if (stateIndicator != 1) {
                        trackToPlay = musicQueue.shift();
                        $(playbackContainer).trigger('queueShift', trackToPlay.trackKey);
                        $(playbackContainer).rdio().play(trackToPlay.trackKey);
                        $(QUEUE_CONTAINER).find('#' + trackToPlay.trackKey).addClass('active');
                    }
                }
            });
        },
        songFinished: function(trackKey) {
            $.put('/api/1/group/' + groupId + '/state/songFinished', {
                trackKey: trackKey
            }, function(data) {});
        },
        addListItem: function(container, trackKey, name, active, prepend) {
            var listItem = "";
            if (active) {
                listItem = '<a href="#" class="list-group-item active" id="' + trackKey + '">' + name + '</a>';
            } else {
                listItem = '<a href="#" class="list-group-item" id="' + trackKey + '">' + name + '</a>';
            }
            if (prepend) {
                $(container).prepend(listItem);
            } else {
                $(container).append(listItem);
            }

        },
        displaySongEnd: function(container) {
            var minutes = Math.floor(currentSongDuration / 60),
                balanceOfSeconds = currentSongDuration % 60;
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (balanceOfSeconds < 10) {
                balanceOfSeconds = '0' + balanceOfSeconds;
            }
            $(container).text(minutes + ':' + balanceOfSeconds);
        },
        displaySongDuration: function(container, position) {
            var minutes = Math.floor(position / 60),
                balanceOfSeconds = Math.floor(position % 60);
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (balanceOfSeconds < 10) {
                balanceOfSeconds = '0' + balanceOfSeconds;
            }
            $(container).text(minutes + ':' + balanceOfSeconds);
        }
    };
})();
