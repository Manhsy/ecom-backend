const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

require('dotenv/config');

//get all users
router.get('/', async(req, res)=>{
    try{
        const users = await User.find();

        return res.status(200).send(users);
    }catch(err){
        return res.status(400).send({success: false, message: err.message});
    }
})

//get count of number of user
router.get('/get/count', async(req, res)=>{
    try{
        const userCount = await User.countDocuments(count=>count)
        return res.status(200).send({userCount:userCount })
    }catch(err){
        return res.status(400).send({success: false, message: err.message});
    }
});

//delete user
router.delete('/:id', async(req, res)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user) res.status(400).send({success: false, message: 'user does not exist'});
        return res.status(200).send({success: true, message: 'user is deleted'})
    }catch(err){
        return res.status(400).send({success: false, message: err.message});
    }
});
//get 1 user excluding password
router.get('/:id', async(req, res)=>{
    try{
        const user = await User.findById(req.params.id).select('-passwordHashed');
        if(!user) res.status(400).send({success: false, message: 'User does not exist'});
        return res.status(200).send(user);
    }catch(err){
        return res.status(400).send({success: false, message: err.message});
    }
})

//register user 
router.post('/register', async(req, res)=>{
    try{
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHashed: bcrypt.hashSync(req.body.password, 5),
            street: req.body.street,
            apartment: req.body.apartment,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
        });
        user = await user.save();
        if(!user) return res.status(400).send({success: false, message: "new account cannot be registered"});
        return res.status(200).send(user);
    }catch(err){
        return res.status(400).send({success: false, message: err.message});
    }
});

//sign in, return JWT 
router.post('/login', async(req, res)=>{
    const jwtSecret = process.env.jwtSecret;
    try{
        const user = await User.findOne({email: req.body.email});
        if(!user) return res.status(400).send({success: false, message: "user not found"});

        if(user && await user.comparePassword(req.body.password)){
            const token = jwt.sign(
                {
                    userId: user._id,
                    isAdmin: user.isAdmin, //user can only login if they are an admin
                },
                jwtSecret, 
                {
                    expiresIn: '1w' //when the token is going to be expired
                }
            );
            return res.status(200).send({user: user.email, token: token})
        }else{
            return res.status(400).send({success: false, message: "incorrect password"});
        }

    }catch(err){
        return res.status(400).send({success: false,message: err});
    }
});

//sign out

module.exports = router;