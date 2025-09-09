// Chalk v5 compatibility patch
// This adds missing color methods that were removed in chalk v5

const originalChalk = require('chalk');

// Create a proxy that adds missing methods
const chalkProxy = new Proxy(originalChalk, {
  get(target, prop) {
    // If the property exists on the original chalk, return it
    if (prop in target) {
      return target[prop];
    }

    // Add missing color methods
    const colorMethods = [
      'blue',
      'cyan',
      'magenta',
      'white',
      'gray',
      'grey',
      'red',
      'green',
      'yellow',
      'black',
    ];
    if (colorMethods.includes(prop)) {
      // Return a function that just returns the text (no color for now)
      return function (text) {
        return text;
      };
    }

    return target[prop];
  },
});

module.exports = chalkProxy;
