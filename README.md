#Mongoose-keywordize Plugin

Provides keyword derivation for [Mongoose](http://mongoosejs.com) documents.

[![Build Status](https://secure.travis-ci.org/aheckmann/mongoose-keywordize.png)](http://travis-ci.org/aheckmann/mongoose-keywordize)

Options:

  - fields: an array of paths you want watched and converted into keywords
  - fn: a custom function to execute when keywordize() runs, pushes returned values to keyword array
  - keywordField: provide your own name for the keywords field, defaults to `keywords`
  - map: a custom function to run against each keyword before it's added to the keyword array

Example:

```js
var schema = new Schema({ name: String, title: String });
schema.plugin(keywordize, { fields: 'name title'.split(' ') });
```

This will introduce a new `keywordize()` document method which detects if any of the passed fields have been modified and updates the new `keywords` property appropriately.

Example:

```js
var Person = mongoose.model('Person', schema);
var me = new Person({ name: 'aaron' });
me.keywordize();
console.log(me.keywords) // ['aaron']
```

The `keywordize` method is always called upon saving each document, auto-updating to the latest keywords.

```js
me.title = 'Mr';
me.save(function (err) {
  console.log(me.keywords) // ['aaron', 'Mr']
})
```

Mongoose keywordize, by default, does not define an index on the "keywords" key.
If you want to defined an index you should use the "index" option:

```js
var opts = {}
opts.index = true
```

One may also pass an optional function to run custom logic within the call to `keywordize`.

```js

var opts = {};
opts.fields = ['name', 'title']
opts.fn = function custom () {
  if ('Mister' === this.title) {
    return 'Mr';
  }
}
var schema = new Schema({ name: String, title: String });
schema.plugin(keywordize, opts);

var Person = mongoose.model('Person', schema);
var me = new Person({ name: 'aaron' });
me.title = 'Mister';
me.keywordize();
console.log(me.keywords) // ['aaron', 'Mister', 'Mr']
```

The optional function will be executed within the context of the document meaning we have access to the documents properties through the `this` keyword.

Either a an Array or single string may be returned from the function and will be pushed onto the keywords array.

Pass an optional `map` function to run against each keyword called by `keywordize`.
The function is passed the `field name` and `value`.

```js

var opts = {};
opts.fields = ['description', 'title']
opts.map = function(field, value) {
	// remove html entities from each keyword picked from description
	if (field === 'description') {
		return value.replace(/&#?[a-z0-9]{2,8};/ig, ' ');
	} else {
		return value;
	}
}
var schema = new Schema({ description: String, title: String });
schema.plugin(keywordize, opts);

var Person = mongoose.model('Person', schema);
var me = new Person({ name: 'aaron' });
me.description = 'Tall&nbsp;&amp;&nbsp;Handsome';
me.keywordize();
console.log(me.keywords) // ['aaron', 'tall', 'handsome']
```


## Casing

By default mongoose-keywordize lowercases the keywords. To preserve casing pass the `upper: true` option to the plugin.

## Mongoose Version
`>= 2.x`

[LICENCE](https://github.com/aheckmann/mongoose-keywordize/blob/master/LICENSE)





