export default function ExamModeSelector({
    onPractice,
    onObjectiveTest,
    onSubjectiveTest,
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns:
                    "repeat(auto-fit,minmax(280px,1fr))",
                gap: "20px",
                marginTop: "30px",
            }}
        >
            <div className="card">
                <h2>📖 Practice Mode</h2>

                <p>
                    Generate questions with
                    answers and explanations
                    visible immediately.
                </p>

                <button
                    onClick={onPractice}
                >
                    Start Practice
                </button>
            </div>

            <div className="card">
                <h2>🎯 Objective Test</h2>

                <p>
                    Attempt a timed MCQ-style
                    mock test based on PYQ
                    patterns.
                </p>

                <button
                    onClick={onObjectiveTest}
                >
                    Start Objective Test
                </button>
            </div>

            <div className="card">
                <h2>📝 Subjective Test</h2>

                <p>
                    Attempt university-style
                    long answer questions and
                    evaluate your writing.
                </p>

                <button
    onClick={() => {
        console.log("SUBJECTIVE CLICK");
        onSubjectiveTest();
    }}
></button>
            </div>
        </div>
    );
}