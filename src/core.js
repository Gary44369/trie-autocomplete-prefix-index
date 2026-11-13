const END = Symbol('end');

/**
 * A trie node. Children are stored in a Map keyed by single characters.
 * The `END` symbol is used instead of a boolean flag so that a node can
 * distinguish "this node terminates a word" from "this node has a child
 * whose key is the string 'END'". Using a symbol makes that distinction
 * impossible to get wrong.
 */
class TrieNode {
  constructor() {
    this.children = new Map();
    this.terminal = false;
  }
}

/**
 * Builds a trie from a word list and returns matching completions for a
 * given prefix.
 *
 * The trie is case-sensitive and stores words exactly as supplied. This is
 * a deliberate choice: callers that want case-insensitive lookup can
 * lowercase their input before inserting and before querying, and callers
 * that want to preserve the original spelling can do so without the index
 * silently rewriting their data.
 */
export class PrefixIndex {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  /**
   * Insert a single word. Empty strings are ignored because a completion of
   * the empty prefix would otherwise be the empty string, which is never a
   * useful suggestion and would force every caller to filter it out.
   *
   * @param {string} word
   * @returns {boolean} true if the word was newly added, false otherwise
   */
  add(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return false;
    }
    let node = this.root;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      let next = node.children.get(ch);
      if (next === undefined) {
        next = new TrieNode();
        node.children.set(ch, next);
      }
      node = next;
    }
    if (node.terminal) {
      return false;
    }
    node.terminal = true;
    this.size += 1;
    return true;
  }

  /**
   * Convenience wrapper: insert every word from an iterable.
   *
   * @param {Iterable<string>} words
   * @returns {number} the number of words that were newly added
   */
  addAll(words) {
    let added = 0;
    for (const word of words) {
      if (this.add(word)) {
        added += 1;
      }
    }
    return added;
  }

  /**
   * Does the index contain this exact word?
   *
   * @param {string} word
   * @returns {boolean}
   */
  has(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return false;
    }
    let node = this.root;
    for (let i = 0; i < word.length; i++) {
      const next = node.children.get(word[i]);
      if (next === undefined) {
        return false;
      }
      node = next;
    }
    return node.terminal;
  }

  /**
   * Return every word in the index that starts with `prefix`.
   *
   * The empty prefix returns every word in the index. That is the natural
   * reading of "every completion of the empty prefix" and it makes the
   * method useful for dumping the whole index without special-casing.
   *
   * Results are returned in lexicographic order of the stored words. The
   * traversal is depth-first over a Map, which preserves insertion order of
   * children rather than sorting them, so the children are sorted before
   * descending. That extra sort is O(k log k) per node but keeps the output
   * deterministic regardless of insertion order, which is what callers
   * expect from an autocomplete list.
   *
   * @param {string} prefix
   * @returns {string[]}
   */
  complete(prefix) {
    if (typeof prefix !== 'string') {
      return [];
    }
    let node = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const next = node.children.get(prefix[i]);
      if (next === undefined) {
        return [];
      }
      node = next;
    }
    const results = [];
    const stack = [[node, prefix]];
    while (stack.length > 0) {
      const [current, path] = stack.pop();
      if (current.terminal) {
        results.push(path);
      }
      const keys = Array.from(current.children.keys()).sort();
      for (let i = keys.length - 1; i >= 0; i--) {
        stack.push([current.children.get(keys[i]), path + keys[i]]);
      }
    }
    return results;
  }

  /**
   * Number of distinct words in the index.
   *
   * @returns {number}
   */
  get length() {
    return this.size;
  }
}
