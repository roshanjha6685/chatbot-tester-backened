import { FC, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BotMessageProps {
  text: string;
  accentColor?: string; // default: #00d4aa
}

type LineType = "empty" | "header" | "bullet" | "normal";

interface ParsedLine {
  type: LineType;
  content: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function classifyLine(line: string): ParsedLine {
  const trimmed = line.trim();

  if (!trimmed) return { type: "empty", content: "" };

  if (trimmed.startsWith("**") && trimmed.endsWith("**") && trimmed.length > 4)
    return { type: "header", content: trimmed.slice(2, -2) };

  if (trimmed.startsWith("- "))
    return { type: "bullet", content: trimmed.slice(2) };

  return { type: "normal", content: line };
}

function parseBold(str: string): ReactNode[] {
  const parts = str.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) =>
    j % 2 === 1
      ? <strong key={j} style={{ fontWeight: 700 }}>{part}</strong>
      : part
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

const BotMessage: FC<BotMessageProps> = ({ text, accentColor = "#00d4aa" }) => {
  const lines: ParsedLine[] = text.split("\n").map(classifyLine);

  return (
    <div style={{ lineHeight: 1.65, fontSize: 13, color: "#334155" }}>
      {lines.map((line, i) => {
        switch (line.type) {

          case "empty":
            return <div key={i} style={{ height: 6 }} />;

          case "header":
            return (
              <div
                key={i}
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: "#0f172a",
                  marginTop: i === 0 ? 0 : 12,
                  marginBottom: 5,
                  borderBottom: "1.5px solid #e2e8f0",
                  paddingBottom: 4,
                  letterSpacing: 0.01,
                }}
              >
                {line.content}
              </div>
            );

          case "bullet":
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 4,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    color: accentColor,
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: 1,
                    fontSize: 14,
                  }}
                >
                  •
                </span>
                <span>{parseBold(line.content)}</span>
              </div>
            );

          case "normal":
          default:
            return (
              <div key={i} style={{ marginBottom: 3 }}>
                {parseBold(line.content)}
              </div>
            );
        }
      })}
    </div>
  );
};

export default BotMessage;