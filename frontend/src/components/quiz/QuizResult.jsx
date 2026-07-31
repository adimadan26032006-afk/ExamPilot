import { useState } from "react";

import ReviewScreen from "./ReviewScreen";

export default function QuizResult({
    score,
    totalQuestions,
    quiz,
    answers,
    onRestart,
    onExit,
}) {

    const [reviewMode, setReviewMode] = useState(false);

    if (reviewMode) {

        return (
            <ReviewScreen
                quiz={quiz}
                answers={answers}
                onExit={onExit}
            />
        );

    }

    const accuracy =
        Math.round((score / totalQuestions) * 100);

    return (

        <div style={{ padding: "30px" }}>

            <h1>🎉 Quiz Finished</h1>

            <h2>

                Score

            </h2>

            <h1>

                {score} / {totalQuestions}

            </h1>

            <h3>

                Accuracy: {accuracy}%

            </h3>

            <p>

                ✅ Correct: {score}

            </p>

            <p>

                ❌ Incorrect: {totalQuestions - score}

            </p>

            <br />

            <button
                onClick={() => setReviewMode(true)}
            >

                📝 Review Answers

            </button>

            <br /><br />

            <button onClick={onRestart}>

                Retry Quiz

            </button>

            <br /><br />

            <button onClick={onExit}>

                Back to Dashboard

            </button>

        </div>

    );

}