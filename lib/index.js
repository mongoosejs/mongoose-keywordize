// mongoose-keywordize

module.exports = exports = function keywordize (schema, options) {
  if (!Array.isArray(options.fields)) options.fields = [options.fields];

  var fields = options.fields.slice()
    , fn = 'function' == typeof options.fn && options.fn
    , upper = !! options.upper // if true, keywords will not be lowercased
    , index = options.index

  schema.add({ keywords: [String] });

  if (index) {
    schema.path('keywords').index(index);
  }

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
      var arr = Array.isArray(values[i])
        ? values[i]
        : (values[i] || '').split(/\s/);

      arr.forEach(function (word) {
        if (word = word.trim()) {
          if (upper)
            keywords.addToSet(word);
          else
            keywords.addToSet(word.toLowerCase());
        }
      });
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
