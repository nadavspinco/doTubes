const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const MONGODB_URL = 'mongodb://localhost:27017/doTubes';
const cors =  require('cors');

const app = express();

app.use(cors()); // enable all cors request

app.use(express.json()) // parse incoming requests to JSON

mongoose.connect(MONGODB_URL,
    { useNewUrlParser: true,
    useUnifiedTopology:true 
})
.then(result =>{
    console.log("server is running");
    app.listen(8080);
})
.catch(error => console.log(error));