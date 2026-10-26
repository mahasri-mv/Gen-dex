package genomicindex;

import java.io.IOException;
import java.util.*;

/**
 * Comprehensive Automated Test Suite for Genomic Wavelet Tree Indexing.
 *
 * Verifies:
 * 1. Sample dataset exact matching with faculty specifications.
 * 2. BitVector ACCESS, RANK, and SELECT across single and multi-word bitsets.
 * 3. WaveletTree tree traversal and non-linear alphabet routing.
 * 4. QueryEngine higher-level genomic operations (read extraction, boundaries, GC content).
 * 5. FIND algorithm rarest-character heuristic, candidate generation, and boundary non-crossing.
 * 6. FASTQ parser validation, error rejection, and format integrity.
 * 7. Randomized fuzz testing against an independent brute-force reference implementation.
 */
public class TestRunner {

    private static int totalTests = 0;
    private static int passedTests = 0;
    private static int failedTests = 0;

    public static void main(String[] args) {
        System.out.println("=================================================================");
        System.out.println("    GENOMIC WAVELET TREE AUTOMATED TEST SUITE");
        System.out.println("=================================================================\n");

        long startSuite = System.currentTimeMillis();

        testSampleDatasetFacultyRequirements();
        testBitVectorOperations();
        testWaveletTreePrimitives();
        testQueryEngineOperations();
        testFindAlgorithm();
        testFastqParserValidation();
        testRandomizedBruteForceComparison();

        long elapsed = System.currentTimeMillis() - startSuite;

        System.out.println("\n=================================================================");
        System.out.println("TEST SUITE SUMMARY:");
        System.out.println("  Total Tests Run : " + totalTests);
        System.out.println("  Passed          : " + passedTests);
        System.out.println("  Failed          : " + failedTests);
        System.out.println("  Time Taken      : " + elapsed + " ms");
        System.out.println("=================================================================");

        if (failedTests > 0) {
            System.err.println("TEST SUITE FAILED: " + failedTests + " test(s) failed.");
            System.exit(1);
        } else {
            System.out.println("ALL TESTS PASSED SUCCESSFULLY! (100% Pass Rate)");
            System.exit(0);
        }
    }

    // =========================================================================
    // Test Category 1: Official Sample Dataset Requirements
    // =========================================================================
    private static void testSampleDatasetFacultyRequirements() {
        System.out.println("[TEST GROUP 1] Official Sample Dataset Requirements (Section 8)");

        try {
            IndexManager manager = new IndexManager();
            manager.loadSampleDataset();

            assertEquals("Sample Total Reads", 3, manager.getTotalReadCount());
            assertEquals("Sample Total Symbols", 19, manager.getTotalIndexedSymbols());
            assertEquals("Sample Total DNA Bases", 16, manager.getTotalBaseCount());

            WaveletTree tree = manager.getWaveletTree();
            QueryEngine qe = manager.getQueryEngine();

            // Operation 2: ACCESS(10) == 'G'
            assertEquals("ACCESS(10) == 'G'", 'G', tree.access(10));

            // Operation 3: RANK('T', 12) == 3
            assertEquals("RANK('T', 12) == 3", 3, tree.rank('T', 12));

            // Operation 4: SELECT('A', 3) == 6
            assertEquals("SELECT('A', 3) == 6", 6, tree.select('A', 3));

            // Operation 5: COUNT-BASE('A') == 5
            assertEquals("COUNT-BASE('A') == 5", 5, qe.countBase('A'));

            // Operation 7: READ-COUNT() == 3
            assertEquals("READ-COUNT() == 3", 3, qe.readCount());

            // Operation 8 & 9: READ-START(1) == 8, READ-END(1) == 12
            assertEquals("READ-START(1) == 8", 8, qe.readStart(1));
            assertEquals("READ-END(1) == 12", 12, qe.readEnd(1));

            // Operation 10: READ-OF(15) == 2
            assertEquals("READ-OF(15) == 2", 2, qe.readOf(15));
            assertTrue("READ-OF(7) is separator", qe.isSeparator(7));

            // Operation 11: EXTRACT-READ(1) == "CAGT"
            assertEquals("EXTRACT-READ(1) == \"CAGT\"", "CAGT", qe.extractRead(1));
            assertEquals("EXTRACT-READ(0) == \"GATTACA\"", "GATTACA", qe.extractRead(0));
            assertEquals("EXTRACT-READ(2) == \"TTAGC\"", "TTAGC", qe.extractRead(2));

            // Operation 12: GC-CONTENT(2) == 40.0%
            double gc2 = qe.gcContent(2);
            assertTrue("GC-CONTENT(2) == 40.0%", Math.abs(gc2 - 40.0) < 0.001);

            // Operation 13: FIND("AGC") -> Read 2, offset 2, global 15
            QueryEngine.FindResult findResult = qe.find("AGC");
            assertEquals("FIND(\"AGC\") match count", 1, findResult.matches.size());
            Match match = findResult.matches.get(0);
            assertEquals("FIND(\"AGC\") readIndex", 2, match.getReadIndex());
            assertEquals("FIND(\"AGC\") offsetInRead", 2, match.getOffsetInRead());
            assertEquals("FIND(\"AGC\") globalPosition", 15, match.getGlobalPosition());

        } catch (Exception e) {
            fail("Exception in sample dataset verification: " + e.getMessage());
        }
    }

    // =========================================================================
    // Test Category 2: BitVector ACCESS, RANK, and SELECT
    // =========================================================================
    private static void testBitVectorOperations() {
        System.out.println("[TEST GROUP 2] BitVector Packed Representation & Operations");

        // Small BitVector (less than 64 bits)
        String bitStr = "1011000000110110100"; // 19 bits matching Root node of sample
        BitVector bv = new BitVector(bitStr);

        assertEquals("BitVector length", 19, bv.length());
        assertEquals("BitVector countOnes", 8, bv.countOnes());
        assertEquals("BitVector countZeros", 11, bv.countZeros());

        // Verify ACCESS
        for (int i = 0; i < bitStr.length(); i++) {
            int expectedBit = bitStr.charAt(i) - '0';
            assertEquals("BitVector access(" + i + ")", expectedBit, bv.access(i));
        }

        // Verify RANK
        assertEquals("BitVector rank(1, 0)", 0, bv.rank(1, 0));
        assertEquals("BitVector rank(0, 0)", 0, bv.rank(0, 0));
        assertEquals("BitVector rank(1, 10)", 3, bv.rank(1, 10)); // indices 0, 2, 3 are 1
        assertEquals("BitVector rank(0, 10)", 7, bv.rank(0, 10)); // 10 - 3 = 7
        assertEquals("BitVector rank(1, 19)", 8, bv.rank(1, 19));
        assertEquals("BitVector rank(0, 19)", 11, bv.rank(0, 19));

        // Verify SELECT
        // 1-bits in bitStr are at indices: 0, 2, 3, 10, 11, 13, 14, 16
        int[] expectedOnes = {0, 2, 3, 10, 11, 13, 14, 16};
        for (int k = 1; k <= expectedOnes.length; k++) {
            assertEquals("BitVector select(1, " + k + ")", expectedOnes[k - 1], bv.select(1, k));
        }

        // 0-bits in bitStr are at indices: 1, 4, 5, 6, 7, 8, 9, 12, 15, 17, 18
        int[] expectedZeros = {1, 4, 5, 6, 7, 8, 9, 12, 15, 17, 18};
        for (int k = 1; k <= expectedZeros.length; k++) {
            assertEquals("BitVector select(0, " + k + ")", expectedZeros[k - 1], bv.select(0, k));
        }

        // Multi-word BitVector (> 64 bits, e.g. 150 bits)
        boolean[] largeBits = new boolean[150];
        List<Integer> expectedLargeOnes = new ArrayList<>();
        for (int i = 0; i < 150; i++) {
            largeBits[i] = (i % 3 == 0);
            if (largeBits[i]) {
                expectedLargeOnes.add(i);
            }
        }
        BitVector largeBv = new BitVector(largeBits);
        assertEquals("Large BitVector length", 150, largeBv.length());
        assertEquals("Large BitVector ones count", expectedLargeOnes.size(), largeBv.countOnes());

        for (int k = 1; k <= expectedLargeOnes.size(); k++) {
            assertEquals("Large BitVector select(1, " + k + ")", (int) expectedLargeOnes.get(k - 1), largeBv.select(1, k));
        }

        // Edge case: Empty bit vector
        BitVector emptyBv = BitVector.empty();
        assertEquals("Empty BitVector length", 0, emptyBv.length());
        assertEquals("Empty BitVector rank(1, 0)", 0, emptyBv.rank(1, 0));
    }

    // =========================================================================
    // Test Category 3: WaveletTree Primitives
    // =========================================================================
    private static void testWaveletTreePrimitives() {
        System.out.println("[TEST GROUP 3] WaveletTree Traversal & Operations");

        String seq = "GATTACA#CAGT#TTAGC#";
        WaveletTree tree = new WaveletTree(seq);

        assertEquals("Tree sequence length", 19, tree.length());
        assertEquals("Tree height", 3, tree.getHeight());
        assertEquals("Tree node count", 11, tree.getNodeCount());

        // Verify ACCESS across every index
        for (int i = 0; i < seq.length(); i++) {
            assertEquals("Tree ACCESS(" + i + ")", seq.charAt(i), tree.access(i));
        }

        // Verify complete linear RANK for all alphabet characters
        for (char ch : Alphabet.SYMBOLS) {
            int linearCount = 0;
            for (int i = 0; i <= seq.length(); i++) {
                assertEquals("Tree RANK('" + ch + "', " + i + ")", linearCount, tree.rank(ch, i));
                if (i < seq.length() && seq.charAt(i) == ch) {
                    linearCount++;
                }
            }
        }

        // Verify complete SELECT for all occurrences of each character
        for (char ch : Alphabet.SYMBOLS) {
            int total = tree.rank(ch, tree.length());
            int occ = 0;
            for (int i = 0; i < seq.length(); i++) {
                if (seq.charAt(i) == ch) {
                    occ++;
                    assertEquals("Tree SELECT('" + ch + "', " + occ + ")", i, tree.select(ch, occ));
                }
            }
            assertEquals("All occurrences matched for '" + ch + "'", total, occ);
        }
    }

    // =========================================================================
    // Test Category 4: QueryEngine Higher-Level Operations
    // =========================================================================
    private static void testQueryEngineOperations() {
        System.out.println("[TEST GROUP 4] QueryEngine Operations & Boundary Handling");

        String seq = "GATTACA#CAGT#TTAGC#";
        WaveletTree tree = new WaveletTree(seq);
        QueryEngine qe = new QueryEngine(tree);

        // Range Count
        // GATTACA (0..7) has 3 A's (at 1, 4, 6)
        assertEquals("RANGE-COUNT('A', 0, 7)", 3, qe.rangeCount('A', 0, 7));
        assertEquals("RANGE-COUNT('T', 0, 7)", 2, qe.rangeCount('T', 0, 7)); // at 2, 3
        assertEquals("RANGE-COUNT('#', 0, 7)", 0, qe.rangeCount('#', 0, 7));
        assertEquals("RANGE-COUNT('#', 0, 8)", 1, qe.rangeCount('#', 0, 8)); // pos 7 is '#'

        // Read boundaries
        assertEquals("READ-START(0)", 0, qe.readStart(0));
        assertEquals("READ-END(0)", 7, qe.readEnd(0));
        assertEquals("READ-START(1)", 8, qe.readStart(1));
        assertEquals("READ-END(1)", 12, qe.readEnd(1));
        assertEquals("READ-START(2)", 13, qe.readStart(2));
        assertEquals("READ-END(2)", 18, qe.readEnd(2));

        // Read Of
        assertEquals("READ-OF(0)", 0, qe.readOf(0));
        assertEquals("READ-OF(6)", 0, qe.readOf(6));
        assertEquals("READ-OF(8)", 1, qe.readOf(8));
        assertEquals("READ-OF(11)", 1, qe.readOf(11));
        assertEquals("READ-OF(13)", 2, qe.readOf(13));
        assertEquals("READ-OF(17)", 2, qe.readOf(17));
    }

    // =========================================================================
    // Test Category 5: FIND Pattern Search Algorithm
    // =========================================================================
    private static void testFindAlgorithm() {
        System.out.println("[TEST GROUP 5] FIND Algorithm & Rarest-Character Heuristic");

        String seq = "GATTACA#CAGT#TTAGC#";
        WaveletTree tree = new WaveletTree(seq);
        QueryEngine qe = new QueryEngine(tree);

        // Pattern 1: "AGC"
        QueryEngine.FindResult r1 = qe.find("AGC");
        assertEquals("FIND(\"AGC\") count", 1, r1.matches.size());
        assertEquals("FIND(\"AGC\") read", 2, r1.matches.get(0).getReadIndex());
        assertEquals("FIND(\"AGC\") offset", 2, r1.matches.get(0).getOffsetInRead());

        // Pattern 2: "GATTACA" (Entire read 0)
        QueryEngine.FindResult r2 = qe.find("GATTACA");
        assertEquals("FIND(\"GATTACA\") count", 1, r2.matches.size());
        assertEquals("FIND(\"GATTACA\") read", 0, r2.matches.get(0).getReadIndex());
        assertEquals("FIND(\"GATTACA\") offset", 0, r2.matches.get(0).getOffsetInRead());

        // Pattern 3: "TT" (Overlapping / multiple occurrences in Read 0 and Read 2)
        // GATTACA has TT at offset 2 (Read 0, global 2)
        // TTAGC has TT at offset 0 (Read 2, global 13)
        QueryEngine.FindResult r3 = qe.find("TT");
        assertEquals("FIND(\"TT\") count", 2, r3.matches.size());

        // Pattern 4: Pattern crossing read boundary: "A#C" must be rejected!
        // Should throw IllegalArgumentException because '#' is not a valid nucleotide
        boolean caughtInvalidChar = false;
        try {
            qe.find("A#C");
        } catch (IllegalArgumentException e) {
            caughtInvalidChar = true;
        }
        assertTrue("Pattern with '#' rejected", caughtInvalidChar);

        // Pattern 5: Boundary crossing sequence without '#' (e.g. "ACA" + "CAGT")
        // Pos 6 is A, pos 7 is #, pos 8 is C. Searching "AC" would cross # if boundary check fails!
        QueryEngine.FindResult rCross = qe.find("AC");
        // GATTACA has AC at offset 4 (pos 4, 5).
        // Does AC cross at 6, 8? Pos 7 is #, so AC can only match inside read 0 at offset 4!
        assertEquals("FIND(\"AC\") count", 1, rCross.matches.size());
        assertEquals("FIND(\"AC\") read", 0, rCross.matches.get(0).getReadIndex());
        assertEquals("FIND(\"AC\") offset", 4, rCross.matches.get(0).getOffsetInRead());

        // Pattern 6: Pattern not present
        QueryEngine.FindResult rNone = qe.find("GGGG");
        assertEquals("FIND(\"GGGG\") none", 0, rNone.matches.size());
    }

    // =========================================================================
    // Test Category 6: FASTQ Parser Validation
    // =========================================================================
    private static void testFastqParserValidation() {
        System.out.println("[TEST GROUP 6] FASTQ Parser Validation & Error Handling");

        // 1. Valid FASTQ
        String validFastq = "@r0\nACTG\n+\nIIII\n";
        try {
            FastqParser.ParseResult res = FastqParser.parse(validFastq);
            assertEquals("Parse valid read count", 1, res.getReadCount());
            assertEquals("Parse valid read", "ACTG", res.getReads().get(0));
            assertEquals("Parse valid concatenated", "ACTG#", res.toConcatenatedSequence());
        } catch (Exception e) {
            fail("Valid FASTQ threw exception: " + e.getMessage());
        }

        // 2. Lowercase conversion
        String lowercaseFastq = "@r0\nactg\n+\nIIII\n";
        try {
            FastqParser.ParseResult res = FastqParser.parse(lowercaseFastq);
            assertEquals("Lowercase converted to uppercase", "ACTG", res.getReads().get(0));
        } catch (Exception e) {
            fail("Lowercase FASTQ failed: " + e.getMessage());
        }

        // 3. Header missing '@'
        assertParserThrows("Missing @ header", "r0\nACTG\n+\nIIII\n", "header must start with '@'");

        // 4. Separator missing '+'
        assertParserThrows("Missing + line", "@r0\nACTG\n-\nIIII\n", "separator must start with '+'");

        // 5. Sequence and Quality length mismatch
        assertParserThrows("Length mismatch", "@r0\nACTG\n+\nII\n", "length mismatch");

        // 6. Invalid nucleotide character
        assertParserThrows("Invalid character 'Z'", "@r0\nACZG\n+\nIIII\n", "Invalid nucleotide 'Z'");

        // 7. Empty content
        assertParserThrows("Empty input", "   \n\n", "empty or contains only whitespace");
    }

    private static void assertParserThrows(String testName, String fastqContent, String expectedMsgSubstr) {
        boolean thrown = false;
        try {
            FastqParser.parse(fastqContent);
        } catch (Exception e) {
            thrown = true;
            assertTrue(testName + " error message contains expected text", e.getMessage().contains(expectedMsgSubstr));
        }
        assertTrue(testName + " should throw exception", thrown);
    }

    // =========================================================================
    // Test Category 7: Randomized Brute-Force Reference Comparison
    // =========================================================================
    private static void testRandomizedBruteForceComparison() {
        System.out.println("[TEST GROUP 7] Randomized Fuzz Testing Against Brute-Force Baseline");

        Random rng = new Random(42); // fixed seed for determinism
        char[] dnaBases = {'A', 'C', 'G', 'T', 'N'};

        // Generate 15 random reads of lengths 5 to 25
        List<String> reads = new ArrayList<>();
        StringBuilder fullSeq = new StringBuilder();

        for (int r = 0; r < 15; r++) {
            int len = 5 + rng.nextInt(21);
            StringBuilder read = new StringBuilder();
            for (int i = 0; i < len; i++) {
                read.append(dnaBases[rng.nextInt(dnaBases.length)]);
            }
            reads.add(read.toString());
            fullSeq.append(read.toString()).append('#');
        }

        String S = fullSeq.toString();
        WaveletTree tree = new WaveletTree(S);
        QueryEngine qe = new QueryEngine(tree);

        // 1. Verify 500 random ACCESS queries against brute-force charAt
        for (int q = 0; q < 500; q++) {
            int idx = rng.nextInt(S.length());
            char expected = S.charAt(idx);
            char actual = tree.access(idx);
            assertEquals("Random ACCESS at " + idx, expected, actual);
        }

        // 2. Verify 500 random RANK queries against brute-force count
        for (int q = 0; q < 500; q++) {
            int idx = rng.nextInt(S.length() + 1);
            char ch = Alphabet.SYMBOLS.get(rng.nextInt(Alphabet.SIZE));

            // Brute-force count
            int expectedCount = 0;
            for (int i = 0; i < idx; i++) {
                if (S.charAt(i) == ch) expectedCount++;
            }

            int actualCount = tree.rank(ch, idx);
            assertEquals("Random RANK('" + ch + "', " + idx + ")", expectedCount, actualCount);
        }

        // 3. Verify SELECT for every occurrence of every symbol
        for (char ch : Alphabet.SYMBOLS) {
            List<Integer> expectedPositions = new ArrayList<>();
            for (int i = 0; i < S.length(); i++) {
                if (S.charAt(i) == ch) {
                    expectedPositions.add(i);
                }
            }

            for (int k = 1; k <= expectedPositions.size(); k++) {
                int expectedPos = expectedPositions.get(k - 1);
                int actualPos = tree.select(ch, k);
                assertEquals("Random SELECT('" + ch + "', " + k + ")", expectedPos, actualPos);
            }
        }

        // 4. Verify Read Extraction
        for (int k = 0; k < reads.size(); k++) {
            assertEquals("Extracted read " + k, reads.get(k), qe.extractRead(k));
        }

        // 5. Test 20 pattern searches against brute force within-read matching
        for (int p = 0; p < 20; p++) {
            // Pick a substring from one of the reads or a random k-mer
            String pattern;
            if (rng.nextBoolean() && !reads.isEmpty()) {
                String r = reads.get(rng.nextInt(reads.size()));
                int start = rng.nextInt(Math.max(1, r.length() - 2));
                int len = Math.min(3 + rng.nextInt(4), r.length() - start);
                pattern = r.substring(start, start + len);
            } else {
                StringBuilder sb = new StringBuilder();
                int len = 2 + rng.nextInt(4);
                for (int i = 0; i < len; i++) sb.append(dnaBases[rng.nextInt(4)]);
                pattern = sb.toString();
            }

            // Brute force search within reads
            List<String> expectedMatches = new ArrayList<>();
            for (int rIdx = 0; rIdx < reads.size(); rIdx++) {
                String read = reads.get(rIdx);
                int idx = 0;
                while ((idx = read.indexOf(pattern, idx)) != -1) {
                    expectedMatches.add("read=" + rIdx + ",offset=" + idx);
                    idx++;
                }
            }

            QueryEngine.FindResult actualResult = qe.find(pattern);
            List<String> actualMatches = new ArrayList<>();
            for (Match m : actualResult.matches) {
                actualMatches.add("read=" + m.getReadIndex() + ",offset=" + m.getOffsetInRead());
            }

            Collections.sort(expectedMatches);
            Collections.sort(actualMatches);
            assertEquals("FIND(\"" + pattern + "\") matches", expectedMatches, actualMatches);
        }
    }

    // =========================================================================
    // Assertion Helper Methods
    // =========================================================================
    private static void assertEquals(String testName, Object expected, Object actual) {
        totalTests++;
        if (Objects.equals(expected, actual)) {
            passedTests++;
        } else {
            failedTests++;
            System.err.println("  [FAIL] " + testName + " -> Expected: " + expected + ", Actual: " + actual);
        }
    }

    private static void assertTrue(String testName, boolean condition) {
        totalTests++;
        if (condition) {
            passedTests++;
        } else {
            failedTests++;
            System.err.println("  [FAIL] " + testName + " -> Condition was FALSE, expected TRUE");
        }
    }

    private static void fail(String message) {
        totalTests++;
        failedTests++;
        System.err.println("  [FAIL] " + message);
    }
}
