// mongoose-keywordize

module.exports = exports = function keywordize (schema, options) {
  if (!Array.isArray(options.fields)) options.fields = [options.fields];

  var fields = options.fields.slice()
    , fn = 'function' == typeof options.fn && options.fn

  schema.add({ keywords: [String] });

  schema.methods.keywordize = function () {
    var self = this;

    var values = fields.map(function (field) {
      return self.get(field);
    });

    var keywords = [];
    var i = values.length;

    while (i--) {
      var val = (values[i] || '').split(/\s/);
      val.forEach(function (v) {
        v = v.trim();
        if (v) keywords.push(v);
      })
    }

    if (fn) {
      var res = fn.call(self);
      if (undefined !== res) {
        if (!Array.isArray(res)) res = [res]
        val.forEach(function (v) {
          if (!v) return;
          v = v.trim();
          if (v) keywords.push(v);
        })
      }
    }

    this.keywords = keywords;
  }

  schema.pre('save', function (next) {
    var self = this;

    var changed = this.isNew || fields.some(function (field) {
      return self.isModified(field);
    });

    if (changed) this.keywordize();
    next();
  });
}
