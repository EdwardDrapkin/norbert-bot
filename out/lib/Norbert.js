'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _nodeIrc = require('node-irc');

var _nodeIrc2 = _interopRequireDefault(_nodeIrc);

var _Plugin = require('../plugins/Plugin');

var _Plugin2 = _interopRequireDefault(_Plugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Norbert = function Norbert() {
    _classCallCheck(this, Norbert);

    var server = _config2.default.get('server');
    var temp = new _nodeIrc2.default(server.hostname, server.port, server.nick, server.fullname);

    temp.on('ready', function () {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = server.channels[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var channel = _step.value;

                temp.join(channel);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    });

    var plugins = _config2.default.get('plugins');

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = plugins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var plugin = _step2.value;

            plugin.subscribe(temp);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    temp.connect();

    this.client = temp;
};

exports.default = Norbert;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvTm9yYmVydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7SUFHcUIsTyxHQUdqQixtQkFBYztBQUFBOztBQUNWLFFBQUksU0FBcUYsaUJBQU8sR0FBUCxDQUFXLFFBQVgsQ0FBekY7QUFDQSxRQUFJLE9BQU8sc0JBQVcsT0FBTyxRQUFsQixFQUE0QixPQUFPLElBQW5DLEVBQXlDLE9BQU8sSUFBaEQsRUFBc0QsT0FBTyxRQUE3RCxDQUFYOztBQUVBLFNBQUssRUFBTCxDQUFRLE9BQVIsRUFBaUIsWUFBTTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNuQixpQ0FBbUIsT0FBTyxRQUExQiw4SEFBb0M7QUFBQSxvQkFBNUIsT0FBNEI7O0FBQ2hDLHFCQUFLLElBQUwsQ0FBVSxPQUFWO0FBQ0g7QUFIa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUl0QixLQUpEOztBQU1BLFFBQUksVUFBbUIsaUJBQU8sR0FBUCxDQUFXLFNBQVgsQ0FBdkI7O0FBVlU7QUFBQTtBQUFBOztBQUFBO0FBWVYsOEJBQWtCLE9BQWxCLG1JQUEyQjtBQUFBLGdCQUFuQixNQUFtQjs7QUFDdkIsbUJBQU8sU0FBUCxDQUFpQixJQUFqQjtBQUNIO0FBZFM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFnQlYsU0FBSyxPQUFMOztBQUVBLFNBQUssTUFBTCxHQUFjLElBQWQ7QUFDSCxDOztrQkF0QmdCLE8iLCJmaWxlIjoiTm9yYmVydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XG5cbmltcG9ydCBjb25maWcgZnJvbSAnY29uZmlnJztcbmltcG9ydCBDbGllbnQgZnJvbSAnbm9kZS1pcmMnO1xuaW1wb3J0IFBsdWdpbiBmcm9tICdwbHVnaW5zL1BsdWdpbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vcmJlcnQge1xuICAgIGNsaWVudDpDbGllbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgbGV0IHNlcnZlcjp7aG9zdG5hbWU6c3RyaW5nLHBvcnQ6c3RyaW5nLG5pY2s6c3RyaW5nLGZ1bGxuYW1lOnN0cmluZyxjaGFubmVsczpbc3RyaW5nXX0gPSBjb25maWcuZ2V0KCdzZXJ2ZXInKTtcbiAgICAgICAgbGV0IHRlbXAgPSBuZXcgQ2xpZW50KHNlcnZlci5ob3N0bmFtZSwgc2VydmVyLnBvcnQsIHNlcnZlci5uaWNrLCBzZXJ2ZXIuZnVsbG5hbWUpO1xuXG4gICAgICAgIHRlbXAub24oJ3JlYWR5JywgKCkgPT4ge1xuICAgICAgICAgICAgZm9yKGxldCBjaGFubmVsIG9mIHNlcnZlci5jaGFubmVscykge1xuICAgICAgICAgICAgICAgIHRlbXAuam9pbihjaGFubmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHBsdWdpbnM6W1BsdWdpbl0gPSBjb25maWcuZ2V0KCdwbHVnaW5zJyk7XG5cbiAgICAgICAgZm9yKGxldCBwbHVnaW4gb2YgcGx1Z2lucykge1xuICAgICAgICAgICAgcGx1Z2luLnN1YnNjcmliZSh0ZW1wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRlbXAuY29ubmVjdCgpO1xuXG4gICAgICAgIHRoaXMuY2xpZW50ID0gdGVtcDtcbiAgICB9XG59Il19