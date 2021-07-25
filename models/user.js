const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('mongoose-validator')

const userSchema = new Schema({
    email:{
        type:String,
        required: true,
        unique: true,
        validate: [
            validator({
              validator: 'isEmail',
              message: 'please enter valid email'
            })
          ],
    },
    password:{
        type:String,
        required: true,
    },

    fullName: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum : ['user','admin'],
        default: 'user',
        required: true
    },
    role: {
        type: String,
    },
    description : {
        type: String,
    },
    teams : {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Team',
        }],
        default: []
    }
    
})

module.exports = mongoose.model('User',userSchema)