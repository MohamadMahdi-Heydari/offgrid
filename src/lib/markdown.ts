function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderMarkdown(text: string) {
  const escaped = escapeHtml(text);

  const codeBlocks = escaped.replace(/```([\w-]+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
    const language = lang ? `<span class="mb-2 block text-xs text-zinc-400">${lang}</span>` : "";
    return `<pre class="my-4 overflow-x-auto rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm"><code>${language}${code}</code></pre>`;
  });

  const inlineCode = codeBlocks.replace(/`([^`]+)`/g, "<code class=\"rounded bg-zinc-800 px-1.5 py-0.5 text-[13px]\">$1</code>");

  return inlineCode
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}
