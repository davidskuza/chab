# chab

[![Build Status](https://travis-ci.org/davidskuza/chab.svg?branch=master)](https://travis-ci.org/davidskuza/chab) [![npm version](https://badge.fury.io/js/chab.svg)](https://badge.fury.io/js/chab)

# Example

```js
import CreateChab from 'chab'

const chab = CreateChab()

const sub = chab.subscribe('channel', 'topic.*', (data, envelope) => {
  console.log(`Welcome ${data.name}!`)
})

chab.publish('channel', 'topic.subtopic', { name: 'User' })

sub.unsubscribe()
```

# Instalation

```
npm install chab --save
```

# API

API functions which do not get channel as arguments uses 'default'.

## chab instance

### <a id="subscribe"></a> `subscribe(topicPattern, callback)`
### `subscribe(channel, topicPattern, callback)`

Subscribes on given [`topic pattern`](#topicPattern).
Callback receives two arguments: data which is passed by [`publish`](#publish) function and "envelope" which contains channel and topic (not pattern) on which message was published

- - -

### <a id="publish"></a> `publish(topic, data)`
### `publish(channel, topic, data, onlyOnce)`
### `publish(topic, data, onlyOnce)`

Publishes message on given channel and topic.
If no subscriber will be found at publish time message gets stored and dispatched when somebody finally subscribes.

onlyOnce is used when there are many subscribers or can be and you need to be sure that it's dispatched to only one subscriber.

## <a id="topicPattern"></a> Topic pattern

I decided to make support for segmented topics (separated by dot) and because of that we can make patterns which can match many topics with unknown segments.

- `*` matches one and only one segment
- `#` matches one or more segments

`topic.subtopic` will be matched by `topic`, `#`, `topic.*`, `*.subtopic` but not `*`.
