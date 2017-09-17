'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json())

app.get('/', function (req, res) {
	res.send('hi world')
})

app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'RDdKcTwYCIt9z+SLp47I7rcC52X6RKXCbCnIOfpCBvdtw45HuZ1+wTgDDymhzMRt3Xp68oUnulVKGOpEdhi0+A==') {
		res.send(req.query['hub.challenge'])
	}
	else {
		res.send('Error, wrong token')
	}
})

app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})