const NotImplementedError = require('./errors/not-implemented-error');
const Action = require('./action');

class SpecialAction extends Action {
  /**
   *
   * @param bot
   * @param request
   * @param response
   * @returns {Request|Promise.<TResult>}
   */
  execute(bot, request, response) {
    this.logHit();
    Action._processEntities(request);

    console.log(`Session ${request.sessionId} received ${request.text}`);
    console.log(`The current context is ${JSON.stringify(request.context)}`);
    console.log(`Wit extracted ${JSON.stringify(request.entities)}`);
    console.log(`Wit is saying ${JSON.stringify(response.text)}`);

    return Action.store
      .getMessage(request.context.messageId)
      .then(message => this.onExecute(bot, request, response, message));
  }

  // eslint-disable-next-line no-unused-vars
  onExecute({sessionId, context, text, entities}, response) {
    throw new NotImplementedError();
  }
}

module.exports = SpecialAction;
