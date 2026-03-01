exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "OpenAI API key not configured" })
    };
  }

  try {
    const { notes } = JSON.parse(event.body);
    if (!notes || !notes.trim()) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "No notes provided" })
      };
    }

    const systemPrompt = `You are a construction field report assistant. Reformat the following raw field notes into a clean, professional format using HEADING — detail pairs. Each major activity or topic should get its own heading in ALL CAPS, followed by a dash and the detail. Keep all factual information but improve clarity and professionalism.

Example format:

CONCRETE POUR — Completed 3rd floor slab pour, 45 cubic yards placed. Pump truck arrived at 6:30 AM, pour finished by 2:00 PM.

ELECTRICAL ROUGH-IN — Crew continued 2nd floor rough-in, completed 60% of conduit runs in zones A and B.

Return only the reformatted text, no additional explanation.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please reformat these field notes:\n\n${notes}` }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Failed to process notes with OpenAI" })
      };
    }

    const data = await response.json();
    const revised = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ revised })
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
