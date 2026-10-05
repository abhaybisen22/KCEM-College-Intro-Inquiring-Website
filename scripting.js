// scripting.js (updated)
const API_BASE = 'api';

async function fetchQuestions() {
    try {
        const res = await fetch(`${API_BASE}/get_questions.php`);
        const data = await res.json();
        if (data.success) {
            renderQuestionsFromData(data.questions);
        } else {
            console.error('Failed to fetch:', data);
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

async function addQuestion() {
    const questionInput = document.getElementById('question');
    const text = questionInput.value.trim();
    if (!text) return alert('Please write a question.');

    try {
        const res = await fetch(`${API_BASE}/add_question.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await res.json();
        if (data.success) {
            questionInput.value = '';
            await fetchQuestions(); // refresh list
        } else {
            alert('Could not add question: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
        alert('Request failed.');
    }
}

async function addAnswer(questionId) {
    const input = document.getElementById(`answer-for-${questionId}`);
    if (!input) return;
    const text = input.value.trim();
    if (!text) return alert('Please write an answer.');

    try {
        const res = await fetch(`${API_BASE}/add_answer.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question_id: questionId, text })
        });
        const data = await res.json();
        if (data.success) {
            input.value = '';
            await fetchQuestions();
        } else {
            alert('Could not add answer: ' + (data.error || 'Unknown'));
        }
    } catch (err) {
        console.error(err);
        alert('Request failed.');
    }
}

function toggleAnswersDOM(questionIndex) {
    const answersContainer = document.getElementById(`answers-container-${questionIndex}`);
    const btn = document.getElementById(`toggle-button-${questionIndex}`);
    if (!answersContainer || !btn) return;
    if (answersContainer.style.display === 'none' || answersContainer.style.display === '') {
        answersContainer.style.display = 'block';
        btn.textContent = 'see less';
    } else {
        answersContainer.style.display = 'none';
        btn.textContent = 'see more';
    }
}

function renderQuestionsFromData(questions) {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    if (!questions.length) {
        container.innerHTML = '<p>No questions yet — be the first to ask!</p>';
        return;
    }

    questions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'question-item';

        const title = document.createElement('h3');
        title.textContent = q.text;
        item.appendChild(title);

        // visible first two answers
        const visibleDiv = document.createElement('div');
        visibleDiv.className = 'answers';
        const visible = (q.answers || []).slice(0, 2);
        visible.forEach(a => {
            const aDiv = document.createElement('div');
            aDiv.className = 'answer';
            aDiv.textContent = a.text;
            visibleDiv.appendChild(aDiv);
        });
        item.appendChild(visibleDiv);

        // hidden rest
        if ((q.answers || []).length > 2) {
            const hiddenDiv = document.createElement('div');
            hiddenDiv.className = 'answers';
            hiddenDiv.id = `answers-container-${index}`;
            hiddenDiv.style.display = 'none';
            const hidden = q.answers.slice(2);
            hidden.forEach(a => {
                const aDiv = document.createElement('div');
                aDiv.className = 'answer';
                aDiv.textContent = a.text;
                hiddenDiv.appendChild(aDiv);
            });
            item.appendChild(hiddenDiv);

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-button';
            toggleBtn.id = `toggle-button-${index}`;
            toggleBtn.textContent = 'see more';
            toggleBtn.onclick = () => toggleAnswersDOM(index);
            item.appendChild(toggleBtn);
        }

        // answer input
        const answerInput = document.createElement('div');
        answerInput.className = 'answer-input';
        answerInput.innerHTML = `
            <input type="text" id="answer-for-${q.id}" placeholder="Write an answer...">
            <button id="ans-btn-${q.id}">Answer</button>
        `;
        item.appendChild(answerInput);
        container.appendChild(item);

        // attach click handler
        document.getElementById(`ans-btn-${q.id}`).addEventListener('click', () => addAnswer(q.id));
    });
}

// attach addQuestion to the button in DOM when loaded
document.addEventListener('DOMContentLoaded', () => {
    // override inline handler safety: remove onclick from HTML or keep both
    const askBtn = document.querySelector('.question-input button');
    if (askBtn) {
        askBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addQuestion();
        });
    }
    fetchQuestions();

    // Optional: poll for updates every 20 seconds
    setInterval(fetchQuestions, 20000);
});
