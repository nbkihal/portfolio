import type { ProjectCode } from "@/content/site-data";
import { cn } from "@/lib/utils";

const KEYWORDS = new Set([
  "def",
  "class",
  "return",
  "if",
  "elif",
  "else",
  "while",
  "for",
  "in",
  "break",
  "continue",
  "import",
  "from",
  "as",
  "try",
  "except",
  "with",
  "not",
  "and",
  "or",
  "None",
  "True",
  "False",
  "const",
  "let",
  "await",
  "async",
  "final",
  "void",
]);

/** Splits a line into coloured tokens — just enough for a showcase. */
function highlight(line: string) {
  const tokens: Array<{ text: string; className?: string }> = [];
  const comment =
    line.indexOf("#") >= 0 ? line.indexOf("#") : line.indexOf("//");
  const code = comment >= 0 ? line.slice(0, comment) : line;

  for (const part of code.split(/(\s+|[().,:=])/)) {
    if (!part) continue;
    if (KEYWORDS.has(part))
      tokens.push({ text: part, className: "text-[#c792ea]" });
    else if (/^[A-Z]\w*$/.test(part))
      tokens.push({ text: part, className: "text-[#ffcb6b]" });
    else if (
      /^\w+$/.test(part) &&
      /^\(/.test(code.slice(code.indexOf(part) + part.length))
    )
      tokens.push({ text: part, className: "text-[#82aaff]" });
    else tokens.push({ text: part });
  }
  if (comment >= 0) {
    tokens.push({
      text: line.slice(comment),
      className: "italic text-[#676e95]",
    });
  }
  return tokens;
}

/** Dark editor window with a file tab and line numbers. */
export function CodeWindow({
  code,
  className,
}: {
  code: ProjectCode;
  className?: string;
}) {
  const lines = code.snippet.split("\n");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/10 bg-[#0f111a] text-left shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#090b10] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 truncate rounded-md bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-white/60">
          {code.file}
        </span>
      </div>
      <pre className="overflow-hidden p-4 font-mono text-[11px] leading-relaxed text-[#a6accd] sm:text-xs">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="block whitespace-pre">
              <span className="mr-4 inline-block w-5 select-none text-right text-white/20">
                {i + 1}
              </span>
              {highlight(line).map((token, j) => (
                <span key={j} className={token.className}>
                  {token.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
