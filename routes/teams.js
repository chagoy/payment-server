'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {Team} = require('../models/team');
const {Player} = require('../models/player');
const {Season} = require('../models/season');

const router = express.Router();
const jsonParser = bodyParser.json();

const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', {session: false, failWithError: true});

router.get('/', jwtAuth, jsonParser, (req, res, next) => {
	return Team.find({})
		.then((data) => {
			return res.status(201).json(data);
		})
		.catch(err => console.error(err));
})

router.post('/', jwtAuth, jsonParser, (req, res, next) => {
	console.log(req.body);
	const requiredFields = ['name', 'division'];
	const missingField = requiredFields.find(field => !(field in req.body));

	if (missingField) {
		return res.status(422).json({
			code: 422, 
			reason: 'ValidationError', 
			message: 'Missing field',
			location: missingField
		})
	}

	const stringFields = ['name', 'division'];
	const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string'
		);

	if (nonStringField) {
		return res.status(422).json({
			code: 422, 
			reason: 'ValidationError',
			message: 'Incorrect field type: expected string', 
			location: nonStringField
		});
	}

	let {name, division} = req.body;
	let team = '';
	name = name.trim();
	return Team.find({name, division})
			.count()
			.then(count => {
				if (count > 0) {
					return Promise.reject({
						code: 422, 
						reason: 'ValidationError',
						message: 'Team already exists',
						location: 'name'
					});
				}
			})
			.then(() => {
				return Team.create({
					name, division, season: '5ba2bd394a76af4ad3ee4c3a'
				})
			})
			.then(_team => {
				team = _team;
				console.log(team)
				return Season.findByIdAndUpdate({_id: '5ba2bd394a76af4ad3ee4c3a'}, {$push: { teams: team._id }});
			})
			.then(() => {
				return res.status(201).json(team);
			})
			.catch(err => {
				if (err.reason === 'ValidationError') {
					return res.status(err.code).json(err);
				}
				res.status(500).json({code: 500, message: 'inteneral server error'});
			})
})

router.get('/:team', jsonParser, (req, res, next) => {
	const {team} = req.params;
	
	return Team.findOne({name: team}).populate('players')
			.then(data => {
				if (data) {
					res.status(201).json(data);
				} else {
					throw new Error('team is not found')
				}
			})
			.catch(err => console.error(err.message))
})

module.exports = {router};