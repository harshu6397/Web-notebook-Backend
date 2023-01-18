const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser'); 

const JWT_SECRET = "qwertyuiopasdfghjklzxcvbnm123456";
// const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE 01: Create a User using: POST '/api/auth/createuser' No login Required
router.post('/createuser', [

    // Validate the request body
    body('name').isString().withMessage('Name must be a string').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),

    body('email').isEmail().withMessage('Email must be a valid email address'),

    body('password').isStrongPassword().withMessage('Password must contain at least one number, one uppercase letter, one lowercase letter, one special symbol and must be at least 8 characters long'),

    body('passwordConfirmation'),

], async (req, res) => {

    // Get the validation result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check whether the user with the eamil exist
    // try {
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User with this email already exists' }] })
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const securedPassword = await bcrypt.hash(req.body.password, salt);

        // Create a new User
        if (req.body.password === req.body.cpassword) {
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: securedPassword,
            })
            // Create a JWT token
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);
            res.json({ status: true, authToken });
            // res.send(user);
        }
        else{
            return res.status(400).json({ errors: [{ msg: 'Confirm Password does not match to the  password' }] })
        }
    // }
    // catch (error) {
    //     res.status(500).json({ status: false, errors: [{ error: 'Internal Server Error' }] })
    // }
});

// ROUTE 02: Authenticate a user using: POST '/api/auth/login' No login Required
router.post('/login', [
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').exists().withMessage('Password is required').isStrongPassword().withMessage('Password must contain at least one number, one uppercase letter, one lowercase letter, one special symbol and must be at least 8 characters long'),
], async (req, res) => {

    // Get the validation result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: false, errors: [{ msg: 'Invalid credentials' }] })
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ status: false, errors: [{ msg: 'Invalid credentials' }] })
        }

        // Create a JWT token
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ status: true, authToken });
    }
    catch (error) {
        res.status(500).json({ errors: [{ status: false, error: 'Internal Server Error' }] })
    }
})

// ROUTE 03: Get loggedin user using: POST '/api/auth/getuser' Login Required
router.post('/getuser', fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        res.send(user);
    }
    catch (error) {
        res.status(500).json({ errors: [{ status: false, error: 'Internal Server Error' }] })
    }
})

module.exports = router;