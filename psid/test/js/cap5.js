let currentQuestionIndex = 0;
let score = 0;
let preguntas = [];
let answeredQuestions = new Set();
let userAnswers = {};

const LATEX_CONFIG = {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "$", right: "$", display: false },
    { left: "\\(", right: "\\)", display: false },
    { left: "\\[", right: "\\]", display: true },
  ],
  throwOnError: false,
};

function renderLatex(element) {
  if (typeof renderMathInElement === "function") {
    renderMathInElement(element, LATEX_CONFIG);
  }
}

async function loadQuestions() {
  try {
    const response = await fetch("json/cap5.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    preguntas = await response.json();

    if (!Array.isArray(preguntas) || preguntas.length === 0) {
      throw new Error("El archivo no contiene preguntas válidas");
    }

    if (!loadProgress()) {
      showQuestion(currentQuestionIndex);
    }
  } catch (error) {
    console.error("Error al cargar las preguntas:", error);
    showErrorMessage(
      "No se pudieron cargar las preguntas. Por favor, inténtalo de nuevo más tarde."
    );
  }
}

function showErrorMessage(message) {
  const container = document.getElementById("quiz-container");
  if (container) {
    container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
  }
}

function generateOptionsHTML(options, index, userAnswer) {
  return options
    .map(
      (option, i) => `
    <li class="option-item">
      <label class="option-label">
        <input type="radio" name="answer-${index}" value="${option}" class="option-input"
          ${userAnswer === option ? "checked" : ""}/>
        <span class="option-text">${option}</span>
      </label>
    </li>
  `
    )
    .join("");
}

function showQuestion(index) {
  const container = document.getElementById("quiz-container");
  if (!container || index >= preguntas.length) return;

  const q = preguntas[index];
  const isLastQuestion = index === preguntas.length - 1;
  const userAnswer = userAnswers[index]; // Respuesta guardada del usuario

  container.innerHTML = `
    <div class="question-card">
      <div class="question-header">
        <span class="question-number">Pregunta ${index + 1} de ${
    preguntas.length
  }</span>
        <span class="question-score">Puntuación: ${score}/${
    preguntas.length
  }</span>
      </div>
      <div class="question-content">
        <h3 class="question-text">${q.question}</h3>
        <ul class="options-list" id="options-${index}">
          ${generateOptionsHTML(
            q.options,
            index,
            userAnswer
          )} <!-- Pasamos la respuesta del usuario -->
        </ul>
      </div>
      <div id="feedback-${index}" class="quiz-feedback"></div>
      <div id="explanation-${index}" class="quiz-explanation"></div>
      <div class="button-container" style="${
        answeredQuestions.has(index) ? "display: flex;" : "display: none;"
      }">
        <button id="next-question" class="next-btn">
          ${isLastQuestion ? "Ver Resultados" : "Siguiente"}
        </button>
      </div>
    </div>
  `;

  // Si ya había una respuesta seleccionada, marcarla
  if (userAnswer) {
    const selectedInput = document.querySelector(
      `input[value="${userAnswer}"]`
    );
    if (selectedInput) {
      selectedInput.checked = true;
      // Si ya había respondido, mostrar feedback inmediatamente
      if (answeredQuestions.has(index)) {
        checkAnswer(index, true);
      }
    }
  }

  renderLatex(container);
  attachEventListeners(index);
}

function attachEventListeners(index) {
  const inputs = document.querySelectorAll(`#options-${index} input`);
  inputs.forEach((input) =>
    input.addEventListener("change", () => checkAnswer(index))
  );

  document
    .getElementById("next-question")
    ?.addEventListener("click", handleNextQuestion);
}

function handleNextQuestion() {
  currentQuestionIndex++;
  saveProgress();
  currentQuestionIndex < preguntas.length
    ? showQuestion(currentQuestionIndex)
    : showFinalScore();
}

function checkAnswer(index, skipSave = false) {
  const selected = document.querySelector(`#options-${index} input:checked`);
  if (!selected) return;

  const answer = selected.value;
  const correctAnswer = preguntas[index].answer;
  const isCorrect = answer === correctAnswer;

  // Guardar la respuesta del usuario (a menos que skipSave sea true)
  if (!skipSave) {
    userAnswers[index] = answer;
  }

  showFeedback(index, isCorrect);
  showExplanation(index);
  highlightAnswers(index, answer, correctAnswer); // Nueva función para resaltar ambas respuestas

  if (isCorrect && !answeredQuestions.has(index)) {
    score++;
    answeredQuestions.add(index);
    updateScoreDisplay();
  }

  document.querySelector(".button-container").style.display = "flex";
  disableOptions(index);

  if (!skipSave) {
    saveProgress();
  }
}

function highlightAnswers(index, userAnswer, correctAnswer) {
  const labels = document.querySelectorAll(`#options-${index} label`);

  labels.forEach((label) => {
    const optionText = label.querySelector(".option-text").textContent.trim();
    label.classList.remove("correct-answer", "wrong-answer");

    if (optionText === correctAnswer) {
      label.classList.add("correct-answer");
    } else if (optionText === userAnswer && userAnswer !== correctAnswer) {
      label.classList.add("wrong-answer");
    }
  });
}

function showFeedback(index, isCorrect) {
  const feedbackDiv = document.getElementById(`feedback-${index}`);
  feedbackDiv.innerHTML = `<span style="color: ${
    isCorrect ? "green" : "red"
  }">${isCorrect ? "✔️" : "❌"} ${
    isCorrect ? "¡Correcto!" : "Incorrecto"
  }</span>`;
}

function showExplanation(index) {
  const explanationDiv = document.getElementById(`explanation-${index}`);
  explanationDiv.innerHTML = `<strong>Explicación:</strong> ${preguntas[index].explanation}`;
  renderLatex(explanationDiv);
}

function highlightCorrectAnswer(index, correctAnswer) {
  document.querySelectorAll(`#options-${index} label`).forEach((label) => {
    if (
      label.querySelector(".option-text").textContent.trim() === correctAnswer
    ) {
      label.style.backgroundColor = "#d4f8e0";
      label.style.border = "2px solid #4CAF50";
    }
  });
}

function updateScoreDisplay() {
  const scoreElement = document.querySelector(".question-score");
  if (scoreElement) {
    scoreElement.textContent = `Puntuación: ${score}/${preguntas.length}`;
  }
}

function disableOptions(index) {
  document
    .querySelectorAll(`#options-${index} input`)
    .forEach((input) => (input.disabled = true));
}

function showFinalScore() {
  const container = document.getElementById("quiz-container");
  const percentage = Math.round((score / preguntas.length) * 100);
  let message = "";

  if (percentage >= 90) message = "¡Excelente trabajo! 🌟";
  else if (percentage >= 70) message = "¡Buen trabajo! 👏";
  else if (percentage >= 50) message = "Puedes mejorar 💪";
  else message = "Necesitas practicar más 📚";

  container.innerHTML = `
    <div class="dashboard__result">
      <h2>🎉 Quiz Completado</h2>
      <div class="score-display">
        <p class="final-score">${score}/${preguntas.length}</p>
        <p class="percentage">${percentage}%</p>
        <p class="message">${message}</p>
      </div>
      <div class="button-container">
        <button class="restart-btn" onclick="restartQuiz()">Reiniciar Quiz</button>
      </div>
    </div>
  `;

  saveCompletion();
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  answeredQuestions.clear();
  clearStorage();
  loadQuestions();
}

function saveProgress() {
  localStorage.setItem(
    "quiz-progress",
    JSON.stringify({
      questionIndex: currentQuestionIndex,
      score: score,
      answeredQuestions: Array.from(answeredQuestions),
      userAnswers: userAnswers, // Guardamos también las respuestas del usuario
    })
  );
}

function saveCompletion() {
  localStorage.setItem(
    "quiz-completion",
    JSON.stringify({
      completed: true,
      score: score,
      total: preguntas.length,
      date: new Date().toISOString(),
    })
  );
}

function loadProgress() {
  const completion = localStorage.getItem("quiz-completion");
  if (completion) {
    showCompletionMessage(JSON.parse(completion));
    return true;
  }

  const progress = localStorage.getItem("quiz-progress");
  if (progress) {
    const data = JSON.parse(progress);
    currentQuestionIndex = data.questionIndex || 0;
    score = data.score || 0;
    answeredQuestions = new Set(data.answeredQuestions || []);
    userAnswers = data.userAnswers || {}; // Cargamos las respuestas del usuario
  }
  return false;
}

function showCompletionMessage(data) {
  document.getElementById("quiz-container").innerHTML = `
    <div class="dashboard__result">
      <h2>👋 Quiz ya completado</h2>
      <p>Completado el: ${new Date(data.date).toLocaleDateString("es-ES")}</p>
      <p>Tu puntaje: ${data.score}/${data.total}</p>
      <div class="button-container">
        <button class="restart-btn" onclick="restartQuiz()">Hacer de nuevo</button>
      </div>
    </div>
  `;
}

function clearStorage() {
  localStorage.removeItem("quiz-progress");
  localStorage.removeItem("quiz-completion");
}

document.addEventListener("DOMContentLoaded", loadQuestions);

// CSS optimizado para centrar el botón
const additionalCSS = `
.button-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  padding: 10px;
}

.next-btn, .restart-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.next-btn:hover, .restart-btn:hover {
  background-color: #0056b3;
}

/* Resto del CSS permanece igual */
.question-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.options-list {
  list-style: none;
  padding: 0;
}

.option-item {
  margin: 10px 0;
}

.option-label {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-label:hover {
  background-color: #f5f5f5;
}

.option-input {
  margin-right: 10px;
}

.quiz-feedback {
  margin: 15px 0;
  font-weight: bold;
  text-align: center;
}

.quiz-explanation {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin-top: 15px;
}

.correct-answer {
  background-color: #d4f8e0 !important;
  border: 2px solid #4CAF50 !important;
}

.wrong-answer {
  background-color: #ffebee !important;
  border: 2px solid #f44336 !important;
}

.option-label {
  transition: all 0.3s ease;
  border-radius: 4px;
  padding: 8px;
  border: 2px solid transparent;
}
`;

if (!document.getElementById("quiz-additional-styles")) {
  const style = document.createElement("style");
  style.id = "quiz-additional-styles";
  style.textContent = additionalCSS;
  document.head.appendChild(style);
}
