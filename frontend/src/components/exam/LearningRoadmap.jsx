import { useState } from "react";

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

const roadmapStyles = `
.roadmap-page {
    --roadmap-cyan: #67e8f9;
    --roadmap-blue: #3b82f6;
    --roadmap-indigo: #818cf8;
    --roadmap-panel: rgba(13, 22, 36, 0.78);
    --roadmap-border: rgba(148, 163, 184, 0.16);
    min-height: 100vh;
    width: min(1120px, 100%);
    padding: 42px 36px 72px !important;
    color: #edfaff;
    background: radial-gradient(circle at 8% 0%, rgba(0, 229, 255, .12), transparent 31%), radial-gradient(circle at 94% 35%, rgba(59, 130, 246, .1), transparent 32%), linear-gradient(180deg, #05070a 0%, #080d16 52%, #0b1421 100%);
    box-sizing: border-box;
    animation: roadmap-enter .45s ease both;
}

.roadmap-hero { position: relative; padding-bottom: 28px; }
.roadmap-back-button { margin-bottom: 34px; background: rgba(11, 19, 31, .7); border-color: rgba(148, 163, 184, .24); color: #b9cad9; }
.roadmap-back-button span { color: var(--roadmap-cyan); margin-right: 5px; }
.roadmap-hero-copy { max-width: 720px; }
.roadmap-page .section-eyebrow { margin-bottom: 13px; color: #a5f3fc; border-color: rgba(103, 232, 249, .32); background: rgba(103, 232, 249, .07); }
.roadmap-page h1 { margin: 0 0 12px; font-size: clamp(38px, 6vw, 62px); line-height: 1.02; letter-spacing: -.045em; background: linear-gradient(105deg, #f8fdff 5%, #67e8f9 55%, #818cf8 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.roadmap-exam-title { margin: 0 0 8px !important; color: #dbeafe !important; font-size: 18px; font-weight: 650; }
.roadmap-hero-description { max-width: 560px; margin: 0 !important; color: #8295aa !important; font-size: 15px; }
.roadmap-error { display: flex; gap: 10px; align-items: center; margin: 4px 0 22px !important; padding: 13px 16px; border: 1px solid rgba(248, 113, 113, .35); border-radius: 12px; background: rgba(127, 29, 29, .22); color: #fecaca !important; }
.roadmap-error span { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: rgba(248, 113, 113, .18); color: #fda4af; font-weight: 800; }

.roadmap-empty-state { max-width: 700px; margin-top: 14px; padding: 42px 34px; border: 1px solid var(--roadmap-border); border-radius: 20px; background: linear-gradient(145deg, rgba(20, 34, 53, .76), rgba(8, 15, 26, .86)); box-shadow: 0 22px 56px rgba(0, 0, 0, .35), inset 0 1px 0 rgba(255, 255, 255, .06), 0 0 42px rgba(0, 229, 255, .06); text-align: center; }
.roadmap-empty-icon { display: grid; place-items: center; width: 54px; height: 54px; margin: 0 auto 20px; border: 1px solid rgba(103, 232, 249, .42); border-radius: 16px; background: rgba(0, 229, 255, .1); color: var(--roadmap-cyan); font-size: 28px; box-shadow: 0 0 26px rgba(0, 229, 255, .18); }
.roadmap-empty-state h2 { margin: 0 0 10px; font-size: 23px; }
.roadmap-empty-state p { max-width: 510px; margin: 0 auto 25px !important; color: #8da1b5 !important; }
.roadmap-primary-button { background: linear-gradient(135deg, #00c8e5, #1478f5); border-color: rgba(103, 232, 249, .65); color: #00151b; box-shadow: 0 9px 26px rgba(0, 174, 226, .3), 0 0 24px rgba(0, 229, 255, .18); }
.roadmap-primary-button span { margin-right: 9px; font-size: 16px; }

.roadmap-stats { display: grid !important; grid-template-columns: repeat(3, 1fr); gap: 14px !important; margin: 8px 0 28px !important; }
.roadmap-stat { min-height: 88px; margin: 0 !important; padding: 18px 20px !important; border: 1px solid var(--roadmap-border); border-radius: 15px !important; background: linear-gradient(145deg, rgba(20, 31, 48, .84), rgba(10, 17, 28, .9)) !important; color: #dbeafe; font-size: 15px; font-weight: 650; display: flex; align-items: center; gap: 10px; box-shadow: 0 12px 30px rgba(0, 0, 0, .24), inset 0 1px 0 rgba(255,255,255,.04); transition: transform .24s ease, border-color .24s ease, box-shadow .24s ease; }
.roadmap-stat:hover { transform: translateY(-4px); border-color: rgba(103, 232, 249, .46); box-shadow: 0 18px 34px rgba(0,0,0,.34), 0 0 22px rgba(0,229,255,.1); }
.roadmap-stat::first-letter { font-size: 21px; }

.roadmap-section { margin-top: 20px !important; padding: 25px !important; border: 1px solid var(--roadmap-border) !important; border-radius: 18px !important; background: linear-gradient(155deg, rgba(17, 29, 46, .78), rgba(8, 15, 25, .9)) !important; box-shadow: 0 16px 38px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04); animation: roadmap-section-enter .5s ease both; }
.roadmap-section h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 19px; color: #f3faff; font-size: 19px; letter-spacing: -.02em; }
.roadmap-section h2::after { content: ""; flex: 1; height: 1px; margin-left: 8px; background: linear-gradient(90deg, rgba(103,232,249,.28), transparent); }
.roadmap-item { margin-bottom: 10px !important; padding: 14px 16px !important; border: 1px solid rgba(148,163,184,.12); border-radius: 11px; background: rgba(19, 30, 45, .82); color: #d8e9f5; transition: transform .2s ease, border-color .2s ease, background .2s ease; }
.roadmap-item:hover { transform: translateX(5px); border-color: rgba(103,232,249,.4); background: rgba(26, 45, 65, .92); }
.roadmap-priority { border-left: 3px solid #fb923c !important; }
.roadmap-concepts { border-left: 3px solid var(--roadmap-indigo) !important; }
.roadmap-formulas { border-left: 3px solid var(--roadmap-cyan) !important; }
.roadmap-mistakes { border-left: 3px solid #fbbf24 !important; }
.roadmap-questions { border-left: 3px solid #c084fc !important; }
.roadmap-revision { border-left: 3px solid #6ee7b7 !important; }

.roadmap-formulas .formula-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
.roadmap-formulas .formula-card { padding: 19px; border: 1px solid rgba(103,232,249,.2); border-radius: 14px; background: linear-gradient(145deg, rgba(12, 35, 56, .88), rgba(5, 13, 24, .96)) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 12px 28px rgba(0,0,0,.24); transition: transform .24s ease, border-color .24s ease, box-shadow .24s ease; }
.roadmap-formulas .formula-card:hover { transform: translateY(-5px); border-color: rgba(103,232,249,.62); box-shadow: 0 18px 34px rgba(0,0,0,.36), 0 0 28px rgba(0,229,255,.13); }
.formula-card-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.formula-card h3 { margin: 0; color: #dffbff; font-size: 15px; line-height: 1.4; }
.formula-copy-button { min-width: 32px; width: 32px; height: 32px; min-height: 32px; padding: 0; opacity: .72; border-radius: 9px; background: rgba(103,232,249,.08); color: #a5f3fc; box-shadow: none; }
.formula-copy-button:hover { box-shadow: 0 0 16px rgba(103,232,249,.3); }
.formula-code { margin: 17px 0 0; padding: 15px 16px; overflow-x: auto; border: 1px solid rgba(103,232,249,.16); border-radius: 10px; background: rgba(1, 8, 18, .88); color: #67e8f9; font: 600 14px/1.7 ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; text-shadow: 0 0 13px rgba(103,232,249,.28); }
.formula-code code { padding: 0; background: transparent; color: inherit; font: inherit; }
.formula-explanation { margin: 13px 2px 0 !important; color: rgba(186,230,253,.68) !important; font-size: 13px; line-height: 1.6 !important; white-space: pre-line; }

.roadmap-question-card { position: relative; margin-bottom: 12px !important; padding: 18px 20px 17px !important; border: 1px solid rgba(192,132,252,.16); border-radius: 13px; background: rgba(19, 27, 43, .82); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.roadmap-question-card:hover { transform: translateX(5px); border-color: rgba(192,132,252,.46); box-shadow: 0 10px 24px rgba(0,0,0,.25); }
.roadmap-question-card h4 { margin: 0 0 9px; color: #e9d5ff; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; }
.roadmap-question-card p { margin: 0 !important; color: #dbeafe !important; }
.question-meta { display: block; margin-top: 12px; color: rgba(196,181,253,.7); font-size: 12px; }
.roadmap-revision-item { margin-bottom: 15px !important; padding: 4px 0 4px 15px !important; border-left: 3px solid rgba(59,130,246,.72); color: #d1fae5; }
.roadmap-revision-item strong { display: block; margin-bottom: 7px; color: #a7f3d0; }
.roadmap-revision-item p { margin: 0 !important; }

.roadmap-action-grid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    gap: 16px !important;
    margin-top: 8px !important;
}

.roadmap-action-card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    min-height: 276px;
    padding: 22px !important;
    border: 1px solid rgba(148, 163, 184, .18);
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(23, 37, 56, .86), rgba(10, 17, 28, .94));
    text-align: left;
    box-shadow: 0 10px 24px rgba(0, 0, 0, .24), inset 0 1px 0 rgba(255, 255, 255, .04);
    transition: transform .24s ease, border-color .24s ease, box-shadow .24s ease;
}

.roadmap-action-card:hover {
    transform: translateY(-5px);
    border-color: rgba(103, 232, 249, .58);
    box-shadow: 0 18px 32px rgba(0, 0, 0, .34), 0 0 28px rgba(0, 229, 255, .16), inset 0 1px 0 rgba(255, 255, 255, .08);
}

.roadmap-action-primary {
    background: linear-gradient(155deg, rgba(0, 126, 170, .72), rgba(12, 31, 61, .96));
    border-color: rgba(103, 232, 249, .42);
}

.roadmap-action-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    margin-bottom: 24px;
    border: 1px solid rgba(103, 232, 249, .34);
    border-radius: 13px;
    background: rgba(103, 232, 249, .1);
    color: var(--roadmap-cyan);
    font-size: 22px;
    box-shadow: 0 0 18px rgba(0, 229, 255, .1);
}

.roadmap-action-primary .roadmap-action-icon {
    border-color: rgba(103, 232, 249, .62);
    background: rgba(103, 232, 249, .16);
    color: #dffbff;
}

.roadmap-action-content {
    display: block;
    min-width: 0;
    flex: 1;
}

.roadmap-action-content h3 {
    margin: 0 0 10px;
    color: #f4fbff;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.3;
    overflow-wrap: anywhere;
}

.roadmap-action-content p {
    margin: 0 !important;
    color: #8ea5ba !important;
    font-size: 13px;
    line-height: 1.55 !important;
}

.roadmap-action-primary .roadmap-action-content p {
    color: #b8dbe7 !important;
}

.roadmap-action-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 40px;
    margin-top: 24px;
    padding: 10px 13px;
    border: 1px solid rgba(103, 232, 249, .24);
    border-radius: 10px;
    background: rgba(103, 232, 249, .07);
    color: #c9f8ff;
    font-size: 13px;
    font-weight: 700;
    box-shadow: none;
}

.roadmap-action-cta span {
    color: var(--roadmap-cyan);
    font-size: 17px;
    transition: transform .2s ease;
}

.roadmap-action-card:hover .roadmap-action-cta {
    border-color: rgba(103, 232, 249, .52);
    background: rgba(103, 232, 249, .13);
    box-shadow: 0 0 16px rgba(0, 229, 255, .12);
}

.roadmap-action-card:hover .roadmap-action-cta span {
    transform: translateX(3px);
}

@media (max-width: 720px) {
    .roadmap-action-grid { grid-template-columns: 1fr; }
    .roadmap-action-card { min-height: 248px; }
}

@keyframes roadmap-enter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes roadmap-section-enter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 720px) { .roadmap-page { padding: 28px 16px 52px !important; } .roadmap-stats, .roadmap-action-grid { grid-template-columns: 1fr; } .roadmap-page h1 { font-size: 42px; } .roadmap-section { padding: 19px !important; } .roadmap-empty-state { padding: 32px 20px; } }
@media (prefers-reduced-motion: reduce) { .roadmap-page, .roadmap-section { animation: none; } .roadmap-page * { transition-duration: .01ms !important; } }
`;

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

    return (
        <>
            <style>{roadmapStyles}</style>

            <div className="roadmap-page">
                <header className="roadmap-hero">
                    <button className="roadmap-back-button" onClick={onBack}>
                        <span aria-hidden="true">←</span> Back
                    </button>

                    <div className="roadmap-hero-copy">
                        <h1>Learning Roadmap</h1>
                        <p className="roadmap-exam-title">{exam.title}</p>
                        <p className="roadmap-hero-description">
                            Your personalized path from exam patterns to confident preparation.
                        </p>
                    </div>
                </header>

                {error && (
                    <p className="roadmap-error" role="alert">
                        <span aria-hidden="true">!</span> {error}
                    </p>
                )}

                {!roadmap && (
                    <div className="roadmap-empty-state">
                        <h2>Build your intelligent study path</h2>
                        <p>
                            Analyze your exam data to surface high-value topics, formulas, and practice priorities.
                        </p>
                        <button
                            className="roadmap-primary-button"
                            onClick={generateRoadmap}
                            disabled={loading}
                        >
                            {loading ? "Generating..." : "Generate Learning Roadmap"}
                        </button>
                    </div>
                )}

                {roadmap && (
                    <>
                        {/* STATS */}

                        <div className="roadmap-stats">
                            <div className="roadmap-stat roadmap-stat-priority">
                                🔥{" "}
                                {roadmap.high_priority_topics
                                    ?.length ||
                                    0}{" "}
                                Topics
                            </div>

                            <div className="roadmap-stat roadmap-stat-questions">
                                🎯{" "}
                                {roadmap.predicted_questions
                                    ?.length ||
                                    0}{" "}
                                Questions
                            </div>

                            <div className="roadmap-stat roadmap-stat-formulas">
                                🧠{" "}
                                {roadmap.important_formulas
                                    ?.length ||
                                    0}{" "}
                                Formulas
                            </div>
                        </div>

                        {/* HIGH PRIORITY */}

                        <div
                            className="roadmap-section roadmap-priority"
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
                                        className="roadmap-item"
                                    >
                                        🔥{" "}
                                        {topic}
                                    </div>
                                )
                            )}
                        </div>

                        {/* CONCEPTS */}

                        <div
                            className="roadmap-section roadmap-concepts"
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
                                        className="roadmap-item"
                                    >
                                        📖{" "}
                                        {topic}
                                    </div>
                                )
                            )}
                        </div>

                        {/* FORMULAS */}

                        <div
                            className="roadmap-section roadmap-formulas"
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
                            className="roadmap-section roadmap-mistakes"
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
                                        className="roadmap-item"
                                    >
                                        ⚠️{" "}
                                        {item}
                                    </div>
                                )
                            )}
                        </div>

                        {/* PREDICTED QUESTIONS */}

                        <div
                            className="roadmap-section roadmap-questions"
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
                                        className="roadmap-question-card"
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
                            className="roadmap-section roadmap-revision"
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
                                        className="roadmap-revision-item"
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

                        <div className="roadmap-section roadmap-actions">
                            <h2>🚀 Learning Actions</h2>

                            <div className="roadmap-action-grid">
                                <article className="roadmap-action-card roadmap-action-primary">
                                    <span className="roadmap-action-icon" aria-hidden="true">🎯</span>
                                    <div className="roadmap-action-content">
                                        <h3>Quiz Me On These Topics</h3>
                                        <p>Test your readiness with targeted questions.</p>
                                    </div>
                                    <button className="roadmap-action-cta" onClick={onQuiz}>
                                        Start quiz <span aria-hidden="true">→</span>
                                    </button>
                                </article>

                                <article className="roadmap-action-card">
                                    <span className="roadmap-action-icon" aria-hidden="true">▤</span>
                                    <div className="roadmap-action-content">
                                        <h3>Generate Notes</h3>
                                        <p>Turn this roadmap into focused revision notes.</p>
                                    </div>
                                    <button className="roadmap-action-cta">
                                        Create notes <span aria-hidden="true">→</span>
                                    </button>
                                </article>

                                <article className="roadmap-action-card">
                                    <span className="roadmap-action-icon" aria-hidden="true">◷</span>
                                    <div className="roadmap-action-content">
                                        <h3>Study Plan</h3>
                                        <p>Organize your next study sessions.</p>
                                    </div>
                                    <button className="roadmap-action-cta">
                                        View plan <span aria-hidden="true">→</span>
                                    </button>
                                </article>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}