const request = require('superagent');
const Action = require('../action');
const config = require('../../config');

class SpongebobifyAction extends Action {
  get name() {
    return 'spongebobify';
  }

  onExecute(bot, {sessionId, context, text, entities}, message) {
    let str = message.content;
    let firstQuote = str.indexOf('"') + 1;
    let secondQuote = str.indexOf('"', firstQuote);

    let bottomText = str.substring(firstQuote, secondQuote)
      .split('')
      .map(char => Math.round(Math.random()) ? char.toUpperCase() : char.toLowerCase())
      .join('');

    let generateMeme = (templateId, topText, bottomText) => {
      return new Promise((resolve, reject) => {
        request.post('https://api.imgflip.com/caption_image')
          // eslint-disable-next-line camelcase
          .send({template_id: templateId})
          .send({text0: topText})
          .send({text1: bottomText})
          .send({username: config.imgflip.username})
          .send({password: config.imgflip.password})
          .send({font: 'arial'})
          .type('form')
          .end((err, res) => {
            if (err) return reject(err);
            let body = JSON.parse(res.text);
            if (!body.success) return reject(body);
            resolve(body.data.url);
          });
      });
    };

    return generateMeme(102156234, '', bottomText)
      .then(url => {
        message.reply(url);
      });
  }
}

module.exports = new SpongebobifyAction();
