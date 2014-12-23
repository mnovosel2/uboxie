Uboxie.PlaybackModule = (function() {
    //Private vars
    var playbackContainer = null,
        QUEUE_CONTAINER = "#group-queue",
        tmpQueue = [],
        isPlaying = false,
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
            DZ.init({
                /**
                 * Developer key
                 */
                appId: '148981',
                /**
                 * Deployment key
                 */
                // appId: '148831',
                channelUrl: 'http://localhost/channel',
                player: {
                    onload: function() {
                        player.restoreGroupState();
                        DZ.Event.subscribe('player_play', function(e) {
                            isPlaying = true;
                        });
                        DZ.Event.subscribe('current_track', function(trackInfo) {
                            var track =null;                     
                            if (musicQueue.length > 0) {
                                track=musicQueue.shift();
                            }
                            if(track){
                            	currentTrack=track._id;
                            	currentSongDuration = track.duration;
                            	player.displaySongEnd('.player-song-end');  
                            }
                            player.updateSongStartTime(track._id, player.preserveSongState);
                        });
                        DZ.Event.subscribe('track_end', function(position) {
                            var trackToPlay = null;
                            player.songFinished(currentTrack, function() {
                                if (musicQueue.length === 0) {
                                    isPlaying = false;
                                    trackToPlay=null;
                                } else if (musicQueue.length > 0) {
                                    trackToPlay = musicQueue[0];
                                    DZ.player.playTracks([trackToPlay.key]);
                                }
                                $('.player-progress-bar').css('width', '0%');
                                $(QUEUE_CONTAINER).find('.active').removeClass('active');
                                if (trackToPlay) {
                                    $(QUEUE_CONTAINER).find('#' + trackToPlay._id).addClass('active');
                                }
                            });
                        });
                        DZ.Event.subscribe('player_position', function(positionInfo) {
                            currentPosition = Math.floor(100 * positionInfo[0] / currentSongDuration);
                            if (currentPosition > 0) {
                                $('.player-progress-bar').css('width', currentPosition + '%');
                            }
                            player.displaySongDuration('.player-song-start', positionInfo[0]);
                        });
                    }
                }
            });
        },
        preserveSongState: function(trackInfo) {
            $.post('/api/1/group/' + groupId + '/state/current', trackInfo, function(data) {
                if (data.status) {
                    socket.emit('songChanged', data.message);
                }
            });
        },
        updateSongStartTime: function(trackId, callback) {
            var startTime = new Date().getTime();
            $.put('/api/1/group/' + groupId + '/state/playtime', {
                trackId: trackId,
                startTime: startTime
            }, function(data) {
                if (data.status) {
                    callback({
                        trackId: trackId
                    });
                }
            });
        },
        restoreGroupState: function() {
            $.get('/api/1/group/' + groupId + '/fetch/current', function(data) {
                var currentGroup = data.message,
                    currentUserTime = new Date().getTime(),
                    songsInGroup = currentGroup.songsInGroup,
                    startTime,
                    songOffsetInSeconds,
                    currentSong = currentGroup.currentSong;
                if (songsInGroup.length > 0) {
                    musicQueue.length = 0;

                    for (var i = 0; i < songsInGroup.length; i++) {
                        if (songsInGroup[i].finished == true) {
                            player.addListItem(QUEUE_CONTAINER, songsInGroup[i]._id, songsInGroup[i], false);
                        }
                    }
                    for (var j = 0; j < songsInGroup.length; j++) {
                        if (currentSong._id != null && songsInGroup[j]._id == currentSong._id) {
                            startTime = new Date(songsInGroup[j].startTime).getTime();
                            songOffsetInSeconds = (currentUserTime - startTime) / 1000;
                            if (songOffsetInSeconds <= currentSong.duration) {
                                DZ.player.playTracks([songsInGroup[j].key], 0, songOffsetInSeconds);
                                musicQueue.push(songsInGroup[j]);
                                player.addListItem(QUEUE_CONTAINER, currentSong._id, currentSong, true);
                            }

                        }
                        if (songsInGroup[j].finished == false && songsInGroup[j]._id != currentSong._id) {
                            musicQueue.push(songsInGroup[j]);
                            player.addListItem(QUEUE_CONTAINER, songsInGroup[j]._id, songsInGroup[j], false);
                        }

                    }
                }
            });
        },
        addToGroupQueue: function(track, container, addToQueue) {
            var childrenLength = 0,
                trackToPlay;
            $.post('/api/1/group/' + track.groupId + '/state/preserve', track, function(data) {
                if (data.status) {
                    player.addListItem(QUEUE_CONTAINER, data.message._id, track, false);
                    musicQueue.push(data.message);
                    if (!isPlaying) {
                        DZ.player.playTracks([data.message.key]);
                        $(QUEUE_CONTAINER).find('#' + data.message._id).addClass('active');
                    }

                    socket.emit('songAdded', track);
                }
            });
        },
        songFinished: function(trackId, callback) {
            $.put('/api/1/group/' + groupId + '/state/songFinished', {
                trackId: trackId
            }, function(data) {
                if (data.status) {
                    callback();
                }
            });
        },
        addListItem: function(container, trackId, track, active, prepend) {
            var listItem = "";
            if (active) {
                listItem = '<li href="#" class="list-group-item queue-item active" id="' + trackId + '"><p class="track-name">' + track.name + '</p><p class="track-artist">' + track.artist + '</p></li>';
            } else {
                listItem = '<li href="#" class="list-group-item queue-item" id="' + trackId + '"><p class="track-name">' + track.name + '</p><p class="track-artist">' + track.artist + '</p></li>';
            }
            if (prepend) {
                $(container).prepend(listItem);
            } else {
                $(container).append(listItem);
            }
            Uboxie.Helpers.createDynamicScrollbar(container, '.active', {
                height: '400px',
                alwaysVisible: true,
                size: '5px',

            });
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
