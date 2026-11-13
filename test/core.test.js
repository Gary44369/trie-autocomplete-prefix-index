import test from 'node:test';
import assert from 'node:assert/strict';
import { PrefixIndex } from '../src/index.js';

test('add returns true for new words and false for duplicates', () => {
  const index = new PrefixIndex();
  assert.equal(index.add('cat'), true);
  assert.equal(index.add('cat'), false);
  assert.equal(index.add('car'), true);
  assert.equal(index.length, 2);
});

test('add ignores empty strings and non-strings', () => {
  const index = new PrefixIndex();
  assert.equal(index.add(''), false);
  assert.equal(index.add(null), false);
  assert.equal(index.add(undefined), false);
  assert.equal(index.add(42), false);
  assert.equal(index.length, 0);
});

test('addAll counts only newly added words', () => {
  const index = new PrefixIndex();
  assert.equal(index.addAll(['a', 'b', 'a', 'c']), 3);
  assert.equal(index.length, 3);
});

test('has finds exact words only', () => {
  const index = new PrefixIndex();
  index.addAll(['cat', 'car', 'cart']);
  assert.equal(index.has('cat'), true);
  assert.equal(index.has('car'), true);
  assert.equal(index.has('cart'), true);
  assert.equal(index.has('ca'), false);
  assert.equal(index.has('cats'), false);
  assert.equal(index.has(''), false);
});

test('complete returns all words with the given prefix', () => {
  const index = new PrefixIndex();
  index.addAll(['car', 'cart', 'cat', 'dog']);
  assert.deepEqual(index.complete('ca'), ['car', 'cart', 'cat']);
  assert.deepEqual(index.complete('car'), ['car', 'cart']);
  assert.deepEqual(index.complete('cart'), ['cart']);
});

test('complete returns an empty array for a missing prefix', () => {
  const index = new PrefixIndex();
  index.addAll(['car', 'cat']);
  assert.deepEqual(index.complete('z'), []);
  assert.deepEqual(index.complete('caq'), []);
});

test('complete on the empty prefix returns every word in sorted order', () => {
  const index = new PrefixIndex();
  index.addAll(['banana', 'apple', 'cherry']);
  assert.deepEqual(index.complete(''), ['apple', 'banana', 'cherry']);
});

test('complete output is sorted regardless of insertion order', () => {
  const a = new PrefixIndex();
  a.addAll(['zebra', 'apple', 'mango']);
  const b = new PrefixIndex();
  b.addAll(['mango', 'zebra', 'apple']);
  assert.deepEqual(a.complete(''), b.complete(''));
  assert.deepEqual(a.complete(''), ['apple', 'mango', 'zebra']);
});

test('a word that is a prefix of another is itself a completion', () => {
  const index = new PrefixIndex();
  index.addAll(['app', 'apple', 'application']);
  assert.deepEqual(index.complete('app'), ['app', 'apple', 'application']);
});

test('complete handles non-string input by returning an empty array', () => {
  const index = new PrefixIndex();
  index.add('cat');
  assert.deepEqual(index.complete(null), []);
  assert.deepEqual(index.complete(undefined), []);
  assert.deepEqual(index.complete(7), []);
});

test('the index is case-sensitive', () => {
  const index = new PrefixIndex();
  index.addAll(['Cat', 'cat']);
  assert.deepEqual(index.complete('C'), ['Cat']);
  assert.deepEqual(index.complete('c'), ['cat']);
  assert.equal(index.length, 2);
});

test('words containing the END sentinel string are stored normally', () => {
  const index = new PrefixIndex();
  index.add('END');
  assert.equal(index.has('END'), true);
  assert.deepEqual(index.complete('E'), ['END']);
});
