const Action = require('./action');

class SetMainChannelAction extends Action {
  get name() { return 'setMainChannel'; }

  onExecute(bot, {sessionId, context, text, entities}, message) {
    message.reply('Dit is een test om het hoofdkanaal te zetten');
  }
}

module.exports = new SetMainChannelAction();
