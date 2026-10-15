
const mongoose = require('mongoose')

if(process.argv.length<3){
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://onyangofredrickoguya:${password}@cluster0.hxovx14.mongodb.net/phonebook?appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url, { family: 4 })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    required: true,
    minLength: 8,
    validate: {
      validator: function (value) {
        const v = String(value)
        if (!v.includes('-')) return false

        const parts = v.split('-')
        if (parts.length !== 2) return false

        const [first, second] = parts

        if (!/^\d{2,3}$/.test(first)) return false
        if (!/^\d+$/.test(second)) return false

        return true
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
})

const Person = mongoose.model('person', personSchema)

if(process.argv.length === 3){
  Person.find({}).then(result => {
    console.log('phonebook: ')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number
  })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
  })
}

