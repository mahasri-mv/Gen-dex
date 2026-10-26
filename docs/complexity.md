# Time Complexity & Memory Analysis

This document provides rigorous Big-O complexity derivations, space analysis, and theoretical vs practical memory comparisons for the **Genomic Wavelet Tree Index**.

---

## 1. Tree Height Derivation

Traditional search trees (Binary Search Tree, AVL Tree, Red-Black Tree) are partitioned over sequence elements or keys, causing their height to scale with the dataset size:
$$H_{\text{AVL}} \approx 1.44 \log_2 n$$
For a standard sequencing dataset with $n = 10^9$ bases, an AVL tree has a height between 30 and 43 levels.

In contrast, the **Wavelet Tree** is partitioned strictly over the alphabet $\Sigma$:
$$\Sigma = \{\#, A, C, G, N, T\}, \quad \sigma = |\Sigma| = 6$$
The tree is a balanced binary tree over $\sigma$ distinct symbols. Its height is:
$$H = \lceil \log_2 \sigma \rceil = \lceil \log_2 6 \rceil = 3$$

> **Key Theoretical Result**: The Wavelet Tree's height is completely constant with respect to sequence length $n$. Whether indexing $10^3$ bases or $10^9$ bases, any query visits **at most 3 levels**.

---

## 2. Operation Complexities

| Operation | Time Complexity | Space Complexity | Rationale & Proof |
| :--- | :--- | :--- | :--- |
| **BUILD** | $O(n \log \sigma)$ | $n \lceil \log_2 \sigma \rceil$ bits | 3 levels; at level $d$, each of the $n$ symbols is inspected once. Rank tables built in one pass. |
| **ACCESS(i)** | $O(\log \sigma) = 3$ | $O(1)$ | 3 steps. At each level, reads 1 bit in $O(1)$ and calculates 1 rank query in $O(1)$ time. |
| **RANK(c, i)** | $O(\log \sigma) = 3$ | $O(1)$ | 3 steps. Decides routing bit in $O(1)$ and computes 1 rank query in $O(1)$ time. |
| **SELECT(c, k)** | $O(\log \sigma \cdot \log n)$ | $O(1)$ | Ascends 3 levels from leaf to root. In each parent, binary search over cumulative word counts takes $O(\log(n/64)) = O(\log n)$. |
| **COUNT-BASE(c)** | $O(\log \sigma) = 3$ | $O(1)$ | Evaluated as $\text{RANK}(c, n)$. Exactly 3 steps. |
| **RANGE-COUNT(c, s, e)**| $O(\log \sigma) = 6$ | $O(1)$ | Evaluated as $\text{RANK}(c, e) - \text{RANK}(c, s)$. Exactly 2 RANK calls. |
| **READ-COUNT()** | $O(\log \sigma) = 3$ | $O(1)$ | $\text{RANK}(\#, n)$. |
| **READ-START(k)** | $O(\log \sigma \cdot \log n)$ | $O(1)$ | $\text{SELECT}(\#, k) + 1$. |
| **READ-END(k)** | $O(\log \sigma \cdot \log n)$ | $O(1)$ | $\text{SELECT}(\#, k + 1)$. |
| **READ-OF(pos)** | $O(\log \sigma) = 3$ | $O(1)$ | $\text{RANK}(\#, pos)$. |
| **EXTRACT-READ(k)** | $O(L \log \sigma) = 3L$ | $O(L)$ output | Reconstructs $L$ bases via $L$ successive `ACCESS` calls. Touches only the target read. |
| **GC-CONTENT(k)** | $O(\log \sigma) = 12$ | $O(1)$ | Exactly 4 `RANK` calls. Completely independent of read length $L$! |
| **FIND(P)** | $O((m + \text{cnt} \cdot m) \log \sigma)$ | $O(\text{matches})$ | $m$ is pattern length; $\text{cnt}$ is frequency of rarest character. Prunes mismatches early. |

---

## 3. Storage Footprint: Theoretical vs Java Implementation

### 3.1 Theoretical Baseline
- **Plain 8-bit ASCII**: $8n$ bits.
- **2-bit Packed Array**: $2n$ bits (no query capability).
- **Theoretical Wavelet Tree**: 
  $$S_{\text{theoretical}} = n \lceil \log_2 \sigma \rceil = 3n \text{ bits}$$
  For $n = 10^9$ bases:
  $$\text{ASCII} = 1 \text{ GB}$$
  $$\text{Wavelet Tree} = 375 \text{ MB}$$

### 3.2 Rank Metadata Storage
Our `BitVector` packs bits into `long[]` words (64 bits per word). 
To achieve $O(1)$ RANK queries, we maintain a precomputed cumulative prefix array:
$$\text{prefixRanks} = \text{new int}[numWords + 1]$$
- Size of `prefixRanks`: 32 bits per 64 bits = **50% extra overhead**.
- Total bit-vector + rank table storage:
  $$3n + 1.5n = 4.5n \text{ bits}$$
  Still nearly **half the size** of plain uncompressed ASCII (8 bits per base)!

### 3.3 Java JVM Heap Overhead
In Java, objects incur memory overhead:
- Standard 64-bit JVM Object Header: 16 bytes.
- Primitive array headers: 16 bytes + length reference (4 bytes).
- 11 `WaveletTreeNode` references + pointers: ~1 KB total tree scaffolding.
Because there are only **11 nodes** in total, node object overhead is virtually negligible ($\approx 1$ KB) compared to the primary bit arrays!

---

## 4. Comprehensive Comparison Table

| Metric / Feature | Plain Array | BST | AVL Tree | Suffix Array | Wavelet Tree (Ours) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Node Count** | $0$ (single array) | $n$ nodes | $n$ nodes | Auxiliary array | **11 nodes** (fixed: $2\sigma - 1$) |
| **Tree Height** | N/A | Up to $n$ | 30 to 43 | N/A | **3 levels** (fixed) |
| **Memory per Base** | 8 bits | ~200 bits | ~250+ bits | 32 to 64 bits | **~4.5 bits (bits + rank)** |
| **Memory for $10^9$ Bases** | 1 GB | ~25 GB | ~31 GB | 4 to 8 GB | **~560 MB** |
| **Base Counting (RANK)** | $O(n)$ full scan | $O(n)$ | $O(\log n)$ (with counters) | Not supported | **$O(\log \sigma) = 3$ steps** |
| **Occurrence (SELECT)** | $O(n)$ scan | $O(n)$ | $O(\log n)$ (needs 5 trees) | Not supported | **$O(\log \sigma \cdot \log n)$** |
| **Read Extraction** | Direct array slice | Inorder traversal | Inorder traversal | N/A | **Iterative ACCESS in $O(L)$** |
| **DNA Motif Search** | $O(n \cdot m)$ | Not natural | Not natural | $O(m \log n)$ | **$O((m + \text{cnt} \cdot m) \log \sigma)$** |
| **Auxiliary Index Needed?**| No | No | No | Yes (sits beside text) | **No (self-indexing)** |
| **Academic Suitability**| Low | Low | Medium | High | **Exceptional** |
