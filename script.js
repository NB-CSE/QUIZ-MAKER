
const $ = (selector) => document.querySelector(selector);

const playView = $("#playView");
const createView = $("#createView");
const builder = $("#builderQuestions");

const defaultQuestions = [
  {
    category: "SCIENCE",
    question: "Why does a metal spoon feel colder than a wooden spoon in the same room?",
    options: [
      "Metal is always at a lower temperature",
      "Metal transfers heat away from your hand faster",
      "Wood produces heat on contact",
      "Wood has a higher melting point"
    ],
    answer: 1,
    explanation: "Metal conducts heat much faster than wood, so it draws heat from your hand more quickly."
  },
  {
    category: "TECHNOLOGY",
    question: "What is the main purpose of a database index?",
    options: [
      "To make every file smaller",
      "To encrypt all stored information",
      "To find records faster",
      "To replace the need for tables"
    ],
    answer: 2,
    explanation: "An index helps a database locate records efficiently without checking every row."
  },
  {
    category: "MATHEMATICS",
    question: "A product costs ₹800 after a 20% discount. What was its original price?",
    options: [
      "₹960",
      "₹1,000",
      "₹1,020",
      "₹1,200"
    ],
    answer: 1,
    explanation: "₹800 is 80% of the original price. Therefore, 800 ÷ 0.8 = ₹1,000."
  },
  {
    category: "GENERAL KNOWLEDGE",
    question: "Which organisation publishes the Human Development Report?",
    options: [
      "World Health Organization",
      "UNICEF",
      "United Nations Development Programme",
      "World Trade Organization"
    ],
    answer: 2,
    explanation: "The United Nations Development Programme (UNDP) publishes the Human Development Report."
  },
  {
    category: "COMPUTER SCIENCE",
    question: "What is the time complexity of binary search on a sorted array?",
    options: [
      "O(n)",
      "O(n²)",
      "O(log n)",
      "O(1) in every case"
    ],
    answer: 2,
    explanation: "Binary search halves the remaining search space at each step, giving O(log n) time."
  }
];

let questions = structuredClone(defaultQuestions);
let currentIndex = 0;
let score = 0;
let seconds = 15;
let timerId = null;
let answered = false;
let userAnswers = [];
let reviewVisible = false;

function switchView(view) {
  playView.classList.toggle("hidden", view !== "play");
  createView.classList.toggle("hidden", view !== "create");

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === view);
  });

  if (view === "create") {
    renderBuilder();
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchView(tab.dataset.view));
});

function updateCounts() {
  $("#questionCount").textContent =
    `${questions.length} question${questions.length === 1 ? "" : "s"}`;
  $("#totalQuestions").textContent = questions.length;
  $("#builderCount").textContent =
    `${builder.children.length} question${builder.children.length === 1 ? "" : "s"}`;
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startQuiz() {
  if (!questions.length) return;

  stopTimer();
  currentIndex = 0;
  score = 0;
  userAnswers = [];
  reviewVisible = false;

  $("#quizStart").classList.add("hidden");
  $("#resultCard").classList.add("hidden");
  $("#questionCard").classList.remove("hidden");
  $("#reviewList").classList.add("hidden");
  $("#reviewBtn").textContent = "Review answers";

  showQuestion();
}

function showQuestion() {
  stopTimer();
  answered = false;
  seconds = 15;

  const q = questions[currentIndex];

  $("#progressText").textContent =
    `Question ${currentIndex + 1} of ${questions.length}`;
  $("#progressBar").style.width =
    `${((currentIndex + 1) / questions.length) * 100}%`;
  $("#categoryLabel").textContent = q.category;
  $("#questionText").textContent = q.question;
  $("#timer").textContent = seconds;
  $("#feedback").textContent = "";
  $("#feedback").className = "feedback";

  $("#nextBtn").disabled = true;
  $("#nextBtn").innerHTML =
    currentIndex === questions.length - 1
      ? 'See results <span>→</span>'
      : 'Next question <span>→</span>';

  const optionsContainer = $("#options");
  optionsContainer.replaceChildren();

  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.textContent = option;

    button.append(letter, text);
    button.addEventListener("click", () => selectAnswer(index));
    optionsContainer.append(button);
  });

  timerId = setInterval(() => {
    seconds--;
    $("#timer").textContent = seconds;
    $(".timer").classList.toggle("warning", seconds <= 5);

    if (seconds <= 0) {
      stopTimer();
      if (!answered) {
        selectAnswer(null, true);
      }
    }
  }, 1000);
}

function selectAnswer(selected, timedOut = false) {
  if (answered) return;

  answered = true;
  stopTimer();

  const q = questions[currentIndex];
  const correct = selected === q.answer;

  userAnswers[currentIndex] = selected;

  if (correct) score++;

  const optionButtons = [...$("#options").querySelectorAll(".option")];

  optionButtons.forEach((button, index) => {
    button.disabled = true;

    if (index === q.answer) {
      button.classList.add("correct");
    } else if (index === selected) {
      button.classList.add("incorrect");
    }
  });

  const feedback = $("#feedback");

  if (correct) {
    feedback.textContent = `Correct! ${q.explanation}`;
    feedback.classList.add("success");
  } else {
    const prefix = timedOut ? "Time is up." : "Not quite.";
    feedback.textContent =
      `${prefix} Correct answer: ${q.options[q.answer]}. ${q.explanation}`;
    feedback.classList.add("error");
  }

  $("#nextBtn").disabled = false;
}

function showResults() {
  stopTimer();
  $("#questionCard").classList.add("hidden");
  $("#resultCard").classList.remove("hidden");

  const percentage = Math.round((score / questions.length) * 100);

  $("#finalScore").textContent = `${score}/${questions.length}`;
  $("#resultTitle").textContent =
    percentage === 100 ? "Perfect score!" :
    percentage >= 60 ? "Well done!" : "Keep practising!";
  $("#resultMessage").textContent =
    `You scored ${percentage}%. Review the answers to learn from each question.`;

  $("#resultIcon").textContent = percentage >= 60 ? "✓" : "↻";
  $("#reviewList").classList.add("hidden");
  $("#reviewBtn").textContent = "Review answers";
  reviewVisible = false;
}

function showReview() {
  const list = $("#reviewList");
  list.replaceChildren();

  questions.forEach((q, index) => {
    const item = document.createElement("div");
    item.className = "review-item";

    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${q.question}`;

    const yourAnswer = document.createElement("p");
    const selected = userAnswers[index];
    yourAnswer.textContent = `Your answer: ${
      selected == null ? "No answer" : q.options[selected]
    }`;

    const correctAnswer = document.createElement("p");
    correctAnswer.textContent = `Correct answer: ${q.options[q.answer]}`;
    correctAnswer.style.color = "var(--green)";

    item.append(title, yourAnswer, correctAnswer);
    list.append(item);
  });

  reviewVisible = !reviewVisible;
  list.classList.toggle("hidden", !reviewVisible);
  $("#reviewBtn").textContent =
    reviewVisible ? "Hide review" : "Review answers";
}

$("#startBtn").addEventListener("click", startQuiz);

$("#nextBtn").addEventListener("click", () => {
  if (!answered) return;

  if (currentIndex < questions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    showResults();
  }
});

$("#restartBtn").addEventListener("click", startQuiz);
$("#reviewBtn").addEventListener("click", showReview);

function createEditor(question = null) {
  const item = question || {
    category: "GENERAL KNOWLEDGE",
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    explanation: "Review the correct answer to understand the concept."
  };

  const card = document.createElement("article");
  card.className = "question-editor";

  const top = document.createElement("div");
  top.className = "editor-top";

  const heading = document.createElement("strong");
  heading.textContent = `Question ${builder.children.length + 1}`;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-btn";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    card.remove();
    renumberEditors();
  });

  top.append(heading, remove);

  const categoryLabel = document.createElement("label");
  categoryLabel.className = "field-label";
  categoryLabel.textContent = "Category";

  const category = document.createElement("select");
  category.className = "correct-select category-input";

  [
    "GENERAL KNOWLEDGE",
    "SCIENCE",
    "TECHNOLOGY",
    "MATHEMATICS",
    "COMPUTER SCIENCE"
  ].forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    category.append(option);
  });
  category.value = item.category;

  const questionLabel = document.createElement("label");
  questionLabel.className = "field-label";
  questionLabel.textContent = "Question";

  const questionInput = document.createElement("textarea");
  questionInput.className = "question-input";
  questionInput.maxLength = 400;
  questionInput.placeholder = "Write your question here";
  questionInput.value = item.question;
  questionInput.required = true;

  const optionsLabel = document.createElement("label");
  optionsLabel.className = "field-label";
  optionsLabel.textContent = "Answer options";

  const optionGrid = document.createElement("div");
  optionGrid.className = "option-edit-grid";

  item.options.forEach((value, index) => {
    const wrapper = document.createElement("label");
    wrapper.className = "option-edit";

    const letter = document.createElement("span");
    letter.textContent = String.fromCharCode(65 + index);

    const input = document.createElement("input");
    input.className = "option-input";
    input.maxLength = 180;
    input.placeholder = `Option ${index + 1}`;
    input.value = value;
    input.required = true;

    wrapper.append(letter, input);
    optionGrid.append(wrapper);
  });

  const answerLabel = document.createElement("label");
  answerLabel.className = "field-label";
  answerLabel.textContent = "Correct answer";

  const correct = document.createElement("select");
  correct.className = "correct-select answer-input";

  ["A", "B", "C", "D"].forEach((letter, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${letter} — Option ${index + 1}`;
    correct.append(option);
  });
  correct.value = item.answer;

  card.append(
    top, categoryLabel, category,
    questionLabel, questionInput,
    optionsLabel, optionGrid,
    answerLabel, correct
  );

  return card;
}

function renumberEditors() {
  [...builder.children].forEach((card, index) => {
    card.querySelector(".editor-top strong").textContent =
      `Question ${index + 1}`;
  });
  updateCounts();
}

function renderBuilder() {
  builder.replaceChildren();
  questions.forEach((question) => builder.append(createEditor(question)));
  renumberEditors();
}

$("#addQuestionBtn").addEventListener("click", () => {
  if (builder.children.length >= 20) {
    $("#builderMessage").textContent = "You can add up to 20 questions.";
    return;
  }

  builder.append(createEditor());
  renumberEditors();
  $("#builderMessage").textContent = "";
});

$("#saveQuizBtn").addEventListener("click", () => {
  const title = $("#quizTitle").value.trim();

  if (!title) {
    $("#builderMessage").textContent = "Please enter a quiz title.";
    $("#quizTitle").focus();
    return;
  }

  if (!builder.children.length) {
    $("#builderMessage").textContent = "Add at least one question.";
    return;
  }

  const newQuestions = [];

  for (const [index, card] of [...builder.children].entries()) {
    const question = card.querySelector(".question-input").value.trim();
    const category = card.querySelector(".category-input").value;
    const options = [...card.querySelectorAll(".option-input")]
      .map((input) => input.value.trim());
    const answer = Number(card.querySelector(".answer-input").value);

    if (!question || options.some((option) => !option)) {
      $("#builderMessage").textContent =
        `Please complete the question and all four options in Question ${index + 1}.`;
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (new Set(options.map((option) => option.toLowerCase())).size !== 4) {
      $("#builderMessage").textContent =
        `Please use four different options in Question ${index + 1}.`;
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    newQuestions.push({
      category,
      question,
      options,
      answer,
      explanation: `The correct answer is ${options[answer]}.`
    });
  }

  questions = newQuestions;
  $("#builderMessage").textContent = `"${title}" is ready!`;
  updateCounts();
  switchView("play");
  $("#questionText").textContent = "";
  $("#quizStart").classList.remove("hidden");
  $("#questionCard").classList.add("hidden");
  $("#resultCard").classList.add("hidden");
  $("#startBtn").click();
});

updateCounts();
renderBuilder();
