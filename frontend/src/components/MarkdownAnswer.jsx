import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

export default function MarkdownAnswer({ text }) {
    return (
        <div
            style={{
                lineHeight: "1.6",
            }}
        >
            <ReactMarkdown
                remarkPlugins={[
                    remarkMath,
                    remarkGfm,
                ]}
                rehypePlugins={[
                    rehypeKatex,
                ]}
                components={{
                    h1: ({ children }) => (
                        <h1
                            style={{
                                marginTop: "0",
                                marginBottom: "16px",
                                color: "inherit",
                            }}
                        >
                            {children}
                        </h1>
                    ),

                    h2: ({ children }) => (
                        <h2
                            style={{
                                marginTop: "20px",
                                marginBottom: "12px",
                                color: "inherit",
                            }}
                        >
                            {children}
                        </h2>
                    ),

                    h3: ({ children }) => (
                        <h3
                            style={{
                                marginTop: "18px",
                                marginBottom: "10px",
                                color: "inherit",
                            }}
                        >
                            {children}
                        </h3>
                    ),

                    p: ({ children }) => (
                        <p
                            style={{
                                marginTop: "8px",
                                marginBottom: "12px",
                            }}
                        >
                            {children}
                        </p>
                    ),

                    ul: ({ children }) => (
                        <ul
                            style={{
                                marginTop: "8px",
                                marginBottom: "14px",
                                paddingLeft: "25px",
                            }}
                        >
                            {children}
                        </ul>
                    ),

                    ol: ({ children }) => (
                        <ol
                            style={{
                                marginTop: "8px",
                                marginBottom: "14px",
                                paddingLeft: "25px",
                            }}
                        >
                            {children}
                        </ol>
                    ),

                    li: ({ children }) => (
                        <li
                            style={{
                                marginBottom: "6px",
                            }}
                        >
                            {children}
                        </li>
                    ),

                    table: ({ children }) => (
                        <div
                            style={{
                                overflowX: "auto",
                                marginTop: "16px",
                                marginBottom: "20px",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >
                                {children}
                            </table>
                        </div>
                    ),

                    th: ({ children }) => (
                        <th
                            style={{
                                padding: "10px",
                                textAlign: "left",
                                border: "1px solid #d1d5db",
                                background: "#e5e7eb",
                            }}
                        >
                            {children}
                        </th>
                    ),

                    td: ({ children }) => (
                        <td
                            style={{
                                padding: "10px",
                                border: "1px solid #d1d5db",
                            }}
                        >
                            {children}
                        </td>
                    ),
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    );
}