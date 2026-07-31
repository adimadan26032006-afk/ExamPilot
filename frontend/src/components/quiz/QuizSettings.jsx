export default function QuizSettings({
    quizType,
    setQuizType,
    difficulty,
    setDifficulty,
    loading,
    onStart,
}) {

    return (

        <div>

            <h2>Quiz Settings</h2>

            <hr />

            <h3>Quiz Type</h3>

            <select
                value={quizType}
                onChange={(e) =>
                    setQuizType(e.target.value)
                }
            >
                <option>Quick Quiz</option>
                <option>Standard Quiz</option>
                <option>Full Mock Test</option>
            </select>

            <br /><br />

            <h3>Difficulty</h3>

            <select
                value={difficulty}
                onChange={(e) =>
                    setDifficulty(e.target.value)
                }
            >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
            </select>

            <br /><br />

            <button
                onClick={onStart}
                disabled={loading}
            >
                {loading
                    ? "Generating Quiz..."
                    : "🚀 Start Quiz"}
            </button>

        </div>

    );

}