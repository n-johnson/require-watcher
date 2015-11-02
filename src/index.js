import R from 'ramda';
import Immutable from 'immutable';
import EventEmitter from 'events';

import {getRequireCache, isRequire, notEqual} from './lib/RequireUtils';

const setFromArray = (x) => { return Immutable.Set.of(...x); };
const setToArray = (x) => { return Immutable.Set.isSet(x) ? x.toArray() : []; };

const subtractSet = (set) => {
  if (!Immutable.Set.isSet(set)) {
    set = Immutable.Set.of();
  }

  return R.bind(R.curry(set.subtract), set);
};

const RequireWatcher = function(r, opts) {
  if (!isRequire(r)) throw 'Invalid require object';

  const defaultOpts = { interval: 5 };

  this.opts = R.merge(defaultOpts, opts);
  this.require = r;
  this.output = new EventEmitter();
  this.cacheState = Immutable.List.of().asMutable();

  this._start();

  return this.output;
};

RequireWatcher.prototype._start = function() {
  var self = this;
  this._intervalHandler = setInterval(function() {

    const emit = R.curry(R.binary((x,y) => {self.output.emit(x,y);}));
    const memitAdd = R.map(emit('add'));
    const memitRemove = R.map(emit('emitRemove'));

    const curCache = setFromArray(self.getCache());
    const isModified = notEqual(self.cacheState.last(), curCache);

    if (isModified) {
      const setOne = self.cacheState.last();
      const setTwo = curCache;

      R.compose(
        R.lift(R.compose(
          memitAdd,
          setToArray)
        ),
        R.curry(subtractSet)
      )(setTwo)(setOne);

      R.compose(
        R.lift(R.compose(
          memitRemove,
          setToArray)
        ),
        R.curry(subtractSet)
      )(setOne)(setTwo);

      self.cacheState = self.cacheState.push(curCache);
    }
  }, this.opts.interval * 1000);
};

RequireWatcher.prototype.getCache = function() {
  const self = this;

  return getRequireCache(self.require);
};

module.exports = function(r, opts) {
  return new RequireWatcher(r, opts);
};
