# trie-autocomplete-prefix-index

Builds a trie from a word list and returns matching completions for a given prefix.

```js
import { PrefixIndex } from './src/index.js';

const index = new PrefixIndex();
index.addAll(['car', 'cart', 'cat', 'dog']);

index.add('cargo'); // true
index.add('car');   // false, already present

index.complete('car'); // ['car', 'cargo', 'cart']
index.complete('ca');  // ['car', 'cargo', 'cart', 'cat']
index.complete('z');   // []
index.has('cat');      // true
index.length;          // 5
```

## Why this exists

Autocomplete over a fixed word list is a small problem, but the obvious
implementations get two things wrong. Scanning the list on every keystroke is
O(n) per query and becomes noticeable once the list is large. Returning
results in insertion order makes the suggestion list jump around as the data
source changes. This library walks a trie once per query and returns results
in lexicographic order, so the cost is proportional to the size of the
matching subtree rather than the whole word list, and the output is stable.

The trade-off is memory: every distinct prefix gets a node, so a list of
words that share few prefixes uses more space than the list itself. For the
sizes an autocomplete box usually deals with that is a fine exchange for
predictable query time and ordering.

## What it does not do

Lookups are case-sensitive. The index stores words exactly as supplied and
matches prefixes exactly. If you want case-insensitive behaviour, lowercase
your words before `add`/`addAll` and lowercase the prefix before `complete`.
Doing the folding inside the library would either lose the original spelling
or require a second mapping, and neither is obviously right for every caller.

Empty strings are ignored by `add`, and `complete('')` returns every word in
the index. That combination is deliberate: the empty string is never a useful
suggestion, and an empty prefix is the natural way to dump the whole index.

## API

- `new PrefixIndex()`
- `add(word)` — returns `true` if the word was newly added, `false` if it was
  already present or was not a non-empty string.
- `addAll(words)` — adds each word from an iterable; returns the count of
  newly added words.
- `has(word)` — returns `true` if the exact word is in the index.
- `complete(prefix)` — returns a sorted array of every word starting with
  `prefix`. Non-string prefixes return `[]`.
- `length` — the number of distinct words in the index.
