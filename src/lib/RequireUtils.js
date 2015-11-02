import assert from 'assert';
import R from 'ramda';
import {resolve} from 'path';

/**
 * notEqual
 * @type {Function}
 */
export const notEqual = R.compose(R.not, R.equals);

const objectToArray = R.values;
const isArray = R.is(Array);

const walkRequireCacheTree = function(item, total) {
  assert(isArray(total));

  if (item.filename) {
    total.push(item.filename);
  }

  if (item.children) {
    item.children.map((i) => { walkRequireCacheTree(i, total); });
  }

  return total;
};

const getRequireCacheTree = (rq) => { return { children: objectToArray(rq) }; };

const parseFileList = function(rq) {
  const cacheTree = getRequireCacheTree(rq);

  return walkRequireCacheTree(cacheTree, []);
};

/**
 * getRequireCache
 *   - Returns an array of file paths for all loaded modules in the require cache
 * @param  {Require} _require Instance of require
 * @return {Array}
 */
export const getRequireCache = function (_require) {
  const node_modules_path = resolve(_require.main.filename, '../node_modules');
  const filterNodeModules = R.filter((k) => { return k.indexOf(node_modules_path) === -1; })

  const _getCache = R.compose(
    R.uniq,
    filterNodeModules,
    parseFileList
  );

  return _getCache(_require.cache);
};

const notLocalRequireConstructor = (r) => { return notEqual(r, require.constructor); };
const isInstanceOfConstructor = (r) => { return R.is(require.constructor, r); };

/**
 * isRequire
 *   - Takes a require object and ensures it is valid and came from a different file (unique per file context)
 * @param  {Require} r
 * @return {Boolean}
 */
export const isRequire = (r) => { return R.allPass([notLocalRequireConstructor, isInstanceOfConstructor])(r); };
