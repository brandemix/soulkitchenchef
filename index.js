'use strict'

const token = "EAAWp5H9SoDYBAF5Fwv9e9DnHSUBqdXACltD4ZB5Egh1iqd1LZCso37hcHDjnz1S0RQX5XQo28aTV4rTnBjZBUWRQlxcNlCdd1WKZB2Ni7qFMEcNwjtaLrMzFqqyY38UgGzQad59X4c7zKotifDaHo9G7IOUYDUw9oYRJpQMD6QZDZD";
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('hi world');
});

app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'RDdKcTwYCIt9z+SLp47I7rcC52X6RKXCbCnIOfpCBvdtw45HuZ1+wTgDDymhzMRt3Xp68oUnulVKGOpEdhi0+A==') {
		res.send(req.query['hub.challenge']);
	}
	else {
		res.send('Error, wrong token');
	}
});

app.post('/webhook/', function (req, res) {
	var data = req.body;

	if (data.object === 'page') {

		data.entry.forEach(function(entry) {
			var pageID = entry.id;
			var timeOfEvent = entry.time;

			entry.messaging.forEach(function(event) {
				if (event.message) {
					receivedMessage(event);
				} else if (event.postback) {
					recievedPostback(event);
				} else {
					console.log("Webhook received unknown event: ", event);
				}
			});
		});


		res.sendStatus(200);
	}
});

function receivedMessage(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("Received message for user %d and page %d at %d with message: ",
		senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));

	var messageId = message.mid;

	var messageText = message.text;
	var messageAttachments = message.attachments;

	if (messageText) {

		// If we receive a text message, check to see if it matches a keyword
		// and send back the example. Otherwise, just echo the text we received.
		switch (messageText) {
			case 'generic':
				sendGenericMessage(senderID);
				break;

			default:
				sendTextMessage(senderID, messageText);
		}
	} else if (messageAttachments) {
		sendTextMessage(senderID, "Message with attachments received");
	}
}

function sendGenericMessage(recipientId, messageText) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "template",
				payload: {
					template_type: "generic",
					elements: [{
						title: "rift",
						subtitle: "Next-generation virtual reality",
						item_url: "https://www.oculus.com/en-us/rift/",
						image_url: "http://messengerdemo.parseapp.com/img/rift.png",
						buttons: [{
							type: "web_url",
							url: "https://www.oculus.com/en-us/rift/",
							title: "Open Web URL"
						}, {
							type: "postback",
							title: "Call Postback",
							payload: "Payload for the first bubble"
						}]
					}, {
						title: "touch",
						subtitle: "Your Hands, Now in VR",
						item_url: "https://www.oculus.com/en-us/touch/",
						image_url: "http://messengerdemo.parseapp.com/img/touch.png",
						buttons: [{
							type: "web_url",
							url: "https://www.oculus.com/en-us/touch/",
							title: "Open Web URL"
						}, {
							type: "postback",
							title: "Call Postback",
							payload: "Payload for second bubble"
						}]
					}]
				}
			}
		}
	};

	callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};

	callSendAPI(messageData);
}

function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: token },
		method: 'POST',
		json: messageData
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;

			console.log("Successfully sent generic message with id %s to recipient %s",
				messageId, recipientId);
		} else {
			console.error("Unable to send message.");
			console.error(response);
			console.error(error);
		}
	});
}

function recievedPostback(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfPostback = event.timestamp;

	// The 'payload' param is a developer-defined field which is set in a postback
	// button for Structured Messages.
	var payload = event.postback.payload;

	console.log("Recieved postback for user %d and page %d with payload '%s' at %d", 
		senderID, recipientID, payload, timeOfPostback);
	sendTextMessage(senderID, "Postback called");
}

app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});
