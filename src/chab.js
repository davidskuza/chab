(function() {
  var chab = (function() {
    var chab = {};
    var subscribers = {};

    function matchPattern(text, pattern) {
      var containsPattern = pattern.indexOf('*') !== -1 || pattern.indexOf('#') !== -1;

      if (!containsPattern) {
        return text === pattern;
      } else {
        var regExp = pattern.replace(/\./g, '\\.');
        regExp = regExp.replace(/\*/g, '\\w+');
        regExp = regExp.replace(/#/g, '.+?');
        regExp = '^' + regExp + '$';

        regExp = new RegExp(regExp);

        return regExp.test(text);
      }
    }

    chab.subscribe = function (data) {
      if (data.channel === undefined) {
        data.channel = 'default';
      }

      if (subscribers[data.channel] === undefined) {
        subscribers[data.channel] = {};
      }

      if (subscribers[data.channel][data.topic] === undefined) {
        subscribers[data.channel][data.topic] = [];
      }

      subscribers[data.channel][data.topic].push(data.callback);

      return {
        unsubscribe: function () {
          var callbackIndex = subscribers[data.channel][data.topic].indexOf(data.callback);
          if (callbackIndex > -1) {
            subscribers[data.channel][data.topic].splice(callbackIndex, 1);
          }
        }
      }
    }

    chab.publish = function (data) {
      if (data.channel === undefined) {
        data.channel = 'default';
      }

      if (subscribers[data.channel] === undefined) {
        return;
      }

      for (var topicPattern in Object.keys(subscribers[data.channel])) {
        if (matchPattern(data.topic, topicPattern)) {
          for (var subscriber in subscribers[data.channel][topicPattern]) {
            subscriber(data.data, {
              channel: data.channel,
              topic: data.topic
            });
          }
        }
      }
    }

    return chab;
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = chab;
  } else {
    if (typeof defined === 'function' && define.amd) {
      define([], function() {
        return chab;
      })
    } else {
      window.chab = chab;
    }
  }
})();
