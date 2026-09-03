export async function callClaude(prompt, maxTokens = 500) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: "ai_disabled" };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) return { error: "ai_error" };

    const data = await response.json();
    const out = (data.content || []).map((b) => b.text || "").join("");
    return { text: out.replace(/```json|```/g, "").trim() };
  } catch (e) {
    return { error: "ai_error" };
  }
}
