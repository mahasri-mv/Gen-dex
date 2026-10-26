# Compressed Genomic Sequence Indexing Using a Wavelet Tree
### Fast DNA Pattern Search over FASTQ Data Using a Single Wavelet Tree

An enterprise-grade, high-throughput genomic sequence indexing platform featuring succinct data structures and a secure authentication & Role-Based Access Control (RBAC) architecture.

---

## Abstract & Problem Statement

High-throughput genomic sequencing pipelines routinely generate massive FASTQ files containing millions of short DNA reads. Typical downstream analysis requires answering fundamental questions:
1. What is the frequency of a particular nucleotide base across the whole dataset?
2. What is the base composition and GC content of a specific read?
3. Where does the $k$-th occurrence of a nucleotide appear?
4. Where does a specific DNA motif or pattern appear within any read?

Traditional indexing structures exhibit severe drawbacks:
- **Plain text arrays** require an $O(n)$ scan for every single query.
- **Prefix-sum tables** require five separate 32-bit count arrays (~160 bits per base), consuming huge amounts of memory.
- **Binary Search Trees (BST)** degenerate into linear chains of height $n$ on ordered genomic data.
- **AVL Trees** require pointers and counters at every node (~250+ bits per base), yielding a height of 30 to 43 and ~25 GB of RAM for $10^9$ bases.
- **Suffix Arrays and Hash-based k-mer indices** act as auxiliary secondary indices that sit beside the text, multiplying storage requirements.

### The Wavelet Tree Solution
This platform implements a **single, unified Wavelet Tree** constructed over all DNA reads concatenated together with `#` separator delimiters:
$$S = \text{read}_0\#\text{read}_1\#\dots\#\text{read}_{r-1}\#$$

Over the canonical genomic alphabet:
$$\Sigma = \{\#, A, C, G, N, T\} \quad (\sigma = 6)$$
Ordering:
$$\# < A < C < G < N < T$$

Because the alphabet size $\sigma = 6$ is small, the tree has a fixed height of:
$$H = \lceil \log_2 6 \rceil = 3$$
regardless of whether the file contains $10^3$ or $10^9$ bases!

Every single operation — base counting (`COUNT-BASE`), interval counting (`RANGE-COUNT`), read counting (`READ-COUNT`), read boundary detection (`READ-START`, `READ-END`, `READ-OF`), read reconstruction (`EXTRACT-READ`), GC calculation (`GC-CONTENT`), and DNA pattern searching (`FIND`) — is answered **strictly using the three fundamental primitives: ACCESS, RANK, and SELECT** on that single tree. Zero auxiliary persistent indices are stored.

---

## Authentication & Role-Based Access Control (RBAC)

The platform is fortified with an enterprise authentication and access control subsystem implemented in pure Java SE with zero third-party framework overhead:

### Security Highlights
- **Cryptographic Password Hashing**: PBKDF2 with HMAC-SHA256 (`PBKDF2WithHmacSHA256`), 65,536 iterations, 16-byte cryptographically secure random salt, and constant-time `MessageDigest.isEqual` comparison to mitigate timing attacks.
- **Per-User Dataset Isolation**: Each authenticated user session is allocated its own private, isolated `IndexManager` instance in server memory. Uploaded FASTQ datasets and tree indices are completely separated between users.
- **Server-Side Session Management**: Secure HttpOnly, SameSite=Lax session cookies with cryptographically strong 32-byte tokens.
- **Cross-Site Request Forgery (CSRF) Protection**: Unique per-session CSRF tokens validated on all state-mutating requests (`POST`).
- **Brute-Force Rate Limiting & Account Lockout**: 5 consecutive failed login attempts trigger an automatic 15-minute account lockout with audit log registration.
- **Password Reset Mechanism**: Cryptographically signed, single-use reset tokens with strict 30-minute expiration.
- **Security Audit Logging**: Thread-safe, append-only JSONL audit trail tracking every authentication attempt, status change, and session lifecycle event.

### Pre-Seeded Faculty & Development Demonstration Accounts

For instantaneous faculty evaluation, the system pre-seeds 5 demonstration accounts spanning all professional categories, plus 1-click quick-fill buttons on the Sign In modal:

| Category | Email | Password | Role | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@genomicdemo.local` | `AdminDemo@2026!` | `ADMIN` | Full platform administration, user directory, audit trails, and all genomic queries |
| **Bioinformatics Researcher** | `researcher@genomicdemo.local` | `ResearchDemo@2026!` | `REGISTERED_USER` | Upload FASTQ, construct private Wavelet Trees, search DNA motifs, view analytics |
| **Genomic Lab Technician** | `lab@genomicdemo.local` | `LabDemo@2026!` | `REGISTERED_USER` | Upload FASTQ, validate 4-line quality lines, inspect trees, reconstruct reads |
| **Clinical Researcher** | `clinical@genomicdemo.local` | `ClinicalDemo@2026!` | `REGISTERED_USER` | Analyze datasets, execute ACCESS/RANK/SELECT queries, compute GC percentages |
| **Student / Educator** | `student@genomicdemo.local` | `StudentDemo@2026!` | `REGISTERED_USER` | Interactive tree traversal inspection, Operations Lab testing, pattern queries |
| **Guest Visitor** | *(No credentials required)* | *(1-click button)* | `GUEST` | Read-only exploration of the standard sample dataset; custom uploads blocked (403) |

---

## User Interface & Dashboard Architecture

The interactive single-page application (SPA) is structured into focused scientific workflows:

1. **Home Dashboard**: Real-time summary cards (total reads, indexed symbols, overall GC%, alphabet $\sigma$, height, node count, build time), nucleotide breakdown badges, and theoretical vs. JVM memory footprint comparison.
2. **FASTQ Upload**: Dual-mode sequence ingestion (file upload or live text editor) with strict 4-line FASTQ validation, quality score consistency checks, and private workspace isolation.
3. **Wavelet Tree Visualizer**: Interactive SVG rendering displaying the 11 actual nodes (5 internal nodes with packed bit-vectors + 6 terminal leaves) and live animated query traversal paths.
4. **Operations Lab**: Comprehensive interactive testing bench for all 13 core and derived operations (ACCESS, RANK, SELECT, base counts, read boundaries, read extraction, GC%).
5. **DNA Pattern Search**: Rarest-character heuristic motif search engine with candidate verification breakdown, timing metrics, and exact read/offset matches.
6. **Genomic Analytics**: Nucleotide frequency distributions and per-read GC percentage profiles.
7. **Admin Dashboard** *(Admin Only)*: User management directory with activate/deactivate account controls, system health & JVM heap metrics, and live security audit logs.

---

## System Architecture

```
                  Root Node {#, A, C, G, N, T}
                     Bit-Vector: Len n
                    0 -> Left  |  1 -> Right
                  /                             \
        Node {#, A, C}                       Node {G, N, T}
      0 -> Left | 1 -> Right              0 -> Left | 1 -> Right
        /                \                  /                \
   Node {#, A}         Leaf 'C'        Node {G, N}         Leaf 'T'
 0 -> # | 1 -> A                     0 -> G | 1 -> N
    /         \                         /         \
Leaf '#'   Leaf 'A'                 Leaf 'G'   Leaf 'N'
```

### Tree Characteristics
- **Total Nodes**: 11 nodes (5 internal routing nodes + 6 terminal leaves).
- **Tree Height**: 3 levels (fixed, independent of sequence length $n$).
- **Bit-Vector Storage**: Compact 64-bit packed words (`long[]`) with precomputed word-level prefix counts for $O(1)$ RANK and $O(\log n)$ binary-search SELECT.

---

## Project Folder Structure

```
d:\Mahasri Files\DNA\
├── build.bat                  <- Windows compilation script (zero external tools needed)
├── run.bat                    <- Starts Java WebServer & launches browser
├── test.bat                   <- Executes automated test suite (WT + Auth)
├── README.md                  <- Platform documentation
├── .gitignore                 <- Git ignore rules
│
├── data/
│   ├── users.json             <- Persistent user accounts with PBKDF2 hashes & salts
│   └── audit_log.jsonl        <- Append-only security audit trail
│
├── sample-data/
│   ├── sample.fastq           <- Official faculty sample (GATTACA, CAGT, TTAGC)
│   └── extended_test.fastq    <- Edge case dataset (with 'N' bases and repetitive motifs)
│
├── docs/
│   ├── architecture.md        <- UML diagrams, class responsibilities & data flow
│   ├── algorithms.md          <- Pseudocode, mathematical formulas & worked examples
│   ├── complexity.md          <- Big-O derivations & data structure comparison table
│   ├── evaluation-guide.md    <- 5-minute presentation script & faculty viva Q&A
│   └── contribution-guide.md  <- Team GitHub workflow & individual account contribution
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── genomicindex/
│   │   │       ├── Alphabet.java            <- Alphabet definitions & canonical order
│   │   │       ├── RankSelectBitVector.java <- Formal bit-vector interface
│   │   │       ├── BitVector.java           <- 64-bit packed words with O(1) rank
│   │   │       ├── WaveletTreeNode.java     <- Internal nodes, leaves & parent links
│   │   │       ├── WaveletTree.java         <- Core WT: build, access, rank, select
│   │   │       ├── FastqParser.java         <- 4-line FASTQ validation & reader
│   │   │       ├── Match.java               <- Pattern match encapsulation
│   │   │       ├── QueryEngine.java         <- All 13 higher-level genomic operations
│   │   │       ├── IndexManager.java        <- Facade, telemetry & rebuild manager
│   │   │       ├── WebServer.java           <- Built-in Java HTTP server & REST API
│   │   │       │
│   │   │       └── auth/
│   │   │           ├── PasswordHasher.java  <- PBKDF2WithHmacSHA256 & secure salt
│   │   │           ├── User.java            <- User model, categories, roles & lockouts
│   │   │           ├── UserDatabase.java    <- Atomic JSON storage & seeding
│   │   │           └── SessionManager.java  <- Sessions, CSRF, cookies & rate limits
│   │   │
│   │   └── resources/
│   │       └── web/
│   │           ├── index.html               <- Complete interactive web dashboard
│   │           ├── style.css                <- Dark-navy bioinformatics styling
│   │           └── script.js                <- Dynamic SVG visualizer & API controller
│   │
│   └── test/
│       └── java/
│           └── genomicindex/
│               ├── TestRunner.java          <- 1,600+ Wavelet Tree unit & fuzz tests
│               └── AuthTest.java            <- 30+ Auth, RBAC & isolation tests
│
└── bin/                                     <- Compiled Java bytecode (.class)
```

---

## Quick Start (Windows)

### Prerequisites
- **JDK 17 or higher** (JDK 17, 21, or 26).
- Standard Windows command prompt or PowerShell.
- Zero Maven, Gradle, or external JAR downloads required.

### 1. Build the Project
Open terminal in the project directory (`d:\Mahasri Files\DNA`) and run:
```cmd
build.bat
```
Compiles all Java source files and prepares web assets in `bin\`.

### 2. Run the Automated Tests
```cmd
test.bat
```
Executes all 1,608 Wavelet Tree algorithmic tests and 30 Authentication/RBAC tests.

### 3. Launch the Web Application
```cmd
run.bat
```
Starts the backend on port `8080` and automatically opens:
`http://localhost:8080`

*(To specify an alternate port, pass it as an argument: `run.bat 8085`)*

---

## Faculty Sample Verification

Dataset:
```fastq
@read0
GATTACA
+
IIIIIII
@read1
CAGT
+
IIII
@read2
TTAGC
+
IIIII
```
Unified Sequence:
$$S = \text{GATTACA\#CAGT\#TTAGC\#} \quad (n = 19)$$

### Expected Faculty Results vs Actual Implementation:

| Operation | Input | Expected Output | Actual Implemented Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Total Reads** | `READ-COUNT()` | `3` | `3` | **PASS** |
| **Total Symbols** | Sequence Length | `19` | `19` | **PASS** |
| **Total Bases** | DNA Nucleotides | `16` | `16` | **PASS** |
| **ACCESS(10)** | Index 10 | `'G'` | `'G'` | **PASS** |
| **RANK(T, 12)** | Symbol T, Prefix 12 | `3` | `3` | **PASS** |
| **SELECT(A, 3)** | Symbol A, Occurrence 3 | `6` | `6` | **PASS** |
| **COUNT-BASE(A)**| Symbol A | `5` | `5` | **PASS** |
| **READ-START(1)**| Read 1 | `8` | `8` | **PASS** |
| **READ-END(1)**  | Read 1 | `12` | `12` | **PASS** |
| **READ-OF(15)**  | Position 15 | `2` (Read 2) | `2` | **PASS** |
| **EXTRACT-READ(1)** | Read 1 | `"CAGT"` | `"CAGT"` | **PASS** |
| **GC-CONTENT(2)**| Read 2 | `40.0%` | `40.0%` | **PASS** |
| **FIND("AGC")**  | Pattern "AGC" | Read 2, offset 2, global 15 | Read 2, offset 2, global 15 | **PASS** |

---

## Algorithmic Complexity

| Operation | Time Complexity | Theoretical Space | Code Implementation Mechanism |
| :--- | :--- | :--- | :--- |
| **BUILD** | $O(n \log \sigma)$ | $n \lceil \log_2 \sigma \rceil$ bits | 3 levels of linear partitioning |
| **ACCESS(i)** | $O(\log \sigma) = 3$ steps | $O(1)$ | Top-down bit routing via `node.bits.access` & `rank` |
| **RANK(c, i)** | $O(\log \sigma) = 3$ steps | $O(1)$ | Counts matching branch bits at each level |
| **SELECT(c, k)** | $O(\log \sigma \cdot \log n)$ | $O(1)$ | Bottom-up climb from leaf to root via binary search select |
| **COUNT-BASE(c)** | $O(\log \sigma)$ | $O(1)$ | Single `RANK(c, n)` call |
| **RANGE-COUNT(c, s, e)** | $O(\log \sigma)$ | $O(1)$ | `RANK(c, e) - RANK(c, s)` |
| **READ-COUNT()** | $O(\log \sigma)$ | $O(1)$ | `RANK('#', n)` |
| **READ-START(k)** | $O(\log \sigma \cdot \log n)$ | $O(1)$ | `k == 0 ? 0 : SELECT('#', k) + 1` |
| **READ-END(k)** | $O(\log \sigma \cdot \log n)$ | $O(1)$ | `SELECT('#', k + 1)` |
| **READ-OF(pos)** | $O(\log \sigma)$ | $O(1)$ | `RANK('#', pos)` |
| **EXTRACT-READ(k)** | $O(L \log \sigma)$ | $O(L)$ | Iterative `ACCESS(pos)` for $L$ bases |
| **GC-CONTENT(k)** | $O(\log \sigma)$ | $O(1)$ | Exactly 4 `RANK` calls, independent of read length! |
| **FIND(P)** | $O((m + \text{cnt} \cdot m) \log \sigma)$ | $O(\text{matches})$ | Rarest-character heuristic via `RANK`, `SELECT`, `ACCESS` |

---

## Detailed Documentation Links
- [System Architecture & UML Diagrams](file:///d:/Mahasri%20Files/DNA/docs/architecture.md)
- [Algorithm Specifications & Worked Examples](file:///d:/Mahasri%20Files/DNA/docs/algorithms.md)
- [Theoretical & Practical Complexity Proofs](file:///d:/Mahasri%20Files/DNA/docs/complexity.md)
- [Faculty Evaluation Guide & Presentation Script](file:///d:/Mahasri%20Files/DNA/docs/evaluation-guide.md)
- [GitHub Collaboration & Team Contribution Guide](file:///d:/Mahasri%20Files/DNA/docs/contribution-guide.md)
