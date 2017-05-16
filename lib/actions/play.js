const promisify = require('promisify-node');
const ytdl = require('ytdl-core');
const searchYoutube = promisify(require('youtube-search'));
const Action = require('../action');
const NotImplementedError = require('../errors/not-implemented-error');
const soundboard = require('../soundboard').instance;
const config = require('../../config');

class PlayAction extends Action {
  constructor() {
    super();

    this._youtubeOptions = {
      maxResults: 1,
      key: config.youtube.apiKey
    };
  }

  get name() {
    return 'play';
  }

  get streamOptions() {
    return {seek: 0, volume: 1, passes: 1};
  }

  onExecute(bot, request, message) {
    let channel = message.member.voiceChannel;

    // Stop if the user nis not in a channel.
    if (!channel) {
      request.context.userNotInChannel = true;
      return request.context;
    }

    return this._getMedia(request)
      .then(media => this._playMedia(channel, media))
      .catch(err => {
        if (err.name === 'NotImplementedError') {
          message.reply('This feature is not yet implemented');
        } else {
          throw err;
        }
      })
      .then(() => request.context);
  }

  _getMedia({context, entities}) {
    let media;

    switch (entities.source) {
      case 'youtube':
        media = this._getYoutubeStream(entities, context);
        break;
      case 'soundcloud':
      case 'spotify':
        media = Promise.reject(new NotImplementedError('This media type is not yet supported'));
        break;
      default:
        let sound = soundboard.getSound(entities.search_query);
        media = `file:${sound.path}`;
        context.title = sound.name;
        context.source = entities.source || 'soundboard';
    }

    return Promise.resolve(media);
  }

  _playMedia(channel, input) {
    return channel
      .join()
      .then(connection => connection.playArbitraryInput(input, this.streamOptions))
      .then(dispatcher => {
        dispatcher.on('start', () => {
          console.log('Playing audio');
        });

        dispatcher.on('end', () => {
          console.log('Stopped playing audio');
        });

        dispatcher.on('error', err => {
          console.error('Error while playing audio: ' + err.message);
          console.error(err.stack);
        });
      });
  }

  _getYoutubeStream(entities, context) {
    let url = entities.url;
    if (!url) {
      url = searchYoutube(entities.search_query, this._youtubeOptions).then(result => result[0].link);
    }

    return Promise.resolve(url)
      .then(ytdl.getInfo)
      .then(info => {
        context.title = info.title;
        return ytdl.downloadFromInfo(info, {filter: 'audioonly'});
      })
      .catch(err => {
        throw err;
      });
  }
}

module.exports = new PlayAction();
