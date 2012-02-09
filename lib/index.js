// mongoose-keywordize

module.exports = exports = function keywordize (schema, options) {
  if (!Array.isArray(options.fields)) options.fields = [options.fields];

  var fields = options.fields.slice()
    , fn = 'function' == typeof options.fn && options.fn

  schema.add({ keywords: [String] });

  /**
   * Keywordize.
   *
   * Breaks apart field values into separate keywords.
   * @return {MongooseArray}
   * @api public
   */

  schema.methods.keywordize = function () {
    var self = this;

    var values = fields.map(function (field) {
      return self.get(field);
    });

    if (fn) {
      var res = fn.call(self);
      if (undefined !== res) {
        if (!Array.isArray(res)) res = [res];
        values = values.concat(res);
      }
    }

    this.set('keywords', []);
    var keywords = this.keywords;
    var i = values.length;

    while (i--) {
      ;(values[i] || '').split(/\s/).forEach(function (word) {
        word = word.trim();
        if (word) keywords.addToSet(word);
      })
    }

    return keywords;
  }

  /**
   * Update the keywords if any field changed.
   */

  schema.pre('save', function (next) {
    var self = this;

    var changed = this.isNew || fields.some(function (field) {
      return self.isModified(field);
    });

    if (changed) this.keywordize();
    next();
  });
}

/**
 * Expose version.
 */

exports.version = JSON.parse(
    require('fs').readFileSync(__dirname + '/../package.json')
).version;
