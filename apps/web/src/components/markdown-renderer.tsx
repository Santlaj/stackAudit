"use client";

/**
 * Renders Markdown content as HTML with proper support for:
 * - GFM Tables (pipe-delimited)
 * - Headers (h1-h3)
 * - Bold, Italic, Inline Code
 * - Code Blocks
 * - Lists (unordered)
 * - Blockquotes
 * - Horizontal Rules
 * - Links
 *
 * Zero external dependencies.
 */

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = convertMarkdownToHtml(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function convertMarkdownToHtml(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // --- Code blocks ---
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        output.push(`<pre><code>${codeBuffer.join("\n")}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushTable();
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(escapeHtml(line));
      continue;
    }

    // --- Tables ---
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      // Check if this is a separator row (e.g., |---|---|)
      const isSeparator = line.replace(/[\s|:-]/g, "").length === 0;
      if (!isSeparator) {
        if (!inTable) inTable = true;
        tableRows.push(line);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // --- Horizontal rule ---
    if (/^---+$/.test(line.trim())) {
      output.push("<hr />");
      continue;
    }

    // --- Headers ---
    if (line.startsWith("### ")) {
      output.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      output.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      output.push(`<h1>${inlineFormat(line.slice(2))}</h1>`);
      continue;
    }

    // --- Blockquotes ---
    if (line.startsWith("> ")) {
      output.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
      continue;
    }

    // --- Unordered list items ---
    if (/^[-*] /.test(line.trim())) {
      output.push(`<li>${inlineFormat(line.replace(/^[\s]*[-*] /, ""))}</li>`);
      continue;
    }

    // --- Numbered list items ---
    if (/^\d+\.\s/.test(line.trim())) {
      output.push(`<li>${inlineFormat(line.replace(/^[\s]*\d+\.\s/, ""))}</li>`);
      continue;
    }

    // --- Empty lines ---
    if (line.trim() === "") {
      continue;
    }

    // --- Regular paragraph ---
    output.push(`<p>${inlineFormat(line)}</p>`);
  }

  // Flush any remaining table
  flushTable();

  return output.join("\n");

  function flushTable() {
    if (!inTable || tableRows.length === 0) return;

    let tableHtml = '<div style="overflow-x:auto"><table>';

    // First row = header
    const headerCells = parseTableRow(tableRows[0]);
    tableHtml += "<thead><tr>";
    for (const cell of headerCells) {
      tableHtml += `<th>${inlineFormat(cell)}</th>`;
    }
    tableHtml += "</tr></thead>";

    // Remaining rows = body
    if (tableRows.length > 1) {
      tableHtml += "<tbody>";
      for (let r = 1; r < tableRows.length; r++) {
        const cells = parseTableRow(tableRows[r]);
        tableHtml += "<tr>";
        for (const cell of cells) {
          tableHtml += `<td>${inlineFormat(cell)}</td>`;
        }
        tableHtml += "</tr>";
      }
      tableHtml += "</tbody>";
    }

    tableHtml += "</table></div>";
    output.push(tableHtml);

    inTable = false;
    tableRows = [];
  }
}

function parseTableRow(row: string): string[] {
  // Remove leading/trailing pipes and split
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineFormat(text: string): string {
  let result = escapeHtml(text);

  // Code (must come before bold/italic to avoid conflicts)
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // HTML line breaks (<br> that were in the markdown as literal text)
  result = result.replace(/&lt;br&gt;/g, "<br />");
  result = result.replace(/&lt;br \/&gt;/g, "<br />");
  result = result.replace(/&lt;br\/&gt;/g, "<br />");

  return result;
}
