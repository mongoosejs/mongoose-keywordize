// mongoose-keywordize

module.exports = exports = function keywordize (schema, options) {
  if (!Array.isArray(options.fields)) {
    options.fields = [options.fields];
  }

  var fields = options.fields.slice()
    , fn = 'function' === typeof options.fn && options.fn
    , map = 'function' === typeof options.map && options.map
		, keywordField = options.keywordField || 'keywords'
    , upper = !! options.upper // if true, keywords will not be lowercased
    , index = options.index

	var newSchemaField = {};
	newSchemaField[keywordField] = [String];
  schema.add(newSchemaField);

  if (index) {
    schema.path(keywordField).index(index);
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
      if (map) {
        return map(field, self.get(field));
      } else {
        return self.get(field);
      }
    });

    if (fn) {
      var res = fn.call(self);
      if (undefined !== res) {
        if (!Array.isArray(res)) res = [res];
        values = values.concat(res);
      }
    }

    this.set(keywordField, []);
    var keywords = this[keywordField];
    var i = values.length;

    while (i--) {
      var arr = Array.isArray(values[i])
        ? values[i]
        : (values[i] || '').split(/\s/);

      arr.forEach(function (word) {
        if (word = word.trim()) {
          if (upper) {
            keywords.addToSet(word);
          } else {
            keywords.addToSet(word.toLowerCase());
          }
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
