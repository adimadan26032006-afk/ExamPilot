import { useEffect, useRef, useState } from "react";
import PracticePaper from "./PracticePaper";
import MockTest from "./MockTest";
import SubjectiveMockTest from "./SubjectiveMockTest";
import { useNavigate } from "react-router-dom";
import LearningRoadmap from "./LearningRoadmap";
export default function ExamWorkspace({
    exam,
    onBack,
}) {
    console.log("🔥 NEW EXAM WORKSPACE LOADED");
    const pyqInputRef = useRef(null);
    const studyMaterialInputRef = useRef(null);
    const [uploadingStudyMaterial, setUploadingStudyMaterial] = useState(false);
    const [uploadingPYQ, setUploadingPYQ] = useState(false);

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patternAnalysis, setPatternAnalysis] = useState(null);
    const [analyzingPattern, setAnalyzingPattern] = useState(false);
    const [showPatternAnalysis, setShowPatternAnalysis] = useState(false);
    const [showPracticeOptions, setShowPracticeOptions] = useState(false);
    const [showPracticePage, setShowPracticePage] = useState(false);
    const [showMockTest, setShowMockTest] = useState(false);
    const [showExamModes, setShowExamModes] =
        useState(false);
    const [showSubjectiveTest, setShowSubjectiveTest] =
        useState(false);
    const [analytics, setAnalytics] =
        useState(null);
    const [analyticsError, setAnalyticsError] =
        useState(null);
    const navigate = useNavigate();
    const [showLearningRoadmap, setShowLearningRoadmap] =
        useState(false);
    const [questionsByDocument, setQuestionsByDocument] = useState({});
    const [loadingQuestions, setLoadingQuestions] = useState(null);
    const [solvingQuestion, setSolvingQuestion] = useState(null);
    const [solutionsByQuestion, setSolutionsByQuestion] = useState({});
    const [pyqError, setPyqError] = useState(null);

    async function loadDocuments() {

        try {

            const response = await fetch(
                `http://127.0.0.1:8000/exams/${exam.id}/documents`
            );

            if (!response.ok) {
                throw new Error("Failed to load documents");
            }

            const data = await response.json();

            setDocuments(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {
        loadDocuments();
    }, [exam.id]);

    async function viewQuestions(documentId) {
        setLoadingQuestions(documentId);
        setPyqError(null);

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/documents/${documentId}/questions`
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to extract questions.");
            }

            setQuestionsByDocument((previous) => ({
                ...previous,
                [documentId]: data.questions || [],
            }));
        } catch (error) {
            console.error(error);
            setPyqError(error.message);
        } finally {
            setLoadingQuestions(null);
        }
    }

    async function solveQuestion(documentId, question) {
        const solutionKey = `${documentId}-${question.id}`;
        setSolvingQuestion(solutionKey);
        setPyqError(null);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/pyq/solve-question",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ question: question.question }),
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to solve the question.");
            }

            setSolutionsByQuestion((previous) => ({
                ...previous,
                [solutionKey]: data,
            }));
        } catch (error) {
            console.error(error);
            setPyqError(error.message);
        } finally {
            setSolvingQuestion(null);
        }
    }

    console.log("showPracticePage:", showPracticePage);
    useEffect(() => {
        if (!exam?.id) return;

        const controller = new AbortController();
        setAnalytics(null);
        setAnalyticsError(null);

        async function loadAnalytics() {
            try {
                const response = await fetch(
                    `http://localhost:8000/exams/${exam.id}/analytics`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Failed to load analytics");
                }

                setAnalytics(await response.json());
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error(error);
                    setAnalyticsError("Unable to load analytics.");
                }
            }
        }

        loadAnalytics();

        return () => controller.abort();
    }, [exam?.id]);
    if (showPracticePage) {
        return (
            <PracticePaper
                exam={exam}
                onBack={() => setShowPracticePage(false)}
            />
        );
    }
    if (showMockTest) {
        return (
            <MockTest
                exam={exam}
                onBack={() => setShowMockTest(false)}
            />
        );
    }
    if (showSubjectiveTest) {
        return (
            <SubjectiveMockTest
                exam={exam}
                onBack={() =>
                    setShowSubjectiveTest(false)
                }
            />
        );
    }

    if (showExamModes) {
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
                    onClick={() =>
                        setShowExamModes(false)
                    }
                >
                    ← Back
                </button>

                <h1>📝 Exam Modes</h1>

                <div
                    style={{
                        display: "grid",
                        gap: "20px",
                        marginTop: "30px",
                    }}
                >
                    <div className="card">
                        <h2>📖 Practice Mode</h2>

                        <p>
                            Learn while solving.
                            Answers shown instantly.
                        </p>

                        <button
                            onClick={() => {
                                setShowExamModes(false);
                                setShowPracticePage(true);
                            }}
                        >
                            Start Practice
                        </button>
                    </div>

                    <div className="card">
                        <h2>🎯 Objective Test</h2>

                        <p>
                            MCQ-based exam simulation.
                            Score and analysis after
                            submission.
                        </p>

                        <button
                            onClick={() => {
                                setShowExamModes(false);
                                setShowMockTest(true);
                            }}
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
                                setShowExamModes(false);
                                setShowSubjectiveTest(true);
                            }}
                        >
                            Start Subjective Test
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showPatternAnalysis) {
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
                    onClick={() =>
                        setShowPatternAnalysis(false)
                    }
                >
                    ← Back to Exam Workspace
                </button>

                <h1
                    style={{
                        marginTop: "30px",
                    }}
                >
                    📊 Exam Pattern Analysis
                </h1>

                {patternAnalysis && (
                    <>
                        <div className="card">
                            <h2>Overview</h2>

                            <p>
                                {patternAnalysis.analysis?.overview}
                            </p>
                        </div>

                        <div
                            className="card"
                            style={{
                                marginTop: "20px",
                            }}
                        >
                            <h2>📚 Important Topics</h2>

                            {patternAnalysis.analysis?.topics?.map(
                                (topic, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            marginTop: "10px",
                                        }}
                                    >
                                        <h3>{topic.topic}</h3>

                                        <p>
                                            Questions: {topic.question_count}
                                        </p>

                                        <p>
                                            Papers: {topic.papers_appeared?.join(", ")}
                                        </p>

                                        <p>
                                            Weightage: {topic.weightage_percent}%
                                        </p>

                                        <p>
                                            Question Types: {topic.question_types?.join(", ")}
                                        </p>

                                        <p>
                                            Priority: {topic.priority}
                                        </p>

                                        <p>
                                            {topic.observation}
                                        </p>

                                        <p>
                                            <strong>Practice:</strong>{" "}
                                            {topic.practice_focus}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>

                        <div
                            className="card"
                            style={{
                                marginTop: "20px",
                            }}
                        >
                            <h2>📝 Question Patterns</h2>

                            {patternAnalysis.analysis?.question_patterns?.map(
                                (pattern, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            marginTop: "10px",
                                            padding: "12px",
                                            background: "#0B0F14",
                                            border: "1px solid #263241",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <strong>
                                            {pattern.pattern}
                                        </strong>

                                        <p>
                                            Questions: {pattern.question_count}
                                        </p>

                                        <p>
                                            Papers: {pattern.paper_count}
                                        </p>

                                        <p>
                                            {pattern.observation}
                                        </p>

                                        <p>
                                            <strong>Practice:</strong>{" "}
                                            {pattern.practice_focus}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>

                        <div
                            className="card"
                            style={{
                                marginTop: "20px",
                            }}
                        >
                            <h2>📈 Difficulty</h2>

                            {patternAnalysis.analysis?.difficulty_trends?.map(
                                (item, index) => (
                                    <p key={index}>
                                        <strong>
                                            {item.level}:
                                        </strong>{" "}
                                        {item.observation}
                                    </p>
                                )
                            )}
                        </div>

                        <div
                            className="card"
                            style={{
                                marginTop: "20px",
                            }}
                        >
                            <h2>🎯 Preparation Guidance</h2>

                            <ul>
                                {patternAnalysis.analysis?.preparation_guidance?.map(
                                    (item, index) => (
                                        <li key={index}>
                                            {item}
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>

                        <div
                            className="card"
                            style={{
                                marginTop: "20px",
                            }}
                        >
                            <p
                                style={{
                                    color: "#94A3B8",
                                }}
                            >
                                ⚠️{" "}
                                {patternAnalysis.analysis?.warning}
                            </p>
                        </div>
                    </>
                )}

            </div>
        );
    }


    const studyMaterials = documents.filter(
        (doc) => doc.document_type === "study_material"
    );

    const pyqs = documents.filter(
        (doc) => doc.document_type === "pyq"
    );

    if (showLearningRoadmap) {
        return (
            <LearningRoadmap
                exam={exam}
                onBack={() =>
                    setShowLearningRoadmap(false)
                }
            />
        );
    }

    return (

        <div
            className="workspace-page"
            style={{
                minHeight: "100vh",
                padding: "40px",
                background: "#0B0F14",
                color: "white",
                boxSizing: "border-box",
            }}
        >

            {/* BACK */}

            <button
                onClick={onBack}
                style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #334155",
                    background: "#151B23",
                    color: "white",
                    cursor: "pointer",
                }}
            >
                ← Back to Exam Prep
            </button>


            {/* HEADER */}

            <div
                style={{
                    marginTop: "30px",
                    marginBottom: "35px",
                }}
            >

                <h1
                    style={{
                        fontSize: "38px",
                        marginBottom: "8px",
                    }}
                >
                    🎯 {exam.name}
                </h1>
                {
                    analyticsError && !analytics && (
                        <p style={{ color: "#f59e0b" }}>
                            {analyticsError}
                        </p>
                    )
                }
                {
                    analytics && (
                        <div
                            className="card"
                            style={{
                                marginTop: "20px",
                                marginBottom: "20px",
                            }}
                        >
                            <h2>
                                📊 Overall Performance
                            </h2>

                            <p>
                                Tests Attempted:
                                {" "}
                                {
                                    analytics.tests_attempted
                                }
                            </p>

                            <p>
                                Average Percentage:
                                {" "}
                                {
                                    analytics.average_percentage
                                }
                                %
                            </p>

                            <p>
                                Best Percentage:
                                {" "}
                                {
                                    analytics.best_percentage
                                }
                                %
                            </p>
                            {analyticsError && (
                                <p style={{ color: "#f59e0b" }}>
                                    {analyticsError}
                                </p>
                            )}

                            <p>
                                Latest Score:
                                {" "}
                                {
                                    analytics.latest_score
                                }
                                /
                                {
                                    analytics.latest_total
                                }
                            </p>
                        </div>
                    )
                }

                <p
                    style={{
                        color: "#94A3B8",
                        fontSize: "17px",
                    }}
                >
                    Your personalized exam preparation workspace.
                </p>

            </div>


            {/* RESOURCES */}

            <h2>📚 Your Resources</h2>

            {loading ? (

                <p
                    style={{
                        color: "#94A3B8",
                        marginTop: "20px",
                    }}
                >
                    Loading your resources...
                </p>

            ) : (

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(320px,1fr))",
                        gap: "20px",
                        marginTop: "15px",
                    }}
                >

                    {/* STUDY MATERIAL */}

                    <div
                        className="card workspace-feature-card workspace-resource-card"
                        style={{
                            minHeight: "240px",
                        }}
                    >

                        <h2>📖 Study Material</h2>

                        <p
                            style={{
                                color: "#94A3B8",
                            }}
                        >
                            Notes, textbooks, slides and
                            other material for this exam.
                        </p>


                        {studyMaterials.length === 0 ? (

                            <p
                                style={{
                                    color: "#64748B",
                                    marginTop: "25px",
                                }}
                            >
                                No study material uploaded yet.
                            </p>

                        ) : (

                            <div
                                style={{
                                    marginTop: "20px",
                                }}
                            >

                                {studyMaterials.map((doc) => (

                                    <div
                                        key={doc.id}
                                        style={{
                                            padding: "12px",
                                            marginBottom: "10px",
                                            background: "#0B0F14",
                                            border:
                                                "1px solid #263241",
                                            borderRadius: "8px",
                                        }}
                                    >

                                        📄 {doc.filename}

                                        <div
                                            style={{
                                                color: "#64748B",
                                                fontSize: "13px",
                                                marginTop: "4px",
                                            }}
                                        >
                                            {doc.pages} pages
                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                        <input
                            ref={studyMaterialInputRef}
                            type="file"
                            accept=".pdf"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                                const file = e.target.files[0];

                                if (!file) return;

                                setUploadingStudyMaterial(true);

                                try {
                                    const formData = new FormData();

                                    formData.append("file", file);
                                    formData.append("exam_id", String(exam.id));
                                    formData.append(
                                        "document_type",
                                        "study_material"
                                    );

                                    const response = await fetch(
                                        "http://127.0.0.1:8000/upload",
                                        {
                                            method: "POST",
                                            body: formData,
                                        }
                                    );

                                    if (!response.ok) {
                                        throw new Error(
                                            "Study material upload failed"
                                        );
                                    }

                                    const data = await response.json();

                                    console.log(
                                        "Study material uploaded:",
                                        data
                                    );

                                    alert(
                                        "Study material uploaded successfully!"
                                    );

                                    await loadDocuments();

                                } catch (error) {
                                    console.error(error);

                                    alert(
                                        "Failed to upload study material."
                                    );

                                } finally {
                                    setUploadingStudyMaterial(false);

                                    e.target.value = "";
                                }
                            }}
                        />

                        <button
                            onClick={() =>
                                studyMaterialInputRef.current?.click()
                            }
                            disabled={uploadingStudyMaterial}
                            style={{
                                marginTop: "15px",
                            }}
                        >
                            {uploadingStudyMaterial
                                ? "Uploading..."
                                : "+ Add Study Material"}
                        </button>

                    </div>


                    {/* PYQs */}

                    <div
                        className="card workspace-feature-card workspace-resource-card"
                        style={{
                            minHeight: "240px",
                        }}
                    >

                        <h2>📝 Previous Year Papers</h2>

                        <p
                            style={{
                                color: "#94A3B8",
                            }}
                        >
                            Upload multiple PYQs to unlock
                            exam-pattern intelligence.
                        </p>


                        {pyqs.length === 0 ? (

                            <p
                                style={{
                                    color: "#64748B",
                                    marginTop: "25px",
                                }}
                            >
                                No PYQs uploaded yet.
                            </p>

                        ) : (

                            <div
                                style={{
                                    marginTop: "20px",
                                }}
                            >

                                {pyqs.map((doc) => (

                                    <div
                                        key={doc.id}
                                        style={{
                                            padding: "12px",
                                            marginBottom: "10px",
                                            background: "#0B0F14",
                                            border:
                                                "1px solid #263241",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <div>
                                                📄 {doc.filename}
                                                <div
                                                    style={{
                                                        color: "#64748B",
                                                        fontSize: "13px",
                                                        marginTop: "4px",
                                                    }}
                                                >
                                                    {doc.pages} pages
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => viewQuestions(doc.id)}
                                                disabled={loadingQuestions === doc.id}
                                            >
                                                {loadingQuestions === doc.id
                                                    ? "Loading..."
                                                    : "View Questions"}
                                            </button>
                                        </div>

                                        {questionsByDocument[doc.id] && (
                                            <div style={{ marginTop: "15px" }}>
                                                {questionsByDocument[doc.id].length === 0 ? (
                                                    <p style={{ color: "#94A3B8" }}>
                                                        No questions could be extracted from this PYQ.
                                                    </p>
                                                ) : (
                                                    questionsByDocument[doc.id].map((question) => {
                                                        const solution = solutionsByQuestion[`${doc.id}-${question.id}`];
                                                        return (
                                                            <div
                                                                key={question.id}
                                                                style={{
                                                                    padding: "12px",
                                                                    marginTop: "10px",
                                                                    borderTop: "1px solid #263241",
                                                                }}
                                                            >
                                                                <p style={{ margin: "0 0 10px" }}>
                                                                    <strong>Q{question.id}.</strong> {question.question}
                                                                </p>
                                                                <button
                                                                    onClick={() => solveQuestion(doc.id, question)}
                                                                    disabled={solvingQuestion === `${doc.id}-${question.id}`}
                                                                >
                                                                    {solvingQuestion === `${doc.id}-${question.id}`
                                                                        ? "Solving..."
                                                                        : "Solve This PYQ"}
                                                                </button>

                                                                {solution && (
                                                                    <div style={{ marginTop: "15px", color: "#D7E3EF" }}>
                                                                        <h4>Model Answer</h4>
                                                                        <p>{solution.answer}</p>
                                                                        <h4>Important Keywords</h4>
                                                                        <p>{solution.keywords?.join(", ") || "None provided"}</p>
                                                                        <h4>Exam Tips</h4>
                                                                        <p>{solution.exam_tips}</p>
                                                                        <h4>Common Mistakes</h4>
                                                                        <p>{solution.common_mistakes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}

                                    </div>

                                ))}

                            </div>

                        )}

                        {pyqError && (
                            <p style={{ color: "#F87171", marginTop: "15px" }}>
                                {pyqError}
                            </p>
                        )}

                        <input
                            ref={pyqInputRef}
                            type="file"
                            accept=".pdf"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                                const file = e.target.files[0];

                                if (!file) return;

                                setUploadingPYQ(true);

                                try {
                                    const formData = new FormData();

                                    formData.append("file", file);
                                    formData.append("exam_id", exam.id);
                                    formData.append("document_type", "pyq");

                                    const response = await fetch(
                                        "http://127.0.0.1:8000/upload",
                                        {
                                            method: "POST",
                                            body: formData,
                                        }
                                    );

                                    if (!response.ok) {
                                        throw new Error("PYQ upload failed");
                                    }

                                    const data = await response.json();

                                    console.log("PYQ uploaded:", data);

                                    // Refresh the PYQ list
                                    await loadDocuments();

                                    alert("PYQ uploaded successfully!");

                                } catch (error) {
                                    console.error(error);
                                    alert("Failed to upload PYQ.");
                                } finally {
                                    setUploadingPYQ(false);

                                    // Allows the same file to be selected again later
                                    e.target.value = "";
                                }
                            }}
                        />

                        <button
                            onClick={() => pyqInputRef.current?.click()}
                            disabled={uploadingPYQ}
                        >
                            {uploadingPYQ ? "Uploading..." : "Add PYQs"}
                        </button>

                    </div>

                </div>

            )}


            {/* EXAM INTELLIGENCE */}

            <h2
                style={{
                    marginTop: "45px",
                }}
            >
                🧠 Prepare Strategically
            </h2>


            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(260px,1fr))",
                    gap: "18px",
                    marginTop: "15px",
                }}
            >

                <div className="card workspace-feature-card workspace-intelligence-card">

                    <h2>🔍 Analyze Exam Pattern</h2>

                    <p>
                        Discover recurring topics,
                        question types and trends
                        across your PYQs.
                    </p>

                    <button
                        onClick={async () => {

                            if (pyqs.length === 0) {
                                alert(
                                    "Upload at least one PYQ before analyzing the exam pattern."
                                );
                                return;
                            }

                            try {

                                setAnalyzingPattern(true);

                                const response = await fetch(
                                    `http://127.0.0.1:8000/exams/${exam.id}/analyze-pattern`
                                );

                                if (!response.ok) {
                                    throw new Error(
                                        "Failed to analyze exam pattern"
                                    );
                                }

                                const data = await response.json();

                                console.log(
                                    "Exam pattern analysis:",
                                    data
                                );

                                setPatternAnalysis(data);
                                setShowPatternAnalysis(true);

                            } catch (error) {

                                console.error(error);

                                alert(
                                    "Failed to analyze exam pattern."
                                );

                            } finally {

                                setAnalyzingPattern(false);

                            }

                        }}
                        disabled={analyzingPattern}
                    >
                        {analyzingPattern
                            ? "Analyzing..."
                            : "Analyze Pattern"}
                    </button>
                </div>


                <div className="card workspace-feature-card workspace-intelligence-card">

                    <h2>🎓 Teach Me for This Exam</h2>

                    <p>
                        Learn what you actually need
                        to know for this exam.
                    </p>

                    <button
                        onClick={() =>
                            setShowLearningRoadmap(true)
                        }
                    >
                        Start Learning
                    </button>

                </div>


                <div className="card workspace-feature-card workspace-intelligence-card">

                    <h2>📝 Exam Modes</h2>

                    <p>
                        Practice, Objective Tests and
                        Subjective Tests in one place.
                    </p>

                    <button
                        onClick={() =>
                            setShowExamModes(true)
                        }
                    >
                        Open Exam Modes
                    </button>

                </div>

            </div>





            {/* PYQ TOOLS */}

            <h2
                style={{
                    marginTop: "45px",
                }}
            >
                ✏️ Work With a PYQ
            </h2>


            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(260px,1fr))",
                    gap: "18px",
                    marginTop: "15px",
                }}
            >


                <div className="card workspace-feature-card workspace-tool-card">

                    <h2>✏️ Solve a PYQ</h2>

                    <p>
                        Get help solving a specific
                        previous-year question.
                    </p>

                    <button>
                        Solve PYQ
                    </button>

                </div>


                <div className="card workspace-feature-card workspace-tool-card">

                    <h2>🎓 Teach Me From This PYQ</h2>

                    <p>
                        Learn every important concept
                        you should know from a question.
                    </p>

                    <button>
                        Learn From PYQ
                    </button>

                </div>

            </div>

        </div>
    );
}