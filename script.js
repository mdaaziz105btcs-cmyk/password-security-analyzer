const passwordInput = document.getElementById("password");
const toggleButton = document.getElementById("togglePassword");
const clearButton = document.getElementById("clearPassword");

const strengthText = document.getElementById("strength");
const strengthBar = document.getElementById("strengthBar");
const progress = document.getElementById("progress");
const summary = document.getElementById("summary");
const lengthText = document.getElementById("length");
const checksText = document.getElementById("checks");
const checklist = document.getElementById("checklist");
const suggestions = document.getElementById("suggestions");

const rules = [
  {
    label: "At least 8 characters",
    test: password => password.length >= 8
  },
  {
    label: "12 or more characters",
    test: password => password.length >= 12
  },
  {
    label: "Contains a lowercase letter",
    test: password => /[a-z]/.test(password)
  },
  {
    label: "Contains an uppercase letter",
    test: password => /[A-Z]/.test(password)
  },
  {
    label: "Contains a number",
    test: password => /[0-9]/.test(password)
  },
  {
    label: "Contains a symbol",
    test: password => /[^A-Za-z0-9]/.test(password)
  }
];

const commonPatterns = [
  "password", "admin", "qwerty", "letmein",
  "welcome", "iloveyou", "abc123", "pass",
  "123456", "12345678", "qwer", "asdf",
  "zxcv", "abcd", "bcde", "cdef",
  "1234", "2345", "3456", "4567",
  "5678", "6789", "9876", "8765",
  "7654", "6543", "5432", "4321"
];

function setListMessage(element, message) {
  element.replaceChildren();

  const item = document.createElement("li");
  item.textContent = message;
  element.appendChild(item);
}

function detectPredictablePatterns(password) {
  const normalized = password.toLowerCase();

  const hasCommonPattern = commonPatterns.some(pattern =>
    normalized.includes(pattern)
  );

  const hasRepeatedCharacters = /(.)\1{3,}/i.test(password);

  // Detect repeated groups such as "abcabcabc"
  const hasRepeatedGroups = /(.{2,4})\1{2,}/i.test(password);

  return {
    hasCommonPattern,
    hasRepeatedCharacters,
    hasRepeatedGroups,
    found:
      hasCommonPattern ||
      hasRepeatedCharacters ||
      hasRepeatedGroups
  };
}

function resetResults() {
  strengthText.textContent = "Not checked";
  strengthText.className = "";

  strengthBar.className = "";
  strengthBar.style.width = "0%";

  progress.setAttribute("aria-valuenow", "0");

  summary.textContent = "Enter a test password to begin.";
  lengthText.textContent = "0";
  checksText.textContent = "0 / 6";

  setListMessage(checklist, "Enter a password to see the checklist.");

  setListMessage(
    suggestions,
    "Use a long, unique password or passphrase."
  );
}

function analyzePassword() {
  const password = passwordInput.value;

  if (!password) {
    resetResults();
    return;
  }

  const results = rules.map(rule => ({
    label: rule.label,
    passed: rule.test(password)
  }));

  const passedCount = results.filter(result => result.passed).length;
  const patterns = detectPredictablePatterns(password);

  let level = "Weak";
  let percentage = 25;
  let description = "This password needs improvement.";

  if (patterns.found) {
    if (password.length >= 12 && passedCount >= 3) {
      level = "Medium";
      percentage = 60;
    }

    description =
      "A predictable pattern was detected. Use a more unique password.";
  } else if (password.length >= 12 && passedCount >= 5) {
    level = "Strong";
    percentage = 100;

    description =
      "It passes the basic checks, but this is not a guarantee of security.";
  } else if (password.length >= 8 && passedCount >= 3) {
    level = "Medium";
    percentage = 60;

    description =
      "Some basic checks pass. Consider making it longer and more unique.";
  }

  strengthText.textContent = level;
  strengthText.className = level.toLowerCase();

  strengthBar.className = level.toLowerCase();
  strengthBar.style.width = percentage + "%";

  progress.setAttribute("aria-valuenow", String(percentage));

  summary.textContent = description;
  lengthText.textContent = String(password.length);
  checksText.textContent = `${passedCount} / ${rules.length}`;

  checklist.replaceChildren();

  results.forEach(result => {
    const item = document.createElement("li");
    item.textContent = result.label;
    item.className = result.passed ? "pass" : "";
    checklist.appendChild(item);
  });

  const tips = [];

  if (password.length < 12) {
    tips.push("Use at least 12 characters, preferably a longer passphrase.");
  }

  if (!results[2].passed) {
    tips.push("Consider including lowercase letters.");
  }

  if (!results[3].passed) {
    tips.push("Consider including uppercase letters.");
  }

  if (!results[4].passed) {
    tips.push("Consider including numbers.");
  }

  if (!results[5].passed) {
    tips.push("Consider including symbols.");
  }

  if (patterns.hasCommonPattern) {
    tips.push("Avoid common words and predictable password sequences.");
  }

  if (patterns.hasRepeatedCharacters) {
    tips.push("Avoid repeating the same character four or more times.");
  }

  if (patterns.hasRepeatedGroups) {
    tips.push("Avoid repeating the same short group multiple times.");
  }

  tips.push("Never reuse passwords or include personal information.");
  tips.push("Consider using a trusted password manager to generate a unique password.");

  suggestions.replaceChildren();

  tips.forEach(tip => {
    const item = document.createElement("li");
    item.textContent = tip;
    suggestions.appendChild(item);
  });
}

passwordInput.addEventListener("input", analyzePassword);

toggleButton.addEventListener("click", () => {
  const shouldShow = passwordInput.type === "password";

  passwordInput.type = shouldShow ? "text" : "password";
  toggleButton.textContent = shouldShow ? "Hide" : "Show";
});

clearButton.addEventListener("click", () => {
  passwordInput.value = "";
  passwordInput.type = "password";
  toggleButton.textContent = "Show";

  resetResults();
  passwordInput.focus();
});

resetResults();