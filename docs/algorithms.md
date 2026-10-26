# Algorithmic Specifications & Mathematical Formulations

This document provides formal algorithmic specifications, pseudocode, mathematical derivations, and worked examples for all operations implemented in the **Genomic Wavelet Tree Index**.

---

## 1. OPERATION 1: BUILD(reads)

### 1.1 Specification
- **Input**: A collection of $r$ DNA reads over $\{A, C, G, N, T\}$.
- **Output**: A fully initialized Wavelet Tree over concatenated sequence $S$.
- **Alphabet**: $\Sigma = \{\#, A, C, G, N, T\}$, $\sigma = 6$, height $H = \lceil \log_2 6 \rceil = 3$.

### 1.2 Pseudocode
```text
function BUILD(reads):
    S ← reads[0] + "#" + reads[1] + "#" + ... + reads[r-1] + "#"
    n ← length of S
    root ← WT-BUILD(Σ, S, 0)
    discard raw string S
    return root

function WT-BUILD(syms, seq, depth):
    node ← new WaveletTreeNode(syms, depth)
    if |syms| == 1:
        mark node as leaf for syms[0]
        return node

    h ← ceil(|syms| / 2)
    lower ← syms[0 .. h-1]
    upper ← syms[h .. |syms|-1]

    bits ← new bit array of length |seq|
    leftSeq ← empty string
    rightSeq ← empty string

    for i ← 0 to |seq| - 1:
        x ← seq[i]
        if x in upper:
            bits[i] ← 1
            append x to rightSeq
        else:
            bits[i] ← 0
            append x to leftSeq

    node.bitVector ← new BitVector(bits)
    node.left  ← WT-BUILD(lower, leftSeq, depth + 1)
    node.right ← WT-BUILD(upper, rightSeq, depth + 1)
    return node
```

### 1.3 Worked Example
Reads: `GATTACA`, `CAGT`, `TTAGC`  
$S = \text{GATTACA\#CAGT\#TTAGC\#}$, $n = 19$.  
Root covers `{#, A, C, G, N, T}`:
- Lower: `{#, A, C}`, Upper: `{G, N, T}`
- Root Bit-Vector: `1 0 1 1 0 0 0 0 0 0 1 1 0 1 1 0 1 0 0` (11 zeros, 8 ones).

---

## 2. OPERATION 2: ACCESS(i)

### 2.1 Specification
- **Precondition**: $0 \le i < n$.
- **Postcondition**: Returns symbol $S[i]$.
- **Time Complexity**: $O(\log \sigma) = 3$ steps.

### 2.2 Pseudocode
```text
function ACCESS(i):
    node ← root
    while node is not a leaf:
        b ← node.bitVector.access(i)
        i ← node.bitVector.rank(b, i)    // child index
        node ← (b == 0) ? node.left : node.right
    return node.leafSymbol
```

### 2.3 Worked Example: ACCESS(10)
1. At Root: bit at index 10 is `1` $\implies$ route Right.
   `rank(1, 10) = 3` (three 1-bits precede index 10 at 0, 2, 3).
2. At Node `{G, N, T}`:
   Index in right child is 3. Bit at index 3 is `0` $\implies$ route Left.
3. At Node `{G, N}`:
   Lower is `{G}`, Upper is `{N}`.
   Leaf reached is `'G'`.
4. Output: `S[10] = 'G'`.

---

## 3. OPERATION 3: RANK(c, i)

### 3.1 Specification
- **Precondition**: $c \in \Sigma$, $0 \le i \le n$.
- **Postcondition**: Returns count of occurrences of $c$ in prefix $S[0 .. i-1]$.
- **Time Complexity**: $O(\log \sigma) = 3$ steps.

### 3.2 Pseudocode
```text
function RANK(c, i):
    node ← root
    while node is not a leaf:
        b ← (c is in upper half of node.symbols) ? 1 : 0
        i ← node.bitVector.rank(b, i)
        node ← (b == 0) ? node.left : node.right
    return i
```

### 3.3 Worked Example: RANK('T', 12)
Prefix $S[0 .. 11] = \text{GATTACA\#CAGT}$.
1. At Root: 'T' is in upper half `{G, N, T}` $\implies b = 1$.
   `rank(1, 12) = 5`.
2. At Node `{G, N, T}`: 'T' is in upper half `{T}` $\implies b = 1$.
   `rank(1, 5) = 3`.
3. Output: `3` (Ts at indices 2, 3, 11).

---

## 4. OPERATION 4: SELECT(c, k)

### 4.1 Specification
- **Precondition**: $c \in \Sigma$, $1 \le k \le \text{RANK}(c, n)$.
- **Postcondition**: Returns 0-based position of the $k$-th occurrence of $c$ in $S$.
- **Time Complexity**: $O(\log \sigma \cdot \log n)$.

### 4.2 Pseudocode
```text
function SELECT(c, k):
    node ← leaf of symbol c
    j ← k
    while node is not root:
        parent ← node.parent
        b ← (node == parent.left) ? 0 : 1
        j ← parent.bitVector.select(b, j) + 1
        node ← parent
    return j - 1
```

### 4.3 Worked Example: SELECT('A', 3)
1. Start at Leaf 'A'. Parent is `{#, A}`.
   'A' is right child ($b = 1$). $k = 3$.
   In `{#, A}`, 3rd 1-bit is at index 2 $\implies j = 2 + 1 = 3$.
2. Ascend to Node `{#, A, C}`:
   `{#, A}` is left child ($b = 0$).
   In `{#, A, C}`, 3rd 0-bit is at index 3 $\implies j = 3 + 1 = 4$.
3. Ascend to Root:
   `{#, A, C}` is left child ($b = 0$).
   In Root, 4th 0-bit is at index 6 $\implies j = 6 + 1 = 7$.
4. Return $j - 1 = 7 - 1 = 6$.
   Verified: $S[6] = \text{'A'}$.

---

## 5. OPERATION 5: COUNT-BASE(c)

- **Formula**:
  $$\text{COUNT-BASE}(c) = \text{RANK}(c, n)$$
- **Complexity**: $O(\log \sigma) = 3$ steps.

---

## 6. OPERATION 6: RANGE-COUNT(c, start, end)

- **Formula**:
  $$\text{RANGE-COUNT}(c, s, e) = \text{RANK}(c, e) - \text{RANK}(c, s)$$
- **Complexity**: $O(\log \sigma) = 2 \times \text{RANK}$.

---

## 7. READ BOUNDARIES: READ-COUNT, READ-START, READ-END, READ-OF

### 7.1 READ-COUNT()
- **Formula**: $\text{RANK}(\#, n)$
- Returns total number of reads in the index.

### 7.2 READ-START(k)
- **Formula**:
  $$\text{READ-START}(k) = \begin{cases} 0 & \text{if } k = 0 \\ \text{SELECT}(\#, k) + 1 & \text{if } k > 0 \end{cases}$$

### 7.3 READ-END(k)
- **Formula**:
  $$\text{READ-END}(k) = \text{SELECT}(\#, k + 1)$$
- Returns the position of the terminating `#` delimiter.

### 7.4 READ-OF(pos)
- **Formula**:
  $$\text{READ-OF}(pos) = \text{RANK}(\#, pos)$$
- If $S[pos] == \#$, position is the delimiter ending read $\text{READ-OF}(pos) - 1$.

---

## 8. OPERATION 11: EXTRACT-READ(k)

### 8.1 Specification
Reconstructs the original sequence of read $k$ character-by-character from the tree.

### 8.2 Pseudocode
```text
function EXTRACT-READ(k):
    s ← READ-START(k)
    e ← READ-END(k)
    out ← empty string
    for pos ← s to e - 1:
        out ← out + ACCESS(pos)
    return out
```
- **Complexity**: $O(L \log \sigma)$, where $L = e - s$ is the read length.

---

## 9. OPERATION 12: GC-CONTENT(k)

### 9.1 Specification
Calculates the GC percentage of read $k$.

### 9.2 Formula
$$s = \text{READ-START}(k), \quad e = \text{READ-END}(k)$$
$$\text{GC\%} = \frac{\text{RANGE-COUNT}(G, s, e) + \text{RANGE-COUNT}(C, s, e)}{e - s} \times 100$$
- **Complexity**: Exactly 4 `RANK` calls $\implies O(\log \sigma)$, completely independent of read length!

---

## 10. OPERATION 13: FIND(pattern) — Rarest-Character Heuristic

### 10.1 Specification
Searches for all exact occurrences of a pattern $P$ of length $m$ strictly within individual reads without using suffix arrays.

### 10.2 Algorithm Steps
1. Validate pattern: $P \in \{A, C, G, N, T\}^m$.
2. For each unique symbol $c \in P$, compute $\text{COUNT-BASE}(c) = \text{RANK}(c, n)$.
3. Select the rarest symbol $a = P[r]$ having minimal count $\text{cnt}$.
4. If $\text{cnt} == 0$, return empty list immediately.
5. For $j = 1$ to $\text{cnt}$:
   - Candidate global start: $\text{start} = \text{SELECT}(a, j) - r$.
   - Bounds check: $0 \le \text{start} \le n - m$.
   - Verify candidate character-by-character using $\text{ACCESS}(\text{start} + t)$:
     - If $\text{ACCESS}(\text{start} + t) == \#$, reject (crosses read boundary).
     - If $\text{ACCESS}(\text{start} + t) \ne P[t]$, reject (mismatch).
   - If verified, map to read coordinates:
     - $k = \text{READ-OF}(\text{start})$
     - $\text{offset} = \text{start} - \text{READ-START}(k)$
     - Record match $(k, \text{offset}, \text{start})$.

### 10.3 Complexity
- Finding rarest char: $O(m \log \sigma)$.
- Candidate enumeration: $\text{cnt}$ candidates.
- Candidate verification: At most $m$ `ACCESS` calls per candidate (average $\ll m$ due to early mismatch pruning).
- **Total Time**: $O((m + \text{cnt} \cdot m) \log \sigma)$.
