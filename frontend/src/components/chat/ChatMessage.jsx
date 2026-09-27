import MarkdownAnswer from "../MarkdownAnswer";

export default function ChatMessage({
    role,
    text,
}) {

    const isUser = role === "user";

    return (

        <div className={`chat-message-row ${isUser ? "from-user" : "from-ai"}`}>
            <div className="chat-avatar">{isUser ? "Y" : "✦"}</div>
            <div className="chat-message-bubble">
                <div className="chat-message-meta">
                    <strong>{isUser ? "You" : "ExamPilot"}</strong>
                    <span>{isUser ? "You asked" : "AI tutor"}</span>
                </div>

                {isUser ? (
                    text
                ) : (
                    <MarkdownAnswer text={text} />
                )}

            </div>
        </div>

    );

}