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
                 // appId:'148981',
                /**
                 * Deployment key
                 */
                appId: '148831',
                channelUrl: 'http://uboxie.me/channel',
                player: {
                    onload: function() {
                        player.restoreGroupState();
                        DZ.Event.subscribe('player_play', function(e) {
                            isPlaying = true;
                        });
                        DZ.Event.subscribe('current_track', function(trackInfo) {
                            var track = trackInfo.track;
                            currentSongDuration = track.duration;
                            player.displaySongEnd('.player-song-end');
                            currentTrack = track.id;
                            if (musicQueue.length > 0) {
                                musicQueue.shift();
                            }
                            /**
                             * Change keys for track
                             */
                            player.updateSongStartTime(track.id, player.preserveSongState);
                        });
                        DZ.Event.subscribe('track_end', function(position) {
                            var trackToPlay = null;
                            player.songFinished(currentTrack, function() {
                                if (musicQueue.length === 0) {
                                    isPlaying = false;
                                } else if (musicQueue.length > 0) {
                                    trackToPlay = musicQueue[0];
                                    DZ.player.playTracks([trackToPlay]);
                                }
                                $('.player-progress-bar').css('width', '0%');
                                $(QUEUE_CONTAINER).find('.active').removeClass('active').next('a').addClass('active');
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
        updateSongStartTime: function(trackKey, callback) {
            var startTime = new Date().getTime();
            $.put('/api/1/group/' + groupId + '/state/playtime', {
                trackId: trackKey,
                startTime: startTime
            }, function(data) {
                if (data.status) {
                    callback({
                        trackId: trackKey
                    });
                }
            });
        },
        restoreGroupState: function() {
            $.get('/api/1/group/' + groupId + '/fetch/current', function(data) {
                var currentGroup=data.message,
                    currentUserTime = new Date().getTime(),
                    songsInGroup = currentGroup.songsInGroup,
                    startTime,
                    songOffsetInSeconds,
                    currentSong = currentGroup.currentSong;
                if (songsInGroup.length > 0) {
                    musicQueue.length = 0;
                    for (var i = 0; i < songsInGroup.length; i++) {
                        if (songsInGroup[i].finished == true) {
                            player.addListItem(QUEUE_CONTAINER, songsInGroup[i].key, songsInGroup[i].name, false);
                        }
                    }
                    for (var j = 0; j < songsInGroup.length; j++) {
                        if (currentSong.key != null && songsInGroup[j].key == currentSong.key) {
                            startTime = new Date(songsInGroup[j].startTime).getTime();
                            songOffsetInSeconds = (currentUserTime - startTime) / 1000;
                            if (songOffsetInSeconds <= currentSong.duration) {
                                DZ.player.playTracks([songsInGroup[j].key], 0, songOffsetInSeconds);
                                musicQueue.push(songsInGroup[j].key);
                                player.addListItem(QUEUE_CONTAINER, currentSong.key, currentSong.name, true);
                            }

                        }
                        if (songsInGroup[j].finished == false && songsInGroup[j].key != currentSong.key) {
                            musicQueue.push(songsInGroup[j].key);
                            player.addListItem(QUEUE_CONTAINER, songsInGroup[j].key, songsInGroup[j].name, false);
                        }

                    }
                }
            });
        },
        addToGroupQueue: function(track, container, addToQueue) {
            var listItem = '<a href="#" class="list-group-item" id="' + track.key + '">' + track.name + '</a>',
                childrenLength = 0,
                trackToPlay;
            $.post('/api/1/group/' + track.groupId + '/state/preserve', track, function(data) {
                if (data.status) {
                    player.addListItem(QUEUE_CONTAINER, track.key, track.name, false);
                    musicQueue.push(track.key);
                    if (!isPlaying) {
                        DZ.player.playTracks([track.key]);
                        $(QUEUE_CONTAINER).find('#' + track.key).addClass('active');
                    }
                    socket.emit('songAdded', track);
                }
            });
        },
        songFinished: function(trackKey, callback) {
            $.put('/api/1/group/' + groupId + '/state/songFinished', {
                trackKey: trackKey
            }, function(data) {
                if (data.status) {
                    callback();
                }
            });
        },
        addListItem: function(container, trackKey, name, active, prepend) {
            var listItem = "";
            if (active) {
                listItem = '<a href="#" class="list-group-item queue-item active" id="' + trackKey + '">' + name + '</a>';
            } else {
                listItem = '<a href="#" class="list-group-item queue-item" id="' + trackKey + '">' + name + '</a>';
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
