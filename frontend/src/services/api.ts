import axios from 'axios';

//base API setup

const api = axios.create({
    baseURL:'http://localhost:5000/api', // point to flask backend
    headers: {
        'Content-Type' : 'application/json',
    },
});
export default api;

//Allows easier access to to GET assets, POST new records, PUT to update, DELETE records
