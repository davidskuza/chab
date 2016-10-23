export const CreateChab = () => {
  return {
    subscribers: {},
    queued: {},
    subscribe: function (topic, callback) {
      if (this.subscribers[topic] === undefined) {
        this.subscribers[topic] = []
      }

      this.subscribers[topic].push(callback)

      if (this.queued[topic] !== undefined) {
        for (const queuedTopicItem of this.queued[topic]) {
          callback(queuedTopicItem)
        }

        this.queued[topic] = []
      }

      return {
        unsubscribe: () => {
          const index = this.subscribers[topic]
            .findIndex(s => s === callback)

          if (index !== -1) {
            this.subscribers[topic].splice(index, 1)
          }
        }
      }
    },
    publish: function (topic, data, onlyOnce) {
      if (this.subscribers[topic] === undefined) {
        this.subscribers[topic] = []
      }

      if (this.subscribers[topic] === undefined || this.subscribers[topic].length === 0) {
        if (this.queued[topic] === undefined) {
          this.queued[topic] = []
        }

        this.queued[topic].push(data)

        return
      }

      if (onlyOnce) {
        this.subscribers[topic][this.subscribers[topic].length - 1](data)
      } else {
        this.subscribers[topic].forEach(s => s(data))
      }
    }
  }
}
