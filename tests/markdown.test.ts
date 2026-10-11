import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("renders headings", () => {
    expect(renderMarkdown("# Title")).toBe("<h1>Title</h1>");
    expect(renderMarkdown("## Sub")).toBe("<h2>Sub</h2>");
    expect(renderMarkdown("### Deep")).toBe("<h3>Deep</h3>");
  });

  it("renders a paragraph", () => {
    expect(renderMarkdown("Hello world")).toBe("<p>Hello world</p>");
  });

  it("joins consecutive lines into one paragraph", () => {
    expect(renderMarkdown("line one\nline two")).toBe("<p>line one line two</p>");
  });

  it("renders an unordered list", () => {
    expect(renderMarkdown("- a\n- b")).toBe("<ul><li>a</li><li>b</li></ul>");
  });

  it("renders inline bold, italic, and code", () => {
    expect(renderMarkdown("**bold**")).toBe("<p><strong>bold</strong></p>");
    expect(renderMarkdown("*ital*")).toBe("<p><em>ital</em></p>");
    expect(renderMarkdown("`code`")).toBe("<p><code>code</code></p>");
  });

  it("renders a link with target and rel", () => {
    expect(renderMarkdown("[site](https://example.com)")).toBe(
      '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a></p>',
    );
  });

  it("escapes raw HTML to prevent XSS", () => {
    const out = renderMarkdown('<script>alert("x")</script>');
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("does not turn a javascript: link into an anchor", () => {
    const out = renderMarkdown("[x](javascript:alert(1))");
    expect(out).not.toContain("<a ");
  });

  it("handles CRLF line endings", () => {
    expect(renderMarkdown("a\r\n\r\nb")).toBe("<p>a</p>\n<p>b</p>");
  });
});
