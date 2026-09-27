export default function ChatSidebar({

    sessions,

    currentSession,

    onSessionSelect,

    onNewChat,

}) {

    return (

        <aside className="chat-sidebar">

            <button className="chat-new-button" onClick={onNewChat}>
                <span>＋</span> New chat
            </button>
            <p className="chat-sidebar-label">YOUR CONVERSATIONS</p>

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

                    <p className="chat-empty-state">No chats yet<span>Start a fresh conversation above</span></p>

                ) : (

                    sessions.map((session) => (

                        <div
                            key={session.id}
                            onClick={() => onSessionSelect(session)}
                            className={`chat-session ${currentSession?.id === session.id ? "is-active" : ""}`}
                        >
                            <span className="chat-session-icon">◌</span>
                            <span>{session.title}</span>
                        </div>

                    ))

                )}

            </div>

        </aside>

    );

}