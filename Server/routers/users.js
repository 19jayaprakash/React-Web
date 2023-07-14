// register the user

const express = require('express');
const router = express.Router();
const {check , validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwtSecret = require("../config/data.config");

// jwt Token
const jwtToken = require("jsonwebtoken");

// @Route : /users/register
// @Method : post
// @access : public

router.post(
    "/register",
    check("name","name must be provided").notEmpty(),
    check("email","email must be provided").isEmail(),
    check("password","password min 6 characters").isLength({min:6}),
     async(req,res) =>{
        console.log(jwtSecret);
        const error = validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).json({msg:error.array()});
        }

        const {name, password , email} = req.body;

        // existing email id
        try {
            let user = await User.findOne({email});
            if(user){
                return res.status(400).json({msg:"email already exists"});
            }
            const salt = await bcrypt.genSalt(10);
            const newPassword = await bcrypt.hash(password,salt);
            let user1 = new User({
                name,
                email,
                password: newPassword,
            });
        
            await user1.save(); 

            const payload = { user:{id :user1.id}};
            jwtToken.sign(payload,jwtSecret,{expiresIn:"5 days"},(err,token)=>{
                if(err) throw err;
                else 
                    res.json(token);
            })

            // payload , jwtSecret , expiration , handler

            console.log(JSON.stringify(req.body));
            // return res.status(201).json({ result :"user Created Successfully"});
        }
        catch(err){
            return res.status(400).json({msg:err});
        }

        
});

// Route : /users
// @Method : get
// @access : public

router.get("", (req,res) =>{
    res.status(200).json({ msg :"Message from user"});
});

// Route : /users/:id
module.exports = router;