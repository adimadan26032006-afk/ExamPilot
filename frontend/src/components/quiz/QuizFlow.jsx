import { useState } from "react";

import QuizQuestion from "./QuizQuestion";
import QuizResult from "./QuizResult";
import SourcePicker from "../revision/SourcePicker";
import DocumentPicker from "../common/DocumentPicker";
import QuizSettings from "./QuizSettings";

export default function QuizFlow({
    onExit,
    initialDocument = null,
})  {

    const [step, setStep] = useState(
    initialDocument ? "settings" : "source"
);

    const [selectedDocument, setSelectedDocument] =
    useState(initialDocument);

    const [quizType, setQuizType] = useState("Quick Quiz");
    const [difficulty, setDifficulty] = useState("Medium");

    const [loading, setLoading] = useState(false);

    const [quiz, setQuiz] = useState([]);

    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [answers, setAnswers] = useState([]);

    const [finished, setFinished] = useState(false);

    async function startQuiz() {

        if (!selectedDocument) {
            alert("Please select a document.");
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:8000/generate-quiz",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        document_id: selectedDocument.id,
                        quiz_type: quizType,
                        difficulty: difficulty,
                    }),
                }
            );

            const data = await response.json();

            setQuiz(data.quiz);

            setAnswers(new Array(data.quiz.length).fill(null));

            setCurrentQuestion(0);

            setFinished(false);
            setStep("quiz");

        } catch (error) {

            console.error(error);

            alert("Failed to generate quiz.");

        } finally {

            setLoading(false);

        }

    }
    function handleSourceSelect(source) {

    if (source === "notes") {

        setStep("documents");

    } else {

        alert("AI Topic Quiz coming soon!");

    }

}

    function handleDocumentSelect(document) {

    setSelectedDocument(document);

    setStep("settings");

    }
    function handleBack() {

    if (step === "source") {

        onExit();

    }

    else if (step === "documents") {

        setStep("source");

    }

    else if (step === "settings") {

        setStep("documents");

    }

}

    function selectAnswer(answerIndex) {

        const updated = [...answers];

        updated[currentQuestion] = answerIndex;

        setAnswers(updated);

    }

    function nextQuestion() {

        if (answers[currentQuestion] === null) {
            alert("Please choose an answer first.");
            return;
        }

        if (currentQuestion === quiz.length - 1) {

            setFinished(true);

            return;

        }

        setCurrentQuestion(currentQuestion + 1);

    }

    function calculateScore() {

        let score = 0;

        quiz.forEach((question, index) => {

            if (answers[index] === question.answer) {

                score++;

            }

        });

        return score;

    }

    if (finished) {

        return (

            <QuizResult
                score={calculateScore()}
                totalQuestions={quiz.length}
                quiz={quiz}
                answers={answers}
                onRestart={() => {
                    setQuiz([]);
                    setFinished(false);
                }}
                onExit={onExit}
            />

        );

    }

    if (quiz.length > 0) {

        return (

            <div style={{ padding: "30px" }}>

                <QuizQuestion
                    question={quiz[currentQuestion]}
                    questionNumber={currentQuestion + 1}
                    selectedAnswer={answers[currentQuestion]}
                    onAnswerSelect={selectAnswer}
                />

                <br />

                <button onClick={nextQuestion}>

                    {currentQuestion === quiz.length - 1
                        ? "Finish Quiz"
                        : "Next"}

                </button>

            </div>

        );

    }

    return (

    <div style={{ padding: "30px" }}>

        <button onClick={handleBack}>
            {step === "source"
                ? "← Dashboard"
                : "← Back"}
        </button>

        <br /><br />

        <h1>❓ Test Yourself</h1>

        <hr />

        {step === "source" && (

            <SourcePicker
                feature="quiz"
                onSourceSelect={handleSourceSelect}
            />

        )}

        {step === "documents" && (

            <DocumentPicker
                onDocumentSelect={handleDocumentSelect}
            />

        )}

        {step === "settings" && (

    <>
        <div
            style={{
                marginBottom: "20px",
                padding: "12px",
                background: "#f3f4f6",
                borderRadius: "10px",
            }}
        >
            <strong>Document:</strong>{" "}
            {selectedDocument?.filename}
        </div>

        <QuizSettings
            quizType={quizType}
            setQuizType={setQuizType}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            loading={loading}
            onStart={startQuiz}
        />
    </>

)}

    </div>

);

}