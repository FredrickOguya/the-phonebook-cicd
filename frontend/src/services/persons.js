import axios from "axios"
const baseurl = '/api/persons'


const getPersons = () => axios.get(baseurl).then(res => res.data)

const createPerson = newPerson => axios.post(baseurl, newPerson).then(res => res.data)

const deletePerson = id => axios.delete(`${baseurl}/${id}`)


const updatePerson = (id, newPerson) => axios.put(`${baseurl}/${id}`, newPerson).then(res => res.data)

export default { getPersons, createPerson, deletePerson, updatePerson }