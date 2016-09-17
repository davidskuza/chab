import CreateChab from './index'

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
    const chab = CreateChab()

    expect(chab.doTextMatchPattern(testData[0], testData[1])).toBe(testData[2])
  })
}

test('subscribing to anything returns object with unsubscribe function', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('channel', 'topic', () => {})
  const subObj2 = chab.subscribe('topic', () => {})

  expect(typeof(subObj.unsubscribe)).toBe('function')
  expect(typeof(subObj2.unsubscribe)).toBe('function')
})

test('subscribing to anything returns object with unsubscribe function (2 arguments)', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})

  expect(typeof(subObj.unsubscribe)).toBe('function')
})

test('subscribing to channel#topic adds listener to global listeners object', () => {
  const chab = CreateChab()

  chab.subscribe('channel', 'topic', () => {})
  chab.subscribe('topic', () => {})

  expect(chab.subscribers['channel']['topic']['subscribers'].length).toBe(1)
  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(1)
})

test('subscribing to channel#topic adds listener to global listeners object (2 arguments)', () => {
  const chab = CreateChab()

  chab.subscribe('topic', () => {})

  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(1)
})

test('subscribing to diffrent channels stores diffrent listeners', () => {
  const chab = CreateChab()

  chab.subscribe('channel', 'topic', () => {})
  chab.subscribe('channel', 'topic2', () => {})
  chab.subscribe('channel', 'topic3', () => {})
  chab.subscribe('channel2', 'topic', () => {})
  chab.subscribe('channel2', 'topic2', () => {})
  chab.subscribe('channel2', 'topic2', () => {})

  expect(chab.subscribers['channel']['topic']['subscribers'].length).toBe(1)
  expect(chab.subscribers['channel']['topic2']['subscribers'].length).toBe(1)
  expect(chab.subscribers['channel']['topic3']['subscribers'].length).toBe(1)
  expect(chab.subscribers['channel2']['topic']['subscribers'].length).toBe(1)
  expect(chab.subscribers['channel2']['topic2']['subscribers'].length).toBe(2)
})

test('subscribing with 2 arguments uses default channel', () => {
  const chab = CreateChab()

  chab.subscribe('topic', () => {})
  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(1)
})

test('subscribing and unsubscribing removes callback', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})
  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(1)
  subObj.unsubscribe()
  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(0)
})

test('double unsubscribing does not fail', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})
  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(1)
  subObj.unsubscribe()
  subObj.unsubscribe()
  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(0)
})

test('subscribing and unsubscribing removes callback (test with many subscribers)', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})
  chab.subscribe('topic2', () => {})
  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(1)
  expect(chab.subscribers['default']['topic2']['subscribers'].length).toBe(1)
  subObj.unsubscribe()
  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(0)
  expect(chab.subscribers['default']['topic2']['subscribers'].length).toBe(1)
})

test('subscribing and unsubscribing removes callback (test with many subscribers)', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})
  chab.subscribe('topic', () => {})
  chab.subscribe('topic', () => {})
  chab.subscribe('topic2', () => {})
  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(3)
  expect(chab.subscribers['default']['topic2']['subscribers'].length).toBe(1)
  subObj.unsubscribe()
  expect(chab.subscribers['default']['topic']['subscribers'].length).toBe(2)
  expect(chab.subscribers['default']['topic2']['subscribers'].length).toBe(1)
})

test('publishing to subscribed topic receives message', () => {
  const chab = CreateChab()

  const callbackMock = jest.fn()

  chab.subscribe('topic', callbackMock)
  chab.publish('topic', 'passed')

  expect(callbackMock.mock.calls.length).toBe(1)
  expect(callbackMock.mock.calls[0][0]).toBe('passed')
})

test('publishing to not subscribed topic adds to queued', () => {
  const chab = CreateChab()

  chab.publish('topic', 'passed')

  expect(chab.subscribers['default']['topic']['queued'].length).toBe(1)
})

test('publishing to not subscribed topic adds to queued (3 arguments)', () => {
  const chab = CreateChab()

  chab.publish('topic', 'passed')

  expect(chab.subscribers['default']['topic']['queued'].length).toBe(1)
})

test('publishing to not subscribed topic and then subscribing receives', () => {
  const chab = CreateChab()

  chab.publish('topic', 'passed')

  const callbackMock = jest.fn()
  chab.subscribe('topic', callbackMock)

  expect(callbackMock.mock.calls.length).toBe(1)
  expect(callbackMock.mock.calls[0][0]).toBe('passed')
})

test('subscribing, unsubscribing and publishing adds to queued', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic', () => {})
  subObj.unsubscribe()

  chab.publish('topic', 'passed')

  expect(chab.subscribers['default']['topic']['queued'].length).toBe(1)
})

test('publishing to only one receives only one callback', () => {
  const chab = CreateChab()

  const callbackMock = jest.fn()
  const callbackMock2 = jest.fn()

  chab.subscribe('topic', callbackMock)
  chab.subscribe('topic', callbackMock2)

  chab.publish('topic', 'passed', true)

  expect(callbackMock.mock.calls.length).toBe(0)
  expect(callbackMock2.mock.calls.length).toBe(1)
  expect(callbackMock2.mock.calls[0][0]).toBe('passed')
})

test('publishing to only one receives only one callback (with late subscribing)', () => {
  const chab = CreateChab()

  chab.publish('topic', 'passed', true)

  const callbackMock = jest.fn()
  const callbackMock2 = jest.fn()

  chab.subscribe('topic', callbackMock)
  chab.subscribe('topic', callbackMock2)

  expect(callbackMock.mock.calls.length).toBe(1)
  expect(callbackMock.mock.calls[0][0]).toBe('passed')
  expect(callbackMock2.mock.calls.length).toBe(0)
})
