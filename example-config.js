// This is an example config that contains all the necessary config values.
// Edit this file to your preferences and rename it to 'config.js'

module.exports = {
  discord: {
    // Your bot name. Typically, this is your bot's username without the discriminator.
    // i.e: if your bot's username is MemeBot#0420, then this option would be MemeBot.
    name: 'Lampje',

    // Your bot's user token. If you don't know what that is, go here:
    // https://discordapp.com/developers/applications/me
    // Then create a new application and grab your token.
    token: ''
  },

  witAi: {
    // Your wit.ai access token. You can find this in settings > API Details > Server Access Token
    // The default value contains the Client Access Token for https://wit.ai/Vinno97/lampje
    accessToken: 'KFXBGJ7772IAWVQFTRJUV5OXPE3ZEB7D'
  },

  soundboard: {
    // Change this directory if you have your own collection of audio files.
    dir: 'assets/audio/soundboard'
  },

  youtube: {
    // Your Youtube Data API v3 key.
    // You can create one in the Google Developers Console: https://console.developers.google.com
    apiKey: ''
  },

  imgflip: {
    // Your credentials for https://imgflip.com.
    username: '',
    password: ''
  },

  oxford: {
    // Your Oxford Dictionary API credentials.
    // You can create them at https://developer.oxforddictionaries.com
    id: '',
    key: ''
  }
};
