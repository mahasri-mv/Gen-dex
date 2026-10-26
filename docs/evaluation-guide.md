# Faculty Evaluation Guide & Viva Preparation

**Evaluation Rubric Guide & Viva Preparation**  
*Project: Compressed Genomic Sequence Indexing Using a Wavelet Tree*

---

## 1. Five-Minute Faculty Demonstration Script

### Minute 1: Problem Definition & Data Structure Justification
- *"Good morning/afternoon, Professors. In high-throughput genomics, FASTQ files contain millions of short DNA reads. Storing plain sequences or maintaining secondary indices like Suffix Arrays or hash tables consumes massive memory."*
- *"We solved this by constructing a single succinct **Wavelet Tree** over all reads joined into one sequence $S = \text{read}_0\#\text{read}_1\#\dots\#\text{read}_{r-1}\#$."*
- *"Why a Wavelet Tree? Traditional trees like BST or AVL branch over sequence positions, requiring nodes and pointers for every base ($H_{\text{AVL}} \approx 30 \text{ to } 43$, memory $\approx 25 \text{ GB}$). A Wavelet Tree branches over the **alphabet** $\Sigma = \{\#, A, C, G, N, T\}$ ($\sigma = 6$), so its height is strictly $\lceil \log_2 6 \rceil = 3$ regardless of dataset size!"*

### Minute 2: Authentication, Role-Based Access Control & Dataset Isolation
- *"For enterprise deployment, we engineered a secure Authentication & RBAC system with zero third-party dependencies:"*
  - **PBKDF2 Password Hashing**: `PBKDF2WithHmacSHA256` with 65,536 iterations and 16-byte random salts.
  - **Dataset Isolation**: Every user session receives a dedicated `IndexManager` in memory, isolating custom genomic datasets completely between users.
  - **Demonstration Accounts**: Click any pre-seeded quick-fill button on the Sign In modal (`Admin`, `Researcher`, `Lab Tech`, `Clinical`, `Student`).
- *"Sign in as Administrator (`admin@genomicdemo.local` / `AdminDemo@2026!`) to unlock the **Admin Dashboard** tab, displaying registered user statuses, system health, and real-time security audit trails."*

### Minute 3: Live Verification of Sample Dataset & Tree Visualization
- Open the web application at `http://localhost:8080`.
- Load the official sample dataset (`GATTACA`, `CAGT`, `TTAGC`):
  - Total reads = 3, indexed symbols = 19, DNA bases = 16.
- In the **Wavelet Tree Visualizer** tab:
  - Show the 11 actual nodes (5 internal nodes with packed bit-vectors + 6 terminal leaves).
- In the **Operations Lab** tab:
  1. Run `ACCESS(10)` $\implies$ Expected: `'G'`. Actual: `'G'`. Highlight the animated top-down traversal in the SVG visualizer.
  2. Run `RANK('T', 12)` $\implies$ Expected: `3`. Actual: `3`.
  3. Run `SELECT('A', 3)` $\implies$ Expected: `6`. Actual: `6`.
  4. Run `EXTRACT-READ(1)` $\implies$ Expected: `"CAGT"`. Actual: `"CAGT"`.
  5. Run `GC-CONTENT(2)` $\implies$ Expected: `40.0%`. Actual: `40.0%`.

### Minute 4: DNA Pattern Search via Rarest-Character Heuristic
- Show the **DNA Pattern Search** tab.
- Search pattern `"AGC"` $\implies$ Match found: Read 2, offset 2, global position 15.
- *"How do we search without a suffix array? We use the Rarest-Character Heuristic:"*
  1. Compute frequencies of characters in pattern $P$ via `RANK`.
  2. Pick the rarest letter $a = P[r]$ (for `"AGC"`, G occurs 3 times, while A occurs 5 times, so G is rarest).
  3. Locate candidate positions using `SELECT(G, j) - r`.
  4. Verify candidate positions using `ACCESS`, immediately pruning mismatches and preventing candidates from crossing `#` delimiters.
  5. Time complexity: $O((m + \text{cnt} \cdot m) \log \sigma)$.

### Minute 5: Edge-Case Handling & Automated Test Suite
- Open terminal and run `test.bat`:
  - Show the **1,608 Wavelet Tree algorithmic tests** and **30 Authentication/RBAC tests** (100% pass rate).
  - Point out that test cases cover: malformed FASTQ headers, lowercase DNA, length mismatches, out-of-bounds positions, empty files, brute-force fuzz testing, PBKDF2 verification, login rate limiting, and dataset isolation.

---

## 2. Expected Faculty Viva Questions & Answers

### Q1: Why is the Wavelet Tree superior to an AVL Tree for DNA sequence indexing?
> **Answer**: An AVL Tree indexes elements by position, requiring a node with left/right pointers, height balance factor, and character counters for every single base (costing ~250+ bits per base). For $10^9$ bases, an AVL tree needs ~25 GB of RAM and has height ~30 to 43. 
> The Wavelet Tree indexes the alphabet $\Sigma = \{\#, A, C, G, N, T\}$ ($\sigma = 6$), so its height is fixed at $\lceil \log_2 6 \rceil = 3$ levels. It requires only 11 nodes in total and uses packed bit-vectors (~4.5 bits per base including rank tables).

### Q2: Why did you use `#` separators instead of building one Wavelet Tree per read?
> **Answer**: Building one Wavelet Tree per read would create thousands or millions of individual tree instances, incurring massive JVM object header overhead (at least 16 to 48 bytes per node), and would make global base counting or cross-read pattern searching impossible. By joining reads into a unified sequence $S = \text{read}_0\#\dots\#\text{read}_{r-1}\#$, read boundaries become part of the same sequence. `READ-COUNT()` is simply `RANK('#', n)`, `READ-START(k)` is `SELECT('#', k) + 1`, and `READ-OF(pos)` is `RANK('#', pos)` — requiring zero auxiliary boundary arrays.

### Q3: What is the exact time complexity of your SELECT implementation?
> **Answer**: In our `BitVector.java`, bits are stored in 64-bit words (`long[]`). We precompute cumulative 1-bit counts for every word. To find the $k$-th occurrence, we perform a binary search over the word array to find the word containing the target occurrence in $O(\log(n / 64)) = O(\log n)$ time, followed by an $O(1)$ scan within the 64-bit word. Ascending 3 levels from leaf to root yields a total SELECT complexity of $O(\log \sigma \cdot \log n)$.

### Q4: Does GC-CONTENT depend on the read length?
> **Answer**: No! Using the Wavelet Tree, GC content is computed using the formula:
> $$\text{GC\%} = \frac{\text{RANGE-COUNT}('G', s, e) + \text{RANGE-COUNT}('C', s, e)}{e - s} \times 100$$
> Since each `RANGE-COUNT` call requires 2 `RANK` calls, GC content requires exactly $2 + 2 = 4$ `RANK` calls, taking $O(\log \sigma) = 12$ steps total, completely independent of whether the read is 5 bases or 50,000 bases long.

### Q5: How do you guarantee a pattern match never spans two adjacent reads?
> **Answer**: 
> 1. FASTQ validation guarantees patterns contain only nucleotides $\{A, C, G, N, T\}$ and never `#`.
> 2. During candidate verification in `FIND`, every position is checked via `ACCESS(start + t)`. If any character is `#`, the candidate is immediately rejected.
> 3. We additionally verify `READ-OF(start) == READ-OF(start + m - 1)`, ensuring the match is strictly contained within a single read.

### Q6: How is user data isolated between different researchers?
> **Answer**: The server creates a dedicated server-side session for each user via HttpOnly cookies. Every active session references its own distinct `IndexManager` instance. When a researcher uploads a private FASTQ dataset, only their private `IndexManager` is mutated and rebuilt; other logged-in researchers or guest users continue accessing their own isolated datasets independently.
