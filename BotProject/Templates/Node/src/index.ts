// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder';
import { DialogManager } from 'botbuilder-dialogs';
import { AdaptiveDialog, AdaptiveDialogComponentRegistration, LanguageGeneratorMiddleWare } from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { parse } from 'url';
import * as minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
console.log(argv);
const port = parse(argv.urls).port;
console.log(port);


// Create HTTP server.
const server = restify.createServer();
server.listen(port || 4554, (): void => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
});

// Create resource explorer.
const resourcesFolder = './resources';
const resourceExplorer = new ResourceExplorer().addFolder(resourcesFolder, true, false);
resourceExplorer.addComponent(new AdaptiveDialogComponentRegistration(resourceExplorer));

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
});
adapter.use(new LanguageGeneratorMiddleWare(resourceExplorer));

const bot = new DialogManager();
bot.conversationState = new ConversationState(new MemoryStorage());
bot.rootDialog = resourceExplorer.loadType('echobot-0.dialog') as AdaptiveDialog;

server.post('/api/messages', (req, res): void => {
    adapter.processActivity(req, res, async (context): Promise<any> => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});