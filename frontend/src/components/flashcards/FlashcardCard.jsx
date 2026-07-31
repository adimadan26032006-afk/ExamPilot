import { useState } from "react";

export default function FlashcardCard({ flashcards }) {

    const [currentCard, setCurrentCard] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    const card = flashcards[currentCard];

    function nextCard() {

        if (currentCard < flashcards.length - 1) {

            setCurrentCard(currentCard + 1);
            setShowAnswer(false);

        }

    }

    function previousCard() {

        if (currentCard > 0) {

            setCurrentCard(currentCard - 1);
            setShowAnswer(false);

        }

    }

    return (

        <div
            className="page-container"
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
            }}
        >

            <div
                className="card"
                style={{
                    width: "700px",
                    textAlign: "center",
                    padding: "40px",
                }}
            >

                <h2
                    style={{
                        color: "#00E5FF",
                        marginBottom: "25px",
                    }}
                >
                    Card {currentCard + 1} of {flashcards.length}
                </h2>

                <div
                    style={{
                        minHeight: "300px",
                        padding: "35px",
                        borderRadius: "18px",
                        border: "2px solid rgba(0,229,255,.25)",
                        background: "rgba(255,255,255,.03)",
                    }}
                >

                    {!showAnswer ? (

                        <>

                            <h2
                                style={{
                                    color: "#00E5FF",
                                    marginBottom: "25px",
                                }}
                            >
                                ❓ Question
                            </h2>

                            <p
                                style={{
                                    fontSize: "24px",
                                    lineHeight: "1.8",
                                }}
                            >
                                {card.question}
                            </p>

                            <p
                                style={{
                                    color: "#9FB5C8",
                                    marginTop: "35px",
                                }}
                            >
                                Think before revealing the answer.
                            </p>

                        </>

                    ) : (

                        <>

                            <h2
                                style={{
                                    color: "#00E5FF",
                                }}
                            >
                                ✅ Answer
                            </h2>

                            <p
                                style={{
                                    fontSize: "22px",
                                    lineHeight: "1.8",
                                }}
                            >
                                {card.answer}
                            </p>

                            <hr
                                style={{
                                    margin: "30px 0",
                                    borderColor: "rgba(255,255,255,.15)",
                                }}
                            />

                            <h3
                                style={{
                                    color: "#00E5FF",
                                }}
                            >
                                💡 Explanation
                            </h3>

                            <p
                                style={{
                                    lineHeight: "1.8",
                                    color: "#C9D7E5",
                                }}
                            >
                                {card.explanation}
                            </p>

                        </>

                    )}

                </div>

                <br />

                <button
                    onClick={() => setShowAnswer(!showAnswer)}
                >
                    {showAnswer
                        ? "Hide Answer"
                        : "Show Answer"}
                </button>

                <br /><br />

                <button
                    onClick={previousCard}
                    disabled={currentCard === 0}
                >
                    ← Previous
                </button>

                {"   "}

                <button
                    onClick={nextCard}
                    disabled={currentCard === flashcards.length - 1}
                >
                    Next →
                </button>

            </div>

        </div>

    );

}