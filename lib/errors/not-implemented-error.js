'use strict';

const ExtensibleError = require('./extensible-error');

class NotImplementedError extends ExtensibleError {
  constructor(message) {
    super(message || 'Method is not implemented');
  }
}

module.exports = NotImplementedError;
