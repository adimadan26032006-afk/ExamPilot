export default function ReviewScreen({
    quiz,
    answers,
    onExit,
}) {

    return (

        <div style={{ padding: "30px" }}>

            <h1>📝 Review Answers</h1>

            <hr />

            {quiz.map((question, index) => {

                const correct =
                    answers[index] === question.answer;

                return (

                    <div
                        key={index}
                        style={{
                            marginBottom: "35px",
                            borderBottom: "1px solid #ccc",
                            paddingBottom: "20px",
                        }}
                    >

                        <h3>

                            {correct ? "✅" : "❌"} Question {index + 1}

                        </h3>

                        <p>

                            <strong>

                                {question.question}

                            </strong>

                        </p>

                        <p>

                            <strong>Your Answer:</strong>

                            {" "}

                            {answers[index] !== null
                                ? question.options[answers[index]]
                                : "Not Answered"}

                        </p>

                        <p>

                            <strong>Correct Answer:</strong>

                            {" "}

                            {question.options[question.answer]}

                        </p>

                        <p>

                            <strong>Explanation:</strong>

                            {" "}

                            {question.explanation}

                        </p>

                    </div>

                );

            })}

            <button onClick={onExit}>

                Back to Dashboard

            </button>

        </div>

    );

}