export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { jobTitle, company, jobDesc, resumeBlurb, tone } = req.body;

  if (!jobTitle || !company || !jobDesc || !resumeBlurb) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = `You are an expert career coach. Write a compelling, personalized cover letter.

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDesc}
Candidate background: ${resumeBlurb}
Tone: ${tone}

Write a 3-paragraph cover letter (opening hook, value proposition, closing CTA). Make it specific, human, and NOT generic. No placeholders. Output ONLY the cover letter text.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "Error generating letter.";
    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate cover letter." });
  }
}
