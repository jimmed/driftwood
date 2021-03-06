var patterns = require('../patterns')
var expect = require('../../test/expect')
var storage = require('../storage')

describe('patterns', function () {
  afterEach(storage.reset)

  describe('get', function () {
    it('should parse the value from storage', function () {
      storage.set('{"foo": "bar"}')
      expect(patterns.get()).to.eql({ foo: 'bar' })
    })

    describe('if there is bad JSON', function () {
      it('should return an empty object', function () {
        storage.set('oinf@oin')
        expect(patterns.get()).to.eql({})
      })
    })
  })

  describe('set', function () {
    it('should stringify the value into storage', function () {
      patterns.set({ foo: 'bar' })
      expect(storage.get()).to.equal('{"foo":"bar"}')
    })

    describe('if there is an error', function () {
      it('should catch it', function () {
        var foo = { }
        foo.bar = foo

        expect(function () {
          patterns.set(foo)
        }).to.not.throwError()
      })
    })
  })

  describe('match', function () {
    describe('when a single wildcard is set', function () {
      it('should match everything', function () {
        patterns.set({ '*': null })
        expect(patterns.match('foo')).to.be(true)
        expect(patterns.match('bar')).to.be(true)
      })
    })

    describe('when a partial wildcard is set', function () {
      beforeEach(function () {
        patterns.set({ 'foo*': null })
      })

      it('should match', function () {
        expect(patterns.match('foo')).to.be(true)
        expect(patterns.match('foobar')).to.be(true)
      })

      it('should not match if name is not valid', function () {
        expect(patterns.match('bar')).to.be(false)
        expect(patterns.match('ofoo')).to.be(false)
      })
    })

    describe('when a non-wildcard pattern is set', function () {
      beforeEach(function () {
        patterns.set({ 'foo': null })
      })

      it('should match if name is the exact pattern', function () {
        expect(patterns.match('foo')).to.be(true)
      })

      it('should not match if the name is not the exact pattern', function () {
        expect(patterns.match('bar')).to.be(false)
        expect(patterns.match('foos')).to.be(false)
      })
    })
  })

  describe('getLevel', function () {
    describe('when there is no level set', function () {
      it('should return the default level', function () {
        patterns.set({ '*': null })
        expect(patterns.getLevel('foo')).to.equal('info')
      })
    })

    describe('when a level is set', function () {
      it('should return that level', function () {
        patterns.set({ 'foo': 'trace' })
        expect(patterns.getLevel('foo')).to.equal('trace')
      })
    })

    describe('when multiple matching patterns are set', function () {
      it('should return the first matching level', function () {
        patterns.set({
          'bar': 'trace',
          'foo*': 'warn',
          'foob': 'debug'
        })
        expect(patterns.getLevel('foob')).to.equal('warn')
      })
    })
  })
})
