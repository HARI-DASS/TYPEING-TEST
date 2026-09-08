/* =========================================================
   TYPEMASTER - SMART TYPING COACH
   Plain HTML / CSS / JavaScript only - no frameworks, no backend.

   SECTIONS IN THIS FILE
   1.  Typing passages (normal + code mode)
   2.  Finger / keyboard configuration  (EDIT HERE to fix mapping)
   3.  Practice content bank (per-finger drills)
   4.  Global state
   5.  DOM references
   6.  Init
   7.  Navigation
   8.  Settings
   9.  Typing test engine (start / input / timer / finish)
   10. Key & finger performance math (shared helpers)
   11. Result screen (stats + keyboard heatmap + finger cards)
   12. Local storage - test history
   13. Practice module (finger-by-finger training)
   14. Dashboard / home stats / chart / achievements
   15. Theme + keyboard press animation
   ========================================================= */


/* =========================================================
   1. TYPING PASSAGES
   ========================================================= */

const passages = {
    easy: [
        "The quick brown fox jumps over the lazy dog.",
        "Practice makes perfect when you type every day.",
        "Learning to type faster can save you valuable time.",
        "JavaScript is a popular programming language.",
        "Small steps every day lead to big improvements.",
        "Focus on accuracy before trying to increase your speed.",
        "Good typing skills are useful for students and developers."
    ],
    medium: [
        "Technology continues to change the way people communicate, learn, and work.",
        "Consistent practice is one of the best ways to improve your typing speed.",
        "A good programmer should focus on writing clean, readable, and maintainable code.",
        "Learning new programming concepts becomes easier when you practice them regularly.",
        "Time management and concentration are important skills for successful students.",
        "Web development combines creativity, logical thinking, and problem solving."
    ],
    hard: [
        "Modern software development requires developers to understand algorithms, databases, APIs, security, and user experience.",
        "Artificial intelligence is transforming industries by helping organizations analyze large amounts of information efficiently.",
        "A well-designed application should be scalable, maintainable, secure, accessible, and easy for users to understand.",
        "Successful developers continuously improve their technical knowledge while developing communication and problem-solving skills.",
        "Building complex software requires careful planning, testing, debugging, documentation, and continuous improvement."
    ]
};

const codePassages = [
`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
`for(int i = 0; i < 10; i++) {
    System.out.println("Number: " + i);
}`,
`function calculateSum(a, b) {
    return a + b;
}

console.log(calculateSum(10, 20));`,
`const numbers = [1, 2, 3, 4, 5];

let sum = 0;

for (let number of numbers) {
    sum += number;
}

console.log(sum);`
];


/* =========================================================
   2. FINGER / KEYBOARD CONFIGURATION
   Change this object if the finger mapping needs correcting -
   every other part of the app reads from it.
   ========================================================= */

const FINGER_MAP = {
    "left-pinky":   ["q", "a", "z"],
    "left-ring":    ["w", "s", "x"],
    "left-middle":  ["e", "d", "c"],
    "left-index":   ["r", "t", "f", "g", "v", "b"],
    "right-index":  ["y", "u", "h", "j", "n", "m"],
    "right-middle": ["i", "k", ","],
    "right-ring":   ["o", "l", "."],
    "right-pinky":  ["p", ";", "/", "[", "]"],
    "thumb":        [" "]
};

const FINGER_ORDER = [
    "left-pinky", "left-ring", "left-middle", "left-index",
    "right-index", "right-middle", "right-ring", "right-pinky",
    "thumb"
];

const FINGER_LABELS = {
    "left-pinky": "Left Pinky",
    "left-ring": "Left Ring",
    "left-middle": "Left Middle",
    "left-index": "Left Index",
    "right-index": "Right Index",
    "right-middle": "Right Middle",
    "right-ring": "Right Ring",
    "right-pinky": "Right Pinky",
    "thumb": "Spacebar (Thumb)"
};

const FINGER_EXPLANATIONS = {
    "left-pinky": "Controls Q, A and Z - the outer column of the left hand. Usually the weakest finger due to limited strength and reach.",
    "left-ring": "Controls W, S and X - supports the middle finger with moderate reach and strength.",
    "left-middle": "Controls E, D and C - one of the most naturally coordinated fingers on the left hand.",
    "left-index": "Controls R, T, F, G, V and B - the busiest finger on the left hand, anchored by the home key F.",
    "right-index": "Controls Y, U, H, J, N and M - the busiest finger on the right hand, anchored by the home key J.",
    "right-middle": "Controls I, K and the comma - a strong, naturally coordinated finger.",
    "right-ring": "Controls O, L and the period - supports the pinky with moderate reach and strength.",
    "right-pinky": "Controls P, semicolon, slash and the bracket keys - the outer column of the right hand, often the weakest and least practiced.",
    "thumb": "Controls the spacebar, pressed after almost every word - good rhythm here keeps your whole typing flow smooth."
};

// Reverse lookup built automatically from FINGER_MAP: "r" -> "left-index"
const KEY_TO_FINGER = {};
Object.keys(FINGER_MAP).forEach(function (finger) {
    FINGER_MAP[finger].forEach(function (key) {
        KEY_TO_FINGER[key] = finger;
    });
});

const KEY_LABELS = { " ": "SPACE" };

// Physical row layout used to draw the on-screen keyboard
const KEYBOARD_LAYOUT = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
    [" "]
];


/* =========================================================
   3. PRACTICE CONTENT BANK
   ========================================================= */

const LEVEL_NAMES = {
    1: "Key Familiarization",
    2: "Key Combinations",
    3: "Words",
    4: "Sentences",
    5: "Timed Challenge"
};

const LEVEL_UP_THRESHOLD = 90; // accuracy % required to unlock the next level
const PRACTICE_TIMED_SECONDS = 30;

const PRACTICE_CONTENT = {
    "left-pinky": {
        combos: ["qa", "az", "zq", "aq", "za", "qz", "aza", "zaq"],
        words: ["quiz", "zoo", "quaza", "zag", "aza", "qat", "zap", "quay", "zesty quiz"],
        sentences: [
            "Zoe quietly zipped past the quaint plaza.",
            "A lazy zebra ate a quick pizza slice.",
            "Zack asked a quiz question about the maze."
        ]
    },
    "left-ring": {
        combos: ["ws", "sx", "xw", "sw", "xs", "wx", "sxs", "wsw"],
        words: ["saw", "was", "sox", "wax", "sews", "waxes", "swiss", "sixes", "exams", "wasps"],
        sentences: [
            "We saw six wasps swarm near the wax candles.",
            "Sam wisely swapped his shoes for socks.",
            "The waxworks show was a swift success."
        ]
    },
    "left-middle": {
        combos: ["ed", "dc", "ce", "de", "ec", "cd", "ede", "dcd"],
        words: ["desk", "decide", "device", "education", "decade", "edict", "deduce", "cede", "coded", "decode"],
        sentences: [
            "The decade of education decided the device's success.",
            "She coded a decent decision on her desk.",
            "Cedric decided to deduce the code carefully."
        ]
    },
    "left-index": {
        combos: ["rt", "fr", "fg", "tg", "gr", "vb", "bt", "fv", "tgr", "vbg"],
        words: ["tree", "great", "target", "transfer", "forget", "train", "effort", "brave", "forget", "target"],
        sentences: [
            "The great transfer target was forgotten after training.",
            "Every effort brings you great results over time.",
            "Forget the target - focus on steady, great effort."
        ]
    },
    "right-index": {
        combos: ["yu", "hj", "nm", "un", "jy", "hm", "yuh", "jnm"],
        words: ["human", "young", "junior", "minimum", "unhappy", "hymn", "yummy", "numb", "jump", "month"],
        sentences: [
            "The young junior human jumped with unhappy humor.",
            "Many humans enjoy a yummy meal every month.",
            "Junior hummed a hymn during his lunch hour."
        ]
    },
    "right-middle": {
        combos: ["ik", "ki", "ik,", "ki,", "kik", "iki"],
        words: ["kite", "kick", "milk", "link", "kind", "sink", "think", "pink", "risk", "liking"],
        sentences: [
            "I think a kind kid liked the pink kite.",
            "Kim likes to kick the ball, then think.",
            "I picked a kind, quick link for the task."
        ]
    },
    "right-ring": {
        combos: ["ol", "lo", "ol.", "lo.", "lol", "olo"],
        words: ["cool", "hello", "local", "school", "total", "color", "follow", "gold", "hold", "old"],
        sentences: [
            "The old school follows a local, colorful method.",
            "Hold the gold coin close to the old lock.",
            "Follow the local road to the old school."
        ]
    },
    "right-pinky": {
        combos: ["p;", ";/", "[p", "p]", "/p", ";p", "p[", "]p"],
        words: ["stop;", "plan;", "pop;", "loop;", "type;", "swap;", "drop;", "wrap;"],
        sentences: [
            "Press p, then add a semicolon; check the plan.",
            "Use brackets like [ and ] to close the loop.",
            "Type p, then slash, then semicolon to finish the pattern."
        ]
    },
    "thumb": {
        combos: ["a b", "c d", "go on", "it is", "we do", "he saw", "she ran", "up now"],
        words: ["a", "is", "it", "be", "do", "so", "to", "up", "he", "we", "of", "in", "on", "at", "by"],
        sentences: [
            "It is a big day so we go to see the sun.",
            "We do our best to be on time for the show.",
            "He can run fast and jump up with joy."
        ]
    }
};


/* =========================================================
   4. GLOBAL STATE
   ========================================================= */

/* -- typing test state -- */
let selectedTime = 30;
let selectedDifficulty = "easy";
let selectedMode = "normal";

let currentPassage = "";
let testRunning = false;

let timerInterval = null;
let timeLeft = 30;

let testStartTime = null;

let totalErrors = 0;
let correctCharacters = 0;
let typedCharacters = 0;
let backspaceCount = 0;
let keystrokeTimestamps = [];

let keyStats = {};

/* -- practice module state -- */
let practiceFinger = null;
let practiceLevel = 1;
let practiceExerciseString = "";
let practiceRunning = false;
let practiceTimerInterval = null;
let practiceTimeLeft = PRACTICE_TIMED_SECONDS;
let practiceStartTime = null;
let practiceKeyStats = {};


/* =========================================================
   5. DOM ELEMENT REFERENCES
   (assigned once the DOM has loaded, in init())
   ========================================================= */

let textDisplay, typingInput;
let timerDisplay, wpmDisplay, accuracyDisplay, errorsDisplay;

let resultWpm, resultAccuracy, resultErrors, resultScore;
let analysisText, weakKeysContainer;
let keyTooltipEl, fingerPerformanceCards;

let statTotalKeystrokes, statCorrectKeystrokes, statIncorrectKeystrokes,
    statBackspaces, statErrorRate, statTimeTaken, statConsistency,
    statStrongestKey, statWeakestKey, statStrongestFinger, statWeakestFinger;

/* practice DOM refs */
let recommendationTitle, recommendationSubtitle, startRecommendedBtn, fingerRankingCard, fingerRankingList;
let fingerSelectorView, leftHandGrid, rightHandGrid, thumbGrid;
let fingerDetailView, fingerDetailTitle, fingerDetailExplanation, fingerDetailKeys, levelTabs;
let practiceLevelLabel, practiceTimerDisplay, practiceTimeLeftEl;
let practiceExerciseTextEl, practiceInputEl, startPracticeBtn, newPracticeExerciseBtn;
let practiceResultPanel, practiceResultWpm, practiceResultAccuracy, practiceResultErrors, practiceResultCorrect;
let improvementBanner, levelProgressBar, levelUpBanner, practiceAgainBtn, nextLevelBtn;


/* =========================================================
   6. INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* Test elements */
    textDisplay = document.getElementById("textDisplay");
    typingInput = document.getElementById("typingInput");
    timerDisplay = document.getElementById("timer");
    wpmDisplay = document.getElementById("wpm");
    accuracyDisplay = document.getElementById("accuracy");
    errorsDisplay = document.getElementById("errors");

    /* Result elements */
    resultWpm = document.getElementById("resultWpm");
    resultAccuracy = document.getElementById("resultAccuracy");
    resultErrors = document.getElementById("resultErrors");
    resultScore = document.getElementById("resultScore");
    analysisText = document.getElementById("analysisText");
    weakKeysContainer = document.getElementById("weakKeys");
    keyTooltipEl = document.getElementById("keyTooltip");
    fingerPerformanceCards = document.getElementById("fingerPerformanceCards");

    statTotalKeystrokes = document.getElementById("statTotalKeystrokes");
    statCorrectKeystrokes = document.getElementById("statCorrectKeystrokes");
    statIncorrectKeystrokes = document.getElementById("statIncorrectKeystrokes");
    statBackspaces = document.getElementById("statBackspaces");
    statErrorRate = document.getElementById("statErrorRate");
    statTimeTaken = document.getElementById("statTimeTaken");
    statConsistency = document.getElementById("statConsistency");
    statStrongestKey = document.getElementById("statStrongestKey");
    statWeakestKey = document.getElementById("statWeakestKey");
    statStrongestFinger = document.getElementById("statStrongestFinger");
    statWeakestFinger = document.getElementById("statWeakestFinger");

    /* Practice elements */
    recommendationTitle = document.getElementById("recommendationTitle");
    recommendationSubtitle = document.getElementById("recommendationSubtitle");
    startRecommendedBtn = document.getElementById("startRecommendedBtn");
    fingerRankingCard = document.getElementById("fingerRankingCard");
    fingerRankingList = document.getElementById("fingerRankingList");

    fingerSelectorView = document.getElementById("fingerSelectorView");
    leftHandGrid = document.getElementById("leftHandGrid");
    rightHandGrid = document.getElementById("rightHandGrid");
    thumbGrid = document.getElementById("thumbGrid");

    fingerDetailView = document.getElementById("fingerDetailView");
    fingerDetailTitle = document.getElementById("fingerDetailTitle");
    fingerDetailExplanation = document.getElementById("fingerDetailExplanation");
    fingerDetailKeys = document.getElementById("fingerDetailKeys");
    levelTabs = document.getElementById("levelTabs");

    practiceLevelLabel = document.getElementById("practiceLevelLabel");
    practiceTimerDisplay = document.getElementById("practiceTimerDisplay");
    practiceTimeLeftEl = document.getElementById("practiceTimeLeft");
    practiceExerciseTextEl = document.getElementById("practiceExerciseText");
    practiceInputEl = document.getElementById("practiceInput");
    startPracticeBtn = document.getElementById("startPracticeBtn");
    newPracticeExerciseBtn = document.getElementById("newPracticeExerciseBtn");

    practiceResultPanel = document.getElementById("practiceResultPanel");
    practiceResultWpm = document.getElementById("practiceResultWpm");
    practiceResultAccuracy = document.getElementById("practiceResultAccuracy");
    practiceResultErrors = document.getElementById("practiceResultErrors");
    practiceResultCorrect = document.getElementById("practiceResultCorrect");
    improvementBanner = document.getElementById("improvementBanner");
    levelProgressBar = document.getElementById("levelProgressBar");
    levelUpBanner = document.getElementById("levelUpBanner");
    practiceAgainBtn = document.getElementById("practiceAgainBtn");
    nextLevelBtn = document.getElementById("nextLevelBtn");

    /* Build the two on-screen keyboards */
    buildKeyboardDOM("testKeyboard", { animateFocus: true });
    buildKeyboardDOM("resultKeyboard", { tooltip: true });

    /* Wire everything up */
    setupNavigation();
    setupSettings();
    setupTestButtons();
    setupTypingInput();
    setupDashboard();
    setupTheme();
    setupKeyboardPressAnimation();
    setupPracticeModule();

    updateHomeStats();
    updateDashboard();
    loadTheme();
    resetTest();

});


/* =========================================================
   7. NAVIGATION
   ========================================================= */

function setupNavigation() {

    document.querySelectorAll(".nav-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            if (button.dataset.section) {
                showSection(button.dataset.section);
            }
        });
    });

    const startTestBtn = document.getElementById("startTestBtn");
    if (startTestBtn) {
        startTestBtn.addEventListener("click", function () {
            showSection("test");
        });
    }
}

function showSection(sectionName) {

    document.querySelectorAll(".section").forEach(function (section) {
        section.classList.remove("active-section");
    });

    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add("active-section");
    }

    document.querySelectorAll(".nav-btn").forEach(function (button) {
        button.classList.remove("active");
        if (button.dataset.section === sectionName) {
            button.classList.add("active");
        }
    });

    if (sectionName === "dashboard") updateDashboard();
    if (sectionName === "home") updateHomeStats();
    if (sectionName === "practice") refreshPracticeOverview();
}


/* =========================================================
   8. SETTINGS
   ========================================================= */

function setupSettings() {

    document.querySelectorAll(".duration-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            document.querySelectorAll(".duration-btn").forEach(function (btn) { btn.classList.remove("active"); });
            button.classList.add("active");
            selectedTime = parseInt(button.dataset.time);
            timeLeft = selectedTime;
            if (timerDisplay) timerDisplay.textContent = selectedTime;
        });
    });

    document.querySelectorAll(".difficulty-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            document.querySelectorAll(".difficulty-btn").forEach(function (btn) { btn.classList.remove("active"); });
            button.classList.add("active");
            selectedDifficulty = button.dataset.level;
        });
    });

    document.querySelectorAll(".mode-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            document.querySelectorAll(".mode-btn").forEach(function (btn) { btn.classList.remove("active"); });
            button.classList.add("active");
            selectedMode = button.dataset.mode;
        });
    });
}


/* =========================================================
   9. TYPING TEST ENGINE
   ========================================================= */

function setupTestButtons() {

    const beginBtn = document.getElementById("beginBtn");
    const resetBtn = document.getElementById("resetBtn");
    const againBtn = document.getElementById("againBtn");
    const practiceWeakBtn = document.getElementById("practiceWeakBtn");

    if (beginBtn) beginBtn.addEventListener("click", startTest);
    if (resetBtn) resetBtn.addEventListener("click", resetTest);

    if (againBtn) {
        againBtn.addEventListener("click", function () {
            showSection("test");
            resetTest();
        });
    }

    if (practiceWeakBtn) {
        practiceWeakBtn.addEventListener("click", function () {
            showSection("practice");
            openRecommendedPractice();
        });
    }
}

function generatePassage() {
    if (selectedMode === "code") {
        currentPassage = codePassages[Math.floor(Math.random() * codePassages.length)];
    } else {
        const list = passages[selectedDifficulty];
        currentPassage = list[Math.floor(Math.random() * list.length)];
    }
}

/* Builds one <span> per character so each can be marked correct/incorrect/current */
function buildCharSpans(displayElement, target) {
    if (!displayElement) return;
    displayElement.innerHTML = "";
    target.split("").forEach(function (character, index) {
        const span = document.createElement("span");
        span.textContent = character;
        span.dataset.index = index;
        displayElement.appendChild(span);
    });
}

/* Updates correct/incorrect/current classes on existing spans - reused by test + practice */
function renderDiffDisplay(displayElement, target, typedText) {
    if (!displayElement) return;
    const spans = displayElement.querySelectorAll("span");
    if (spans.length !== target.length) return;
    spans.forEach(function (span, index) {
        span.classList.remove("correct", "incorrect", "current");
        if (index < typedText.length) {
            span.classList.add(typedText[index] === target[index] ? "correct" : "incorrect");
        }
        if (index === typedText.length) {
            span.classList.add("current");
        }
    });
}

function startTest() {
    if (testRunning) return;

    generatePassage();
    buildCharSpans(textDisplay, currentPassage);

    testRunning = true;
    timeLeft = selectedTime;
    testStartTime = Date.now();

    totalErrors = 0;
    correctCharacters = 0;
    typedCharacters = 0;
    backspaceCount = 0;
    keystrokeTimestamps = [];
    keyStats = {};

    if (typingInput) {
        typingInput.value = "";
        typingInput.disabled = false;
        typingInput.focus();
    }

    resetKeyboard();
    updateTimerDisplay();
    updateLiveStats();

    clearInterval(timerInterval);
    timerInterval = setInterval(function () {
        timeLeft--;
        updateTimerDisplay();
        updateLiveStats();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishTest();
        }
    }, 1000);
}

function updateTimerDisplay() {
    if (timerDisplay) timerDisplay.textContent = Math.max(0, timeLeft);
}

function setupTypingInput() {
    if (!typingInput) return;

    /* Track backspaces and keystroke timing for consistency scoring */
    typingInput.addEventListener("keydown", function (event) {
        if (!testRunning) return;
        if (event.key === "Backspace") {
            backspaceCount++;
            return;
        }
        if (event.key.length === 1) {
            keystrokeTimestamps.push(Date.now());
        }
    });

    typingInput.addEventListener("input", function () {
        if (!testRunning) return;

        let typedText = typingInput.value;
        if (typedText.length > currentPassage.length) {
            typedText = typedText.substring(0, currentPassage.length);
            typingInput.value = typedText;
        }

        renderDiffDisplay(textDisplay, currentPassage, typedText);
        calculateLiveStats(typedText);
        recordKeyPerformance(typedText);

        if (typedText.length === currentPassage.length) {
            finishTest();
        }
    });
}

/* Counts correct/incorrect characters typed so far against the target passage */
function computeStats(target, typedText) {
    let correct = 0, errors = 0;
    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === target[i]) correct++; else errors++;
    }
    return { correct: correct, errors: errors, typed: typedText.length };
}

function calculateLiveStats(typedText) {
    const stats = computeStats(currentPassage, typedText);
    typedCharacters = stats.typed;
    correctCharacters = stats.correct;
    totalErrors = stats.errors;
    updateLiveStats();
}

function updateLiveStats() {
    if (!testStartTime) {
        if (wpmDisplay) wpmDisplay.textContent = "0";
        if (accuracyDisplay) accuracyDisplay.textContent = "100%";
        if (errorsDisplay) errorsDisplay.textContent = "0";
        return;
    }

    const elapsedMinutes = Math.max((Date.now() - testStartTime) / 60000, 1 / 60000);
    const wpm = Math.round((correctCharacters / 5) / elapsedMinutes);
    const accuracy = typedCharacters === 0 ? 100 : Math.round((correctCharacters / typedCharacters) * 100);

    if (wpmDisplay) wpmDisplay.textContent = Math.max(0, wpm);
    if (accuracyDisplay) accuracyDisplay.textContent = accuracy + "%";
    if (errorsDisplay) errorsDisplay.textContent = totalErrors;
}

/* Records a hit/miss against the *expected* key at the position just typed.
   Only keys present in KEY_TO_FINGER are tracked (letters, space, and the
   punctuation keys used by the right hand's outer fingers). */
function recordKeyPerformance(typedText) {
    if (!typedText) return;
    const index = typedText.length - 1;
    if (index < 0 || index >= currentPassage.length) return;

    const typedCharacter = typedText[index];
    const key = currentPassage[index].toLowerCase();

    if (!KEY_TO_FINGER[key]) return;

    if (!keyStats[key]) keyStats[key] = { attempts: 0, errors: 0 };
    keyStats[key].attempts++;
    if (typedCharacter.toLowerCase() !== key) keyStats[key].errors++;
}


/* =========================================================
   10. KEY & FINGER PERFORMANCE MATH (shared helpers)
   ========================================================= */

/* Turns a { key: {attempts, errors} } map into a flat, labeled array */
function buildPerformanceList(statsObj, labelMap) {
    const list = [];
    Object.keys(statsObj || {}).forEach(function (id) {
        const s = statsObj[id];
        if (!s || s.attempts === undefined) return;
        const accuracy = s.attempts > 0 ? Math.round(((s.attempts - s.errors) / s.attempts) * 100) : null;
        list.push({
            id: id,
            label: labelMap ? (labelMap[id] || id) : (KEY_LABELS[id] || id.toUpperCase()),
            attempts: s.attempts,
            errors: s.errors,
            accuracy: accuracy
        });
    });
    return list;
}

function computeFingerStats(sourceKeyStats) {
    const fingerStats = {};
    FINGER_ORDER.forEach(function (finger) { fingerStats[finger] = { attempts: 0, errors: 0 }; });
    Object.keys(sourceKeyStats || {}).forEach(function (key) {
        const finger = KEY_TO_FINGER[key];
        if (!finger) return;
        fingerStats[finger].attempts += sourceKeyStats[key].attempts;
        fingerStats[finger].errors += sourceKeyStats[key].errors;
    });
    return fingerStats;
}

function getStrongestWeakest(list) {
    const wellTested = list.filter(function (item) { return item.attempts >= 2 && item.accuracy !== null; });
    const source = wellTested.length > 0
        ? wellTested
        : list.filter(function (item) { return item.attempts >= 1 && item.accuracy !== null; });

    if (source.length === 0) return { strongest: null, weakest: null };

    let strongest = source[0], weakest = source[0];
    source.forEach(function (item) {
        if (item.accuracy > strongest.accuracy) strongest = item;
        if (item.accuracy < weakest.accuracy) weakest = item;
    });
    return { strongest: strongest, weakest: weakest };
}

function classify(accuracy) {
    if (accuracy === null || accuracy === undefined) return "untested";
    if (accuracy >= 90) return "good";
    if (accuracy >= 75) return "medium";
    return "bad";
}

/* Consistency score: how even the gaps between keystrokes were.
   Lower variation between keystroke intervals -> higher score. */
function computeConsistency(timestamps) {
    if (!timestamps || timestamps.length < 3) return 100;
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) intervals.push(timestamps[i] - timestamps[i - 1]);

    const mean = intervals.reduce(function (a, b) { return a + b; }, 0) / intervals.length;
    if (mean === 0) return 100;

    const variance = intervals.reduce(function (sum, v) { return sum + Math.pow(v - mean, 2); }, 0) / intervals.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;

    return Math.max(0, Math.min(100, Math.round(100 - coefficientOfVariation * 100)));
}


/* =========================================================
   11. FINISH TEST + RESULT SCREEN
   ========================================================= */

function finishTest() {
    if (!testRunning) return;

    testRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    if (typingInput) typingInput.disabled = true;

    const typedText = typingInput ? typingInput.value : "";
    calculateLiveStats(typedText);

    const elapsedSeconds = Math.max((testStartTime ? Date.now() - testStartTime : selectedTime * 1000) / 1000, 1);
    const elapsedMinutes = elapsedSeconds / 60;

    const finalWpm = Math.round((correctCharacters / 5) / elapsedMinutes);
    const finalAccuracy = typedCharacters === 0 ? 100 : Math.round((correctCharacters / typedCharacters) * 100);
    const score = Math.max(0, Math.round(finalWpm * (finalAccuracy / 100)));
    const errorRate = typedCharacters === 0 ? 0 : Math.round((totalErrors / typedCharacters) * 100);

    const result = {
        wpm: finalWpm,
        accuracy: finalAccuracy,
        errors: totalErrors,
        correct: correctCharacters,
        typed: typedCharacters,
        backspaces: backspaceCount,
        totalKeystrokes: typedCharacters + backspaceCount,
        errorRate: errorRate,
        timeTaken: Math.round(elapsedSeconds),
        consistency: computeConsistency(keystrokeTimestamps),
        score: score,
        difficulty: selectedDifficulty,
        mode: selectedMode,
        duration: selectedTime,
        date: new Date().toLocaleString(),
        keyStats: keyStats,
        fingerStats: computeFingerStats(keyStats)
    };

    saveResult(result);
    showResult(result);
}

function showResult(result) {

    if (resultWpm) resultWpm.textContent = result.wpm;
    if (resultAccuracy) resultAccuracy.textContent = result.accuracy + "%";
    if (resultErrors) resultErrors.textContent = result.errors;
    if (resultScore) resultScore.textContent = result.score;

    if (statTotalKeystrokes) statTotalKeystrokes.textContent = result.totalKeystrokes;
    if (statCorrectKeystrokes) statCorrectKeystrokes.textContent = result.correct;
    if (statIncorrectKeystrokes) statIncorrectKeystrokes.textContent = result.errors;
    if (statBackspaces) statBackspaces.textContent = result.backspaces;
    if (statErrorRate) statErrorRate.textContent = result.errorRate + "%";
    if (statTimeTaken) statTimeTaken.textContent = result.timeTaken + "s";
    if (statConsistency) statConsistency.textContent = result.consistency + "%";

    const keyList = buildPerformanceList(result.keyStats, null);
    const fingerList = buildPerformanceList(result.fingerStats, FINGER_LABELS);
    const keyExtremes = getStrongestWeakest(keyList);
    const fingerExtremes = getStrongestWeakest(fingerList);

    if (statStrongestKey) {
        statStrongestKey.textContent = keyExtremes.strongest
            ? keyExtremes.strongest.label + " (" + keyExtremes.strongest.accuracy + "%)" : "-";
    }
    if (statWeakestKey) {
        statWeakestKey.textContent = keyExtremes.weakest
            ? keyExtremes.weakest.label + " (" + keyExtremes.weakest.accuracy + "%)" : "-";
    }
    if (statStrongestFinger) {
        statStrongestFinger.textContent = fingerExtremes.strongest
            ? fingerExtremes.strongest.label + " (" + fingerExtremes.strongest.accuracy + "%)" : "-";
    }
    if (statWeakestFinger) {
        statWeakestFinger.textContent = fingerExtremes.weakest
            ? fingerExtremes.weakest.label + " (" + fingerExtremes.weakest.accuracy + "%)" : "-";
    }

    generateAnalysis(result, fingerExtremes);
    generateWeakKeys();
    colorizeKeyboard("resultKeyboard", result.keyStats);
    renderFingerCards(fingerList, fingerExtremes);
    updateAchievements();
}

function generateAnalysis(result, fingerExtremes) {
    if (!analysisText) return;

    let message = "";

    if (result.accuracy >= 98) message = "Excellent accuracy! Your typing control is very strong.";
    else if (result.accuracy >= 95) message = "Great accuracy. Focus on maintaining accuracy while increasing speed.";
    else if (result.accuracy >= 90) message = "Good performance. Try slowing down slightly and focus on difficult keys.";
    else message = "Focus on accuracy first. Speed will naturally improve with regular practice.";

    if (result.wpm >= 60) message += " Your typing speed is excellent.";
    else if (result.wpm >= 40) message += " Your typing speed is above average.";
    else if (result.wpm >= 25) message += " Continue practicing to build your speed.";
    else message += " Regular daily practice can significantly improve your speed.";

    if (fingerExtremes && fingerExtremes.weakest) {
        message += " Your weakest finger is your " + fingerExtremes.weakest.label +
            " (" + fingerExtremes.weakest.accuracy + "% accuracy) - targeted practice will help most there.";
    }

    analysisText.textContent = message;
}

/* Keys with a high error rate this test, used for the "Weak Keys" panel */
function getWeakKeys() {
    const weakKeys = [];
    Object.keys(keyStats).forEach(function (key) {
        const stats = keyStats[key];
        if (stats.attempts >= 2 && (stats.errors / stats.attempts) >= 0.2) {
            weakKeys.push({ key: key, errorRate: stats.errors / stats.attempts });
        }
    });
    weakKeys.sort(function (a, b) { return b.errorRate - a.errorRate; });
    return weakKeys;
}

function generateWeakKeys() {
    if (!weakKeysContainer) return;
    weakKeysContainer.innerHTML = "";

    const weakKeys = getWeakKeys();
    if (weakKeys.length === 0) {
        weakKeysContainer.innerHTML = "<p>No weak keys detected. Great job!</p>";
        return;
    }

    weakKeys.forEach(function (item) {
        const span = document.createElement("span");
        span.className = "weak-key-tag";
        span.textContent = (item.key === " " ? "SPACE" : item.key.toUpperCase());
        weakKeysContainer.appendChild(span);
    });
}


/* =========================================================
   VISUAL KEYBOARD (built once from KEYBOARD_LAYOUT, reused for
   the live test keyboard and the colored result keyboard)
   ========================================================= */

function buildKeyboardDOM(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) return;
    options = options || {};

    container.innerHTML = "";

    KEYBOARD_LAYOUT.forEach(function (row) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "key-row";

        row.forEach(function (key) {
            const keyDiv = document.createElement("div");
            keyDiv.className = key === " " ? "key space-key" : "key";
            keyDiv.dataset.key = key;
            keyDiv.textContent = key === " " ? "SPACE" : key.toUpperCase();

            if (options.animateFocus) {
                keyDiv.addEventListener("click", function () {
                    if (typingInput && testRunning) typingInput.focus();
                });
            }

            if (options.tooltip) {
                keyDiv.addEventListener("mouseenter", function () { showKeyTooltip(keyDiv); });
                keyDiv.addEventListener("mousemove", positionKeyTooltip);
                keyDiv.addEventListener("mouseleave", hideKeyTooltip);
            }

            rowDiv.appendChild(keyDiv);
        });

        container.appendChild(rowDiv);
    });
}

function colorizeKeyboard(containerId, sourceKeyStats) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll(".key").forEach(function (keyElement) {
        const key = keyElement.dataset.key;
        keyElement.classList.remove("good", "medium", "bad", "untested");

        const stats = sourceKeyStats[key];
        const label = key === " " ? "SPACE" : key.toUpperCase();

        if (!stats || stats.attempts === 0) {
            keyElement.classList.add("untested");
            keyElement.dataset.tooltip = label + "\nNo data yet";
            return;
        }

        const accuracy = Math.round(((stats.attempts - stats.errors) / stats.attempts) * 100);
        keyElement.classList.add(classify(accuracy));
        keyElement.dataset.tooltip =
            label + "\nAccuracy: " + accuracy + "%\nErrors: " + stats.errors + "\nAttempts: " + stats.attempts;
    });
}

function showKeyTooltip(keyElement) {
    if (!keyTooltipEl) return;
    keyTooltipEl.textContent = keyElement.dataset.tooltip || "";
    keyTooltipEl.classList.add("visible");
}

function positionKeyTooltip(event) {
    if (!keyTooltipEl) return;
    keyTooltipEl.style.left = (event.clientX + 14) + "px";
    keyTooltipEl.style.top = (event.clientY + 14) + "px";
}

function hideKeyTooltip() {
    if (keyTooltipEl) keyTooltipEl.classList.remove("visible");
}

function resetKeyboard() {
    document.querySelectorAll(".key").forEach(function (key) {
        key.classList.remove("pressed", "good", "medium", "bad", "untested");
    });
}


/* =========================================================
   FINGER PERFORMANCE CARDS (Result page)
   ========================================================= */

function renderFingerCards(fingerList, extremes) {
    if (!fingerPerformanceCards) return;
    fingerPerformanceCards.innerHTML = "";

    FINGER_ORDER.forEach(function (fingerId) {
        const item = fingerList.find(function (f) { return f.id === fingerId; }) ||
            { id: fingerId, attempts: 0, errors: 0, accuracy: null };

        const barClass = classify(item.accuracy);
        const barWidth = item.accuracy === null ? 0 : item.accuracy;

        const card = document.createElement("div");
        card.className = "finger-perf-card";
        if (extremes.strongest && extremes.strongest.id === fingerId) card.classList.add("is-strongest");
        if (extremes.weakest && extremes.weakest.id === fingerId) card.classList.add("is-weakest");

        card.innerHTML =
            '<span class="finger-perf-name">' + FINGER_LABELS[fingerId] + '</span>' +
            '<span class="finger-perf-value">' + (item.accuracy === null ? "No data" : item.accuracy + "%") + '</span>' +
            '<div class="finger-bar ' + (barClass === "untested" ? "medium" : barClass) + '">' +
            '<div style="width:' + barWidth + '%"></div></div>';

        fingerPerformanceCards.appendChild(card);
    });
}


/* =========================================================
   12. LOCAL STORAGE - TEST HISTORY
   ========================================================= */

function getHistory() {
    try {
        const history = localStorage.getItem("typemasterHistory");
        if (!history) return [];
        const parsed = JSON.parse(history);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Could not read history:", error);
        return [];
    }
}

function saveResult(result) {
    const history = getHistory();
    history.push(result);
    if (history.length > 30) history.splice(0, history.length - 30);
    localStorage.setItem("typemasterHistory", JSON.stringify(history));
}


/* =========================================================
   RESET TEST
   ========================================================= */

function resetTest() {
    clearInterval(timerInterval);
    timerInterval = null;
    testRunning = false;
    testStartTime = null;

    timeLeft = selectedTime;
    currentPassage = "";
    totalErrors = 0;
    correctCharacters = 0;
    typedCharacters = 0;
    backspaceCount = 0;
    keystrokeTimestamps = [];
    keyStats = {};

    if (typingInput) {
        typingInput.value = "";
        typingInput.disabled = true;
    }

    if (textDisplay) {
        textDisplay.innerHTML = "<p>Click \"Start Test\" to begin.</p>";
    }

    updateTimerDisplay();
    updateLiveStats();
    resetKeyboard();
}


/* =========================================================
   13. PRACTICE MODULE - FINGER-BY-FINGER TRAINING
   ========================================================= */

function setupPracticeModule() {

    if (startRecommendedBtn) startRecommendedBtn.addEventListener("click", openRecommendedPractice);

    document.querySelectorAll("#backToFingersBtn, #backToFingersBtn2").forEach(function (btn) {
        if (btn) btn.addEventListener("click", showFingerSelector);
    });

    if (startPracticeBtn) startPracticeBtn.addEventListener("click", startPracticeExercise);
    if (newPracticeExerciseBtn) newPracticeExerciseBtn.addEventListener("click", function () { selectLevel(practiceLevel); });
    if (practiceAgainBtn) practiceAgainBtn.addEventListener("click", function () { selectLevel(practiceLevel); });
    if (nextLevelBtn) nextLevelBtn.addEventListener("click", function () { selectLevel(practiceLevel + 1); });

    if (practiceInputEl) practiceInputEl.addEventListener("input", handlePracticeInput);
}

/* ---- Level storage: { fingerKey: { unlockedLevel, lastAccuracy: {level: %} } } ---- */

function getFingerLevels() {
    try {
        const raw = localStorage.getItem("typemasterFingerLevels");
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        console.error("Could not read finger levels:", error);
        return {};
    }
}

function saveFingerLevels(levels) {
    localStorage.setItem("typemasterFingerLevels", JSON.stringify(levels));
}

function getUnlockedLevel(fingerKey) {
    const levels = getFingerLevels();
    return levels[fingerKey] ? levels[fingerKey].unlockedLevel : 1;
}

function savePracticeAttempt(entry) {
    try {
        const raw = localStorage.getItem("typemasterPracticeHistory");
        const history = raw ? JSON.parse(raw) : [];
        history.push(entry);
        if (history.length > 50) history.splice(0, history.length - 50);
        localStorage.setItem("typemasterPracticeHistory", JSON.stringify(history));
    } catch (error) {
        console.error("Could not save practice history:", error);
    }
}

/* ---- Adaptive recommendation, built from the aggregated finger stats
        across every saved typing test ---- */

function getAggregateFingerStats() {
    const history = getHistory();
    const agg = {};
    FINGER_ORDER.forEach(function (f) { agg[f] = { attempts: 0, errors: 0 }; });

    history.forEach(function (item) {
        if (!item.fingerStats) return;
        Object.keys(item.fingerStats).forEach(function (f) {
            if (!agg[f]) agg[f] = { attempts: 0, errors: 0 };
            agg[f].attempts += item.fingerStats[f].attempts || 0;
            agg[f].errors += item.fingerStats[f].errors || 0;
        });
    });

    return agg;
}

/* Renders the recommendation banner + weakest-finger ranking list.
   Returns the id of the recommended (weakest) finger, or null. */
function renderRecommendationBanner() {
    const list = buildPerformanceList(getAggregateFingerStats(), FINGER_LABELS)
        .filter(function (item) { return item.attempts > 0; });

    if (list.length === 0) {
        if (recommendationTitle) recommendationTitle.textContent = "Complete a Typing Test to unlock recommendations";
        if (recommendationSubtitle) recommendationSubtitle.textContent = "Your weakest finger will be recommended for practice here.";
        if (startRecommendedBtn) startRecommendedBtn.disabled = true;
        if (fingerRankingCard) fingerRankingCard.style.display = "none";
        return null;
    }

    list.sort(function (a, b) { return a.accuracy - b.accuracy; });
    const weakest = list[0];

    if (recommendationTitle) recommendationTitle.textContent = "Recommended Practice: " + weakest.label;
    if (recommendationSubtitle) {
        recommendationSubtitle.textContent = weakest.label + " accuracy is " + weakest.accuracy +
            "% - focused practice here will help you most.";
    }
    if (startRecommendedBtn) startRecommendedBtn.disabled = false;
    if (fingerRankingCard) fingerRankingCard.style.display = "block";

    renderFingerRankingList(list);
    return weakest.id;
}

function renderFingerRankingList(list) {
    if (!fingerRankingList) return;
    fingerRankingList.innerHTML = "";

    list.forEach(function (item, index) {
        const row = document.createElement("div");
        row.className = "finger-ranking-item";
        const barClass = classify(item.accuracy);
        row.innerHTML =
            '<span class="rank-number">' + (index + 1) + '</span>' +
            '<span class="rank-name">' + item.label + '</span>' +
            '<div class="finger-bar ' + barClass + '"><div style="width:' + item.accuracy + '%"></div></div>' +
            '<span class="rank-value">' + item.accuracy + '%</span>';
        fingerRankingList.appendChild(row);
    });
}

function openRecommendedPractice() {
    const weakestId = renderRecommendationBanner();
    if (weakestId) openFingerDetail(weakestId);
}

/* ---- Finger selector grid ---- */

function refreshPracticeOverview() {
    showFingerSelector();
}

function showFingerSelector() {
    if (fingerDetailView) fingerDetailView.style.display = "none";
    if (fingerSelectorView) fingerSelectorView.style.display = "block";
    renderFingerSelector();
}

function renderFingerSelector() {
    const weakestId = renderRecommendationBanner();
    const levels = getFingerLevels();

    buildFingerCards(leftHandGrid, ["left-pinky", "left-ring", "left-middle", "left-index"], levels, weakestId);
    buildFingerCards(rightHandGrid, ["right-index", "right-middle", "right-ring", "right-pinky"], levels, weakestId);
    buildFingerCards(thumbGrid, ["thumb"], levels, weakestId);
}

function buildFingerCards(container, fingerKeys, levels, weakestId) {
    if (!container) return;
    container.innerHTML = "";

    fingerKeys.forEach(function (fingerKey) {
        const unlocked = levels[fingerKey] ? levels[fingerKey].unlockedLevel : 1;
        const keysLabel = FINGER_MAP[fingerKey].map(function (k) { return k === " " ? "SPACE" : k.toUpperCase(); }).join(" ");

        const card = document.createElement("div");
        card.className = "finger-card" + (fingerKey === weakestId ? " recommended" : "");
        card.innerHTML =
            '<span class="finger-card-name">' + FINGER_LABELS[fingerKey] + '</span>' +
            '<span class="finger-card-keys">' + keysLabel + '</span>' +
            '<span class="finger-card-level">Level ' + unlocked + ' / 5</span>';

        card.addEventListener("click", function () { openFingerDetail(fingerKey); });
        container.appendChild(card);
    });
}

/* ---- Finger detail / exercise view ---- */

function openFingerDetail(fingerKey, forcedLevel) {
    practiceFinger = fingerKey;

    if (fingerSelectorView) fingerSelectorView.style.display = "none";
    if (fingerDetailView) fingerDetailView.style.display = "block";

    if (fingerDetailTitle) fingerDetailTitle.textContent = FINGER_LABELS[fingerKey];
    if (fingerDetailExplanation) fingerDetailExplanation.textContent = FINGER_EXPLANATIONS[fingerKey];

    if (fingerDetailKeys) {
        fingerDetailKeys.innerHTML = "";
        FINGER_MAP[fingerKey].forEach(function (k) {
            const span = document.createElement("span");
            span.textContent = k === " " ? "SPACE" : k.toUpperCase();
            fingerDetailKeys.appendChild(span);
        });
    }

    const unlocked = getUnlockedLevel(fingerKey);
    const level = (forcedLevel && forcedLevel <= unlocked) ? forcedLevel : unlocked;

    selectLevel(level);
}

function renderLevelTabs() {
    if (!levelTabs) return;
    levelTabs.innerHTML = "";

    const unlocked = getUnlockedLevel(practiceFinger);

    for (let level = 1; level <= 5; level++) {
        const tab = document.createElement("button");
        const locked = level > unlocked;
        tab.className = "level-tab" + (level === practiceLevel ? " active" : "") + (locked ? " locked" : "");
        tab.textContent = (locked ? "\uD83D\uDD12 " : "") + "Level " + level;
        tab.disabled = locked;
        tab.addEventListener("click", function () { selectLevel(level); });
        levelTabs.appendChild(tab);
    }
}

/* ---- Exercise text generation ---- */

function shuffleArray(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }
    return copy;
}

function pickRandomJoin(arr, count, separator) {
    if (!arr || arr.length === 0) return "";
    const pool = shuffleArray(arr);
    const picks = [];
    for (let i = 0; i < count; i++) picks.push(pool[i % pool.length]);
    return picks.join(separator);
}

function generateLevel1Text(fingerKey) {
    if (fingerKey === "thumb") {
        // Emphasize spacebar rhythm: single letters separated by extra spaces
        return "a   b   c   d   e   f   g   h   i   j";
    }
    const groups = shuffleArray(FINGER_MAP[fingerKey].map(function (key) {
        return (key + " ").repeat(4).trim();
    }));
    return groups.join("   ");
}

function buildExerciseText(fingerKey, level) {
    const content = PRACTICE_CONTENT[fingerKey];
    if (!content) return "";

    switch (level) {
        case 1: return generateLevel1Text(fingerKey);
        case 2: return pickRandomJoin(content.combos, 8, " ");
        case 3: return pickRandomJoin(content.words, 10, " ");
        case 4: return pickRandomJoin(content.sentences, 2, " ");
        case 5: return pickRandomJoin(content.sentences, 3, " ");
        default: return "";
    }
}

function selectLevel(level) {
    const unlocked = getUnlockedLevel(practiceFinger);
    if (level < 1 || level > unlocked) return;

    practiceLevel = level;
    practiceRunning = false;
    clearInterval(practiceTimerInterval);
    practiceTimerInterval = null;

    if (practiceLevelLabel) practiceLevelLabel.textContent = "Level " + level + " - " + LEVEL_NAMES[level];

    practiceExerciseString = buildExerciseText(practiceFinger, level);
    buildCharSpans(practiceExerciseTextEl, practiceExerciseString);

    if (practiceInputEl) {
        practiceInputEl.value = "";
        practiceInputEl.disabled = true;
    }
    if (startPracticeBtn) startPracticeBtn.disabled = false;
    if (practiceResultPanel) practiceResultPanel.style.display = "none";

    practiceTimeLeft = PRACTICE_TIMED_SECONDS;
    if (practiceTimerDisplay) practiceTimerDisplay.style.display = level === 5 ? "inline" : "none";
    updatePracticeTimerDisplay();

    renderLevelTabs();
}

/* ---- Running an exercise ---- */

function startPracticeExercise() {
    if (practiceRunning || !practiceExerciseTextEl) return;

    practiceRunning = true;
    practiceStartTime = Date.now();
    practiceKeyStats = {};

    if (practiceInputEl) {
        practiceInputEl.value = "";
        practiceInputEl.disabled = false;
        practiceInputEl.focus();
    }
    if (startPracticeBtn) startPracticeBtn.disabled = true;
    if (practiceResultPanel) practiceResultPanel.style.display = "none";

    if (practiceLevel === 5) {
        startPracticeTimer();
    }
}

function startPracticeTimer() {
    practiceTimeLeft = PRACTICE_TIMED_SECONDS;
    updatePracticeTimerDisplay();

    clearInterval(practiceTimerInterval);
    practiceTimerInterval = setInterval(function () {
        practiceTimeLeft--;
        updatePracticeTimerDisplay();
        if (practiceTimeLeft <= 0) {
            clearInterval(practiceTimerInterval);
            finishPracticeExercise();
        }
    }, 1000);
}

function updatePracticeTimerDisplay() {
    if (practiceTimeLeftEl) practiceTimeLeftEl.textContent = Math.max(0, practiceTimeLeft);
}

function handlePracticeInput() {
    if (!practiceRunning) return;

    let typed = practiceInputEl.value;
    if (typed.length > practiceExerciseString.length) {
        typed = typed.substring(0, practiceExerciseString.length);
        practiceInputEl.value = typed;
    }

    renderDiffDisplay(practiceExerciseTextEl, practiceExerciseString, typed);
    recordPracticeKeyPerformance(typed);

    if (typed.length === practiceExerciseString.length) {
        finishPracticeExercise();
    }
}

function recordPracticeKeyPerformance(typedText) {
    const index = typedText.length - 1;
    if (index < 0 || index >= practiceExerciseString.length) return;

    const typedCharacter = typedText[index];
    const key = practiceExerciseString[index].toLowerCase();
    if (!KEY_TO_FINGER[key]) return;

    if (!practiceKeyStats[key]) practiceKeyStats[key] = { attempts: 0, errors: 0 };
    practiceKeyStats[key].attempts++;
    if (typedCharacter.toLowerCase() !== key) practiceKeyStats[key].errors++;
}

function finishPracticeExercise() {
    if (!practiceRunning) return;

    practiceRunning = false;
    clearInterval(practiceTimerInterval);
    practiceTimerInterval = null;

    if (practiceInputEl) practiceInputEl.disabled = true;
    if (startPracticeBtn) startPracticeBtn.disabled = false;

    const typedText = practiceInputEl ? practiceInputEl.value : "";
    const stats = computeStats(practiceExerciseString, typedText);

    const elapsedSeconds = Math.max((practiceStartTime ? Date.now() - practiceStartTime : 1000) / 1000, 1);
    const wpm = Math.round((stats.correct / 5) / (elapsedSeconds / 60));
    const accuracy = stats.typed === 0 ? 0 : Math.round((stats.correct / stats.typed) * 100);

    let fingerAttempts = 0, fingerErrors = 0;
    Object.keys(practiceKeyStats).forEach(function (k) {
        fingerAttempts += practiceKeyStats[k].attempts;
        fingerErrors += practiceKeyStats[k].errors;
    });
    const fingerAccuracy = fingerAttempts > 0 ? Math.round(((fingerAttempts - fingerErrors) / fingerAttempts) * 100) : accuracy;

    const levels = getFingerLevels();
    const fingerRecord = levels[practiceFinger] || { unlockedLevel: 1, lastAccuracy: {} };
    fingerRecord.lastAccuracy = fingerRecord.lastAccuracy || {};
    const previousAccuracy = fingerRecord.lastAccuracy[practiceLevel];

    let leveledUp = false;
    if (accuracy >= LEVEL_UP_THRESHOLD && practiceLevel === fingerRecord.unlockedLevel && practiceLevel < 5) {
        fingerRecord.unlockedLevel = practiceLevel + 1;
        leveledUp = true;
    }
    fingerRecord.lastAccuracy[practiceLevel] = accuracy;
    levels[practiceFinger] = fingerRecord;
    saveFingerLevels(levels);

    savePracticeAttempt({
        finger: practiceFinger,
        level: practiceLevel,
        wpm: wpm,
        accuracy: accuracy,
        errors: stats.errors,
        correct: stats.correct,
        time: Math.round(elapsedSeconds),
        date: new Date().toLocaleString()
    });

    renderPracticeResult({
        wpm: wpm,
        accuracy: accuracy,
        errors: stats.errors,
        correct: stats.correct,
        fingerAccuracy: fingerAccuracy,
        previousAccuracy: previousAccuracy,
        leveledUp: leveledUp,
        level: practiceLevel
    });

    renderLevelTabs();
}

function renderPracticeResult(data) {
    if (practiceResultWpm) practiceResultWpm.textContent = data.wpm;
    if (practiceResultAccuracy) practiceResultAccuracy.textContent = data.accuracy + "%";
    if (practiceResultErrors) practiceResultErrors.textContent = data.errors;
    if (practiceResultCorrect) practiceResultCorrect.textContent = data.correct;

    const label = FINGER_LABELS[practiceFinger];
    if (improvementBanner) {
        improvementBanner.style.display = "block";
        if (typeof data.previousAccuracy !== "number") {
            improvementBanner.textContent = "First attempt at this level - accuracy: " + data.accuracy + "%";
        } else if (data.accuracy > data.previousAccuracy) {
            improvementBanner.textContent = label + " accuracy improved from " + data.previousAccuracy + "% \u2192 " + data.accuracy + "%";
        } else if (data.accuracy < data.previousAccuracy) {
            improvementBanner.textContent = label + " accuracy dropped from " + data.previousAccuracy + "% \u2192 " + data.accuracy + "% - keep practicing!";
        } else {
            improvementBanner.textContent = label + " accuracy held steady at " + data.accuracy + "%";
        }
    }

    if (levelProgressBar) levelProgressBar.style.width = Math.min(100, data.accuracy) + "%";

    const unlocked = getUnlockedLevel(practiceFinger);

    if (data.leveledUp && levelUpBanner) {
        levelUpBanner.style.display = "block";
        levelUpBanner.textContent = "\uD83C\uDF89 Level Up! Level " + (data.level + 1) + " unlocked.";
    } else if (levelUpBanner) {
        levelUpBanner.style.display = "none";
    }

    if (nextLevelBtn) {
        nextLevelBtn.style.display = (data.level < 5 && data.level < unlocked) ? "inline-block" : "none";
    }

    if (practiceResultPanel) practiceResultPanel.style.display = "block";
}


/* =========================================================
   14. DASHBOARD / HOME STATS / CHART / ACHIEVEMENTS
   ========================================================= */

function setupDashboard() {
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    if (!clearHistoryBtn) return;

    clearHistoryBtn.addEventListener("click", function () {
        if (!confirm("Clear all typing history?")) return;
        localStorage.removeItem("typemasterHistory");
        updateDashboard();
        updateHomeStats();
        updateAchievements();
    });
}

function updateDashboard() {
    const history = getHistory();

    const totalTests = document.getElementById("totalTests");
    const bestWpm = document.getElementById("bestWpm");
    const avgWpm = document.getElementById("avgWpm");
    const bestAccuracy = document.getElementById("bestAccuracy");

    if (totalTests) totalTests.textContent = history.length;

    if (history.length === 0) {
        if (bestWpm) bestWpm.textContent = "0";
        if (avgWpm) avgWpm.textContent = "0";
        if (bestAccuracy) bestAccuracy.textContent = "0%";
    } else {
        const wpmValues = history.map(function (item) { return item.wpm || 0; });
        const accuracyValues = history.map(function (item) { return item.accuracy || 0; });
        const best = Math.max.apply(null, wpmValues);
        const average = wpmValues.reduce(function (sum, v) { return sum + v; }, 0) / wpmValues.length;
        const accuracy = Math.max.apply(null, accuracyValues);

        if (bestWpm) bestWpm.textContent = Math.round(best);
        if (avgWpm) avgWpm.textContent = Math.round(average);
        if (bestAccuracy) bestAccuracy.textContent = Math.round(accuracy) + "%";
    }

    updateHistoryTable(history);
    drawChart(history);
    updateAchievements();
}

function updateHomeStats() {
    const history = getHistory();
    const homeTests = document.getElementById("homeTests");
    const homeWpm = document.getElementById("homeWpm");
    const homeAccuracy = document.getElementById("homeAccuracy");

    if (homeTests) homeTests.textContent = history.length;

    if (history.length === 0) {
        if (homeWpm) homeWpm.textContent = "0";
        if (homeAccuracy) homeAccuracy.textContent = "0%";
        return;
    }

    const bestWpm = Math.max.apply(null, history.map(function (item) { return item.wpm || 0; }));
    const bestAccuracy = Math.max.apply(null, history.map(function (item) { return item.accuracy || 0; }));

    if (homeWpm) homeWpm.textContent = Math.round(bestWpm);
    if (homeAccuracy) homeAccuracy.textContent = Math.round(bestAccuracy) + "%";
}

function updateHistoryTable(history) {
    const historyTable = document.getElementById("historyTable");
    if (!historyTable) return;

    historyTable.innerHTML = "";

    if (history.length === 0) {
        historyTable.innerHTML = "<tr><td colspan='6'>No tests completed yet.</td></tr>";
        return;
    }

    history.slice().reverse().forEach(function (item) {
        const row = document.createElement("tr");
        [
            item.date || "-",
            item.wpm || 0,
            (item.accuracy || 0) + "%",
            item.errors || 0,
            item.mode || "normal",
            item.difficulty || "easy"
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        historyTable.appendChild(row);
    });
}

function drawChart(history) {
    const canvas = document.getElementById("wpmChart");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 300;
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    if (!history || history.length === 0) {
        context.font = "16px Arial";
        context.textAlign = "center";
        context.fillText("Complete a test to see your WPM progress.", width / 2, height / 2);
        return;
    }

    const values = history.map(function (item) { return Number(item.wpm) || 0; });
    const maxValue = Math.max(10, Math.max.apply(null, values));
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    /* grid */
    context.beginPath();
    context.strokeStyle = "#e5e7eb";
    context.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        context.moveTo(padding, y);
        context.lineTo(width - padding, y);
    }
    context.stroke();

    function xFor(index) {
        return values.length === 1 ? width / 2 : padding + (index / (values.length - 1)) * chartWidth;
    }
    function yFor(value) {
        return padding + chartHeight - (value / maxValue) * chartHeight;
    }

    /* line */
    context.beginPath();
    context.strokeStyle = "#4f46e5";
    context.lineWidth = 3;
    values.forEach(function (value, index) {
        const x = xFor(index), y = yFor(value);
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
    });
    context.stroke();

    /* points */
    context.fillStyle = "#4f46e5";
    values.forEach(function (value, index) {
        context.beginPath();
        context.arc(xFor(index), yFor(value), 4, 0, Math.PI * 2);
        context.fill();
    });

    /* labels */
    context.fillStyle = "#6b7280";
    context.font = "12px Arial";
    context.textAlign = "center";
    values.forEach(function (value, index) {
        if (index === 0 || index === values.length - 1 || values.length <= 10) {
            context.fillText(value + " WPM", xFor(index), yFor(value) - 10);
        }
    });
}

function updateAchievements() {
    const history = getHistory();

    const achievements = {
        achievementFirst: document.getElementById("achievementFirst"),
        achievement50: document.getElementById("achievement50"),
        achievement60: document.getElementById("achievement60"),
        achievement95: document.getElementById("achievement95"),
        achievement100: document.getElementById("achievement100")
    };

    Object.keys(achievements).forEach(function (key) {
        if (achievements[key]) achievements[key].classList.remove("unlocked");
    });

    if (history.length === 0) return;

    if (achievements.achievementFirst) achievements.achievementFirst.classList.add("unlocked");

    const bestWpm = Math.max.apply(null, history.map(function (item) { return item.wpm || 0; }));
    const bestAccuracy = Math.max.apply(null, history.map(function (item) { return item.accuracy || 0; }));

    if (achievements.achievement50 && bestWpm >= 50) achievements.achievement50.classList.add("unlocked");
    if (achievements.achievement60 && bestWpm >= 60) achievements.achievement60.classList.add("unlocked");
    if (achievements.achievement95 && bestAccuracy >= 95) achievements.achievement95.classList.add("unlocked");
    if (achievements.achievement100 && bestAccuracy >= 100) achievements.achievement100.classList.add("unlocked");
}


/* =========================================================
   15. THEME + KEYBOARD PRESS ANIMATION
   ========================================================= */

function setupTheme() {
    const themeBtn = document.getElementById("themeBtn");
    if (!themeBtn) return;

    themeBtn.addEventListener("click", function () {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("typemasterTheme", isDark ? "dark" : "light");
        updateThemeButton();
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem("typemasterTheme");
    document.body.classList.toggle("dark", savedTheme === "dark");
    updateThemeButton();
}

function updateThemeButton() {
    const themeBtn = document.getElementById("themeBtn");
    if (!themeBtn) return;
    themeBtn.textContent = document.body.classList.contains("dark") ? "\u2600\uFE0F" : "\uD83C\uDF19";
}

function setupKeyboardPressAnimation() {
    document.addEventListener("keydown", function (event) {
        const key = event.key.toLowerCase();
        document.querySelectorAll('.key[data-key="' + CSS.escape(key) + '"]').forEach(function (keyElement) {
            keyElement.classList.add("pressed");
            setTimeout(function () { keyElement.classList.remove("pressed"); }, 100);
        });
    });
}

window.addEventListener("resize", function () {
    drawChart(getHistory());
});