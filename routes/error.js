const express = require('express');

const router = express.Router();


router.use((error,req,res,next)=>{
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data
    res.status(status).json({message:message,data: data});
})