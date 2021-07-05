const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String, 
        required: true,
        unique: true
    },
    passwordHashed:{
        type: String, 
        required: true,
    },
    street: {
        type: String, 
        required: true,
        default: ''
    },
    apartment: {
        type: String, 
        default: ''
    },
    city: {
        type: String, 
        
    },
    zip: {
        type: String, 
        default: ''
    },
    country: {
        type: String, 
        default: ''
    },
    phone: {
        type: String, 
        required: true
    },
    isAdmin: {
        type: Boolean, 
        default: false,
    },
})

userSchema.methods.comparePassword = function(candidatePassword){

    //get the current user 
    const user = this;
    console.log(user)
    return new Promise ((resolve, reject)=>{
        //compare the incoming password with the hashed password
        bcrypt.compare(candidatePassword, user.passwordHashed,  (err, isMatch)=>{

            //if there was error, return rejection to promise
            if(err){
                console.log(err)
                return reject(err);
            } 

            //if hashed and password does not match, return reject to promise
            if(!isMatch){
                console.log(isMatch)
                return reject(false);
            } 

            //if everything is ok, send promise resolve
            resolve(true);
        });
    });
}

//transforms _Id set by mongoose to a more readable form for frontend
userSchema.virtual('id').get(function(){
    return this._id.toHexString();
})
//use the virtual that was set up
userSchema.set('toJSON', {
    virtuals: true
})

module.exports.User = mongoose.model('User', userSchema);
