import { useEffect, useState } from "react";
import { observeReveal } from "../../utils/motion";

function formatFormula(rawFormula) {
    const raw = String(rawFormula || "").trim();
    const colonIndex = raw.indexOf(":");
    const name = colonIndex >= 0
        ? raw.slice(0, colonIndex).trim()
        : "Formula";
    const remainder = colonIndex >= 0
        ? raw.slice(colonIndex + 1).trim()
        : raw;
    const explanationMatch = remainder.match(
        /\s+(where|with|for which|and)\s+/i
    );
    const formulaText = explanationMatch
        ? remainder.slice(0, explanationMatch.index).trim()
        : remainder;
    const explanationText = explanationMatch
        ? remainder.slice(explanationMatch.index).trim()
        : "";
    const lines = explanationText
        ? [formulaText, explanationText]
        : remainder
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

    return {
        name: name || "Formula",
        formula: lines[0] || "—",
        explanation: explanationText || lines.slice(1).join("\n"),
    };
}

export default function LearningRoadmap({
    exam,
    onBack,
    onQuiz,
}) {
    const [loading, setLoading] =
        useState(false);

    const [roadmap, setRoadmap] =
        useState(null);
    const [error, setError] =
        useState("");
    const [copiedFormula, setCopiedFormula] =
        useState(null);

    useEffect(() => observeReveal(".roadmap-page .scroll-reveal"), [roadmap]);

    async function generateRoadmap() {
        try {
            setLoading(true);

            const response =
                await fetch(
                    `http://127.0.0.1:8000/learning/${exam.id}/roadmap`,
                    {
                        method: "POST",
                    }
                );

            const data =
                await response.json();

            if (!response.ok || data.error) {
                throw new Error(
                    data.error ||
                    "Failed to generate roadmap."
                );
            }

            const hasRoadmapContent = [
                "high_priority_topics",
                "frequently_asked_concepts",
                "important_formulas",
                "common_mistakes",
                "predicted_questions",
                "revision_sheet",
            ].some((key) => Array.isArray(data?.[key]) && data[key].length > 0);

            if (!hasRoadmapContent) {
                throw new Error("The roadmap generator returned an empty roadmap. Please try again.");
            }

            setRoadmap(data);
            setError("");
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to generate roadmap.");
        } finally {
            setLoading(false);
        }
    }

    async function copyFormula(formula, index) {
        try {
            await navigator.clipboard.writeText(formula);
            setCopiedFormula(index);
            window.setTimeout(() => setCopiedFormula(null), 1600);
        } catch (err) {
            console.error("Failed to copy formula:", err);
        }
    }

    const sectionStyle = {
        background: "#111827",
        padding: "22px",
        borderRadius: "16px",
        marginTop: "25px",
        border: "1px solid #1F2937",
    };

    const itemStyle = {
        background: "#1F2937",
        padding: "12px 15px",
        borderRadius: "10px",
        marginBottom: "10px",
    };

    return (
        <div
            className="roadmap-page"
            style={{
                padding: "40px",
                color: "white",
                maxWidth: "1100px",
                margin: "0 auto",
            }}
        >
            <button
                onClick={onBack}
                style={{
                    marginBottom: "20px",
                }}
            >
                ← Back
            </button>

            <h1>
                🗺️ Learning Roadmap
            </h1>

            <p
                style={{
                    color: "#ce02ce6b",
                }}
            >
                {exam.title}
            </p>

            {error && (
                <p
                    style={{
                        color: "#FCA5A5",
                        marginTop: "20px",
                    }}
                >
                    {error}
                </p>
            )}

            {!roadmap && (
                <button
                    onClick={
                        generateRoadmap
                    }
                    disabled={loading}
                    style={{
                        marginTop: "20px",
                    }}
                >
                    {loading
                        ? "Generating..."
                        : "Generate Learning Roadmap"}
                </button>
            )}

            {roadmap && (
                <>
                    {/* STATS */}

                    <div
                        className="roadmap-stats"
                        style={{
                            display: "flex",
                            gap: "15px",
                            flexWrap: "wrap",
                            marginTop: "25px",
                        }}
                    >
                        <div
                            style={itemStyle}
                        >
                            🔥{" "}
                            {roadmap.high_priority_topics
                                ?.length ||
                                0}{" "}
                            Topics
                        </div>

                        <div
                            style={itemStyle}
                        >
                            🎯{" "}
                            {roadmap.predicted_questions
                                ?.length ||
                                0}{" "}
                            Questions
                        </div>

                        <div
                            style={itemStyle}
                        >
                            🧠{" "}
                            {roadmap.important_formulas
                                ?.length ||
                                0}{" "}
                            Formulas
                        </div>
                    </div>

                    {/* HIGH PRIORITY */}

                    <div
                        className="roadmap-section roadmap-priority scroll-reveal"
                        style={sectionStyle}
                    >
                        <h2>
                            🔥 High Priority Topics
                        </h2>

                        {roadmap.high_priority_topics?.map(
                            (
                                topic,
                                index
                            ) => (
                                <div
                                    key={
                                        index
                                    }
                                    style={
                                        itemStyle
                                    }
                                >
                                    🔥{" "}
                                    {topic}
                                </div>
                            )
                        )}
                    </div>

                    {/* CONCEPTS */}

                    <div
                        className="roadmap-section roadmap-concepts scroll-reveal"
                        style={sectionStyle}
                    >
                        <h2>
                            📖 Frequently Asked Concepts
                        </h2>

                        {roadmap.frequently_asked_concepts?.map(
                            (
                                topic,
                                index
                            ) => (
                                <div
                                    key={
                                        index
                                    }
                                    style={
                                        itemStyle
                                    }
                                >
                                    📖{" "}
                                    {topic}
                                </div>
                            )
                        )}
                    </div>

                    {/* FORMULAS */}

                    <div
                        className="roadmap-section roadmap-formulas scroll-reveal"
                        style={sectionStyle}
                    >
                        <h2>
                            🧠 Important Formulas
                        </h2>

                        <div className="formula-list">
                            {roadmap.important_formulas?.map(
                                (formula, index) => {
                                    const formatted = formatFormula(formula);

                                    return (
                                        <article
                                            className="formula-card"
                                            key={index}
                                        >
                                            <div className="formula-card-header">
                                                <h3>
                                                    <span aria-hidden="true">🧠</span>{" "}
                                                    {formatted.name}
                                                </h3>
                                                <button
                                                    className="formula-copy-button"
                                                    type="button"
                                                    aria-label={`Copy ${formatted.name}`}
                                                    title={`Copy ${formatted.name}`}
                                                    onClick={() =>
                                                        copyFormula(
                                                            formatted.formula,
                                                            index
                                                        )
                                                    }
                                                >
                                                    {copiedFormula === index
                                                        ? "✓"
                                                        : "⧉"}
                                                </button>
                                            </div>

                                            <pre className="formula-code">
                                                <code>{formatted.formula}</code>
                                            </pre>

                                            {formatted.explanation && (
                                                <p className="formula-explanation">
                                                    {formatted.explanation}
                                                </p>
                                            )}
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {/* COMMON MISTAKES */}

                    <div
                        className="roadmap-section roadmap-mistakes scroll-reveal"
                        style={sectionStyle}
                    >
                        <h2>
                            ⚠️ Common Mistakes
                        </h2>

                        {roadmap.common_mistakes?.map(
                            (
                                item,
                                index
                            ) => (
                                <div
                                    key={
                                        index
                                    }
                                    style={
                                        itemStyle
                                    }
                                >
                                    ⚠️{" "}
                                    {item}
                                </div>
                            )
                        )}
                    </div>

                    {/* PREDICTED QUESTIONS */}

                    <div
                        className="roadmap-section roadmap-questions scroll-reveal"
                        style={sectionStyle}
                    >
                        <h2>
                            🎯 Predicted Questions
                        </h2>

                        {roadmap.predicted_questions?.map(
                            (
                                q,
                                index
                            ) => (
                                <div
                                    key={
                                        index
                                    }
                                    style={{
                                        background:
                                            "#1F2937",
                                        padding:
                                            "18px",
                                        borderRadius:
                                            "12px",
                                        marginBottom:
                                            "15px",
                                    }}
                                >
                                    <h4>
                                        Question{" "}
                                        {index +
                                            1}
                                    </h4>

                                    <p>
                                        {typeof q === "string"
                                            ? q
                                            : q?.text || q?.question || ""}
                                    </p>
                                    {typeof q === "object" && q && (
                                        <small className="question-meta">
                                            {q.question_type || "Question"}
                                            {q.marks != null
                                                ? ` · ${q.marks} marks`
                                                : ""}
                                        </small>
                                    )}
                                </div>
                            )
                        )}
                    </div>

                    {/* REVISION SHEET */}

                    <div
                        className="roadmap-section roadmap-revision scroll-reveal"
                        style={sectionStyle}
                    >
                        <h2>
                            📄 Revision Sheet
                        </h2>

                        {roadmap.revision_sheet?.map(
                            (
                                item,
                                index
                            ) => (
                                <div
                                    key={
                                        index
                                    }
                                    style={{
                                        borderLeft:
                                            "4px solid #3B82F6",
                                        paddingLeft:
                                            "12px",
                                        marginBottom:
                                            "15px",
                                    }}
                                >
                                    {typeof item === "string"
                                        ? item
                                        : (
                                            <>
                                                {item?.section_title && (
                                                    <strong>
                                                        {item.section_title}
                                                    </strong>
                                                )}
                                                {item?.summary && (
                                                    <p>{item.summary}</p>
                                                )}
                                            </>
                                        )}
                                </div>
                            )
                        )}
                    </div>

                    {/* LEARNING ACTIONS */}

                    <div
                        className="roadmap-section roadmap-actions scroll-reveal"
                        style={sectionStyle}
                    >
                        <h2>
                            🚀 Learning Actions
                        </h2>

                        <div
                            style={{
                                display:
                                    "flex",
                                gap: "15px",
                                flexWrap:
                                    "wrap",
                                marginTop:
                                    "20px",
                            }}
                        >
                            <button
    onClick={onQuiz}
    style={{
        padding: "12px 20px",
        fontSize: "16px",
    }}
>
    🎯 Quiz Me On These Topics
</button>

                            <button>
                                📝 Generate Notes
                            </button>

                            <button>
                                📅 Study Plan
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}