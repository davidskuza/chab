import CreateChab, { doTextMatchPattern } from './chab'

const TEXT_PATTERN_EXCEPTATION = [
  ['topic', 'topic', true],
  ['topic', '*', true],
  ['topic', '#', true],
  ['topic', 'topi', false],
  ['topic', 'topic.*', false],
  ['topic', 'topic.#', false],
  ['topic', 'topic2', false],
  ['topic.topic2', 'topic.topic2', true],
  ['topic.topic2', 'topic.*', true],
  ['topic.topic2', 'topic.#', true],
  ['topic.topic2', '#', true],
  ['topic.topic2', '*', false],
  ['topic.topic2', '*.topic2', true],
  ['topic.topic2', '*.*', true],
  ['topic.topic2', 'topic.topic', false],
  ['topic.topic2', '#.topic2', true]
]

for (const testData of TEXT_PATTERN_EXCEPTATION) {
  let title = `${testData[1]} matches ${testData[0]}`
  if (!testData[2]) {
    title = `${testData[1]} does not matches ${testData[0]}`
  }

  test(title, () => {
    expect(doTextMatchPattern(testData[0], testData[1])).toBe(testData[2])
  })
}

test('subscribing to anything returns object with unsubscribe function', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('channel', 'topic', () => {})

  expect(typeof(subObj.unsubscribe)).toBe('function')
})

test('subscribing to anything returns object with unsubscribe function (short api version)', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})

  expect(typeof(subObj.unsubscribe)).toBe('function')
})

test('subscribing to channel#topic adds listener to global listeners object', () => {
  const chab = CreateChab()

  chab.subscribe('channelName', 'topicName', () => {})

  expect(chab.subscribers['channelName']['topicName']['subscribers'].length).toBe(1)
})

test('subscribing to channel#topic adds listener to global listeners object (short api version)', () => {
  const chab = CreateChab()

  chab.subscribe('topicName', () => {})

  expect(chab.subscribers['default']['topicName']['subscribers'].length).toBe(1)
})

test('subscribing to diffrent channels stores diffrent listeners', () => {
  const chab = CreateChab()

  chab.subscribe('channel', 'topic', () => {})
  chab.subscribe('channel', 'topic2', () => {})
  chab.subscribe('channel', 'topic3', () => {})
  chab.subscribe('channel2', 'topic', () => {})
  chab.subscribe('channel2', 'topic2', () => {})
  chab.subscribe('channel2', 'topic2', () => {})

  expect(chab.subscribers['channel']['topic'].subscribers.length).toBe(1)
  expect(chab.subscribers['channel']['topic2'].subscribers.length).toBe(1)
  expect(chab.subscribers['channel']['topic3'].subscribers.length).toBe(1)
  expect(chab.subscribers['channel2']['topic'].subscribers.length).toBe(1)
  expect(chab.subscribers['channel2']['topic2'].subscribers.length).toBe(2)
})

test('publishing to diffrent channels with diffrent topics stores them correctly as queued', () => {
  const chab = CreateChab()

  chab.publish('channel', 'topic', () => {})
  chab.publish('channel', 'topic2', () => {})
  chab.publish('channel', 'topic3', () => {})
  chab.publish('channel2', 'topic', () => {})
  chab.publish('channel2', 'topic2', () => {})
  chab.publish('channel2', 'topic2', () => {})

  expect(chab.queued['channel']['topic'].length).toBe(1)
  expect(chab.queued['channel']['topic2'].length).toBe(1)
  expect(chab.queued['channel']['topic3'].length).toBe(1)
  expect(chab.queued['channel2']['topic'].length).toBe(1)
  expect(chab.queued['channel2']['topic2'].length).toBe(2)
})

test('subscribing with 2 arguments uses default channel', () => {
  const chab = CreateChab()

  chab.subscribe('topic', () => {})
  expect(chab.subscribers['default']['topic'].subscribers.length).toBe(1)
})

test('subscribing and unsubscribing removes callback', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})
  expect(chab.subscribers['default']['topic'].subscribers.length).toBe(1)
  subObj.unsubscribe()
  expect(chab.subscribers['default']['topic'].subscribers.length).toBe(0)
})

test('double unsubscribing does not fail', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})
  expect(chab.subscribers['default']['topic'].subscribers.length).toBe(1)
  subObj.unsubscribe()
  subObj.unsubscribe()
  expect(chab.subscribers['default']['topic'].subscribers.length).toBe(0)
})

test('subscribing and unsubscribing removes callback (test with many subscribers)', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})
  chab.subscribe('topic2', () => {})
  expect(chab.subscribers['default']['topic'].subscribers.length).toBe(1)
  expect(chab.subscribers['default']['topic2'].subscribers.length).toBe(1)
  subObj.unsubscribe()
  expect(chab.subscribers['default']['topic'].subscribers.length).toBe(0)
  expect(chab.subscribers['default']['topic2'].subscribers.length).toBe(1)
})

test('subscribing and unsubscribing removes callback (test with many subscribers)', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})
  chab.subscribe('topic', () => {})
  chab.subscribe('topic', () => {})
  chab.subscribe('topic2', () => {})
  expect(chab.subscribers['default']['topic'].subscribers.length).toBe(3)
  expect(chab.subscribers['default']['topic2'].subscribers.length).toBe(1)
  subObj.unsubscribe()
  expect(chab.subscribers['default']['topic'].subscribers.length).toBe(2)
  expect(chab.subscribers['default']['topic2'].subscribers.length).toBe(1)
})

test('publishing to subscribed topic receives message', () => {
  const chab = CreateChab()

  const callbackMock = jest.fn()

  chab.subscribe('topicName', callbackMock)
  chab.publish('topicName', 'passed')

  expect(callbackMock.mock.calls.length).toBe(1)
  expect(callbackMock.mock.calls[0][0]).toBe('passed')
})

test('publishing to not subscribed topic adds to queued', () => {
  const chab = CreateChab()

  chab.publish('topicName', 'passed')

  expect(chab.queued['default']['topicName'].length).toBe(1)
})

test('publishing to not subscribed topic and then subscribing receives', () => {
  const chab = CreateChab()

  chab.publish('topicName', 'passed')

  const callbackMock = jest.fn()
  chab.subscribe('topicName', callbackMock)

  expect(callbackMock.mock.calls.length).toBe(1)
  expect(callbackMock.mock.calls[0][0]).toBe('passed')
})

test('publishing to not subscribed topic and then subscribing with pattern receives', () => {
  const chab = CreateChab()

  chab.publish('topicName.subName', 'passed')

  const callbackMock = jest.fn()
  chab.subscribe('topicName.*', callbackMock)

  expect(callbackMock.mock.calls.length).toBe(1)
  expect(callbackMock.mock.calls[0][0]).toBe('passed')
})

test('publishing to not subscribed topic and then subscribing receives (3 args)', () => {
  const chab = CreateChab()

  chab.publish('channelName', 'topicName', 'passed')

  const callbackMock = jest.fn()
  chab.subscribe('channelName', 'topicName', callbackMock)

  expect(callbackMock.mock.calls.length).toBe(1)
  expect(callbackMock.mock.calls[0][0]).toBe('passed')
})

test('subscribing, unsubscribing and publishing adds to queued', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topicName', () => {})
  subObj.unsubscribe()

  chab.publish('topicName', 'passed')

  expect(chab.queued['default']['topicName'].length).toBe(1)
})

test('publishing to only one receives only one callback', () => {
  const chab = CreateChab()

  const callbackMock = jest.fn()
  const callbackMock2 = jest.fn()

  chab.subscribe('topicName', callbackMock)
  chab.subscribe('topicName', callbackMock2)

  chab.publish('default', 'topicName', 'passed', true)

  expect(callbackMock.mock.calls.length).toBe(0)
  expect(callbackMock2.mock.calls.length).toBe(1)
  expect(callbackMock2.mock.calls[0][0]).toBe('passed')
})

test('publishing to only one receives only one callback (topic pattern)', () => {
  const chab = CreateChab()

  const callbackMock = jest.fn()
  const callbackMock2 = jest.fn()

  chab.subscribe('topicName.*.sub', callbackMock)
  chab.subscribe('topicName.*.sub', callbackMock2)

  chab.publish('default', 'topicName.test.sub', 'passed', true)

  expect(callbackMock.mock.calls.length).toBe(0)
  expect(callbackMock2.mock.calls.length).toBe(1)
  expect(callbackMock2.mock.calls[0][0]).toBe('passed')
})

test('publishing to only one receives only one callback (diffrent topic patterns, matching the same)', () => {
  const chab = CreateChab()

  const callbackMock = jest.fn()
  const callbackMock2 = jest.fn()

  chab.subscribe('topicName.test.*', callbackMock)
  chab.subscribe('topicName.*.sub', callbackMock2)

  chab.publish('default', 'topicName.test.sub', 'passed', true)

  expect(callbackMock.mock.calls.length).toBe(0)
  expect(callbackMock2.mock.calls.length).toBe(1)
  expect(callbackMock2.mock.calls[0][0]).toBe('passed')
})

test('publishing to only one receives only one callback (with late subscribing)', () => {
  const chab = CreateChab()

  chab.publish('default', 'topicName', 'passed', true)

  const callbackMock = jest.fn()
  const callbackMock2 = jest.fn()

  chab.subscribe('topicName', callbackMock)
  chab.subscribe('topicName', callbackMock2)

  expect(callbackMock.mock.calls.length).toBe(1)
  expect(callbackMock.mock.calls[0][0]).toBe('passed')
  expect(callbackMock2.mock.calls.length).toBe(0)
})
