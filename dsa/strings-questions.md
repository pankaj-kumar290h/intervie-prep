# String Interview Questions — Easy → Very Very Hard

20 curated string problems with problem statements, intuition, JavaScript solutions, and
complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Valid Anagram](#1-valid-anagram)
2. [Valid Palindrome](#2-valid-palindrome)
3. [Reverse Words in a String](#3-reverse-words-in-a-string)
4. [First Unique Character in a String](#4-first-unique-character-in-a-string)
5. [Longest Common Prefix](#5-longest-common-prefix)

**Medium**
6. [Longest Substring Without Repeating Characters](#6-longest-substring-without-repeating-characters)
7. [Group Anagrams](#7-group-anagrams)
8. [Longest Palindromic Substring](#8-longest-palindromic-substring)
9. [String Compression](#9-string-compression)
10. [Zigzag Conversion](#10-zigzag-conversion)
11. [Multiply Strings](#11-multiply-strings)
12. [Decode Ways](#12-decode-ways)
13. [Implement strStr()](#13-implement-strstr)

**Hard**
14. [Minimum Window Substring](#14-minimum-window-substring)
15. [Regular Expression Matching](#15-regular-expression-matching)
16. [Wildcard Matching](#16-wildcard-matching)
17. [Text Justification](#17-text-justification)

**Very Hard**
18. [Edit Distance](#18-edit-distance)
19. [Distinct Subsequences](#19-distinct-subsequences)

**Very Very Hard**
20. [KMP / Manacher / Rabin-Karp](#20-the-boss-fight)

---

## Easy

### 1. Valid Anagram

**Problem.** Given strings `s` and `t`, return `true` if `t` is an anagram of `s` (same
characters, same multiplicities, any order).

**Intuition.** Count character frequencies in `s`, then walk `t` decrementing counts. If
any character in `t` is missing or over-decrements, it's not an anagram; the map must be
empty at the end.

```javascript
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);
  for (const ch of t) {
    if (!counts.has(ch)) return false;
    counts.set(ch, counts.get(ch) - 1);
    if (counts.get(ch) === 0) counts.delete(ch);
  }
  return counts.size === 0;
}
```

**Complexity.** Time O(n), Space O(1) for a fixed alphabet (O(k) distinct characters
otherwise). (A 26-length count array is a common lowercase-only optimization.)

---

### 2. Valid Palindrome

**Problem.** Given a string `s`, return `true` if it's a palindrome after removing all
non-alphanumeric characters and ignoring case.

**Intuition.** Two pointers closing in from both ends. Skip non-alphanumeric characters on
either side, then compare lowercase versions. No need to build a cleaned copy first.

```javascript
function isPalindrome(s) {
  const isAlnum = (c) => /[a-z0-9]/i.test(c);
  let lo = 0;
  let hi = s.length - 1;
  while (lo < hi) {
    while (lo < hi && !isAlnum(s[lo])) lo++;
    while (lo < hi && !isAlnum(s[hi])) hi--;
    if (s[lo].toLowerCase() !== s[hi].toLowerCase()) return false;
    lo++;
    hi--;
  }
  return true;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 3. Reverse Words in a String

**Problem.** Reverse the order of words in `s`. Collapse any run of whitespace between
words to a single space, and trim leading/trailing whitespace.

**Intuition.** The classic in-place trick on a char array: reverse the *entire* string
first, which flips word order but leaves each word spelled backwards. Then walk through
and reverse each word back to normal in place, writing over extra spaces as you go so runs
of whitespace collapse to one.

```javascript
function reverseArr(arr, lo, hi) {
  while (lo < hi) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    lo++;
    hi--;
  }
}

function reverseWords(s) {
  const chars = s.split("");
  reverseArr(chars, 0, chars.length - 1);

  const n = chars.length;
  let write = 0;
  let i = 0;
  while (i < n) {
    while (i < n && chars[i] === " ") i++;
    if (i === n) break;
    if (write !== 0) chars[write++] = " ";
    const start = write;
    while (i < n && chars[i] !== " ") chars[write++] = chars[i++];
    reverseArr(chars, start, write - 1);
  }
  return chars.slice(0, write).join("");
}
```

**Complexity.** Time O(n), Space O(n) (a true in-place mutable char buffer, unlike a JS
string, would make this O(1) extra). (`s.trim().split(/\s+/).reverse().join(" ")` is the
one-liner but hides the pointer technique interviewers actually want.)

---

### 4. First Unique Character in a String

**Problem.** Return the index of the first character in `s` that does not repeat. Return
`-1` if none exists.

**Intuition.** Count all characters in one pass, then scan left to right and return the
first index whose count is 1.

```javascript
function firstUniqChar(s) {
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);
  for (let i = 0; i < s.length; i++) {
    if (counts.get(s[i]) === 1) return i;
  }
  return -1;
}
```

**Complexity.** Time O(n), Space O(1) for a fixed alphabet.

---

### 5. Longest Common Prefix

**Problem.** Given an array of strings, return the longest string that is a prefix of all
of them. Return `""` if there is none.

**Intuition.** Start with the first string as the candidate prefix. For each subsequent
string, shrink the candidate from the right until it's actually a prefix of that string.

```javascript
function longestCommonPrefix(strs) {
  if (!strs.length) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}
```

**Complexity.** Time O(S) where `S` is the total number of characters across all strings,
Space O(1) extra.

---

## Medium

### 6. Longest Substring Without Repeating Characters

**Problem.** Given a string `s`, find the length of the longest substring without
repeating characters.

**Intuition.** Sliding window with a map of each character's last-seen index. When the
current character was last seen inside the window, jump the window start past that
previous occurrence instead of shrinking one step at a time.

```javascript
function lengthOfLongestSubstring(s) {
  const lastIndex = new Map();
  let start = 0;
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (lastIndex.has(ch) && lastIndex.get(ch) >= start) {
      start = lastIndex.get(ch) + 1;
    }
    lastIndex.set(ch, i);
    best = Math.max(best, i - start + 1);
  }
  return best;
}
```

**Complexity.** Time O(n), Space O(min(n, alphabet size)).

---

### 7. Group Anagrams

**Problem.** Group an array of strings into lists of anagrams.

**Intuition.** Two strings are anagrams iff their sorted character sequences are equal, so
the sorted string makes a natural hash-map key.

```javascript
function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = s.split("").sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}
```

**Complexity.** Time O(n · k log k) where `k` is max string length, Space O(n · k).
(A 26-count-array key avoids the log k sort but costs more code.)

---

### 8. Longest Palindromic Substring

**Problem.** Return the longest palindromic substring of `s`.

**Intuition.** Every palindrome has a center — either a single character (odd length) or a
gap between two characters (even length). Try expanding outward from each of the `2n - 1`
centers as long as both sides match, and track the widest expansion.

```javascript
function longestPalindrome(s) {
  if (s.length < 2) return s;
  let start = 0;
  let maxLen = 1;

  const expand = (lo, hi) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      lo--;
      hi++;
    }
    return [lo + 1, hi - lo - 1]; // [start, length]
  };

  for (let i = 0; i < s.length; i++) {
    const [s1, l1] = expand(i, i);
    if (l1 > maxLen) {
      maxLen = l1;
      start = s1;
    }
    const [s2, l2] = expand(i, i + 1);
    if (l2 > maxLen) {
      maxLen = l2;
      start = s2;
    }
  }
  return s.substr(start, maxLen);
}
```

**Complexity.** Time O(n²), Space O(1). (Manacher's gets this to O(n) — see 20b.)

---

### 9. String Compression

**Problem.** Given a character array `chars`, compress it in-place using run-length
encoding (e.g. `["a","a","b","b","c","c","c"]` → `"a2b2c3"`), and return the new length.
Groups of length 1 have no trailing count.

**Intuition.** Two pointers: `read` scans ahead to measure the length of the current run,
`write` lays down the character followed by its count's digits (only if > 1). Because
`write` never outpaces `read`, this can be done in the same array.

```javascript
function compress(chars) {
  let write = 0;
  let read = 0;
  const n = chars.length;

  while (read < n) {
    const ch = chars[read];
    let count = 0;
    while (read < n && chars[read] === ch) {
      read++;
      count++;
    }
    chars[write++] = ch;
    if (count > 1) {
      for (const digit of String(count)) {
        chars[write++] = digit;
      }
    }
  }

  chars.length = write;
  return write;
}
```

**Complexity.** Time O(n), Space O(1) extra.

---

### 10. Zigzag Conversion

**Problem.** Write `s` in a zigzag pattern across `numRows` rows, then read row by row and
return the resulting string.

**Intuition.** Simulate it directly: keep one string buffer per row, walk `s` once, and
track which row you're currently writing to, flipping direction whenever you hit the top
or bottom row.

```javascript
function convert(s, numRows) {
  if (numRows === 1) return s;
  const rows = new Array(Math.min(numRows, s.length)).fill("");
  let curRow = 0;
  let goingDown = false;

  for (const ch of s) {
    rows[curRow] += ch;
    if (curRow === 0 || curRow === numRows - 1) goingDown = !goingDown;
    curRow += goingDown ? 1 : -1;
  }
  return rows.join("");
}
```

**Complexity.** Time O(n), Space O(n).

---

### 11. Multiply Strings

**Problem.** Given two non-negative integers `num1` and `num2` as strings, return their
product as a string. `BigInt`/native big-number types are not allowed — simulate
grade-school multiplication.

**Intuition.** Multiplying digit `i` of `num1` by digit `j` of `num2` contributes to result
positions `i + j` (carry) and `i + j + 1` (digit), exactly like doing it by hand on paper.
Accumulate into a result array of size `m + n`, resolving carries as you go, then strip
leading zeros.

```javascript
function multiply(num1, num2) {
  if (num1 === "0" || num2 === "0") return "0";
  const m = num1.length;
  const n = num2.length;
  const result = new Array(m + n).fill(0);

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const mul = (num1.charCodeAt(i) - 48) * (num2.charCodeAt(j) - 48);
      const p1 = i + j;
      const p2 = i + j + 1;
      const sum = mul + result[p2];
      result[p2] = sum % 10;
      result[p1] += Math.floor(sum / 10);
    }
  }

  let start = 0;
  while (start < result.length - 1 && result[start] === 0) start++;
  return result.slice(start).join("");
}
```

**Complexity.** Time O(m · n), Space O(m + n).

---

### 12. Decode Ways

**Problem.** A digit string maps to letters via `'A' -> "1", ..., 'Z' -> "26"`. Given a
digit string `s`, count how many ways it can be decoded. `"0"` can never start a group.

**Intuition.** DP where `ways[i]` = ways to decode the prefix of length `i`. The prefix
ending at `i` can be decoded by treating the last digit alone (if nonzero) or the last two
digits together (if they form 10–26). Roll the DP into two variables instead of an array.

```javascript
function numDecodings(s) {
  const n = s.length;
  if (n === 0 || s[0] === "0") return 0;

  let prev2 = 1; // ways for empty prefix
  let prev1 = 1; // ways for prefix of length 1

  for (let i = 1; i < n; i++) {
    let curr = 0;
    if (s[i] !== "0") curr += prev1;
    const twoDigit = Number(s.slice(i - 1, i + 1));
    if (twoDigit >= 10 && twoDigit <= 26) curr += prev2;
    if (curr === 0) return 0; // dead end, no need to continue
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 13. Implement strStr()

**Problem.** Given `haystack` and `needle`, return the index of the first occurrence of
`needle` in `haystack`, or `-1` if it doesn't occur. Return `0` if `needle` is empty.

**Intuition.** The brute-force check: try every start index, compare character by
character, bail early on a mismatch. This is O(n·m) worst case (e.g. `"aaaa...a"` searching
for `"aaab"`) because a mismatch deep into a candidate window throws away all the work
already done on that window — there's no memory of partial matches. Rabin-Karp fixes this
by hashing windows to compare in O(1) amortized (see 20c); KMP fixes it by remembering
how much of the pattern already matched so it never re-reads text (see 20a). This version
is what most interviewers accept as a warm-up before asking for one of those.

```javascript
function strStr(haystack, needle) {
  const n = haystack.length;
  const m = needle.length;
  if (m === 0) return 0;

  for (let i = 0; i + m <= n; i++) {
    let j = 0;
    while (j < m && haystack[i + j] === needle[j]) j++;
    if (j === m) return i;
  }
  return -1;
}
```

**Complexity.** Time O(n · m) worst case, Space O(1).

---

## Hard

### 14. Minimum Window Substring

**Problem.** Given strings `s` and `t`, return the smallest substring of `s` that contains
every character of `t` (with at least its multiplicity in `t`). Return `""` if no such
window exists.

**Intuition.** Sliding window: expand the right edge until the window contains everything
`t` needs (`formed === required`), then greedily shrink from the left while that still
holds, recording the smallest valid window seen. Each character's need is tracked in a
map so partial matches are counted correctly.

```javascript
function minWindow(s, t) {
  if (!t.length || !s.length) return "";
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);
  const required = need.size;
  let formed = 0;
  const windowCounts = new Map();

  let lo = 0;
  let bestLen = Infinity;
  let bestStart = 0;

  for (let hi = 0; hi < s.length; hi++) {
    const ch = s[hi];
    windowCounts.set(ch, (windowCounts.get(ch) || 0) + 1);
    if (need.has(ch) && windowCounts.get(ch) === need.get(ch)) formed++;

    while (formed === required) {
      if (hi - lo + 1 < bestLen) {
        bestLen = hi - lo + 1;
        bestStart = lo;
      }
      const leftChar = s[lo];
      windowCounts.set(leftChar, windowCounts.get(leftChar) - 1);
      if (need.has(leftChar) && windowCounts.get(leftChar) < need.get(leftChar)) {
        formed--;
      }
      lo++;
    }
  }
  return bestLen === Infinity ? "" : s.substr(bestStart, bestLen);
}
```

**Complexity.** Time O(|s| + |t|), Space O(|s| + |t|) (each pointer visits `s` at most
twice, so the sliding window is amortized linear).

---

### 15. Regular Expression Matching

**Problem.** Implement regex matching with support for `.` (any single character) and `*`
(zero or more of the preceding element). The match must cover the entire input string.

**Intuition.** DP over `dp[i][j]` = does `s[0..i)` match `p[0..j)`. A `*` at `p[j-1]` gives
two options: use zero copies of the preceding element (`dp[i][j-2]`) or, if the preceding
element matches `s[i-1]`, consume one character from `s` and stay at the same pattern
position (`dp[i-1][j]`). Everything else is a straightforward character/`.` match.

```javascript
function isMatch(s, p) {
  const m = s.length;
  const n = p.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;

  for (let j = 1; j <= n; j++) {
    if (p[j - 1] === "*") dp[0][j] = dp[0][j - 2];
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === "*") {
        dp[i][j] =
          dp[i][j - 2] ||
          ((p[j - 2] === "." || p[j - 2] === s[i - 1]) && dp[i - 1][j]);
      } else if (p[j - 1] === "." || p[j - 1] === s[i - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      }
    }
  }
  return dp[m][n];
}
```

**Complexity.** Time O(m · n), Space O(m · n) (rollable to O(n) with two rows).

---

### 16. Wildcard Matching

**Problem.** Implement wildcard matching with support for `?` (any single character) and
`*` (any sequence of characters, including empty). The match must cover the entire input.

**Intuition.** Same DP shape as regex matching but `*` here means "any characters", not
"repeat the previous token". So `dp[i][j]` for a `*` combines "match zero characters here"
(`dp[i][j-1]`) with "let `*` absorb one more character of `s`" (`dp[i-1][j]`).

```javascript
function isMatchWildcard(s, p) {
  const m = s.length;
  const n = p.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;

  for (let j = 1; j <= n; j++) {
    if (p[j - 1] === "*") dp[0][j] = dp[0][j - 1];
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === "*") {
        dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
      } else if (p[j - 1] === "?" || p[j - 1] === s[i - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      }
    }
  }
  return dp[m][n];
}
```

**Complexity.** Time O(m · n), Space O(m · n) (rollable to O(n); a two-pointer greedy
solution also achieves O(m + n) but is far trickier to get right).

---

### 17. Text Justification

**Problem.** Given `words` and `maxWidth`, format the text so each line has exactly
`maxWidth` characters, padded with spaces. Words on a line are distributed evenly, with
extra spaces (when they don't divide evenly) going to the leftmost gaps first. The last
line is left-justified with no extra inter-word spacing.

**Intuition.** Greedily pack words into a line until the next word would overflow. For a
full line, spread `maxWidth - totalWordLength` spaces across the gaps as evenly as
possible, front-loading the remainder. A line with only one word, or the final line, is
just left-justified and padded on the right.

```javascript
function fullJustify(words, maxWidth) {
  const res = [];
  let line = [];
  let lineLen = 0;

  for (const word of words) {
    if (lineLen + line.length + word.length > maxWidth) {
      const spaces = maxWidth - lineLen;
      const gaps = line.length - 1;
      if (gaps === 0) {
        res.push(line[0] + " ".repeat(spaces));
      } else {
        const base = Math.floor(spaces / gaps);
        let extra = spaces % gaps;
        let built = "";
        for (let i = 0; i < line.length; i++) {
          built += line[i];
          if (i < gaps) {
            built += " ".repeat(base + (extra > 0 ? 1 : 0));
            if (extra > 0) extra--;
          }
        }
        res.push(built);
      }
      line = [];
      lineLen = 0;
    }
    line.push(word);
    lineLen += word.length;
  }

  const lastSpaces = maxWidth - lineLen - (line.length - 1);
  res.push(line.join(" ") + " ".repeat(Math.max(lastSpaces, 0)));
  return res;
}
```

**Complexity.** Time O(total characters), Space O(total characters) for the output.

---

## Very Hard

### 18. Edit Distance

**Problem.** Given `word1` and `word2`, return the minimum number of insert/delete/replace
operations to turn `word1` into `word2`.

**Intuition.** DP where `dp[i][j]` is the edit distance between the first `i` characters of
`word1` and the first `j` of `word2`. Matching characters cost nothing and carry over the
diagonal; otherwise take the best of insert, delete, or replace, each costing 1 plus a
smaller subproblem.

```javascript
function minDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}
```

**Complexity.** Time O(m · n), Space O(m · n) (rollable to O(min(m, n))).

---

### 19. Distinct Subsequences

**Problem.** Given strings `s` and `t`, count the number of distinct subsequences of `s`
that equal `t`.

**Intuition.** `dp[j]` = number of ways to form `t[0..j)` using the prefix of `s` processed
so far. For each character of `s`, iterate `j` from `n` down to `1`: if `s[i-1] === t[j-1]`,
every way to form `t[0..j-1)` can be extended by matching this character, so
`dp[j] += dp[j-1]`. Iterating `j` backward reuses one array instead of a full 2D table.

```javascript
function numDistinct(s, t) {
  const m = s.length;
  const n = t.length;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1; // empty t is always formed exactly one way

  for (let i = 1; i <= m; i++) {
    for (let j = n; j >= 1; j--) {
      if (s[i - 1] === t[j - 1]) dp[j] += dp[j - 1];
    }
  }
  return dp[n];
}
```

**Complexity.** Time O(m · n), Space O(n) (O(m · n) space with the full 2D table, which
also makes the recurrence easier to derive first).

---

## Very Very Hard

### 20. The Boss Fight

Three classic string-matching algorithms interviewers reach for when they want to see if
you actually understand *why* naive matching is slow, not just that you can code around it.

#### 20a. Implement KMP Pattern Matching from scratch

**Problem.** Given `text` and `pattern`, return all starting indices where `pattern`
occurs in `text`, without using built-in substring search.

**Intuition.** Naive matching re-scans text after every mismatch, discarding useful
information: if 5 characters matched before a mismatch, we already know those 5 characters
of `text`, so we shouldn't have to re-read them. KMP precomputes an LPS ("longest
proper prefix that is also a suffix") array for the pattern itself. `lps[i]` tells you, if
a mismatch happens right after matching `pattern[0..i]`, how far back in the pattern you
can safely resume — no need to move the text pointer backward at all. This makes matching
O(n + m): the text pointer only ever moves forward.

```javascript
function buildLPS(pattern) {
  const lps = new Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else if (len > 0) {
      len = lps[len - 1];
    } else {
      lps[i] = 0;
      i++;
    }
  }
  return lps;
}

function kmpSearch(text, pattern) {
  if (pattern.length === 0) return [0];
  const lps = buildLPS(pattern);
  const matches = [];
  let i = 0;
  let j = 0;

  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
      if (j === pattern.length) {
        matches.push(i - j);
        j = lps[j - 1];
      }
    } else if (j > 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  return matches;
}
```

**Complexity.** Time O(n + m) (building the LPS array is O(m), the scan is O(n) since `i`
never decreases), Space O(m) for the LPS array.

---

#### 20b. Manacher's Algorithm for Longest Palindromic Substring

**Problem.** Same problem as #8 — find the longest palindromic substring — but in O(n)
instead of O(n²).

**Intuition.** The O(n²) expand-around-center approach (#8) recomputes each center's
palindrome radius from scratch, ignoring information from previous centers. Manacher's
inserts separator characters (`#`) between every letter (and sentinels at the ends) so odd
and even-length palindromes are handled uniformly, then tracks the rightmost palindrome
boundary found so far along with its center. When processing a new center inside that
boundary, its palindrome radius can be initialized using its "mirror" center's already-
known radius (reflected across the current center) instead of starting from zero — the
radius only ever needs to expand past the previously known boundary, and each character is
visited a bounded number of times overall.

```javascript
function longestPalindromeManacher(s) {
  if (s.length === 0) return "";
  const t = "^#" + s.split("").join("#") + "#$";
  const n = t.length;
  const p = new Array(n).fill(0);
  let center = 0;
  let right = 0;

  for (let i = 1; i < n - 1; i++) {
    if (i < right) {
      p[i] = Math.min(right - i, p[2 * center - i]);
    }
    while (t[i + p[i] + 1] === t[i - p[i] - 1]) p[i]++;
    if (i + p[i] > right) {
      center = i;
      right = i + p[i];
    }
  }

  let maxLen = 0;
  let centerIndex = 0;
  for (let i = 1; i < n - 1; i++) {
    if (p[i] > maxLen) {
      maxLen = p[i];
      centerIndex = i;
    }
  }
  const start = (centerIndex - maxLen) / 2;
  return s.substr(start, maxLen);
}
```

**Complexity.** Time O(n) (`right` only ever moves forward, bounding total expansion work
across all centers), Space O(n) for the transformed string and radius array — a genuine
improvement over #8's O(n²).

---

#### 20c. Rabin-Karp Substring Search with Rolling Hash

**Problem.** Given `text` and `pattern`, return all starting indices where `pattern`
occurs, using a rolling hash instead of character-by-character comparison at every
position.

**Intuition.** Hash each length-`m` window of `text` and compare it to the hash of
`pattern`. The trick is computing the next window's hash from the current one in O(1):
subtract the outgoing character's contribution, shift, and add the incoming character
(a "rolling" hash), rather than rehashing the whole window. Because hashes can collide,
never trust a hash match alone — always verify with an actual substring comparison before
reporting a match. Using a large prime modulus keeps collisions rare in practice.

```javascript
function rabinKarpSearch(text, pattern) {
  const n = text.length;
  const m = pattern.length;
  if (m === 0) return [0];
  if (m > n) return [];

  const base = 256n;
  const mod = 1000000007n;

  let patternHash = 0n;
  let windowHash = 0n;
  let highOrder = 1n; // base^(m-1) mod mod, for removing the leading digit

  for (let i = 0; i < m - 1; i++) highOrder = (highOrder * base) % mod;

  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * base + BigInt(pattern.charCodeAt(i))) % mod;
    windowHash = (windowHash * base + BigInt(text.charCodeAt(i))) % mod;
  }

  const matches = [];
  for (let i = 0; i <= n - m; i++) {
    if (windowHash === patternHash && text.substr(i, m) === pattern) {
      matches.push(i); // hash matched — verify to rule out a collision
    }
    if (i < n - m) {
      windowHash =
        (((windowHash - BigInt(text.charCodeAt(i)) * highOrder) % mod) + mod) *
          base +
        BigInt(text.charCodeAt(i + m));
      windowHash %= mod;
    }
  }
  return matches;
}
```

**Complexity.** Time O(n + m) average (each roll is O(1), verification is rare with a good
hash), O(n · m) worst case if an adversarial input causes many collisions, Space O(1) extra
beyond the input.

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| Hash map frequency counting | 1, 4, 7 |
| Two pointers | 2, 3 |
| Sliding window | 6, 14 |
| Expand around center / palindromes | 8, 20b |
| DP on two strings | 15, 16, 18, 19 |
| DP on one string (linear states) | 9 (greedy scan), 12 |
| Grade-school simulation | 11, 17 |
| String matching / pattern search | 13, 20a, 20c |
| Row/greedy simulation | 10 |

**Recommended progression:** 1 → 4 → 2 → 5 → 3 → 7 → 6 → 9 → 13 → 8 → 20b → 20a → 20c →
10 → 12 → 11 → 14 → 15 → 16 → 17 → 18 → 19.
