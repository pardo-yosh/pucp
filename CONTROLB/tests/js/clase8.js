let currentQuestionIndex = 0;
let score = 0;
let preguntas = [];

// Función para renderizar fórmulas LaTeX
function renderLatex(element) {
  if (typeof renderMathInElement === "function") {
    renderMathInElement(element, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
      ],
      throwOnError: false,
    });
  }
}

// Cargar preguntas desde JSON
async function loadQuestions() {
  try {
    const response = await fetch("json/clase8.json");
    if (!response.ok) throw new Error("No se pudo cargar el archivo");

    preguntas = await response.json();
    showQuestion(currentQuestionIndex);
  } catch (error) {
    console.error("Error al cargar las preguntas:", error);
    document.getElementById("quiz-container").innerHTML = `
            <div class="error-message">
                <p>No se pudieron cargar las preguntas. Por favor, inténtalo de nuevo más tarde.</p>
            </div>
        `;
  }
}

function showQuestion(index) {
  const container = document.getElementById("quiz-container");
  if (!container || index >= preguntas.length) return;

  const q = preguntas[index];

  let html = `
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
    `;

  q.options.forEach((option, i) => {
    html += `
            <li class="option-item">
                <label class="option-label">
                    <input type="radio" name="answer" value="${option}" class="option-input"/>
                    <span class="option-text">${option}</span>
                </label>
            </li>`;
  });

  html += `
                </ul>
            </div>
            <div id="feedback-${index}" class="quiz-feedback"></div>
            <div id="explanation-${index}" class="quiz-explanation"></div>
        </div>
    `;

  container.innerHTML = html;

  // Renderizar fórmulas matemáticas
  renderLatex(container);

  // Listener para seleccionar respuesta
  document.querySelectorAll(`#options-${index} input`).forEach((input) => {
    input.addEventListener("change", () => {
      checkAnswer(index);
    });
  });
}

function checkAnswer(index) {
  const selected = document.querySelector(`#options-${index} input:checked`);
  const feedbackDiv = document.getElementById(`feedback-${index}`);
  const explanationDiv = document.getElementById(`explanation-${index}`);
  const nextButton = document.getElementById("next-question");

  if (!selected) return;

  const answer = selected.value;
  const correctAnswer = preguntas[index].answer;
  const isCorrect = answer === correctAnswer;

  // Feedback visual
  feedbackDiv.innerHTML = isCorrect
    ? '<span style="color: green;">✔️ ¡Correcto!</span>'
    : '<span style="color: red;">❌ Incorrecto</span>';

  // Explicación
  explanationDiv.innerHTML = `<strong>Explicación:</strong> ${preguntas[index].explanation}`;

  // Destacar opción correcta
  document.querySelectorAll(`#options-${index} label`).forEach((label) => {
    label.style.backgroundColor = "";
    if (label.textContent.trim() === correctAnswer) {
      label.style.backgroundColor = "#d4f8e0"; // Verde suave
    }
  });

  // Habilitar botón siguiente
  if (!nextButton) {
    const btn = document.createElement("button");
    btn.id = "next-question";
    btn.innerText = "Siguiente";
    btn.classList.add("dropdown-btn");
    btn.onclick = () => {
      currentQuestionIndex++;
      saveProgress();
      document.getElementById("quiz-container").innerHTML = ""; // Limpiar
      if (currentQuestionIndex < preguntas.length) {
        showQuestion(currentQuestionIndex);
      } else {
        showFinalScore();
      }
    };
    document.querySelector(".dashboard").appendChild(btn);
  } else {
    nextButton.style.display = "inline-block";
  }

  // Registrar puntaje solo si no ha sido respondido antes
  if (isCorrect && !localStorage.getItem(`answered-${index}`)) {
    score++;
    localStorage.setItem(`answered-${index}`, "correct");
  }
}

function showFinalScore() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = `
    <div class="dashboard__result">
      <h2>🎉 Has terminado el cuestionario</h2>
      <p>Tu puntuación: ${score}/${preguntas.length}</p>
      <button class="dropdown-btn" onclick="restartQuiz()">Reiniciar</button>
    </div>
  `;
  localStorage.setItem("quiz-completed", "true");
  localStorage.setItem("quiz-score", score.toString());
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  localStorage.removeItem("quiz-completed");
  localStorage.removeItem("quiz-score");
  document.getElementById("quiz-container").innerHTML = "";
  document.querySelector(".dashboard__result")?.remove();
  loadQuestions();
}

function saveProgress() {
  localStorage.setItem("question-index", currentQuestionIndex.toString());
  localStorage.setItem("quiz-score", score.toString());
}

function loadProgress() {
  const completed = localStorage.getItem("quiz-completed");
  if (completed === "true") {
    const savedScore = localStorage.getItem("quiz-score") || "0";
    document.getElementById("quiz-container").innerHTML = `
      <div class="dashboard__result">
        <h2>👋 Ya completaste este cuestionario</h2>
        <p>Tu último puntaje fue: ${savedScore}/${preguntas.length}</p>
        <button class="dropdown-btn" onclick="restartQuiz()">Volver a hacer</button>
      </div>
    `;
    return true;
  }

  const index = localStorage.getItem("question-index");
  currentQuestionIndex = index ? parseInt(index, 10) : 0;
  return false;
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  loadQuestions();
});
