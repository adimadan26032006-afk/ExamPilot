export default function Button({
  children,
  onClick,
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 18px",
        borderRadius: "10px",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "16px",
        width: "220px",
        marginBottom: "12px",
        backgroundColor: "#2563eb",
        color: "white",
        fontWeight: "600",
      }}
    >
      {children}
    </button>
  );
}