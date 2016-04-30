'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _nodeIrc = require('node-irc');

var _nodeIrc2 = _interopRequireDefault(_nodeIrc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Norbert = function Norbert() {
    _classCallCheck(this, Norbert);

    this.clients = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        var _loop = function _loop() {
            var server = _step.value;

            var temp = new _nodeIrc2.default(server.hostname, server.port, server.nick, server.fullname);

            temp.on('ready', function () {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = server.channels[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var channel = _step2.value;

                        temp.join(channel);
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
            });

            temp.connect();

            console.log(temp);
            console.log(server);
        };

        for (var _iterator = _config2.default.get('servers')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _loop();
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
};

exports.default = Norbert;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvTm9yYmVydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7OztJQUVxQixPLEdBR2pCLG1CQUFjO0FBQUE7O0FBQ1YsU0FBSyxPQUFMLEdBQWUsRUFBZjs7QUFEVTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGdCQUdGLE1BSEU7O0FBSU4sZ0JBQUksT0FBTyxzQkFBVyxPQUFPLFFBQWxCLEVBQTRCLE9BQU8sSUFBbkMsRUFBeUMsT0FBTyxJQUFoRCxFQUFzRCxPQUFPLFFBQTdELENBQVg7O0FBRUEsaUJBQUssRUFBTCxDQUFRLE9BQVIsRUFBaUIsWUFBTTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNwQiwwQ0FBbUIsT0FBTyxRQUExQixtSUFBb0M7QUFBQSw0QkFBNUIsT0FBNEI7O0FBQ2hDLDZCQUFLLElBQUwsQ0FBVSxPQUFWO0FBQ0g7QUFIbUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUl0QixhQUpEOztBQU9BLGlCQUFLLE9BQUw7O0FBRUEsb0JBQVEsR0FBUixDQUFZLElBQVo7QUFDQSxvQkFBUSxHQUFSLENBQVksTUFBWjtBQWhCTTs7QUFHViw2QkFBOEYsaUJBQU8sR0FBUCxDQUFXLFNBQVgsQ0FBOUYsOEhBQXFIO0FBQUE7QUFjcEg7QUFqQlM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWtCYixDOztrQkFyQmdCLE8iLCJmaWxlIjoiTm9yYmVydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XG5cbmltcG9ydCBjb25maWcgZnJvbSAnY29uZmlnJztcbmltcG9ydCBDbGllbnQgZnJvbSAnbm9kZS1pcmMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb3JiZXJ0IHtcbiAgICBjbGllbnRzOiBbY2xpZW50XTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNsaWVudHMgPSBbXTtcblxuICAgICAgICBmb3IobGV0IHNlcnZlcjp7aG9zdG5hbWU6c3RyaW5nLHBvcnQ6c3RyaW5nLG5pY2s6c3RyaW5nLGZ1bGxuYW1lOnN0cmluZyxjaGFubmVsczpbc3RyaW5nXX0gb2YgY29uZmlnLmdldCgnc2VydmVycycpKSB7XG4gICAgICAgICAgICBsZXQgdGVtcCA9IG5ldyBDbGllbnQoc2VydmVyLmhvc3RuYW1lLCBzZXJ2ZXIucG9ydCwgc2VydmVyLm5pY2ssIHNlcnZlci5mdWxsbmFtZSk7XG5cbiAgICAgICAgICAgIHRlbXAub24oJ3JlYWR5JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgZm9yKGxldCBjaGFubmVsIG9mIHNlcnZlci5jaGFubmVscykge1xuICAgICAgICAgICAgICAgICAgIHRlbXAuam9pbihjaGFubmVsKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIHRlbXAuY29ubmVjdCgpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0ZW1wKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9XG59Il19