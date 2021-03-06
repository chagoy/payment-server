'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('../models/user');
const router = express.Router();
const jsonParser = bodyParser.json();
const crypto = require('crypto');
const moment = require('moment');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get('/:id', jsonParser, (req, res, next) => {
	const { id } = req.params;
	return User.findOne({_id: id}).then(user => res.json(user))
})

router.post('/', jsonParser, (req, res, next) => {
	console.log(req.body);
	const requiredFields = ['username', 'password', 'email', 'firstName', 'lastName'];
	const missingField = requiredFields.find(field => !(field in req.body));
	const shouldbeAdmin = req.body.username === process.env.ADMIN ? true : false;

	if (missingField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Missing field',
			location: missingField
		});
	}

	const stringFields = ['username', 'password', 'email', 'firstName', 'lastName'];
	const nonStringField = stringFields.find(
		field => field in req.body && typeof req.body[field] !== 'string'
		);

	if (nonStringField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Incorrect field type: expected string',
			location: nonStringField
		});
	}

	const explicitlyTrimmedFields = ['username', 'password', 'email'];
	const nonTrimmedField = explicitlyTrimmedFields.find(
		field => req.body[field].trim() !== req.body[field]
	);

	if (nonTrimmedField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Cannot start or end with a whitespace',
			location: nonTrimmedField
		})
	}

	const sizedFields = {
		username: {min: 4},
		password: {min: 6, max: 16}
	};

	const tooSmallField = Object.keys(sizedFields).find(
		field => 'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
	);

	const tooLargeField = Object.keys(sizedFields).find(
		field => 'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
	)

	if (tooSmallField || tooLargeField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: tooSmallField ? `Must be at least ${sizedFields[tooSmallField].min} characters long` : `Must be at most ${sizedFields[tooLargeField].max} characters long`, 
			location: tooSmallField || tooLargeField
		});
	}

	let {username, password, email, firstName = '', lastName = '', phone, texting, address, city, zipcode } = req.body;
	firstName = firstName.trim();
	lastName = lastName.trim();

	const secret = moment().toISOString();
	const verificationCode = crypto.createHmac('sha256', secret)
										.update('lebron')
										.digest('hex');

	return User.find({username})
		.count()
		.then(count => {
			if (count > 0) {
				return Promise.reject({
					code: 422, 
					reason: 'ValidationError',
					message: 'Username already taken',
					location: 'username'
				});
			}
			return User.hashPassword(password);
		})
		.then(hash => {
			return User.create({
				username,
				password: hash,
				email,
				firstName,
				lastName,
				phone, 
				texting: texting === 'Yes' ? true : false,
				address,
				city,
				zipcode,
				hash: verificationCode,
				admin: shouldbeAdmin
			});
		})
		.then(user => {
			const msg = {
			  to: user.email,
			  from: 'admin@mpkbaseball.com',
			  //bcc: ['admin@mpkbaseball.com', 'gprez@mpkbaseball.com', 'mpkbaseball15@gmail.com'],
			  bcc: ['angelochagoy@gmail.com'],
			  subject: 'Thank you for registering!',
			  text: 'and easy to do anywhere, even with Node.js',
			  html: `<h3>Welcome to the MPK Family</h3>
			  <p>We look forward to your participation with MPK Baseball & Softball. But first, we need you to <a href="https://localhost:5000/verification/${user.verificationCode}">verify your account</a>. Click the link and you'll be on your way to playing in the 2019 Season</p>
			  <p>-MPK Board</p>
			  <p>404-374-5014</p>`,
			};
			sgMail.send(msg);
			return res.status(201).json(user.serialize());
		})
		.catch(err => {
			console.log(err);
			if (err.reason === 'ValidationError') {
				return res.status(err.code).json(err);
			}
			res.status(500).json({code: 500, message: 'Internal server error'});
		});
});

router.get('/verification/:hash', (req, res, next) => {
	const { hash } = req.params
	console.log(hash)
	return User.findOneAndUpdate(
	{
		hash
	}, 
	{ 
		$set: { verified: true }
	},
	{
		new: true
	})
	.then(user => res.json(user))
	.catch(err => console.error(err))
})


module.exports = {router};