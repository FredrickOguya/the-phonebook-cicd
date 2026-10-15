
const { after, before, test, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const mongoose = require('mongoose')
const supertest = require('supertest')

process.env.NODE_ENV = 'test'
require('dotenv').config()

const app = require('../app')
const Person = require('../models/person')

const api = supertest(app)

before(async () => {
  const url = process.env.TEST_MONGODB_URL

  if (!url) {
    throw new Error('TEST_MONGODB_URL is not configured')
  }

  await mongoose.connect(url, { family: 4 })

})

beforeEach(async () => {
  await Person.deleteMany({})

  await Person.create([
    { name: 'Test User One', number: '123-456789' },
    { name: 'Test User Two', number: '456-123456' },
  ])
})

after(async () => {
  await Person.deleteMany({})
  await mongoose.connection.close()
})

test('persons are returned as JSON', async () => {
  const response = await api
    .get('/api/persons')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.equal(response.body.length, 2)

  const names = response.body.map(person => person.name)

  assert.ok(names.includes('Test User One'))
  assert.ok(names.includes('Test User Two'))
})

test('a specific person can be retrieved', async () => {
  const person = await Person.findOne({ name: 'Test User One' })

  const response = await api
    .get(`/api/persons/${person.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.equal(response.body.name, 'Test User One')
  assert.equal(response.body.number, '123-456789')
})

test('a person can be created', async () => {
  const newPerson = {
    name: 'Test User Three',
    number: '789-123456',
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/persons')

  assert.equal(response.body.length, 3)

  const names = response.body.map(person => person.name)
  assert.ok(names.includes('Test User Three'))
})

test('a person with no name is rejected', async () => {
  const newPerson = {
    number: '123-123456',
  }

  await api
    .post('/api/persons')
    .send(newPerson)
    .expect(400)

  const response = await api.get('/api/persons')
  assert.equal(response.body.length, 2)
})

test('a nonexistent person returns 404', async () => {
  await api
    .get('/api/persons/000000000000000000000000')
    .expect(404)
})
