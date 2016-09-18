export const doTextMatchPattern = (text, pattern) => {
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
}

export default () => {
  return {
    subscribers: {},
    queued: {},
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
        this.subscribers[channel][topicPattern] = { subscribers: [] }
      }

      this.subscribers[channel][topicPattern].subscribers.push(callback)

      if (this.queued[channel] !== undefined) {
        const matchingQueuedTopics = Object.keys(this.queued[channel])
          .filter(t => doTextMatchPattern(t, topicPattern))

        for (const topic of matchingQueuedTopics) {
          for (const data of this.queued[channel][topic]) {
            callback(data.data, {
              channel: data.channel,
              topic: data.topic
            })
          }

          this.queued[channel][topic] = []
        }
      }

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
        channel = arguments[0]
        topic = arguments[1]
        data = arguments[2]
        onlyOnce = false
      } else if (arguments.length === 2) {
        channel = 'default'
        topic = arguments[0]
        data = arguments[1]
        onlyOnce = false
      }

      if (this.subscribers[channel] === undefined) {
        if (this.queued[channel] === undefined) {
          this.queued[channel] = {}
        }
        if (this.queued[channel][topic] === undefined) {
          this.queued[channel][topic] = []
        }

        this.queued[channel][topic].push({
          channel,
          topic,
          data
        })

        return
      }

      const matchedTopicPatterns = Object.keys(this.subscribers[channel]).filter(t => doTextMatchPattern(topic, t))

      const matchingSubscribersCount = matchedTopicPatterns
        .map(t => this.subscribers[channel][t].subscribers.length)
        .reduce((acc, len) => acc += len, 0)

      if (matchingSubscribersCount === 0) {
        if (this.queued[channel] === undefined) {
          this.queued[channel] = {}
        }
        if (this.queued[channel][topic] === undefined) {
          this.queued[channel][topic] = []
        }

        this.queued[channel][topic].push({
          channel,
          topic,
          data
        })

        return
      }

      for (const topicPattern of matchedTopicPatterns.reverse()) {
        if (onlyOnce) {
          const subCount = this.subscribers[channel][topicPattern].subscribers.length
          this.subscribers[channel][topicPattern]
            .subscribers[subCount - 1](data, {
              channel,
              topic
            })
          return
        } else {
          this.subscribers[channel][topicPattern].subscribers
            .forEach(s => s(data, {
              channel,
              topic
            }))
        }
      }
    }
  }
}
