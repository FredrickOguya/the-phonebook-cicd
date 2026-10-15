require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(morgan('tiny'))
app.use(express.json())
app.use(morgan(':method : url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body): ''
})

const errorHandler = (error, reqest, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.get('/api/persons',(request,response,next) => {
  Person.find({}).then(people => {
    response.json(people)
  })
    .catch(error => next(error))
})

app.get('/api/persons/:id',(request,response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person){
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/info',(request,response) => {
  Person.countDocuments({}).then(count => {
    const currentTime = new Date()
    response.send(`<p>Phoneboook has info for ${count} people</p><br/> ${currentTime}`)
  })
})

app.delete('/api/persons/:id',(request,response, next) => {
  const id = request.params.id

  if (id === 'undefined'){
    return response.status(400).send({ error: 'id is not defined' })
  }
  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons',(request,response,next) => {
  const body = request.body
  if(!body.name || !body.number){
    return response.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

app.put('/api/persons/:id',(request, response,next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if(!person){
        return response.status(404).json({ error: 'Person not found' })
      }

      person.name = name
      person.number = number

      return person.save()
    })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(errorHandler)

module.exports = app