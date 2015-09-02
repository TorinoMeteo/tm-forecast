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

    window.addEvent('load', function() {
        parse();
    });

    /**
     * Parses the whole document finding tm tags
     */
    function parse() {
        for (var tag in tags) {
            var elems = $$(tag);
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

        var request = new Request.JSON({ 
            url: API_BASE_URL + path,
            method: 'get',
            onSuccess: function(data) {
                var date = new Date(data.date);
                var formatted_date = utils.toDateString(date, { show_year: false });
                var title = new Element('h1').set('text', 'Bollettino emesso {0}'.f(formatted_date));
                var text = new Element('div').set('html', data.pattern);

                var subsections = [];
                for (var i = 0, len = data.day_forecasts.length; i < len; i++) {
                    subsections.push(dayForecastElement(data.day_forecasts[i], {
                        container_tag: 'div',
                        title_level: 2,
                        title_tpl: '{0}'
                    }));
                }

                var section = new Element('section', { 'class': 'tmforecast' }).adopt(
                    title,
                    text,
                    subsections);

                section.replaces($(elem));
            }
        });
        delete request.headers['X-Requested-With'];
        delete request.headers['X-Request'];
        request.send();
    }

    /**
     * Renders a tmdayforecast tag
     * @param {Object} elem the tag element
     */
    function renderTmdayforecast(elem) {

        var date = $(elem).getProperty('tm-date');
        var path = '/forecast/day/{0}/'.f(date);

        var request = new Request.JSON({
            url: API_BASE_URL + path,
            method: 'get',
            onSuccess: function(data) {
                var section = dayForecastElement(data, {
                    container_tag: 'section',
                    title_level: 1,
                    title_tpl: 'Previsioni per il giorno {0}'
                });
                section.replaces($(elem));
            }
        });
        delete request.headers['X-Requested-With'];
        delete request.headers['X-Request'];
        request.send();
    }

    ////////// Common sub render functions

    function dayForecastElement(data, opts) {

        var container_tag = opts.container_tag;
        var title_level = opts.title_level;
        var title_tpl = opts.title_tpl;

        var date = new Date(data.date);
        var formatted_date = utils.toDateString(date, { show_year: false });
        var title = new Element('h' + title_level).set('text', title_tpl.f(formatted_date));
        var reliability = new Element('p', {'class': 'reliability reliability-' + data.reliability}).set('html', '<strong>Attendibilità</strong>: {0}%'.f(data.reliability));
        var img12 = new Element('figure', {'class': 'img12'}).adopt(
                new Element('img', { src: utils.absUrl(data.image12) }),
                new Element('figcaption').set('text', '00:00 - 12:00'));
        var img24 = new Element('figure', {'class': 'img24'}).adopt(
                new Element('img', { src: utils.absUrl(data.image24) }),
                new Element('figcaption').set('text', '12:00 - 24:00'));
        var weather = [
            new Element('h' + (title_level + 1), {'class': 'text'}).set('text', 'Tempo previsto'),
            new Element('div', {'class': 'text'}).set('html', data.text)
        ];
        var temperature = [
            new Element('h' + (title_level + 1), {'class': 'temperature'}).set('text', 'Temperature'),
            new Element('div', {'class': 'temperature'}).set('html', data.temperatures)
        ];
        var wind = [
            new Element('h' + (title_level + 1), {'class': 'wind'}).set('text', 'Venti'),
            new Element('div', {'class': 'wind'}).set('html', data.winds)
        ];
        var subsection = new Element(container_tag, { 'class': 'tmforecast-day' }).adopt(
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


})($);