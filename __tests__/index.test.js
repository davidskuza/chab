import { CreateChab } from '../src/index'

test('subscribing to anything returns object with unsubscribe function', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('subtopic', () => {})

  expect(typeof(subObj.unsubscribe)).toBe('function')
})

test('subscribing to test.mytopic adds listener to global listeners object', () => {
  const chab = CreateChab()

  chab.subscribe('test.mytopic', () => {})

  expect(chab.subscribers['test.mytopic'].length).toBe(1)
})

test('subscribing to diffrent topics stores diffrent listeners', () => {
  const chab = CreateChab()

  chab.subscribe('topic', () => {})
  chab.subscribe('topic2', () => {})
  chab.subscribe('topic2', () => {})
  chab.subscribe('topic3', () => {})

  expect(chab.subscribers['topic'].length).toBe(1)
  expect(chab.subscribers['topic2'].length).toBe(2)
  expect(chab.subscribers['topic3'].length).toBe(1)
})

test('publishing to diffrent topics before subscribing stores them correctly as queued', () => {
  const chab = CreateChab()

  chab.publish('topic')
  chab.publish('topic2')
  chab.publish('topic2')
  chab.publish('topic3')

  expect(chab.queued['topic'].length).toBe(1)
  expect(chab.queued['topic2'].length).toBe(2)
  expect(chab.queued['topic3'].length).toBe(1)
})

test('subscribing and unsubscribing removes callback', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('mytopic', () => {})
  expect(chab.subscribers['mytopic'].length).toBe(1)
  subObj.unsubscribe()
  expect(chab.subscribers['mytopic'].length).toBe(0)
})

test('double unsubscribing does not fail', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('mytopic', () => {})
  expect(chab.subscribers['mytopic'].length).toBe(1)
  subObj.unsubscribe()
  subObj.unsubscribe()
  expect(chab.subscribers['mytopic'].length).toBe(0)
})

test('subscribing and unsubscribing removes callback (test with many subscribers)', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topic1', () => {})
  chab.subscribe('topic2', () => {})
  expect(chab.subscribers['topic1'].length).toBe(1)
  expect(chab.subscribers['topic2'].length).toBe(1)
  subObj.unsubscribe()
  expect(chab.subscribers['topic1'].length).toBe(0)
  expect(chab.subscribers['topic2'].length).toBe(1)
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

  expect(chab.queued['topicName'].length).toBe(1)
})

test('publishing to not subscribed topic and then subscribing receives', () => {
  const chab = CreateChab()

  chab.publish('topicName', 'passed')

  const callbackMock = jest.fn()
  chab.subscribe('topicName', callbackMock)

  expect(callbackMock.mock.calls.length).toBe(1)
  expect(callbackMock.mock.calls[0][0]).toBe('passed')
})

test('subscribing, unsubscribing and publishing adds to queued', () => {
  const chab = CreateChab()

  const subObj = chab.subscribe('topicName', () => {})
  subObj.unsubscribe()

  chab.publish('topicName', 'passed')

  expect(chab.queued['topicName'].length).toBe(1)
})

test('subscribing and returning true with subscriber function will unsubscribe',
  () => {
    const chab = CreateChab()
    
    chab.subscribe('topicName', () => true)
    
    chab.publish('topicName', 'passed')
    
    expect(chab.subscribers['topicName'].length).toBe(0)
  })
  
test(`few subscribers subscribing and returning true with `
     + `subscriber function will unsubscribe`,
  () => {
    const chab = CreateChab()
    
    chab.subscribe('topicName', () => false)
    chab.subscribe('topicName', () => true)
    chab.subscribe('topicName', () => {})
    
    chab.publish('topicName', 'passed')
    
    expect(chab.subscribers['topicName'].length).toBe(2)
  })