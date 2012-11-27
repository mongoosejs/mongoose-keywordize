#Mongoose-keywordize Plugin

Provides keyword derivation for [Mongoose](http://mongoosejs.com) documents.

[![Build Status](https://secure.travis-ci.org/aheckmann/mongoose-keywordize.png)](http://travis-ci.org/aheckmann/mongoose-keywordize)

Options:

  - `fields`: an array of paths you want watched and converted into keywords
  - `fn`: optional function to execute when keywordize() runs; if a value is returned it is included in the keywords array
  - `pre`: optional function to run against each value returned from each `field` before it's parsed and added to the keywords array
  - `keywordField`: the name of the field in which keywords will be stored; defaults to `keywords`
  - `upper`: true to retain letter casing. default is false (all keywords are lowercased)

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

###index

Keywordize, by default, does not define an index on the "keywords" key.
If you want to define an index you should use the "index" option:

```js
var opts = {}
opts.index = true
```

###pre

To have the opportunity to pre-process field values as they're retreived by the `keywordize` plugin before they are processed, pass an optional `pre` function. This function, when provided, will be run against each value returned from each `field` before it's parsed and added to the keywords array. The function is passed the `value` and field name.

```js
var opts = {};
opts.fields = ['description', 'title']
opts.pre = function (value, field) {
	// remove html entities from each keyword picked from description
	if ('description' == field) {
		return value.replace(/&#?[a-z0-9]{2,8};/ig, ' ');
	} else {
		return value;
	}
}
var schema = new Schema({ description: String, title: String });
schema.plugin(keywordize, opts);

var Person = mongoose.model('Person', schema);
var me = new Person({ name: 'aaron' });
me.description = 'Tall&nbsp;&amp;&nbsp;Awkward';
me.keywordize();
console.log(me.keywords) // ['aaron', 'tall', 'awkward']
```

###fn

One may also pass an optional function to run custom logic within the call to `keywordize`. The optional function will be executed within the context of the document, meaning we have access to the documents properties through the `this` keyword to perform any custom logic necessary.

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

_Either a an `Array` or single string may be returned from the function and will be pushed onto the keywords array._

###upper

By default mongoose-keywordize lowercases the keywords. To preserve casing pass the `upper: true` option.

## Mongoose Version
`>= 2.x`

[LICENSE](https://github.com/aheckmann/mongoose-keywordize/blob/master/LICENSE)





