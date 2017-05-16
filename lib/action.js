const NotImplementedError = require('./errors/not-implemented-error');
const store = require('./session-store');

/**
 * @typedef Request
 * @type {Object}
 * @property {Object} context - the current context for the request.
 * @property {Object} entities - The processed entities that wit.ai found in the text.
 * @property {Object} rawEntities - The unprocessed entities that wit.ai found in the text.
 * @property {string} sessionId - the session id for wit.ai
 * @property {string} text - The message that wit processed.
 */

class Action {
  static get store() {
    return store;
  }

  /**
   * Processes the request object to allow for easier access.
   * @param request {Request}
   * @returns {Request}
   * @private
   */
  static _processEntities(request) {
    request.rawEntities = request.entities;

    request.entities = {};
    for (let entity in request.rawEntities) {
      if (request.rawEntities.hasOwnProperty(entity)) {
        request.entities[entity] = request.rawEntities[entity][0].value;
      }
    }
    return request;
  }

  /**
   * @type {string}
   * @constant
   */
  get name() {
    throw new NotImplementedError();
  }

  /**
   * Executes the action.
   * @param bot The discord bot that initiated the action.
   * @param request {Request} The request object returned by wit.ai
   * @returns {Promise.<Object>} returns the context
   * @public
   */
  execute(bot, request) {
    this.logHit();
    Action._processEntities(request);

    return store
      .getMessage(request.context.messageId)
      .then(message => this.onExecute(bot, request, message))
      .then(ctx => {
        ctx = ctx ? ctx : request.context;
        delete ctx.message;
        return ctx;
      });
  }

  logHit() {
    console.log(`executing action '${this.name}'`);
  }

  /**
   * Gets called when the action is executed.
   * @param bot The discord bot that initiated the action.
   * @param request {Request} The request object returned by wit.ai
   * @param message {Message} The message object that the bot received.
   * @protected
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  onExecute(bot, request, message) {
    const {sessionId, context, text, entities} = request;
    console.error(`${this.constructor.name}#onExecute was not implemented. Showing debug information`);

    console.error(`Session ${sessionId} received ${text}`);
    console.error(`The current context is ${JSON.stringify(context)}`);
    console.error(`Wit extracted ${JSON.stringify(entities)}`);
  }
}

module.exports = Action;
