import { useState } from "react";
import SubjectiveEvaluation
from "./SubjectiveEvaluation";

export default function SubjectiveMockTest({
    exam,
    onBack,
}) {
    const [questionCount, setQuestionCount] =
        useState(5);

    const [difficulty, setDifficulty] =
        useState("Mixed");

    const [loading, setLoading] =
        useState(false);

    const [test, setTest] =
        useState(null);

    const [answers, setAnswers] =
    useState({});
    const [evaluation, setEvaluation] =
    useState(null);
    const [evaluationError, setEvaluationError] =
    useState(null);

    const [evaluating, setEvaluating] =
    useState(false);
    const [showEvaluation,
    setShowEvaluation] =
    useState(false);
    const [showAnswers, setShowAnswers] =
    useState({});

    async function generateTest() {
        try {
            setLoading(true);

            const response = await fetch(
                `http://127.0.0.1:8000/exams/${exam.id}/subjective-test`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        question_count:
                            questionCount,
                        difficulty,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail
                );
            }

            setTest(data);
        } catch (error) {
            console.error(error);

            alert(
                "Failed to generate subjective test."
            );
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    padding: "40px",
                    background:
                        "#0B0F14",
                    color: "white",
                }}
            >
                <button
                    onClick={onBack}
                >
                    ← Back
                </button>

                <h1>
                    📝 Generating
                    Subjective Test...
                </h1>
            </div>
        );
    }

    if (!test) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    padding: "40px",
                    background:
                        "#0B0F14",
                    color: "white",
                }}
            >
                <button
                    onClick={onBack}
                >
                    ← Back
                </button>

                <h1>
                    📝 Subjective
                    Mock Test
                </h1>

                <div
                    className="card"
                    style={{
                        marginTop:
                            "25px",
                    }}
                >
                    <h2>
                        Number of
                        Questions
                    </h2>

                    <select
                        value={
                            questionCount
                        }
                        onChange={(
                            e
                        ) =>
                            setQuestionCount(
                                Number(
                                    e
                                        .target
                                        .value
                                )
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
                    </select>

                    <h2
                        style={{
                            marginTop:
                                "20px",
                        }}
                    >
                        Difficulty
                    </h2>

                    <select
                        value={
                            difficulty
                        }
                        onChange={(
                            e
                        ) =>
                            setDifficulty(
                                e
                                    .target
                                    .value
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
                        style={{
                            marginTop:
                                "25px",
                        }}
                        onClick={
                            generateTest
                        }
                    >
                        Generate
                        Subjective
                        Test
                    </button>
                </div>
            </div>
        );
    }
    async function submitAnswers() {

    setEvaluating(true);
    setEvaluationError(null);

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/exams/${exam.id}/evaluate-subjective`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    questions:
                        test.questions,
                    answers:
                        answers,
                }),
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to evaluate answers."
            );
        }

        if (
            typeof data.obtained_marks !== "number" ||
            typeof data.total_marks !== "number" ||
            !Array.isArray(data.feedback)
        ) {
            throw new Error("The evaluation response was invalid.");
        }

        setEvaluation(data);
        setShowEvaluation(true);

    } catch (error) {

        console.error(error);
        setEvaluationError(
            error.message || "Failed to evaluate answers."
        );

    } finally {

        setEvaluating(false);

    }
}
    if (
    showEvaluation &&
    evaluation
) {

    return (

        <SubjectiveEvaluation
            evaluation={
                evaluation
            }
            onBack={() =>
                setShowEvaluation(false)
            }
        />

    );
}

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "40px",
                background:
                    "#0B0F14",
                color: "white",
            }}
        >
            <button
                onClick={onBack}
            >
                ← Back
            </button>

            <h1>
                {test.title}
            </h1>

            {test.questions?.map(
                (
                    question,
                    index
                ) => (
                    <div
                        key={index}
                        className="card"
                        style={{
                            marginTop:
                                "20px",
                        }}

                    >
                        <h2>
                            Q
                            {
                                question.number
                            }
                            .{" "}
                            {
                                question.question
                            }
                        </h2>

                        <p>
                            <strong>
                                Topic:
                            </strong>{" "}
                            {
                                question.topic
                            }
                        </p>

                        <p>
                            <strong>
                                Marks:
                            </strong>{" "}
                            {
                                question.marks
                            }
                        </p>

                        <textarea
    value={
        answers[index] || ""
    }
    onChange={(e) =>
        setAnswers({
            ...answers,
            [index]:
                e.target.value,
        })
    }
    placeholder="Write your answer here..."
    style={{
        width: "100%",
        minHeight: "180px",
        marginTop: "15px",
        padding: "12px",
        borderRadius: "8px",
    }}
/>
                    </div>
                )
            )}
            <div
    style={{
        marginTop: "30px",
        textAlign: "center",
    }}
>
    <button
    onClick={submitAnswers}
    disabled={evaluating}
>
    {evaluating ? "Evaluating..." : "Submit Answers"}
</button>
{evaluationError && (
    <p style={{ color: "#ef4444" }}>
        {evaluationError}
    </p>
)}
{
    evaluation && (
        <div
            className="card"
            style={{
                marginTop: "30px",
            }}
        >
            <h1
    style={{
        textAlign: "center",
        marginBottom: "20px",
    }}
>
    Evaluation Result
</h1>

<h2
    style={{
        textAlign: "center",
        fontSize: "40px",
        color:
            evaluation.obtained_marks /
                evaluation.total_marks >
            0.6
                ? "#22c55e"
                : "#ef4444",
    }}
>
    {evaluation.obtained_marks}/
    {evaluation.total_marks}
</h2>

<p
    style={{
        textAlign: "center",
        fontSize: "20px",
    }}
>
    {(
        (evaluation.obtained_marks /
            evaluation.total_marks) *
        100
    ).toFixed(1)}
    %
</p>

           {evaluation.feedback.map((item, index) => (
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
                            <h3>
                                Question {
                                    item.question_number
                                }
                            </h3>

                            <p>
                                Marks:
                                {" "}
                                {
                                    item.marks_awarded
                                }
                                /
                                {
                                    item.max_marks
                                }
                            </p>

                            <p>
                                <strong>
                                    Strengths:
                                </strong>
                                {" "}
                                {
                                    item.strengths
                                }
                            </p>

                            <p>
                                <strong>
                                    Weaknesses:
                                </strong>
                                {" "}
                                {
                                    item.weaknesses
                                }
                            </p>

                            <p>
                                <strong>
                                    Suggestion:
                                </strong>
                                {" "}
                                {
                                    item.suggestion
                                }
                            </p>
                        </div>
                    )
                )
            }
        </div>
    )
}
</div>
        </div>
    );
}