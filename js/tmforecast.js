"use strict";

(function($) {

    ////////// Utils

    String.prototype.format = String.prototype.f = function() {
        var s = this,
        i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
        }
        return s;
    };

    ////////// Conf and Parse

    const API_BASE_URL = 'http://new.torinometeo.org/api/v1';
    const IMG_BASE_URL = 'http://new.torinometeo.org';
    var tags = {
        'tmforecast': renderTmforecast
    };

    $(document).ready(function() {
        parse();
    });

    /**
     * Parses the whole document finding tm tags
     */
    function parse() {
        for (var tag in tags) {
            var elems = $(tag);
            if (elems.length) {
                for (var i = 0, len = elems.length; i < len; i++) {
                    tags[tag](elems[i]);
                }
            }
        }
    }

    ////////// Render functions

    /**
     * Renders a tmforecast tag
     * @param {Object} elem the tag element
     */
    function renderTmforecast(elem) {

        var date = $(elem).attr('tm-date');
        var path = '/forecast/get-last/';

        $.getJSON(API_BASE_URL + path, function(data) {
            var date = new Date(data.date);
            var formatted_date = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
            var title = $('<h1/>').text('Bollettino emesso il {0}'.f(formatted_date));
            var text = $('<div/>').html(data.pattern);

            var subsections = [];
            for (var i = 0, len = data.day_forecasts.length; i < len; i++) {
                subsections.push(dayForecastElement(data.day_forecasts[i]));
            }

            var section = $('<section/>', { 'class': 'tmforecast' }).append(
                title,
                text,
                subsections);
            $(elem).replaceWith(section);

            function dayForecastElement(data) {
                var date = new Date(data.date);
                var formatted_date = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
                var title = $('<h2/>').text('{0} - attendibilità {1}%'.f(formatted_date, data.reliability));
                var img12 = $('<img/>', { src: IMG_BASE_URL + data.image12 });
                var img24 = $('<img/>', { src: IMG_BASE_URL + data.image24 });
                var weather = [
                    $('<h3/>').text('Tempo previsto'),
                    $('<div/>').html(data.text)
                ];
                var temperature = [
                    $('<h3/>').text('Temperature'),
                    $('<div/>').html(data.temperatures)
                ];
                var wind = [
                    $('<h3/>').text('Venti'),
                    $('<div/>').html(data.winds)
                ];
                var subsection = $('<div/>', { 'class': 'tmforecast-day' }).append(
                    title,
                    img12,
                    img24,
                    weather,
                    temperature,
                    wind
                );
                return subsection;
            }
        })
    }



})(jQuery);
