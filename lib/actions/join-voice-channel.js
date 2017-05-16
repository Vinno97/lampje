const Action = require('../action');

class PlayAction extends Action {
  get name() {
    return 'joinVoiceChannel';
  }

  onExecute(bot, {sessionId, context, text, entities}, message) {
    let channel = message.member.voiceChannel;

    if (channel) {
      return channel.join()
        .then(() => {
          context.voiceChannelName = channel.name;
          return context;
        });
    }
    context.userNotInChannel = true;
    return context;
  }
}

module.exports = new PlayAction();
