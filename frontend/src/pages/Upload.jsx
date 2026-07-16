import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);

  async function handleUpload() {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log(data);
    alert(`Uploaded: ${data.filename}`);
  }

  return (
    <div>
      <h1>Upload Notes</h1>

      <input
        type="file"
        onChange={(event) => setFile(event.target.files[0])}
      />

      <p>{file ? file.name : "No file selected"}</p>

      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}