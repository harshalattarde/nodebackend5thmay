const express = require('express')

const router = express.Router()
const { check, validationResult } = require('express-validator')
const {
	signUp,
	login,
	getProfile,
	updateProfile,
	logout,
} = require('../controller/userController')

const isLoggedIn = (req, res, next) => {
	console.log(req.session.isLoggedIn)

	if (req.session.isLoggedIn === true) {
		next()
	} else {
		res.send('User Not Logged In')
	}
}

router.post(
	'/signup',
	[
		check('firstName', 'firstName is required').notEmpty(),
		check('lastName', 'lastName is required').notEmpty(),
		check('phoneNumber', 'phoneNumber is required').isLength({
			min: 10,
			max: 10,
		}),
		check('age', 'age is required').notEmpty(),
		check('emailId', 'emailId is required').notEmpty(),
		check('address', 'address is required').notEmpty(),
		check('password', 'password is required').notEmpty(),
	],
	signUp
)

router.post(
	'/login',
	[
		check('emailId', 'emailId is required').notEmpty(),
		check('password', 'password is required').notEmpty(),
	],
	login
)

router.get(
	'/getProfile',
	[check('id', 'id is required').notEmpty()],
	isLoggedIn,
	getProfile
)

router.post(
	'/updateProfile',
	check('firstName', 'firstName is required').notEmpty(),
	check('lastName', 'lastName is required').notEmpty(),
	check('phoneNumber', 'phoneNumber is required').isLength({
		min: 10,
		max: 10,
	}),
	check('age', 'age is required').notEmpty(),
	check('emailId', 'emailId is required').notEmpty(),
	check('address', 'address is required').notEmpty(),
	isLoggedIn,
	updateProfile
)

router.post('/logout', isLoggedIn, logout)

module.exports = router
