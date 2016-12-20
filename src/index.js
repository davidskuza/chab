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
          const result = callback(queuedTopicItem)
          
          if (result) {
            const index = this.subscribers[topic]
              .findIndex(s => s === callback)
  
            if (index !== -1) {
              this.subscribers[topic].splice(index, 1)
            }
          }
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
    publish: function (topic, data) {
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
      
      for (const subscriber of this.subscribers[topic]) {
        const result = subscriber(data)
        
        if (result) {
          const index = this.subscribers[topic]
            .findIndex(s => s === subscriber)

          if (index !== -1) {
            this.subscribers[topic].splice(index, 1)
          }
        }
      }
    }
  }
}