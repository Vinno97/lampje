// TODO: Make this generic and pretty
// TODO: Make compatible with both callbacks and promises.

class Store {
  constructor() {
    this.sessions = {};
    this.messages = {};
  }

  cacheMessage(message) {
    this.messages[message.id] = message;
    return Promise.resolve(message);
  }

  getMessage(messageId) {
    return Promise.resolve(this.messages[messageId]);
  }

  removeMessage(messageId) {
    let message = this.messages[messageId];
    delete this.messages[messageId];
    return Promise.resolve(message);
  }

  getSession(message) {
    const userId = message.author.id + '@' + message.channel.id;

    let sid;
    // Checks if there is already a session for the user
    Object.keys(this.sessions).forEach(k => {
      if (this.sessions[k].id === userId) {
        sid = k;
        return false;
      }
    });
    if (!sid) {
      // Creates a new session if none is found
      sid = new Date().toISOString();
      let context = {};
      let user = message.author;
      let channel = message.channel;
      this.saveSession({userId, context, sid, user, channel});
    }
    return Promise.resolve(this.sessions[sid]);
  }

  saveSession(session, context) {
    if (context !== undefined) {
      session.context = context;
    }
    this.sessions[session.sid] = session;
  }
}

module.exports = new Store();
