let vocabulary = [];
let score = 0;
let totalQuestions = 0;
let correctAnswer = '';

async function loadVocabulary() {
    try {
        const response = await fetch('vocabulary.json');
        if (!response.ok) throw new Error('Không thể tải file JSON');
        vocabulary = await response.json();
        if (!Array.isArray(vocabulary) || vocabulary.length === 0) {
            throw new Error('Dữ liệu JSON không hợp lệ');
        }
        loadNextQuestion();
    } catch (error) {
        document.getElementById('result').textContent = error.message;
    }
}

function generateQuestion() {
    totalQuestions++;
    const entry = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    let qText, correctWord, options;

    if (typeof entry === 'object' && entry.word && entry.definition) {
        qText = `Definition: ${entry.definition}`;
        correctWord = entry.word;
        if (entry.options && Array.isArray(entry.options) && entry.options.length === 4) {
            options = [...entry.options];
            options.sort(() => Math.random() - 0.5);
        } else {
            const distractors = vocabulary
                .filter(e => e.word !== correctWord && e.word)
                .map(e => e.word);
            const selectedDistractors = distractors.length >= 3 
                ? distractors.sort(() => Math.random() - 0.5).slice(0, 3)
                : distractors.length > 0 
                    ? Array(3).fill().map((_, i) => distractors[i % distractors.length])
                    : ['Option1', 'Option2', 'Option3'];
            options = [...selectedDistractors, correctWord];
            options.sort(() => Math.random() - 0.5);
        }
    } else if (Array.isArray(entry) && entry.length >= 2) {
        qText = `Definition: ${entry[1]}`;
        correctWord = entry[0];
        const distractors = vocabulary
            .filter(e => Array.isArray(e) && e[0] !== correctWord && e[0])
            .map(e => e[0]);
        const selectedDistractors = distractors.length >= 3 
            ? distractors.sort(() => Math.random() - 0.5).slice(0, 3)
            : distractors.length > 0 
                ? Array(3).fill().map((_, i) => distractors[i % distractors.length])
                : ['Option1', 'Option2', 'Option3'];
        options = [...selectedDistractors, correctWord];
        options.sort(() => Math.random() - 0.5);
    } else {
        throw new Error('Dữ liệu không hỗ trợ');
    }

    return { qText, correctWord, options };
}

function loadNextQuestion() {
    try {
        const { qText, correctWord, options } = generateQuestion();
        correctAnswer = correctWord;
        document.getElementById('question').textContent = `Câu ${totalQuestions}: ${qText}`;
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach((btn, index) => {
            btn.textContent = options[index];
            btn.classList.remove('correct', 'incorrect', 'correct-answer');
            btn.disabled = false;
            btn.onclick = () => checkAnswer(btn, options[index]);
        });
        document.getElementById('result').textContent = '';
        document.getElementById('restart-btn').style.display = 'none';
    } catch (error) {
        document.getElementById('result').textContent = error.message;
    }
}

function checkAnswer(button, answer) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);

    if (answer === correctAnswer) {
        score++;
        button.classList.add('correct');
        document.getElementById('result').textContent = `Đúng! Điểm: ${score}/${totalQuestions}`;
        setTimeout(loadNextQuestion, 1000);
    } else {
        button.classList.add('incorrect');
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct-answer');
            }
        });
        showFinalResult();
    }
}

function showFinalResult() {
    document.getElementById('result').textContent = `Đáp án sai!\nĐáp án đúng là: ${correctAnswer}\nBạn trả lời đúng ${score} câu.`;
    document.getElementById('restart-btn').style.display = 'block';
}

function restartQuiz() {
    score = 0;
    totalQuestions = 0;
    loadNextQuestion();
}

document.getElementById('restart-btn').onclick = restartQuiz;
window.onload = loadVocabulary;