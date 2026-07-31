export default function ChatMessage({
    role,
    text,
}) {

    const isUser = role === "user";

    return (

        <div
            style={{
                display: "flex",
                justifyContent: isUser
                    ? "flex-end"
                    : "flex-start",
                marginBottom: "15px",
            }}
        >

            <div
                style={{
                    maxWidth: "70%",
                    padding: "14px",
                    borderRadius: "15px",
                    background: isUser
                        ? "#2563eb"
                        : "#2e2e2e",
                    color: "white",
                    whiteSpace: "pre-wrap",
                }}
            >

                <strong>

                    {isUser ? "You" : "ExamPilot"}

                </strong>

                <br /><br />

                {text}

            </div>

        </div>

    );

}