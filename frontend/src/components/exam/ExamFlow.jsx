import { useEffect, useState } from "react";
import ExamWorkspace from "./ExamWorkspace";

export default function ExamFlow({ onExit }) {

    const [exams, setExams] = useState([]);
    const [examName, setExamName] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    async function loadExams() {

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/exams/"
            );

            const data = await response.json();

            setExams(data);

        } catch (error) {

            console.error(error);

            alert("Failed to load exams.");

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {

        loadExams();

    }, []);

    async function createExam() {

        if (!examName.trim()) {
            return;
        }

        setCreating(true);

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/exams/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        name: examName.trim(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create exam");
            }

            const newExam = await response.json();

            setExams((prev) => [
                newExam,
                ...prev,
            ]);

            setExamName("");

        } catch (error) {

            console.error(error);

            alert("Failed to create exam.");

        } finally {

            setCreating(false);

        }
    }
    if (selectedExam) {
    return (
        <ExamWorkspace
            exam={selectedExam}
            onBack={() => setSelectedExam(null)}
        />
    );
}

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

            <button
                onClick={onExit}
                style={{
                    marginBottom: "30px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #334155",
                    background: "#151B23",
                    color: "white",
                    cursor: "pointer",
                }}
            >
                ← Dashboard
            </button>

            <h1>
                🎯 Prepare for an Exam
            </h1>

            <p
                style={{
                    color: "#94A3B8",
                    fontSize: "17px",
                }}
            >
                Create an exam workspace for your study material
                and previous year questions.
            </p>


            {/* CREATE EXAM */}

            <div
                style={{
                    marginTop: "35px",
                    padding: "25px",
                    background: "#151B23",
                    border: "1px solid #263241",
                    borderRadius: "14px",
                    maxWidth: "700px",
                }}
            >

                <h2>
                    Create a new exam
                </h2>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "15px",
                    }}
                >

                    <input
                        value={examName}
                        onChange={(e) =>
                            setExamName(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter" &&
                                !creating
                            ) {
                                createExam();
                            }

                        }}
                        placeholder="e.g. Data Structures - Semester 3"
                        style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #334155",
                            background: "#0B0F14",
                            color: "white",
                            outline: "none",
                        }}
                    />

                    <button
                        onClick={createExam}
                        disabled={
                            creating ||
                            !examName.trim()
                        }
                        style={{
                            padding: "12px 18px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#2563EB",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        {creating
                            ? "Creating..."
                            : "Create"}
                    </button>

                </div>

            </div>


            {/* EXISTING EXAMS */}

            <div
                style={{
                    marginTop: "40px",
                    maxWidth: "900px",
                }}
            >

                <h2>
                    Your Exams
                </h2>

                {loading ? (

                    <p style={{ color: "#94A3B8" }}>
                        Loading exams...
                    </p>

                ) : exams.length === 0 ? (

                    <div
                        style={{
                            padding: "30px",
                            marginTop: "15px",
                            border: "1px dashed #334155",
                            borderRadius: "12px",
                            color: "#94A3B8",
                        }}
                    >
                        No exam workspaces yet.
                        Create one above to get started.
                    </div>

                ) : (

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill,minmax(260px,1fr))",
                            gap: "18px",
                            marginTop: "15px",
                        }}
                    >

                        {exams.map((exam) => (

                            <div
                                key={exam.id}
                                style={{
                                    padding: "22px",
                                    background: "#151B23",
                                    border: "1px solid #263241",
                                    borderRadius: "12px",
                                }}
                            >

                                <h3>
                                    📚 {exam.name}
                                </h3>

                                <button
                                    style={{
                                        marginTop: "15px",
                                        padding: "10px 15px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "#10A37F",
                                        color: "white",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setSelectedExam(exam)}
                                >
                                    Open Exam
                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}