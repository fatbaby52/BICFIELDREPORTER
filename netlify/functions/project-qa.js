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
    const { question, project, dailyReports } = JSON.parse(event.body);
    if (!question || !question.trim()) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "No question provided" })
      };
    }

    // Build context from project and daily reports
    const projectContext = `
Project Information:
- Job Name: ${project.jobName}
- Job Number: ${project.jobNumber}
- Client: ${project.client}
- Location: ${project.location || "Not specified"}

Milestones:
${project.milestones?.map(m => `- ${m.description}: Target ${m.targetDate}, Actual ${m.actualDate || "Not completed"}`).join("\n") || "No milestones"}

Daily Reports Summary:
${dailyReports?.slice(-10).map(r => `
Date: ${r.date}
Weather: ${r.weather}
Shift: ${r.shift?.type} (${r.shift?.hours} hours)
General Notes: ${r.generalNotes || "No notes"}
Daily Workforce: ${r.workforce ? Object.entries(r.workforce).filter(([_, v]) => v.day || v.night).map(([k, v]) => `${k}: ${v.day} day/${v.night} night`).join(", ") : "Not specified"}
Completed Tasks: ${r.completedTasks?.join(", ") || "None"}
Delays/Problems: ${r.delaysProblems || "None"}
Incidents: ${r.incidents || "None"}
`).join("\n---\n") || "No daily reports"}
`;

    const systemPrompt = `You are a construction project assistant. Answer questions about the project based on the provided project information and daily reports. Be concise but thorough. Focus on specific facts from the reports.`;

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
          { role: "user", content: `${projectContext}\n\nQuestion: ${question}` }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Failed to answer question with OpenAI" })
      };
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ answer })
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
