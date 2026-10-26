# GitHub Collaboration & Team Contribution Guide

**DSA Lab Evaluation 3: Component 5 (Individual Contribution & GitHub Proof - 2 Marks)**

---

## 1. Faculty Evaluation Requirement

According to the official DSA lab evaluation instructions:
> *"Faculty will interview team members individually to judge your specific understanding and verify equal project participation.*
> *Every team member must use their own separate GitHub account to make code contributions.*
> *You will be asked to display your repository's commit history during the evaluation."*

> [!IMPORTANT]
> **Academic Integrity Notice**: Do NOT fabricate commits, timestamps, or fake contributor accounts. Every team member must configure their own Git account on their own machine, work on their assigned modules, commit their work, and push genuine contributions to the shared GitHub repository.

---

## 2. Suggested Division of Responsibilities for Team Members

For a balanced 3-member or 4-member team evaluation, responsibilities can be divided into distinct functional areas:

### Member 1: Core Succinct Data Structures & Wavelet Tree Engine
- Implementation of `Alphabet.java`, `RankSelectBitVector.java`, and `BitVector.java`.
- Construction of `WaveletTreeNode.java` and `WaveletTree.java`.
- Verification of fundamental operations: `ACCESS`, `RANK`, and `SELECT`.
- Core unit testing in `TestRunner.java`.

### Member 2: FASTQ Parser & Genomic Query Engine
- Implementation of `FastqParser.java` with 4-line syntax validation and nucleotide normalization.
- Implementation of `QueryEngine.java`: read boundary methods (`READ-COUNT`, `READ-START`, `READ-END`, `READ-OF`), read reconstruction (`EXTRACT-READ`), and GC percentage (`GC-CONTENT`).
- Implementation of `Match.java` and edge-case testing in `TestRunner.java`.

### Member 3: Pattern Search Algorithm & REST API Backend
- Implementation of `FIND(pattern)` in `QueryEngine.java` using the rarest-character heuristic.
- Implementation of `IndexManager.java` facade, telemetry metrics, and index rebuild logic.
- Implementation of `WebServer.java` HTTP REST endpoints and JSON serialization.
- Verification of sample dataset queries over HTTP.

### Member 4 (or shared across team): Interactive Scientific Frontend & Visualizer
- Design and styling of `index.html` and `style.css` (bioinformatics dark-navy theme).
- Interactive SVG Wavelet Tree visualizer and traversal animation in `script.js`.
- Implementation of the 12-step faculty demonstration workflow and analytics charts.
- Technical documentation (`README.md`, `architecture.md`, `algorithms.md`, `complexity.md`, `evaluation-guide.md`).

---

## 3. Step-by-Step GitHub Setup & Collaboration Workflow

### Step 3.1: Initialize Git Repository (Team Lead)
Run these commands in the project folder (`d:\Mahasri Files\DNA`):
```bash
# Initialize local Git repository
git init

# Configure your personal details (use your real GitHub name and email!)
git config user.name "Your Real Name"
git config user.email "your_email@domain.com"

# Check status (confirm .gitignore excludes bin/ and class files)
git status

# Add files and make initial commit
git add .
git commit -m "feat: Initial commit of Genomic Wavelet Tree Indexing project"
```

### Step 3.2: Create GitHub Repository & Push (Team Lead)
1. Go to [GitHub.com](https://github.com) and click **New Repository**.
2. Name it: `genomic-wavelet-tree-index`.
3. Set visibility to **Public** (or Private with faculty/teammates invited).
4. Link and push your local repository:
```bash
# Rename default branch to main
git branch -M main

# Add remote repository URL (replace with your repo URL)
git remote add origin https://github.com/<your-username>/genomic-wavelet-tree-index.git

# Push main branch
git push -u origin main
```
5. Go to **Settings > Collaborators** on GitHub and invite all team members by their GitHub usernames.

---

### Step 3.3: How Each Team Member Clones & Configures Git
Each team member runs on their own computer:
```bash
# 1. Clone the repository
git clone https://github.com/<team-lead-username>/genomic-wavelet-tree-index.git
cd genomic-wavelet-tree-index

# 2. Configure personal Git identity (MANDATORY: Must match your own GitHub account!)
git config user.name "Team Member Name"
git config user.email "member_github_email@domain.com"
```

---

### Step 3.4: Feature Branch Workflow for Each Member
Never commit directly to `main`. Every member must create a dedicated feature branch:

```bash
# 1. Pull the latest changes from main
git checkout main
git pull origin main

# 2. Create and switch to your feature branch
git checkout -b feature/wavelet-tree-core      # (For Member 1)
# or: git checkout -b feature/fastq-query-engine     # (For Member 2)
# or: git checkout -b feature/pattern-search-backend # (For Member 3)
# or: git checkout -b feature/frontend-visualizer    # (For Member 4)

# 3. Work on your code, run automated tests to verify:
test.bat

# 4. Stage your changes
git add src/main/java/genomicindex/YourFile.java

# 5. Commit with a meaningful, professional message:
git commit -m "feat(core): implement BitVector packed word rank and select"

# 6. Push your feature branch to GitHub:
git push -u origin feature/wavelet-tree-core
```

---

### Step 3.5: Create Pull Request & Merge on GitHub
1. Open the repository on GitHub.
2. Click **Compare & pull request** next to your pushed branch.
3. Add a clear description of the implemented changes.
4. Have a teammate review and approve the Pull Request.
5. Click **Merge pull request** and confirm.
6. Delete the merged branch.

---

## 4. How to Display Commit History to Faculty

During the evaluation, the faculty will ask to see Git proof of individual contributions. Run:

```bash
# Display visual ASCII commit graph with authors and commit messages
git log --graph --oneline --decorate --all

# Display detailed commit statistics by author
git shortlog -s -n --all

# Show the exact commits made by a specific team member
git log --author="Member Name" --oneline
```

### Example of Expected Clean Output:
```text
*   e7b4c91 (HEAD -> main, origin/main) Merge pull request #4 from member3/feature/pattern-search
|\
| * a4f8e21 feat(search): implement rarest-character heuristic for FIND operation
|/
*   c2d8b10 Merge pull request #3 from member2/feature/fastq-engine
|\
| * 89e3a04 feat(engine): implement read extraction and GC-content queries
|/
*   9b7c124 Merge pull request #2 from member1/feature/bitvector
|\
| * 41d7e52 feat(core): implement packed 64-bit BitVector with O(1) rank
|/
* 10a9f83 feat: initial project structure and documentation
```

This guarantees an indisputable, academically rigorous demonstration that satisfies the full 2 marks for Component 5!
