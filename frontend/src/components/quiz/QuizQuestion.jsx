export default function QuizQuestion({
    question,
    questionNumber,
    selectedAnswer,
    onAnswerSelect,
}) {

    return (
        <div className="quiz-question-motion">

            <h2>
                Question {questionNumber}
            </h2>

            <h3>{question.question}</h3>

            <br />

            {question.options.map((option, index) => (

                <div key={index}>

                    <label>

                        <input
                            type="radio"
                            checked={selectedAnswer === index}
                            onChange={() => onAnswerSelect(index)}
                        />

                        {" "}{option}

                    </label>

                    <br /><br />

                </div>

            ))}

        </div>
    );
}