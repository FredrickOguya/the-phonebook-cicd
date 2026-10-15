const mongoose= require('mongoose')
mongoose.set('strictQuery',false)


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
      validator: function(v) {
        if (typeof v !== 'string') return false

        const parts = v.split('-')

        if (parts.length !== 2) return false

        const [firstPart, secondPart] = parts

        if (!/^\d{2,3}$/.test(firstPart)) return false

        if (!/^\d+$/.test(secondPart)) return false

        if (secondPart.length === 0) return false

        return true
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person',personSchema)