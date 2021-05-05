const User = require('../model/User')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcrypt')
const saltRounds = 10
const randomString = require('randomstring')
const { check, validationResult } = require('express-validator')

const dirPath = require('../../util/path')

exports.signUp = async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(422).json({
				error: errors.array()[0].msg,
			})
		}
		const obj = req.query
		const { emailId } = req.query

		let checkUser = await User.find({ emailId: emailId })

		//  console.log("checkUser length",Object.keys(checkUser).length);

		console.log(checkUser)

		if (checkUser.length > 0) {
			return res.status(409).send({
				status: 'FAILURE',
				message: 'user already exist',
			})
		}

		var storage = multer.diskStorage({
			destination: './public/images/profileImages',
			filename: function (req, file, callback) {
				callback(
					null,
					'PI_' + randomString.generate(10) + path.extname(file.originalname)
				)
			},
		})
		var upload = multer({
			storage: storage,
			fileFilter: async function (req, file, callback) {
				var ext = path.extname(file.originalname)
				if (
					(ext !== '.png' &&
						ext !== '.jpg' &&
						ext !== '.gif' &&
						ext !== '.jpeg' &&
						req.files != 'undefined') ||
					req.files != null
				) {
					return callback(new Error('Only images are allowed'))
				}
				callback(null, true)
			},
		}).single('profileImg')

		//----------------- Multer Config end ------------------//

		upload(req, res, async function (err) {
			if (err) {
				console.log(err)
				return res.end('Error uploading file.')
			} else {
				if (!(typeof req.file == 'undefined' || req.file == null)) {
					console.log('hh2')
					// var imagePath = "/users/userProfilePicture/placeHolder.png"
					// console.log(imagePath)
					const imagePath = '/public/images/profileImages/' + req.file.filename
					console.log(imagePath, req.host)

					obj.profilePicUrl = imagePath

					bcrypt.hash(obj.password, saltRounds, (err, hash) => {
						if (err) {
							return res.status(500).send({
								status: 'Failure',
								message: 'Something went wrong',
								err: err,
							})
						}
						obj.password = hash

						User.create(obj)
							.then(async (result) => {
								return res.status(200).send({
									status: 'Sucess',
									message: 'User Created Sucessfully',
								})
							})
							.catch((e) => {
								console.log(e)
								return res.status(400).json({
									message: e,
								})
							})
					})
				} else {
					return res.status(404).send({
						message: 'image not added',
					})
				}
			}
		})
	} catch (error) {}
}

exports.logout = async (req, res) => {
	req.session.destroy(function (err) {
		return res.status(200).send({
			status: 'SUCCESS',
			message: 'User Log Out Successdully',
		})
	})
}

exports.login = async (req, res) => {
	try {
		const errors = validationResult(req)

		const extractedErrors = []

		errors
			.array({ onlyFirstError: true })
			.map((err) => extractedErrors.push({ [err.param]: err.msg }))

		if (!errors.isEmpty()) {
			return res.status(422).json({
				status: 'FAILURE',
				message: extractedErrors,
			})
		}

		const { emailId, password } = req.body

		const userList = await User.findOne({
			emailId: emailId,
			userType: 'user',
		}).lean()

		if (!userList) {
			return res.status(404).send({
				status: 'Failure',
				message: 'User Not Found',
			})
		}

		bcrypt.compare(password, userList.password, function (err, result) {
			if (result) {
				const {
					isActive,
					phoneNumber,
					password,
					createdAt,
					updatedAt,
					__v,
					...newResponse
				} = userList

				// console.log(d)

				req.session.isLoggedIn = true
				return res.status(200).send({
					status: 'Success',
					message: 'User Sucessfully Login',
					data: newResponse,
				})
			}
			return res.status(400).send({
				status: 'Failure',
				message: 'EmailId or Password is wrong',
			})
		})
	} catch (err) {
		return res.status(500).send({
			status: 'Failure',
			message: 'Internal Server Error',
			err: err,
		})
	}
}

exports.getProfile = async (req, res) => {
	try {
		const errors = validationResult(req)

		const extractedErrors = []

		errors
			.array({ onlyFirstError: true })
			.map((err) => extractedErrors.push({ [err.param]: err.msg }))

		if (!errors.isEmpty()) {
			return res.status(422).json({
				status: 'FAILURE',
				message: extractedErrors,
			})
		}

		const { id } = req.query

		const userList = await User.findById(id)

		return res.status(200).send({
			status: 'Success',
			message: 'User Sucessfully Login',
			data: userList,
		})
	} catch (err) {
		return res.status(500).send({
			status: 'Failure',
			message: 'Internal Server Error',
			err: err,
		})
	}
}

exports.updateProfile = async (req, res) => {
	try {
		console.log('======ddd', req.query)

		const { id } = req.query
		const query = req.query

		var data = await User.findById(id)

		console.log('======', data)

		var storage = multer.diskStorage({
			destination: './public/images/profileImages',
			filename: function (req, file, callback) {
				callback(
					null,
					'PI_' + randomString.generate(10) + path.extname(file.originalname)
				)
			},
		})
		var upload = multer({
			storage: storage,
			fileFilter: async function (req, file, callback) {
				var ext = path.extname(file.originalname)
				if (
					(ext !== '.png' &&
						ext !== '.jpg' &&
						ext !== '.jpeg' &&
						req.files != 'undefined') ||
					req.files != null
				) {
					return callback(new Error('Only images are allowed'))
				}
				callback(null, true)
			},
		}).single('profileImg')

		upload(req, res, async function (err) {
			if (err) {
				console.log(err)
				return res.end('Error uploading file.')
			} else {
				if (!(typeof req.file == 'undefined' || req.file == null)) {
					console.log('hh2')
					// var imagePath = "/users/userProfilePicture/placeHolder.png"
					// console.log(imagePath)
					const imagePath = '/public/images/profileImages/' + req.file.filename
					console.log(imagePath, req.host)

					query.profilePicUrl = imagePath

					User.findByIdAndUpdate(id, query, async (err, docs) => {
						if (err) {
							return res.status(500).json({
								message: 'something went wrong',
							})
						} else {
							fs.unlink(dirPath + data.profilePicUrl, async function (err) {
								if (err) {
									console.error(err)
								} else {
									const list = await User.findById(id)
									console.log(list)

									return res.status(200).send({
										status: 'Success',
										message: 'User Sucessfully Login',
										data: list,
									})
								}
							})
						}
					})
				} else {
					User.findByIdAndUpdate(id, query, async (err, docs) => {
						if (err) {
							return res.status(500).json({
								message: 'something went wrong',
							})
						} else {
							const list = await User.findById(id)
							console.log(list)

							return res.status(200).send({
								status: 'Success',
								message: 'User Update Successfully',
								data: list,
							})
						}
					})
				}
			}
		})
	} catch (error) {
		console.log(error)
		return res.status(500).send({
			status: 'FAILURE',
			message: error,
		})
	}
}
