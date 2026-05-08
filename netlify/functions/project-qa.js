// Truncate a string to a max length, preserving readability with an ellipsis marker.
const truncate = (text, max) => {
  if (!text) return "";
  const s = String(text);
  if (s.length <= max) return s;
  return s.slice(0, max) + " …[truncated]";
};

// Build the project context block fed to the model.
// Newest items first per source. Per-section caps prevent any single source from blowing the prompt.
const buildContext = ({ project, dailyReports, weeklyReports, quickNotes, documents }) => {
  const parts = [];

  parts.push(
    `Project Information:`,
    `- Job Name: ${project?.jobName || ""}`,
    `- Job Number: ${project?.jobNumber || ""}`,
    `- Client: ${project?.client || ""}`,
    `- Project Type: ${project?.projectType || "GC"} (${project?.projectType === "CM" ? "Construction Management" : "General Contractor"})`,
    `- Location: ${project?.location || "Not specified"}`,
    ""
  );

  // Tasks / milestones
  if (Array.isArray(project?.tasks) && project.tasks.length > 0) {
    parts.push(`Tasks & Milestones:`);
    project.tasks.slice(0, 30).forEach(t => {
      const milestone = t.isMilestone ? " [MILESTONE]" : "";
      const status = t.status || "not_started";
      const target = t.milestoneTargetDate || t.projectedStartDate || "";
      const actual = t.actualCompletionDate ? `, completed ${t.actualCompletionDate}` : "";
      parts.push(`- ${t.description || "(unnamed)"}${milestone} — status: ${status}${target ? `, target ${target}` : ""}${actual}`);
    });
    parts.push("");
  }

  // Daily Reports — last 12, newest first
  const dailies = (dailyReports || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 12);
  if (dailies.length > 0) {
    parts.push(`Daily Reports (newest first, up to 12):`);
    dailies.forEach(r => {
      const wf = r.workforce
        ? Object.entries(r.workforce).filter(([_, v]) => v && (v.men || 0) > 0).map(([k, v]) => `${k}: ${v.men}@${v.hours}h`).join(", ")
        : "";
      parts.push(
        `--- Daily ${r.date}${r.day ? ` (${r.day})` : ""} ---`,
        `Weather: ${r.weather || "—"}${r.temperature ? `, ${r.temperature}` : ""}${r.rainfall ? `, rainfall ${r.rainfall}in` : ""}`,
        `Shift: ${r.shift?.type || ""} ${r.shift?.hours || ""}h`,
        `Notes: ${truncate(r.generalNotes, 600)}`,
        wf ? `Workforce: ${wf}` : "",
        r.completedTasks?.length ? `Completed: ${r.completedTasks.join("; ")}` : "",
        r.delaysProblems ? `Delays/Problems: ${truncate(r.delaysProblems, 300)}` : "",
        r.incidents && r.incidents !== "N/A" ? `Incidents: ${truncate(r.incidents, 200)}` : "",
        r.materialDeliveries ? `Material Deliveries: ${truncate(r.materialDeliveries, 200)}` : "",
        r.extraWork ? `Extra Work: ${truncate(r.extraWork, 200)}` : ""
      );
    });
    parts.push("");
  }

  // Weekly Reports — last 6, newest first
  const weeklies = (weeklyReports || []).slice().sort((a, b) => (b.weekEnding || "").localeCompare(a.weekEnding || "")).slice(0, 6);
  if (weeklies.length > 0) {
    parts.push(`Weekly Reports (newest first, up to 6):`);
    weeklies.forEach(w => {
      const list = (arr) => (arr || []).filter(Boolean).join("; ");
      parts.push(
        `--- Weekly ending ${w.weekEnding} ---`,
        list(w.ongoingCompleted) ? `Ongoing/Completed: ${truncate(list(w.ongoingCompleted), 600)}` : "",
        list(w.lookAhead) ? `Look Ahead: ${truncate(list(w.lookAhead), 400)}` : "",
        w.outstandingRFIs ? `RFIs: ${truncate(w.outstandingRFIs, 300)}` : "",
        w.hotSubmittals ? `Hot Submittals: ${truncate(w.hotSubmittals, 300)}` : "",
        w.safety && w.safety !== "No incidents" ? `Safety: ${truncate(w.safety, 200)}` : "",
        w.outstandingOwnerItems ? `Outstanding (Owner): ${truncate(w.outstandingOwnerItems, 300)}` : "",
        w.upcomingInspections ? `Upcoming Inspections: ${truncate(w.upcomingInspections, 200)}` : "",
        w.hindrances ? `Hindrances: ${truncate(w.hindrances, 300)}` : "",
        w.nextOACMeeting ? `Next OAC: ${w.nextOACMeeting}` : "",
        list(w.meetingOutcomes) ? `Meeting Outcomes (CM): ${truncate(list(w.meetingOutcomes), 500)}` : "",
        list(w.outstandingItems) ? `Outstanding Items (CM): ${truncate(list(w.outstandingItems), 500)}` : ""
      );
    });
    parts.push("");
  }

  // Quick Notes — last 25, newest first. Each note small, tags are valuable signal.
  const notes = (quickNotes || []).slice().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 25);
  if (notes.length > 0) {
    parts.push(`Quick Notes (field captures, newest first, up to 25):`);
    notes.forEach(n => {
      const tags = (n.tags || []).length ? ` [${n.tags.map(t => `#${t}`).join(" ")}]` : "";
      const author = n.author ? ` — ${n.author}` : "";
      const when = n.createdAt ? n.createdAt.slice(0, 16).replace("T", " ") : "";
      parts.push(`- (${when})${tags}${author}: ${truncate(n.text, 400)}`);
    });
    parts.push("");
  }

  // Documents — newest first, with extracted text. Per-doc text capped; total budget enforced below.
  const docs = (documents || []).slice().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  if (docs.length > 0) {
    parts.push(`Project Documents (newest first):`);
    let docTextBudget = 24000; // total chars across all extracted_text in the prompt
    docs.forEach(d => {
      const tags = (d.tags || []).length ? ` [${d.tags.map(t => `#${t}`).join(" ")}]` : "";
      const meta = `- ${d.title || d.fileName || "Untitled"} (${d.fileName || ""}${d.fileType ? `, ${d.fileType}` : ""})${tags}${d.uploader ? ` — ${d.uploader}` : ""}${d.createdAt ? ` — ${d.createdAt.slice(0, 10)}` : ""}`;
      parts.push(meta);
      if (d.notes) parts.push(`  Notes: ${truncate(d.notes, 200)}`);
      if (d.extractedText && docTextBudget > 0) {
        const slice = d.extractedText.slice(0, Math.min(d.extractedText.length, docTextBudget, 4000));
        docTextBudget -= slice.length;
        parts.push(`  Contents:\n${slice}${d.extractedText.length > slice.length ? "\n…[truncated]" : ""}`);
      } else if (!d.extractedText) {
        parts.push(`  (no extracted text — metadata only)`);
      } else {
        parts.push(`  (text omitted — context budget exhausted)`);
      }
    });
    parts.push("");
  }

  return parts.filter(p => p !== "").join("\n");
};

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "OpenAI API key not configured. Add OPENAI_API_KEY to Netlify environment variables." })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { question, project } = body;
    if (!question || !question.trim()) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "No question provided" })
      };
    }

    const fullContext = buildContext(body);

    // Hard cap on total context — leave headroom for the system prompt and answer.
    const MAX_CONTEXT_CHARS = 90000; // gpt-4o handles 128k tokens; ~3.5 chars/token, so 90k chars ≈ 25k tokens
    const safeContext = fullContext.length > MAX_CONTEXT_CHARS
      ? fullContext.slice(0, MAX_CONTEXT_CHARS) + "\n\n[... additional context truncated for length]"
      : fullContext;

    const systemPrompt = `You are a construction project assistant helping the team understand and reason about the project. You answer based ONLY on the provided context: project info, tasks/milestones, daily reports, weekly reports, quick field notes, and uploaded documents (with their extracted text where available).

Style:
- Be concise but specific. Cite the source when it helps: "per the daily on 2026-04-12", "per the RFI document tagged #change-order", "per Jerry's note from 2026-04-15", etc.
- If multiple sources agree or conflict, say so.
- If the answer isn't in the context, say "I don't have enough information in the project records to answer that confidently."
- Don't fabricate dates, names, or numbers that aren't in the context.`;

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
          { role: "user", content: `${safeContext}\n\nQuestion: ${question}` }
        ],
        temperature: 0.4,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Failed to answer question with OpenAI" })
      };
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ answer })
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
