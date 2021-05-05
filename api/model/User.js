const mongoose = require('mongoose')

const Schemea = mongoose.Schema

const UserSchema = new Schemea(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			required: true,
		},
		phoneNumber: {
			type: Number,
			required: true,
		},
		emailId: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		userType: {
			type: String,
			default: 'user',
			enum: ['admin', 'user'],
		},
		password: {
			type: String,
			required: true,
		},
		profilePicUrl: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model('user', UserSchema)
