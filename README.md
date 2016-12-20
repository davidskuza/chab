# chab

[![Build Status](https://travis-ci.org/davidskuza/chab.svg?branch=master)](https://travis-ci.org/davidskuza/chab) [![npm version](https://badge.fury.io/js/chab.svg)](https://badge.fury.io/js/chab)

Simple to use implementation of event bus.

As for now needs ES2015.

# Usage

### NPM

```
npm install chab --save
```

### Browser

```
<script type="text/javascript" src="chab.js"></script>
```

# Example with Babel & webpack

```js
import { CreateChab } from 'chab'

const chab = CreateChab()

const sub = chab.subscribe('topicName', data => {
  console.log(`Welcome ${data.name}!`)
})

chab.publish('topicName', { name: 'User' })

sub.unsubscribe()
```

# In browser available from chab namespace

```js
chab.CreateChab()
```

# API

## chab instance

### <a id="subscribe"></a> `subscribe(topic, callback)`

Subscribes on given topic.
Callback is called with two arguments: 
  - data which is passed by [`publish`](#publish) function
  - unsubscribe function, which when called will unsubscribe

- - -

### <a id="publish"></a> `publish(topic, data)`

Publishes message on given topic.
If no subscriber will be found at publish time message gets stored and dispatched when somebody finally subscribes.
