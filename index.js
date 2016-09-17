export default () => {
  return {
    subscribers: {},
    doTextMatchPattern: (text, pattern) => {
      var containsPattern = pattern.includes('*') || pattern.includes('#')

      if (!containsPattern) {
        return text === pattern
      }

      let regExp = pattern.replace(/\./g, '\\.')
      regExp = regExp.replace(/\*/g, '\\w+');
      regExp = regExp.replace(/#/g, '.+?');
      regExp = '^' + regExp + '$';

      regExp = new RegExp(regExp);

      return regExp.test(text);
    },
    subscribe: function () {
      // if we don't provide 3 arguments then we get 1st argument as topic and 2nd
      //  as callback, channel is 'default'

      let channel = arguments[0]
      let topicPattern = arguments[1]
      let callback = arguments[2]

      if (arguments.length === 2) {
        channel = 'default'
        topicPattern = arguments[0]
        callback = arguments[1]
      }

      if (this.subscribers[channel] === undefined) {
        this.subscribers[channel] = {}
      }

      if (this.subscribers[channel][topicPattern] === undefined) {
        this.subscribers[channel][topicPattern] = { subscribers: [], queued: [] }
      }

      this.subscribers[channel][topicPattern].subscribers.push(callback)

      for (const queued of this.subscribers[channel][topicPattern].queued) {
        callback(queued.data, {
          channel: queued.channel,
          topic: queued.topic
        })
      }

      this.subscribers[channel][topicPattern].queued = []

      return {
        unsubscribe: () => {
          const index = this.subscribers[channel][topicPattern].subscribers
            .findIndex(s => s === callback)

          if (index !== -1) {
            this.subscribers[channel][topicPattern].subscribers.splice(index, 1)
          }
        }
      }
    },
    publish: function () {
      let channel = arguments[0]
      let topic = arguments[1]
      let data = arguments[2]
      let onlyOnce = arguments[3]

      if (arguments.length === 3) {
        channel = 'default'
        topic = arguments[0]
        data = arguments[1]
        onlyOnce = arguments[2]
      } else if (arguments.length === 2) {
        channel = 'default'
        topic = arguments[0]
        data = arguments[1]
        onlyOnce = false
      }

      if (this.subscribers[channel] === undefined ||
        this.subscribers[channel][topic] === undefined ||
        this.subscribers[channel][topic].subscribers.length == 0) {
        this.subscribers[channel] = {
          topic: {
            subscribers: [],
            queued: [
              {
                channel,
                topic,
                data
              }
            ]
          }
        }
        return
      }

      const matchedTopicPatterns = Object.keys(this.subscribers[channel]).filter(t => this.doTextMatchPattern(topic, t))

      for (const topicPattern of matchedTopicPatterns) {
        if (!onlyOnce) {
          this.subscribers[channel][topicPattern].subscribers
            .forEach(s => s(data, {
              channel,
              topic
            }))
        } else {
          const subCount = this.subscribers[channel][topicPattern].subscribers.length
          this.subscribers[channel][topicPattern]
            .subscribers[subCount - 1](data, {
              channel,
              topic
            })
        }
      }
    }
  }
}
