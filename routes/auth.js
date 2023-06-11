const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');

//@route        GET api/auth
//@desc         Get logged in user
//@access       Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});



//@route        POST api/auth
//@desc         Auth user & get token
//@access       Public
router.post(
    '/',
    body('email').isEmail().withMessage('Please your email'),
    body('password').exists().withMessage('Password is required'),
    
    async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            // if there no user with the same email
            if(!user){
                return res.status(400).json({ msg: 'Invalid Credentials'});
            }

            // if there a user
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            const payload = {
                user:{
                    id: user.id
                },
            };
    
            jwt.sign(payload, config.get('jwtSecret'),{
                expiresIn: 360000
            }, (err,token) => {
                if(err) throw err;
                res.json({ token });
            })
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
        


});


module.exports = router;