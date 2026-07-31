export default function SourcePicker({ feature, onSourceSelect }) {
  let heading = "";

  if (feature === "summary") {
    heading = "Choose your study source";
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>{heading}</h2>

      <button onClick={() => onSourceSelect("notes")}>
        📄 My Notes
      </button>

      <br /><br />

      <button onClick={() => onSourceSelect("topic")}>
        📚 Study Any Topic
      </button>
    </div>
  );
}