/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })

intents.matches('CreateExpense',
    [function (session, args, next) {

        var expensetype = builder.EntityRecognizer.findEntity(args.entities, 'ExpenseType');
        session.dialogData.entity = expensetype;

        if (!expensetype)
            builder.Prompts.text(session, "What do you want the expense for?");
    },

        function (session, results) {
            //if (results.response) {
            //        var expensetype = builder.EntityRecognizer.findEntity([results.response].entities, 'ExpenseType');
            //        session.dialogData.entity = expensetype;
            //}

            builder.Prompts.text(session, "What name do you want to give the expense report? for type %", session.dialogData.entity.entity);
        },

        function (session, results) {
            if (results.response)
                var expensename = results.response;

            session.endDialog("I will create expense report \"%s\" for your %s", expensename, session.dialogData.entity.entity);
        }]);

intents.onDefault((session) => {
    session.send("I'm too dumb to process %s.", session.message.text);
});

bot.dialog('/', intents);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpoint at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}

function CreateExpense() {
}

