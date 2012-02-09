
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , keywords = require('../')
  , should = require('should')

mongoose.connect('localhost', 'mongoose_keywordize');

var schema = new Schema({
    name: { first: String, last: String }
  , tags: [String]
});

var opts = {};
opts.fields = ['name.first', 'name.last'];
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
    keywords.should.have.property('version');
  });

  it('should create a keywords property of type array', function () {
    Person.schema.path('keywords').casterConstructor.name.should.equal('SchemaString');
    var p = new Person;
    Array.isArray(p.keywords).should.be.true;
  });

  it('should add a keywordize method to the schema', function () {
    Person.prototype.keywordize.should.be.a('function');
  });

  describe('keywordize', function () {
    it('should populate the keywords', function () {
      var p = new Person({ name: { last: 'heckmann' }});
      p.keywords.length.should.equal(0);
      p.keywordize();
      p.keywords.length.should.equal(1);
      p.name.first = 'aaron';
      p.keywordize();
      p.keywords.length.should.equal(2);
      p.tags = "one two three".split(" ");
      p.keywordize();
      p.keywords.length.should.equal(3);
      p.keywordize();
      p.keywords.length.should.equal(3);
    });

    it('should return the keywords', function () {
      var p = new Person({ name: { last: 'agent', first: 'smith' }});
      p.keywordize().should.be.an.instanceof(Array);
      p.keywordize().length.should.equal(2);
    });

    it('should not allow duplicate keywords', function () {
      var p = new Person({ name: { last: 'smith', first: 'smith' }});
      p.keywordize().length.should.equal(1);
    });

    it('should trim the keywords', function () {
      var p = new Person({ name: { last: ' smith  ' }});
      p.keywordize()[0].should.equal('smith');
    });
  });

  describe('hooks', function () {
    it('should add the keywords when new', function (next) {
      var p = new Person({ name: { last: 'heckmann' }});
      p.keywords.length.should.equal(0);
      p.save(function (err) {
        if (err) return next(err);
        p.keywords.length.should.equal(1);
        p.keywords[0].should.equal('heckmann');
        next();
      });
    });

    it('should update the keywords if any field changed', function (next) {
      var p = new Person({ name: { last: 'heckmann' }});
      p.keywords.length.should.equal(0);
      p.save(function (err) {
        if (err) return next(err);
        p.keywords.length.should.equal(1);
        p.keywords[0].should.equal('heckmann');
        p.name.last = 'fuerstenau';
        p.save(function (err) {
          if (err) return next(err);
          p.keywords.length.should.equal(1);
          p.keywords[0].should.equal('fuerstenau');
          next();
        });
      });
    });
  });

  after(function () {
    mongoose.disconnect();
  });

});


