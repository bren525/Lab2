'use strict';


angular.module('core').factory('soundcloud', ['$q',
    function($q){
        var fetchDeferred = $q.defer();

        var factory = {};

        SC.initialize({
            client_id: 'eef9223028bfc7455de4df130e2bf612'
        });

        factory.fetchTracks = function(query){
            SC.get('/tracks', {q:query, license: 'cc-by-sa'}, function(tracks){
                fetchDeferred.resolve(tracks);
            });
            return fetchDeferred.promise;
        };

        factory.fetchWidget = function(soundsUrl){
            var vw = window.innerWidth;
            var vh = window.innerHeight;

            SC.oEmbed(soundsUrl, {color:'ff0066', maxheight:.125*vh + 'px', maxwidth:3*vw/4 - 30 + 'px'},  document.getElementById('putTheWidgetHere'));
        };

        return factory;
    }
]);
