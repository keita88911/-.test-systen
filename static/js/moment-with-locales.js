//! moment.js
//! version : 2.9.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {
    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = '2.9.0',
        // the global-scope this is NOT the global object in Node.js
        globalScope = (typeof global !== 'undefined' && (typeof window === 'undefined' || window === global.window)) ? global : this,
        oldGlobalMoment,
        round = Math.round,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

        // internal storage for locale config files
        locales = {},

        // extra moment internal properties (plugins register props here)
        momentProperties = [],

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenOffsetMs = /[\+\-]?\d+/, // 1234567890123
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

        //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-', '15', '30']
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

        // format function strings
        formatFunctions = {},

        // default relative time thresholds
        relativeTimeThresholds = {
            s: 45,  // seconds to minute
            m: 45,  // minutes to hour
            h: 22,  // hours to day
            d: 26,  // days to month
            M: 11   // months to year
        },

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.localeData().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.localeData().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.localeData().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.localeData().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.localeData().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = this.utcOffset(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = this.utcOffset(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            x    : function () {
                return this.valueOf();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        deprecations = {},

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'],

        updateInProgress = false;

    // Pick the first defined of two or three arguments. dfl comes from
    // default.
    function dfl(a, b, c) {
        switch (arguments.length) {
            case 2: return a != null ? a : b;
            case 3: return a != null ? a : b != null ? b : c;
            default: throw new Error('Implement me');
        }
    }

    function hasOwnProp(a, b) {
        return hasOwnProperty.call(a, b);
    }

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function printMsg(msg) {
        if (moment.suppressDeprecationWarnings === false &&
                typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            if (firstTime) {
                printMsg(msg);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            printMsg(msg);
            deprecations[name] = true;
        }
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.localeData().ordinal(func.call(this, a), period);
        };
    }

    function monthDiff(a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        return -(wholeMonthDiff + adjust);
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // thie is not supposed to happen
            return hour;
        }
    }

    /************************************
        Constructors
    ************************************/

    function Locale() {
    }

    // Moment prototype object
    function Moment(config, skipOverflow) {
        if (skipOverflow !== false) {
            checkOverflow(config);
        }
        copyConfig(this, config);
        this._d = new Date(+config._d);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            moment.updateOffset(this);
            updateInProgress = false;
        }
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = moment.localeData();

        this._bubble();
    }

    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = from._pf;
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = makeAs(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = moment.duration(val, period);
            addOrSubtractDurationFromMoment(this, dur, direction);
            return this;
        };
    }

    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' ||
            input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment._locale[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment._locale, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                m._a[HOUR] < 0 || m._a[HOUR] > 24 ||
                    (m._a[HOUR] === 24 && (m._a[MINUTE] !== 0 ||
                                           m._a[SECOND] !== 0 ||
                                           m._a[MILLISECOND] !== 0)) ? HOUR :
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 &&
                !m._pf.empty &&
                !m._pf.invalidMonth &&
                !m._pf.nullInput &&
                !m._pf.invalidFormat &&
                !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0 &&
                    m._pf.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && hasModule) {
            try {
                oldLocale = moment.locale();
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // Return a moment from input, that is local/utc/utcOffset equivalent to
    // model.
    function makeAs(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (moment.isMoment(input) || isDate(input) ?
                    +input : +moment(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            moment.updateOffset(res, false);
            return res;
        } else {
            return moment(input).local();
        }
    }

    /************************************
        Locale
    ************************************/


    extend(Locale.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _ordinalParseLenient.
            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
        },

        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName, format, strict) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = moment.utc([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
                }
                if (!strict && !this._monthsParse[i]) {
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                    return i;
                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LTS : 'h:mm:ss A',
            LT : 'h:mm A',
            L : 'MM/DD/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM D, YYYY LT'
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },


        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom, now) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom, [now]) : output;
        },

        _relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },

        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },

        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace('%d', number);
        },
        _ordinal : '%d',
        _ordinalParse : /\d{1,2}/,

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        firstDayOfWeek : function () {
            return this._week.dow;
        },

        firstDayOfYear : function () {
            return this._week.doy;
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
        case 'Q':
            return parseTokenOneDigit;
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
        case 'GGGG':
        case 'gggg':
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
        case 'Y':
        case 'G':
        case 'g':
            return parseTokenSignedNumber;
        case 'YYYYYY':
        case 'YYYYY':
        case 'GGGGG':
        case 'ggggg':
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
        case 'S':
            if (strict) {
                return parseTokenOneDigit;
            }
            /* falls through */
        case 'SS':
            if (strict) {
                return parseTokenTwoDigits;
            }
            /* falls through */
        case 'SSS':
            if (strict) {
                return parseTokenThreeDigits;
            }
            /* falls through */
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return config._locale._meridiemParse;
        case 'x':
            return parseTokenOffsetMs;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'SSSS':
            return parseTokenDigits;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'GG':
        case 'gg':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'ww':
        case 'WW':
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
            return parseTokenOneOrTwoDigits;
        case 'Do':
            return strict ? config._locale._ordinalParse : config._locale._ordinalParseLenient;
        default :
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
            return a;
        }
    }

    function utcOffsetFromString(string) {
        string = string || '';
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // QUARTER
        case 'Q':
            if (input != null) {
                datePartArray[MONTH] = (toInt(input) - 1) * 3;
            }
            break;
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = config._locale.monthsParse(input, token, config._strict);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DD
        case 'DD' :
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;
        case 'Do' :
            if (input != null) {
                datePartArray[DATE] = toInt(parseInt(
                            input.match(/\d{1,2}/)[0], 10));
            }
            break;
        // DAY OF YEAR
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                config._dayOfYear = toInt(input);
            }

            break;
        // YEAR
        case 'YY' :
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;
        case 'YYYY' :
        case 'YYYYY' :
        case 'YYYYYY' :
            datePartArray[YEAR] = toInt(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._meridiem = input;
            // config._isPm = config._locale.isPM(input);
            break;
        // HOUR
        case 'h' : // fall through to hh
        case 'hh' :
            config._pf.bigHour = true;
            /* falls through */
        case 'H' : // fall through to HH
        case 'HH' :
            datePartArray[HOUR] = toInt(input);
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[MINUTE] = toInt(input);
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[SECOND] = toInt(input);
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
        case 'SSSS' :
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
            break;
        // UNIX OFFSET (MILLISECONDS)
        case 'x':
            config._d = new Date(toInt(input));
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = utcOffsetFromString(input);
            break;
        // WEEKDAY - human
        case 'dd':
        case 'ddd':
        case 'dddd':
            a = config._locale.weekdaysParse(input);
            // if we didn't get a weekday name, mark the date as invalid
            if (a != null) {
                config._w = config._w || {};
                config._w['d'] = a;
            } else {
                config._pf.invalidWeekday = input;
            }
            break;
        // WEEK, WEEK DAY - numeric
        case 'w':
        case 'ww':
        case 'W':
        case 'WW':
        case 'd':
        case 'e':
        case 'E':
            token = token.substr(0, 1);
            /* falls through */
        case 'gggg':
        case 'GGGG':
        case 'GGGGG':
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = toInt(input);
            }
            break;
        case 'gg':
        case 'GG':
            config._w = config._w || {};
            config._w[token] = moment.parseTwoDigitYear(input);
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day || normalizedInput.date,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._pf.bigHour === true && config._a[HOUR] <= 12) {
            config._pf.bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR],
                config._meridiem);
        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function parseISO(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be 'T' or undefined
                    config._f = isoDates[i][0] + (match[6] || ' ');
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += 'Z';
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function makeDateFromString(config) {
        parseISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function makeDateFromInput(config) {
        var input = config._i, matched;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            dateFromConfig(config);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, locale) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = locale.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = moment.duration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            years = round(duration.as('y')),

            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < relativeTimeThresholds.h && ['hh', hours] ||
                days === 1 && ['d'] ||
                days < relativeTimeThresholds.d && ['dd', days] ||
                months === 1 && ['M'] ||
                months < relativeTimeThresholds.M && ['MM', months] ||
                years === 1 && ['y'] || ['yy', years];

        args[2] = withoutSuffix;
        args[3] = +posNegDuration > 0;
        args[4] = locale;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        d = d === 0 ? 7 : d;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f,
            res;

        config._locale = config._locale || moment.localeData(config._l);

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (moment.isMoment(input)) {
            return new Moment(input, true);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        res = new Moment(config);
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    moment = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = locale;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return moment();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    moment.min = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    };

    moment.max = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    };

    // creating with utc
    moment.utc = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso,
            diffRes;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' &&
                ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // constant that refers to the ISO standard
    moment.ISO_8601 = function () {};

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function allows you to set a threshold for relative time strings
    moment.relativeTimeThreshold = function (threshold, limit) {
        if (relativeTimeThresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return relativeTimeThresholds[threshold];
        }
        relativeTimeThresholds[threshold] = limit;
        return true;
    };

    moment.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        function (key, value) {
            return moment.locale(key, value);
        }
    );

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    moment.locale = function (key, values) {
        var data;
        if (key) {
            if (typeof(values) !== 'undefined') {
                data = moment.defineLocale(key, values);
            }
            else {
                data = moment.localeData(key);
            }

            if (data) {
                moment.duration._locale = moment._locale = data;
            }
        }

        return moment._locale._abbr;
    };

    moment.defineLocale = function (name, values) {
        if (values !== null) {
            values.abbr = name;
            if (!locales[name]) {
                locales[name] = new Locale();
            }
            locales[name].set(values);

            // backwards compat for now: also set the locale
            moment.locale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    };

    moment.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        function (key) {
            return moment.localeData(key);
        }
    );

    // returns locale data
    moment.localeData = function (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return moment._locale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null && hasOwnProp(obj, '_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    moment.isDate = isDate;

    /************************************
        Moment Prototype
    ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d - ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                if ('function' === typeof Date.prototype.toISOString) {
                    // native implementation is ~50x faster, use it when we can
                    return this.toDate().toISOString();
                } else {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                }
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {
            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function (keepLocalTime) {
            return this.utcOffset(0, keepLocalTime);
        },

        local : function (keepLocalTime) {
            if (this._isUTC) {
                this.utcOffset(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.subtract(this._dateUtcOffset(), 'm');
                }
            }
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.localeData().postformat(output);
        },

        add : createAdder(1, 'add'),

        subtract : createAdder(-1, 'subtract'),

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (that.utcOffset() - this.utcOffset()) * 6e4,
                anchor, diff, output, daysAdjust;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month' || units === 'quarter') {
                output = monthDiff(this, that);
                if (units === 'quarter') {
                    output = output / 3;
                } else if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = this - that;
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function (time) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're locat/utc/offset
            // or not.
            var now = time || moment(),
                sod = makeAs(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.localeData().calendar(format, this, moment(now)));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.utcOffset() > this.clone().month(0).utcOffset() ||
                this.utcOffset() > this.clone().month(5).utcOffset());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf : function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond') {
                return this;
            }
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        },

        isAfter: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this > +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return inputMs < +this.clone().startOf(units);
            }
        },

        isBefore: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this < +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return +this.clone().endOf(units) < inputMs;
            }
        },

        isBetween: function (from, to, units) {
            return this.isAfter(from, units) && this.isBefore(to, units);
        },

        isSame: function (input, units) {
            var inputMs;
            units = normalizeUnits(units || 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this === +input;
            } else {
                inputMs = +moment(input);
                return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
            }
        },

        min: deprecate(
                 'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
                 function (other) {
                     other = moment.apply(null, arguments);
                     return other < this ? this : other;
                 }
         ),

        max: deprecate(
                'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
                function (other) {
                    other = moment.apply(null, arguments);
                    return other > this ? this : other;
                }
        ),

        zone : deprecate(
                'moment().zone is deprecated, use moment().utcOffset instead. ' +
                'https://github.com/moment/moment/issues/1779',
                function (input, keepLocalTime) {
                    if (input != null) {
                        if (typeof input !== 'string') {
                            input = -input;
                        }

                        this.utcOffset(input, keepLocalTime);

                        return this;
                    } else {
                        return -this.utcOffset();
                    }
                }
        ),

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        utcOffset : function (input, keepLocalTime) {
            var offset = this._offset || 0,
                localAdjust;
            if (input != null) {
                if (typeof input === 'string') {
                    input = utcOffsetFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = this._dateUtcOffset();
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.add(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                                moment.duration(input - offset, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }

                return this;
            } else {
                return this._isUTC ? offset : this._dateUtcOffset();
            }
        },

        isLocal : function () {
            return !this._isUTC;
        },

        isUtcOffset : function () {
            return this._isUTC;
        },

        isUtc : function () {
            return this._isUTC && this._offset === 0;
        },

        zoneAbbr : function () {
            return this._isUTC ? 'UTC' : '';
        },

        zoneName : function () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        },

        parseZone : function () {
            if (this._tzm) {
                this.utcOffset(this._tzm);
            } else if (typeof this._i === 'string') {
                this.utcOffset(utcOffsetFromString(this._i));
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).utcOffset();
            }

            return (this.utcOffset() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        week : function (input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            var unit;
            if (typeof units === 'object') {
                for (unit in units) {
                    this.set(unit, units[unit]);
                }
            }
            else {
                units = normalizeUnits(units);
                if (typeof this[units] === 'function') {
                    this[units](value);
                }
            }
            return this;
        },

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        locale : function (key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = moment.localeData(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        },

        lang : deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        ),

        localeData : function () {
            return this._locale;
        },

        _dateUtcOffset : function () {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return -Math.round(this._d.getTimezoneOffset() / 15) * 15;
        }

    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
                daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    // alias isUtc for dev-friendliness
    moment.fn.isUTC = moment.fn.isUtc;

    /************************************
        Duration Prototype
    ************************************/


    function daysToYears (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        return days * 400 / 146097;
    }

    function yearsToDays (years) {
        // years * 365 + absRound(years / 4) -
        //     absRound(years / 100) + absRound(years / 400);
        return years * 146097 / 400;
    }

    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years = 0;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);

            // Accurately convert days to years, assume start from year 0.
            years = absRound(daysToYears(days));
            days -= absRound(yearsToDays(years));

            // 30 days to a month
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
            months += absRound(days / 30);
            days %= 30;

            // 12 months -> 1 year
            years += absRound(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;
        },

        abs : function () {
            this._milliseconds = Math.abs(this._milliseconds);
            this._days = Math.abs(this._days);
            this._months = Math.abs(this._months);

            this._data.milliseconds = Math.abs(this._data.milliseconds);
            this._data.seconds = Math.abs(this._data.seconds);
            this._data.minutes = Math.abs(this._data.minutes);
            this._data.hours = Math.abs(this._data.hours);
            this._data.months = Math.abs(this._data.months);
            this._data.years = Math.abs(this._data.years);

            return this;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var output = relativeTime(this, !withSuffix, this.localeData());

            if (withSuffix) {
                output = this.localeData().pastFuture(+this, output);
            }

            return this.localeData().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            var days, months;
            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days = this._days + this._milliseconds / 864e5;
                months = this._months + daysToYears(days) * 12;
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(yearsToDays(this._months / 12));
                switch (units) {
                    case 'week': return days / 7 + this._milliseconds / 6048e5;
                    case 'day': return days + this._milliseconds / 864e5;
                    case 'hour': return days * 24 + this._milliseconds / 36e5;
                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;
                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        },

        lang : moment.fn.lang,
        locale : moment.fn.locale,

        toIsoString : deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead ' +
            '(notice the capitals)',
            function () {
                return this.toISOString();
            }
        ),

        toISOString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        },

        localeData : function () {
            return this._locale;
        },

        toJSON : function () {
            return this.toISOString();
        }
    });

    moment.duration.fn.toString = moment.duration.fn.toISOString;

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    for (i in unitMillisecondFactors) {
        if (hasOwnProp(unitMillisecondFactors, i)) {
            makeDurationGetter(i.toLowerCase());
        }
    }

    moment.duration.fn.asMilliseconds = function () {
        return this.as('ms');
    };
    moment.duration.fn.asSeconds = function () {
        return this.as('s');
    };
    moment.duration.fn.asMinutes = function () {
        return this.as('m');
    };
    moment.duration.fn.asHours = function () {
        return this.as('h');
    };
    moment.duration.fn.asDays = function () {
        return this.as('d');
    };
    moment.duration.fn.asWeeks = function () {
        return this.as('weeks');
    };
    moment.duration.fn.asMonths = function () {
        return this.as('M');
    };
    moment.duration.fn.asYears = function () {
        return this.as('y');
    };

    /************************************
        Default Locale
    ************************************/


    // Set default locale, other locale will inherit from English.
    moment.locale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // moment.js locale configuration
// locale : afrikaans (af)
// author : Werner Mollentze : https://github.com/wernerm

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('af', {
        months : 'Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des'.split('_'),
        weekdays : 'Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag'.split('_'),
        weekdaysShort : 'Son_Maa_Din_Woe_Don_Vry_Sat'.split('_'),
        weekdaysMin : 'So_Ma_Di_Wo_Do_Vr_Sa'.split('_'),
        meridiemParse: /vm|nm/i,
        isPM : function (input) {
            return /^nm$/i.test(input);
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower ? 'vm' : 'VM';
            } else {
                return isLower ? 'nm' : 'NM';
            }
        },
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Vandag om] LT',
            nextDay : '[M么re om] LT',
            nextWeek : 'dddd [om] LT',
            lastDay : '[Gister om] LT',
            lastWeek : '[Laas] dddd [om] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'oor %s',
            past : '%s gelede',
            s : '\'n paar sekondes',
            m : '\'n minuut',
            mm : '%d minute',
            h : '\'n uur',
            hh : '%d ure',
            d : '\'n dag',
            dd : '%d dae',
            M : '\'n maand',
            MM : '%d maande',
            y : '\'n jaar',
            yy : '%d jaar'
        },
        ordinalParse: /\d{1,2}(ste|de)/,
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de'); // Thanks to Joris R枚ling : https://github.com/jjupiter
        },
        week : {
            dow : 1, // Maandag is die eerste dag van die week.
            doy : 4  // Die week wat die 4de Januarie bevat is die eerste week van die jaar.
        }
    });
}));
// moment.js locale configuration
// locale : Moroccan Arabic (ar-ma)
// author : ElFadili Yassine : https://github.com/ElFadiliY
// author : Abdel Said : https://github.com/abdelsaid

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ar-ma', {
        months : '賷賳丕賷乇_賮亘乇丕賷乇_賲丕乇爻_兀亘乇賷賱_賲丕賷_賷賵賳賷賵_賷賵賱賷賵夭_睾卮鬲_卮鬲賳亘乇_兀賰鬲賵亘乇_賳賵賳亘乇_丿噩賳亘乇'.split('_'),
        monthsShort : '賷賳丕賷乇_賮亘乇丕賷乇_賲丕乇爻_兀亘乇賷賱_賲丕賷_賷賵賳賷賵_賷賵賱賷賵夭_睾卮鬲_卮鬲賳亘乇_兀賰鬲賵亘乇_賳賵賳亘乇_丿噩賳亘乇'.split('_'),
        weekdays : '丕賱兀丨丿_丕賱廿鬲賳賷賳_丕賱孬賱丕孬丕亍_丕賱兀乇亘毓丕亍_丕賱禺賲賷爻_丕賱噩賲毓丞_丕賱爻亘鬲'.split('_'),
        weekdaysShort : '丕丨丿_丕鬲賳賷賳_孬賱丕孬丕亍_丕乇亘毓丕亍_禺賲賷爻_噩賲毓丞_爻亘鬲'.split('_'),
        weekdaysMin : '丨_賳_孬_乇_禺_噩_爻'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[丕賱賷賵賲 毓賱賶 丕賱爻丕毓丞] LT',
            nextDay: '[睾丿丕 毓賱賶 丕賱爻丕毓丞] LT',
            nextWeek: 'dddd [毓賱賶 丕賱爻丕毓丞] LT',
            lastDay: '[兀賲爻 毓賱賶 丕賱爻丕毓丞] LT',
            lastWeek: 'dddd [毓賱賶 丕賱爻丕毓丞] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : '賮賷 %s',
            past : '賲賳匕 %s',
            s : '孬賵丕賳',
            m : '丿賯賷賯丞',
            mm : '%d 丿賯丕卅賯',
            h : '爻丕毓丞',
            hh : '%d 爻丕毓丕鬲',
            d : '賷賵賲',
            dd : '%d 兀賷丕賲',
            M : '卮賴乇',
            MM : '%d 兀卮賴乇',
            y : '爻賳丞',
            yy : '%d 爻賳賵丕鬲'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Arabic Saudi Arabia (ar-sa)
// author : Suhail Alkowaileet : https://github.com/xsoh

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '佟',
        '2': '佗',
        '3': '伲',
        '4': '伽',
        '5': '佶',
        '6': '佴',
        '7': '侑',
        '8': '侉',
        '9': '侃',
        '0': '贍'
    }, numberMap = {
        '佟': '1',
        '佗': '2',
        '伲': '3',
        '伽': '4',
        '佶': '5',
        '佴': '6',
        '侑': '7',
        '侉': '8',
        '侃': '9',
        '贍': '0'
    };

    return moment.defineLocale('ar-sa', {
        months : '賷賳丕賷乇_賮亘乇丕賷乇_賲丕乇爻_兀亘乇賷賱_賲丕賷賵_賷賵賳賷賵_賷賵賱賷賵_兀睾爻胤爻_爻亘鬲賲亘乇_兀賰鬲賵亘乇_賳賵賮賲亘乇_丿賷爻賲亘乇'.split('_'),
        monthsShort : '賷賳丕賷乇_賮亘乇丕賷乇_賲丕乇爻_兀亘乇賷賱_賲丕賷賵_賷賵賳賷賵_賷賵賱賷賵_兀睾爻胤爻_爻亘鬲賲亘乇_兀賰鬲賵亘乇_賳賵賮賲亘乇_丿賷爻賲亘乇'.split('_'),
        weekdays : '丕賱兀丨丿_丕賱廿孬賳賷賳_丕賱孬賱丕孬丕亍_丕賱兀乇亘毓丕亍_丕賱禺賲賷爻_丕賱噩賲毓丞_丕賱爻亘鬲'.split('_'),
        weekdaysShort : '兀丨丿_廿孬賳賷賳_孬賱丕孬丕亍_兀乇亘毓丕亍_禺賲賷爻_噩賲毓丞_爻亘鬲'.split('_'),
        weekdaysMin : '丨_賳_孬_乇_禺_噩_爻'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        meridiemParse: /氐|賲/,
        isPM : function (input) {
            return '賲' === input;
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return '氐';
            } else {
                return '賲';
            }
        },
        calendar : {
            sameDay: '[丕賱賷賵賲 毓賱賶 丕賱爻丕毓丞] LT',
            nextDay: '[睾丿丕 毓賱賶 丕賱爻丕毓丞] LT',
            nextWeek: 'dddd [毓賱賶 丕賱爻丕毓丞] LT',
            lastDay: '[兀賲爻 毓賱賶 丕賱爻丕毓丞] LT',
            lastWeek: 'dddd [毓賱賶 丕賱爻丕毓丞] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : '賮賷 %s',
            past : '賲賳匕 %s',
            s : '孬賵丕賳',
            m : '丿賯賷賯丞',
            mm : '%d 丿賯丕卅賯',
            h : '爻丕毓丞',
            hh : '%d 爻丕毓丕鬲',
            d : '賷賵賲',
            dd : '%d 兀賷丕賲',
            M : '卮賴乇',
            MM : '%d 兀卮賴乇',
            y : '爻賳丞',
            yy : '%d 爻賳賵丕鬲'
        },
        preparse: function (string) {
            return string.replace(/[佟佗伲伽佶佴侑侉侃贍]/g, function (match) {
                return numberMap[match];
            }).replace(/貙/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '貙');
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale  : Tunisian Arabic (ar-tn)

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ar-tn', {
        months: '噩丕賳賮賷_賮賷賮乇賷_賲丕乇爻_兀賮乇賷賱_賲丕賷_噩賵丕賳_噩賵賷賱賷丞_兀賵鬲_爻亘鬲賲亘乇_兀賰鬲賵亘乇_賳賵賮賲亘乇_丿賷爻賲亘乇'.split('_'),
        monthsShort: '噩丕賳賮賷_賮賷賮乇賷_賲丕乇爻_兀賮乇賷賱_賲丕賷_噩賵丕賳_噩賵賷賱賷丞_兀賵鬲_爻亘鬲賲亘乇_兀賰鬲賵亘乇_賳賵賮賲亘乇_丿賷爻賲亘乇'.split('_'),
        weekdays: '丕賱兀丨丿_丕賱廿孬賳賷賳_丕賱孬賱丕孬丕亍_丕賱兀乇亘毓丕亍_丕賱禺賲賷爻_丕賱噩賲毓丞_丕賱爻亘鬲'.split('_'),
        weekdaysShort: '兀丨丿_廿孬賳賷賳_孬賱丕孬丕亍_兀乇亘毓丕亍_禺賲賷爻_噩賲毓丞_爻亘鬲'.split('_'),
        weekdaysMin: '丨_賳_孬_乇_禺_噩_爻'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'LT:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[丕賱賷賵賲 毓賱賶 丕賱爻丕毓丞] LT',
            nextDay: '[睾丿丕 毓賱賶 丕賱爻丕毓丞] LT',
            nextWeek: 'dddd [毓賱賶 丕賱爻丕毓丞] LT',
            lastDay: '[兀賲爻 毓賱賶 丕賱爻丕毓丞] LT',
            lastWeek: 'dddd [毓賱賶 丕賱爻丕毓丞] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '賮賷 %s',
            past: '賲賳匕 %s',
            s: '孬賵丕賳',
            m: '丿賯賷賯丞',
            mm: '%d 丿賯丕卅賯',
            h: '爻丕毓丞',
            hh: '%d 爻丕毓丕鬲',
            d: '賷賵賲',
            dd: '%d 兀賷丕賲',
            M: '卮賴乇',
            MM: '%d 兀卮賴乇',
            y: '爻賳丞',
            yy: '%d 爻賳賵丕鬲'
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// Locale: Arabic (ar)
// Author: Abdel Said: https://github.com/abdelsaid
// Changes in months, weekdays: Ahmed Elkhatib
// Native plural forms: forabi https://github.com/forabi

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '佟',
        '2': '佗',
        '3': '伲',
        '4': '伽',
        '5': '佶',
        '6': '佴',
        '7': '侑',
        '8': '侉',
        '9': '侃',
        '0': '贍'
    }, numberMap = {
        '佟': '1',
        '佗': '2',
        '伲': '3',
        '伽': '4',
        '佶': '5',
        '佴': '6',
        '侑': '7',
        '侉': '8',
        '侃': '9',
        '贍': '0'
    }, pluralForm = function (n) {
        return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
    }, plurals = {
        s : ['兀賯賱 賲賳 孬丕賳賷丞', '孬丕賳賷丞 賵丕丨丿丞', ['孬丕賳賷鬲丕賳', '孬丕賳賷鬲賷賳'], '%d 孬賵丕賳', '%d 孬丕賳賷丞', '%d 孬丕賳賷丞'],
        m : ['兀賯賱 賲賳 丿賯賷賯丞', '丿賯賷賯丞 賵丕丨丿丞', ['丿賯賷賯鬲丕賳', '丿賯賷賯鬲賷賳'], '%d 丿賯丕卅賯', '%d 丿賯賷賯丞', '%d 丿賯賷賯丞'],
        h : ['兀賯賱 賲賳 爻丕毓丞', '爻丕毓丞 賵丕丨丿丞', ['爻丕毓鬲丕賳', '爻丕毓鬲賷賳'], '%d 爻丕毓丕鬲', '%d 爻丕毓丞', '%d 爻丕毓丞'],
        d : ['兀賯賱 賲賳 賷賵賲', '賷賵賲 賵丕丨丿', ['賷賵賲丕賳', '賷賵賲賷賳'], '%d 兀賷丕賲', '%d 賷賵賲賸丕', '%d 賷賵賲'],
        M : ['兀賯賱 賲賳 卮賴乇', '卮賴乇 賵丕丨丿', ['卮賴乇丕賳', '卮賴乇賷賳'], '%d 兀卮賴乇', '%d 卮賴乇丕', '%d 卮賴乇'],
        y : ['兀賯賱 賲賳 毓丕賲', '毓丕賲 賵丕丨丿', ['毓丕賲丕賳', '毓丕賲賷賳'], '%d 兀毓賵丕賲', '%d 毓丕賲賸丕', '%d 毓丕賲']
    }, pluralize = function (u) {
        return function (number, withoutSuffix, string, isFuture) {
            var f = pluralForm(number),
                str = plurals[u][pluralForm(number)];
            if (f === 2) {
                str = str[withoutSuffix ? 0 : 1];
            }
            return str.replace(/%d/i, number);
        };
    }, months = [
        '賰丕賳賵賳 丕賱孬丕賳賷 賷賳丕賷乇',
        '卮亘丕胤 賮亘乇丕賷乇',
        '丌匕丕乇 賲丕乇爻',
        '賳賷爻丕賳 兀亘乇賷賱',
        '兀賷丕乇 賲丕賷賵',
        '丨夭賷乇丕賳 賷賵賳賷賵',
        '鬲賲賵夭 賷賵賱賷賵',
        '丌亘 兀睾爻胤爻',
        '兀賷賱賵賱 爻亘鬲賲亘乇',
        '鬲卮乇賷賳 丕賱兀賵賱 兀賰鬲賵亘乇',
        '鬲卮乇賷賳 丕賱孬丕賳賷 賳賵賮賲亘乇',
        '賰丕賳賵賳 丕賱兀賵賱 丿賷爻賲亘乇'
    ];

    return moment.defineLocale('ar', {
        months : months,
        monthsShort : months,
        weekdays : '丕賱兀丨丿_丕賱廿孬賳賷賳_丕賱孬賱丕孬丕亍_丕賱兀乇亘毓丕亍_丕賱禺賲賷爻_丕賱噩賲毓丞_丕賱爻亘鬲'.split('_'),
        weekdaysShort : '兀丨丿_廿孬賳賷賳_孬賱丕孬丕亍_兀乇亘毓丕亍_禺賲賷爻_噩賲毓丞_爻亘鬲'.split('_'),
        weekdaysMin : '丨_賳_孬_乇_禺_噩_爻'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        meridiemParse: /氐|賲/,
        isPM : function (input) {
            return '賲' === input;
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return '氐';
            } else {
                return '賲';
            }
        },
        calendar : {
            sameDay: '[丕賱賷賵賲 毓賳丿 丕賱爻丕毓丞] LT',
            nextDay: '[睾丿賸丕 毓賳丿 丕賱爻丕毓丞] LT',
            nextWeek: 'dddd [毓賳丿 丕賱爻丕毓丞] LT',
            lastDay: '[兀賲爻 毓賳丿 丕賱爻丕毓丞] LT',
            lastWeek: 'dddd [毓賳丿 丕賱爻丕毓丞] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : '亘毓丿 %s',
            past : '賲賳匕 %s',
            s : pluralize('s'),
            m : pluralize('m'),
            mm : pluralize('m'),
            h : pluralize('h'),
            hh : pluralize('h'),
            d : pluralize('d'),
            dd : pluralize('d'),
            M : pluralize('M'),
            MM : pluralize('M'),
            y : pluralize('y'),
            yy : pluralize('y')
        },
        preparse: function (string) {
            return string.replace(/[佟佗伲伽佶佴侑侉侃贍]/g, function (match) {
                return numberMap[match];
            }).replace(/貙/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '貙');
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : azerbaijani (az)
// author : topchiyev : https://github.com/topchiyev

(function (factory) {
    factory(moment);
}(function (moment) {
    var suffixes = {
        1: '-inci',
        5: '-inci',
        8: '-inci',
        70: '-inci',
        80: '-inci',

        2: '-nci',
        7: '-nci',
        20: '-nci',
        50: '-nci',

        3: '-眉nc眉',
        4: '-眉nc眉',
        100: '-眉nc眉',

        6: '-nc谋',

        9: '-uncu',
        10: '-uncu',
        30: '-uncu',

        60: '-谋nc谋',
        90: '-谋nc谋'
    };
    return moment.defineLocale('az', {
        months : 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
        monthsShort : 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
        weekdays : 'Bazar_Bazar ert蓹si_脟蓹r艧蓹nb蓹 ax艧am谋_脟蓹r艧蓹nb蓹_C眉m蓹 ax艧am谋_C眉m蓹_艦蓹nb蓹'.split('_'),
        weekdaysShort : 'Baz_BzE_脟Ax_脟蓹r_CAx_C眉m_艦蓹n'.split('_'),
        weekdaysMin : 'Bz_BE_脟A_脟蓹_CA_C眉_艦蓹'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[bug眉n saat] LT',
            nextDay : '[sabah saat] LT',
            nextWeek : '[g蓹l蓹n h蓹ft蓹] dddd [saat] LT',
            lastDay : '[d眉n蓹n] LT',
            lastWeek : '[ke莽蓹n h蓹ft蓹] dddd [saat] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s sonra',
            past : '%s 蓹vv蓹l',
            s : 'birne莽蓹 saniyy蓹',
            m : 'bir d蓹qiq蓹',
            mm : '%d d蓹qiq蓹',
            h : 'bir saat',
            hh : '%d saat',
            d : 'bir g眉n',
            dd : '%d g眉n',
            M : 'bir ay',
            MM : '%d ay',
            y : 'bir il',
            yy : '%d il'
        },
        meridiemParse: /gec蓹|s蓹h蓹r|g眉nd眉z|ax艧am/,
        isPM : function (input) {
            return /^(g眉nd眉z|ax艧am)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return 'gec蓹';
            } else if (hour < 12) {
                return 's蓹h蓹r';
            } else if (hour < 17) {
                return 'g眉nd眉z';
            } else {
                return 'ax艧am';
            }
        },
        ordinalParse: /\d{1,2}-(谋nc谋|inci|nci|眉nc眉|nc谋|uncu)/,
        ordinal : function (number) {
            if (number === 0) {  // special case for zero
                return number + '-谋nc谋';
            }
            var a = number % 10,
                b = number % 100 - a,
                c = number >= 100 ? 100 : null;

            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : belarusian (be)
// author : Dmitry Demidov : https://github.com/demidov91
// author: Praleska: http://praleska.pro/
// Author : Menelion Elens煤le : https://github.com/Oire

(function (factory) {
    factory(moment);
}(function (moment) {
    function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }

    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': withoutSuffix ? '褏胁褨谢褨薪邪_褏胁褨谢褨薪褘_褏胁褨谢褨薪' : '褏胁褨谢褨薪褍_褏胁褨谢褨薪褘_褏胁褨谢褨薪',
            'hh': withoutSuffix ? '谐邪写蟹褨薪邪_谐邪写蟹褨薪褘_谐邪写蟹褨薪' : '谐邪写蟹褨薪褍_谐邪写蟹褨薪褘_谐邪写蟹褨薪',
            'dd': '写蟹械薪褜_写薪褨_写蟹褢薪',
            'MM': '屑械褋褟褑_屑械褋褟褑褘_屑械褋褟褑邪褳',
            'yy': '谐芯写_谐邪写褘_谐邪写芯褳'
        };
        if (key === 'm') {
            return withoutSuffix ? '褏胁褨谢褨薪邪' : '褏胁褨谢褨薪褍';
        }
        else if (key === 'h') {
            return withoutSuffix ? '谐邪写蟹褨薪邪' : '谐邪写蟹褨薪褍';
        }
        else {
            return number + ' ' + plural(format[key], +number);
        }
    }

    function monthsCaseReplace(m, format) {
        var months = {
            'nominative': '褋褌褍写蟹械薪褜_谢褞褌褘_褋邪泻邪胁褨泻_泻褉邪褋邪胁褨泻_褌褉邪胁械薪褜_褔褝褉胁械薪褜_谢褨锌械薪褜_卸薪褨胁械薪褜_胁械褉邪褋械薪褜_泻邪褋褌褉褘褔薪褨泻_谢褨褋褌邪锌邪写_褋薪械卸邪薪褜'.split('_'),
            'accusative': '褋褌褍写蟹械薪褟_谢褞褌邪谐邪_褋邪泻邪胁褨泻邪_泻褉邪褋邪胁褨泻邪_褌褉邪褳薪褟_褔褝褉胁械薪褟_谢褨锌械薪褟_卸薪褨褳薪褟_胁械褉邪褋薪褟_泻邪褋褌褉褘褔薪褨泻邪_谢褨褋褌邪锌邪写邪_褋薪械卸薪褟'.split('_')
        },

        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return months[nounCase][m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': '薪褟写蟹械谢褟_锌邪薪褟写蟹械谢邪泻_邪褳褌芯褉邪泻_褋械褉邪写邪_褔邪褑胁械褉_锌褟褌薪褨褑邪_褋褍斜芯褌邪'.split('_'),
            'accusative': '薪褟写蟹械谢褞_锌邪薪褟写蟹械谢邪泻_邪褳褌芯褉邪泻_褋械褉邪写褍_褔邪褑胁械褉_锌褟褌薪褨褑褍_褋褍斜芯褌褍'.split('_')
        },

        nounCase = (/\[ ?[袙胁] ?(?:屑褨薪褍谢褍褞|薪邪褋褌褍锌薪褍褞)? ?\] ?dddd/).test(format) ?
            'accusative' :
            'nominative';

        return weekdays[nounCase][m.day()];
    }

    return moment.defineLocale('be', {
        months : monthsCaseReplace,
        monthsShort : '褋褌褍写_谢褞褌_褋邪泻_泻褉邪褋_褌褉邪胁_褔褝褉胁_谢褨锌_卸薪褨胁_胁械褉_泻邪褋褌_谢褨褋褌_褋薪械卸'.split('_'),
        weekdays : weekdaysCaseReplace,
        weekdaysShort : '薪写_锌薪_邪褌_褋褉_褔褑_锌褌_褋斜'.split('_'),
        weekdaysMin : '薪写_锌薪_邪褌_褋褉_褔褑_锌褌_褋斜'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY 谐.',
            LLL : 'D MMMM YYYY 谐., LT',
            LLLL : 'dddd, D MMMM YYYY 谐., LT'
        },
        calendar : {
            sameDay: '[小褢薪薪褟 褳] LT',
            nextDay: '[袟邪褳褌褉邪 褳] LT',
            lastDay: '[校褔芯褉邪 褳] LT',
            nextWeek: function () {
                return '[校] dddd [褳] LT';
            },
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 5:
                case 6:
                    return '[校 屑褨薪褍谢褍褞] dddd [褳] LT';
                case 1:
                case 2:
                case 4:
                    return '[校 屑褨薪褍谢褘] dddd [褳] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : '锌褉邪蟹 %s',
            past : '%s 褌邪屑褍',
            s : '薪械泻邪谢褜泻褨 褋械泻褍薪写',
            m : relativeTimeWithPlural,
            mm : relativeTimeWithPlural,
            h : relativeTimeWithPlural,
            hh : relativeTimeWithPlural,
            d : '写蟹械薪褜',
            dd : relativeTimeWithPlural,
            M : '屑械褋褟褑',
            MM : relativeTimeWithPlural,
            y : '谐芯写',
            yy : relativeTimeWithPlural
        },
        meridiemParse: /薪芯褔褘|褉邪薪褨褑褘|写薪褟|胁械褔邪褉邪/,
        isPM : function (input) {
            return /^(写薪褟|胁械褔邪褉邪)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return '薪芯褔褘';
            } else if (hour < 12) {
                return '褉邪薪褨褑褘';
            } else if (hour < 17) {
                return '写薪褟';
            } else {
                return '胁械褔邪褉邪';
            }
        },

        ordinalParse: /\d{1,2}-(褨|褘|谐邪)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
            case 'w':
            case 'W':
                return (number % 10 === 2 || number % 10 === 3) && (number % 100 !== 12 && number % 100 !== 13) ? number + '-褨' : number + '-褘';
            case 'D':
                return number + '-谐邪';
            default:
                return number;
            }
        },

        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : bulgarian (bg)
// author : Krasen Borisov : https://github.com/kraz

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('bg', {
        months : '褟薪褍邪褉懈_褎械胁褉褍邪褉懈_屑邪褉褌_邪锌褉懈谢_屑邪泄_褞薪懈_褞谢懈_邪胁谐褍褋褌_褋械锌褌械屑胁褉懈_芯泻褌芯屑胁褉懈_薪芯械屑胁褉懈_写械泻械屑胁褉懈'.split('_'),
        monthsShort : '褟薪褉_褎械胁_屑邪褉_邪锌褉_屑邪泄_褞薪懈_褞谢懈_邪胁谐_褋械锌_芯泻褌_薪芯械_写械泻'.split('_'),
        weekdays : '薪械写械谢褟_锌芯薪械写械谢薪懈泻_胁褌芯褉薪懈泻_褋褉褟写邪_褔械褌胁褗褉褌褗泻_锌械褌褗泻_褋褗斜芯褌邪'.split('_'),
        weekdaysShort : '薪械写_锌芯薪_胁褌芯_褋褉褟_褔械褌_锌械褌_褋褗斜'.split('_'),
        weekdaysMin : '薪写_锌薪_胁褌_褋褉_褔褌_锌褌_褋斜'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'D.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[袛薪械褋 胁] LT',
            nextDay : '[校褌褉械 胁] LT',
            nextWeek : 'dddd [胁] LT',
            lastDay : '[袙褔械褉邪 胁] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[袙 懈蟹屑懈薪邪谢邪褌邪] dddd [胁] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[袙 懈蟹屑懈薪邪谢懈褟] dddd [胁] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : '褋谢械写 %s',
            past : '锌褉械写懈 %s',
            s : '薪褟泻芯谢泻芯 褋械泻褍薪写懈',
            m : '屑懈薪褍褌邪',
            mm : '%d 屑懈薪褍褌懈',
            h : '褔邪褋',
            hh : '%d 褔邪褋邪',
            d : '写械薪',
            dd : '%d 写薪懈',
            M : '屑械褋械褑',
            MM : '%d 屑械褋械褑邪',
            y : '谐芯写懈薪邪',
            yy : '%d 谐芯写懈薪懈'
        },
        ordinalParse: /\d{1,2}-(械胁|械薪|褌懈|胁懈|褉懈|屑懈)/,
        ordinal : function (number) {
            var lastDigit = number % 10,
                last2Digits = number % 100;
            if (number === 0) {
                return number + '-械胁';
            } else if (last2Digits === 0) {
                return number + '-械薪';
            } else if (last2Digits > 10 && last2Digits < 20) {
                return number + '-褌懈';
            } else if (lastDigit === 1) {
                return number + '-胁懈';
            } else if (lastDigit === 2) {
                return number + '-褉懈';
            } else if (lastDigit === 7 || lastDigit === 8) {
                return number + '-屑懈';
            } else {
                return number + '-褌懈';
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Bengali (bn)
// author : Kaushik Gandhi : https://github.com/kaushikgandhi

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '唰�',
        '2': '唰�',
        '3': '唰�',
        '4': '唰�',
        '5': '唰�',
        '6': '唰�',
        '7': '唰�',
        '8': '唰�',
        '9': '唰�',
        '0': '唰�'
    },
    numberMap = {
        '唰�': '1',
        '唰�': '2',
        '唰�': '3',
        '唰�': '4',
        '唰�': '5',
        '唰�': '6',
        '唰�': '7',
        '唰�': '8',
        '唰�': '9',
        '唰�': '0'
    };

    return moment.defineLocale('bn', {
        months : '唳溹唳ㄠ唰熰唳班_唳唳唰熰唳班_唳唳班唳歘唳忇Κ唰嵿Π唳苦Σ_唳_唳溹唳╛唳溹唳侧唳嘷唳呧唳距Ω唰嵿_唳膏唳唳熰唳唳Π_唳呧唰嵿唰嬥Μ唳癬唳ㄠΝ唰囙Ξ唰嵿Μ唳癬唳∴唳膏唳唳Π'.split('_'),
        monthsShort : '唳溹唳ㄠ_唳唳琠唳唳班唳歘唳忇Κ唳癬唳_唳溹唳╛唳溹唳瞋唳呧_唳膏唳唳焈唳呧唰嵿唰媉唳ㄠΝ_唳∴唳膏唳'.split('_'),
        weekdays : '唳班Μ唳苦Μ唳距Π_唳膏唳Μ唳距Π_唳唰嵿唳侧Μ唳距Π_唳唳оΜ唳距Π_唳唳灌Ω唰嵿Κ唳む唳む唳唳癬唳多唳曕唳班唳唳癬唳多Θ唳苦Μ唳距Π'.split('_'),
        weekdaysShort : '唳班Μ唳縚唳膏唳甠唳唰嵿唳瞋唳唳唳唳灌Ω唰嵿Κ唳む唳む_唳多唳曕唳班_唳多Θ唳�'.split('_'),
        weekdaysMin : '唳班Μ_唳膏Ξ_唳唰嵿_唳_唳唳班唳筥唳多_唳多Θ唳�'.split('_'),
        longDateFormat : {
            LT : 'A h:mm 唳膏Ξ唰�',
            LTS : 'A h:mm:ss 唳膏Ξ唰�',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[唳嗋] LT',
            nextDay : '[唳嗋唳距Ξ唰€唳曕唳瞉 LT',
            nextWeek : 'dddd, LT',
            lastDay : '[唳椸Δ唳曕唳瞉 LT',
            lastWeek : '[唳椸Δ] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s 唳Π唰�',
            past : '%s 唳嗋唰�',
            s : '唳曕唳� 唳膏唳曕唳ㄠ唳�',
            m : '唳忇 唳唳ㄠ唳�',
            mm : '%d 唳唳ㄠ唳�',
            h : '唳忇 唳樴Θ唰嵿唳�',
            hh : '%d 唳樴Θ唰嵿唳�',
            d : '唳忇 唳︵唳�',
            dd : '%d 唳︵唳�',
            M : '唳忇 唳唳�',
            MM : '%d 唳唳�',
            y : '唳忇 唳唳�',
            yy : '%d 唳唳�'
        },
        preparse: function (string) {
            return string.replace(/[唰оЖ唰┼И唰К唰М唰Е]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiemParse: /唳班唳唳多唳距Σ|唳︵唳唳皘唳唳曕唳瞸唳班唳�/,
        isPM: function (input) {
            return /^(唳︵唳唳皘唳唳曕唳瞸唳班唳�)$/.test(input);
        },
        //Bengali is a vast language its spoken
        //in different forms in various parts of the world.
        //I have just generalized with most common one used
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return '唳班唳�';
            } else if (hour < 10) {
                return '唳多唳距Σ';
            } else if (hour < 17) {
                return '唳︵唳唳�';
            } else if (hour < 20) {
                return '唳唳曕唳�';
            } else {
                return '唳班唳�';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : tibetan (bo)
// author : Thupten N. Chakrishar : https://github.com/vajradog

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '嗉�',
        '2': '嗉�',
        '3': '嗉�',
        '4': '嗉�',
        '5': '嗉�',
        '6': '嗉�',
        '7': '嗉�',
        '8': '嗉�',
        '9': '嗉�',
        '0': '嗉�'
    },
    numberMap = {
        '嗉�': '1',
        '嗉�': '2',
        '嗉�': '3',
        '嗉�': '4',
        '嗉�': '5',
        '嗉�': '6',
        '嗉�': '7',
        '嗉�': '8',
        '嗉�': '9',
        '嗉�': '0'
    };

    return moment.defineLocale('bo', {
        months : '嘟熰境嗉嬥綎嗉嬥綉嘟勦紜嘟斷郊_嘟熰境嗉嬥綎嗉嬥絺嘟夃讲嘟︵紜嘟擾嘟熰境嗉嬥綎嗉嬥絺嘟︵酱嘟樴紜嘟擾嘟熰境嗉嬥綎嗉嬥綎嘟炧讲嗉嬥綌_嘟熰境嗉嬥綎嗉嬥剑嗑斷紜嘟擾嘟熰境嗉嬥綎嗉嬥綉嗑侧酱嘟傕紜嘟擾嘟熰境嗉嬥綎嗉嬥綎嘟戉酱嘟撪紜嘟擾嘟熰境嗉嬥綎嗉嬥綎嘟⑧緬嗑编綉嗉嬥綌_嘟熰境嗉嬥綎嗉嬥綉嘟傕酱嗉嬥綌_嘟熰境嗉嬥綎嗉嬥綎嘟呧酱嗉嬥綌_嘟熰境嗉嬥綎嗉嬥綎嘟呧酱嗉嬥絺嘟呧讲嘟傕紜嘟擾嘟熰境嗉嬥綎嗉嬥綎嘟呧酱嗉嬥絺嘟夃讲嘟︵紜嘟�'.split('_'),
        monthsShort : '嘟熰境嗉嬥綎嗉嬥綉嘟勦紜嘟斷郊_嘟熰境嗉嬥綎嗉嬥絺嘟夃讲嘟︵紜嘟擾嘟熰境嗉嬥綎嗉嬥絺嘟︵酱嘟樴紜嘟擾嘟熰境嗉嬥綎嗉嬥綎嘟炧讲嗉嬥綌_嘟熰境嗉嬥綎嗉嬥剑嗑斷紜嘟擾嘟熰境嗉嬥綎嗉嬥綉嗑侧酱嘟傕紜嘟擾嘟熰境嗉嬥綎嗉嬥綎嘟戉酱嘟撪紜嘟擾嘟熰境嗉嬥綎嗉嬥綎嘟⑧緬嗑编綉嗉嬥綌_嘟熰境嗉嬥綎嗉嬥綉嘟傕酱嗉嬥綌_嘟熰境嗉嬥綎嗉嬥綎嘟呧酱嗉嬥綌_嘟熰境嗉嬥綎嗉嬥綎嘟呧酱嗉嬥絺嘟呧讲嘟傕紜嘟擾嘟熰境嗉嬥綎嗉嬥綎嘟呧酱嗉嬥絺嘟夃讲嘟︵紜嘟�'.split('_'),
        weekdays : '嘟傕綗嘟犩紜嘟夃讲嗉嬥綐嗉媉嘟傕綗嘟犩紜嘟熰境嗉嬥綎嗉媉嘟傕綗嘟犩紜嘟樴讲嘟傕紜嘟戉綐嘟⑧紜_嘟傕綗嘟犩紜嘟｀痉嘟傕紜嘟斷紜_嘟傕綗嘟犩紜嘟曕酱嘟⑧紜嘟栢酱_嘟傕綗嘟犩紜嘟斷紜嘟︵絼嘟︵紜_嘟傕綗嘟犩紜嘟︵兢嘟亨綋嗉嬥綌嗉�'.split('_'),
        weekdaysShort : '嘟夃讲嗉嬥綐嗉媉嘟熰境嗉嬥綎嗉媉嘟樴讲嘟傕紜嘟戉綐嘟⑧紜_嘟｀痉嘟傕紜嘟斷紜_嘟曕酱嘟⑧紜嘟栢酱_嘟斷紜嘟︵絼嘟︵紜_嘟︵兢嘟亨綋嗉嬥綌嗉�'.split('_'),
        weekdaysMin : '嘟夃讲嗉嬥綐嗉媉嘟熰境嗉嬥綎嗉媉嘟樴讲嘟傕紜嘟戉綐嘟⑧紜_嘟｀痉嘟傕紜嘟斷紜_嘟曕酱嘟⑧紜嘟栢酱_嘟斷紜嘟︵絼嘟︵紜_嘟︵兢嘟亨綋嗉嬥綌嗉�'.split('_'),
        longDateFormat : {
            LT : 'A h:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[嘟戉讲嗉嬥舰嘟侧絼] LT',
            nextDay : '[嘟︵絼嗉嬥綁嘟侧綋] LT',
            nextWeek : '[嘟栢綉嘟脆綋嗉嬥綍嗑侧絺嗉嬥舰嗑椸胶嘟︵紜嘟榏, LT',
            lastDay : '[嘟佮紜嘟︵絼] LT',
            lastWeek : '[嘟栢綉嘟脆綋嗉嬥綍嗑侧絺嗉嬥綐嘟愢綘嗉嬥綐] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s 嘟｀紜',
            past : '%s 嘟︵緮嘟撪紜嘟�',
            s : '嘟｀綐嗉嬥溅嘟�',
            m : '嘟︵緪嘟⑧紜嘟樴紜嘟傕絽嘟侧絺',
            mm : '%d 嘟︵緪嘟⑧紜嘟�',
            h : '嘟嗋酱嗉嬥綒嘟监綉嗉嬥絺嘟呧讲嘟�',
            hh : '%d 嘟嗋酱嗉嬥綒嘟监綉',
            d : '嘟夃讲嘟撪紜嘟傕絽嘟侧絺',
            dd : '%d 嘟夃讲嘟撪紜',
            M : '嘟熰境嗉嬥綎嗉嬥絺嘟呧讲嘟�',
            MM : '%d 嘟熰境嗉嬥綎',
            y : '嘟｀郊嗉嬥絺嘟呧讲嘟�',
            yy : '%d 嘟｀郊'
        },
        preparse: function (string) {
            return string.replace(/[嗉∴饥嗉｀激嗉ム鸡嗉о绩嗉┼紶]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiemParse: /嘟樴綒嘟撪紜嘟樴郊|嘟炧郊嘟傕溅嗉嬥絸嘟嘟夃讲嘟撪紜嘟傕酱嘟剕嘟戉絺嘟监絼嗉嬥綉嘟倈嘟樴綒嘟撪紜嘟樴郊/,
        isPM: function (input) {
            return /^(嘟夃讲嘟撪紜嘟傕酱嘟剕嘟戉絺嘟监絼嗉嬥綉嘟倈嘟樴綒嘟撪紜嘟樴郊)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return '嘟樴綒嘟撪紜嘟樴郊';
            } else if (hour < 10) {
                return '嘟炧郊嘟傕溅嗉嬥絸嘟�';
            } else if (hour < 17) {
                return '嘟夃讲嘟撪紜嘟傕酱嘟�';
            } else if (hour < 20) {
                return '嘟戉絺嘟监絼嗉嬥綉嘟�';
            } else {
                return '嘟樴綒嘟撪紜嘟樴郊';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : breton (br)
// author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou

(function (factory) {
    factory(moment);
}(function (moment) {
    function relativeTimeWithMutation(number, withoutSuffix, key) {
        var format = {
            'mm': 'munutenn',
            'MM': 'miz',
            'dd': 'devezh'
        };
        return number + ' ' + mutation(format[key], number);
    }

    function specialMutationForYears(number) {
        switch (lastNumber(number)) {
        case 1:
        case 3:
        case 4:
        case 5:
        case 9:
            return number + ' bloaz';
        default:
            return number + ' vloaz';
        }
    }

    function lastNumber(number) {
        if (number > 9) {
            return lastNumber(number % 10);
        }
        return number;
    }

    function mutation(text, number) {
        if (number === 2) {
            return softMutation(text);
        }
        return text;
    }

    function softMutation(text) {
        var mutationTable = {
            'm': 'v',
            'b': 'v',
            'd': 'z'
        };
        if (mutationTable[text.charAt(0)] === undefined) {
            return text;
        }
        return mutationTable[text.charAt(0)] + text.substring(1);
    }

    return moment.defineLocale('br', {
        months : 'Genver_C\'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu'.split('_'),
        monthsShort : 'Gen_C\'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker'.split('_'),
        weekdays : 'Sul_Lun_Meurzh_Merc\'her_Yaou_Gwener_Sadorn'.split('_'),
        weekdaysShort : 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
        weekdaysMin : 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
        longDateFormat : {
            LT : 'h[e]mm A',
            LTS : 'h[e]mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D [a viz] MMMM YYYY',
            LLL : 'D [a viz] MMMM YYYY LT',
            LLLL : 'dddd, D [a viz] MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Hiziv da] LT',
            nextDay : '[Warc\'hoazh da] LT',
            nextWeek : 'dddd [da] LT',
            lastDay : '[Dec\'h da] LT',
            lastWeek : 'dddd [paset da] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'a-benn %s',
            past : '%s \'zo',
            s : 'un nebeud segondenno霉',
            m : 'ur vunutenn',
            mm : relativeTimeWithMutation,
            h : 'un eur',
            hh : '%d eur',
            d : 'un devezh',
            dd : relativeTimeWithMutation,
            M : 'ur miz',
            MM : relativeTimeWithMutation,
            y : 'ur bloaz',
            yy : specialMutationForYears
        },
        ordinalParse: /\d{1,2}(a帽|vet)/,
        ordinal : function (number) {
            var output = (number === 1) ? 'a帽' : 'vet';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : bosnian (bs)
// author : Nedim Cholich : https://github.com/frontyard
// based on (hr) translation by Bojan Markovi膰

(function (factory) {
    factory(moment);
}(function (moment) {
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }

    return moment.defineLocale('bs', {
        months : 'januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar'.split('_'),
        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.'.split('_'),
        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_膷etvrtak_petak_subota'.split('_'),
        weekdaysShort : 'ned._pon._uto._sri._膷et._pet._sub.'.split('_'),
        weekdaysMin : 'ne_po_ut_sr_膷e_pe_su'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay  : '[danas u] LT',
            nextDay  : '[sutra u] LT',

            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[ju膷er u] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                    return '[pro拧lu] dddd [u] LT';
                case 6:
                    return '[pro拧le] [subote] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[pro拧li] dddd [u] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'prije %s',
            s      : 'par sekundi',
            m      : translate,
            mm     : translate,
            h      : translate,
            hh     : translate,
            d      : 'dan',
            dd     : translate,
            M      : 'mjesec',
            MM     : translate,
            y      : 'godinu',
            yy     : translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : catalan (ca)
// author : Juan G. Hurtado : https://github.com/juanghurtado

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ca', {
        months : 'gener_febrer_mar莽_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split('_'),
        monthsShort : 'gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.'.split('_'),
        weekdays : 'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split('_'),
        weekdaysShort : 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
        weekdaysMin : 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay : function () {
                return '[avui a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            nextDay : function () {
                return '[dem脿 a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            lastDay : function () {
                return '[ahir a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            lastWeek : function () {
                return '[el] dddd [passat a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'en %s',
            past : 'fa %s',
            s : 'uns segons',
            m : 'un minut',
            mm : '%d minuts',
            h : 'una hora',
            hh : '%d hores',
            d : 'un dia',
            dd : '%d dies',
            M : 'un mes',
            MM : '%d mesos',
            y : 'un any',
            yy : '%d anys'
        },
        ordinalParse: /\d{1,2}(r|n|t|猫|a)/,
        ordinal : function (number, period) {
            var output = (number === 1) ? 'r' :
                (number === 2) ? 'n' :
                (number === 3) ? 'r' :
                (number === 4) ? 't' : '猫';
            if (period === 'w' || period === 'W') {
                output = 'a';
            }
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : czech (cs)
// author : petrbela : https://github.com/petrbela

(function (factory) {
    factory(moment);
}(function (moment) {
    var months = 'leden_煤nor_b艡ezen_duben_kv臎ten_膷erven_膷ervenec_srpen_z谩艡铆_艡铆jen_listopad_prosinec'.split('_'),
        monthsShort = 'led_煤no_b艡e_dub_kv臎_膷vn_膷vc_srp_z谩艡_艡铆j_lis_pro'.split('_');

    function plural(n) {
        return (n > 1) && (n < 5) && (~~(n / 10) !== 1);
    }

    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':  // a few seconds / in a few seconds / a few seconds ago
            return (withoutSuffix || isFuture) ? 'p谩r sekund' : 'p谩r sekundami';
        case 'm':  // a minute / in a minute / a minute ago
            return withoutSuffix ? 'minuta' : (isFuture ? 'minutu' : 'minutou');
        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'minuty' : 'minut');
            } else {
                return result + 'minutami';
            }
            break;
        case 'h':  // an hour / in an hour / an hour ago
            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
        case 'hh': // 9 hours / in 9 hours / 9 hours ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'hodiny' : 'hodin');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':  // a day / in a day / a day ago
            return (withoutSuffix || isFuture) ? 'den' : 'dnem';
        case 'dd': // 9 days / in 9 days / 9 days ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'dny' : 'dn铆');
            } else {
                return result + 'dny';
            }
            break;
        case 'M':  // a month / in a month / a month ago
            return (withoutSuffix || isFuture) ? 'm臎s铆c' : 'm臎s铆cem';
        case 'MM': // 9 months / in 9 months / 9 months ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'm臎s铆ce' : 'm臎s铆c暖');
            } else {
                return result + 'm臎s铆ci';
            }
            break;
        case 'y':  // a year / in a year / a year ago
            return (withoutSuffix || isFuture) ? 'rok' : 'rokem';
        case 'yy': // 9 years / in 9 years / 9 years ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'roky' : 'let');
            } else {
                return result + 'lety';
            }
            break;
        }
    }

    return moment.defineLocale('cs', {
        months : months,
        monthsShort : monthsShort,
        monthsParse : (function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                // use custom parser to solve problem with July (膷ervenec)
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(months, monthsShort)),
        weekdays : 'ned臎le_pond臎l铆_煤ter媒_st艡eda_膷tvrtek_p谩tek_sobota'.split('_'),
        weekdaysShort : 'ne_po_煤t_st_膷t_p谩_so'.split('_'),
        weekdaysMin : 'ne_po_煤t_st_膷t_p谩_so'.split('_'),
        longDateFormat : {
            LT: 'H:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd D. MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[dnes v] LT',
            nextDay: '[z铆tra v] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v ned臎li v] LT';
                case 1:
                case 2:
                    return '[v] dddd [v] LT';
                case 3:
                    return '[ve st艡edu v] LT';
                case 4:
                    return '[ve 膷tvrtek v] LT';
                case 5:
                    return '[v p谩tek v] LT';
                case 6:
                    return '[v sobotu v] LT';
                }
            },
            lastDay: '[v膷era v] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minulou ned臎li v] LT';
                case 1:
                case 2:
                    return '[minul茅] dddd [v] LT';
                case 3:
                    return '[minulou st艡edu v] LT';
                case 4:
                case 5:
                    return '[minul媒] dddd [v] LT';
                case 6:
                    return '[minulou sobotu v] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : 'p艡ed %s',
            s : translate,
            m : translate,
            mm : translate,
            h : translate,
            hh : translate,
            d : translate,
            dd : translate,
            M : translate,
            MM : translate,
            y : translate,
            yy : translate
        },
        ordinalParse : /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : chuvash (cv)
// author : Anatoly Mironov : https://github.com/mirontoli

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('cv', {
        months : '泻膬褉谢邪褔_薪邪褉膬褋_锌褍褕_邪泻邪_屑邪泄_莽臅褉褌屑械_褍褌膬_莽褍褉谢邪_邪胁膬薪_褞锌邪_褔映泻_褉邪褕褌邪胁'.split('_'),
        monthsShort : '泻膬褉_薪邪褉_锌褍褕_邪泻邪_屑邪泄_莽臅褉_褍褌膬_莽褍褉_邪胁_褞锌邪_褔映泻_褉邪褕'.split('_'),
        weekdays : '胁褘褉褋邪褉薪懈泻褍薪_褌褍薪褌懈泻褍薪_褘褌谢邪褉懈泻褍薪_褞薪泻褍薪_泻臅莽薪械褉薪懈泻褍薪_褝褉薪械泻褍薪_褕膬屑邪褌泻褍薪'.split('_'),
        weekdaysShort : '胁褘褉_褌褍薪_褘褌谢_褞薪_泻臅莽_褝褉薪_褕膬屑'.split('_'),
        weekdaysMin : '胁褉_褌薪_褘褌_褞薪_泻莽_褝褉_褕屑'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD-MM-YYYY',
            LL : 'YYYY [莽褍谢褏懈] MMMM [褍泄膬褏臅薪] D[-屑臅褕臅]',
            LLL : 'YYYY [莽褍谢褏懈] MMMM [褍泄膬褏臅薪] D[-屑臅褕臅], LT',
            LLLL : 'dddd, YYYY [莽褍谢褏懈] MMMM [褍泄膬褏臅薪] D[-屑臅褕臅], LT'
        },
        calendar : {
            sameDay: '[袩邪褟薪] LT [褋械褏械褌褉械]',
            nextDay: '[蝎褉邪薪] LT [褋械褏械褌褉械]',
            lastDay: '[臄薪械褉] LT [褋械褏械褌褉械]',
            nextWeek: '[脟懈褌械褋] dddd LT [褋械褏械褌褉械]',
            lastWeek: '[袠褉褌薪臅] dddd LT [褋械褏械褌褉械]',
            sameElse: 'L'
        },
        relativeTime : {
            future : function (output) {
                var affix = /褋械褏械褌$/i.exec(output) ? '褉械薪' : /莽褍谢$/i.exec(output) ? '褌邪薪' : '褉邪薪';
                return output + affix;
            },
            past : '%s 泻邪褟谢谢邪',
            s : '锌臅褉-懈泻 莽械泻泻褍薪褌',
            m : '锌臅褉 屑懈薪褍褌',
            mm : '%d 屑懈薪褍褌',
            h : '锌臅褉 褋械褏械褌',
            hh : '%d 褋械褏械褌',
            d : '锌臅褉 泻褍薪',
            dd : '%d 泻褍薪',
            M : '锌臅褉 褍泄膬褏',
            MM : '%d 褍泄膬褏',
            y : '锌臅褉 莽褍谢',
            yy : '%d 莽褍谢'
        },
        ordinalParse: /\d{1,2}-屑臅褕/,
        ordinal : '%d-屑臅褕',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Welsh (cy)
// author : Robert Allen

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('cy', {
        months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split('_'),
        monthsShort: 'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
        weekdays: 'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split('_'),
        weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
        weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
        // time formats are the same as en-gb
        longDateFormat: {
            LT: 'HH:mm',
            LTS : 'LT:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Heddiw am] LT',
            nextDay: '[Yfory am] LT',
            nextWeek: 'dddd [am] LT',
            lastDay: '[Ddoe am] LT',
            lastWeek: 'dddd [diwethaf am] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'mewn %s',
            past: '%s yn 么l',
            s: 'ychydig eiliadau',
            m: 'munud',
            mm: '%d munud',
            h: 'awr',
            hh: '%d awr',
            d: 'diwrnod',
            dd: '%d diwrnod',
            M: 'mis',
            MM: '%d mis',
            y: 'blwyddyn',
            yy: '%d flynedd'
        },
        ordinalParse: /\d{1,2}(fed|ain|af|il|ydd|ed|eg)/,
        // traditional ordinal numbers above 31 are not commonly used in colloquial Welsh
        ordinal: function (number) {
            var b = number,
                output = '',
                lookup = [
                    '', 'af', 'il', 'ydd', 'ydd', 'ed', 'ed', 'ed', 'fed', 'fed', 'fed', // 1af to 10fed
                    'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'fed' // 11eg to 20fed
                ];

            if (b > 20) {
                if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
                    output = 'fed'; // not 30ain, 70ain or 90ain
                } else {
                    output = 'ain';
                }
            } else if (b > 0) {
                output = lookup[b];
            }

            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : danish (da)
// author : Ulrik Nielsen : https://github.com/mrbase

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('da', {
        months : 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 's酶ndag_mandag_tirsdag_onsdag_torsdag_fredag_l酶rdag'.split('_'),
        weekdaysShort : 's酶n_man_tir_ons_tor_fre_l酶r'.split('_'),
        weekdaysMin : 's酶_ma_ti_on_to_fr_l酶'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd [d.] D. MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[I dag kl.] LT',
            nextDay : '[I morgen kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[I g氓r kl.] LT',
            lastWeek : '[sidste] dddd [kl] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : '%s siden',
            s : 'f氓 sekunder',
            m : 'et minut',
            mm : '%d minutter',
            h : 'en time',
            hh : '%d timer',
            d : 'en dag',
            dd : '%d dage',
            M : 'en m氓ned',
            MM : '%d m氓neder',
            y : 'et 氓r',
            yy : '%d 氓r'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : austrian german (de-at)
// author : lluchs : https://github.com/lluchs
// author: Menelion Elens煤le: https://github.com/Oire
// author : Martin Groller : https://github.com/MadMG

(function (factory) {
    factory(moment);
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eine Minute', 'einer Minute'],
            'h': ['eine Stunde', 'einer Stunde'],
            'd': ['ein Tag', 'einem Tag'],
            'dd': [number + ' Tage', number + ' Tagen'],
            'M': ['ein Monat', 'einem Monat'],
            'MM': [number + ' Monate', number + ' Monaten'],
            'y': ['ein Jahr', 'einem Jahr'],
            'yy': [number + ' Jahre', number + ' Jahren']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    return moment.defineLocale('de-at', {
        months : 'J盲nner_Februar_M盲rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort : 'J盲n._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat : {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Heute um] LT [Uhr]',
            sameElse: 'L',
            nextDay: '[Morgen um] LT [Uhr]',
            nextWeek: 'dddd [um] LT [Uhr]',
            lastDay: '[Gestern um] LT [Uhr]',
            lastWeek: '[letzten] dddd [um] LT [Uhr]'
        },
        relativeTime : {
            future : 'in %s',
            past : 'vor %s',
            s : 'ein paar Sekunden',
            m : processRelativeTime,
            mm : '%d Minuten',
            h : processRelativeTime,
            hh : '%d Stunden',
            d : processRelativeTime,
            dd : processRelativeTime,
            M : processRelativeTime,
            MM : processRelativeTime,
            y : processRelativeTime,
            yy : processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : german (de)
// author : lluchs : https://github.com/lluchs
// author: Menelion Elens煤le: https://github.com/Oire

(function (factory) {
    factory(moment);
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eine Minute', 'einer Minute'],
            'h': ['eine Stunde', 'einer Stunde'],
            'd': ['ein Tag', 'einem Tag'],
            'dd': [number + ' Tage', number + ' Tagen'],
            'M': ['ein Monat', 'einem Monat'],
            'MM': [number + ' Monate', number + ' Monaten'],
            'y': ['ein Jahr', 'einem Jahr'],
            'yy': [number + ' Jahre', number + ' Jahren']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    return moment.defineLocale('de', {
        months : 'Januar_Februar_M盲rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat : {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Heute um] LT [Uhr]',
            sameElse: 'L',
            nextDay: '[Morgen um] LT [Uhr]',
            nextWeek: 'dddd [um] LT [Uhr]',
            lastDay: '[Gestern um] LT [Uhr]',
            lastWeek: '[letzten] dddd [um] LT [Uhr]'
        },
        relativeTime : {
            future : 'in %s',
            past : 'vor %s',
            s : 'ein paar Sekunden',
            m : processRelativeTime,
            mm : '%d Minuten',
            h : processRelativeTime,
            hh : '%d Stunden',
            d : processRelativeTime,
            dd : processRelativeTime,
            M : processRelativeTime,
            MM : processRelativeTime,
            y : processRelativeTime,
            yy : processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : modern greek (el)
// author : Aggelos Karalias : https://github.com/mehiel

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('el', {
        monthsNominativeEl : '螜伪谓慰蠀维蟻喂慰蟼_桅蔚尾蟻慰蠀维蟻喂慰蟼_螠维蟻蟿喂慰蟼_螒蟺蟻委位喂慰蟼_螠维喂慰蟼_螜慰蠉谓喂慰蟼_螜慰蠉位喂慰蟼_螒蠉纬慰蠀蟽蟿慰蟼_危蔚蟺蟿苇渭尾蟻喂慰蟼_螣魏蟿蠋尾蟻喂慰蟼_螡慰苇渭尾蟻喂慰蟼_螖蔚魏苇渭尾蟻喂慰蟼'.split('_'),
        monthsGenitiveEl : '螜伪谓慰蠀伪蟻委慰蠀_桅蔚尾蟻慰蠀伪蟻委慰蠀_螠伪蟻蟿委慰蠀_螒蟺蟻喂位委慰蠀_螠伪螑慰蠀_螜慰蠀谓委慰蠀_螜慰蠀位委慰蠀_螒蠀纬慰蠉蟽蟿慰蠀_危蔚蟺蟿蔚渭尾蟻委慰蠀_螣魏蟿蠅尾蟻委慰蠀_螡慰蔚渭尾蟻委慰蠀_螖蔚魏蔚渭尾蟻委慰蠀'.split('_'),
        months : function (momentToFormat, format) {
            if (/D/.test(format.substring(0, format.indexOf('MMMM')))) { // if there is a day number before 'MMMM'
                return this._monthsGenitiveEl[momentToFormat.month()];
            } else {
                return this._monthsNominativeEl[momentToFormat.month()];
            }
        },
        monthsShort : '螜伪谓_桅蔚尾_螠伪蟻_螒蟺蟻_螠伪蠆_螜慰蠀谓_螜慰蠀位_螒蠀纬_危蔚蟺_螣魏蟿_螡慰蔚_螖蔚魏'.split('_'),
        weekdays : '螝蠀蟻喂伪魏萎_螖蔚蠀蟿苇蟻伪_韦蟻委蟿畏_韦蔚蟿维蟻蟿畏_螤苇渭蟺蟿畏_螤伪蟻伪蟽魏蔚蠀萎_危维尾尾伪蟿慰'.split('_'),
        weekdaysShort : '螝蠀蟻_螖蔚蠀_韦蟻喂_韦蔚蟿_螤蔚渭_螤伪蟻_危伪尾'.split('_'),
        weekdaysMin : '螝蠀_螖蔚_韦蟻_韦蔚_螤蔚_螤伪_危伪'.split('_'),
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? '渭渭' : '螠螠';
            } else {
                return isLower ? '蟺渭' : '螤螠';
            }
        },
        isPM : function (input) {
            return ((input + '').toLowerCase()[0] === '渭');
        },
        meridiemParse : /[螤螠]\.?螠?\.?/i,
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendarEl : {
            sameDay : '[危萎渭蔚蟻伪 {}] LT',
            nextDay : '[螒蠉蟻喂慰 {}] LT',
            nextWeek : 'dddd [{}] LT',
            lastDay : '[围胃蔚蟼 {}] LT',
            lastWeek : function () {
                switch (this.day()) {
                    case 6:
                        return '[蟿慰 蟺蟻慰畏纬慰蠉渭蔚谓慰] dddd [{}] LT';
                    default:
                        return '[蟿畏谓 蟺蟻慰畏纬慰蠉渭蔚谓畏] dddd [{}] LT';
                }
            },
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendarEl[key],
                hours = mom && mom.hours();

            if (typeof output === 'function') {
                output = output.apply(mom);
            }

            return output.replace('{}', (hours % 12 === 1 ? '蟽蟿畏' : '蟽蟿喂蟼'));
        },
        relativeTime : {
            future : '蟽蔚 %s',
            past : '%s 蟺蟻喂谓',
            s : '位委纬伪 未蔚蠀蟿蔚蟻蠈位蔚蟺蟿伪',
            m : '苇谓伪 位蔚蟺蟿蠈',
            mm : '%d 位蔚蟺蟿维',
            h : '渭委伪 蠋蟻伪',
            hh : '%d 蠋蟻蔚蟼',
            d : '渭委伪 渭苇蟻伪',
            dd : '%d 渭苇蟻蔚蟼',
            M : '苇谓伪蟼 渭萎谓伪蟼',
            MM : '%d 渭萎谓蔚蟼',
            y : '苇谓伪蟼 蠂蟻蠈谓慰蟼',
            yy : '%d 蠂蟻蠈谓喂伪'
        },
        ordinalParse: /\d{1,2}畏/,
        ordinal: '%d畏',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : australian english (en-au)

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('en-au', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : canadian english (en-ca)
// author : Jonathan Abourbih : https://github.com/jonbca

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('en-ca', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM, YYYY',
            LLL : 'D MMMM, YYYY LT',
            LLLL : 'dddd, D MMMM, YYYY LT'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });
}));
// moment.js locale configuration
// locale : great britain english (en-gb)
// author : Chris Gedrim : https://github.com/chrisgedrim

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('en-gb', {
        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : esperanto (eo)
// author : Colin Dean : https://github.com/colindean
// komento: Mi estas malcerta se mi korekte traktis akuzativojn en tiu traduko.
//          Se ne, bonvolu korekti kaj avizi min por ke mi povas lerni!

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('eo', {
        months : 'januaro_februaro_marto_aprilo_majo_junio_julio_a怒gusto_septembro_oktobro_novembro_decembro'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_a怒g_sep_okt_nov_dec'.split('_'),
        weekdays : 'Diman膲o_Lundo_Mardo_Merkredo_拇a怒do_Vendredo_Sabato'.split('_'),
        weekdaysShort : 'Dim_Lun_Mard_Merk_拇a怒_Ven_Sab'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_拇a_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'YYYY-MM-DD',
            LL : 'D[-an de] MMMM, YYYY',
            LLL : 'D[-an de] MMMM, YYYY LT',
            LLLL : 'dddd, [la] D[-an de] MMMM, YYYY LT'
        },
        meridiemParse: /[ap]\.t\.m/i,
        isPM: function (input) {
            return input.charAt(0).toLowerCase() === 'p';
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'p.t.m.' : 'P.T.M.';
            } else {
                return isLower ? 'a.t.m.' : 'A.T.M.';
            }
        },
        calendar : {
            sameDay : '[Hodia怒 je] LT',
            nextDay : '[Morga怒 je] LT',
            nextWeek : 'dddd [je] LT',
            lastDay : '[Hiera怒 je] LT',
            lastWeek : '[pasinta] dddd [je] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'je %s',
            past : 'anta怒 %s',
            s : 'sekundoj',
            m : 'minuto',
            mm : '%d minutoj',
            h : 'horo',
            hh : '%d horoj',
            d : 'tago',//ne 'diurno', 膲ar estas uzita por proksimumo
            dd : '%d tagoj',
            M : 'monato',
            MM : '%d monatoj',
            y : 'jaro',
            yy : '%d jaroj'
        },
        ordinalParse: /\d{1,2}a/,
        ordinal : '%da',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : spanish (es)
// author : Julio Napur铆 : https://github.com/julionc

(function (factory) {
    factory(moment);
}(function (moment) {
    var monthsShortDot = 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_'),
        monthsShort = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_');

    return moment.defineLocale('es', {
        months : 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShort[m.month()];
            } else {
                return monthsShortDot[m.month()];
            }
        },
        weekdays : 'domingo_lunes_martes_mi茅rcoles_jueves_viernes_s谩bado'.split('_'),
        weekdaysShort : 'dom._lun._mar._mi茅._jue._vie._s谩b.'.split('_'),
        weekdaysMin : 'Do_Lu_Ma_Mi_Ju_Vi_S谩'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY LT',
            LLLL : 'dddd, D [de] MMMM [de] YYYY LT'
        },
        calendar : {
            sameDay : function () {
                return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextDay : function () {
                return '[ma帽ana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastDay : function () {
                return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastWeek : function () {
                return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'en %s',
            past : 'hace %s',
            s : 'unos segundos',
            m : 'un minuto',
            mm : '%d minutos',
            h : 'una hora',
            hh : '%d horas',
            d : 'un d铆a',
            dd : '%d d铆as',
            M : 'un mes',
            MM : '%d meses',
            y : 'un a帽o',
            yy : '%d a帽os'
        },
        ordinalParse : /\d{1,2}潞/,
        ordinal : '%d潞',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : estonian (et)
// author : Henry Kehlmann : https://github.com/madhenry
// improvements : Illimar Tambek : https://github.com/ragulka

(function (factory) {
    factory(moment);
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            's' : ['m玫ne sekundi', 'm玫ni sekund', 'paar sekundit'],
            'm' : ['眉he minuti', '眉ks minut'],
            'mm': [number + ' minuti', number + ' minutit'],
            'h' : ['眉he tunni', 'tund aega', '眉ks tund'],
            'hh': [number + ' tunni', number + ' tundi'],
            'd' : ['眉he p盲eva', '眉ks p盲ev'],
            'M' : ['kuu aja', 'kuu aega', '眉ks kuu'],
            'MM': [number + ' kuu', number + ' kuud'],
            'y' : ['眉he aasta', 'aasta', '眉ks aasta'],
            'yy': [number + ' aasta', number + ' aastat']
        };
        if (withoutSuffix) {
            return format[key][2] ? format[key][2] : format[key][1];
        }
        return isFuture ? format[key][0] : format[key][1];
    }

    return moment.defineLocale('et', {
        months        : 'jaanuar_veebruar_m盲rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
        monthsShort   : 'jaan_veebr_m盲rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
        weekdays      : 'p眉hap盲ev_esmasp盲ev_teisip盲ev_kolmap盲ev_neljap盲ev_reede_laup盲ev'.split('_'),
        weekdaysShort : 'P_E_T_K_N_R_L'.split('_'),
        weekdaysMin   : 'P_E_T_K_N_R_L'.split('_'),
        longDateFormat : {
            LT   : 'H:mm',
            LTS : 'LT:ss',
            L    : 'DD.MM.YYYY',
            LL   : 'D. MMMM YYYY',
            LLL  : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay  : '[T盲na,] LT',
            nextDay  : '[Homme,] LT',
            nextWeek : '[J盲rgmine] dddd LT',
            lastDay  : '[Eile,] LT',
            lastWeek : '[Eelmine] dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s p盲rast',
            past   : '%s tagasi',
            s      : processRelativeTime,
            m      : processRelativeTime,
            mm     : processRelativeTime,
            h      : processRelativeTime,
            hh     : processRelativeTime,
            d      : processRelativeTime,
            dd     : '%d p盲eva',
            M      : processRelativeTime,
            MM     : processRelativeTime,
            y      : processRelativeTime,
            yy     : processRelativeTime
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : euskara (eu)
// author : Eneko Illarramendi : https://github.com/eillarra

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('eu', {
        months : 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
        monthsShort : 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
        weekdays : 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
        weekdaysShort : 'ig._al._ar._az._og._ol._lr.'.split('_'),
        weekdaysMin : 'ig_al_ar_az_og_ol_lr'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'YYYY-MM-DD',
            LL : 'YYYY[ko] MMMM[ren] D[a]',
            LLL : 'YYYY[ko] MMMM[ren] D[a] LT',
            LLLL : 'dddd, YYYY[ko] MMMM[ren] D[a] LT',
            l : 'YYYY-M-D',
            ll : 'YYYY[ko] MMM D[a]',
            lll : 'YYYY[ko] MMM D[a] LT',
            llll : 'ddd, YYYY[ko] MMM D[a] LT'
        },
        calendar : {
            sameDay : '[gaur] LT[etan]',
            nextDay : '[bihar] LT[etan]',
            nextWeek : 'dddd LT[etan]',
            lastDay : '[atzo] LT[etan]',
            lastWeek : '[aurreko] dddd LT[etan]',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s barru',
            past : 'duela %s',
            s : 'segundo batzuk',
            m : 'minutu bat',
            mm : '%d minutu',
            h : 'ordu bat',
            hh : '%d ordu',
            d : 'egun bat',
            dd : '%d egun',
            M : 'hilabete bat',
            MM : '%d hilabete',
            y : 'urte bat',
            yy : '%d urte'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Persian (fa)
// author : Ebrahim Byagowi : https://github.com/ebraminio

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '郾',
        '2': '鄄',
        '3': '鄢',
        '4': '鄞',
        '5': '鄣',
        '6': '鄱',
        '7': '鄯',
        '8': '鄹',
        '9': '酃',
        '0': '郯'
    }, numberMap = {
        '郾': '1',
        '鄄': '2',
        '鄢': '3',
        '鄞': '4',
        '鄣': '5',
        '鄱': '6',
        '鄯': '7',
        '鄹': '8',
        '酃': '9',
        '郯': '0'
    };

    return moment.defineLocale('fa', {
        months : '跇丕賳賵蹖賴_賮賵乇蹖賴_賲丕乇爻_丌賵乇蹖賱_賲賴_跇賵卅賳_跇賵卅蹖賴_丕賵鬲_爻倬鬲丕賲亘乇_丕讴鬲亘乇_賳賵丕賲亘乇_丿爻丕賲亘乇'.split('_'),
        monthsShort : '跇丕賳賵蹖賴_賮賵乇蹖賴_賲丕乇爻_丌賵乇蹖賱_賲賴_跇賵卅賳_跇賵卅蹖賴_丕賵鬲_爻倬鬲丕賲亘乇_丕讴鬲亘乇_賳賵丕賲亘乇_丿爻丕賲亘乇'.split('_'),
        weekdays : '蹖讴\u200c卮賳亘賴_丿賵卮賳亘賴_爻賴\u200c卮賳亘賴_趩賴丕乇卮賳亘賴_倬賳噩\u200c卮賳亘賴_噩賲毓賴_卮賳亘賴'.split('_'),
        weekdaysShort : '蹖讴\u200c卮賳亘賴_丿賵卮賳亘賴_爻賴\u200c卮賳亘賴_趩賴丕乇卮賳亘賴_倬賳噩\u200c卮賳亘賴_噩賲毓賴_卮賳亘賴'.split('_'),
        weekdaysMin : '蹖_丿_爻_趩_倬_噩_卮'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        meridiemParse: /賯亘賱 丕夭 馗賴乇|亘毓丿 丕夭 馗賴乇/,
        isPM: function (input) {
            return /亘毓丿 丕夭 馗賴乇/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return '賯亘賱 丕夭 馗賴乇';
            } else {
                return '亘毓丿 丕夭 馗賴乇';
            }
        },
        calendar : {
            sameDay : '[丕賲乇賵夭 爻丕毓鬲] LT',
            nextDay : '[賮乇丿丕 爻丕毓鬲] LT',
            nextWeek : 'dddd [爻丕毓鬲] LT',
            lastDay : '[丿蹖乇賵夭 爻丕毓鬲] LT',
            lastWeek : 'dddd [倬蹖卮] [爻丕毓鬲] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '丿乇 %s',
            past : '%s 倬蹖卮',
            s : '趩賳丿蹖賳 孬丕賳蹖賴',
            m : '蹖讴 丿賯蹖賯賴',
            mm : '%d 丿賯蹖賯賴',
            h : '蹖讴 爻丕毓鬲',
            hh : '%d 爻丕毓鬲',
            d : '蹖讴 乇賵夭',
            dd : '%d 乇賵夭',
            M : '蹖讴 賲丕賴',
            MM : '%d 賲丕賴',
            y : '蹖讴 爻丕賱',
            yy : '%d 爻丕賱'
        },
        preparse: function (string) {
            return string.replace(/[郯-酃]/g, function (match) {
                return numberMap[match];
            }).replace(/貙/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '貙');
        },
        ordinalParse: /\d{1,2}賲/,
        ordinal : '%d賲',
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12 // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : finnish (fi)
// author : Tarmo Aidantausta : https://github.com/bleadof

(function (factory) {
    factory(moment);
}(function (moment) {
    var numbersPast = 'nolla yksi kaksi kolme nelj盲 viisi kuusi seitsem盲n kahdeksan yhdeks盲n'.split(' '),
        numbersFuture = [
            'nolla', 'yhden', 'kahden', 'kolmen', 'nelj盲n', 'viiden', 'kuuden',
            numbersPast[7], numbersPast[8], numbersPast[9]
        ];

    function translate(number, withoutSuffix, key, isFuture) {
        var result = '';
        switch (key) {
        case 's':
            return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
        case 'm':
            return isFuture ? 'minuutin' : 'minuutti';
        case 'mm':
            result = isFuture ? 'minuutin' : 'minuuttia';
            break;
        case 'h':
            return isFuture ? 'tunnin' : 'tunti';
        case 'hh':
            result = isFuture ? 'tunnin' : 'tuntia';
            break;
        case 'd':
            return isFuture ? 'p盲iv盲n' : 'p盲iv盲';
        case 'dd':
            result = isFuture ? 'p盲iv盲n' : 'p盲iv盲盲';
            break;
        case 'M':
            return isFuture ? 'kuukauden' : 'kuukausi';
        case 'MM':
            result = isFuture ? 'kuukauden' : 'kuukautta';
            break;
        case 'y':
            return isFuture ? 'vuoden' : 'vuosi';
        case 'yy':
            result = isFuture ? 'vuoden' : 'vuotta';
            break;
        }
        result = verbalNumber(number, isFuture) + ' ' + result;
        return result;
    }

    function verbalNumber(number, isFuture) {
        return number < 10 ? (isFuture ? numbersFuture[number] : numbersPast[number]) : number;
    }

    return moment.defineLocale('fi', {
        months : 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kes盲kuu_hein盲kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
        monthsShort : 'tammi_helmi_maalis_huhti_touko_kes盲_hein盲_elo_syys_loka_marras_joulu'.split('_'),
        weekdays : 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
        weekdaysShort : 'su_ma_ti_ke_to_pe_la'.split('_'),
        weekdaysMin : 'su_ma_ti_ke_to_pe_la'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'HH.mm.ss',
            L : 'DD.MM.YYYY',
            LL : 'Do MMMM[ta] YYYY',
            LLL : 'Do MMMM[ta] YYYY, [klo] LT',
            LLLL : 'dddd, Do MMMM[ta] YYYY, [klo] LT',
            l : 'D.M.YYYY',
            ll : 'Do MMM YYYY',
            lll : 'Do MMM YYYY, [klo] LT',
            llll : 'ddd, Do MMM YYYY, [klo] LT'
        },
        calendar : {
            sameDay : '[t盲n盲盲n] [klo] LT',
            nextDay : '[huomenna] [klo] LT',
            nextWeek : 'dddd [klo] LT',
            lastDay : '[eilen] [klo] LT',
            lastWeek : '[viime] dddd[na] [klo] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s p盲盲st盲',
            past : '%s sitten',
            s : translate,
            m : translate,
            mm : translate,
            h : translate,
            hh : translate,
            d : translate,
            dd : translate,
            M : translate,
            MM : translate,
            y : translate,
            yy : translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : faroese (fo)
// author : Ragnar Johannesen : https://github.com/ragnar123

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('fo', {
        months : 'januar_februar_mars_apr铆l_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 'sunnudagur_m谩nadagur_t媒sdagur_mikudagur_h贸sdagur_fr铆ggjadagur_leygardagur'.split('_'),
        weekdaysShort : 'sun_m谩n_t媒s_mik_h贸s_fr铆_ley'.split('_'),
        weekdaysMin : 'su_m谩_t媒_mi_h贸_fr_le'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D. MMMM, YYYY LT'
        },
        calendar : {
            sameDay : '[脥 dag kl.] LT',
            nextDay : '[脥 morgin kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[脥 gj谩r kl.] LT',
            lastWeek : '[s铆冒stu] dddd [kl] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'um %s',
            past : '%s s铆冒ani',
            s : 'f谩 sekund',
            m : 'ein minutt',
            mm : '%d minuttir',
            h : 'ein t铆mi',
            hh : '%d t铆mar',
            d : 'ein dagur',
            dd : '%d dagar',
            M : 'ein m谩na冒i',
            MM : '%d m谩na冒ir',
            y : 'eitt 谩r',
            yy : '%d 谩r'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : canadian french (fr-ca)
// author : Jonathan Abourbih : https://github.com/jonbca

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('fr-ca', {
        months : 'janvier_f茅vrier_mars_avril_mai_juin_juillet_ao没t_septembre_octobre_novembre_d茅cembre'.split('_'),
        monthsShort : 'janv._f茅vr._mars_avr._mai_juin_juil._ao没t_sept._oct._nov._d茅c.'.split('_'),
        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Aujourd\'hui 脿] LT',
            nextDay: '[Demain 脿] LT',
            nextWeek: 'dddd [脿] LT',
            lastDay: '[Hier 脿] LT',
            lastWeek: 'dddd [dernier 脿] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        },
        ordinalParse: /\d{1,2}(er|)/,
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : '');
        }
    });
}));
// moment.js locale configuration
// locale : french (fr)
// author : John Fischer : https://github.com/jfroffice

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('fr', {
        months : 'janvier_f茅vrier_mars_avril_mai_juin_juillet_ao没t_septembre_octobre_novembre_d茅cembre'.split('_'),
        monthsShort : 'janv._f茅vr._mars_avr._mai_juin_juil._ao没t_sept._oct._nov._d茅c.'.split('_'),
        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Aujourd\'hui 脿] LT',
            nextDay: '[Demain 脿] LT',
            nextWeek: 'dddd [脿] LT',
            lastDay: '[Hier 脿] LT',
            lastWeek: 'dddd [dernier 脿] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dans %s',
            past : 'il y a %s',
            s : 'quelques secondes',
            m : 'une minute',
            mm : '%d minutes',
            h : 'une heure',
            hh : '%d heures',
            d : 'un jour',
            dd : '%d jours',
            M : 'un mois',
            MM : '%d mois',
            y : 'un an',
            yy : '%d ans'
        },
        ordinalParse: /\d{1,2}(er|)/,
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : '');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : frisian (fy)
// author : Robin van der Vliet : https://github.com/robin0van0der0v

(function (factory) {
    factory(moment);
}(function (moment) {
    var monthsShortWithDots = 'jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.'.split('_'),
        monthsShortWithoutDots = 'jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_');

    return moment.defineLocale('fy', {
        months : 'jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShortWithoutDots[m.month()];
            } else {
                return monthsShortWithDots[m.month()];
            }
        },
        weekdays : 'snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon'.split('_'),
        weekdaysShort : 'si._mo._ti._wo._to._fr._so.'.split('_'),
        weekdaysMin : 'Si_Mo_Ti_Wo_To_Fr_So'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD-MM-YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[hjoed om] LT',
            nextDay: '[moarn om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[juster om] LT',
            lastWeek: '[么fr没ne] dddd [om] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'oer %s',
            past : '%s lyn',
            s : 'in pear sekonden',
            m : 'ien min煤t',
            mm : '%d minuten',
            h : 'ien oere',
            hh : '%d oeren',
            d : 'ien dei',
            dd : '%d dagen',
            M : 'ien moanne',
            MM : '%d moannen',
            y : 'ien jier',
            yy : '%d jierren'
        },
        ordinalParse: /\d{1,2}(ste|de)/,
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : galician (gl)
// author : Juan G. Hurtado : https://github.com/juanghurtado

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('gl', {
        months : 'Xaneiro_Febreiro_Marzo_Abril_Maio_Xu帽o_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
        monthsShort : 'Xan._Feb._Mar._Abr._Mai._Xu帽._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
        weekdays : 'Domingo_Luns_Martes_M茅rcores_Xoves_Venres_S谩bado'.split('_'),
        weekdaysShort : 'Dom._Lun._Mar._M茅r._Xov._Ven._S谩b.'.split('_'),
        weekdaysMin : 'Do_Lu_Ma_M茅_Xo_Ve_S谩'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay : function () {
                return '[hoxe ' + ((this.hours() !== 1) ? '谩s' : '谩') + '] LT';
            },
            nextDay : function () {
                return '[ma帽谩 ' + ((this.hours() !== 1) ? '谩s' : '谩') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [' + ((this.hours() !== 1) ? '谩s' : 'a') + '] LT';
            },
            lastDay : function () {
                return '[onte ' + ((this.hours() !== 1) ? '谩' : 'a') + '] LT';
            },
            lastWeek : function () {
                return '[o] dddd [pasado ' + ((this.hours() !== 1) ? '谩s' : 'a') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : function (str) {
                if (str === 'uns segundos') {
                    return 'nuns segundos';
                }
                return 'en ' + str;
            },
            past : 'hai %s',
            s : 'uns segundos',
            m : 'un minuto',
            mm : '%d minutos',
            h : 'unha hora',
            hh : '%d horas',
            d : 'un d铆a',
            dd : '%d d铆as',
            M : 'un mes',
            MM : '%d meses',
            y : 'un ano',
            yy : '%d anos'
        },
        ordinalParse : /\d{1,2}潞/,
        ordinal : '%d潞',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Hebrew (he)
// author : Tomer Cohen : https://github.com/tomer
// author : Moshe Simantov : https://github.com/DevelopmentIL
// author : Tal Ater : https://github.com/TalAter

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('he', {
        months : '讬谞讜讗专_驻讘专讜讗专_诪专抓_讗驻专讬诇_诪讗讬_讬讜谞讬_讬讜诇讬_讗讜讙讜住讟_住驻讟诪讘专_讗讜拽讟讜讘专_谞讜讘诪讘专_讚爪诪讘专'.split('_'),
        monthsShort : '讬谞讜壮_驻讘专壮_诪专抓_讗驻专壮_诪讗讬_讬讜谞讬_讬讜诇讬_讗讜讙壮_住驻讟壮_讗讜拽壮_谞讜讘壮_讚爪诪壮'.split('_'),
        weekdays : '专讗砖讜谉_砖谞讬_砖诇讬砖讬_专讘讬注讬_讞诪讬砖讬_砖讬砖讬_砖讘转'.split('_'),
        weekdaysShort : '讗壮_讘壮_讙壮_讚壮_讛壮_讜壮_砖壮'.split('_'),
        weekdaysMin : '讗_讘_讙_讚_讛_讜_砖'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [讘]MMMM YYYY',
            LLL : 'D [讘]MMMM YYYY LT',
            LLLL : 'dddd, D [讘]MMMM YYYY LT',
            l : 'D/M/YYYY',
            ll : 'D MMM YYYY',
            lll : 'D MMM YYYY LT',
            llll : 'ddd, D MMM YYYY LT'
        },
        calendar : {
            sameDay : '[讛讬讜诐 讘志]LT',
            nextDay : '[诪讞专 讘志]LT',
            nextWeek : 'dddd [讘砖注讛] LT',
            lastDay : '[讗转诪讜诇 讘志]LT',
            lastWeek : '[讘讬讜诐] dddd [讛讗讞专讜谉 讘砖注讛] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '讘注讜讚 %s',
            past : '诇驻谞讬 %s',
            s : '诪住驻专 砖谞讬讜转',
            m : '讚拽讛',
            mm : '%d 讚拽讜转',
            h : '砖注讛',
            hh : function (number) {
                if (number === 2) {
                    return '砖注转讬讬诐';
                }
                return number + ' 砖注讜转';
            },
            d : '讬讜诐',
            dd : function (number) {
                if (number === 2) {
                    return '讬讜诪讬讬诐';
                }
                return number + ' 讬诪讬诐';
            },
            M : '讞讜讚砖',
            MM : function (number) {
                if (number === 2) {
                    return '讞讜讚砖讬讬诐';
                }
                return number + ' 讞讜讚砖讬诐';
            },
            y : '砖谞讛',
            yy : function (number) {
                if (number === 2) {
                    return '砖谞转讬讬诐';
                } else if (number % 10 === 0 && number !== 10) {
                    return number + ' 砖谞讛';
                }
                return number + ' 砖谞讬诐';
            }
        }
    });
}));
// moment.js locale configuration
// locale : hindi (hi)
// author : Mayank Singhal : https://github.com/mayanksinghal

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '啷�',
        '2': '啷�',
        '3': '啷�',
        '4': '啷�',
        '5': '啷�',
        '6': '啷�',
        '7': '啷�',
        '8': '啷�',
        '9': '啷�',
        '0': '啷�'
    },
    numberMap = {
        '啷�': '1',
        '啷�': '2',
        '啷�': '3',
        '啷�': '4',
        '啷�': '5',
        '啷�': '6',
        '啷�': '7',
        '啷�': '8',
        '啷�': '9',
        '啷�': '0'
    };

    return moment.defineLocale('hi', {
        months : '啶溹え啶掂ぐ啷€_啶ぜ啶班さ啶班_啶ぞ啶班啶歘啶呧お啷嵿ぐ啷堗げ_啶_啶溹啶╛啶溹啶侧ぞ啶坃啶呧啶膏啶啶膏た啶むぎ啷嵿が啶癬啶呧啷嵿啷傕が啶癬啶ㄠさ啶啶ぐ_啶︵た啶膏ぎ啷嵿が啶�'.split('_'),
        monthsShort : '啶溹え._啶ぜ啶�._啶ぞ啶班啶歘啶呧お啷嵿ぐ啷�._啶_啶溹啶╛啶溹啶�._啶呧._啶膏た啶�._啶呧啷嵿啷�._啶ㄠさ._啶︵た啶�.'.split('_'),
        weekdays : '啶班さ啶苦さ啶距ぐ_啶膏啶さ啶距ぐ_啶啶椸げ啶掂ぞ啶癬啶啶оさ啶距ぐ_啶椸啶班啶掂ぞ啶癬啶多啶曕啶班さ啶距ぐ_啶多え啶苦さ啶距ぐ'.split('_'),
        weekdaysShort : '啶班さ啶縚啶膏啶甠啶啶椸げ_啶啶啶椸啶班_啶多啶曕啶癬啶多え啶�'.split('_'),
        weekdaysMin : '啶癬啶膏_啶_啶_啶椸_啶多_啶�'.split('_'),
        longDateFormat : {
            LT : 'A h:mm 啶啷�',
            LTS : 'A h:mm:ss 啶啷�',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[啶嗋] LT',
            nextDay : '[啶曕げ] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[啶曕げ] LT',
            lastWeek : '[啶た啶涏げ啷嘳 dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s 啶啶�',
            past : '%s 啶す啶侧',
            s : '啶曕啶� 啶灌 啶曕啶粪ぃ',
            m : '啶忇 啶た啶ㄠ',
            mm : '%d 啶た啶ㄠ',
            h : '啶忇 啶樴啶熰ぞ',
            hh : '%d 啶樴啶熰',
            d : '啶忇 啶︵た啶�',
            dd : '%d 啶︵た啶�',
            M : '啶忇 啶す啷€啶ㄠ',
            MM : '%d 啶す啷€啶ㄠ',
            y : '啶忇 啶掂ぐ啷嵿し',
            yy : '%d 啶掂ぐ啷嵿し'
        },
        preparse: function (string) {
            return string.replace(/[啷оエ啷┼オ啷ガ啷ギ啷ウ]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        // Hindi notation for meridiems are quite fuzzy in practice. While there exists
        // a rigid notion of a 'Pahar' it is not used as rigidly in modern Hindi.
        meridiemParse: /啶班ぞ啶啶膏啶す|啶︵啶す啶皘啶多ぞ啶�/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === '啶班ぞ啶�') {
                return hour < 4 ? hour : hour + 12;
            } else if (meridiem === '啶膏啶す') {
                return hour;
            } else if (meridiem === '啶︵啶す啶�') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === '啶多ぞ啶�') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return '啶班ぞ啶�';
            } else if (hour < 10) {
                return '啶膏啶す';
            } else if (hour < 17) {
                return '啶︵啶す啶�';
            } else if (hour < 20) {
                return '啶多ぞ啶�';
            } else {
                return '啶班ぞ啶�';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : hrvatski (hr)
// author : Bojan Markovi膰 : https://github.com/bmarkovic

// based on (sl) translation by Robert Sedov拧ek

(function (factory) {
    factory(moment);
}(function (moment) {
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }

    return moment.defineLocale('hr', {
        months : 'sje膷anj_velja膷a_o啪ujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split('_'),
        monthsShort : 'sje._vel._o啪u._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split('_'),
        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_膷etvrtak_petak_subota'.split('_'),
        weekdaysShort : 'ned._pon._uto._sri._膷et._pet._sub.'.split('_'),
        weekdaysMin : 'ne_po_ut_sr_膷e_pe_su'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay  : '[danas u] LT',
            nextDay  : '[sutra u] LT',

            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[ju膷er u] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                    return '[pro拧lu] dddd [u] LT';
                case 6:
                    return '[pro拧le] [subote] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[pro拧li] dddd [u] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'prije %s',
            s      : 'par sekundi',
            m      : translate,
            mm     : translate,
            h      : translate,
            hh     : translate,
            d      : 'dan',
            dd     : translate,
            M      : 'mjesec',
            MM     : translate,
            y      : 'godinu',
            yy     : translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : hungarian (hu)
// author : Adam Brunner : https://github.com/adambrunner

(function (factory) {
    factory(moment);
}(function (moment) {
    var weekEndings = 'vas谩rnap h茅tf艖n kedden szerd谩n cs眉t枚rt枚k枚n p茅nteken szombaton'.split(' ');

    function translate(number, withoutSuffix, key, isFuture) {
        var num = number,
            suffix;

        switch (key) {
        case 's':
            return (isFuture || withoutSuffix) ? 'n茅h谩ny m谩sodperc' : 'n茅h谩ny m谩sodperce';
        case 'm':
            return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'mm':
            return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'h':
            return 'egy' + (isFuture || withoutSuffix ? ' 贸ra' : ' 贸r谩ja');
        case 'hh':
            return num + (isFuture || withoutSuffix ? ' 贸ra' : ' 贸r谩ja');
        case 'd':
            return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'dd':
            return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'M':
            return 'egy' + (isFuture || withoutSuffix ? ' h贸nap' : ' h贸napja');
        case 'MM':
            return num + (isFuture || withoutSuffix ? ' h贸nap' : ' h贸napja');
        case 'y':
            return 'egy' + (isFuture || withoutSuffix ? ' 茅v' : ' 茅ve');
        case 'yy':
            return num + (isFuture || withoutSuffix ? ' 茅v' : ' 茅ve');
        }

        return '';
    }

    function week(isFuture) {
        return (isFuture ? '' : '[m煤lt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
    }

    return moment.defineLocale('hu', {
        months : 'janu谩r_febru谩r_m谩rcius_谩prilis_m谩jus_j煤nius_j煤lius_augusztus_szeptember_okt贸ber_november_december'.split('_'),
        monthsShort : 'jan_feb_m谩rc_谩pr_m谩j_j煤n_j煤l_aug_szept_okt_nov_dec'.split('_'),
        weekdays : 'vas谩rnap_h茅tf艖_kedd_szerda_cs眉t枚rt枚k_p茅ntek_szombat'.split('_'),
        weekdaysShort : 'vas_h茅t_kedd_sze_cs眉t_p茅n_szo'.split('_'),
        weekdaysMin : 'v_h_k_sze_cs_p_szo'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'YYYY.MM.DD.',
            LL : 'YYYY. MMMM D.',
            LLL : 'YYYY. MMMM D., LT',
            LLLL : 'YYYY. MMMM D., dddd LT'
        },
        meridiemParse: /de|du/i,
        isPM: function (input) {
            return input.charAt(1).toLowerCase() === 'u';
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower === true ? 'de' : 'DE';
            } else {
                return isLower === true ? 'du' : 'DU';
            }
        },
        calendar : {
            sameDay : '[ma] LT[-kor]',
            nextDay : '[holnap] LT[-kor]',
            nextWeek : function () {
                return week.call(this, true);
            },
            lastDay : '[tegnap] LT[-kor]',
            lastWeek : function () {
                return week.call(this, false);
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s m煤lva',
            past : '%s',
            s : translate,
            m : translate,
            mm : translate,
            h : translate,
            hh : translate,
            d : translate,
            dd : translate,
            M : translate,
            MM : translate,
            y : translate,
            yy : translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Armenian (hy-am)
// author : Armendarabyan : https://github.com/armendarabyan

(function (factory) {
    factory(moment);
}(function (moment) {
    function monthsCaseReplace(m, format) {
        var months = {
            'nominative': '瞻崭謧斩站铡謤_謨榨湛謤站铡謤_沾铡謤湛_铡蘸謤斋宅_沾铡盏斋战_瞻崭謧斩斋战_瞻崭謧宅斋战_謪眨崭战湛崭战_战榨蘸湛榨沾闸榨謤_瞻崭寨湛榨沾闸榨謤_斩崭盏榨沾闸榨謤_栅榨寨湛榨沾闸榨謤'.split('_'),
            'accusative': '瞻崭謧斩站铡謤斋_謨榨湛謤站铡謤斋_沾铡謤湛斋_铡蘸謤斋宅斋_沾铡盏斋战斋_瞻崭謧斩斋战斋_瞻崭謧宅斋战斋_謪眨崭战湛崭战斋_战榨蘸湛榨沾闸榨謤斋_瞻崭寨湛榨沾闸榨謤斋_斩崭盏榨沾闸榨謤斋_栅榨寨湛榨沾闸榨謤斋'.split('_')
        },

        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return months[nounCase][m.month()];
    }

    function monthsShortCaseReplace(m, format) {
        var monthsShort = '瞻斩站_謨湛謤_沾謤湛_铡蘸謤_沾盏战_瞻斩战_瞻宅战_謪眨战_战蘸湛_瞻寨湛_斩沾闸_栅寨湛'.split('_');

        return monthsShort[m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = '寨斋謤铡寨斋_榨謤寨崭謧辗铡闸诈斋_榨謤榨謩辗铡闸诈斋_展崭謤榨謩辗铡闸诈斋_瞻斋斩眨辗铡闸诈斋_崭謧謤闸铡诈_辗铡闸铡诈'.split('_');

        return weekdays[m.day()];
    }

    return moment.defineLocale('hy-am', {
        months : monthsCaseReplace,
        monthsShort : monthsShortCaseReplace,
        weekdays : weekdaysCaseReplace,
        weekdaysShort : '寨謤寨_榨謤寨_榨謤謩_展謤謩_瞻斩眨_崭謧謤闸_辗闸诈'.split('_'),
        weekdaysMin : '寨謤寨_榨謤寨_榨謤謩_展謤謩_瞻斩眨_崭謧謤闸_辗闸诈'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY 诈.',
            LLL : 'D MMMM YYYY 诈., LT',
            LLLL : 'dddd, D MMMM YYYY 诈., LT'
        },
        calendar : {
            sameDay: '[铡盏战謪謤] LT',
            nextDay: '[站铡詹炸] LT',
            lastDay: '[榨謤榨寨] LT',
            nextWeek: function () {
                return 'dddd [謪謤炸 摘铡沾炸] LT';
            },
            lastWeek: function () {
                return '[铡斩謥铡债] dddd [謪謤炸 摘铡沾炸] LT';
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : '%s 瞻榨湛崭',
            past : '%s 铡占铡栈',
            s : '沾斋 謩铡斩斋 站铡盏謤寨盏铡斩',
            m : '謤崭蘸榨',
            mm : '%d 謤崭蘸榨',
            h : '摘铡沾',
            hh : '%d 摘铡沾',
            d : '謪謤',
            dd : '%d 謪謤',
            M : '铡沾斋战',
            MM : '%d 铡沾斋战',
            y : '湛铡謤斋',
            yy : '%d 湛铡謤斋'
        },

        meridiemParse: /眨斋辗榨謤站铡|铡占铡站崭湛站铡|謥榨謤榨寨站铡|榨謤榨寨崭盏铡斩/,
        isPM: function (input) {
            return /^(謥榨謤榨寨站铡|榨謤榨寨崭盏铡斩)$/.test(input);
        },
        meridiem : function (hour) {
            if (hour < 4) {
                return '眨斋辗榨謤站铡';
            } else if (hour < 12) {
                return '铡占铡站崭湛站铡';
            } else if (hour < 17) {
                return '謥榨謤榨寨站铡';
            } else {
                return '榨謤榨寨崭盏铡斩';
            }
        },

        ordinalParse: /\d{1,2}|\d{1,2}-(斋斩|謤栅)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'DDD':
            case 'w':
            case 'W':
            case 'DDDo':
                if (number === 1) {
                    return number + '-斋斩';
                }
                return number + '-謤栅';
            default:
                return number;
            }
        },

        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Bahasa Indonesia (id)
// author : Mohammad Satrio Utomo : https://github.com/tyok
// reference: http://id.wikisource.org/wiki/Pedoman_Umum_Ejaan_Bahasa_Indonesia_yang_Disempurnakan

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('id', {
        months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
        weekdays : 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
        weekdaysShort : 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
        weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'LT.ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] LT',
            LLLL : 'dddd, D MMMM YYYY [pukul] LT'
        },
        meridiemParse: /pagi|siang|sore|malam/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'pagi') {
                return hour;
            } else if (meridiem === 'siang') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'sore' || meridiem === 'malam') {
                return hour + 12;
            }
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'siang';
            } else if (hours < 19) {
                return 'sore';
            } else {
                return 'malam';
            }
        },
        calendar : {
            sameDay : '[Hari ini pukul] LT',
            nextDay : '[Besok pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kemarin pukul] LT',
            lastWeek : 'dddd [lalu pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'dalam %s',
            past : '%s yang lalu',
            s : 'beberapa detik',
            m : 'semenit',
            mm : '%d menit',
            h : 'sejam',
            hh : '%d jam',
            d : 'sehari',
            dd : '%d hari',
            M : 'sebulan',
            MM : '%d bulan',
            y : 'setahun',
            yy : '%d tahun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : icelandic (is)
// author : Hinrik 脰rn Sigur冒sson : https://github.com/hinrik

(function (factory) {
    factory(moment);
}(function (moment) {
    function plural(n) {
        if (n % 100 === 11) {
            return true;
        } else if (n % 10 === 1) {
            return false;
        }
        return true;
    }

    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'nokkrar sek煤ndur' : 'nokkrum sek煤ndum';
        case 'm':
            return withoutSuffix ? 'm铆n煤ta' : 'm铆n煤tu';
        case 'mm':
            if (plural(number)) {
                return result + (withoutSuffix || isFuture ? 'm铆n煤tur' : 'm铆n煤tum');
            } else if (withoutSuffix) {
                return result + 'm铆n煤ta';
            }
            return result + 'm铆n煤tu';
        case 'hh':
            if (plural(number)) {
                return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
            }
            return result + 'klukkustund';
        case 'd':
            if (withoutSuffix) {
                return 'dagur';
            }
            return isFuture ? 'dag' : 'degi';
        case 'dd':
            if (plural(number)) {
                if (withoutSuffix) {
                    return result + 'dagar';
                }
                return result + (isFuture ? 'daga' : 'd枚gum');
            } else if (withoutSuffix) {
                return result + 'dagur';
            }
            return result + (isFuture ? 'dag' : 'degi');
        case 'M':
            if (withoutSuffix) {
                return 'm谩nu冒ur';
            }
            return isFuture ? 'm谩nu冒' : 'm谩nu冒i';
        case 'MM':
            if (plural(number)) {
                if (withoutSuffix) {
                    return result + 'm谩nu冒ir';
                }
                return result + (isFuture ? 'm谩nu冒i' : 'm谩nu冒um');
            } else if (withoutSuffix) {
                return result + 'm谩nu冒ur';
            }
            return result + (isFuture ? 'm谩nu冒' : 'm谩nu冒i');
        case 'y':
            return withoutSuffix || isFuture ? '谩r' : '谩ri';
        case 'yy':
            if (plural(number)) {
                return result + (withoutSuffix || isFuture ? '谩r' : '谩rum');
            }
            return result + (withoutSuffix || isFuture ? '谩r' : '谩ri');
        }
    }

    return moment.defineLocale('is', {
        months : 'jan煤ar_febr煤ar_mars_apr铆l_ma铆_j煤n铆_j煤l铆_谩g煤st_september_okt贸ber_n贸vember_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_ma铆_j煤n_j煤l_谩g煤_sep_okt_n贸v_des'.split('_'),
        weekdays : 'sunnudagur_m谩nudagur_镁ri冒judagur_mi冒vikudagur_fimmtudagur_f枚studagur_laugardagur'.split('_'),
        weekdaysShort : 'sun_m谩n_镁ri_mi冒_fim_f枚s_lau'.split('_'),
        weekdaysMin : 'Su_M谩_脼r_Mi_Fi_F枚_La'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY [kl.] LT',
            LLLL : 'dddd, D. MMMM YYYY [kl.] LT'
        },
        calendar : {
            sameDay : '[铆 dag kl.] LT',
            nextDay : '[谩 morgun kl.] LT',
            nextWeek : 'dddd [kl.] LT',
            lastDay : '[铆 g忙r kl.] LT',
            lastWeek : '[s铆冒asta] dddd [kl.] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'eftir %s',
            past : 'fyrir %s s铆冒an',
            s : translate,
            m : translate,
            mm : translate,
            h : 'klukkustund',
            hh : translate,
            d : translate,
            dd : translate,
            M : translate,
            MM : translate,
            y : translate,
            yy : translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : italian (it)
// author : Lorenzo : https://github.com/aliem
// author: Mattia Larentis: https://github.com/nostalgiaz

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('it', {
        months : 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
        monthsShort : 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
        weekdays : 'Domenica_Luned矛_Marted矛_Mercoled矛_Gioved矛_Venerd矛_Sabato'.split('_'),
        weekdaysShort : 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
        weekdaysMin : 'D_L_Ma_Me_G_V_S'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Oggi alle] LT',
            nextDay: '[Domani alle] LT',
            nextWeek: 'dddd [alle] LT',
            lastDay: '[Ieri alle] LT',
            lastWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[la scorsa] dddd [alle] LT';
                    default:
                        return '[lo scorso] dddd [alle] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : function (s) {
                return ((/^[0-9].+$/).test(s) ? 'tra' : 'in') + ' ' + s;
            },
            past : '%s fa',
            s : 'alcuni secondi',
            m : 'un minuto',
            mm : '%d minuti',
            h : 'un\'ora',
            hh : '%d ore',
            d : 'un giorno',
            dd : '%d giorni',
            M : 'un mese',
            MM : '%d mesi',
            y : 'un anno',
            yy : '%d anni'
        },
        ordinalParse : /\d{1,2}潞/,
        ordinal: '%d潞',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : japanese (ja)
// author : LI Long : https://github.com/baryon

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ja', {
        months : '1鏈坃2鏈坃3鏈坃4鏈坃5鏈坃6鏈坃7鏈坃8鏈坃9鏈坃10鏈坃11鏈坃12鏈�'.split('_'),
        monthsShort : '1鏈坃2鏈坃3鏈坃4鏈坃5鏈坃6鏈坃7鏈坃8鏈坃9鏈坃10鏈坃11鏈坃12鏈�'.split('_'),
        weekdays : '鏃ユ洔鏃鏈堟洔鏃鐏洔鏃姘存洔鏃鏈ㄦ洔鏃閲戞洔鏃鍦熸洔鏃�'.split('_'),
        weekdaysShort : '鏃鏈坃鐏玙姘確鏈╛閲慱鍦�'.split('_'),
        weekdaysMin : '鏃鏈坃鐏玙姘確鏈╛閲慱鍦�'.split('_'),
        longDateFormat : {
            LT : 'Ah鏅俶鍒�',
            LTS : 'LTs绉�',
            L : 'YYYY/MM/DD',
            LL : 'YYYY骞碝鏈圖鏃�',
            LLL : 'YYYY骞碝鏈圖鏃T',
            LLLL : 'YYYY骞碝鏈圖鏃T dddd'
        },
        meridiemParse: /鍗堝墠|鍗堝緦/i,
        isPM : function (input) {
            return input === '鍗堝緦';
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return '鍗堝墠';
            } else {
                return '鍗堝緦';
            }
        },
        calendar : {
            sameDay : '[浠婃棩] LT',
            nextDay : '[鏄庢棩] LT',
            nextWeek : '[鏉ラ€盷dddd LT',
            lastDay : '[鏄ㄦ棩] LT',
            lastWeek : '[鍓嶉€盷dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s寰�',
            past : '%s鍓�',
            s : '鏁扮',
            m : '1鍒�',
            mm : '%d鍒�',
            h : '1鏅傞枔',
            hh : '%d鏅傞枔',
            d : '1鏃�',
            dd : '%d鏃�',
            M : '1銉舵湀',
            MM : '%d銉舵湀',
            y : '1骞�',
            yy : '%d骞�'
        }
    });
}));
// moment.js locale configuration
// locale : Georgian (ka)
// author : Irakli Janiashvili : https://github.com/irakli-janiashvili

(function (factory) {
    factory(moment);
}(function (moment) {
    function monthsCaseReplace(m, format) {
        var months = {
            'nominative': '醿樶儛醿溼儠醿愥儬醿榑醿椺償醿戓償醿犪儠醿愥儦醿榑醿涐儛醿犪儮醿榑醿愥優醿犪儤醿氠儤_醿涐儛醿樶儭醿榑醿樶儠醿溼儤醿♂儤_醿樶儠醿氠儤醿♂儤_醿愥儝醿曖儤醿♂儮醿漘醿♂償醿メ儮醿斸儧醿戓償醿犪儤_醿濁儱醿⑨儩醿涐儜醿斸儬醿榑醿溼儩醿斸儧醿戓償醿犪儤_醿撫償醿欋償醿涐儜醿斸儬醿�'.split('_'),
            'accusative': '醿樶儛醿溼儠醿愥儬醿醿椺償醿戓償醿犪儠醿愥儦醿醿涐儛醿犪儮醿醿愥優醿犪儤醿氠儤醿醿涐儛醿樶儭醿醿樶儠醿溼儤醿♂儭_醿樶儠醿氠儤醿♂儭_醿愥儝醿曖儤醿♂儮醿醿♂償醿メ儮醿斸儧醿戓償醿犪儭_醿濁儱醿⑨儩醿涐儜醿斸儬醿醿溼儩醿斸儧醿戓償醿犪儭_醿撫償醿欋償醿涐儜醿斸儬醿�'.split('_')
        },

        nounCase = (/D[oD] *MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return months[nounCase][m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': '醿欋儠醿樶儬醿恄醿濁儬醿ㄡ儛醿戓儛醿椺儤_醿♂儛醿涐儴醿愥儜醿愥儣醿榑醿濁儣醿儴醿愥儜醿愥儣醿榑醿儯醿椺儴醿愥儜醿愥儣醿榑醿炨儛醿犪儛醿♂儥醿斸儠醿榑醿ㄡ儛醿戓儛醿椺儤'.split('_'),
            'accusative': '醿欋儠醿樶儬醿愥儭_醿濁儬醿ㄡ儛醿戓儛醿椺儭_醿♂儛醿涐儴醿愥儜醿愥儣醿醿濁儣醿儴醿愥儜醿愥儣醿醿儯醿椺儴醿愥儜醿愥儣醿醿炨儛醿犪儛醿♂儥醿斸儠醿醿ㄡ儛醿戓儛醿椺儭'.split('_')
        },

        nounCase = (/(醿儤醿溼儛|醿ㄡ償醿涐儞醿斸儝)/).test(format) ?
            'accusative' :
            'nominative';

        return weekdays[nounCase][m.day()];
    }

    return moment.defineLocale('ka', {
        months : monthsCaseReplace,
        monthsShort : '醿樶儛醿淿醿椺償醿慱醿涐儛醿燺醿愥優醿燺醿涐儛醿榑醿樶儠醿淿醿樶儠醿歘醿愥儝醿昣醿♂償醿醿濁儱醿醿溼儩醿擾醿撫償醿�'.split('_'),
        weekdays : weekdaysCaseReplace,
        weekdaysShort : '醿欋儠醿榑醿濁儬醿╛醿♂儛醿沖醿濁儣醿甠醿儯醿梍醿炨儛醿燺醿ㄡ儛醿�'.split('_'),
        weekdaysMin : '醿欋儠_醿濁儬_醿♂儛_醿濁儣_醿儯_醿炨儛_醿ㄡ儛'.split('_'),
        longDateFormat : {
            LT : 'h:mm A',
            LTS : 'h:mm:ss A',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[醿撫儲醿斸儭] LT[-醿栣償]',
            nextDay : '[醿儠醿愥儦] LT[-醿栣償]',
            lastDay : '[醿掅儯醿ㄡ儤醿淽 LT[-醿栣償]',
            nextWeek : '[醿ㄡ償醿涐儞醿斸儝] dddd LT[-醿栣償]',
            lastWeek : '[醿儤醿溼儛] dddd LT-醿栣償',
            sameElse : 'L'
        },
        relativeTime : {
            future : function (s) {
                return (/(醿儛醿涐儤|醿儯醿椺儤|醿♂儛醿愥儣醿榺醿償醿氠儤)/).test(s) ?
                    s.replace(/醿�$/, '醿ㄡ儤') :
                    s + '醿ㄡ儤';
            },
            past : function (s) {
                if ((/(醿儛醿涐儤|醿儯醿椺儤|醿♂儛醿愥儣醿榺醿撫儲醿攟醿椺儠醿�)/).test(s)) {
                    return s.replace(/(醿榺醿�)$/, '醿樶儭 醿儤醿�');
                }
                if ((/醿償醿氠儤/).test(s)) {
                    return s.replace(/醿償醿氠儤$/, '醿儦醿樶儭 醿儤醿�');
                }
            },
            s : '醿犪儛醿涐儞醿斸儨醿樶儧醿� 醿儛醿涐儤',
            m : '醿儯醿椺儤',
            mm : '%d 醿儯醿椺儤',
            h : '醿♂儛醿愥儣醿�',
            hh : '%d 醿♂儛醿愥儣醿�',
            d : '醿撫儲醿�',
            dd : '%d 醿撫儲醿�',
            M : '醿椺儠醿�',
            MM : '%d 醿椺儠醿�',
            y : '醿償醿氠儤',
            yy : '%d 醿償醿氠儤'
        },
        ordinalParse: /0|1-醿氠儤|醿涐償-\d{1,2}|\d{1,2}-醿�/,
        ordinal : function (number) {
            if (number === 0) {
                return number;
            }

            if (number === 1) {
                return number + '-醿氠儤';
            }

            if ((number < 20) || (number <= 100 && (number % 20 === 0)) || (number % 100 === 0)) {
                return '醿涐償-' + number;
            }

            return number + '-醿�';
        },
        week : {
            dow : 1,
            doy : 7
        }
    });
}));
// moment.js locale configuration
// locale : khmer (km)
// author : Kruy Vanna : https://github.com/kruyvanna

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('km', {
        months: '釣樶瀫釣氠灦_釣€釣会灅釤掅灄釤坃釣樶灧釣撫灦_釣樶焷釣熱灦_釣п灍釣椺灦_釣樶灧釣愥灮釣撫灦_釣€釣€釤掅瀫釣娽灦_釣熱灨釣犪灦_釣€釣夅煉釣夅灦_釣忈灮釣涐灦_釣溼灧釣呩煉釣嗎灧釣€釣禵釣掅煉釣撫灱'.split('_'),
        monthsShort: '釣樶瀫釣氠灦_釣€釣会灅釤掅灄釤坃釣樶灧釣撫灦_釣樶焷釣熱灦_釣п灍釣椺灦_釣樶灧釣愥灮釣撫灦_釣€釣€釤掅瀫釣娽灦_釣熱灨釣犪灦_釣€釣夅煉釣夅灦_釣忈灮釣涐灦_釣溼灧釣呩煉釣嗎灧釣€釣禵釣掅煉釣撫灱'.split('_'),
        weekdays: '釣⑨灦釣戓灧釣忈煉釣檁釣呩煇釣撫煉釣慱釣⑨瀯釤掅瀭釣夺灇_釣栣灮釣抇釣栣煉釣氠灎釣熱煉釣斸瀼釣丰煃_釣熱灮釣€釤掅灇_釣熱焻釣氠煃'.split('_'),
        weekdaysShort: '釣⑨灦釣戓灧釣忈煉釣檁釣呩煇釣撫煉釣慱釣⑨瀯釤掅瀭釣夺灇_釣栣灮釣抇釣栣煉釣氠灎釣熱煉釣斸瀼釣丰煃_釣熱灮釣€釤掅灇_釣熱焻釣氠煃'.split('_'),
        weekdaysMin: '釣⑨灦釣戓灧釣忈煉釣檁釣呩煇釣撫煉釣慱釣⑨瀯釤掅瀭釣夺灇_釣栣灮釣抇釣栣煉釣氠灎釣熱煉釣斸瀼釣丰煃_釣熱灮釣€釤掅灇_釣熱焻釣氠煃'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            LTS : 'LT:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[釣愥煉釣勧焹釣撫焾 釣樶焿釤勧瀯] LT',
            nextDay: '[釣熱煉釣⑨焸釣€ 釣樶焿釤勧瀯] LT',
            nextWeek: 'dddd [釣樶焿釤勧瀯] LT',
            lastDay: '[釣樶煉釣熱灧釣涐灅釣丰瀴 釣樶焿釤勧瀯] LT',
            lastWeek: 'dddd [釣熱灁釤掅瀼釣夺灎釤嶀灅釣会灀] [釣樶焿釤勧瀯] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s釣戓焵釣�',
            past: '%s釣樶灮釣�',
            s: '釣斸焿釣会灀釤掅灅釣夺灀釣溼灧釣撫灦釣戓灨',
            m: '釣樶灲釣欋灀釣夺瀾釣�',
            mm: '%d 釣撫灦釣戓灨',
            h: '釣樶灲釣欋灅釤夅焺釣�',
            hh: '%d 釣樶焿釤勧瀯',
            d: '釣樶灲釣欋瀽釤掅瀯釤�',
            dd: '%d 釣愥煉釣勧焹',
            M: '釣樶灲釣欋瀬釤�',
            MM: '%d 釣佱焸',
            y: '釣樶灲釣欋瀱釤掅灀釣夺焼',
            yy: '%d 釣嗎煉釣撫灦釤�'
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : korean (ko)
//
// authors
//
// - Kyungwook, Park : https://github.com/kyungw00k
// - Jeeeyul Lee <jeeeyul@gmail.com>
(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ko', {
        months : '1鞗擾2鞗擾3鞗擾4鞗擾5鞗擾6鞗擾7鞗擾8鞗擾9鞗擾10鞗擾11鞗擾12鞗�'.split('_'),
        monthsShort : '1鞗擾2鞗擾3鞗擾4鞗擾5鞗擾6鞗擾7鞗擾8鞗擾9鞗擾10鞗擾11鞗擾12鞗�'.split('_'),
        weekdays : '鞚检殧鞚糭鞗旍殧鞚糭頇旍殧鞚糭靾橃殧鞚糭氇╈殧鞚糭旮堨殧鞚糭韱犾殧鞚�'.split('_'),
        weekdaysShort : '鞚糭鞗擾頇擾靾榑氇旮坃韱�'.split('_'),
        weekdaysMin : '鞚糭鞗擾頇擾靾榑氇旮坃韱�'.split('_'),
        longDateFormat : {
            LT : 'A h鞁� m攵�',
            LTS : 'A h鞁� m攵� s齑�',
            L : 'YYYY.MM.DD',
            LL : 'YYYY雲� MMMM D鞚�',
            LLL : 'YYYY雲� MMMM D鞚� LT',
            LLLL : 'YYYY雲� MMMM D鞚� dddd LT'
        },
        calendar : {
            sameDay : '鞓る姌 LT',
            nextDay : '雮挫澕 LT',
            nextWeek : 'dddd LT',
            lastDay : '鞏挫牅 LT',
            lastWeek : '歆€雮滌＜ dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s 頉�',
            past : '%s 鞝�',
            s : '氇囲磮',
            ss : '%d齑�',
            m : '鞚茧秳',
            mm : '%d攵�',
            h : '頃滌嫓臧�',
            hh : '%d鞁滉皠',
            d : '頃橂（',
            dd : '%d鞚�',
            M : '頃滊嫭',
            MM : '%d雼�',
            y : '鞚茧厔',
            yy : '%d雲�'
        },
        ordinalParse : /\d{1,2}鞚�/,
        ordinal : '%d鞚�',
        meridiemParse : /鞓れ爠|鞓ろ泟/,
        isPM : function (token) {
            return token === '鞓ろ泟';
        },
        meridiem : function (hour, minute, isUpper) {
            return hour < 12 ? '鞓れ爠' : '鞓ろ泟';
        }
    });
}));
// moment.js locale configuration
// locale : Luxembourgish (lb)
// author : mweimerskirch : https://github.com/mweimerskirch, David Raison : https://github.com/kwisatz

// Note: Luxembourgish has a very particular phonological rule ('Eifeler Regel') that causes the
// deletion of the final 'n' in certain contexts. That's what the 'eifelerRegelAppliesToWeekday'
// and 'eifelerRegelAppliesToNumber' methods are meant for

(function (factory) {
    factory(moment);
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': ['eng Minutt', 'enger Minutt'],
            'h': ['eng Stonn', 'enger Stonn'],
            'd': ['een Dag', 'engem Dag'],
            'M': ['ee Mount', 'engem Mount'],
            'y': ['ee Joer', 'engem Joer']
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }

    function processFutureTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'a ' + string;
        }
        return 'an ' + string;
    }

    function processPastTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'viru ' + string;
        }
        return 'virun ' + string;
    }

    /**
     * Returns true if the word before the given number loses the '-n' ending.
     * e.g. 'an 10 Deeg' but 'a 5 Deeg'
     *
     * @param number {integer}
     * @returns {boolean}
     */
    function eifelerRegelAppliesToNumber(number) {
        number = parseInt(number, 10);
        if (isNaN(number)) {
            return false;
        }
        if (number < 0) {
            // Negative Number --> always true
            return true;
        } else if (number < 10) {
            // Only 1 digit
            if (4 <= number && number <= 7) {
                return true;
            }
            return false;
        } else if (number < 100) {
            // 2 digits
            var lastDigit = number % 10, firstDigit = number / 10;
            if (lastDigit === 0) {
                return eifelerRegelAppliesToNumber(firstDigit);
            }
            return eifelerRegelAppliesToNumber(lastDigit);
        } else if (number < 10000) {
            // 3 or 4 digits --> recursively check first digit
            while (number >= 10) {
                number = number / 10;
            }
            return eifelerRegelAppliesToNumber(number);
        } else {
            // Anything larger than 4 digits: recursively check first n-3 digits
            number = number / 1000;
            return eifelerRegelAppliesToNumber(number);
        }
    }

    return moment.defineLocale('lb', {
        months: 'Januar_Februar_M盲erz_Abr毛ll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays: 'Sonndeg_M茅indeg_D毛nschdeg_M毛ttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
        weekdaysShort: 'So._M茅._D毛._M毛._Do._Fr._Sa.'.split('_'),
        weekdaysMin: 'So_M茅_D毛_M毛_Do_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'H:mm [Auer]',
            LTS: 'H:mm:ss [Auer]',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Haut um] LT',
            sameElse: 'L',
            nextDay: '[Muer um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[G毛schter um] LT',
            lastWeek: function () {
                // Different date string for 'D毛nschdeg' (Tuesday) and 'Donneschdeg' (Thursday) due to phonological rule
                switch (this.day()) {
                    case 2:
                    case 4:
                        return '[Leschten] dddd [um] LT';
                    default:
                        return '[Leschte] dddd [um] LT';
                }
            }
        },
        relativeTime : {
            future : processFutureTime,
            past : processPastTime,
            s : 'e puer Sekonnen',
            m : processRelativeTime,
            mm : '%d Minutten',
            h : processRelativeTime,
            hh : '%d Stonnen',
            d : processRelativeTime,
            dd : '%d Deeg',
            M : processRelativeTime,
            MM : '%d M茅int',
            y : processRelativeTime,
            yy : '%d Joer'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Lithuanian (lt)
// author : Mindaugas Moz奴ras : https://github.com/mmozuras

(function (factory) {
    factory(moment);
}(function (moment) {
    var units = {
        'm' : 'minut臈_minut臈s_minut臋',
        'mm': 'minut臈s_minu膷i懦_minutes',
        'h' : 'valanda_valandos_valand膮',
        'hh': 'valandos_valand懦_valandas',
        'd' : 'diena_dienos_dien膮',
        'dd': 'dienos_dien懦_dienas',
        'M' : 'm臈nuo_m臈nesio_m臈nes寞',
        'MM': 'm臈nesiai_m臈nesi懦_m臈nesius',
        'y' : 'metai_met懦_metus',
        'yy': 'metai_met懦_metus'
    },
    weekDays = 'sekmadienis_pirmadienis_antradienis_tre膷iadienis_ketvirtadienis_penktadienis_拧e拧tadienis'.split('_');

    function translateSeconds(number, withoutSuffix, key, isFuture) {
        if (withoutSuffix) {
            return 'kelios sekund臈s';
        } else {
            return isFuture ? 'keli懦 sekund啪i懦' : 'kelias sekundes';
        }
    }

    function translateSingular(number, withoutSuffix, key, isFuture) {
        return withoutSuffix ? forms(key)[0] : (isFuture ? forms(key)[1] : forms(key)[2]);
    }

    function special(number) {
        return number % 10 === 0 || (number > 10 && number < 20);
    }

    function forms(key) {
        return units[key].split('_');
    }

    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        if (number === 1) {
            return result + translateSingular(number, withoutSuffix, key[0], isFuture);
        } else if (withoutSuffix) {
            return result + (special(number) ? forms(key)[1] : forms(key)[0]);
        } else {
            if (isFuture) {
                return result + forms(key)[1];
            } else {
                return result + (special(number) ? forms(key)[1] : forms(key)[2]);
            }
        }
    }

    function relativeWeekDay(moment, format) {
        var nominative = format.indexOf('dddd HH:mm') === -1,
            weekDay = weekDays[moment.day()];

        return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + '寞';
    }

    return moment.defineLocale('lt', {
        months : 'sausio_vasario_kovo_baland啪io_gegu啪臈s_bir啪elio_liepos_rugpj奴膷io_rugs臈jo_spalio_lapkri膷io_gruod啪io'.split('_'),
        monthsShort : 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split('_'),
        weekdays : relativeWeekDay,
        weekdaysShort : 'Sek_Pir_Ant_Tre_Ket_Pen_艩e拧'.split('_'),
        weekdaysMin : 'S_P_A_T_K_Pn_艩'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'YYYY-MM-DD',
            LL : 'YYYY [m.] MMMM D [d.]',
            LLL : 'YYYY [m.] MMMM D [d.], LT [val.]',
            LLLL : 'YYYY [m.] MMMM D [d.], dddd, LT [val.]',
            l : 'YYYY-MM-DD',
            ll : 'YYYY [m.] MMMM D [d.]',
            lll : 'YYYY [m.] MMMM D [d.], LT [val.]',
            llll : 'YYYY [m.] MMMM D [d.], ddd, LT [val.]'
        },
        calendar : {
            sameDay : '[艩iandien] LT',
            nextDay : '[Rytoj] LT',
            nextWeek : 'dddd LT',
            lastDay : '[Vakar] LT',
            lastWeek : '[Pra臈jus寞] dddd LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'po %s',
            past : 'prie拧 %s',
            s : translateSeconds,
            m : translateSingular,
            mm : translate,
            h : translateSingular,
            hh : translate,
            d : translateSingular,
            dd : translate,
            M : translateSingular,
            MM : translate,
            y : translateSingular,
            yy : translate
        },
        ordinalParse: /\d{1,2}-oji/,
        ordinal : function (number) {
            return number + '-oji';
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : latvian (lv)
// author : Kristaps Karlsons : https://github.com/skakri

(function (factory) {
    factory(moment);
}(function (moment) {
    var units = {
        'mm': 'min奴ti_min奴tes_min奴te_min奴tes',
        'hh': 'stundu_stundas_stunda_stundas',
        'dd': 'dienu_dienas_diena_dienas',
        'MM': 'm膿nesi_m膿ne拧us_m膿nesis_m膿ne拧i',
        'yy': 'gadu_gadus_gads_gadi'
    };

    function format(word, number, withoutSuffix) {
        var forms = word.split('_');
        if (withoutSuffix) {
            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
        } else {
            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
        }
    }

    function relativeTimeWithPlural(number, withoutSuffix, key) {
        return number + ' ' + format(units[key], number, withoutSuffix);
    }

    return moment.defineLocale('lv', {
        months : 'janv膩ris_febru膩ris_marts_apr墨lis_maijs_j奴nijs_j奴lijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_j奴n_j奴l_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 'sv膿tdiena_pirmdiena_otrdiena_tre拧diena_ceturtdiena_piektdiena_sestdiena'.split('_'),
        weekdaysShort : 'Sv_P_O_T_C_Pk_S'.split('_'),
        weekdaysMin : 'Sv_P_O_T_C_Pk_S'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'YYYY. [gada] D. MMMM',
            LLL : 'YYYY. [gada] D. MMMM, LT',
            LLLL : 'YYYY. [gada] D. MMMM, dddd, LT'
        },
        calendar : {
            sameDay : '[艩odien pulksten] LT',
            nextDay : '[R墨t pulksten] LT',
            nextWeek : 'dddd [pulksten] LT',
            lastDay : '[Vakar pulksten] LT',
            lastWeek : '[Pag膩ju拧膩] dddd [pulksten] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s v膿l膩k',
            past : '%s agr膩k',
            s : 'da啪as sekundes',
            m : 'min奴ti',
            mm : relativeTimeWithPlural,
            h : 'stundu',
            hh : relativeTimeWithPlural,
            d : 'dienu',
            dd : relativeTimeWithPlural,
            M : 'm膿nesi',
            MM : relativeTimeWithPlural,
            y : 'gadu',
            yy : relativeTimeWithPlural
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : macedonian (mk)
// author : Borislav Mickov : https://github.com/B0k0

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('mk', {
        months : '褬邪薪褍邪褉懈_褎械胁褉褍邪褉懈_屑邪褉褌_邪锌褉懈谢_屑邪褬_褬褍薪懈_褬褍谢懈_邪胁谐褍褋褌_褋械锌褌械屑胁褉懈_芯泻褌芯屑胁褉懈_薪芯械屑胁褉懈_写械泻械屑胁褉懈'.split('_'),
        monthsShort : '褬邪薪_褎械胁_屑邪褉_邪锌褉_屑邪褬_褬褍薪_褬褍谢_邪胁谐_褋械锌_芯泻褌_薪芯械_写械泻'.split('_'),
        weekdays : '薪械写械谢邪_锌芯薪械写械谢薪懈泻_胁褌芯褉薪懈泻_褋褉械写邪_褔械褌胁褉褌芯泻_锌械褌芯泻_褋邪斜芯褌邪'.split('_'),
        weekdaysShort : '薪械写_锌芯薪_胁褌芯_褋褉械_褔械褌_锌械褌_褋邪斜'.split('_'),
        weekdaysMin : '薪e_锌o_胁褌_褋褉_褔械_锌械_褋a'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'D.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[袛械薪械褋 胁芯] LT',
            nextDay : '[校褌褉械 胁芯] LT',
            nextWeek : 'dddd [胁芯] LT',
            lastDay : '[袙褔械褉邪 胁芯] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[袙芯 懈蟹屑懈薪邪褌邪褌邪] dddd [胁芯] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[袙芯 懈蟹屑懈薪邪褌懈芯褌] dddd [胁芯] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : '锌芯褋谢械 %s',
            past : '锌褉械写 %s',
            s : '薪械泻芯谢泻褍 褋械泻褍薪写懈',
            m : '屑懈薪褍褌邪',
            mm : '%d 屑懈薪褍褌懈',
            h : '褔邪褋',
            hh : '%d 褔邪褋邪',
            d : '写械薪',
            dd : '%d 写械薪邪',
            M : '屑械褋械褑',
            MM : '%d 屑械褋械褑懈',
            y : '谐芯写懈薪邪',
            yy : '%d 谐芯写懈薪懈'
        },
        ordinalParse: /\d{1,2}-(械胁|械薪|褌懈|胁懈|褉懈|屑懈)/,
        ordinal : function (number) {
            var lastDigit = number % 10,
                last2Digits = number % 100;
            if (number === 0) {
                return number + '-械胁';
            } else if (last2Digits === 0) {
                return number + '-械薪';
            } else if (last2Digits > 10 && last2Digits < 20) {
                return number + '-褌懈';
            } else if (lastDigit === 1) {
                return number + '-胁懈';
            } else if (lastDigit === 2) {
                return number + '-褉懈';
            } else if (lastDigit === 7 || lastDigit === 8) {
                return number + '-屑懈';
            } else {
                return number + '-褌懈';
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : malayalam (ml)
// author : Floyd Pink : https://github.com/floydpink

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ml', {
        months : '啻溹川嗟佮吹啻班纯_啻祮啻祶啻班祦啻掂窗啻縚啻淳嗟监礆嗟嵿礆嗟峗啻忇椽嗟嵿窗啻苦到_啻祰啻祶_啻溹祩嗟篲啻溹祩啻侧祱_啻撪礂啻膏祶啻编祶啻编祶_啻膏祮啻祶啻编祶啻编磦啻导_啻掄磿嗟嵿礋嗟嬥船嗟糭啻ㄠ吹啻傕船嗟糭啻∴纯啻膏磦啻导'.split('_'),
        monthsShort : '啻溹川嗟�._啻祮啻祶啻班祦._啻淳嗟�._啻忇椽嗟嵿窗啻�._啻祰啻祶_啻溹祩嗟篲啻溹祩啻侧祱._啻撪礂._啻膏祮啻祶啻编祶啻�._啻掄磿嗟嵿礋嗟�._啻ㄠ吹啻�._啻∴纯啻膏磦.'.split('_'),
        weekdays : '啻炧淳啻幢啻距创嗟嵿礆_啻む纯啻權祶啻曕闯啻距创嗟嵿礆_啻氞祳啻掂祶啻掂淳啻脆祶啻歘啻祦啻о川啻距创嗟嵿礆_啻掂祶啻淳啻脆淳啻脆祶啻歘啻掂祮啻赤祶啻赤纯啻淳啻脆祶啻歘啻多川啻苦疮啻距创嗟嵿礆'.split('_'),
        weekdaysShort : '啻炧淳啻导_啻む纯啻權祶啻曕稻_啻氞祳啻掂祶啻礯啻祦啻о祷_啻掂祶啻淳啻脆磦_啻掂祮啻赤祶啻赤纯_啻多川啻�'.split('_'),
        weekdaysMin : '啻炧淳_啻む纯_啻氞祳_啻祦_啻掂祶啻淳_啻掂祮_啻�'.split('_'),
        longDateFormat : {
            LT : 'A h:mm -啻ㄠ祦',
            LTS : 'A h:mm:ss -啻ㄠ祦',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[啻囙川嗟嵿川嗟峕 LT',
            nextDay : '[啻ㄠ淳啻赤祮] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[啻囙川嗟嵿川啻侧祮] LT',
            lastWeek : '[啻曕创啻苦礊嗟嵿礊] dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s 啻曕创啻苦礊嗟嵿礊嗟�',
            past : '%s 啻祦嗟秽椽嗟�',
            s : '啻呧到啻� 啻ㄠ纯啻纯啻粪礄嗟嵿礄嗟�',
            m : '啻掄窗嗟� 啻纯啻ㄠ纯啻编祶啻编祶',
            mm : '%d 啻纯啻ㄠ纯啻编祶啻编祶',
            h : '啻掄窗嗟� 啻矗啻苦磿嗟嵿磿嗟傕导',
            hh : '%d 啻矗啻苦磿嗟嵿磿嗟傕导',
            d : '啻掄窗嗟� 啻︵纯啻掂锤啻�',
            dd : '%d 啻︵纯啻掂锤啻�',
            M : '啻掄窗嗟� 啻淳啻膏磦',
            MM : '%d 啻淳啻膏磦',
            y : '啻掄窗嗟� 啻掂导啻粪磦',
            yy : '%d 啻掂导啻粪磦'
        },
        meridiemParse: /啻班淳啻む祶啻班纯|啻班淳啻掂纯啻侧祮|啻夃礆嗟嵿礆 啻曕创啻苦礊嗟嵿礊嗟峾啻掂祱啻曕祦啻ㄠ祶啻ㄠ祰啻班磦|啻班淳啻む祶啻班纯/i,
        isPM : function (input) {
            return /^(啻夃礆嗟嵿礆 啻曕创啻苦礊嗟嵿礊嗟峾啻掂祱啻曕祦啻ㄠ祶啻ㄠ祰啻班磦|啻班淳啻む祶啻班纯)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return '啻班淳啻む祶啻班纯';
            } else if (hour < 12) {
                return '啻班淳啻掂纯啻侧祮';
            } else if (hour < 17) {
                return '啻夃礆嗟嵿礆 啻曕创啻苦礊嗟嵿礊嗟�';
            } else if (hour < 20) {
                return '啻掂祱啻曕祦啻ㄠ祶啻ㄠ祰啻班磦';
            } else {
                return '啻班淳啻む祶啻班纯';
            }
        }
    });
}));
// moment.js locale configuration
// locale : Marathi (mr)
// author : Harshad Kale : https://github.com/kalehv

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '啷�',
        '2': '啷�',
        '3': '啷�',
        '4': '啷�',
        '5': '啷�',
        '6': '啷�',
        '7': '啷�',
        '8': '啷�',
        '9': '啷�',
        '0': '啷�'
    },
    numberMap = {
        '啷�': '1',
        '啷�': '2',
        '啷�': '3',
        '啷�': '4',
        '啷�': '5',
        '啷�': '6',
        '啷�': '7',
        '啷�': '8',
        '啷�': '9',
        '啷�': '0'
    };

    return moment.defineLocale('mr', {
        months : '啶溹ぞ啶ㄠ啶掂ぞ啶班_啶啶啶班啶掂ぞ啶班_啶ぞ啶班啶歘啶忇お啷嵿ぐ啶苦げ_啶_啶溹啶╛啶溹啶侧_啶戉啶膏啶焈啶膏お啷嵿啷囙啶ぐ_啶戉啷嵿啷嬥が啶癬啶ㄠ啶掂啶灌啶傕が啶癬啶∴た啶膏啶傕が啶�'.split('_'),
        monthsShort: '啶溹ぞ啶ㄠ._啶啶啶班._啶ぞ啶班啶�._啶忇お啷嵿ぐ啶�._啶._啶溹啶�._啶溹啶侧._啶戉._啶膏お啷嵿啷囙._啶戉啷嵿啷�._啶ㄠ啶掂啶灌啶�._啶∴た啶膏啶�.'.split('_'),
        weekdays : '啶班さ啶苦さ啶距ぐ_啶膏啶さ啶距ぐ_啶啶椸こ啶掂ぞ啶癬啶啶оさ啶距ぐ_啶椸啶班啶掂ぞ啶癬啶多啶曕啶班さ啶距ぐ_啶多え啶苦さ啶距ぐ'.split('_'),
        weekdaysShort : '啶班さ啶縚啶膏啶甠啶啶椸こ_啶啶啶椸啶班_啶多啶曕啶癬啶多え啶�'.split('_'),
        weekdaysMin : '啶癬啶膏_啶_啶_啶椸_啶多_啶�'.split('_'),
        longDateFormat : {
            LT : 'A h:mm 啶掂ぞ啶溹い啶�',
            LTS : 'A h:mm:ss 啶掂ぞ啶溹い啶�',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[啶嗋] LT',
            nextDay : '[啶夃う啷嵿く啶綸 LT',
            nextWeek : 'dddd, LT',
            lastDay : '[啶曕ぞ啶瞉 LT',
            lastWeek: '[啶ぞ啶椸啶瞉 dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s 啶ㄠ啶むぐ',
            past : '%s 啶啶班啶掂',
            s : '啶膏啶曕啶�',
            m: '啶忇 啶た啶ㄠた啶�',
            mm: '%d 啶た啶ㄠた啶熰',
            h : '啶忇 啶むぞ啶�',
            hh : '%d 啶むぞ啶�',
            d : '啶忇 啶︵た啶掂じ',
            dd : '%d 啶︵た啶掂じ',
            M : '啶忇 啶す啶苦え啶�',
            MM : '%d 啶す啶苦え啷�',
            y : '啶忇 啶掂ぐ啷嵿し',
            yy : '%d 啶掂ぐ啷嵿し啷�'
        },
        preparse: function (string) {
            return string.replace(/[啷оエ啷┼オ啷ガ啷ギ啷ウ]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiemParse: /啶班ぞ啶む啶班|啶膏啶距こ啷€|啶︵啶ぞ啶班|啶膏ぞ啶啶曕ぞ啶赤/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === '啶班ぞ啶む啶班') {
                return hour < 4 ? hour : hour + 12;
            } else if (meridiem === '啶膏啶距こ啷€') {
                return hour;
            } else if (meridiem === '啶︵啶ぞ啶班') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === '啶膏ぞ啶啶曕ぞ啶赤') {
                return hour + 12;
            }
        },
        meridiem: function (hour, minute, isLower)
        {
            if (hour < 4) {
                return '啶班ぞ啶む啶班';
            } else if (hour < 10) {
                return '啶膏啶距こ啷€';
            } else if (hour < 17) {
                return '啶︵啶ぞ啶班';
            } else if (hour < 20) {
                return '啶膏ぞ啶啶曕ぞ啶赤';
            } else {
                return '啶班ぞ啶む啶班';
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Bahasa Malaysia (ms-MY)
// author : Weldan Jamili : https://github.com/weldan

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('ms-my', {
        months : 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
        monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
        weekdays : 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
        weekdaysShort : 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
        weekdaysMin : 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat : {
            LT : 'HH.mm',
            LTS : 'LT.ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY [pukul] LT',
            LLLL : 'dddd, D MMMM YYYY [pukul] LT'
        },
        meridiemParse: /pagi|tengahari|petang|malam/,
        meridiemHour: function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === 'pagi') {
                return hour;
            } else if (meridiem === 'tengahari') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === 'petang' || meridiem === 'malam') {
                return hour + 12;
            }
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'tengahari';
            } else if (hours < 19) {
                return 'petang';
            } else {
                return 'malam';
            }
        },
        calendar : {
            sameDay : '[Hari ini pukul] LT',
            nextDay : '[Esok pukul] LT',
            nextWeek : 'dddd [pukul] LT',
            lastDay : '[Kelmarin pukul] LT',
            lastWeek : 'dddd [lepas pukul] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'dalam %s',
            past : '%s yang lepas',
            s : 'beberapa saat',
            m : 'seminit',
            mm : '%d minit',
            h : 'sejam',
            hh : '%d jam',
            d : 'sehari',
            dd : '%d hari',
            M : 'sebulan',
            MM : '%d bulan',
            y : 'setahun',
            yy : '%d tahun'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Burmese (my)
// author : Squar team, mysquar.com

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '醽�',
        '2': '醽�',
        '3': '醽�',
        '4': '醽�',
        '5': '醽�',
        '6': '醽�',
        '7': '醽�',
        '8': '醽�',
        '9': '醽�',
        '0': '醽€'
    }, numberMap = {
        '醽�': '1',
        '醽�': '2',
        '醽�': '3',
        '醽�': '4',
        '醽�': '5',
        '醽�': '6',
        '醽�': '7',
        '醽�': '8',
        '醽�': '9',
        '醽€': '0'
    };
    return moment.defineLocale('my', {
        months: '醼囜€斸€横€斸€濁€€涐€甠醼栣€贬€栣€贬€€横€濁€€涐€甠醼欋€愥€篲醼п€曖€坚€甠醼欋€盻醼囜€结€斸€篲醼囜€搬€溼€€€勧€篲醼炨€坚€傖€€愥€篲醼呩€€醼横€愥€勧€横€樶€琠醼♂€贬€€€醼横€愥€€€樶€琠醼斸€€€濁€勧€横€樶€琠醼掅€€囜€勧€横€樶€�'.split('_'),
        monthsShort: '醼囜€斸€篲醼栣€盻醼欋€愥€篲醼曖€坚€甠醼欋€盻醼囜€结€斸€篲醼溼€€€勧€篲醼炨€糭醼呩€€醼篲醼♂€贬€€€醼篲醼斸€€痏醼掅€�'.split('_'),
        weekdays: '醼愥€斸€勧€横€贯€傖€斸€结€盻醼愥€斸€勧€横€贯€溼€琠醼♂€勧€横€贯€傖€玙醼椺€€掅€贯€撫€熱€搬€竉醼€醼坚€€炨€曖€愥€贬€竉醼炨€贬€€€醼坚€琠醼呩€斸€�'.split('_'),
        weekdaysShort: '醼斸€结€盻醼溼€琠醼勧€横€贯€傖€玙醼熱€搬€竉醼€醼坚€琠醼炨€贬€琠醼斸€�'.split('_'),
        weekdaysMin: '醼斸€结€盻醼溼€琠醼勧€横€贯€傖€玙醼熱€搬€竉醼€醼坚€琠醼炨€贬€琠醼斸€�'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[醼氠€斸€�.] LT [醼欋€踞€琞',
            nextDay: '[醼欋€斸€€醼横€栣€坚€斸€篯 LT [醼欋€踞€琞',
            nextWeek: 'dddd LT [醼欋€踞€琞',
            lastDay: '[醼欋€斸€�.醼€] LT [醼欋€踞€琞',
            lastWeek: '[醼曖€坚€€羔€佱€册€丰€炨€贬€琞 dddd LT [醼欋€踞€琞',
            sameElse: 'L'
        },
        relativeTime: {
            future: '醼溼€€欋€娽€横€� %s 醼欋€踞€�',
            past: '醼溼€结€斸€横€佱€册€丰€炨€贬€� %s 醼€',
            s: '醼呩€€醼贯€€醼斸€�.醼♂€斸€娽€横€羔€勧€氠€�',
            m: '醼愥€呩€横€欋€€斸€呩€�',
            mm: '%d 醼欋€€斸€呩€�',
            h: '醼愥€呩€横€斸€€涐€�',
            hh: '%d 醼斸€€涐€�',
            d: '醼愥€呩€横€涐€€醼�',
            dd: '%d 醼涐€€醼�',
            M: '醼愥€呩€横€�',
            MM: '%d 醼�',
            y: '醼愥€呩€横€斸€踞€呩€�',
            yy: '%d 醼斸€踞€呩€�'
        },
        preparse: function (string) {
            return string.replace(/[醽佱亗醽冡亜醽呩亞醽囜亪醽夅亐]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4 // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : norwegian bokm氓l (nb)
// authors : Espen Hovlandsdal : https://github.com/rexxars
//           Sigurd Gartmann : https://github.com/sigurdga

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('nb', {
        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 's酶ndag_mandag_tirsdag_onsdag_torsdag_fredag_l酶rdag'.split('_'),
        weekdaysShort : 's酶n_man_tirs_ons_tors_fre_l酶r'.split('_'),
        weekdaysMin : 's酶_ma_ti_on_to_fr_l酶'.split('_'),
        longDateFormat : {
            LT : 'H.mm',
            LTS : 'LT.ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY [kl.] LT',
            LLLL : 'dddd D. MMMM YYYY [kl.] LT'
        },
        calendar : {
            sameDay: '[i dag kl.] LT',
            nextDay: '[i morgen kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[i g氓r kl.] LT',
            lastWeek: '[forrige] dddd [kl.] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'for %s siden',
            s : 'noen sekunder',
            m : 'ett minutt',
            mm : '%d minutter',
            h : 'en time',
            hh : '%d timer',
            d : 'en dag',
            dd : '%d dager',
            M : 'en m氓ned',
            MM : '%d m氓neder',
            y : 'ett 氓r',
            yy : '%d 氓r'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : nepali/nepalese
// author : suvash : https://github.com/suvash

(function (factory) {
    factory(moment);
}(function (moment) {
    var symbolMap = {
        '1': '啷�',
        '2': '啷�',
        '3': '啷�',
        '4': '啷�',
        '5': '啷�',
        '6': '啷�',
        '7': '啷�',
        '8': '啷�',
        '9': '啷�',
        '0': '啷�'
    },
    numberMap = {
        '啷�': '1',
        '啷�': '2',
        '啷�': '3',
        '啷�': '4',
        '啷�': '5',
        '啷�': '6',
        '啷�': '7',
        '啷�': '8',
        '啷�': '9',
        '啷�': '0'
    };

    return moment.defineLocale('ne', {
        months : '啶溹え啶掂ぐ啷€_啶啶啶班啶掂ぐ啷€_啶ぞ啶班啶歘啶呧お啷嵿ぐ啶苦げ_啶_啶溹啶╛啶溹啶侧ぞ啶坃啶呧啶粪啶焈啶膏啶啶熰啶啶ぐ_啶呧啷嵿啷嬥が啶癬啶ㄠ啶啶啶ぐ_啶∴た啶膏啶啶ぐ'.split('_'),
        monthsShort : '啶溹え._啶啶啶班._啶ぞ啶班啶歘啶呧お啷嵿ぐ啶�._啶_啶溹啶╛啶溹啶侧ぞ啶�._啶呧._啶膏啶啶�._啶呧啷嵿啷�._啶ㄠ啶._啶∴た啶膏.'.split('_'),
        weekdays : '啶嗋啶むが啶距ぐ_啶膏啶が啶距ぐ_啶啷嵿啶侧が啶距ぐ_啶啶оが啶距ぐ_啶た啶灌た啶ぞ啶癬啶多啶曕啶班が啶距ぐ_啶多え啶苦が啶距ぐ'.split('_'),
        weekdaysShort : '啶嗋啶�._啶膏啶�._啶啷嵿啶�._啶啶�._啶た啶灌た._啶多啶曕啶�._啶多え啶�.'.split('_'),
        weekdaysMin : '啶嗋._啶膏._啶啷峗啶._啶た._啶多._啶�.'.split('_'),
        longDateFormat : {
            LT : 'A啶曕 h:mm 啶啷�',
            LTS : 'A啶曕 h:mm:ss 啶啷�',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        preparse: function (string) {
            return string.replace(/[啷оエ啷┼オ啷ガ啷ギ啷ウ]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiemParse: /啶班ぞ啶む|啶た啶灌ぞ啶▅啶︵た啶夃啶膏|啶啶侧啶曕ぞ|啶膏ぞ啶佮|啶班ぞ啶む/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === '啶班ぞ啶む') {
                return hour < 3 ? hour : hour + 12;
            } else if (meridiem === '啶た啶灌ぞ啶�') {
                return hour;
            } else if (meridiem === '啶︵た啶夃啶膏') {
                return hour >= 10 ? hour : hour + 12;
            } else if (meridiem === '啶啶侧啶曕ぞ' || meridiem === '啶膏ぞ啶佮') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 3) {
                return '啶班ぞ啶む';
            } else if (hour < 10) {
                return '啶た啶灌ぞ啶�';
            } else if (hour < 15) {
                return '啶︵た啶夃啶膏';
            } else if (hour < 18) {
                return '啶啶侧啶曕ぞ';
            } else if (hour < 20) {
                return '啶膏ぞ啶佮';
            } else {
                return '啶班ぞ啶む';
            }
        },
        calendar : {
            sameDay : '[啶嗋] LT',
            nextDay : '[啶啶侧] LT',
            nextWeek : '[啶嗋啶佮う啷媇 dddd[,] LT',
            lastDay : '[啶灌た啶溹] LT',
            lastWeek : '[啶椸啶曕] dddd[,] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s啶ぞ',
            past : '%s 啶呧啶距ぁ啷€',
            s : '啶曕啶灌 啶膏ぎ啶�',
            m : '啶忇 啶た啶ㄠ啶�',
            mm : '%d 啶た啶ㄠ啶�',
            h : '啶忇 啶樴ぃ啷嵿啶�',
            hh : '%d 啶樴ぃ啷嵿啶�',
            d : '啶忇 啶︵た啶�',
            dd : '%d 啶︵た啶�',
            M : '啶忇 啶す啶苦え啶�',
            MM : '%d 啶す啶苦え啶�',
            y : '啶忇 啶ぐ啷嵿し',
            yy : '%d 啶ぐ啷嵿し'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : dutch (nl)
// author : Joris R枚ling : https://github.com/jjupiter

(function (factory) {
    factory(moment);
}(function (moment) {
    var monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'),
        monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');

    return moment.defineLocale('nl', {
        months : 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShortWithoutDots[m.month()];
            } else {
                return monthsShortWithDots[m.month()];
            }
        },
        weekdays : 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
        weekdaysShort : 'zo._ma._di._wo._do._vr._za.'.split('_'),
        weekdaysMin : 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD-MM-YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[vandaag om] LT',
            nextDay: '[morgen om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[gisteren om] LT',
            lastWeek: '[afgelopen] dddd [om] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'over %s',
            past : '%s geleden',
            s : 'een paar seconden',
            m : '茅茅n minuut',
            mm : '%d minuten',
            h : '茅茅n uur',
            hh : '%d uur',
            d : '茅茅n dag',
            dd : '%d dagen',
            M : '茅茅n maand',
            MM : '%d maanden',
            y : '茅茅n jaar',
            yy : '%d jaar'
        },
        ordinalParse: /\d{1,2}(ste|de)/,
        ordinal : function (number) {
            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : norwegian nynorsk (nn)
// author : https://github.com/mechuwind

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('nn', {
        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays : 'sundag_m氓ndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
        weekdaysShort : 'sun_m氓n_tys_ons_tor_fre_lau'.split('_'),
        weekdaysMin : 'su_m氓_ty_on_to_fr_l酶'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[I dag klokka] LT',
            nextDay: '[I morgon klokka] LT',
            nextWeek: 'dddd [klokka] LT',
            lastDay: '[I g氓r klokka] LT',
            lastWeek: '[F酶reg氓ande] dddd [klokka] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'for %s sidan',
            s : 'nokre sekund',
            m : 'eit minutt',
            mm : '%d minutt',
            h : 'ein time',
            hh : '%d timar',
            d : 'ein dag',
            dd : '%d dagar',
            M : 'ein m氓nad',
            MM : '%d m氓nader',
            y : 'eit 氓r',
            yy : '%d 氓r'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : polish (pl)
// author : Rafal Hirsz : https://github.com/evoL

(function (factory) {
    factory(moment);
}(function (moment) {
    var monthsNominative = 'stycze艅_luty_marzec_kwiecie艅_maj_czerwiec_lipiec_sierpie艅_wrzesie艅_pa藕dziernik_listopad_grudzie艅'.split('_'),
        monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrze艣nia_pa藕dziernika_listopada_grudnia'.split('_');

    function plural(n) {
        return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
    }

    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'minuta' : 'minut臋';
        case 'mm':
            return result + (plural(number) ? 'minuty' : 'minut');
        case 'h':
            return withoutSuffix  ? 'godzina'  : 'godzin臋';
        case 'hh':
            return result + (plural(number) ? 'godziny' : 'godzin');
        case 'MM':
            return result + (plural(number) ? 'miesi膮ce' : 'miesi臋cy');
        case 'yy':
            return result + (plural(number) ? 'lata' : 'lat');
        }
    }

    return moment.defineLocale('pl', {
        months : function (momentToFormat, format) {
            if (/D MMMM/.test(format)) {
                return monthsSubjective[momentToFormat.month()];
            } else {
                return monthsNominative[momentToFormat.month()];
            }
        },
        monthsShort : 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_pa藕_lis_gru'.split('_'),
        weekdays : 'niedziela_poniedzia艂ek_wtorek_艣roda_czwartek_pi膮tek_sobota'.split('_'),
        weekdaysShort : 'nie_pon_wt_艣r_czw_pt_sb'.split('_'),
        weekdaysMin : 'N_Pn_Wt_艢r_Cz_Pt_So'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Dzi艣 o] LT',
            nextDay: '[Jutro o] LT',
            nextWeek: '[W] dddd [o] LT',
            lastDay: '[Wczoraj o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[W zesz艂膮 niedziel臋 o] LT';
                case 3:
                    return '[W zesz艂膮 艣rod臋 o] LT';
                case 6:
                    return '[W zesz艂膮 sobot臋 o] LT';
                default:
                    return '[W zesz艂y] dddd [o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : '%s temu',
            s : 'kilka sekund',
            m : translate,
            mm : translate,
            h : translate,
            hh : translate,
            d : '1 dzie艅',
            dd : '%d dni',
            M : 'miesi膮c',
            MM : translate,
            y : 'rok',
            yy : translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : brazilian portuguese (pt-br)
// author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('pt-br', {
        months : 'janeiro_fevereiro_mar莽o_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
        monthsShort : 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
        weekdays : 'domingo_segunda-feira_ter莽a-feira_quarta-feira_quinta-feira_sexta-feira_s谩bado'.split('_'),
        weekdaysShort : 'dom_seg_ter_qua_qui_sex_s谩b'.split('_'),
        weekdaysMin : 'dom_2陋_3陋_4陋_5陋_6陋_s谩b'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY [脿s] LT',
            LLLL : 'dddd, D [de] MMMM [de] YYYY [脿s] LT'
        },
        calendar : {
            sameDay: '[Hoje 脿s] LT',
            nextDay: '[Amanh茫 脿s] LT',
            nextWeek: 'dddd [脿s] LT',
            lastDay: '[Ontem 脿s] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[脷ltimo] dddd [脿s] LT' : // Saturday + Sunday
                    '[脷ltima] dddd [脿s] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'em %s',
            past : '%s atr谩s',
            s : 'segundos',
            m : 'um minuto',
            mm : '%d minutos',
            h : 'uma hora',
            hh : '%d horas',
            d : 'um dia',
            dd : '%d dias',
            M : 'um m锚s',
            MM : '%d meses',
            y : 'um ano',
            yy : '%d anos'
        },
        ordinalParse: /\d{1,2}潞/,
        ordinal : '%d潞'
    });
}));
// moment.js locale configuration
// locale : portuguese (pt)
// author : Jefferson : https://github.com/jalex79

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('pt', {
        months : 'janeiro_fevereiro_mar莽o_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
        monthsShort : 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
        weekdays : 'domingo_segunda-feira_ter莽a-feira_quarta-feira_quinta-feira_sexta-feira_s谩bado'.split('_'),
        weekdaysShort : 'dom_seg_ter_qua_qui_sex_s谩b'.split('_'),
        weekdaysMin : 'dom_2陋_3陋_4陋_5陋_6陋_s谩b'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY LT',
            LLLL : 'dddd, D [de] MMMM [de] YYYY LT'
        },
        calendar : {
            sameDay: '[Hoje 脿s] LT',
            nextDay: '[Amanh茫 脿s] LT',
            nextWeek: 'dddd [脿s] LT',
            lastDay: '[Ontem 脿s] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[脷ltimo] dddd [脿s] LT' : // Saturday + Sunday
                    '[脷ltima] dddd [脿s] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'em %s',
            past : 'h谩 %s',
            s : 'segundos',
            m : 'um minuto',
            mm : '%d minutos',
            h : 'uma hora',
            hh : '%d horas',
            d : 'um dia',
            dd : '%d dias',
            M : 'um m锚s',
            MM : '%d meses',
            y : 'um ano',
            yy : '%d anos'
        },
        ordinalParse: /\d{1,2}潞/,
        ordinal : '%d潞',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : romanian (ro)
// author : Vlad Gurdiga : https://github.com/gurdiga
// author : Valentin Agachi : https://github.com/avaly

(function (factory) {
    factory(moment);
}(function (moment) {
    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': 'minute',
                'hh': 'ore',
                'dd': 'zile',
                'MM': 'luni',
                'yy': 'ani'
            },
            separator = ' ';
        if (number % 100 >= 20 || (number >= 100 && number % 100 === 0)) {
            separator = ' de ';
        }

        return number + separator + format[key];
    }

    return moment.defineLocale('ro', {
        months : 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
        monthsShort : 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
        weekdays : 'duminic膬_luni_mar葲i_miercuri_joi_vineri_s芒mb膬t膬'.split('_'),
        weekdaysShort : 'Dum_Lun_Mar_Mie_Joi_Vin_S芒m'.split('_'),
        weekdaysMin : 'Du_Lu_Ma_Mi_Jo_Vi_S芒'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY H:mm',
            LLLL : 'dddd, D MMMM YYYY H:mm'
        },
        calendar : {
            sameDay: '[azi la] LT',
            nextDay: '[m芒ine la] LT',
            nextWeek: 'dddd [la] LT',
            lastDay: '[ieri la] LT',
            lastWeek: '[fosta] dddd [la] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'peste %s',
            past : '%s 卯n urm膬',
            s : 'c芒teva secunde',
            m : 'un minut',
            mm : relativeTimeWithPlural,
            h : 'o or膬',
            hh : relativeTimeWithPlural,
            d : 'o zi',
            dd : relativeTimeWithPlural,
            M : 'o lun膬',
            MM : relativeTimeWithPlural,
            y : 'un an',
            yy : relativeTimeWithPlural
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : russian (ru)
// author : Viktorminator : https://github.com/Viktorminator
// Author : Menelion Elens煤le : https://github.com/Oire

(function (factory) {
    factory(moment);
}(function (moment) {
    function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }

    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': withoutSuffix ? '屑懈薪褍褌邪_屑懈薪褍褌褘_屑懈薪褍褌' : '屑懈薪褍褌褍_屑懈薪褍褌褘_屑懈薪褍褌',
            'hh': '褔邪褋_褔邪褋邪_褔邪褋芯胁',
            'dd': '写械薪褜_写薪褟_写薪械泄',
            'MM': '屑械褋褟褑_屑械褋褟褑邪_屑械褋褟褑械胁',
            'yy': '谐芯写_谐芯写邪_谢械褌'
        };
        if (key === 'm') {
            return withoutSuffix ? '屑懈薪褍褌邪' : '屑懈薪褍褌褍';
        }
        else {
            return number + ' ' + plural(format[key], +number);
        }
    }

    function monthsCaseReplace(m, format) {
        var months = {
            'nominative': '褟薪胁邪褉褜_褎械胁褉邪谢褜_屑邪褉褌_邪锌褉械谢褜_屑邪泄_懈褞薪褜_懈褞谢褜_邪胁谐褍褋褌_褋械薪褌褟斜褉褜_芯泻褌褟斜褉褜_薪芯褟斜褉褜_写械泻邪斜褉褜'.split('_'),
            'accusative': '褟薪胁邪褉褟_褎械胁褉邪谢褟_屑邪褉褌邪_邪锌褉械谢褟_屑邪褟_懈褞薪褟_懈褞谢褟_邪胁谐褍褋褌邪_褋械薪褌褟斜褉褟_芯泻褌褟斜褉褟_薪芯褟斜褉褟_写械泻邪斜褉褟'.split('_')
        },

        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return months[nounCase][m.month()];
    }

    function monthsShortCaseReplace(m, format) {
        var monthsShort = {
            'nominative': '褟薪胁_褎械胁_屑邪褉褌_邪锌褉_屑邪泄_懈褞薪褜_懈褞谢褜_邪胁谐_褋械薪_芯泻褌_薪芯褟_写械泻'.split('_'),
            'accusative': '褟薪胁_褎械胁_屑邪褉_邪锌褉_屑邪褟_懈褞薪褟_懈褞谢褟_邪胁谐_褋械薪_芯泻褌_薪芯褟_写械泻'.split('_')
        },

        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return monthsShort[nounCase][m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': '胁芯褋泻褉械褋械薪褜械_锌芯薪械写械谢褜薪懈泻_胁褌芯褉薪懈泻_褋褉械写邪_褔械褌胁械褉谐_锌褟褌薪懈褑邪_褋褍斜斜芯褌邪'.split('_'),
            'accusative': '胁芯褋泻褉械褋械薪褜械_锌芯薪械写械谢褜薪懈泻_胁褌芯褉薪懈泻_褋褉械写褍_褔械褌胁械褉谐_锌褟褌薪懈褑褍_褋褍斜斜芯褌褍'.split('_')
        },

        nounCase = (/\[ ?[袙胁] ?(?:锌褉芯褕谢褍褞|褋谢械写褍褞褖褍褞|褝褌褍)? ?\] ?dddd/).test(format) ?
            'accusative' :
            'nominative';

        return weekdays[nounCase][m.day()];
    }

    return moment.defineLocale('ru', {
        months : monthsCaseReplace,
        monthsShort : monthsShortCaseReplace,
        weekdays : weekdaysCaseReplace,
        weekdaysShort : '胁褋_锌薪_胁褌_褋褉_褔褌_锌褌_褋斜'.split('_'),
        weekdaysMin : '胁褋_锌薪_胁褌_褋褉_褔褌_锌褌_褋斜'.split('_'),
        monthsParse : [/^褟薪胁/i, /^褎械胁/i, /^屑邪褉/i, /^邪锌褉/i, /^屑邪[泄|褟]/i, /^懈褞薪/i, /^懈褞谢/i, /^邪胁谐/i, /^褋械薪/i, /^芯泻褌/i, /^薪芯褟/i, /^写械泻/i],
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY 谐.',
            LLL : 'D MMMM YYYY 谐., LT',
            LLLL : 'dddd, D MMMM YYYY 谐., LT'
        },
        calendar : {
            sameDay: '[小械谐芯写薪褟 胁] LT',
            nextDay: '[袟邪胁褌褉邪 胁] LT',
            lastDay: '[袙褔械褉邪 胁] LT',
            nextWeek: function () {
                return this.day() === 2 ? '[袙芯] dddd [胁] LT' : '[袙] dddd [胁] LT';
            },
            lastWeek: function (now) {
                if (now.week() !== this.week()) {
                    switch (this.day()) {
                    case 0:
                        return '[袙 锌褉芯褕谢芯械] dddd [胁] LT';
                    case 1:
                    case 2:
                    case 4:
                        return '[袙 锌褉芯褕谢褘泄] dddd [胁] LT';
                    case 3:
                    case 5:
                    case 6:
                        return '[袙 锌褉芯褕谢褍褞] dddd [胁] LT';
                    }
                } else {
                    if (this.day() === 2) {
                        return '[袙芯] dddd [胁] LT';
                    } else {
                        return '[袙] dddd [胁] LT';
                    }
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : '褔械褉械蟹 %s',
            past : '%s 薪邪蟹邪写',
            s : '薪械褋泻芯谢褜泻芯 褋械泻褍薪写',
            m : relativeTimeWithPlural,
            mm : relativeTimeWithPlural,
            h : '褔邪褋',
            hh : relativeTimeWithPlural,
            d : '写械薪褜',
            dd : relativeTimeWithPlural,
            M : '屑械褋褟褑',
            MM : relativeTimeWithPlural,
            y : '谐芯写',
            yy : relativeTimeWithPlural
        },

        meridiemParse: /薪芯褔懈|褍褌褉邪|写薪褟|胁械褔械褉邪/i,
        isPM : function (input) {
            return /^(写薪褟|胁械褔械褉邪)$/.test(input);
        },

        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return '薪芯褔懈';
            } else if (hour < 12) {
                return '褍褌褉邪';
            } else if (hour < 17) {
                return '写薪褟';
            } else {
                return '胁械褔械褉邪';
            }
        },

        ordinalParse: /\d{1,2}-(泄|谐芯|褟)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
                return number + '-泄';
            case 'D':
                return number + '-谐芯';
            case 'w':
            case 'W':
                return number + '-褟';
            default:
                return number;
            }
        },

        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : slovak (sk)
// author : Martin Minka : https://github.com/k2s
// based on work of petrbela : https://github.com/petrbela

(function (factory) {
    factory(moment);
}(function (moment) {
    var months = 'janu谩r_febru谩r_marec_apr铆l_m谩j_j煤n_j煤l_august_september_okt贸ber_november_december'.split('_'),
        monthsShort = 'jan_feb_mar_apr_m谩j_j煤n_j煤l_aug_sep_okt_nov_dec'.split('_');

    function plural(n) {
        return (n > 1) && (n < 5);
    }

    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':  // a few seconds / in a few seconds / a few seconds ago
            return (withoutSuffix || isFuture) ? 'p谩r sek煤nd' : 'p谩r sekundami';
        case 'm':  // a minute / in a minute / a minute ago
            return withoutSuffix ? 'min煤ta' : (isFuture ? 'min煤tu' : 'min煤tou');
        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'min煤ty' : 'min煤t');
            } else {
                return result + 'min煤tami';
            }
            break;
        case 'h':  // an hour / in an hour / an hour ago
            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
        case 'hh': // 9 hours / in 9 hours / 9 hours ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'hodiny' : 'hod铆n');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':  // a day / in a day / a day ago
            return (withoutSuffix || isFuture) ? 'de艌' : 'd艌om';
        case 'dd': // 9 days / in 9 days / 9 days ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'dni' : 'dn铆');
            } else {
                return result + 'd艌ami';
            }
            break;
        case 'M':  // a month / in a month / a month ago
            return (withoutSuffix || isFuture) ? 'mesiac' : 'mesiacom';
        case 'MM': // 9 months / in 9 months / 9 months ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'mesiace' : 'mesiacov');
            } else {
                return result + 'mesiacmi';
            }
            break;
        case 'y':  // a year / in a year / a year ago
            return (withoutSuffix || isFuture) ? 'rok' : 'rokom';
        case 'yy': // 9 years / in 9 years / 9 years ago
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'roky' : 'rokov');
            } else {
                return result + 'rokmi';
            }
            break;
        }
    }

    return moment.defineLocale('sk', {
        months : months,
        monthsShort : monthsShort,
        monthsParse : (function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                // use custom parser to solve problem with July (膷ervenec)
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(months, monthsShort)),
        weekdays : 'nede木a_pondelok_utorok_streda_拧tvrtok_piatok_sobota'.split('_'),
        weekdaysShort : 'ne_po_ut_st_拧t_pi_so'.split('_'),
        weekdaysMin : 'ne_po_ut_st_拧t_pi_so'.split('_'),
        longDateFormat : {
            LT: 'H:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd D. MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[dnes o] LT',
            nextDay: '[zajtra o] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v nede木u o] LT';
                case 1:
                case 2:
                    return '[v] dddd [o] LT';
                case 3:
                    return '[v stredu o] LT';
                case 4:
                    return '[vo 拧tvrtok o] LT';
                case 5:
                    return '[v piatok o] LT';
                case 6:
                    return '[v sobotu o] LT';
                }
            },
            lastDay: '[v膷era o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minul煤 nede木u o] LT';
                case 1:
                case 2:
                    return '[minul媒] dddd [o] LT';
                case 3:
                    return '[minul煤 stredu o] LT';
                case 4:
                case 5:
                    return '[minul媒] dddd [o] LT';
                case 6:
                    return '[minul煤 sobotu o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'za %s',
            past : 'pred %s',
            s : translate,
            m : translate,
            mm : translate,
            h : translate,
            hh : translate,
            d : translate,
            dd : translate,
            M : translate,
            MM : translate,
            y : translate,
            yy : translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : slovenian (sl)
// author : Robert Sedov拧ek : https://github.com/sedovsek

(function (factory) {
    factory(moment);
}(function (moment) {
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'ena minuta' : 'eno minuto';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2) {
                result += 'minuti';
            } else if (number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minut';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'ena ura' : 'eno uro';
        case 'hh':
            if (number === 1) {
                result += 'ura';
            } else if (number === 2) {
                result += 'uri';
            } else if (number === 3 || number === 4) {
                result += 'ure';
            } else {
                result += 'ur';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dni';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mesec';
            } else if (number === 2) {
                result += 'meseca';
            } else if (number === 3 || number === 4) {
                result += 'mesece';
            } else {
                result += 'mesecev';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'leto';
            } else if (number === 2) {
                result += 'leti';
            } else if (number === 3 || number === 4) {
                result += 'leta';
            } else {
                result += 'let';
            }
            return result;
        }
    }

    return moment.defineLocale('sl', {
        months : 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
        weekdays : 'nedelja_ponedeljek_torek_sreda_膷etrtek_petek_sobota'.split('_'),
        weekdaysShort : 'ned._pon._tor._sre._膷et._pet._sob.'.split('_'),
        weekdaysMin : 'ne_po_to_sr_膷e_pe_so'.split('_'),
        longDateFormat : {
            LT : 'H:mm',
            LTS : 'LT:ss',
            L : 'DD. MM. YYYY',
            LL : 'D. MMMM YYYY',
            LLL : 'D. MMMM YYYY LT',
            LLLL : 'dddd, D. MMMM YYYY LT'
        },
        calendar : {
            sameDay  : '[danes ob] LT',
            nextDay  : '[jutri ob] LT',

            nextWeek : function () {
                switch (this.day()) {
                case 0:
                    return '[v] [nedeljo] [ob] LT';
                case 3:
                    return '[v] [sredo] [ob] LT';
                case 6:
                    return '[v] [soboto] [ob] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[v] dddd [ob] LT';
                }
            },
            lastDay  : '[v膷eraj ob] LT',
            lastWeek : function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[prej拧nja] dddd [ob] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[prej拧nji] dddd [ob] LT';
                }
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : '膷ez %s',
            past   : '%s nazaj',
            s      : 'nekaj sekund',
            m      : translate,
            mm     : translate,
            h      : translate,
            hh     : translate,
            d      : 'en dan',
            dd     : translate,
            M      : 'en mesec',
            MM     : translate,
            y      : 'eno leto',
            yy     : translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Albanian (sq)
// author : Flak毛rim Ismani : https://github.com/flakerimi
// author: Menelion Elens煤le: https://github.com/Oire (tests)
// author : Oerd Cukalla : https://github.com/oerd (fixes)

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('sq', {
        months : 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_N毛ntor_Dhjetor'.split('_'),
        monthsShort : 'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_N毛n_Dhj'.split('_'),
        weekdays : 'E Diel_E H毛n毛_E Mart毛_E M毛rkur毛_E Enjte_E Premte_E Shtun毛'.split('_'),
        weekdaysShort : 'Die_H毛n_Mar_M毛r_Enj_Pre_Sht'.split('_'),
        weekdaysMin : 'D_H_Ma_M毛_E_P_Sh'.split('_'),
        meridiemParse: /PD|MD/,
        isPM: function (input) {
            return input.charAt(0) === 'M';
        },
        meridiem : function (hours, minutes, isLower) {
            return hours < 12 ? 'PD' : 'MD';
        },
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[Sot n毛] LT',
            nextDay : '[Nes毛r n毛] LT',
            nextWeek : 'dddd [n毛] LT',
            lastDay : '[Dje n毛] LT',
            lastWeek : 'dddd [e kaluar n毛] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : 'n毛 %s',
            past : '%s m毛 par毛',
            s : 'disa sekonda',
            m : 'nj毛 minut毛',
            mm : '%d minuta',
            h : 'nj毛 or毛',
            hh : '%d or毛',
            d : 'nj毛 dit毛',
            dd : '%d dit毛',
            M : 'nj毛 muaj',
            MM : '%d muaj',
            y : 'nj毛 vit',
            yy : '%d vite'
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Serbian-cyrillic (sr-cyrl)
// author : Milan Jana膷kovi膰<milanjanackovic@gmail.com> : https://github.com/milan-j

(function (factory) {
    factory(moment);
}(function (moment) {
    var translator = {
        words: { //Different grammatical cases
            m: ['褬械写邪薪 屑懈薪褍褌', '褬械写薪械 屑懈薪褍褌械'],
            mm: ['屑懈薪褍褌', '屑懈薪褍褌械', '屑懈薪褍褌邪'],
            h: ['褬械写邪薪 褋邪褌', '褬械写薪芯谐 褋邪褌邪'],
            hh: ['褋邪褌', '褋邪褌邪', '褋邪褌懈'],
            dd: ['写邪薪', '写邪薪邪', '写邪薪邪'],
            MM: ['屑械褋械褑', '屑械褋械褑邪', '屑械褋械褑懈'],
            yy: ['谐芯写懈薪邪', '谐芯写懈薪械', '谐芯写懈薪邪']
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };

    return moment.defineLocale('sr-cyrl', {
        months: ['褬邪薪褍邪褉', '褎械斜褉褍邪褉', '屑邪褉褌', '邪锌褉懈谢', '屑邪褬', '褬褍薪', '褬褍谢', '邪胁谐褍褋褌', '褋械锌褌械屑斜邪褉', '芯泻褌芯斜邪褉', '薪芯胁械屑斜邪褉', '写械褑械屑斜邪褉'],
        monthsShort: ['褬邪薪.', '褎械斜.', '屑邪褉.', '邪锌褉.', '屑邪褬', '褬褍薪', '褬褍谢', '邪胁谐.', '褋械锌.', '芯泻褌.', '薪芯胁.', '写械褑.'],
        weekdays: ['薪械写械褭邪', '锌芯薪械写械褭邪泻', '褍褌芯褉邪泻', '褋褉械写邪', '褔械褌胁褉褌邪泻', '锌械褌邪泻', '褋褍斜芯褌邪'],
        weekdaysShort: ['薪械写.', '锌芯薪.', '褍褌芯.', '褋褉械.', '褔械褌.', '锌械褌.', '褋褍斜.'],
        weekdaysMin: ['薪械', '锌芯', '褍褌', '褋褉', '褔械', '锌械', '褋褍'],
        longDateFormat: {
            LT: 'H:mm',
            LTS : 'LT:ss',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[写邪薪邪褋 褍] LT',
            nextDay: '[褋褍褌褉邪 褍] LT',

            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[褍] [薪械写械褭褍] [褍] LT';
                case 3:
                    return '[褍] [褋褉械写褍] [褍] LT';
                case 6:
                    return '[褍] [褋褍斜芯褌褍] [褍] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[褍] dddd [褍] LT';
                }
            },
            lastDay  : '[褬褍褔械 褍] LT',
            lastWeek : function () {
                var lastWeekDays = [
                    '[锌褉芯褕谢械] [薪械写械褭械] [褍] LT',
                    '[锌褉芯褕谢芯谐] [锌芯薪械写械褭泻邪] [褍] LT',
                    '[锌褉芯褕谢芯谐] [褍褌芯褉泻邪] [褍] LT',
                    '[锌褉芯褕谢械] [褋褉械写械] [褍] LT',
                    '[锌褉芯褕谢芯谐] [褔械褌胁褉褌泻邪] [褍] LT',
                    '[锌褉芯褕谢芯谐] [锌械褌泻邪] [褍] LT',
                    '[锌褉芯褕谢械] [褋褍斜芯褌械] [褍] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : '蟹邪 %s',
            past   : '锌褉械 %s',
            s      : '薪械泻芯谢懈泻芯 褋械泻褍薪写懈',
            m      : translator.translate,
            mm     : translator.translate,
            h      : translator.translate,
            hh     : translator.translate,
            d      : '写邪薪',
            dd     : translator.translate,
            M      : '屑械褋械褑',
            MM     : translator.translate,
            y      : '谐芯写懈薪褍',
            yy     : translator.translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Serbian-latin (sr)
// author : Milan Jana膷kovi膰<milanjanackovic@gmail.com> : https://github.com/milan-j

(function (factory) {
    factory(moment);
}(function (moment) {
    var translator = {
        words: { //Different grammatical cases
            m: ['jedan minut', 'jedne minute'],
            mm: ['minut', 'minute', 'minuta'],
            h: ['jedan sat', 'jednog sata'],
            hh: ['sat', 'sata', 'sati'],
            dd: ['dan', 'dana', 'dana'],
            MM: ['mesec', 'meseca', 'meseci'],
            yy: ['godina', 'godine', 'godina']
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };

    return moment.defineLocale('sr', {
        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
        weekdays: ['nedelja', 'ponedeljak', 'utorak', 'sreda', '膷etvrtak', 'petak', 'subota'],
        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sre.', '膷et.', 'pet.', 'sub.'],
        weekdaysMin: ['ne', 'po', 'ut', 'sr', '膷e', 'pe', 'su'],
        longDateFormat: {
            LT: 'H:mm',
            LTS : 'LT:ss',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sutra u] LT',

            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedelju] [u] LT';
                case 3:
                    return '[u] [sredu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay  : '[ju膷e u] LT',
            lastWeek : function () {
                var lastWeekDays = [
                    '[pro拧le] [nedelje] [u] LT',
                    '[pro拧log] [ponedeljka] [u] LT',
                    '[pro拧log] [utorka] [u] LT',
                    '[pro拧le] [srede] [u] LT',
                    '[pro拧log] [膷etvrtka] [u] LT',
                    '[pro拧log] [petka] [u] LT',
                    '[pro拧le] [subote] [u] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : 'za %s',
            past   : 'pre %s',
            s      : 'nekoliko sekundi',
            m      : translator.translate,
            mm     : translator.translate,
            h      : translator.translate,
            hh     : translator.translate,
            d      : 'dan',
            dd     : translator.translate,
            M      : 'mesec',
            MM     : translator.translate,
            y      : 'godinu',
            yy     : translator.translate
        },
        ordinalParse: /\d{1,2}\./,
        ordinal : '%d.',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : swedish (sv)
// author : Jens Alm : https://github.com/ulmus

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('sv', {
        months : 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays : 's枚ndag_m氓ndag_tisdag_onsdag_torsdag_fredag_l枚rdag'.split('_'),
        weekdaysShort : 's枚n_m氓n_tis_ons_tor_fre_l枚r'.split('_'),
        weekdaysMin : 's枚_m氓_ti_on_to_fr_l枚'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'YYYY-MM-DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[Idag] LT',
            nextDay: '[Imorgon] LT',
            lastDay: '[Ig氓r] LT',
            nextWeek: 'dddd LT',
            lastWeek: '[F枚rra] dddd[en] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'om %s',
            past : 'f枚r %s sedan',
            s : 'n氓gra sekunder',
            m : 'en minut',
            mm : '%d minuter',
            h : 'en timme',
            hh : '%d timmar',
            d : 'en dag',
            dd : '%d dagar',
            M : 'en m氓nad',
            MM : '%d m氓nader',
            y : 'ett 氓r',
            yy : '%d 氓r'
        },
        ordinalParse: /\d{1,2}(e|a)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'e' :
                (b === 1) ? 'a' :
                (b === 2) ? 'a' :
                (b === 3) ? 'e' : 'e';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : tamil (ta)
// author : Arjunkumar Krishnamoorthy : https://github.com/tk120404

(function (factory) {
    factory(moment);
}(function (moment) {
    /*var symbolMap = {
            '1': '喁�',
            '2': '喁�',
            '3': '喁�',
            '4': '喁�',
            '5': '喁�',
            '6': '喁�',
            '7': '喁�',
            '8': '喁�',
            '9': '喁�',
            '0': '喁�'
        },
        numberMap = {
            '喁�': '1',
            '喁�': '2',
            '喁�': '3',
            '喁�': '4',
            '喁�': '5',
            '喁�': '6',
            '喁�': '7',
            '喁�': '8',
            '喁�': '9',
            '喁�': '0'
        }; */

    return moment.defineLocale('ta', {
        months : '喈溹喈掂喈縚喈喈瘝喈班喈班_喈喈班瘝喈氞瘝_喈忇喁嵿喈侧瘝_喈瘒_喈溹瘋喈┼瘝_喈溹瘋喈侧瘓_喈嗋畷喈膏瘝喈熰瘝_喈氞瘑喈瘝喈熰瘑喈瘝喈喁峗喈呧畷喁嵿疅喁囙喈喁峗喈ㄠ喈瘝喈喁峗喈熰喈氞喁嵿喈班瘝'.split('_'),
        monthsShort : '喈溹喈掂喈縚喈喈瘝喈班喈班_喈喈班瘝喈氞瘝_喈忇喁嵿喈侧瘝_喈瘒_喈溹瘋喈┼瘝_喈溹瘋喈侧瘓_喈嗋畷喈膏瘝喈熰瘝_喈氞瘑喈瘝喈熰瘑喈瘝喈喁峗喈呧畷喁嵿疅喁囙喈喁峗喈ㄠ喈瘝喈喁峗喈熰喈氞喁嵿喈班瘝'.split('_'),
        weekdays : '喈炧喈喈编瘝喈编瘉喈曕瘝喈曕喈脆喁坃喈む喈權瘝喈曕疅喁嵿畷喈苦喈瘓_喈氞瘑喈掂瘝喈掂喈瘝喈曕喈脆喁坃喈瘉喈む喁嵿畷喈苦喈瘓_喈掂喈喈脆畷喁嵿畷喈苦喈瘓_喈掂瘑喈赤瘝喈赤喈曕瘝喈曕喈脆喁坃喈氞喈苦畷喁嵿畷喈苦喈瘓'.split('_'),
        weekdaysShort : '喈炧喈喈编瘉_喈む喈權瘝喈曕喁峗喈氞瘑喈掂瘝喈掂喈瘝_喈瘉喈む喁峗喈掂喈喈脆喁峗喈掂瘑喈赤瘝喈赤_喈氞喈�'.split('_'),
        weekdaysMin : '喈炧_喈む_喈氞瘑_喈瘉_喈掂_喈掂瘑_喈�'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY, LT',
            LLLL : 'dddd, D MMMM YYYY, LT'
        },
        calendar : {
            sameDay : '[喈囙喁嵿喁乚 LT',
            nextDay : '[喈ㄠ喈赤瘓] LT',
            nextWeek : 'dddd, LT',
            lastDay : '[喈ㄠ瘒喈编瘝喈编瘉] LT',
            lastWeek : '[喈曕疅喈ㄠ瘝喈� 喈掂喈班喁峕 dddd, LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s 喈囙喁�',
            past : '%s 喈瘉喈┼瘝',
            s : '喈掄喁� 喈氞喈� 喈掂喈ㄠ喈熰喈曕喁�',
            m : '喈掄喁� 喈ㄠ喈喈熰喁�',
            mm : '%d 喈ㄠ喈喈熰畽喁嵿畷喈赤瘝',
            h : '喈掄喁� 喈喈� 喈ㄠ瘒喈班喁�',
            hh : '%d 喈喈� 喈ㄠ瘒喈班喁�',
            d : '喈掄喁� 喈ㄠ喈赤瘝',
            dd : '%d 喈ㄠ喈熰瘝喈曕喁�',
            M : '喈掄喁� 喈喈む喁�',
            MM : '%d 喈喈む畽喁嵿畷喈赤瘝',
            y : '喈掄喁� 喈掂喁佮疅喈瘝',
            yy : '%d 喈嗋喁嵿疅喁佮畷喈赤瘝'
        },
/*        preparse: function (string) {
            return string.replace(/[喁о喁┼喁喁喁]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },*/
        ordinalParse: /\d{1,2}喈掂喁�/,
        ordinal : function (number) {
            return number + '喈掂喁�';
        },


        // refer http://ta.wikipedia.org/s/1er1
        meridiemParse: /喈喈喁峾喈掂瘓喈曕喁坾喈曕喈侧瘓|喈ㄠ喁嵿喈曕喁峾喈庎喁嵿喈距疅喁亅喈喈侧瘓/,
        meridiem : function (hour, minute, isLower) {
            if (hour < 2) {
                return ' 喈喈喁�';
            } else if (hour < 6) {
                return ' 喈掂瘓喈曕喁�';  // 喈掂瘓喈曕喁�
            } else if (hour < 10) {
                return ' 喈曕喈侧瘓'; // 喈曕喈侧瘓
            } else if (hour < 14) {
                return ' 喈ㄠ喁嵿喈曕喁�'; // 喈ㄠ喁嵿喈曕喁�
            } else if (hour < 18) {
                return ' 喈庎喁嵿喈距疅喁�'; // 喈庎喁嵿喈距疅喁�
            } else if (hour < 22) {
                return ' 喈喈侧瘓'; // 喈喈侧瘓
            } else {
                return ' 喈喈喁�';
            }
        },
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === '喈喈喁�') {
                return hour < 2 ? hour : hour + 12;
            } else if (meridiem === '喈掂瘓喈曕喁�' || meridiem === '喈曕喈侧瘓') {
                return hour;
            } else if (meridiem === '喈ㄠ喁嵿喈曕喁�') {
                return hour >= 10 ? hour : hour + 12;
            } else {
                return hour + 12;
            }
        },
        week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : thai (th)
// author : Kridsada Thanabulpong : https://github.com/sirn

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('th', {
        months : '喔∴竵喔｀覆喔勦浮_喔佮父喔∴笭喔侧笧喔编笝喔樴箤_喔∴傅喔權覆喔勦浮_喙€喔∴俯喔侧涪喔檁喔炧袱喔┼笭喔侧竸喔喔∴复喔栢父喔權覆喔⑧笝_喔佮福喔佮笌喔侧竸喔喔复喔囙斧喔侧竸喔喔佮副喔權涪喔侧涪喔檁喔曕父喔ム覆喔勦浮_喔炧袱喔ㄠ笀喔脆竵喔侧涪喔檁喔樴副喔權抚喔侧竸喔�'.split('_'),
        monthsShort : '喔∴竵喔｀覆_喔佮父喔∴笭喔瞋喔∴傅喔權覆_喙€喔∴俯喔瞋喔炧袱喔┼笭喔瞋喔∴复喔栢父喔權覆_喔佮福喔佮笌喔瞋喔复喔囙斧喔瞋喔佮副喔權涪喔瞋喔曕父喔ム覆_喔炧袱喔ㄠ笀喔脆竵喔瞋喔樴副喔權抚喔�'.split('_'),
        weekdays : '喔覆喔椸复喔曕涪喙宊喔堗副喔權笚喔｀箤_喔副喔囙竸喔侧福_喔炧父喔榑喔炧袱喔副喔笟喔斷傅_喔ㄠ父喔佮福喙宊喙€喔覆喔｀箤'.split('_'),
        weekdaysShort : '喔覆喔椸复喔曕涪喙宊喔堗副喔權笚喔｀箤_喔副喔囙竸喔侧福_喔炧父喔榑喔炧袱喔副喔猒喔ㄠ父喔佮福喙宊喙€喔覆喔｀箤'.split('_'), // yes, three characters difference
        weekdaysMin : '喔覆._喔�._喔�._喔�._喔炧袱._喔�._喔�.'.split('_'),
        longDateFormat : {
            LT : 'H 喔權覆喔复喔佮覆 m 喔權覆喔椸傅',
            LTS : 'LT s 喔о复喔權覆喔椸傅',
            L : 'YYYY/MM/DD',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY 喙€喔о弗喔� LT',
            LLLL : '喔о副喔檇ddd喔椸傅喙� D MMMM YYYY 喙€喔о弗喔� LT'
        },
        meridiemParse: /喔佮箞喔笝喙€喔椸傅喙堗涪喔噟喔弗喔编竾喙€喔椸傅喙堗涪喔�/,
        isPM: function (input) {
            return input === '喔弗喔编竾喙€喔椸傅喙堗涪喔�';
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 12) {
                return '喔佮箞喔笝喙€喔椸傅喙堗涪喔�';
            } else {
                return '喔弗喔编竾喙€喔椸傅喙堗涪喔�';
            }
        },
        calendar : {
            sameDay : '[喔о副喔權笝喔掂箟 喙€喔о弗喔瞉 LT',
            nextDay : '[喔炧福喔膏箞喔囙笝喔掂箟 喙€喔о弗喔瞉 LT',
            nextWeek : 'dddd[喔笝喙夃覆 喙€喔о弗喔瞉 LT',
            lastDay : '[喙€喔∴阜喙堗腑喔о覆喔權笝喔掂箟 喙€喔о弗喔瞉 LT',
            lastWeek : '[喔о副喔橾dddd[喔椸傅喙堗箒喔ム箟喔� 喙€喔о弗喔瞉 LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '喔傅喔� %s',
            past : '%s喔椸傅喙堗箒喔ム箟喔�',
            s : '喙勦浮喙堗竵喔掂箞喔о复喔權覆喔椸傅',
            m : '1 喔權覆喔椸傅',
            mm : '%d 喔權覆喔椸傅',
            h : '1 喔娻副喙堗抚喙傕浮喔�',
            hh : '%d 喔娻副喙堗抚喙傕浮喔�',
            d : '1 喔о副喔�',
            dd : '%d 喔о副喔�',
            M : '1 喙€喔斷阜喔笝',
            MM : '%d 喙€喔斷阜喔笝',
            y : '1 喔涏傅',
            yy : '%d 喔涏傅'
        }
    });
}));
// moment.js locale configuration
// locale : Tagalog/Filipino (tl-ph)
// author : Dan Hagman

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('tl-ph', {
        months : 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split('_'),
        monthsShort : 'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
        weekdays : 'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split('_'),
        weekdaysShort : 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
        weekdaysMin : 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'MM/D/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM DD, YYYY LT'
        },
        calendar : {
            sameDay: '[Ngayon sa] LT',
            nextDay: '[Bukas sa] LT',
            nextWeek: 'dddd [sa] LT',
            lastDay: '[Kahapon sa] LT',
            lastWeek: 'dddd [huling linggo] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'sa loob ng %s',
            past : '%s ang nakalipas',
            s : 'ilang segundo',
            m : 'isang minuto',
            mm : '%d minuto',
            h : 'isang oras',
            hh : '%d oras',
            d : 'isang araw',
            dd : '%d araw',
            M : 'isang buwan',
            MM : '%d buwan',
            y : 'isang taon',
            yy : '%d taon'
        },
        ordinalParse: /\d{1,2}/,
        ordinal : function (number) {
            return number;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : turkish (tr)
// authors : Erhan Gundogan : https://github.com/erhangundogan,
//           Burak Yi臒it Kaya: https://github.com/BYK

(function (factory) {
    factory(moment);
}(function (moment) {
    var suffixes = {
        1: '\'inci',
        5: '\'inci',
        8: '\'inci',
        70: '\'inci',
        80: '\'inci',

        2: '\'nci',
        7: '\'nci',
        20: '\'nci',
        50: '\'nci',

        3: '\'眉nc眉',
        4: '\'眉nc眉',
        100: '\'眉nc眉',

        6: '\'nc谋',

        9: '\'uncu',
        10: '\'uncu',
        30: '\'uncu',

        60: '\'谋nc谋',
        90: '\'谋nc谋'
    };

    return moment.defineLocale('tr', {
        months : 'Ocak_艦ubat_Mart_Nisan_May谋s_Haziran_Temmuz_A臒ustos_Eyl眉l_Ekim_Kas谋m_Aral谋k'.split('_'),
        monthsShort : 'Oca_艦ub_Mar_Nis_May_Haz_Tem_A臒u_Eyl_Eki_Kas_Ara'.split('_'),
        weekdays : 'Pazar_Pazartesi_Sal谋_脟ar艧amba_Per艧embe_Cuma_Cumartesi'.split('_'),
        weekdaysShort : 'Paz_Pts_Sal_脟ar_Per_Cum_Cts'.split('_'),
        weekdaysMin : 'Pz_Pt_Sa_脟a_Pe_Cu_Ct'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd, D MMMM YYYY LT'
        },
        calendar : {
            sameDay : '[bug眉n saat] LT',
            nextDay : '[yar谋n saat] LT',
            nextWeek : '[haftaya] dddd [saat] LT',
            lastDay : '[d眉n] LT',
            lastWeek : '[ge莽en hafta] dddd [saat] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : '%s sonra',
            past : '%s 枚nce',
            s : 'birka莽 saniye',
            m : 'bir dakika',
            mm : '%d dakika',
            h : 'bir saat',
            hh : '%d saat',
            d : 'bir g眉n',
            dd : '%d g眉n',
            M : 'bir ay',
            MM : '%d ay',
            y : 'bir y谋l',
            yy : '%d y谋l'
        },
        ordinalParse: /\d{1,2}'(inci|nci|眉nc眉|nc谋|uncu|谋nc谋)/,
        ordinal : function (number) {
            if (number === 0) {  // special case for zero
                return number + '\'谋nc谋';
            }
            var a = number % 10,
                b = number % 100 - a,
                c = number >= 100 ? 100 : null;

            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Morocco Central Atlas Tamazi桑t in Latin (tzm-latn)
// author : Abdel Said : https://github.com/abdelsaid

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('tzm-latn', {
        months : 'innayr_br摔ayr摔_mar摔s摔_ibrir_mayyw_ywnyw_ywlywz_桑w拧t_拧wtanbir_kt摔wbr摔_nwwanbir_dwjnbir'.split('_'),
        monthsShort : 'innayr_br摔ayr摔_mar摔s摔_ibrir_mayyw_ywnyw_ywlywz_桑w拧t_拧wtanbir_kt摔wbr摔_nwwanbir_dwjnbir'.split('_'),
        weekdays : 'asamas_aynas_asinas_akras_akwas_asimwas_asi岣峺as'.split('_'),
        weekdaysShort : 'asamas_aynas_asinas_akras_akwas_asimwas_asi岣峺as'.split('_'),
        weekdaysMin : 'asamas_aynas_asinas_akras_akwas_asimwas_asi岣峺as'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[asdkh g] LT',
            nextDay: '[aska g] LT',
            nextWeek: 'dddd [g] LT',
            lastDay: '[assant g] LT',
            lastWeek: 'dddd [g] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : 'dadkh s yan %s',
            past : 'yan %s',
            s : 'imik',
            m : 'minu岣�',
            mm : '%d minu岣�',
            h : 'sa蓻a',
            hh : '%d tassa蓻in',
            d : 'ass',
            dd : '%d ossan',
            M : 'ayowr',
            MM : '%d iyyirn',
            y : 'asgas',
            yy : '%d isgasn'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : Morocco Central Atlas Tamazi桑t (tzm)
// author : Abdel Said : https://github.com/abdelsaid

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('tzm', {
        months : '獾夆祻獾忊窗獾⑩禂_獯扁禃獯扳耽獾昣獾庘窗獾曗禋_獾夆幢獾斺祲獾擾獾庘窗獾⑩耽獾揰獾⑩祿獾忊耽獾揰獾⑩祿獾嶁耽獾撯担_獾栤祿獾涒禍_獾涒祿獾溾窗獾忊幢獾夆禂_獯解禑獾撯幢獾昣獾忊祿獾♀窗獾忊幢獾夆禂_獯封祿獾娾祻獯扁祲獾�'.split('_'),
        monthsShort : '獾夆祻獾忊窗獾⑩禂_獯扁禃獯扳耽獾昣獾庘窗獾曗禋_獾夆幢獾斺祲獾擾獾庘窗獾⑩耽獾揰獾⑩祿獾忊耽獾揰獾⑩祿獾嶁耽獾撯担_獾栤祿獾涒禍_獾涒祿獾溾窗獾忊幢獾夆禂_獯解禑獾撯幢獾昣獾忊祿獾♀窗獾忊幢獾夆禂_獯封祿獾娾祻獯扁祲獾�'.split('_'),
        weekdays : '獯扳禉獯扳祹獯扳禉_獯扳耽獾忊窗獾檁獯扳禉獾夆祻獯扳禉_獯扳唇獾斺窗獾檁獯扳唇獾♀窗獾檁獯扳禉獾夆祹獾♀窗獾檁獯扳禉獾夆垂獾⑩窗獾�'.split('_'),
        weekdaysShort : '獯扳禉獯扳祹獯扳禉_獯扳耽獾忊窗獾檁獯扳禉獾夆祻獯扳禉_獯扳唇獾斺窗獾檁獯扳唇獾♀窗獾檁獯扳禉獾夆祹獾♀窗獾檁獯扳禉獾夆垂獾⑩窗獾�'.split('_'),
        weekdaysMin : '獯扳禉獯扳祹獯扳禉_獯扳耽獾忊窗獾檁獯扳禉獾夆祻獯扳禉_獯扳唇獾斺窗獾檁獯扳唇獾♀窗獾檁獯扳禉獾夆祹獾♀窗獾檁獯扳禉獾夆垂獾⑩窗獾�'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS: 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'dddd D MMMM YYYY LT'
        },
        calendar : {
            sameDay: '[獯扳禉獯封祬 獯碷 LT',
            nextDay: '[獯扳禉獯解窗 獯碷 LT',
            nextWeek: 'dddd [獯碷 LT',
            lastDay: '[獯扳禋獯扳祻獾� 獯碷 LT',
            lastWeek: 'dddd [獯碷 LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : '獯封窗獯封祬 獾� 獾⑩窗獾� %s',
            past : '獾⑩窗獾� %s',
            s : '獾夆祹獾夆唇',
            m : '獾庘祲獾忊祿獯�',
            mm : '%d 獾庘祲獾忊祿獯�',
            h : '獾欌窗獾勨窗',
            hh : '%d 獾溾窗獾欌禉獯扳祫獾夆祻',
            d : '獯扳禉獾�',
            dd : '%d o獾欌禉獯扳祻',
            M : '獯扳耽o獾撯禂',
            MM : '%d 獾夆耽獾⑩祲獾斺祻',
            y : '獯扳禉獯斥窗獾�',
            yy : '%d 獾夆禉獯斥窗獾欌祻'
        },
        week : {
            dow : 6, // Saturday is the first day of the week.
            doy : 12  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : ukrainian (uk)
// author : zemlanin : https://github.com/zemlanin
// Author : Menelion Elens煤le : https://github.com/Oire

(function (factory) {
    factory(moment);
}(function (moment) {
    function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }

    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': '褏胁懈谢懈薪邪_褏胁懈谢懈薪懈_褏胁懈谢懈薪',
            'hh': '谐芯写懈薪邪_谐芯写懈薪懈_谐芯写懈薪',
            'dd': '写械薪褜_写薪褨_写薪褨胁',
            'MM': '屑褨褋褟褑褜_屑褨褋褟褑褨_屑褨褋褟褑褨胁',
            'yy': '褉褨泻_褉芯泻懈_褉芯泻褨胁'
        };
        if (key === 'm') {
            return withoutSuffix ? '褏胁懈谢懈薪邪' : '褏胁懈谢懈薪褍';
        }
        else if (key === 'h') {
            return withoutSuffix ? '谐芯写懈薪邪' : '谐芯写懈薪褍';
        }
        else {
            return number + ' ' + plural(format[key], +number);
        }
    }

    function monthsCaseReplace(m, format) {
        var months = {
            'nominative': '褋褨褔械薪褜_谢褞褌懈泄_斜械褉械蟹械薪褜_泻胁褨褌械薪褜_褌褉邪胁械薪褜_褔械褉胁械薪褜_谢懈锌械薪褜_褋械褉锌械薪褜_胁械褉械褋械薪褜_卸芯胁褌械薪褜_谢懈褋褌芯锌邪写_谐褉褍写械薪褜'.split('_'),
            'accusative': '褋褨褔薪褟_谢褞褌芯谐芯_斜械褉械蟹薪褟_泻胁褨褌薪褟_褌褉邪胁薪褟_褔械褉胁薪褟_谢懈锌薪褟_褋械褉锌薪褟_胁械褉械褋薪褟_卸芯胁褌薪褟_谢懈褋褌芯锌邪写邪_谐褉褍写薪褟'.split('_')
        },

        nounCase = (/D[oD]? *MMMM?/).test(format) ?
            'accusative' :
            'nominative';

        return months[nounCase][m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': '薪械写褨谢褟_锌芯薪械写褨谢芯泻_胁褨胁褌芯褉芯泻_褋械褉械写邪_褔械褌胁械褉_锌鈥櫻徰傂叫秆喲廮褋褍斜芯褌邪'.split('_'),
            'accusative': '薪械写褨谢褞_锌芯薪械写褨谢芯泻_胁褨胁褌芯褉芯泻_褋械褉械写褍_褔械褌胁械褉_锌鈥櫻徰傂叫秆喲巁褋褍斜芯褌褍'.split('_'),
            'genitive': '薪械写褨谢褨_锌芯薪械写褨谢泻邪_胁褨胁褌芯褉泻邪_褋械褉械写懈_褔械褌胁械褉谐邪_锌鈥櫻徰傂叫秆喲朹褋褍斜芯褌懈'.split('_')
        },

        nounCase = (/(\[[袙胁校褍]\]) ?dddd/).test(format) ?
            'accusative' :
            ((/\[?(?:屑懈薪褍谢芯褩|薪邪褋褌褍锌薪芯褩)? ?\] ?dddd/).test(format) ?
                'genitive' :
                'nominative');

        return weekdays[nounCase][m.day()];
    }

    function processHoursFunction(str) {
        return function () {
            return str + '芯' + (this.hours() === 11 ? '斜' : '') + '] LT';
        };
    }

    return moment.defineLocale('uk', {
        months : monthsCaseReplace,
        monthsShort : '褋褨褔_谢褞褌_斜械褉_泻胁褨褌_褌褉邪胁_褔械褉胁_谢懈锌_褋械褉锌_胁械褉_卸芯胁褌_谢懈褋褌_谐褉褍写'.split('_'),
        weekdays : weekdaysCaseReplace,
        weekdaysShort : '薪写_锌薪_胁褌_褋褉_褔褌_锌褌_褋斜'.split('_'),
        weekdaysMin : '薪写_锌薪_胁褌_褋褉_褔褌_锌褌_褋斜'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD.MM.YYYY',
            LL : 'D MMMM YYYY 褉.',
            LLL : 'D MMMM YYYY 褉., LT',
            LLLL : 'dddd, D MMMM YYYY 褉., LT'
        },
        calendar : {
            sameDay: processHoursFunction('[小褜芯谐芯写薪褨 '),
            nextDay: processHoursFunction('[袟邪胁褌褉邪 '),
            lastDay: processHoursFunction('[袙褔芯褉邪 '),
            nextWeek: processHoursFunction('[校] dddd ['),
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 5:
                case 6:
                    return processHoursFunction('[袦懈薪褍谢芯褩] dddd [').call(this);
                case 1:
                case 2:
                case 4:
                    return processHoursFunction('[袦懈薪褍谢芯谐芯] dddd [').call(this);
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : '蟹邪 %s',
            past : '%s 褌芯屑褍',
            s : '写械泻褨谢褜泻邪 褋械泻褍薪写',
            m : relativeTimeWithPlural,
            mm : relativeTimeWithPlural,
            h : '谐芯写懈薪褍',
            hh : relativeTimeWithPlural,
            d : '写械薪褜',
            dd : relativeTimeWithPlural,
            M : '屑褨褋褟褑褜',
            MM : relativeTimeWithPlural,
            y : '褉褨泻',
            yy : relativeTimeWithPlural
        },

        // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason

        meridiemParse: /薪芯褔褨|褉邪薪泻褍|写薪褟|胁械褔芯褉邪/,
        isPM: function (input) {
            return /^(写薪褟|胁械褔芯褉邪)$/.test(input);
        },
        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return '薪芯褔褨';
            } else if (hour < 12) {
                return '褉邪薪泻褍';
            } else if (hour < 17) {
                return '写薪褟';
            } else {
                return '胁械褔芯褉邪';
            }
        },

        ordinalParse: /\d{1,2}-(泄|谐芯)/,
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
            case 'w':
            case 'W':
                return number + '-泄';
            case 'D':
                return number + '-谐芯';
            default:
                return number;
            }
        },

        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : uzbek (uz)
// author : Sardor Muminov : https://github.com/muminoff

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('uz', {
        months : '褟薪胁邪褉褜_褎械胁褉邪谢褜_屑邪褉褌_邪锌褉械谢褜_屑邪泄_懈褞薪褜_懈褞谢褜_邪胁谐褍褋褌_褋械薪褌褟斜褉褜_芯泻褌褟斜褉褜_薪芯褟斜褉褜_写械泻邪斜褉褜'.split('_'),
        monthsShort : '褟薪胁_褎械胁_屑邪褉_邪锌褉_屑邪泄_懈褞薪_懈褞谢_邪胁谐_褋械薪_芯泻褌_薪芯褟_写械泻'.split('_'),
        weekdays : '携泻褕邪薪斜邪_袛褍褕邪薪斜邪_小械褕邪薪斜邪_效芯褉褕邪薪斜邪_袩邪泄褕邪薪斜邪_袞褍屑邪_楔邪薪斜邪'.split('_'),
        weekdaysShort : '携泻褕_袛褍褕_小械褕_效芯褉_袩邪泄_袞褍屑_楔邪薪'.split('_'),
        weekdaysMin : '携泻_袛褍_小械_效芯_袩邪_袞褍_楔邪'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY LT',
            LLLL : 'D MMMM YYYY, dddd LT'
        },
        calendar : {
            sameDay : '[袘褍谐褍薪 褋芯邪褌] LT [写邪]',
            nextDay : '[协褉褌邪谐邪] LT [写邪]',
            nextWeek : 'dddd [泻褍薪懈 褋芯邪褌] LT [写邪]',
            lastDay : '[袣械褔邪 褋芯邪褌] LT [写邪]',
            lastWeek : '[校褌谐邪薪] dddd [泻褍薪懈 褋芯邪褌] LT [写邪]',
            sameElse : 'L'
        },
        relativeTime : {
            future : '携泻懈薪 %s 懈褔懈写邪',
            past : '袘懈褉 薪械褔邪 %s 芯谢写懈薪',
            s : '褎褍褉褋邪褌',
            m : '斜懈褉 写邪泻懈泻邪',
            mm : '%d 写邪泻懈泻邪',
            h : '斜懈褉 褋芯邪褌',
            hh : '%d 褋芯邪褌',
            d : '斜懈褉 泻褍薪',
            dd : '%d 泻褍薪',
            M : '斜懈褉 芯泄',
            MM : '%d 芯泄',
            y : '斜懈褉 泄懈谢',
            yy : '%d 泄懈谢'
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : vietnamese (vi)
// author : Bang Nguyen : https://github.com/bangnk

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('vi', {
        months : 'th谩ng 1_th谩ng 2_th谩ng 3_th谩ng 4_th谩ng 5_th谩ng 6_th谩ng 7_th谩ng 8_th谩ng 9_th谩ng 10_th谩ng 11_th谩ng 12'.split('_'),
        monthsShort : 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
        weekdays : 'ch峄� nh岷璽_th峄� hai_th峄� ba_th峄� t瓢_th峄� n膬m_th峄� s谩u_th峄� b岷'.split('_'),
        weekdaysShort : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        weekdaysMin : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'LT:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM [n膬m] YYYY',
            LLL : 'D MMMM [n膬m] YYYY LT',
            LLLL : 'dddd, D MMMM [n膬m] YYYY LT',
            l : 'DD/M/YYYY',
            ll : 'D MMM YYYY',
            lll : 'D MMM YYYY LT',
            llll : 'ddd, D MMM YYYY LT'
        },
        calendar : {
            sameDay: '[H么m nay l煤c] LT',
            nextDay: '[Ng脿y mai l煤c] LT',
            nextWeek: 'dddd [tu岷 t峄沬 l煤c] LT',
            lastDay: '[H么m qua l煤c] LT',
            lastWeek: 'dddd [tu岷 r峄搃 l煤c] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : '%s t峄沬',
            past : '%s tr瓢峄沜',
            s : 'v脿i gi芒y',
            m : 'm峄檛 ph煤t',
            mm : '%d ph煤t',
            h : 'm峄檛 gi峄�',
            hh : '%d gi峄�',
            d : 'm峄檛 ng脿y',
            dd : '%d ng脿y',
            M : 'm峄檛 th谩ng',
            MM : '%d th谩ng',
            y : 'm峄檛 n膬m',
            yy : '%d n膬m'
        },
        ordinalParse: /\d{1,2}/,
        ordinal : function (number) {
            return number;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : chinese (zh-cn)
// author : suupic : https://github.com/suupic
// author : Zeno Zeng : https://github.com/zenozeng

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('zh-cn', {
        months : '涓€鏈坃浜屾湀_涓夋湀_鍥涙湀_浜旀湀_鍏湀_涓冩湀_鍏湀_涔濇湀_鍗佹湀_鍗佷竴鏈坃鍗佷簩鏈�'.split('_'),
        monthsShort : '1鏈坃2鏈坃3鏈坃4鏈坃5鏈坃6鏈坃7鏈坃8鏈坃9鏈坃10鏈坃11鏈坃12鏈�'.split('_'),
        weekdays : '鏄熸湡鏃鏄熸湡涓€_鏄熸湡浜宊鏄熸湡涓塤鏄熸湡鍥沖鏄熸湡浜擾鏄熸湡鍏�'.split('_'),
        weekdaysShort : '鍛ㄦ棩_鍛ㄤ竴_鍛ㄤ簩_鍛ㄤ笁_鍛ㄥ洓_鍛ㄤ簲_鍛ㄥ叚'.split('_'),
        weekdaysMin : '鏃涓€_浜宊涓塤鍥沖浜擾鍏�'.split('_'),
        longDateFormat : {
            LT : 'Ah鐐筸m',
            LTS : 'Ah鐐筸鍒唖绉�',
            L : 'YYYY-MM-DD',
            LL : 'YYYY骞碝MMD鏃�',
            LLL : 'YYYY骞碝MMD鏃T',
            LLLL : 'YYYY骞碝MMD鏃dddLT',
            l : 'YYYY-MM-DD',
            ll : 'YYYY骞碝MMD鏃�',
            lll : 'YYYY骞碝MMD鏃T',
            llll : 'YYYY骞碝MMD鏃dddLT'
        },
        meridiemParse: /鍑屾櫒|鏃╀笂|涓婂崍|涓崍|涓嬪崍|鏅氫笂/,
        meridiemHour: function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === '鍑屾櫒' || meridiem === '鏃╀笂' ||
                    meridiem === '涓婂崍') {
                return hour;
            } else if (meridiem === '涓嬪崍' || meridiem === '鏅氫笂') {
                return hour + 12;
            } else {
                // '涓崍'
                return hour >= 11 ? hour : hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 600) {
                return '鍑屾櫒';
            } else if (hm < 900) {
                return '鏃╀笂';
            } else if (hm < 1130) {
                return '涓婂崍';
            } else if (hm < 1230) {
                return '涓崍';
            } else if (hm < 1800) {
                return '涓嬪崍';
            } else {
                return '鏅氫笂';
            }
        },
        calendar : {
            sameDay : function () {
                return this.minutes() === 0 ? '[浠婂ぉ]Ah[鐐规暣]' : '[浠婂ぉ]LT';
            },
            nextDay : function () {
                return this.minutes() === 0 ? '[鏄庡ぉ]Ah[鐐规暣]' : '[鏄庡ぉ]LT';
            },
            lastDay : function () {
                return this.minutes() === 0 ? '[鏄ㄥぉ]Ah[鐐规暣]' : '[鏄ㄥぉ]LT';
            },
            nextWeek : function () {
                var startOfWeek, prefix;
                startOfWeek = moment().startOf('week');
                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[涓媇' : '[鏈琞';
                return this.minutes() === 0 ? prefix + 'dddAh鐐规暣' : prefix + 'dddAh鐐筸m';
            },
            lastWeek : function () {
                var startOfWeek, prefix;
                startOfWeek = moment().startOf('week');
                prefix = this.unix() < startOfWeek.unix()  ? '[涓奭' : '[鏈琞';
                return this.minutes() === 0 ? prefix + 'dddAh鐐规暣' : prefix + 'dddAh鐐筸m';
            },
            sameElse : 'LL'
        },
        ordinalParse: /\d{1,2}(鏃鏈坾鍛�)/,
        ordinal : function (number, period) {
            switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
                return number + '鏃�';
            case 'M':
                return number + '鏈�';
            case 'w':
            case 'W':
                return number + '鍛�';
            default:
                return number;
            }
        },
        relativeTime : {
            future : '%s鍐�',
            past : '%s鍓�',
            s : '鍑犵',
            m : '1鍒嗛挓',
            mm : '%d鍒嗛挓',
            h : '1灏忔椂',
            hh : '%d灏忔椂',
            d : '1澶�',
            dd : '%d澶�',
            M : '1涓湀',
            MM : '%d涓湀',
            y : '1骞�',
            yy : '%d骞�'
        },
        week : {
            // GB/T 7408-1994銆婃暟鎹厓鍜屼氦鎹㈡牸寮徛蜂俊鎭氦鎹⒙锋棩鏈熷拰鏃堕棿琛ㄧず娉曘€嬩笌ISO 8601:1988绛夋晥
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
// moment.js locale configuration
// locale : traditional chinese (zh-tw)
// author : Ben : https://github.com/ben-lin

(function (factory) {
    factory(moment);
}(function (moment) {
    return moment.defineLocale('zh-tw', {
        months : '涓€鏈坃浜屾湀_涓夋湀_鍥涙湀_浜旀湀_鍏湀_涓冩湀_鍏湀_涔濇湀_鍗佹湀_鍗佷竴鏈坃鍗佷簩鏈�'.split('_'),
        monthsShort : '1鏈坃2鏈坃3鏈坃4鏈坃5鏈坃6鏈坃7鏈坃8鏈坃9鏈坃10鏈坃11鏈坃12鏈�'.split('_'),
        weekdays : '鏄熸湡鏃鏄熸湡涓€_鏄熸湡浜宊鏄熸湡涓塤鏄熸湡鍥沖鏄熸湡浜擾鏄熸湡鍏�'.split('_'),
        weekdaysShort : '閫辨棩_閫变竴_閫变簩_閫变笁_閫卞洓_閫变簲_閫卞叚'.split('_'),
        weekdaysMin : '鏃涓€_浜宊涓塤鍥沖浜擾鍏�'.split('_'),
        longDateFormat : {
            LT : 'Ah榛瀖m',
            LTS : 'Ah榛瀖鍒唖绉�',
            L : 'YYYY骞碝MMD鏃�',
            LL : 'YYYY骞碝MMD鏃�',
            LLL : 'YYYY骞碝MMD鏃T',
            LLLL : 'YYYY骞碝MMD鏃dddLT',
            l : 'YYYY骞碝MMD鏃�',
            ll : 'YYYY骞碝MMD鏃�',
            lll : 'YYYY骞碝MMD鏃T',
            llll : 'YYYY骞碝MMD鏃dddLT'
        },
        meridiemParse: /鏃╀笂|涓婂崍|涓崍|涓嬪崍|鏅氫笂/,
        meridiemHour : function (hour, meridiem) {
            if (hour === 12) {
                hour = 0;
            }
            if (meridiem === '鏃╀笂' || meridiem === '涓婂崍') {
                return hour;
            } else if (meridiem === '涓崍') {
                return hour >= 11 ? hour : hour + 12;
            } else if (meridiem === '涓嬪崍' || meridiem === '鏅氫笂') {
                return hour + 12;
            }
        },
        meridiem : function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 900) {
                return '鏃╀笂';
            } else if (hm < 1130) {
                return '涓婂崍';
            } else if (hm < 1230) {
                return '涓崍';
            } else if (hm < 1800) {
                return '涓嬪崍';
            } else {
                return '鏅氫笂';
            }
        },
        calendar : {
            sameDay : '[浠婂ぉ]LT',
            nextDay : '[鏄庡ぉ]LT',
            nextWeek : '[涓媇ddddLT',
            lastDay : '[鏄ㄥぉ]LT',
            lastWeek : '[涓奭ddddLT',
            sameElse : 'L'
        },
        ordinalParse: /\d{1,2}(鏃鏈坾閫�)/,
        ordinal : function (number, period) {
            switch (period) {
            case 'd' :
            case 'D' :
            case 'DDD' :
                return number + '鏃�';
            case 'M' :
                return number + '鏈�';
            case 'w' :
            case 'W' :
                return number + '閫�';
            default :
                return number;
            }
        },
        relativeTime : {
            future : '%s鍏�',
            past : '%s鍓�',
            s : '骞剧',
            m : '涓€鍒嗛悩',
            mm : '%d鍒嗛悩',
            h : '涓€灏忔檪',
            hh : '%d灏忔檪',
            d : '涓€澶�',
            dd : '%d澶�',
            M : '涓€鍊嬫湀',
            MM : '%d鍊嬫湀',
            y : '涓€骞�',
            yy : '%d骞�'
        }
    });
}));

    moment.locale('en');


    /************************************
        Exposing Moment
    ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate(
                    'Accessing Moment through the global scope is ' +
                    'deprecated, and will be removed in an upcoming ' +
                    'release.',
                    moment);
        } else {
            globalScope.moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === 'function' && define.amd) {
        define(function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);