import { useState } from "react";

export default function PracticePaper({ exam, onBack }) {
    const [questionCount, setQuestionCount] = useState(10);
    const [difficulty, setDifficulty] = useState("Mixed");
    const [loading, setLoading] = useState(false);
    const [paper, setPaper] = useState(null);
    const [showSolutions, setShowSolutions] = useState(false);

    async function generatePaper() {
        try {
            setLoading(true);
            setPaper(null);
            setShowSolutions(false);

            const response = await fetch(
                `http://127.0.0.1:8000/exams/${exam.id}/practice-paper`,
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
                throw new Error("Failed to generate practice paper");
            }

            const data = await response.json();

            console.log("Practice paper:", data);

            setPaper(data.paper);

        } catch (error) {
            console.error("Practice paper error:", error);
            alert("Failed to generate practice paper.");
        } finally {
            setLoading(false);
        }
    }
    function renderSolution(solution) {
    if (!solution) {
        return (
            <p
                style={{
                    color: "#64748B",
                    lineHeight: "1.7",
                }}
            >
                Solution not available.
            </p>
        );
    }

    // Simple string solution
    if (typeof solution === "string") {
        return solution.split("\n").map((line, index) => (
            <p
                key={index}
                style={{
                    margin: "8px 0",
                    lineHeight: "1.7",
                    whiteSpace: "pre-wrap",
                }}
            >
                {line}
            </p>
        ));
    }

    // Structured solution
    if (typeof solution === "object") {
        return (
            <div>
                {/* STEPS */}

                {Array.isArray(solution.steps) &&
                    solution.steps.map((step, index) => (
                        <div
                            key={index}
                            style={{
                                marginBottom: "28px",
                            }}
                        >
                            <h4
                                style={{
                                    marginBottom: "10px",
                                    color: "#111827",
                                    fontSize: "17px",
                                }}
                            >
                                {step.title ||
                                    `Step ${index + 1}`}
                            </h4>

                            {Array.isArray(step.content) ? (
                                step.content.map(
                                    (line, lineIndex) => (
                                        <p
                                            key={lineIndex}
                                            style={{
                                                margin:
                                                    "7px 0",
                                                lineHeight:
                                                    "1.7",
                                                color:
                                                    "#334155",
                                                whiteSpace:
                                                    "pre-wrap",
                                            }}
                                        >
                                            {line}
                                        </p>
                                    )
                                )
                            ) : (
                                <p
                                    style={{
                                        margin: 0,
                                        lineHeight: "1.7",
                                        color: "#334155",
                                        whiteSpace:
                                            "pre-wrap",
                                    }}
                                >
                                    {step.content}
                                </p>
                            )}
                        </div>
                    ))}

                {/* FINAL ANSWER */}

                {solution.final_answer && (
                    <div
                        style={{
                            marginTop: "25px",
                            paddingTop: "20px",
                            borderTop:
                                "1px solid #CBD5E1",
                        }}
                    >
                        <h4
                            style={{
                                marginBottom: "10px",
                                color: "#111827",
                                fontSize: "18px",
                            }}
                        >
                            Final Answer
                        </h4>

                        <p
                            style={{
                                margin: 0,
                                lineHeight: "1.8",
                                color: "#111827",
                                fontWeight: "500",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {solution.final_answer}
                        </p>
                    </div>
                )}

                {/* FALLBACK FOR OTHER OBJECT STRUCTURES */}

                {!solution.steps &&
                    !solution.final_answer &&
                    Object.entries(solution).map(
                        ([key, value], index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: "15px",
                                }}
                            >
                                <strong
                                    style={{
                                        color: "#111827",
                                        textTransform:
                                            "capitalize",
                                    }}
                                >
                                    {key.replaceAll(
                                        "_",
                                        " "
                                    )}
                                </strong>

                                <p
                                    style={{
                                        marginTop: "6px",
                                        lineHeight: "1.7",
                                        color: "#334155",
                                        whiteSpace:
                                            "pre-wrap",
                                    }}
                                >
                                    {typeof value ===
                                    "string"
                                        ? value
                                        : JSON.stringify(
                                              value,
                                              null,
                                              2
                                          )}
                                </p>
                            </div>
                        )
                    )}
            </div>
        );
    }

    return String(solution);
}

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#0B0F14",
                    padding: "40px",
                    color: "white",
                    boxSizing: "border-box",
                }}
            >
                <button
                    onClick={onBack}
                    style={{
                        padding: "12px 24px",
                        borderRadius: "24px",
                        border: "1px solid #0EA5E9",
                        background: "#0B0F14",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "15px",
                    }}
                >
                    ← Back
                </button>

                <div
                    style={{
                        maxWidth: "1100px",
                        margin: "40px auto",
                        background: "#FFFFFF",
                        color: "#111827",
                        borderRadius: "14px",
                        padding: "80px 60px",
                        boxSizing: "border-box",
                        textAlign: "center",
                        boxShadow:
                            "0 20px 50px rgba(0,0,0,0.35)",
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
                            fontSize: "36px",
                        }}
                    >
                        Generating Practice Paper
                    </h1>

                    <p
                        style={{
                            marginTop: "20px",
                            color: "#475569",
                            fontSize: "18px",
                        }}
                    >
                        ExamPilot is using your PYQs to create
                        a fresh exam-style paper.
                    </p>

                    <p
                        style={{
                            marginTop: "25px",
                            color: "#64748B",
                            fontSize: "16px",
                        }}
                    >
                        This may take a few moments...
                    </p>
                </div>
            </div>
        );
    }

    if (paper) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#0B0F14",
                    padding: "35px 20px 60px",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        maxWidth: "1100px",
                        margin: "0 auto",
                    }}
                >
                    <button
                        onClick={onBack}
                        style={{
                            padding: "12px 24px",
                            borderRadius: "24px",
                            border: "1px solid #0EA5E9",
                            background: "#0B0F14",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "15px",
                            marginBottom: "25px",
                        }}
                    >
                        ← Back
                    </button>

                    {/* PAPER */}
                    <div
                        style={{
                            background: "#FFFFFF",
                            color: "#111827",
                            borderRadius: "8px",
                            padding: "60px 70px",
                            boxSizing: "border-box",
                            boxShadow:
                                "0 20px 50px rgba(0,0,0,0.35)",
                        }}
                    >
                        {/* PAPER HEADER */}

                        <div
                            style={{
                                textAlign: "center",
                                borderBottom:
                                    "2px solid #CBD5E1",
                                paddingBottom: "25px",
                                marginBottom: "30px",
                            }}
                        >
                            <h1
                                style={{
                                    margin: 0,
                                    color: "#111827",
                                    fontSize: "32px",
                                    fontWeight: "700",
                                }}
                            >
                                {paper.title ||
                                    "PYQ-Based Practice Paper"}
                            </h1>

                            <p
                                style={{
                                    marginTop: "12px",
                                    marginBottom: 0,
                                    color: "#334155",
                                    fontSize: "18px",
                                }}
                            >
                                {exam.name}
                            </p>

                            <p
                                style={{
                                    marginTop: "7px",
                                    marginBottom: 0,
                                    color: "#64748B",
                                    fontSize: "14px",
                                }}
                            >
                                Generated by ExamPilot
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "12px",
                                    flexWrap: "wrap",
                                    marginTop: "18px",
                                }}
                            >
                                <span
                                    style={{
                                        padding: "7px 12px",
                                        background: "#EFF6FF",
                                        color: "#1D4ED8",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                    }}
                                >
                                    Questions:{" "}
                                    {paper.questions?.length || 0}
                                </span>

                                <span
                                    style={{
                                        padding: "7px 12px",
                                        background: "#F1F5F9",
                                        color: "#334155",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                    }}
                                >
                                    Difficulty: {difficulty}
                                </span>
                            </div>
                        </div>

                        {/* INSTRUCTIONS */}

                        {paper.instructions?.length > 0 && (
                            <div
                                style={{
                                    background: "#F8FAFC",
                                    border:
                                        "1px solid #E2E8F0",
                                    borderRadius: "8px",
                                    padding: "22px 28px",
                                    marginBottom: "35px",
                                }}
                            >
                                <h2
                                    style={{
                                        marginTop: 0,
                                        marginBottom: "15px",
                                        color: "#111827",
                                        fontSize: "21px",
                                    }}
                                >
                                    Instructions
                                </h2>

                                <ul
                                    style={{
                                        margin: 0,
                                        paddingLeft: "22px",
                                        color: "#334155",
                                    }}
                                >
                                    {paper.instructions.map(
                                        (instruction, index) => (
                                            <li
                                                key={index}
                                                style={{
                                                    marginBottom:
                                                        "8px",
                                                    lineHeight:
                                                        "1.6",
                                                }}
                                            >
                                                {instruction}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* QUESTIONS */}

                        <div>
                            {paper.questions?.map(
                                (question, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            paddingBottom:
                                                "30px",
                                            marginBottom:
                                                "30px",
                                            borderBottom:
                                                index !==
                                                paper.questions
                                                    .length -
                                                    1
                                                    ? "1px solid #CBD5E1"
                                                    : "none",
                                        }}
                                    >
                                        {/* QUESTION NUMBER + TEXT */}

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "14px",
                                                alignItems:
                                                    "flex-start",
                                            }}
                                        >
                                            <strong
                                                style={{
                                                    minWidth:
                                                        "35px",
                                                    fontSize:
                                                        "18px",
                                                    color:
                                                        "#111827",
                                                }}
                                            >
                                                {question.number ||
                                                    index + 1}
                                                .
                                            </strong>

                                            <div
                                                style={{
                                                    flex: 1,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize:
                                                            "17px",
                                                        lineHeight:
                                                            "1.75",
                                                        color:
                                                            "#111827",
                                                        fontWeight:
                                                            "500",
                                                    }}
                                                >
                                                    {
                                                        question.question
                                                    }
                                                </div>

                                                {/* QUESTION TAGS */}

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap: "9px",
                                                        flexWrap:
                                                            "wrap",
                                                        marginTop:
                                                            "15px",
                                                    }}
                                                >
                                                    {question.topic && (
                                                        <span
                                                            style={{
                                                                padding:
                                                                    "6px 11px",
                                                                background:
                                                                    "#DBEAFE",
                                                                color:
                                                                    "#1D4ED8",
                                                                borderRadius:
                                                                    "6px",
                                                                fontSize:
                                                                    "13px",
                                                            }}
                                                        >
                                                            {
                                                                question.topic
                                                            }
                                                        </span>
                                                    )}

                                                    {question.type && (
                                                        <span
                                                            style={{
                                                                padding:
                                                                    "6px 11px",
                                                                background:
                                                                    "#E5E7EB",
                                                                color:
                                                                    "#374151",
                                                                borderRadius:
                                                                    "6px",
                                                                fontSize:
                                                                    "13px",
                                                            }}
                                                        >
                                                            {
                                                                question.type
                                                            }
                                                        </span>
                                                    )}

                                                    {question.difficulty && (
                                                        <span
                                                            style={{
                                                                padding:
                                                                    "6px 11px",
                                                                background:
                                                                    "#FEF3C7",
                                                                color:
                                                                    "#92400E",
                                                                borderRadius:
                                                                    "6px",
                                                                fontSize:
                                                                    "13px",
                                                            }}
                                                        >
                                                            {
                                                                question.difficulty
                                                            }
                                                        </span>
                                                    )}

                                                    {question.marks && (
                                                        <span
                                                            style={{
                                                                padding:
                                                                    "6px 11px",
                                                                background:
                                                                    "#DCFCE7",
                                                                color:
                                                                    "#166534",
                                                                borderRadius:
                                                                    "6px",
                                                                fontSize:
                                                                    "13px",
                                                            }}
                                                        >
                                                            {
                                                                question.marks
                                                            }{" "}
                                                            Marks
                                                        </span>
                                                    )}
                                                </div>

                                                {/* OPTIONS */}

                                                {question.options &&
                                                    question.options
                                                        .length >
                                                        0 && (
                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "20px",
                                                                paddingLeft:
                                                                    "10px",
                                                            }}
                                                        >
                                                            {question.options.map(
                                                                (
                                                                    option,
                                                                    optionIndex
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            optionIndex
                                                                        }
                                                                        style={{
                                                                            marginBottom:
                                                                                "10px",
                                                                            lineHeight:
                                                                                "1.6",
                                                                            color:
                                                                                "#1F2937",
                                                                        }}
                                                                    >
                                                                        <strong>
                                                                            {String.fromCharCode(
                                                                                65 +
                                                                                    optionIndex
                                                                            )}
                                                                            .
                                                                        </strong>{" "}
                                                                        {
                                                                            option
                                                                        }
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {/* SOLUTIONS BUTTON */}

                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "20px",
                                paddingTop: "10px",
                            }}
                        >
                            <button
                                onClick={() =>
                                    setShowSolutions(
                                        !showSolutions
                                    )
                                }
                                style={{
                                    padding: "13px 30px",
                                    borderRadius: "24px",
                                    border:
                                        "1px solid #0EA5E9",
                                    background:
                                        showSolutions
                                            ? "#0EA5E9"
                                            : "#FFFFFF",
                                    color:
                                        showSolutions
                                            ? "#FFFFFF"
                                            : "#0369A1",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                }}
                            >
                                {showSolutions
                                    ? "Hide Solutions"
                                    : "View Solutions"}
                            </button>
                        </div>

                        {/* SOLUTIONS */}

                        {showSolutions && (
                            <div
                                style={{
                                    marginTop: "45px",
                                    paddingTop: "30px",
                                    borderTop:
                                        "2px solid #CBD5E1",
                                }}
                            >
                                <h2
                                    style={{
                                        color: "#111827",
                                        fontSize: "26px",
                                        marginBottom:
                                            "25px",
                                    }}
                                >
                                    ✅ Solutions
                                </h2>

                                {paper.questions?.map(
                                    (question, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                background:
                                                    "#F8FAFC",
                                                border:
                                                    "1px solid #E2E8F0",
                                                borderRadius:
                                                    "8px",
                                                padding:
                                                    "24px 28px",
                                                marginBottom:
                                                    "22px",
                                            }}
                                        >
                                            <h3
                                                style={{
                                                    marginTop: 0,
                                                    color:
                                                        "#111827",
                                                    fontSize:
                                                        "19px",
                                                }}
                                            >
                                                Q
                                                {question.number ||
                                                    index + 1}
                                            </h3>

                                            <div
                                                style={{
                                                    color:
                                                        "#334155",
                                                    fontSize:
                                                        "16px",
                                                    lineHeight:
                                                        "1.7",
                                                }}
                                            >
                                                {renderSolution(
                                                    question.solution
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#0B0F14",
                color: "white",
                padding: "40px",
                boxSizing: "border-box",
            }}
        >
            <button
                onClick={onBack}
                style={{
                    padding: "12px 24px",
                    borderRadius: "24px",
                    border: "1px solid #0EA5E9",
                    background: "#0B0F14",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "15px",
                }}
            >
                ← Back
            </button>

            <div
                style={{
                    maxWidth: "900px",
                    margin: "50px auto",
                }}
            >
                <h1
                    style={{
                        fontSize: "36px",
                        marginBottom: "10px",
                    }}
                >
                    🧠 PYQ-Based Practice
                </h1>

                <p
                    style={{
                        color: "#94A3B8",
                        fontSize: "17px",
                    }}
                >
                    Generate a fresh practice paper based
                    on the patterns found in your
                    previous-year papers.
                </p>

                <div
                    className="card"
                    style={{
                        marginTop: "30px",
                    }}
                >
                    <h2>Number of Questions</h2>

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
                        onClick={generatePaper}
                        style={{
                            marginTop: "25px",
                        }}
                    >
                        Generate Practice Paper
                    </button>
                </div>
            </div>
        </div>
    );
}