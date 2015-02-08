Uboxie.PlaybackModule = (function() {
    /**
     * Private variables for PlaybackModule
     *
     */
    var playbackContainer = null,
        QUEUE_CONTAINER = "#group-queue",
        isPlaying = false,
        currentSongDuration = 0,
        currentTrack = "",
        groupId = $('.group-container').data('group'),
        currentPosition = 0,
        restorePosition = 0,
        musicQueue = [],
        trackSeeked = false,
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
                //appId: '148831',
                channelUrl: 'http://localhost/channel',
                player: {
                    onload: player.playerOnloadCallback
                }
            });
        },
        /**
         * [playerOnloadCallback bind all main events on player load]
         *
         */
        playerOnloadCallback: function() {
            player.restoreGroupState();
            DZ.Event.subscribe('player_play', function(e) {
                console.log('Playing player');
                isPlaying = true;
                if (restorePosition && !trackSeeked) {
                    DZ.player.seek(parseInt(restorePosition, 10));
                    trackSeeked = true;
                }
            });
            DZ.Event.subscribe('current_track', function(trackInfo) {
                var track = null;
                console.log('evt curr track');
                if (currentTrack) {
                	console.log('evt if');
                    currentSongDuration = currentTrack.duration;
                    player.displaySongEnd('.player-song-end');
                    $(QUEUE_CONTAINER).trigger('reinit_scrollbar', QUEUE_CONTAINER);
                    player.updateSongStartTime(currentTrack._id, player.preserveSongState);
                }
            });
            DZ.Event.subscribe('track_end', function(position) {
                var trackToPlay = null;
                player.songFinished(currentTrack._id, function() {
                	console.log('S. finished');
                    if (musicQueue.length === 0) {
                        isPlaying = false;
                        trackToPlay = null;
                    } else if (musicQueue.length > 0) {
                        trackToPlay = musicQueue.shift();
                        currentTrack = trackToPlay;
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
            $(document).on('reinit_scrollbar', function(e, container) {
                Uboxie.Helpers.createDynamicScrollbar(container, '.active', {
                    height: '400px',
                    alwaysVisible: true,
                    size: '5px'
                });
            });
            $(document).on('click', '.player-progress', function() {
                DZ.player.seek(parseInt(restorePosition, 10));
            });
        },
        /**
         * [preserveSongState send AJAX request and save current song info]
         * @param  {Object} trackInfo [current track object]
         *
         */
        preserveSongState: function(trackInfo) {
            $.post('/api/1/group/' + groupId + '/state/current', trackInfo, function(data) {
            	console.log('current song');
            	console.log(trackInfo);
            	console.log(data);
                if (data.status) {
                    // socket.emit('songChanged', data.message);
                }
            });
        },
        /**
         * [updateSongStartTime send put request to update song start time]
         * @param  {String}   trackId  [id of current song]
         * @param  {Function} callback [Success callback function]
         */
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
        /**
         * [restoreGroupState fetch and restore current group state]
         */
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
                        if (songsInGroup[i].finished === true) {
                            player.addListItem(QUEUE_CONTAINER, songsInGroup[i]._id, songsInGroup[i], false);
                        }
                    }
                    for (var j = 0; j < songsInGroup.length; j++) {
                        if (currentSong._id !== null && songsInGroup[j]._id == currentSong._id) {
                            startTime = new Date(songsInGroup[j].startTime).getTime();
                            songOffsetInSeconds = (currentUserTime - startTime) / 1000;
                            if (songOffsetInSeconds <= currentSong.duration) {
                                currentTrack = songsInGroup[j];
                                restorePosition = Math.floor(100 * songOffsetInSeconds / currentSong.duration);
                                console.log(restorePosition);
                                DZ.player.playTracks([currentTrack.key], 0, parseInt(songOffsetInSeconds, 10));
                                player.addListItem(QUEUE_CONTAINER, currentSong._id, currentSong, true);
                            }
                        }
                        if (songsInGroup[j].finished === false && songsInGroup[j]._id != currentSong._id) {
                            musicQueue.push(songsInGroup[j]);
                            player.addListItem(QUEUE_CONTAINER, songsInGroup[j]._id, songsInGroup[j], false);
                        }
                    }
                }
            });
        },
        /**
         * [addToGroupQueue add selected track to group playing queue]
         * @param {Object} track      [Object containing selected track info]
         * @param {Object} container  [jQuery DOM object referencing queue container]
         * @param {boolean} addToQueue [Indicator of adding method]
         */
        addToGroupQueue: function(track, container, addToQueue) {
            var childrenLength = 0,
                trackToPlay;
            return $.post('/api/1/group/' + track.groupId + '/state/preserve', track);
        },
        updateGroupQueue: function(data) {
                if (data.status) {
                    musicQueue.push(data.message);
                    player.addListItem(QUEUE_CONTAINER, data.message._id, data.message, false);
                    if (!isPlaying) {
                        console.log('test');
                        currentTrack = musicQueue.shift();
                        console.log('current');
                        console.log(currentTrack);
                        DZ.player.playTracks([currentTrack.key]);
                        $(QUEUE_CONTAINER).find('#' + data.message._id).addClass('active');
                        console.log('added');
                    }
                    console.log(musicQueue);
                }
            },
            /**
             * [songFinished update song finished status]
             * @param  String   trackId  [Unique song id]
             * @param  {Function} callback [On success callback]
             *
             */
        songFinished: function(trackId, callback) {
            $.put('/api/1/group/' + groupId + '/state/songFinished', {
                trackId: trackId
            }, function(data) {
            	console.log('S.Finished data received');
                if (data.status) {
                	console.log('S. Finished data true');
                    callback();
                }
            });
        },
        /**
         * [addListItem add DOM search item to group playing queue]
         * @param String container [String representing DOM element]
         * @param String trackId   [Unique song id]
         * @param {Object} track     [Track info object]
         * @param Boolean active    [Indicator if current song is active]
         * @param Boolean prepend   [Indicator to add current song element on beginning of a list]
         */
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
            $(QUEUE_CONTAINER).trigger('reinit_scrollbar', QUEUE_CONTAINER);
        },
        /**
         * [displaySongEnd display song finish time]
         * @param  String container [String referencing DOM element]
         */
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
        /**
         * [displaySongEnd display current song duration]
         * @param  String container [String referencing DOM element]
         * @param  Integer position [Current position in seconds]
         */
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
