'use strict';


angular.module('core').factory('soundcloud', ['$http, $q', function($http, $q){
    /* var factory = {};
    factory.fetchTrack = function(soundsUrl){
        deferred = $q.defer();
        $http.get(soundsUrl).success(function(success){
            angular.forEach(success,function(values,keys){
                var track = {src:values.stream_url+'?client_id={@= LET.client_id @}',title:values.title};
                playlist_object.push(track);
            });
            deferred.resolve(playlist_object);
        }).error(function(err){
            deferred.reject(err);
        });
    return deferred.promise;
    }
    return factory;
   */
    var factory = {};
    factory.fetchTracks = function(query){
        SC.get('/tracks', {q:query, license: 'cc-by-sa'}, function(tracks){
            console.log(tracks);
            return tracks
        })
    }

    factory.fetchTrack = function(soundsUrl){
        SC.oEmbed(soundsUrl, {color: "ff0066"},  document.getElementById("putTheWidgetHere"));
    }
}]);
