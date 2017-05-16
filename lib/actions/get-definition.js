const Action = require('../action');
const NotImplementedError = require('../errors/not-implemented-error');
const request = require('superagent');
const config = require('../../config');

class SearchProvider {
  /**
   * @returns {string}
   */
  get name() {
    let name = this.constructor.name;
    return name.substring(0, 1).toUpperCase() +
      name.substring(1, name.lastIndexOf('Provider')).split(/(?=[A-Z])/).join(' ');
  }

  /**
   *
   * @param {string} query
   * @returns {Promise}
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  search(query) {
    throw new NotImplementedError();
  }
}

class UrbandictionaryProvider extends SearchProvider {

  /**
   *
   * @param {string} query
   * @returns {Promise}
   */
  search(query) {
    return new Promise((resolve, reject) => {
      request
        .get('http://api.urbandictionary.com/v0/define')
        .query({term: query})
        .end((err, {body}) => {
          if (err) return reject(err);

          let response = {};

          if (body.result_type !== 'no_results') {
            response.source = this.name;
            response.word = body.list[0].word;
            response.definition = `${body.list[0].definition}\n\n${body.list[0].example}`;
            response.audio = body.sounds[0];
          }

          resolve(response);
        });
    });
  }
}

class OxfordDictionaryProvider extends SearchProvider {

  constructor(appId, appKey) {
    super();
    this.appId = appId;
    this.apiKey = appKey;
  }

  /**
   *
   * @param {string} query
   * @returns {Promise}
   */
  search(query) {
    return new Promise((resolve, reject) => {
      request
        .get('https://od-api-demo.oxforddictionaries.com:443/api/v1/search/en')
        .set('Accept', 'application/json')
        .set('app_id', this.appId)
        .set('app_key', this.apiKey)
        .query({q: query})
        .query({prefix: false})
        .query({limit: 1})
        .end((err, res) => {
          if (err) return reject(err);

          let response = {};

          if (res.body.status === 200 && res.body.results.length > 0) {
            let result = res.body.results[0];
            response.source = this.name;
            response.word = result.headword;

            let definition = result.speach;
            definition += result.senses.map((v, k) => `${k + 1}) ${v.definition}`).join('\n\n');

            response.definition = definition;
          }

          resolve(response);
        });
    });
  }
}

class SearchEnginesProvider extends SearchProvider {

  constructor() {
    super();
    this._subProviders = [
      new UrbandictionaryProvider(),
      new OxfordDictionaryProvider(config.oxford.id, config.oxford.key)
    ];
  }

  /**
   *
   * @param {string} query
   * @returns {Promise}
   */
  search(query) {
    let promises = this._subProviders.map(provider => provider.search(query));
    return Promise.all(promises).then(results => results.find(result => result.definition));
  }
}

class GetDefinitionAction extends Action {
  get name() {
    return 'getDefinition';
  }

  constructor() {
    super();
    this._searchProvider = new SearchEnginesProvider();
  }

  onExecute(bot, {context, entities}) {
    return this._searchProvider
      .search(entities.search_query)
      .then(result => {
        if (result) {
          Object.assign(context, result);
        } else {
          context.noDefinition = true;
        }
      });
  }
}

module.exports = new GetDefinitionAction();
