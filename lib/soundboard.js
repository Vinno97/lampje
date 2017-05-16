const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');

const config = require('../config');

/**
 * This is a very simple promise wrapper for the internal fs.readdir function
 * @returns {Promise}
 */
let readdir = dir => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });
};

/**
 * @type {SoundBoard}
 */
let _instance;

class SoundBoard {
  static get baseDir() {
    return `${__dirname}/../${config.soundboard.dir}`;
  }

  /**
   * A singleton instance
   * @returns {SoundBoard}
   */
  static get instance() {
    if (!_instance) {
      _instance = new SoundBoard();
    }
    return _instance;
  }

  constructor() {
    let fuseOptions = {
      shouldSort: true,
      threshold: 0.5,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'name',
        'tags'
      ]
    };
    this.fuse = new Fuse([], fuseOptions);
  }

  watchDirectory() {
    fs.watch(SoundBoard.baseDir, () => this.refreshFiles());
  }

  refreshFiles() {
    console.log('Updating soundboard index..');
    return readdir(SoundBoard.baseDir)
      .then(files => {
        files = files.filter(file => ['.mp3', '.wav'].includes(path.extname(file)));

        console.log(`Found ${files.length} audio files`);
        files = files.map(file => {
          return {
            file: file,
            path: SoundBoard.baseDir + '/' + file,
            name: file.slice(0, file.lastIndexOf('%%')),
            tags: file.slice(file.indexOf('%%'), file.lastIndexOf('.'))
          };
        });
        this.fuse.set(files);
      });
  }

  /**
   *
   * @param query
   * @returns {Promise}
   */
  getSound(query) {
    console.log(`Searching for soundboard files matching "${query}"`);

    let results = this.fuse.search(query);
    let result = results[0];

    if (result) {
      console.log(`Found "${result.name}"`);
    } else {
      console.log(`Could not find any file matchin "${query}"`);
    }
    return result;
  }
}

module.exports = SoundBoard;
