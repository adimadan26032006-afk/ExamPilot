import { useState } from "react";
export default function SubjectiveEvaluation({
    evaluation,
    onBack,
}) {
    const [showAnswers, setShowAnswers] = useState({});

    return (

        <div
            style={{
                minHeight: "100vh",
                padding: "40px",
                background: "#0B0F14",
                color: "white",
            }}
        >

            <button
                onClick={onBack}
                style={{
                    marginBottom: "25px",
                }}
            >
                ← Back
            </button>

            <div
                className="card"
            >

                <h1>
                    📝 Subjective Evaluation
                </h1>

                <h2>
                    Score:
                    {" "}
                    {
                        evaluation.obtained_marks
                    }
                    /
                    {
                        evaluation.total_marks
                    }
                </h2>

            </div>

            {
                evaluation.feedback?.map(
                    (
                        item,
                        index
                    ) => (

                       <div
    key={index}
    className="card"
    style={{
        marginTop: "20px",
        padding: "20px",
        borderRadius: "12px",
        background: "#111827",
    }}
>
    <h2>
        Question {item.question_number}
    </h2>

    <p>
        <strong>Marks:</strong>{" "}
        {item.marks_awarded}/
        {item.max_marks}
    </p>

    <div
        style={{
            background: "#052e16",
            padding: "12px",
            borderRadius: "8px",
            marginTop: "10px",
        }}
    >
        ✅ Strengths: {item.strengths}
    </div>

    <div
        style={{
            background: "#450a0a",
            padding: "12px",
            borderRadius: "8px",
            marginTop: "10px",
        }}
    >
        ❌ Weaknesses: {item.weaknesses}
    </div>

    <div
        style={{
            background: "#1e3a8a",
            padding: "12px",
            borderRadius: "8px",
            marginTop: "10px",
        }}
    >
        💡 Suggestion: {item.suggestion}
    </div>

    <button
        style={{
            marginTop: "15px",
        }}
        onClick={() =>
            setShowAnswers({
                ...showAnswers,
                [index]:
                    !showAnswers[index],
            })
        }
    >
        {showAnswers[index]
            ? "Hide Model Answer"
            : "Show Model Answer"}
    </button>

    {showAnswers[index] && (
        <div
            style={{
                marginTop: "15px",
                background: "#0B1220",
                padding: "15px",
                borderRadius: "10px",
                whiteSpace: "pre-wrap",
                overflowX: "auto",
                textAlign: "left",
            }}
        >
            {item.ideal_answer}
        </div>
    )}

                        </div>

                    )
                )
            }

        </div>

    );
}