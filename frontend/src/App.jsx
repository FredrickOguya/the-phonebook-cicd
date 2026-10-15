import { useEffect, useState } from 'react';
import './index.css'
import PersonService from './services/persons';
import Notification from './Components/Notification';


    const Filter = ({searchedName,handleSearch}) => {
      return(
        <p>filter shown with <input 
                              type="text"
                              value={searchedName}
                              onChange={handleSearch} 
                              /></p>
      )
    }
    const PersonForm = ({setNewName,setNewNumber,addNewNumber, newName, newNumber}) => {
      return (
        <form onSubmit={addNewNumber}>
        <div>
          name: <input
                 type='text'
                 value={newName}
                 onChange={(e)=> setNewName(e.target.value)} 
                /><br/>
          number: <input
                 type='phone'
                 value={newNumber}
                 onChange={(e)=> setNewNumber(e.target.value)}
                />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      )
    }

    const Persons = ({filteredSearch,handleDelete}) => {
      return (
        <div>
        { filteredSearch.map(persons=> 
          <p key={persons.id}>{persons.name} {persons.number}
          <button onClick={()=>handleDelete(persons.id)}>Delete</button></p>
        )}
      </div>
      )
    }


const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchedName, setSearchedName] = useState('');
  const [notification, setNotification] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(()=> {
    PersonService
    .getPersons()
    .then(response => {
      setPersons(response)
    })
  }, [])


  const addNewNumber = (event) => {
    event.preventDefault();
    const numberObject = {
      name: newName,
      number: newNumber
    }
    
    const alreadyExists = persons.some(person => person.name ===newName)
    
    if(alreadyExists) {
      const updatingPerson = persons.find(person =>person.name === newName)
      if(window.confirm(`Do you want to update contact for ${updatingPerson.name}?`)){
        PersonService
        .updatePerson(updatingPerson.id,{...updatingPerson,number: newNumber})
        .then(response => {
          setPersons(persons.map(person => person.id === updatingPerson.id ? response : person))
          setNotification(`${updatingPerson.name} updated successfully`)
          setNewName('');
          setNewNumber('');
        })
        .catch(() => {
          setErr(true);
          setNotification(`Information of ${updatingPerson.name} has already been removed from the server`)
        })
      }
      
      
    }else{

      PersonService
      .createPerson(numberObject)
      .then(response => {
        setPersons(persons.concat(response));
        setNewNumber('');
        setNewName('');
        setErr(false)
        setNotification(`Added ${newName}`)
      })
      .catch(error => {
        setErr(true)
        setNotification(error.response.data.error)
      })
            
    }
    setTimeout(()=> {
        setErr(null)
        setNotification(null);
      },5000)

    
    
  }
  const handleSearch = (event) => {
    event.preventDefault()
    setSearchedName(event.target.value)
  }

  const handleDelete = (id) => {
    const person = persons.find(p=> p.id === id);
    if(window.confirm(`Delete ${person.name}?`)){
      PersonService
      .deletePerson(id)
      .then(()=> setPersons(persons.filter(p => p.id !== id)))
    }
    
  }
  
  const filteredSearch = (persons || []).filter(person => person.name.toLowerCase().includes(searchedName.toLowerCase()))
  
  

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} err={err} />
      <Filter searchedName={searchedName} handleSearch={handleSearch}/>

      <h2>add a new</h2>
      
      <PersonForm 
        addNewNumber={addNewNumber}
        newName={newName}
        setNewName={setNewName}
        setNewNumber={setNewNumber}
        newNumber={newNumber}
      />

      <h2>Numbers</h2>
      
      <Persons handleDelete={handleDelete}
        filteredSearch={filteredSearch}
      />

    </div>
  )
}

export default App

