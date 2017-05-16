const Action = require('../action');

class PlayAction extends Action {
  get name() {
    return 'leaveVoiceChannel';
  }

  onExecute(bot, {sessionId, context, text, entities}, message) {
    let channel = message.member.voiceChannel;
    if (!channel) {
      context.userNotInChannel = true;
    } else if (bot.voiceConnections.find('channel', channel)) {
      channel.leave();
      context.leftChannel = true;
    } else {
      context.userNotInSameChannel = true;
    }
    return context;
    //
    //   return channel.join()
    //     .then(() => {
    //       context.voiceChannelName = channel.name;
    //       return context;
    //     });
    // } else {
    //
    // }
  }
}

module.exports = new PlayAction();
