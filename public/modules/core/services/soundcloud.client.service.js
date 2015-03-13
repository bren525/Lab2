'use strict';


angular.module('core').factory('soundcloud', ['$q',
    function($q){
        var factory = {};

        SC.initialize({
            client_id: 'eef9223028bfc7455de4df130e2bf612'
        });

        factory.fetchTracks = function(query){
            var fetchDeferred = $q.defer();
            SC.get('/tracks', {q:query}, function(tracks){
                fetchDeferred.resolve(tracks);
            });
            return fetchDeferred.promise;
        };

        factory.fetchWidget = function(soundsUrl){
            var widgetDeferred = $q.defer();
            var vw = window.innerWidth;
            var vh = window.innerHeight;

            SC.oEmbed(soundsUrl, {color:'ff0066',  maxheight:.125*vh + 'px', maxwidth:3*vw/4 - 30 + 'px'}, function (embed){
                $("#putTheWidgetHere").replaceWith(embed.html);
                var widgetElement = $('iframe')[0];
                widgetDeferred.resolve(SC.Widget(widgetElement));
            });
            return widgetDeferred.promise;
        };
        return factory;
    }
]);
