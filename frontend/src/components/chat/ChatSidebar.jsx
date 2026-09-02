export default function ChatSidebar({

    sessions,

    currentSession,

    onSessionSelect,

    onNewChat,

}) {

    return (

        <div
            style={{
                width: "290px",
                background: "#202123",
                color: "#ECECF1",
                display: "flex",
                flexDirection: "column",
                padding: "18px",
                boxSizing: "border-box",
                borderRight: "1px solid #2F3037",
            }}
        >

            <button
                onClick={onNewChat}
                style={{
                    padding: "12px",
                    border: "1px solid #3E3F4B",
                    borderRadius: "10px",
                    background: "#10A37F",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                    marginBottom: "20px",
                }}
            >
                ➕ New Chat
            </button>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                }}
            >

                {sessions.length === 0 ? (

                    <p
                        style={{
                            color: "#A0A0A0",
                            textAlign: "center",
                            marginTop: "20px",
                        }}
                    >
                        No chats yet
                    </p>

                ) : (

                    sessions.map((session) => (

                        <div
                            key={session.id}
                            onClick={() => onSessionSelect(session)}
                            style={{
                                padding: "12px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                color: "#ECECF1",
                                background:
                                    currentSession?.id === session.id
                                        ? "#343541"
                                        : "transparent",
                                transition: "0.2s",
                                fontWeight:
                                    currentSession?.id === session.id
                                        ? "600"
                                        : "400",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                            onMouseEnter={(e) => {

                                if (currentSession?.id !== session.id) {

                                    e.currentTarget.style.background =
                                        "#2A2B32";

                                }

                            }}
                            onMouseLeave={(e) => {

                                if (currentSession?.id !== session.id) {

                                    e.currentTarget.style.background =
                                        "transparent";

                                }

                            }}
                        >

                            💬 {session.title}

                        </div>

                    ))

                )}

            </div>

        </div>

    );

}