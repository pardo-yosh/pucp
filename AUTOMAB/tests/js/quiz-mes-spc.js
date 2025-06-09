let currentQuestionIndex = 0;
let score = 0;
let preguntas = [];

// Cargar preguntas desde JSON
async function loadQuestions() {
  try {
    const response = await fetch("json/tema6.json");
    if (!response.ok) throw new Error("No se pudo cargar el archivo");

    preguntas = await response.json();
    showQuestion(currentQuestionIndex);
  } catch (error) {
    console.error("Error al cargar las preguntas:", error);
    document.getElementById(
      "quiz-container"
    ).innerHTML = `<p>No se pudieron cargar las preguntas.</p>`;
  }
}

function showQuestion(index) {
  const container = document.getElementById("quiz-container");
  if (!container || index >= preguntas.length) return;

  const q = preguntas[index];

  let html = `
    <div class="question-card">
      <h3>Pregunta ${index + 1}: ${q.question}</h3>
      <ul class="options-list" id="options-${index}">
  `;

  q.options.forEach((option, i) => {
    html += `
      <li>
        <label>
          <input type="radio" name="answer" value="${option}" />
          ${option}
        </label>
      </li>`;
  });

  html += `
      </ul>
      <div id="feedback-${index}" class="quiz-feedback"></div>
      <div class="quiz-explanation" id="explanation-${index}"></div>
    </div>
  `;

  container.innerHTML = html;

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

    // Agregar estilos para centrar el botón
    btn.style.display = "block";
    btn.style.margin = "20px auto";
    btn.style.textAlign = "center";

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

    // Crear un contenedor centrado para el botón
    const buttonContainer = document.createElement("div");
    buttonContainer.style.textAlign = "center";
    buttonContainer.style.marginTop = "20px";
    buttonContainer.appendChild(btn);

    document.querySelector(".dashboard").appendChild(buttonContainer);
  } else {
    nextButton.style.display = "block";
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
    <div class="dashboard__result" style="text-align: center;">
      <h2>🎉 Has terminado el cuestionario</h2>
      <p>Tu puntuación: ${score}/${preguntas.length}</p>
      <button class="dropdown-btn" onclick="restartQuiz()" style="margin: 20px auto; display: block;">Reiniciar</button>
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
      <div class="dashboard__result" style="text-align: center;">
        <h2>👋 Ya completaste este cuestionario</h2>
        <p>Tu último puntaje fue: ${savedScore}/${preguntas.length}</p>
        <button class="dropdown-btn" onclick="restartQuiz()" style="margin: 20px auto; display: block;">Volver a hacer</button>
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
