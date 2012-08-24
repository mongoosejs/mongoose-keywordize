
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , assert = require('assert')
  , keywords = require('../')

mongoose.connect('localhost', 'mongoose_keywordize');

var schema = new Schema({
    name: { first: String, last: String }
  , tags: [String]
  , langs: [String]
});

var opts = {};
opts.fields = ['name.first', 'name.last', 'langs'];
opts.fn = function () {
  if (this.isModified('tags')) {
    return this.tags[1];
  }
}

schema.plugin(keywords, opts);

var Person = mongoose.model('Person', schema);

describe('plugin', function () {
  before(function (next) {
    mongoose.connection.on('open', next);
  });

  it('should have a version', function () {
    assert.ok(keywords.hasOwnProperty('version'));
  });

  it('should create a keywords property of type array', function () {
    assert.equal(Person.schema.path('keywords').casterConstructor.name,'SchemaString');
    var p = new Person;
    assert.equal(true, Array.isArray(p.keywords));
  });

  it('should add a keywordize method to the schema', function () {
    assert.equal('function', typeof Person.prototype.keywordize);
  });

  describe('keywordize', function () {
    it('should populate the keywords', function () {
      var p = new Person({ name: { last: 'heckmann' }});
      assert.equal(0, p.keywords.length);
      p.keywordize();
      assert.equal(1, p.keywords.length);
      p.name.first = 'aaron';
      p.keywordize();
      assert.equal(2, p.keywords.length);
      p.tags = "one two three".split(" ");
      p.keywordize();
      assert.equal(3, p.keywords.length);
      p.keywordize();
      assert.equal(3, p.keywords.length);
      p.langs = ["English", "French"];
      p.keywordize();
      assert.equal(5, p.keywords.length);
    });

    it('should return the keywords', function () {
      var p = new Person({ name: { last: 'agent', first: 'smith' }});
      assert.ok(p.keywordize() instanceof Array);
      assert.equal(2, p.keywordize().length);
    });

    it('should not allow duplicate keywords', function () {
      var p = new Person({ name: { last: 'smith', first: 'smith' }, langs: ['smith']});
      assert.equal(1, p.keywordize().length);
    });

    it('should trim the keywords', function () {
      var p = new Person({ name: { last: ' smith  ' }, langs: [' trimme ']});
      assert.equal(p.keywordize()[1],'smith');
      assert.equal(p.keywordize()[0],'trimme');
    });

    it('should lowercase the keywords', function () {
      var p = new Person({ name: { last: 'SmiTh' }, langs: ['Sup']});
      assert.equal(p.keywordize()[0],'sup');
      assert.equal(p.keywordize()[1],'smith');
    });

    it('should not lowercase keywords', function () {
      var s = new Schema({
          name: String
        , langs: [String]
      });
      var opts = { fields: ['name','langs'], upper: true };
      s.plugin(keywords, opts);
      var A = mongoose.model('A', s);
      var a = new A;
      a.name = 'Stravinsky'
      assert.equal(a.keywordize()[0],'Stravinsky');
      a.langs = ['Rachmaninoff']
      assert.equal(a.keywordize()[0],'Rachmaninoff');
    });
  });

  describe('hooks', function () {
    it('should add the keywords when new', function (next) {
      var p = new Person({ name: { last: 'heckmann' }, langs: ['jon']});
      assert.equal(p.keywords.length,0);
      p.save(function (err) {
        if (err) return next(err);
        assert.equal(p.keywords.length,2);
        assert.equal(p.keywords[0],'jon');
        assert.equal(p.keywords[1],'heckmann');
        next();
      });
    });

    it('should update the keywords if any field changed', function (next) {
      var p = new Person({ name: { last: 'heckmann' }});
      assert.equal(p.keywords.length,0);
      p.save(function (err) {
        if (err) return next(err);
        assert.equal(p.keywords.length,1);
        assert.equal(p.keywords[0],'heckmann');
        p.name.last = 'fuerstenau';
        p.save(function (err) {
          if (err) return next(err);
          assert.equal(p.keywords.length,1);
          assert.equal(p.keywords[0],'fuerstenau');
          p.langs = ['Italian', 'Spanish'];
          p.save(function (err) {
            if (err) return next(err);
            assert.equal(p.keywords.length,3);
            assert.equal(p.keywords[0],'italian');
            assert.equal(p.keywords[1],'spanish');
            assert.equal(p.keywords[2],'fuerstenau');
            next();
          });
        });
      });
    });
  });

  describe('options', function(){

    it('should allow defining keywords index', function(done){
      var schema = new Schema({
          title         : String
        , description   : String
      });
      var options = {
          fields    : [ 'title', 'description' ]
        , index     : true
      };
      schema.plugin( keywords, options );
      assert.equal(schema.path('keywords')._index,true);

      schema = new Schema({
          title         : String
        , description   : String
      });
      options = {
          fields    : [ 'title', 'description' ]
        , index     : { sparse: true }
      };
      schema.plugin( keywords, options );
      assert.deepEqual(schema.path('keywords')._index,{ sparse: true });

      done();
    });

  });

  after(function () {
    mongoose.disconnect();
  });

});
