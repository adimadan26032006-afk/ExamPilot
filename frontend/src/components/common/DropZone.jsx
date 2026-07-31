import { useDropzone } from "react-dropzone";

export default function DropZone({ onFileSelect }) {

    const { getRootProps, getInputProps } = useDropzone({

        multiple: false,

        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
            "text/plain": [".txt"],
        },

        onDrop: (acceptedFiles) => {

            if (acceptedFiles.length > 0) {

                onFileSelect(acceptedFiles[0]);

            }

        },

    });

    return (

        <div
            {...getRootProps()}
            className="card"
            style={{
                cursor: "pointer",
                padding: "60px",
                textAlign: "center",
                border: "2px dashed rgba(0,229,255,.45)",
            }}
        >

            <input {...getInputProps()} />

            <h1 style={{ fontSize: "70px" }}>
                📄
            </h1>

            <h2>Drag & Drop your study material</h2>

            <p style={{ color: "#A6C0D4" }}>
                or click to browse
            </p>

            <br />

            <p style={{ color: "#00E5FF" }}>
                PDF • DOCX • PPTX • TXT
            </p>

        </div>

    );

}