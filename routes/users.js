const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');

//@route        POST api/users
//@desc         Register a user
//@access       Public
router.post(
    '/',
    // Check Validation
    body('name').not().isEmpty().withMessage('Please add a name'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({min: 6}).withMessage('Please enter a password with 6 or more characters'), 
    
    async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    
    const { name, password, email } = req.body;

    
    try {
        // Check if user already exist
        let user = await User.findOne({ email });

        if(user){
            return res.status(400).json({msg: 'User Already exists'})
        }
        // Create an instance of new user
        user = new User({
            name,
            email,
            password
        });

        // Encrypt user password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        // Save user in Database
        await user.save();

        const payload = {
            user:{
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'),{
            expiresIn: 360000
        }, (err, token) => {
            if(err) throw err;
            res.json({ token });
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;