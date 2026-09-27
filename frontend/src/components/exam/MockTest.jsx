import { useState } from "react";

export default function MockTest({ exam, onBack }) {
    const [questionCount, setQuestionCount] = useState(10);
    const [difficulty, setDifficulty] = useState("Mixed");

    const [loading, setLoading] = useState(false);
    const [test, setTest] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    async function generateMockTest() {
        try {
            setLoading(true);
            setTest(null);
            setAnswers({});
            setCurrentQuestion(0);
            setSubmitted(false);
            setResult(null);

            const response = await fetch(
                `http://127.0.0.1:8000/exams/${exam.id}/mock-test`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        question_count: questionCount,
                        difficulty: difficulty,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to generate mock test");
            }

            const data = await response.json();

            console.log("Mock test:", data);

            setTest(data);
        } catch (error) {
            console.error("MOCK TEST ERROR:", error);

            alert(
                "Failed to generate mock test. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    function selectAnswer(optionIndex) {
        setAnswers({
            ...answers,
            [currentQuestion]: optionIndex,
        });
    }

    async function submitTest() {
        if (!test?.questions) {
            return;
        }

        let score = 0;
        let attempted = 0;
        let unanswered = 0;

        test.questions.forEach((question, index) => {
            if (answers[index] !== undefined) {
                attempted++;
            }

            if (answers[index] === undefined) {
                unanswered++;
            }

            if (
                answers[index] === question.answer
            ) {
                score++;
            }
        });

        const total = test.questions.length;

        const percentage =
            total > 0
                ? Math.round((score / total) * 100)
                : 0;

        const incorrect = attempted - score;
        let saveError = null;

        try {
            const response = await fetch(
                `http://localhost:8000/exams/${exam.id}/save-objective-attempt`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        score,
                        total_marks: total,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to save test attempt");
            }
        } catch (error) {
            console.error("ATTEMPT SAVE ERROR:", error);
            saveError = "Result calculated locally; saving the attempt failed.";
        }

        setResult({
    score,
    total,
    attempted,
    unanswered,
    incorrect,
    percentage,
    saveError,

    testDate: new Date().toLocaleString(),
});


        setSubmitted(true);
    }

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    padding: "40px",
                    background: "#0B0F14",
                    color: "white",
                    boxSizing: "border-box",
                }}
            >
                <button onClick={onBack}>
                    ← Back
                </button>

                <div
                    style={{
                        maxWidth: "900px",
                        margin: "80px auto",
                        background: "white",
                        color: "#111827",
                        borderRadius: "14px",
                        padding: "70px 40px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: "48px",
                            marginBottom: "20px",
                        }}
                    >
                        🧠
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            color: "#111827",
                        }}
                    >
                        Generating Mock Test
                    </h1>

                    <p
                        style={{
                            marginTop: "20px",
                            color: "#64748B",
                            fontSize: "17px",
                        }}
                    >
                        ExamPilot is creating an
                        exam-style test based on your
                        PYQs.
                    </p>

                    <p
                        style={{
                            color: "#94A3B8",
                        }}
                    >
                        This may take a few moments...
                    </p>
                </div>
            </div>
        );
    }

    if (!test) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    padding: "40px",
                    background: "#0B0F14",
                    color: "white",
                    boxSizing: "border-box",
                }}
            >
                <button onClick={onBack}>
                    ← Back
                </button>

                <div
                    style={{
                        maxWidth: "900px",
                        margin: "40px auto",
                    }}
                >
                    <h1>🎯 Mock Test</h1>

                    <p
                        style={{
                            color: "#94A3B8",
                            fontSize: "17px",
                        }}
                    >
                        Attempt a fresh exam-style test
                        based on the patterns found in
                        your previous-year questions.
                    </p>

                    <div
                        className="card"
                        style={{
                            marginTop: "30px",
                        }}
                    >
                        <h2>
                            Number of Questions
                        </h2>

                        <select
                            value={questionCount}
                            onChange={(e) =>
                                setQuestionCount(
                                    Number(e.target.value)
                                )
                            }
                        >
                            <option value={5}>
                                5 Questions
                            </option>

                            <option value={10}>
                                10 Questions
                            </option>

                            <option value={15}>
                                15 Questions
                            </option>

                            <option value={20}>
                                20 Questions
                            </option>
                        </select>

                        <h2
                            style={{
                                marginTop: "25px",
                            }}
                        >
                            Difficulty
                        </h2>

                        <select
                            value={difficulty}
                            onChange={(e) =>
                                setDifficulty(
                                    e.target.value
                                )
                            }
                        >
                            <option value="Easy">
                                Easy
                            </option>

                            <option value="Moderate">
                                Moderate
                            </option>

                            <option value="Hard">
                                Hard
                            </option>

                            <option value="Mixed">
                                Mixed
                            </option>
                        </select>

                        <br />

                        <button
                            onClick={generateMockTest}
                            style={{
                                marginTop: "25px",
                                padding: "12px 24px",
                            }}
                        >
                            Start Mock Test
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (submitted && result) {
        const percentage = result.percentage;

        let performanceMessage = "";

        if (percentage >= 85) {
            performanceMessage =
                "Excellent performance. You have a strong grasp of the tested concepts.";
        } else if (percentage >= 70) {
            performanceMessage =
                "Good performance. Your fundamentals look solid, but there are still some areas to strengthen.";
        } else if (percentage >= 50) {
            performanceMessage =
                "Decent attempt, but several concepts need more revision before the exam.";
        } else {
            performanceMessage =
                "You should revise the core concepts and practice more questions before attempting another mock.";
        }

        const topicStats = {};

        test.questions.forEach(
            (question, index) => {
                const topic =
                    question.topic ||
                    "General";

                if (!topicStats[topic]) {
                    topicStats[topic] = {
                        correct: 0,
                        total: 0,
                    };
                }

                topicStats[topic].total++;

                if (
                    answers[index] ===
                    question.answer
                ) {
                    topicStats[topic].correct++;
                }
            }
        );

        const topicResults =
            Object.entries(topicStats).map(
                ([topic, stats]) => ({
                    topic,
                    percentage: Math.round(
                        (stats.correct /
                            stats.total) *
                            100
                    ),
                    correct: stats.correct,
                    total: stats.total,
                })
            );

        const weakTopics =
            topicResults.filter(
                (topic) =>
                    topic.percentage < 60
            );

        const strongTopics =
            topicResults.filter(
                (topic) =>
                    topic.percentage >= 80
            );

        return (
            <div
                style={{
                    minHeight: "100vh",
                    padding: "40px",
                    background: "#0B0F14",
                    color: "white",
                    boxSizing: "border-box",
                }}
            >
                <button onClick={onBack}>
                    ← Back
                </button>

                <div
                    style={{
                        maxWidth: "950px",
                        margin: "45px auto",
                    }}
                >
                    {/* RESULT HEADER */}

                    <div
                        className="card"
                        style={{
                            textAlign: "center",
                            padding: "40px 30px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "46px",
                            }}
                        >
                            {percentage >= 70
                                ? "🎉"
                                : "📚"}
                        </div>

                        <h1>
                            Mock Test Completed
                        </h1>

                        <div
                            style={{
                                fontSize: "48px",
                                fontWeight: "700",
                                margin: "20px 0 5px",
                            }}
                        >
                            {result.score} /{" "}
                            {result.total}
                        </div>
                        <p
    style={{
        fontSize: "20px",
        fontWeight: "600",
        marginTop: "10px",
    }}
>
    {result.percentage >= 80
        ? "🔥 Excellent Performance"
        : result.percentage >= 60
        ? "✅ Good Performance"
        : result.percentage >= 40
        ? "⚠️ Needs Improvement"
        : "🚨 Serious Revision Needed"}
</p>

                        <div
                            style={{
                                fontSize: "22px",
                                color: "#64748B",
                            }}
                        >
                            {percentage}%
                        </div>

                        {result.saveError && (
                            <p style={{ color: "#f59e0b" }}>
                                {result.saveError}
                            </p>
                        )}

                        <p
                            style={{
                                marginTop: "20px",
                                color: "#94A3B8",
                                fontSize: "16px",
                                lineHeight: "1.6",
                            }}
                        >
                            {performanceMessage}
                        </p>
                    </div>

                    {/* QUICK STATS */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit,minmax(180px,1fr))",
                            gap: "15px",
                            marginTop: "20px",
                        }}
                    >
                        <div
                            className="card"
                            style={{
                                textAlign: "center",
                            }}
                        >
                            <h3>✓ Correct</h3>

                            <p
                                style={{
                                    fontSize: "28px",
                                    color: "#16A34A",
                                    fontWeight: "700",
                                }}
                            >
                                {result.score}
                            </p>
                        </div>

                        <div
                            className="card"
                            style={{
                                textAlign: "center",
                            }}
                        >
                            <h3>✗ Incorrect</h3>

                            <p
                                style={{
                                    fontSize: "28px",
                                    color: "#DC2626",
                                    fontWeight: "700",
                                }}
                            >
                                {result.incorrect}
                            </p>
                        </div>

                        <div
                            className="card"
                            style={{
                                textAlign: "center",
                            }}
                        >
                            <h3>📝 Attempted</h3>

                            <p
                                style={{
                                    fontSize: "28px",
                                    fontWeight: "700",
                                }}
                            >
                                {result.attempted}
                            </p>
                        </div>

                        <div
                            className="card"
                            style={{
                                textAlign: "center",
                            }}
                        >
                            <h3>⭕ Unanswered</h3>

                            <p
                                style={{
                                    fontSize: "28px",
                                    color: "#F59E0B",
                                    fontWeight: "700",
                                }}
                            >
                                {result.unanswered}
                            </p>
                        </div>
                    </div>

                    {/* ANALYSIS */}

                    <div
                        className="card"
                        style={{
                            marginTop: "25px",
                        }}
                    >
                        <h2>📊 Performance Analysis</h2>

                        <p
                            style={{
                                color: "#CBD5E1",
                                lineHeight: "1.7",
                            }}
                        >
                            {percentage >= 70
                                ? "You are performing reasonably well across the tested material."
                                : "Your score suggests that some core areas need additional revision and practice."}
                        </p>

                        {strongTopics.length > 0 && (
                            <>
                                <h3
                                    style={{
                                        marginTop: "25px",
                                    }}
                                >
                                    💪 Strong Areas
                                </h3>

                                {strongTopics.map(
                                    (topic) => (
                                        <p
                                            key={
                                                topic.topic
                                            }
                                            style={{
                                                color: "#16A34A",
                                            }}
                                        >
                                            ✓{" "}
                                            {topic.topic}{" "}
                                            —{" "}
                                            {
                                                topic.percentage
                                            }%
                                        </p>
                                    )
                                )}
                            </>
                        )}

                        {weakTopics.length > 0 && (
                            <>
                                <h3
                                    style={{
                                        marginTop: "25px",
                                    }}
                                >
                                    ⚠️ Areas to Improve
                                </h3>

                                {weakTopics.map(
                                    (topic) => (
                                        <p
                                            key={
                                                topic.topic
                                            }
                                            style={{
                                                color: "#F59E0B",
                                            }}
                                        >
                                            •{" "}
                                            {topic.topic}{" "}
                                            —{" "}
                                            {
                                                topic.percentage
                                            }%
                                        </p>
                                    )
                                )}
                            </>
                        )}
                    </div>

                    {/* SUGGESTIONS */}

                    <div
                        className="card"
                        style={{
                            marginTop: "25px",
                        }}
                    >
                        <h2>🎯 What You Should Do Next</h2>

                        {result.unanswered > 0 && (
                            <p
                                style={{
                                    lineHeight: "1.7",
                                }}
                            >
                                • Try to attempt every
                                question. Unanswered
                                questions are costing you
                                potential marks.
                            </p>
                        )}

                        {result.incorrect > 0 && (
                            <p
                                style={{
                                    lineHeight: "1.7",
                                }}
                            >
                                • Review the concepts behind
                                the questions you got wrong
                                instead of only memorizing
                                the correct answers.
                            </p>
                        )}

                        {result.weakTopics?.length > 0 && (
    <>
        {result.weakTopics.map((topic) => (
            <p
                key={topic.topic}
                style={{
                    lineHeight: "1.7",
                }}
            >
                • Revise{" "}
                <strong>
                    {topic.topic}
                </strong>
                {" "}
                ({topic.percentage}% incorrect).
            </p>
        ))}
    </>
)}
                        <p
    style={{
        lineHeight: "1.7",
    }}
>
    • Focus on understanding concepts behind incorrect answers rather than memorizing solutions.
</p>
                        <p
                            style={{
                                lineHeight: "1.7",
                            }}
                        >
                            • After revising your weak areas,
                            attempt another mock test and
                            compare your performance.
                        </p>
                    </div>

                    {/* ANSWER REVIEW */}

                    <h2
                        style={{
                            marginTop: "40px",
                        }}
                    >
                        📝 Answer Review
                    </h2>

                    {test.questions.map(
                        (question, index) => {
                            const userAnswer =
                                answers[index];

                            const correct =
                                userAnswer ===
                                question.answer;

                            return (
                                <div
                                    className="card"
                                    key={index}
                                    style={{
                                        marginTop: "18px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            lineHeight:
                                                "1.6",
                                        }}
                                    >
                                        Q{index + 1}.{" "}
                                        {
                                            question.question
                                        }
                                    </h3>

                                    <p>
                                        <strong>
                                            Your answer:
                                        </strong>{" "}
                                        {question
                                            .options?.[
                                            userAnswer
                                        ] ||
                                            "Not attempted"}
                                    </p>

                                    <p>
                                        <strong>
                                            Correct answer:
                                        </strong>{" "}
                                        {
                                            question
                                                .options?.[
                                                question
                                                    .answer
                                            ]
                                        }
                                    </p>

                                    <p
                                        style={{
                                            color: correct
                                                ? "#16A34A"
                                                : "#DC2626",
                                            fontWeight:
                                                "600",
                                        }}
                                    >
                                        {correct
                                            ? "✓ Correct"
                                            : "✗ Incorrect"}
                                    </p>

                                    {question.explanation && (
                                        <div
                                            style={{
                                                marginTop:
                                                    "15px",
                                                padding:
                                                    "15px",
                                                background:
                                                    "#F8FAFC",
                                                color:
                                                    "#334155",
                                                borderRadius:
                                                    "8px",
                                                lineHeight:
                                                    "1.7",
                                            }}
                                        >
                                            <strong>
                                                Explanation
                                            </strong>

                                            <p>
                                                {
                                                    question.explanation
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>
            </div>
        );
    }

    const question =
        test.questions[currentQuestion];

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "40px",
                background: "#0B0F14",
                color: "white",
                boxSizing: "border-box",
            }}
        >
            <button onClick={onBack}>
                ← Back
            </button>

            <div
                style={{
                    maxWidth: "950px",
                    margin: "40px auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom: "25px",
                    }}
                >
                    <h1>🎯 Mock Test</h1>

                    <span
                        style={{
                            color: "#94A3B8",
                        }}
                    >
                        Question{" "}
                        {currentQuestion + 1} of{" "}
                        {test.questions.length}
                    </span>
                </div>

                <div className="card">
                    <h2
                        style={{
                            lineHeight: "1.6",
                        }}
                    >
                        Q{currentQuestion + 1}.{" "}
                        {question.question}
                    </h2>

                    {question.options?.map(
                        (option, optionIndex) => (
                            <button
                                key={optionIndex}
                                onClick={() =>
                                    selectAnswer(
                                        optionIndex
                                    )
                                }
                                style={{
                                    display: "block",
                                    width: "100%",
                                    textAlign: "left",
                                    marginTop: "12px",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    border:
                                        answers[
                                            currentQuestion
                                        ] === optionIndex
                                            ? "2px solid #252ceb56"
                                            : "1px solid #882df7db",
                                    background:
                                        answers[
                                            currentQuestion
                                        ] === optionIndex
                                            ? "#0b5dd8e1"
                                            : "grey",
                                    color: "#111827",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                }}
                            >
                                <strong>
                                    {String.fromCharCode(
                                        65 +
                                            optionIndex
                                    )}
                                    .
                                </strong>{" "}
                                {option}
                            </button>
                        )
                    )}
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        marginTop: "25px",
                    }}
                >
                    <button
                        disabled={
                            currentQuestion === 0
                        }
                        onClick={() =>
                            setCurrentQuestion(
                                currentQuestion - 1
                            )
                        }
                    >
                        ← Previous
                    </button>

                    {currentQuestion <
                    test.questions.length - 1 ? (
                        <button
                            onClick={() =>
                                setCurrentQuestion(
                                    currentQuestion + 1
                                )
                            }
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={submitTest}
                            style={{
                                background: "#16A34A",
                                color: "white",
                            }}
                        >
                            Submit Test
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}