const Team = require('../models/team.js');

const User = require('../models/user.js');

const  {handleErrors} = require('./error.js');

const ObjectId = require('mongodb').ObjectId; 

const {validationResult} = require('express-validator')

exports.addTeam = (req,res,next) =>{
    handleErrors(req,402);
    const {teamName,_id,user} = req.body;
    if(user){
            const team = new Team(
            {admin: new ObjectId(_id),
            users:[new ObjectId(_id)],
             name:teamName});
         team.save()
        .then(result => {
            if(result){
                res.json({team: result._doc,message: "team is added"}).status(201);
            }
            else{
                res.status(500).json({message: "error"})
            }
        }).catch(error => {
            res.status(500).json({message: "error"})
        });
    }
    else{
        res.status(500).json({message: "error"});
    }
    
}