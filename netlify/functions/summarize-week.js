// Summarize a week's worth of daily reports + quick notes into a structured weekly draft.
// The model returns JSON; the client merges it into the weekly editor.

const truncate = (text, max) => {
  if (!text) return "";
  const s = String(text);
  return s.length <= max ? s : s.slice(0, max) + " …[truncated]";
};

const buildSourceBlock = ({ project, dailyReports, quickNotes, weekEnding }) => {
  const parts = [];
  parts.push(`Project: ${project?.jobName || ""} (Job #${project?.jobNumber || ""})`);
  parts.push(`Project Type: ${project?.projectType || "GC"}`);
  parts.push(`Week ending: ${weekEnding || ""}`);
  parts.push("");

  // Tasks/milestones — for context on completion status
  if (Array.isArray(project?.tasks) && project.tasks.length > 0) {
    parts.push("Project Tasks (status reference):");
    project.tasks.slice(0, 30).forEach(t => {
      const milestone = t.isMilestone ? " [MILESTONE]" : "";
      parts.push(`- ${t.description || "(unnamed)"}${milestone} — ${t.status || "not_started"}${t.actualCompletionDate ? `, completed ${t.actualCompletionDate}` : ""}`);
    });
    parts.push("");
  }

  const dailies = (dailyReports || []).slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  if (dailies.length > 0) {
    parts.push(`Daily Reports for the week (${dailies.length} total, oldest first):`);
    dailies.forEach(r => {
      const wf = r.workforce
        ? Object.entries(r.workforce).filter(([_, v]) => v && (v.men || 0) > 0).map(([k, v]) => `${k}: ${v.men}@${v.hours}h`).join(", ")
        : "";
      parts.push(
        `--- ${r.date}${r.day ? ` (${r.day})` : ""} ---`,
        `Weather: ${r.weather || "—"}${r.temperature ? `, ${r.temperature}` : ""}${r.rainfall ? `, rainfall ${r.rainfall}in` : ""}`,
        r.shift ? `Shift: ${r.shift.type || ""} ${r.shift.hours || ""}h` : "",
        r.generalNotes ? `Notes: ${truncate(r.generalNotes, 800)}` : "",
        wf ? `Workforce: ${wf}` : "",
        r.completedTasks?.length ? `Completed: ${r.completedTasks.join("; ")}` : "",
        r.delaysProblems ? `Delays/Problems: ${truncate(r.delaysProblems, 400)}` : "",
        r.incidents && r.incidents !== "N/A" ? `Incidents: ${truncate(r.incidents, 200)}` : "",
        r.materialDeliveries ? `Material Deliveries: ${truncate(r.materialDeliveries, 300)}` : "",
        r.extraWork ? `Extra Work: ${truncate(r.extraWork, 300)}` : "",
        r.thirdPartyUtilities ? `Third Party: ${truncate(r.thirdPartyUtilities, 200)}` : ""
      );
    });
    parts.push("");
  }

  const notes = (quickNotes || []).slice().sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
  if (notes.length > 0) {
    parts.push(`Quick Notes from the week (${notes.length} total):`);
    notes.forEach(n => {
      const tags = (n.tags || []).length ? ` [${n.tags.map(t => `#${t}`).join(" ")}]` : "";
      const author = n.author ? ` — ${n.author}` : "";
      const when = n.createdAt ? n.createdAt.slice(0, 16).replace("T", " ") : "";
      parts.push(`- (${when})${tags}${author}: ${truncate(n.text, 500)}`);
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
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "OpenAI API key not configured." }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { project, dailyReports, quickNotes, weekEnding } = body;
    if (!Array.isArray(dailyReports) || dailyReports.length === 0) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "No daily reports provided for the week" }) };
    }

    const sourceBlock = buildSourceBlock({ project, dailyReports, quickNotes, weekEnding });
    const MAX = 80000;
    const safeSources = sourceBlock.length > MAX ? sourceBlock.slice(0, MAX) + "\n[...truncated]" : sourceBlock;

    const isCM = (project?.projectType || "GC") === "CM";

    const systemPrompt = `You are a construction reporting assistant. Given a week's daily field reports and any quick field notes, produce a STRUCTURED WEEKLY REPORT DRAFT for review.

Project type: ${project?.projectType || "GC"} (${isCM ? "Construction Management" : "General Contractor"}).

Rules:
- Synthesize, don't just concatenate. Group similar work across days, mark completions, and avoid restating the same item twice.
- Be specific: cite dates, named work areas, equipment, etc. when the source has them.
- Don't invent facts. If a field has no source material, return an empty string or empty array.
- Keep each list item one short line (a sentence or fragment), suitable for bullet rendering.
- Tone: professional, concise.

Return ONLY a single JSON object with these exact keys (use empty string/array when not applicable):

{
  "ongoingCompleted": [string],   // bullet list of work in progress + items completed this week. Prefix completed items with "[COMPLETED] ".
  "lookAhead": [string],          // bullet list of work planned for next week, derived from in-progress tasks and notes
  "outstandingRFIs": string,      // narrative of open RFIs, or "None" if not mentioned
  "hotSubmittals": string,        // narrative of hot/urgent submittals, or "" if none mentioned
  "safety": string,               // safety summary; "No incidents reported" if none
  "importantDates": string,       // upcoming key dates mentioned in the week
  "ownerDeliveryDates": string,   // owner-furnished delivery dates if mentioned
  "outstandingOwnerItems": string,// items waiting on the owner
  "upcomingInspections": string,  // inspections coming up
  "hindrances": string,           // anything blocking progress; quote delays/problems if relevant
  "nextOACMeeting": string,       // ISO date (YYYY-MM-DD) if explicitly mentioned, else ""
  "meetingOutcomes": [string],    // CM-only: outcomes from any meetings mentioned in notes/dailies. Empty array for GC unless meetings show up.
  "outstandingItems": [string]    // CM-only: list of outstanding action items. Empty array for GC unless they show up.
}

If projectType is GC, leave meetingOutcomes and outstandingItems as empty arrays unless the source clearly shows them.
If projectType is CM, populate meetingOutcomes and outstandingItems aggressively from notes and dailies.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${safeSources}\n\nProduce the JSON weekly draft now.` }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      return { statusCode: response.status, headers: corsHeaders, body: JSON.stringify({ error: "Failed to summarize week" }) };
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    let draft;
    try {
      draft = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse model JSON:", raw);
      return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: "Model returned invalid JSON" }) };
    }

    // Defensive normalization — make sure every key exists with the right type.
    const draftArr = (v) => Array.isArray(v) ? v.filter(x => typeof x === "string" && x.trim()).map(x => x.trim()) : [];
    const draftStr = (v) => typeof v === "string" ? v.trim() : "";
    const normalized = {
      ongoingCompleted: draftArr(draft.ongoingCompleted),
      lookAhead: draftArr(draft.lookAhead),
      outstandingRFIs: draftStr(draft.outstandingRFIs) || "None",
      hotSubmittals: draftStr(draft.hotSubmittals),
      safety: draftStr(draft.safety) || "No incidents reported",
      importantDates: draftStr(draft.importantDates),
      ownerDeliveryDates: draftStr(draft.ownerDeliveryDates),
      outstandingOwnerItems: draftStr(draft.outstandingOwnerItems),
      upcomingInspections: draftStr(draft.upcomingInspections),
      hindrances: draftStr(draft.hindrances),
      nextOACMeeting: draftStr(draft.nextOACMeeting),
      meetingOutcomes: draftArr(draft.meetingOutcomes),
      outstandingItems: draftArr(draft.outstandingItems),
    };

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ draft: normalized })
    };
  } catch (error) {
    console.error("summarize-week error:", error);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};
