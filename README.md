# chab

[![Build Status](https://travis-ci.org/davidskuza/chab.svg?branch=master)](https://travis-ci.org/davidskuza/chab)

## Example

```js
import CreateChab from 'chab'

const chab = CreateChab()

const sub = chab.subscribe('channel', 'topic.*', (data, envelope) => {
  console.log(`Welcome ${data.name}!`)
})

chab.publish('channel', 'topic.subtopic', { name: 'User' })

sub.unsubscribe()
```

## Instalation

```
npm install chab --save
```
