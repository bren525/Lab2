'use strict';


angular.module('core').factory('soundcloud', [
    function(){
        var factory = {};

        SC.initialize({
            client_id: 'eef9223028bfc7455de4df130e2bf612'
        });

        factory.fetchTracks = function(query){
            SC.get('/tracks', {q:query, license: 'cc-by-sa'}, function(tracks){
                console.log(tracks);
                return tracks;
            });
        };

        factory.fetchWidget = function(soundsUrl){
            SC.oEmbed(soundsUrl, {color:'ff0066'},  document.getElementById('putTheWidgetHere'));
        };
        return factory;
    }
]);
