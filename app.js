const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const MONGODB_URL = 'mongodb://localhost:27017/doTubes';
const authRouter = require('./routes/auth')
const cors =  require('cors');

const app = express();

app.use(cors()); // enable all cors request

app.use(express.json()) // parse incoming requests to JSON

app.use('/auth',authRouter);

app.use((error,req,res,next)=>{
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data
    res.status(status).json({message:message,data: data});
})

mongoose.connect(MONGODB_URL,
    { useNewUrlParser: true,
    useUnifiedTopology:true 
})
.then(result =>{
    console.log("server is running");
    app.listen(8080);
})
.catch(error => console.log(error));