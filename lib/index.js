'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config.js');
const Discord = require('discord.js');
const {Wit, log} = require('node-wit');
const store = require('./session-store');
const soundboard = require('./soundboard').instance;

const bot = new Discord.Client();

const accessToken = config.witAi.accessToken;
const actions = {};
const logger = new log.Logger(log.DEBUG);

{
  const actionsDir = path.resolve(__dirname, 'actions');
  fs.readdirSync(actionsDir).forEach(file => {
    let action = require(path.resolve(actionsDir, file));
    actions[action.name] = action.execute.bind(action, bot);
  });
}
// Actions['play'] = function(request) {
//   console.log('play context: ' + JSON.stringify(request.context));
//   return new Promise((resolve, reject) => {
//     resolve({source: 'local', title: 'Never going to give you up'})
//   });
// };
// actions['send'] = function(request, response) {
//   console.log('send context: ' + JSON.stringify(request.context));
//   console.log('send message: ' + response.text);
//   return new Promise((resolve, reject) => {
//     resolve()
//   });
// };

const wit = new Wit({accessToken, actions, logger});

soundboard.refreshFiles();
soundboard.watchDirectory();

bot.on('message', message => {
  // Fired when someone sends a message

  if (message.author.bot && bot.hasOwnProperty('channel') && message.channel.id !== bot.channel) {
    return;
  }

  store
    .cacheMessage(message)
    .then(() => store.getSession(message))
    .then(sess => {
      sess.context.messageId = message.id;

      // We received a text message
      wit.runActions(sess.sid, message.content, sess.context)
        .then(context => {
          // Finished with the actions
          delete context.messageId;

          // Updating the user's current session state
          store.saveSession(sess, context);
        })
        .catch(err => {
          console.error('Oops! Got an error from Wit: ', err.stack || err);
        })
        .then(() => store.removeMessage(message.id));
    });
});

bot.login(config.discord.token).then(() => {
  console.log('Running!');
});

module.exports = bot;
