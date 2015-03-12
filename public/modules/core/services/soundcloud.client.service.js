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
            SC.oEmbed(soundsUrl, {color:'ff0066', maxheight:'120px', maxwidth:'1122px'},  document.getElementById('putTheWidgetHere'));
        };

        return factory;
    }
]);
