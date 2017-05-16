const SpecialAction = require('../special-action');

class SendAction extends SpecialAction {
  get name() {
    return 'send';
  }

  onExecute(bot, request, response, message) {
    message.reply(response.text.length < 1900 ? response.text : response.text.slice(0, 1900) + '…');
  }
}

module.exports = new SendAction();
