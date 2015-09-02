"use strict";

(function($) {

    ////////// Datetime Locales

    var days_dict = {
        'mon': 'lunedì',
        'tue': 'martedì',
        'wed': 'mercoledì',
        'thu': 'giovedì',
        'fri': 'venerdì',
        'sat': 'sabato',
        'sun': 'domenica'
    };

    var months_dict = {
        1: 'gennaio',
        2: 'febbraio',
        3: 'marzo',
        4: 'aprile',
        5: 'maggio',
        6: 'giugno',
        7: 'luglio',
        8: 'agosto',
        9: 'settembre',
        10: 'ottobre',
        11: 'novembre',
        12: 'dicembre'
    };

    ////////// Utils

    String.prototype.format = String.prototype.f = function() {
        var s = this,
        i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
        }
        return s;
    };

    var utils = {
        absUrl: function(url) {
            return /http/.test(url) ? url : IMG_BASE_URL + url;
        },
        /**
         * Returns a string representation of date
         * @param {Date} date
         * @return {String}
         */
        toDateString: function(date, opts) {
            var string_date = date.toDateString();
            var day_literal = string_date.replace(/ .*$/, '').toLowerCase();
            return opts.show_year
                ? '{0} {1} {2} {3}'.f(days_dict[day_literal], date.getDate(), months_dict[date.getMonth() + 1], date.getFullYear())
                : '{0} {1} {2}'.f(days_dict[day_literal], date.getDate(), months_dict[date.getMonth() + 1])
        }
    };

    ////////// Conf and Parse

    const API_BASE_URL = 'http://new.torinometeo.org/api/v1';
    const IMG_BASE_URL = 'http://new.torinometeo.org';
    var tags = {
        'tmforecast': renderTmforecast,
        'tmdayforecast': renderTmdayforecast
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

        var path = '/forecast/get-last/';

        $.getJSON(API_BASE_URL + path, function(data) {
            var date = new Date(data.date);
            var formatted_date = utils.toDateString(date, { show_year: false });
            var title = $('<h1/>').text('Bollettino emesso {0}'.f(formatted_date));
            var text = $('<div/>').html(data.pattern);

            var subsections = [];
            for (var i = 0, len = data.day_forecasts.length; i < len; i++) {
                subsections.push(dayForecastElement(data.day_forecasts[i], {
                    container_tag: 'div',
                    title_level: 2,
                    title_tpl: '{0}'
                }));
            }

            var section = $('<section/>', { 'class': 'tmforecast' }).append(
                title,
                text,
                subsections);
            $(elem).replaceWith(section);

        })
    }

    /**
     * Renders a tmdayforecast tag
     * @param {Object} elem the tag element
     */
    function renderTmdayforecast(elem) {

        var date = $(elem).attr('tm-date');
        var path = '/forecast/day/{0}/'.f(date);

        $.getJSON(API_BASE_URL + path, function(data) {
            var section = dayForecastElement(data, {
                container_tag: 'section',
                title_level: 1,
                title_tpl: 'Previsioni per il giorno {0}'
            });
            $(elem).replaceWith(section);
        })
    }

    ////////// Common sub render functions

    function dayForecastElement(data, opts) {

        var container_tag = opts.container_tag;
        var title_level = opts.title_level;
        var title_tpl = opts.title_tpl;

        var date = new Date(data.date);
        var formatted_date = utils.toDateString(date, { show_year: false });
        var title = $('<h' + title_level + '/>').text(title_tpl.f(formatted_date));
        var reliability = $('<p/>', {'class': 'reliability reliability-' + data.reliability}).html('<strong>Attendibilità</strong>: {0}%'.f(data.reliability));
        var img12 = $('<figure/>', {'class': 'img12'}).append(
                $('<img/>', { src: utils.absUrl(data.image12) }),
                $('<figcaption/>').text('00:00 - 12:00'));
        var img24 = $('<figure/>', {'class': 'img24'}).append(
                $('<img/>', { 'class': 'img24', src: utils.absUrl(data.image24) }),
                $('<figcaption/>').text('12:00 - 24:00'));
        var weather = [
            $('<h' + (title_level + 1) + '/>', {'class': 'text'}).text('Tempo previsto'),
            $('<div/>', {'class': 'text'}).html(data.text)
        ];
        var temperature = [
            $('<h' + (title_level + 1) + '/>', {'class': 'temperature'}).text('Temperature'),
            $('<div/>', {'class': 'temperature'}).html(data.temperatures)
        ];
        var wind = [
            $('<h' + (title_level + 1) + '/>', {'class': 'wind'}).text('Venti'),
            $('<div/>', {'class': 'wind'}).html(data.winds)
        ];
        var subsection = $('<' + container_tag + '/>', { 'class': 'tmforecast-day' }).append(
            title,
            reliability,
            img12,
            img24,
            weather,
            temperature,
            wind
        );
        return subsection;
    }


})(jQuery);
