import React, { useState, useReducer, useRef, useEffect, useCallback, useMemo } from "react";
import * as lucide from "lucide-react";
import { loadProjects, saveProject, deleteProject, loadDailyReports, saveDailyReport, deleteDailyReport, loadWeeklyReports, saveWeeklyReport, uploadPhoto, deletePhoto } from './db';

const {
  LayoutDashboard, FolderCog, ClipboardEdit, FileText, CalendarRange,
  Image, Plus, Trash2, ChevronRight, ChevronDown, Sun, Cloud, CloudRain,
  CloudSnow, Wind, Mic, MicOff, Sparkles, Camera, Upload, Check,
  X, AlertTriangle, Clock, Download, Eye, Edit3, Save, ArrowLeft,
  Building2, HardHat, Truck, Wrench, Users, Calendar, MapPin,
  FileSpreadsheet, FileDown, Menu, ChevronLeft, CircleDot, Search,
  Filter, Tag, TriangleAlert, CheckCircle2, Circle, Loader2, ChevronUp
} = lucide;

/* ═══════════════════════════════════════════════════════════════
   BIC Field Reporter — Construction Daily & Weekly Report App
   ═══════════════════════════════════════════════════════════════ */

// ─── Design Tokens ───────────────────────────────────────────
const T = {
  navy: {
    900: "oklch(18% 0.025 250)", 800: "oklch(22% 0.02 250)",
    700: "oklch(26% 0.02 250)", 600: "oklch(30% 0.02 250)",
    500: "oklch(38% 0.02 250)", 400: "oklch(50% 0.015 250)"
  },
  orange: {
    500: "oklch(70% 0.18 55)", 400: "oklch(76% 0.15 55)",
    600: "oklch(62% 0.18 55)", 100: "oklch(93% 0.04 55)"
  },
  green: { 500: "oklch(65% 0.15 145)", 100: "oklch(93% 0.04 145)" },
  red: { 500: "oklch(60% 0.2 25)", 100: "oklch(93% 0.04 25)" },
  neutral: {
    50: "oklch(97% 0.005 250)", 100: "oklch(95% 0.008 55)",
    200: "oklch(90% 0.008 250)", 300: "oklch(82% 0.008 250)",
    400: "oklch(55% 0.01 250)", 500: "oklch(45% 0.01 250)",  // Darker for better contrast
    600: "oklch(38% 0.01 250)", 700: "oklch(30% 0.01 250)",
    800: "oklch(20% 0.01 250)", 900: "oklch(12% 0.01 250)"
  },
  white: "oklch(98% 0.005 250)",
  font: "'Plus Jakarta Sans', 'Figtree', system-ui, sans-serif",
  radius: { sm: "6px", md: "10px", lg: "16px", xl: "20px" },
  shadow: {
    sm: "0 1px 3px oklch(0% 0 0 / 0.08)",
    md: "0 4px 12px oklch(0% 0 0 / 0.1)",
    lg: "0 8px 30px oklch(0% 0 0 / 0.12)"
  }
};

// ─── Styles ──────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy-900: ${T.navy[900]}; --navy-800: ${T.navy[800]}; --navy-700: ${T.navy[700]};
    --navy-600: ${T.navy[600]}; --navy-500: ${T.navy[500]}; --navy-400: ${T.navy[400]};
    --orange-500: ${T.orange[500]}; --orange-400: ${T.orange[400]}; --orange-600: ${T.orange[600]};
    --orange-100: ${T.orange[100]};
    --green-500: ${T.green[500]}; --green-100: ${T.green[100]};
    --red-500: ${T.red[500]}; --red-100: ${T.red[100]};
    --neutral-50: ${T.neutral[50]}; --neutral-100: ${T.neutral[100]};
    --neutral-200: ${T.neutral[200]}; --neutral-300: ${T.neutral[300]};
    --neutral-400: ${T.neutral[400]}; --neutral-500: ${T.neutral[500]};
    --neutral-600: ${T.neutral[600]};
    --white: ${T.white};
    font-variant-numeric: tabular-nums;
  }

  body { font-family: ${T.font}; background: var(--neutral-50); color: var(--navy-800); }

  input, textarea, select, button { font-family: inherit; }

  /* Focus styles for accessibility */
  :focus-visible { outline: 2px solid var(--orange-500); outline-offset: 2px; }
  button:focus-visible, [role="button"]:focus-visible { outline: 2px solid var(--orange-500); outline-offset: 2px; }

  /* Skip link for keyboard navigation */
  .skip-link { position: absolute; top: -100px; left: 16px; padding: 12px 24px; background: var(--navy-800); color: white; border-radius: 8px; z-index: 9999; font-weight: 600; text-decoration: none; }
  .skip-link:focus { top: 16px; }

  .fade-in { animation: fadeIn 0.3s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .slide-in { animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .fade-in, .slide-in { animation: none; }
    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--neutral-300); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--neutral-400); }
  /* Firefox scrollbar */
  * { scrollbar-width: thin; scrollbar-color: var(--neutral-300) transparent; }

  @media (max-width: 768px) {
    .desktop-sidebar { display: none !important; }
    .mobile-tabs { display: flex !important; }
    .main-content { margin-left: 0 !important; padding-top: 72px !important; }
  }
  @media (min-width: 769px) {
    .mobile-tabs { display: none !important; }
  }
`;

// ─── Helper Components ───────────────────────────────────────

function Btn({ children, variant = "primary", size = "md", icon: Icon, onClick, style, disabled, ...rest }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: "8px",
    fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: T.radius.md, border: "none", transition: "all 0.2s ease",
    fontFamily: T.font, opacity: disabled ? 0.5 : 1,
    fontSize: size === "sm" ? "13px" : size === "lg" ? "16px" : "14px",
    padding: size === "sm" ? "6px 12px" : size === "lg" ? "12px 24px" : "8px 16px",
  };
  const variants = {
    primary: { background: T.orange[500], color: T.white, boxShadow: T.shadow.sm },
    secondary: { background: T.neutral[100], color: T.navy[800], border: `1.5px solid ${T.neutral[200]}` },
    ghost: { background: "transparent", color: T.navy[600] },
    danger: { background: T.red[100], color: T.red[500] },
    navy: { background: T.navy[800], color: T.white },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled) e.target.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.target.style.transform = "translateY(0)"; }}
      {...rest}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

function Input({ label, icon: Icon, style, inputStyle, required, ...rest }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "4px", ...style }}>
      {label && (
        <span style={{ fontSize: "13px", fontWeight: 600, color: T.navy[600] }}>
          {label}{required && <span style={{ color: T.red[500], marginLeft: "4px" }} aria-hidden="true">*</span>}
        </span>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {Icon && <Icon size={16} style={{ position: "absolute", left: "12px", color: T.neutral[400] }} aria-hidden="true" />}
        <input
          style={{
            width: "100%", padding: Icon ? "10px 12px 10px 36px" : "10px 12px",
            border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.md,
            fontSize: "14px", color: T.navy[800], background: T.white,
            transition: "border-color 0.2s",
            ...inputStyle
          }}
          onFocus={e => e.target.style.borderColor = T.orange[500]}
          onBlur={e => e.target.style.borderColor = T.neutral[200]}
          aria-required={required}
          {...rest}
        />
      </div>
    </label>
  );
}

function TextArea({ label, style, required, ...rest }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "4px", ...style }}>
      {label && (
        <span style={{ fontSize: "13px", fontWeight: 600, color: T.navy[600] }}>
          {label}{required && <span style={{ color: T.red[500], marginLeft: "4px" }} aria-hidden="true">*</span>}
        </span>
      )}
      <textarea
        style={{
          width: "100%", padding: "10px 12px", minHeight: "100px", resize: "vertical",
          border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.md,
          fontSize: "14px", color: T.navy[800], background: T.white,
          transition: "border-color 0.2s", fontFamily: T.font, lineHeight: 1.6,
        }}
        onFocus={e => e.target.style.borderColor = T.orange[500]}
        onBlur={e => e.target.style.borderColor = T.neutral[200]}
        aria-required={required}
        {...rest}
      />
    </label>
  );
}

function Select({ label, options, style, required, ...rest }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "4px", ...style }}>
      {label && (
        <span style={{ fontSize: "13px", fontWeight: 600, color: T.navy[600] }}>
          {label}{required && <span style={{ color: T.red[500], marginLeft: "4px" }} aria-hidden="true">*</span>}
        </span>
      )}
      <select
        style={{
          width: "100%", padding: "10px 12px", appearance: "none",
          border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.md,
          fontSize: "14px", color: T.navy[800], background: `${T.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center`,
        }}
        aria-required={required}
        {...rest}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Card({ children, style, padding = "24px", ...rest }) {
  return (
    <div style={{
      background: T.white, borderRadius: T.radius.lg, padding,
      border: `1px solid ${T.neutral[200]}`, ...style
    }} {...rest}>
      {children}
    </div>
  );
}

function SectionTitle({ children, icon: Icon, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {Icon && <Icon size={20} style={{ color: T.orange[500] }} />}
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.navy[800] }}>{children}</h3>
      </div>
      {action}
    </div>
  );
}

function Badge({ children, color = "orange" }) {
  const colors = {
    orange: { bg: T.orange[100], text: T.orange[600] },
    green: { bg: T.green[100], text: T.green[500] },
    red: { bg: T.red[100], text: T.red[500] },
    navy: { bg: T.navy[700], text: T.white },
  };
  const c = colors[color];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: "100px", fontSize: "12px", fontWeight: 600,
      background: c.bg, color: c.text,
    }}>
      {children}
    </span>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      {Icon && <Icon size={48} strokeWidth={1.2} style={{ color: T.neutral[300], margin: "0 auto 16px" }} aria-hidden="true" />}
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.navy[700], marginBottom: "6px" }}>{title}</h3>
      <p style={{ fontSize: "14px", color: T.neutral[500], marginBottom: "20px", maxWidth: "320px", margin: "0 auto 20px" }}>{description}</p>
      {action}
    </div>
  );
}

// ─── Confirm Dialog ──────────────────────────────────────────
function ConfirmDialog({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, variant = "danger" }) {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        style={{
          background: T.white, borderRadius: T.radius.lg, padding: "24px",
          maxWidth: "400px", width: "90%", boxShadow: T.shadow.lg,
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" style={{ fontSize: "18px", fontWeight: 700, color: T.navy[800], marginBottom: "8px" }}>{title}</h2>
        <p style={{ fontSize: "14px", color: T.neutral[600], marginBottom: "24px", lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onCancel}>{cancelText}</Btn>
          <Btn ref={confirmButtonRef} variant={variant} onClick={onConfirm}>{confirmText}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Toast Notifications ─────────────────────────────────────
function Toast({ message, type = "success", isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const colors = {
    success: { bg: T.green[100], border: T.green[500], text: T.green[500] },
    error: { bg: T.red[100], border: T.red[500], text: T.red[500] },
    info: { bg: T.orange[100], border: T.orange[500], text: T.orange[600] },
  };
  const c = colors[type] || colors.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: "fixed", bottom: "24px", right: "24px",
        background: c.bg, border: `2px solid ${c.border}`,
        borderRadius: T.radius.md, padding: "12px 20px",
        boxShadow: T.shadow.lg, zIndex: 9999,
        display: "flex", alignItems: "center", gap: "12px",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "14px", fontWeight: 600, color: c.text }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: c.text }}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Error Boundary ──────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "48px", textAlign: "center" }}>
          <AlertTriangle size={48} style={{ color: T.red[500], margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: T.navy[800], marginBottom: "8px" }}>Something went wrong</h2>
          <p style={{ fontSize: "14px", color: T.neutral[600], marginBottom: "24px" }}>
            An unexpected error occurred. Please refresh the page to try again.
          </p>
          <Btn onClick={() => window.location.reload()}>Refresh Page</Btn>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Weather Colors (Design Tokens) ──────────────────────────
const weatherColors = {
  rain: "oklch(55% 0.12 240)",    // Blue
  snow: "oklch(70% 0.08 250)",    // Light slate
  cloud: "oklch(50% 0.01 250)",   // Gray
  wind: "oklch(50% 0.08 200)",    // Teal-gray
  sun: T.orange[500],
};

// ─── Weather Icons ───────────────────────────────────────────
const WeatherIcon = ({ weather }) => {
  const w = (weather || "").toLowerCase();
  if (w.includes("rain")) return <CloudRain size={18} style={{ color: weatherColors.rain }} aria-hidden="true" />;
  if (w.includes("snow")) return <CloudSnow size={18} style={{ color: weatherColors.snow }} aria-hidden="true" />;
  if (w.includes("cloud")) return <Cloud size={18} style={{ color: weatherColors.cloud }} aria-hidden="true" />;
  if (w.includes("wind")) return <Wind size={18} style={{ color: weatherColors.wind }} aria-hidden="true" />;
  return <Sun size={18} style={{ color: weatherColors.sun }} aria-hidden="true" />;
};

// ─── Date Helpers ────────────────────────────────────────────
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${DAYS[dt.getDay()]}, ${dt.getMonth()+1}/${dt.getDate()}/${String(dt.getFullYear()).slice(2)}`;
};
const fmtDateShort = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getMonth()+1}/${dt.getDate()}/${String(dt.getFullYear()).slice(2)}`;
};
const toISODate = (d) => {
  const dt = new Date(d);
  return dt.toISOString().split("T")[0];
};
const getWeekEnding = (d) => {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = (5 - day + 7) % 7;
  dt.setDate(dt.getDate() + diff);
  return toISODate(dt);
};

// ─── BIC Logo ───────────────────────────────────────────────
const BIC_LOGO = "/logo-blue.png";

// ─── Export Utilities ────────────────────────────────────────

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const exportDailyExcel = (report, project) => {
  const allEquip = [...project.equipmentOwned.map(e => ({ ...e, type: "Owned" })), ...project.equipmentRented.map(e => ({ ...e, type: "Rented" }))];
  const present = allEquip.filter(e => report.equipmentPresent.includes(e.id));
  const roles = ["Indirect Labor","Apprentices","Foreman","Operators","Laborers","Carpenters","Cement Masons"];
  const roleKeys = ["indirectLabor","apprentices","foreman","operators","laborers","carpenters","cementMasons"];
  const totalDay = roleKeys.reduce((s, k) => s + (report.workforce[k]?.day || 0), 0);
  const totalNight = roleKeys.reduce((s, k) => s + (report.workforce[k]?.night || 0), 0);

  let csv = "";
  const row = (...cells) => { csv += cells.map(c => `"${String(c || "").replace(/"/g, '""')}"`).join(",") + "\n"; };

  row("BIC Daily Job Report"); row("");
  row("Date", fmtDate(report.date), "", "JOB #", project.jobNumber);
  row("Day", report.day, "", "Title", "Daily Report");
  row("Weather", report.weather, "", "Job Name", project.jobName);
  row("Incidents", report.incidents);
  row("Shift", `${report.shift.hours} ${report.shift.type}`); row("");
  row("GENERAL NOTES");
  row(report.generalNotes); row("");
  row("DAILY WORKFORCE");
  row("Role", "Day", "Night");
  roleKeys.forEach((k, i) => row(roles[i], report.workforce[k]?.day || 0, report.workforce[k]?.night || 0));
  row("Total", totalDay, totalNight); row("");
  row("MAJOR EQUIPMENT");
  row("Description", "Type", "Vendor", "Status");
  present.forEach(e => row(e.description, e.type, e.vendor || "", report.equipmentDown.includes(e.id) ? "DOWN" : "OK"));
  row("");
  row("THIRD PARTY UTILITIES"); row(report.thirdPartyUtilities); row("");
  row("MATERIAL DELIVERIES"); row(report.materialDeliveries); row("");
  row("DELAYS / PROBLEMS"); row(report.delaysProblems); row("");
  row("EXTRA WORK / CLAIMS / MISC."); row(report.extraWork); row("");
  row("Report prepared by", report.preparedBy);

  downloadFile(csv, `Daily_Report_${report.date}.csv`, "text/csv");
};

// BIC Logo as inline SVG for PDF exports
const BIC_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" style="height:40px">
  <rect width="200" height="60" rx="4" fill="#1a2744"/>
  <text x="12" y="42" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#fff">BIC</text>
  <text x="90" y="38" font-family="Georgia, serif" font-size="16" font-style="italic" fill="#e8853a">the Original.</text>
  <text x="12" y="54" font-family="system-ui, sans-serif" font-size="8" fill="#8899b4">Blue Iron Corp. | Ca. License #65233</text>
</svg>`;

const exportDailyPDF = (report, project, includePhotos = false) => {
  const allEquip = [...project.equipmentOwned.map(e => ({ ...e, type: "Owned" })), ...project.equipmentRented.map(e => ({ ...e, type: "Rented" }))];
  const present = allEquip.filter(e => report.equipmentPresent.includes(e.id));
  const roles = ["Indirect Labor","Apprentices","Foreman","Operators","Laborers","Carpenters","Cement Masons"];
  const roleKeys = ["indirectLabor","apprentices","foreman","operators","laborers","carpenters","cementMasons"];
  const totalDay = roleKeys.reduce((s, k) => s + (report.workforce[k]?.day || 0), 0);
  const totalNight = roleKeys.reduce((s, k) => s + (report.workforce[k]?.night || 0), 0);

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Daily Report ${report.date}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:11px;color:#1a2744;padding:0;margin:0;background:#f8fafc}
  .page{max-width:900px;width:100%;margin:0 auto;padding:24px}
  .masthead{background:linear-gradient(135deg,#1a2744 0%,#0f172a 100%);padding:32px;margin:-24px -24px 24px;position:relative;overflow:hidden}
  .masthead::before{content:'';position:absolute;top:0;right:0;width:300px;height:100%;background:linear-gradient(135deg,#e8853a 0%,#f59e0b 100%);transform:skewX(-20deg) translateX(150px);opacity:0.15}
  .masthead-content{position:relative;display:flex;justify-content:space-between;align-items:flex-start}
  .masthead h1{font-size:24px;font-weight:800;color:#fff;margin:12px 0 4px;letter-spacing:-0.02em}
  .masthead .subtitle{font-size:13px;color:#8899b4}
  .masthead .report-type{display:inline-block;background:#e8853a;color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;padding:6px 14px;border-radius:4px;margin-top:12px}
  .masthead .date-box{text-align:right;background:rgba(255,255,255,0.1);padding:16px 20px;border-radius:8px;backdrop-filter:blur(4px)}
  .masthead .date{font-size:20px;font-weight:800;color:#fff}
  .masthead .meta{font-size:12px;color:#8899b4;margin-top:4px}
  .section{background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}
  .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#e8853a;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #1a2744;display:flex;align-items:center;gap:8px}
  .section-title::before{content:'';width:4px;height:16px;background:#e8853a;border-radius:2px}
  .notes{line-height:1.8;font-size:12px;color:#374151;white-space:pre-wrap}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:linear-gradient(135deg,#1a2744 0%,#0f172a 100%);color:#fff;padding:10px 14px;text-align:left;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.05em}
  th:first-child{border-radius:8px 0 0 0}
  th:last-child{border-radius:0 8px 0 0}
  td{padding:10px 14px;border-bottom:1px solid #e5e7eb}
  tr:nth-child(even){background:#f9fafb}
  tr:hover{background:#f3f4f6}
  .total-row td{font-weight:700;background:#1a2744;color:#fff;border:none}
  .total-row td:first-child{border-radius:0 0 0 8px}
  .total-row td:last-child{border-radius:0 0 8px 0}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .info-box{background:#fff;border:2px solid #e5e7eb;border-radius:12px;padding:16px 20px;transition:border-color 0.2s}
  .info-box.alert{border-color:#ef4444;background:#fef2f2}
  .info-box-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#e8853a;margin-bottom:8px}
  .info-box.alert .info-box-title{color:#dc2626}
  .info-box-content{font-size:12px;color:#374151;line-height:1.6}
  .down{color:#dc2626;font-weight:700;background:#fef2f2;padding:2px 8px;border-radius:4px}
  .ok{color:#059669;font-weight:600}
  .footer{text-align:center;font-size:11px;color:#6b7280;margin-top:24px;padding-top:16px;border-top:2px solid #e5e7eb}
  .footer strong{color:#1a2744}
  .photo-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px}
  .photo-card{border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
  .photo-card img{width:100%;height:200px;object-fit:cover;display:block}
  .photo-card-caption{padding:12px 16px;background:#fff;font-size:12px;color:#1a2744;font-weight:500}
  @media print{
    *,*::before,*::after{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
    html,body{background:#fff!important}
    .page{padding:16px!important;max-width:100%!important}
    /* Convert grids to stacked blocks for print compatibility */
    .grid{display:block!important}
    .grid>.section,.grid>.info-box{margin-bottom:12px!important;page-break-inside:avoid}
    .photo-grid{display:block!important}
    .photo-card{margin-bottom:16px!important;page-break-inside:avoid}
    /* Ensure backgrounds print with solid colors (gradients can fail) */
    .masthead{margin:0 0 20px;border-radius:8px;background:#1a2744!important;border:2px solid #1a2744}
    .masthead::before{display:none!important}
    .masthead-content{position:relative}
    .section{background:#fff!important;border:2px solid #e5e7eb!important;margin-bottom:12px!important}
    th{background:#1a2744!important;color:#fff!important}
    .total-row td{background:#1a2744!important;color:#fff!important}
    tr:nth-child(even){background:#f3f4f6!important}
    .info-box{background:#fff!important;border:2px solid #d1d5db!important}
    .info-box.alert{background:#fef2f2!important;border-color:#ef4444!important}
    .date-box{background:#2d3a4f!important;border:1px solid #4b5563}
    .down{background:#fef2f2!important}
    .photo-card{border:2px solid #e5e7eb!important}
    .section-title{page-break-after:avoid}
    table{page-break-inside:avoid}
  }
</style></head><body>
<div class="page">
<div class="masthead">
  <div class="masthead-content">
    <div>
      ${BIC_LOGO_SVG}
      <h1>${project.jobName}</h1>
      <div class="subtitle">JOB #${project.jobNumber} · ${project.client}</div>
      <div class="report-type">Daily Field Report</div>
    </div>
    <div class="date-box">
      <div style="font-size:10px;color:#8899b4;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Report Date</div>
      <div class="date">${fmtDateShort(report.date)}</div>
      <div class="meta" style="margin-top:8px">${report.day} · ${report.weather}</div>
      <div class="meta">Shift: ${report.shift.hours} ${report.shift.type}</div>
      <div class="meta">Incidents: ${report.incidents || "None"}</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">General Notes</div>
  <div class="notes">${report.generalNotes || "No notes recorded."}</div>
</div>

<div class="grid">
  <div class="section">
    <div class="section-title">Daily Workforce</div>
    <table>
      <tr><th scope="col">Role</th><th scope="col" style="text-align:center">Day</th><th scope="col" style="text-align:center">Night</th></tr>
      ${roleKeys.map((k, i) => `<tr><td>${roles[i]}</td><td style="text-align:center">${report.workforce[k]?.day || "—"}</td><td style="text-align:center">${report.workforce[k]?.night || "—"}</td></tr>`).join("")}
      <tr class="total-row"><td>Total</td><td style="text-align:center">${totalDay}</td><td style="text-align:center">${totalNight}</td></tr>
    </table>
  </div>
  <div class="section">
    <div class="section-title">Major Equipment</div>
    <table>
      <tr><th scope="col">Equipment</th><th scope="col">Type</th><th scope="col">Status</th></tr>
      ${present.map(e => `<tr><td>${e.description}${e.vendor ? ` <span style="color:#9ca3af;font-size:10px">(${e.vendor})</span>` : ""}</td><td>${e.type}</td><td>${report.equipmentDown.includes(e.id) ? '<span class="down">DOWN</span>' : '<span class="ok">OK</span>'}</td></tr>`).join("")}
      ${present.length === 0 ? "<tr><td colspan=3 style='color:#9ca3af;text-align:center;padding:20px'>No equipment logged</td></tr>" : ""}
    </table>
  </div>
</div>

<div class="grid">
  <div class="info-box"><div class="info-box-title">Third Party Utilities</div><div class="info-box-content">${report.thirdPartyUtilities || "None"}</div></div>
  <div class="info-box"><div class="info-box-title">Material Deliveries</div><div class="info-box-content">${report.materialDeliveries || "None"}</div></div>
  <div class="info-box${report.delaysProblems ? ' alert' : ''}"><div class="info-box-title">Delays / Problems</div><div class="info-box-content">${report.delaysProblems || "None"}</div></div>
  <div class="info-box"><div class="info-box-title">Extra Work / Claims / Misc.</div><div class="info-box-content">${report.extraWork || "None"}</div></div>
</div>

${includePhotos && (report.photos || []).length > 0 ? `
<div class="section">
  <div class="section-title">Progress Photos</div>
  <div class="photo-grid">
    ${report.photos.map(p => `<div class="photo-card">
      <img src="${p.url}" alt="${p.description}">
      <div class="photo-card-caption">${p.description}</div>
    </div>`).join("")}
  </div>
</div>` : ""}

<div class="footer">Report prepared by <strong>${report.preparedBy || "—"}</strong> · Generated ${new Date().toLocaleDateString()}</div>
</div>
<script>window.onload=()=>window.print()</script></body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `Daily_Report_${report.date}.html`;
    link.click();
  }
  URL.revokeObjectURL(url);
};

const exportWeeklyPDF = (weekly, project) => {
  const fmtD = (d) => { if (!d) return ""; const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}/${String(dt.getFullYear()).slice(2)}`; };

  // White logo for dark background
  const BIC_LOGO_WHITE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" style="height:36px">
    <text x="0" y="34" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#fff">BIC</text>
    <text x="70" y="30" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#e8853a">the Original.</text>
    <text x="0" y="46" font-family="system-ui, sans-serif" font-size="7" fill="#8899b4">Blue Iron Corp. | Ca. License #65233</text>
  </svg>`;

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Weekly Report ${weekly.weekEnding}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:linear-gradient(180deg,#0a0f1a 0%,#0d1527 100%);min-height:100vh}
  .page{max-width:1100px;width:100%;margin:0 auto;padding:32px}

  /* Header */
  .header,.header-inner{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.1)}
  .header-left{flex:1}
  .header-right{text-align:right;background:linear-gradient(135deg,rgba(232,133,58,0.2) 0%,rgba(232,133,58,0.05) 100%);padding:20px 24px;border-radius:12px;border:1px solid rgba(232,133,58,0.3)}
  .report-badge{display:inline-block;background:linear-gradient(135deg,#e8853a 0%,#f59e0b 100%);color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;padding:8px 16px;border-radius:6px;margin-top:16px}
  .week-ending{font-size:11px;color:#8899b4;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px}
  .week-date{font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.02em}

  /* Project Title */
  .project-title{text-align:center;margin-bottom:28px}
  .project-title h1{font-size:28px;font-weight:800;color:#fff;margin-bottom:8px;letter-spacing:-0.02em}
  .project-title .subtitle{font-size:14px;color:#8899b4}

  /* Panels */
  .panel{background:linear-gradient(135deg,rgba(22,32,64,0.8) 0%,rgba(15,23,42,0.9) 100%);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px 24px;color:#fff;font-size:12px;backdrop-filter:blur(4px)}
  .panel-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid rgba(255,255,255,0.1);display:flex;align-items:center;gap:10px}
  .panel-title.orange{color:#e8853a}
  .panel-title.orange::before{content:'';width:4px;height:14px;background:#e8853a;border-radius:2px}
  .panel-title.white{color:#fff}
  .panel-title.white::before{content:'';width:4px;height:14px;background:#fff;border-radius:2px;opacity:0.5}
  .panel ul{list-style:none;padding:0}
  .panel li{padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:flex-start;gap:10px}
  .panel li:last-child{border-bottom:none}
  .panel li::before{content:'→';color:#e8853a;font-weight:bold;flex-shrink:0}
  .panel li span{color:#fff}
  .panel li span.complete{color:#4ade80}
  .panel .content{color:#c9d1e0;line-height:1.7}
  .panel .content:empty::before{content:'—';color:#4b5563}

  .green{color:#4ade80} .red{color:#ef4444} .orange{color:#e8853a}

  /* Grid Layouts */
  .main-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:20px;margin-bottom:20px}
  .side-stack{display:flex;flex-direction:column;gap:16px}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}

  /* Milestone Table */
  .milestone-section{margin-top:20px}
  .milestone-table{width:100%;border-collapse:separate;border-spacing:0;font-size:11px;margin-top:12px;border-radius:8px;overflow:hidden}
  .milestone-table th{background:linear-gradient(135deg,#1a2744 0%,#0f172a 100%);color:#fff;padding:12px 16px;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:10px}
  .milestone-table td{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#c9d1e0}
  .milestone-table tr:last-child td{border-bottom:none}
  .milestone-table .complete{color:#4ade80;font-weight:600}
  .milestone-table .pending{color:#e8853a}
  .milestone-legend{font-size:10px;color:#6b7280;margin-top:8px;font-style:italic}

  /* Info Row */
  .info-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}
  .info-box{background:rgba(22,32,64,0.5);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px 20px}
  .info-box-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8899b4;margin-bottom:8px}
  .info-box-content{font-size:12px;color:#fff;line-height:1.6}
  .info-box-content:empty::before{content:'—';color:#4b5563}
  .info-box.highlight{border-color:rgba(232,133,58,0.3);background:rgba(232,133,58,0.08)}
  .info-box.highlight .info-box-title{color:#e8853a}

  /* Footer */
  .footer{text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1)}
  .footer-text{font-size:11px;color:#6b7280}

  /* Photo Page */
  .photo-page{background:#fff;min-height:100vh}
  .photo-page .page{padding:40px}
  .photo-header{display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-bottom:16px;border-bottom:3px solid #e8853a}
  .photo-header h2{font-size:22px;font-weight:800;color:#1a2744}
  .photo-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .photo-card{border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);border:1px solid #e5e7eb}
  .photo-card img{width:100%;height:220px;object-fit:cover;display:block}
  .photo-card-info{padding:16px 20px;background:#fff}
  .photo-card-desc{font-size:14px;color:#1a2744;font-weight:600;margin-bottom:4px}
  .photo-card-date{font-size:12px;color:#6b7280}

  /* Repeating header table structure */
  .report-wrapper{display:table;width:100%}
  .repeating-header{display:table-header-group}
  .repeating-header .header-inner{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.1)}
  .report-body{display:table-row-group}

  .page-break{page-break-before:always}
  @media print{
    /* Force browsers to print background colors and images exactly as on screen */
    *,*::before,*::after{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}

    /* Strip ONLY the properties that break printing — keep everything else */
    *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}

    /* Body — keep the dark gradient background */
    html,body{margin:0!important;padding:0!important}
    body{background:#0a0f1a!important}

    /* Page container */
    .page{padding:24px!important;max-width:1100px;margin:0 auto}

    /* Header — keep dark, preserve flex */
    .header,.header-inner{display:flex!important;justify-content:space-between!important;align-items:flex-start!important;padding:20px!important;margin-bottom:24px!important;border-bottom:1px solid rgba(255,255,255,0.1)}
    .header-left{flex:1!important}
    .header-right{text-align:right;background:#1a2744!important;padding:16px 20px!important;border-radius:10px;border:1px solid rgba(232,133,58,0.3)}
    .week-ending{font-size:10px;color:#8899b4;text-transform:uppercase;letter-spacing:0.1em}
    .week-date{font-size:24px;font-weight:800;color:#fff}
    .report-badge{display:inline-block!important;background:#e8853a!important;color:#fff!important;padding:6px 14px!important;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-top:12px}

    /* Project title */
    .project-title{text-align:center;margin:24px 0}
    .project-title h1{font-size:26px;font-weight:800;color:#fff!important;margin-bottom:6px}
    .project-title .subtitle{color:#8899b4!important;font-size:14px}

    /* Preserve grid and flex layouts exactly */
    .main-grid{display:grid!important;grid-template-columns:1.5fr 1fr!important;gap:20px!important;margin-bottom:20px}
    .side-stack{display:flex!important;flex-direction:column!important;gap:16px!important}
    .two-col{display:grid!important;grid-template-columns:1fr 1fr!important;gap:16px!important}

    /* Panels — dark background, same as screen */
    .panel{background:#111827!important;border:1px solid rgba(255,255,255,0.1)!important;border-radius:12px;padding:20px 24px!important;color:#fff!important;font-size:12px;page-break-inside:avoid;margin-bottom:12px}
    .panel-title{color:#e8853a!important;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid rgba(255,255,255,0.1)!important;display:flex!important;align-items:center!important;gap:10px!important}
    .panel-title.orange{color:#e8853a!important}
    .panel-title.white{color:#fff!important}
    .panel-title::before{content:''!important;display:inline-block!important;width:4px!important;height:14px!important;background:#e8853a!important;border-radius:2px!important;flex-shrink:0}
    .panel ul{display:block!important;list-style:none;padding:0}
    .panel li{display:flex!important;align-items:flex-start!important;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#fff!important}
    .panel li:last-child{border-bottom:none}
    .panel li::before{content:'→'!important;color:#e8853a!important;font-weight:bold;flex-shrink:0}
    .panel li span{color:#fff!important}
    .panel li span.complete{color:#4ade80!important}
    .panel .content{color:#c9d1e0!important;line-height:1.7}
    .panel .content:empty::before{content:'—';color:#4b5563}

    /* Info row — preserve 3-column grid */
    .info-row{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:16px!important;margin-top:20px}
    .info-box{background:rgba(17,24,39,0.8)!important;border:1px solid rgba(255,255,255,0.08)!important;border-radius:10px;padding:16px 20px!important;color:#fff!important}
    .info-box-title{color:#8899b4!important;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px}
    .info-box-content{color:#fff!important;font-size:12px;line-height:1.6}
    .info-box-content:empty::before{content:'—';color:#4b5563}
    .info-box.highlight{border-color:rgba(232,133,58,0.3)!important;background:rgba(232,133,58,0.08)!important}
    .info-box.highlight .info-box-title{color:#e8853a!important}

    /* Milestone table — dark header */
    table{display:table!important;width:100%;border-collapse:separate;border-spacing:0}
    tr{display:table-row!important}
    th,td{display:table-cell!important}
    .milestone-table{width:100%;font-size:11px;margin-top:12px;border-radius:8px;overflow:hidden}
    .milestone-table th{background:#1a2744!important;color:#fff!important;padding:12px 16px;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:10px}
    .milestone-table td{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);color:#c9d1e0!important}
    .milestone-table tr:last-child td{border-bottom:none}
    .milestone-table .complete{color:#4ade80!important;font-weight:600}
    .milestone-table .pending{color:#e8853a!important}
    .milestone-legend{color:#6b7280!important;font-size:10px;font-style:italic;margin-top:8px}

    /* Green/red accent colors */
    .green{color:#4ade80!important}
    .red{color:#ef4444!important}
    .orange{color:#e8853a!important}

    /* Photo page — keep white background for photos */
    .photo-page{background:#fff!important}
    .photo-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:24px!important}
    .photo-card{border:1px solid #e5e7eb!important;border-radius:12px;overflow:hidden;page-break-inside:avoid}
    .photo-card img{display:block!important;max-width:100%!important;height:auto!important;width:100%!important}
    .photo-card-info{padding:16px 20px;background:#fff!important;color:#1a2744!important}
    .photo-card-desc{font-size:14px;color:#1a2744!important;font-weight:600;margin-bottom:4px}
    .photo-card-date{font-size:12px;color:#6b7280!important}

    /* Footer */
    .footer{text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);color:#6b7280!important;font-size:11px}

    /* Repeating header on every printed page */
    .report-wrapper{display:table!important;width:100%!important}
    .repeating-header{display:table-header-group!important}
    .repeating-header .header-inner{display:flex!important;justify-content:space-between!important;align-items:flex-start!important;padding:20px 0!important;margin-bottom:20px!important;border-bottom:1px solid rgba(255,255,255,0.1)!important}
    .report-body{display:table-row-group!important}

    /* Page break helper */
    .page-break{page-break-before:always}
  }
</style></head><body>
<div class="page">
  <div class="report-wrapper">
    <div class="repeating-header">
      <div class="header-inner">
        <div class="header-left">
          ${BIC_LOGO_WHITE}
          <div class="report-badge">Weekly Progress Report</div>
        </div>
        <div class="header-right">
          <div class="week-ending">Week Ending</div>
          <div class="week-date">${fmtD(weekly.weekEnding)}</div>
        </div>
      </div>
    </div>
    <div class="report-body">

  <div class="project-title">
    <h1>${project.jobName}</h1>
    <div class="subtitle">JOB #${project.jobNumber} · ${project.client}</div>
  </div>

  <div class="main-grid">
    <div>
      <div class="panel">
        <div class="panel-title orange">On-going / Completed Work</div>
        <ul>${(weekly.ongoingCompleted||[]).filter(Boolean).map(i => `<li><span${i.includes('[COMPLETED]') ? ' class="complete"' : ''}>${i}</span></li>`).join("") || '<li><span>No items</span></li>'}</ul>
      </div>
      <div class="panel" style="margin-top:16px">
        <div class="panel-title white">Look Ahead Schedule</div>
        <ul>${(weekly.lookAhead||[]).filter(Boolean).map(i => `<li><span>${i}</span></li>`).join("") || '<li><span>No items scheduled</span></li>'}</ul>
      </div>
    </div>
    <div class="side-stack">
      <div class="panel">
        <div class="panel-title white">Outstanding RFI's</div>
        <div class="content">${weekly.outstandingRFIs || ""}</div>
      </div>
      <div class="panel">
        <div class="panel-title white">Hot Submittals</div>
        <div class="content">${weekly.hotSubmittals || ""}</div>
      </div>
      <div class="panel">
        <div class="panel-title white">Safety</div>
        <div class="content">${weekly.safety || "No incidents reported"}</div>
      </div>
    </div>
  </div>

  <div class="main-grid">
    <div class="panel milestone-section">
      <div class="panel-title white">Milestone Tracking</div>
      <table class="milestone-table">
        <tr><th scope="col">Description</th><th scope="col">Milestone</th><th scope="col">Target</th><th scope="col">Actual</th></tr>
        ${project.milestones.map(m => `<tr><td class="${m.actualDate ? "complete" : "pending"}">${m.description}</td><td>${fmtD(m.milestoneDate)}</td><td>${fmtD(m.targetDate)}</td><td class="${m.actualDate ? "complete" : ""}">${fmtD(m.actualDate) || "—"}</td></tr>`).join("") || '<tr><td colspan="4" style="text-align:center;color:#6b7280">No milestones defined</td></tr>'}
      </table>
      <div class="milestone-legend">Milestone = Owner Contract Schedule | Target = Sub OPS Schedule | Actual = Work Completed</div>
    </div>
    <div class="side-stack">
      <div class="panel">
        <div class="panel-title white">Important Dates</div>
        <div class="content">${weekly.importantDates || ""}</div>
      </div>
      <div class="panel">
        <div class="panel-title white">Owner Delivery Dates</div>
        <div class="content">${weekly.ownerDeliveryDates || ""}</div>
      </div>
      <div class="panel">
        <div class="panel-title white">Outstanding Items – Owner</div>
        <div class="content">${weekly.outstandingOwnerItems || ""}</div>
      </div>
    </div>
  </div>

  <div class="info-row">
    <div class="info-box">
      <div class="info-box-title">Upcoming Inspections</div>
      <div class="info-box-content">${weekly.upcomingInspections || ""}</div>
    </div>
    <div class="info-box${weekly.hindrances ? ' highlight' : ''}">
      <div class="info-box-title">Hindrances</div>
      <div class="info-box-content">${weekly.hindrances || ""}${weekly.additionalDelays ? `<div style="margin-top:8px;color:#ef4444;font-weight:600">${weekly.additionalDelays}</div>` : ""}</div>
    </div>
    <div class="info-box highlight">
      <div class="info-box-title">Next OAC Meeting</div>
      <div class="info-box-content" style="font-size:16px;font-weight:700">${fmtD(weekly.nextOACMeeting) || "TBD"}</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-text">Generated ${new Date().toLocaleDateString()} · Blue Iron Corporation</div>
  </div>

    </div><!-- end report-body -->
  </div><!-- end report-wrapper -->
</div>

${(weekly.selectedPhotos || []).filter(p => p.selected !== false).length > 0 ? `
<div class="photo-page page-break">
  <div class="page">
    <div class="photo-header">
      <div style="width:4px;height:28px;background:#e8853a;border-radius:2px"></div>
      <h2>Progress Photos</h2>
    </div>
    <div class="photo-grid">
      ${(weekly.selectedPhotos||[]).filter(p => p.selected !== false).map(p => `
        <div class="photo-card">
          <img src="${p.url}" alt="${p.description}">
          <div class="photo-card-info">
            <div class="photo-card-desc">${p.description}</div>
            <div class="photo-card-date">${p.date || ""}</div>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
</div>` : ""}

<script>window.onload=()=>window.print()</script></body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `Weekly_Report_${weekly.weekEnding}.html`;
    link.click();
  }
  URL.revokeObjectURL(url);
};

const aggregateWeeklyData = (weekReports, project) => {
  const completed = [];
  const ongoing = [];
  const delays = [];
  const allMilestoneHits = weekReports.filter(r => r.milestoneHit).map(r => {
    const m = project.milestones.find(ms => ms.id === r.milestoneHit.id);
    return m ? m.description : null;
  }).filter(Boolean);

  allMilestoneHits.forEach(desc => completed.push(desc));

  weekReports.forEach(r => {
    if (!r.generalNotes) return;
    const firstSentence = r.generalNotes.split(/\.\s+/)[0];
    const summary = firstSentence.length > 120 ? firstSentence.substring(0, 117) + "..." : firstSentence;
    if (summary.length > 10) ongoing.push(summary);
    if (r.delaysProblems) delays.push(r.delaysProblems);
  });

  const uniqueOngoing = [...new Set(ongoing)];
  const uniqueDelays = [...new Set(delays)];

  const allIncidents = weekReports.map(r => r.incidents).filter(i => i && i !== "N/A");
  const safety = allIncidents.length ? allIncidents.join("; ") : "No incidents";

  const allPhotos = weekReports.flatMap(r =>
    (r.photos || []).map(p => ({ ...p, date: r.date, reportId: r.id, selected: true }))
  );

  return {
    ongoingCompleted: [...completed.map(c => `[COMPLETED] ${c}`), ...uniqueOngoing].length > 0
      ? [...completed.map(c => `[COMPLETED] ${c}`), ...uniqueOngoing] : [""],
    safety,
    delays: uniqueDelays.join("; "),
    allPhotos,
  };
};

const getActiveProject = (state) => state.projects.find(p => p.id === state.activeProjectId) || null;

const newProjectTemplate = () => ({
  id: `proj-${Date.now()}`,
  jobNumber: "",
  jobName: "",
  client: "",
  preparedBy: "",
  milestones: [],
  equipmentOwned: [],
  equipmentRented: [],
});

// ─── State Reducer ───────────────────────────────────────────
const initialState = {
  projects: [],
  activeProjectId: null,
  dailyReports: [],
  weeklyReports: [],
  currentView: "projects",
  editingDaily: null,
  viewingDaily: null,
  editingWeekly: null,
  viewingWeekly: null,
  loading: true,
};

function reducer(state, action) {
  const project = getActiveProject(state);

  const updateActiveProject = (data) => ({
    ...state,
    projects: state.projects.map(p => p.id === state.activeProjectId ? { ...p, ...data } : p),
  });

  switch (action.type) {
    case "LOAD_DATA": return {
      ...state,
      projects: action.projects,
      dailyReports: action.dailyReports,
      weeklyReports: action.weeklyReports,
      activeProjectId: action.projects.length > 0 ? action.projects[0].id : null,
      currentView: action.projects.length > 0 ? "dashboard" : "projects",
      loading: false,
    };
    case "SET_LOADING": return { ...state, loading: action.loading };
    case "SET_VIEW": return { ...state, currentView: action.view, viewingDaily: null };
    case "ADD_PROJECT": {
      const np = newProjectTemplate();
      return { ...state, projects: [...state.projects, np], activeProjectId: np.id, currentView: "projectSetup" };
    }
    case "SELECT_PROJECT": return { ...state, activeProjectId: action.id, currentView: "dashboard", editingDaily: null, viewingDaily: null, editingWeekly: null };
    case "DELETE_PROJECT": {
      const remaining = state.projects.filter(p => p.id !== action.id);
      const newActive = remaining.length ? remaining[0].id : null;
      return {
        ...state,
        projects: remaining,
        activeProjectId: state.activeProjectId === action.id ? newActive : state.activeProjectId,
        dailyReports: state.dailyReports.filter(r => r.projectId !== action.id),
        weeklyReports: state.weeklyReports.filter(r => r.projectId !== action.id),
        currentView: remaining.length ? "dashboard" : "projects",
      };
    }
    case "SET_PROJECT": return updateActiveProject(action.data);
    case "ADD_MILESTONE": return updateActiveProject({ milestones: [...project.milestones, { id: `m${Date.now()}`, description: "", milestoneDate: "", targetDate: "", actualDate: "" }] });
    case "UPDATE_MILESTONE": return updateActiveProject({ milestones: project.milestones.map(m => m.id === action.id ? { ...m, ...action.data } : m) });
    case "REMOVE_MILESTONE": return updateActiveProject({ milestones: project.milestones.filter(m => m.id !== action.id) });
    case "ADD_EQUIPMENT_OWNED": return updateActiveProject({ equipmentOwned: [...project.equipmentOwned, { id: `e${Date.now()}`, description: "" }] });
    case "ADD_EQUIPMENT_RENTED": return updateActiveProject({ equipmentRented: [...project.equipmentRented, { id: `r${Date.now()}`, description: "", vendor: "" }] });
    case "UPDATE_EQUIPMENT_OWNED": return updateActiveProject({ equipmentOwned: project.equipmentOwned.map(e => e.id === action.id ? { ...e, ...action.data } : e) });
    case "UPDATE_EQUIPMENT_RENTED": return updateActiveProject({ equipmentRented: project.equipmentRented.map(e => e.id === action.id ? { ...e, ...action.data } : e) });
    case "REMOVE_EQUIPMENT": return updateActiveProject({ equipmentOwned: project.equipmentOwned.filter(e => e.id !== action.id), equipmentRented: project.equipmentRented.filter(e => e.id !== action.id) });
    case "NEW_DAILY": {
      if (!project) return state;
      const today = new Date();
      const newReport = {
        id: `dr-${Date.now()}`, projectId: project.id, date: toISODate(today), day: DAYS[today.getDay()],
        weather: "Sunny / Clear", incidents: "N/A", shift: { type: "Day", hours: "8hr" },
        generalNotes: "", workforce: { foreman: { day: 0, night: 0 }, operators: { day: 0, night: 0 }, laborers: { day: 0, night: 0 }, apprentices: { day: 0, night: 0 }, carpenters: { day: 0, night: 0 }, cementMasons: { day: 0, night: 0 }, indirectLabor: { day: 0, night: 0 } },
        equipmentPresent: [...project.equipmentOwned.map(e => e.id), ...project.equipmentRented.map(e => e.id)],
        equipmentDown: [], thirdPartyUtilities: "", materialDeliveries: "",
        delaysProblems: "", extraWork: "", milestoneHit: null, photos: [], preparedBy: project.preparedBy || "",
      };
      return { ...state, editingDaily: newReport, currentView: "dailyEntry" };
    }
    case "EDIT_DAILY": return { ...state, editingDaily: { ...action.report }, currentView: "dailyEntry" };
    case "VIEW_DAILY": return { ...state, viewingDaily: action.report, currentView: "dailyView" };
    case "VIEW_WEEKLY": return { ...state, viewingWeekly: action.report, currentView: "weeklyView" };
    case "UPDATE_EDITING_DAILY": return { ...state, editingDaily: { ...state.editingDaily, ...action.data } };
    case "SAVE_DAILY": {
      const saving = state.editingDaily;
      const exists = state.dailyReports.find(r => r.id === saving.id);
      const reports = exists
        ? state.dailyReports.map(r => r.id === saving.id ? saving : r)
        : [...state.dailyReports, saving];
      let updatedProjects = state.projects;
      if (saving.milestoneHit && saving.milestoneHit.id) {
        updatedProjects = state.projects.map(p => {
          if (p.id !== saving.projectId) return p;
          return { ...p, milestones: p.milestones.map(m =>
            m.id === saving.milestoneHit.id ? { ...m, actualDate: saving.milestoneHit.date || saving.date } : m
          )};
        });
      }
      return { ...state, projects: updatedProjects, dailyReports: reports.sort((a,b) => a.date.localeCompare(b.date)), currentView: "dashboard", editingDaily: null };
    }
    case "DELETE_DAILY": return { ...state, dailyReports: state.dailyReports.filter(r => r.id !== action.id) };
    case "SET_EDITING_WEEKLY": return { ...state, editingWeekly: action.data, currentView: "weeklyGen" };
    case "SAVE_WEEKLY": {
      const exists = state.weeklyReports.find(r => r.id === state.editingWeekly.id);
      const reports = exists
        ? state.weeklyReports.map(r => r.id === state.editingWeekly.id ? state.editingWeekly : r)
        : [...state.weeklyReports, state.editingWeekly];
      return { ...state, weeklyReports: reports, currentView: "dashboard", editingWeekly: null };
    }
    case "UPDATE_EDITING_WEEKLY": return { ...state, editingWeekly: { ...state.editingWeekly, ...action.data } };
    default: return state;
  }
}

// ─── Sidebar Navigation ───────────────────────────────────────
function Sidebar({ currentView, dispatch, projects, activeProjectId }) {
  const [projDropOpen, setProjDropOpen] = useState(false);
  const activeProject = projects.find(p => p.id === activeProjectId);

  const navItems = [
    { id: "projects", icon: Building2, label: "Projects" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "projectSetup", icon: FolderCog, label: "Project Setup" },
    { id: "dailyEntry", icon: ClipboardEdit, label: "Daily Entry" },
    { id: "weeklyGen", icon: CalendarRange, label: "Weekly Report" },
    { id: "photos", icon: Image, label: "Photo Gallery" },
  ];
  return (
    <nav className="desktop-sidebar" style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: "220px",
      background: T.navy[900], display: "flex", flexDirection: "column",
      padding: "24px 0", zIndex: 100,
    }}>
      <div style={{ borderBottom: `1px solid ${T.neutral[200]}`, background: T.neutral[50], margin: "-24px 0 0 0", padding: "16px 20px 16px", borderRadius: `${T.radius.lg} 0 0 0` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <img src={BIC_LOGO} alt="BIC the Original" style={{ height: "36px", borderRadius: T.radius.sm, flexShrink: 0 }} />
          <div style={{ fontSize: "10px", fontWeight: 700, color: T.navy[700], textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>Field Reporter</div>
        </div>
      </div>

      {activeProject && (
        <div style={{ padding: "12px 8px 0", position: "relative" }}>
          <button onClick={() => setProjDropOpen(!projDropOpen)} style={{
            width: "100%", padding: "8px 10px", borderRadius: T.radius.md,
            background: T.navy[800], border: `1px solid ${T.navy[700]}`,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
            color: T.white, textAlign: "left", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.orange[500]; }}
            onMouseLeave={e => { if (!projDropOpen) e.currentTarget.style.borderColor = T.navy[700]; }}
          >
            <div style={{
              width: "24px", height: "24px", borderRadius: "6px", flexShrink: 0,
              background: T.orange[600], display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 800, color: T.white,
            }}>
              {(activeProject.jobNumber || "?").slice(0, 3)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: T.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeProject.jobName || "Untitled Project"}
              </div>
              <div style={{ fontSize: "10px", color: T.navy[400] }}>Job #{activeProject.jobNumber || "—"}</div>
            </div>
            <ChevronDown size={14} style={{ color: T.navy[400], flexShrink: 0, transform: projDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {projDropOpen && (
            <div style={{
              position: "absolute", top: "100%", left: "8px", right: "8px", marginTop: "4px",
              background: T.navy[800], border: `1px solid ${T.navy[600]}`, borderRadius: T.radius.md,
              zIndex: 200, overflow: "hidden", boxShadow: T.shadow.lg,
            }}>
              {projects.map(p => (
                <button key={p.id} onClick={() => { dispatch({ type: "SELECT_PROJECT", id: p.id }); setProjDropOpen(false); }}
                  style={{
                    width: "100%", padding: "8px 12px", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "8px", textAlign: "left",
                    background: p.id === activeProjectId ? T.navy[700] : "transparent",
                    color: T.white, transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.navy[700]; }}
                  onMouseLeave={e => { if (p.id !== activeProjectId) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "4px", flexShrink: 0,
                    background: p.id === activeProjectId ? T.orange[500] : T.navy[600],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "9px", fontWeight: 800, color: T.white,
                  }}>{(p.jobNumber || "?").slice(0, 3)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.jobName || "Untitled Project"}
                    </div>
                  </div>
                  {p.id === activeProjectId && <Check size={14} style={{ color: T.orange[500], flexShrink: 0 }} />}
                </button>
              ))}
              <button onClick={() => { dispatch({ type: "ADD_PROJECT" }); setProjDropOpen(false); }}
                style={{
                  width: "100%", padding: "8px 12px", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "transparent", color: T.orange[400], borderTop: `1px solid ${T.navy[700]}`,
                  fontSize: "12px", fontWeight: 600,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = T.navy[700]; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <Plus size={14} /> New Project
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "12px 8px", flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map(item => {
          const active = currentView === item.id || (item.id === "dailyEntry" && currentView === "dailyView");
          const needsProject = !["projects"].includes(item.id);
          const disabled = needsProject && !activeProject;
          return (
            <button key={item.id}
              onClick={() => { if (!disabled) dispatch({ type: "SET_VIEW", view: item.id }); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px", width: "100%",
                padding: "10px 12px", borderRadius: T.radius.md, border: "none",
                cursor: disabled ? "default" : "pointer", transition: "all 0.15s ease",
                background: active ? T.navy[700] : "transparent",
                color: active ? T.white : disabled ? T.navy[600] : T.navy[400],
                opacity: disabled ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.background = T.navy[800]; }}
              onMouseLeave={e => { if (!active && !disabled) e.currentTarget.style.background = "transparent"; }}
            >
              <item.icon size={18} />
              <span style={{ fontSize: "14px", fontWeight: active ? 600 : 500 }}>{item.label}</span>
              {active && <div style={{ width: "3px", height: "18px", background: T.orange[500], borderRadius: "2px", marginLeft: "auto" }} />}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.navy[700]}` }}>
        <div style={{ fontSize: "11px", color: T.navy[500] }}>v1.0 Prototype</div>
      </div>
    </nav>
  );
}

function MobileNav({ currentView, dispatch, projects, activeProjectId }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projDropOpen, setProjDropOpen] = useState(false);
  const activeProject = projects.find(p => p.id === activeProjectId);

  const navItems = [
    { id: "projects", icon: Building2, label: "Projects" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "projectSetup", icon: FolderCog, label: "Project Setup" },
    { id: "dailyEntry", icon: ClipboardEdit, label: "Daily Entry" },
    { id: "weeklyGen", icon: CalendarRange, label: "Weekly Report" },
    { id: "photos", icon: Image, label: "Photo Gallery" },
  ];

  const navigate = (view) => {
    dispatch({ type: "SET_VIEW", view });
    setDrawerOpen(false);
    setProjDropOpen(false);
  };

  return (
    <>
      {/* Top bar with hamburger */}
      <div className="mobile-tabs" style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "56px",
        background: T.navy[900], display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 16px", zIndex: 200,
      }}>
        <button onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          style={{
            width: "40px", height: "40px", border: "none", background: "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: T.white, borderRadius: T.radius.sm,
          }}>
          {drawerOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={BIC_LOGO} alt="BIC" style={{ height: "28px", borderRadius: "4px" }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: T.neutral[200], textTransform: "uppercase", letterSpacing: "0.08em" }}>Field Reporter</span>
        </div>
        <div style={{ width: "40px" }} />
      </div>

      {/* Overlay */}
      {drawerOpen && (
        <div onClick={() => { setDrawerOpen(false); setProjDropOpen(false); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 250, transition: "opacity 0.2s",
          }} />
      )}

      {/* Slide-out drawer */}
      <nav className="mobile-tabs" style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: "280px",
        background: T.navy[900], zIndex: 300, display: "flex", flexDirection: "column",
        transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        overflowY: "auto",
      }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Drawer header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.navy[700]}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src={BIC_LOGO} alt="BIC" style={{ height: "32px", borderRadius: "4px" }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: T.neutral[200], textTransform: "uppercase", letterSpacing: "0.08em" }}>Field Reporter</span>
          </div>
          <button onClick={() => { setDrawerOpen(false); setProjDropOpen(false); }}
            style={{ width: "32px", height: "32px", border: "none", background: "transparent", cursor: "pointer", color: T.neutral[400], display: "flex", alignItems: "center", justifyContent: "center", borderRadius: T.radius.sm }}>
            <X size={20} />
          </button>
        </div>

        {/* Project switcher */}
        {activeProject && (
          <div style={{ padding: "12px 12px 0" }}>
            <button onClick={() => setProjDropOpen(!projDropOpen)} style={{
              width: "100%", padding: "10px 12px", borderRadius: T.radius.md,
              background: T.navy[800], border: `1px solid ${T.navy[700]}`,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
              color: T.white, textAlign: "left",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "6px", flexShrink: 0,
                background: T.orange[600], display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 800, color: T.white,
              }}>{(activeProject.jobNumber || "?").slice(0, 3)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: T.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {activeProject.jobName || "Untitled Project"}
                </div>
                <div style={{ fontSize: "11px", color: T.navy[400] }}>Job #{activeProject.jobNumber || "—"}</div>
              </div>
              <ChevronDown size={16} style={{ color: T.navy[400], flexShrink: 0, transform: projDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {projDropOpen && (
              <div style={{
                marginTop: "4px", background: T.navy[800], border: `1px solid ${T.navy[600]}`,
                borderRadius: T.radius.md, overflow: "hidden",
              }}>
                {projects.map(p => (
                  <button key={p.id} onClick={() => {
                    dispatch({ type: "SELECT_PROJECT", id: p.id });
                    setProjDropOpen(false);
                  }}
                    style={{
                      width: "100%", padding: "10px 14px", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "10px", textAlign: "left",
                      background: p.id === activeProjectId ? T.navy[700] : "transparent",
                      color: T.white,
                    }}>
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "4px", flexShrink: 0,
                      background: p.id === activeProjectId ? T.orange[500] : T.navy[600],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "9px", fontWeight: 800, color: T.white,
                    }}>{(p.jobNumber || "?").slice(0, 3)}</div>
                    <div style={{ flex: 1, fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.jobName || "Untitled Project"}
                    </div>
                    {p.id === activeProjectId && <Check size={14} style={{ color: T.orange[500] }} />}
                  </button>
                ))}
                <button onClick={() => { dispatch({ type: "ADD_PROJECT" }); setProjDropOpen(false); setDrawerOpen(false); }}
                  style={{
                    width: "100%", padding: "10px 14px", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "10px",
                    background: "transparent", color: T.orange[400], borderTop: `1px solid ${T.navy[700]}`,
                    fontSize: "13px", fontWeight: 600,
                  }}>
                  <Plus size={14} /> New Project
                </button>
              </div>
            )}
          </div>
        )}

        {/* Nav items */}
        <div style={{ padding: "12px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map(item => {
            const active = currentView === item.id || (item.id === "dailyEntry" && currentView === "dailyView");
            const needsProject = !["projects"].includes(item.id);
            const disabled = needsProject && !activeProject;
            return (
              <button key={item.id}
                onClick={() => { if (!disabled) navigate(item.id); }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", width: "100%",
                  padding: "12px 14px", borderRadius: T.radius.md, border: "none",
                  cursor: disabled ? "default" : "pointer",
                  background: active ? T.navy[700] : "transparent",
                  color: active ? T.white : disabled ? T.navy[600] : T.navy[400],
                  opacity: disabled ? 0.5 : 1, fontSize: "14px", fontWeight: active ? 600 : 500,
                }}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {active && <div style={{ width: "3px", height: "18px", background: T.orange[500], borderRadius: "2px", marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.navy[700]}` }}>
          <div style={{ fontSize: "11px", color: T.navy[500] }}>v1.0 Prototype</div>
        </div>
      </nav>
    </>
  );
}

// ─── Projects List Component ─────────────────────────────────
function ProjectsList({ state, dispatch }) {
  const { projects, activeProjectId, dailyReports } = state;
  return (
    <div className="fade-in" style={{ maxWidth: "860px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: T.navy[800], letterSpacing: "-0.02em" }}>Projects</h2>
          <p style={{ fontSize: "13px", color: T.neutral[500] }}>{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Btn icon={Plus} onClick={() => dispatch({ type: "ADD_PROJECT" })}>New Project</Btn>
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={Building2} title="No projects yet"
          description="Create your first project to start tracking daily and weekly reports."
          action={<Btn icon={Plus} onClick={() => dispatch({ type: "ADD_PROJECT" })}>Create Project</Btn>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {projects.map(p => {
            const pReports = dailyReports.filter(r => r.projectId === p.id);
            const lastReport = pReports.length ? pReports[pReports.length - 1] : null;
            const isActive = p.id === activeProjectId;
            return (
              <Card key={p.id} padding="0" style={{
                overflow: "hidden", cursor: "pointer", transition: "all 0.15s",
                border: isActive ? `2px solid ${T.orange[500]}` : `1px solid ${T.neutral[200]}`,
              }}
                onClick={() => dispatch({ type: "SELECT_PROJECT", id: p.id })}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = T.shadow.md; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <div style={{ width: "5px", background: isActive ? T.orange[500] : T.neutral[300], flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <Badge color="orange">#{p.jobNumber || "—"}</Badge>
                        {isActive && <Badge color="green">Active</Badge>}
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.navy[800], marginBottom: "2px" }}>
                        {p.jobName || "Untitled Project"}
                      </h3>
                      <div style={{ fontSize: "13px", color: T.neutral[500] }}>
                        {p.client || "No client"} &middot; {pReports.length} daily report{pReports.length !== 1 ? "s" : ""}
                        {lastReport && <> &middot; Last: {fmtDateShort(lastReport.date)}</>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={(e) => { e.stopPropagation(); dispatch({ type: "SELECT_PROJECT", id: p.id }); dispatch({ type: "SET_VIEW", view: "projectSetup" }); }}
                        style={{ padding: "6px", background: "transparent", border: "none", cursor: "pointer", color: T.neutral[400], borderRadius: "6px" }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.neutral[100]; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        title="Edit project settings"
                      >
                        <Edit3 size={16} />
                      </button>
                      {projects.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${p.jobName || "Untitled"}" and all its reports?`)) dispatch({ type: "DELETE_PROJECT", id: p.id }); }}
                          style={{ padding: "6px", background: "transparent", border: "none", cursor: "pointer", color: T.neutral[400], borderRadius: "6px" }}
                          onMouseEnter={e => { e.currentTarget.style.background = T.red[100]; e.currentTarget.style.color = T.red[500]; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.neutral[400]; }}
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <ChevronRight size={16} style={{ color: T.neutral[400] }} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Component ─────────────────────────────────────
// ─── Project AI Q&A Component ──────────────────────────────
function ProjectAI({ state, project }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      // Send only essential fields — full reports with photos/base64 would be too large
      const trimmedReports = state.dailyReports
        .filter(r => r.projectId === project.id)
        .slice(-15)
        .map(r => ({
          date: r.date,
          weather: r.weather,
          shift: r.shift,
          generalNotes: r.generalNotes ? r.generalNotes.substring(0, 500) : "",
          incidents: r.incidents,
          delaysProblems: r.delaysProblems,
          extraWork: r.extraWork,
          materialDeliveries: r.materialDeliveries,
          workforce: r.workforce
        }));
      const response = await fetch("/.netlify/functions/project-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          project: {
            jobName: project.jobName,
            jobNumber: project.jobNumber,
            client: project.client,
            location: project.location,
            milestones: project.milestones
          },
          dailyReports: trimmedReports
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer("Sorry, I couldn't generate an answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <form onSubmit={handleAskQuestion} style={{ display: "flex", gap: "8px", marginBottom: answer ? "16px" : "0" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            placeholder="Ask about this project..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px 12px 40px",
              fontSize: "14px",
              border: `1.5px solid ${T.neutral[200]}`,
              borderRadius: T.radius.lg,
              outline: "none",
              transition: "all 0.2s",
              background: T.white,
              color: T.navy[800]
            }}
            onFocus={e => { e.currentTarget.style.borderColor = T.orange[500]; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.orange[100]}`; }}
            onBlur={e => { e.currentTarget.style.borderColor = T.neutral[200]; e.currentTarget.style.boxShadow = "none"; }}
          />
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: T.neutral[400], pointerEvents: "none" }} />
        </div>
        <Btn type="submit" icon={Search} disabled={loading || !question.trim()}>
          {loading ? "Searching..." : "Ask"}
        </Btn>
      </form>

      {answer && (
        <Card style={{ background: "linear-gradient(135deg, " + T.orange[100] + ", " + T.neutral[50] + ")", border: `1px solid ${T.orange[400]}` }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: T.orange[600], marginBottom: "8px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={14} />
            AI Answer
          </div>
          <div style={{ fontSize: "13px", color: T.navy[800], lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {answer}
          </div>
          <button
            onClick={() => { setAnswer(""); setQuestion(""); }}
            style={{ marginTop: "12px", padding: "8px 12px", fontSize: "12px", border: "none", borderRadius: T.radius.sm, background: T.white, color: T.navy[700], cursor: "pointer", fontWeight: 500 }}
          >
            Clear
          </button>
        </Card>
      )}
    </div>
  );
}

function Dashboard({ state, dispatch }) {
  const project = getActiveProject(state);
  const { dailyReports, weeklyReports } = state;
  if (!project) {
    return <ProjectsList state={state} dispatch={dispatch} />;
  }
  const projectDailies = dailyReports.filter(r => r.projectId === project.id);
  const thisWeekReports = projectDailies.filter(r => {
    const we = getWeekEnding(r.date);
    const currentWE = getWeekEnding(new Date());
    return we === currentWE;
  });

  const generateWeekly = () => {
    const weekEnding = getWeekEnding(new Date());
    const weekReports = projectDailies.filter(r => getWeekEnding(r.date) === weekEnding);
    const agg = aggregateWeeklyData(weekReports, project);

    dispatch({ type: "SET_EDITING_WEEKLY", data: {
      id: `wr-${Date.now()}`, projectId: project.id, weekEnding,
      ongoingCompleted: agg.ongoingCompleted,
      lookAhead: [""],
      outstandingRFIs: "None", hotSubmittals: "",
      safety: agg.safety,
      importantDates: "", ownerDeliveryDates: "", outstandingOwnerItems: "",
      upcomingInspections: "", hindrances: agg.delays, additionalDelays: "",
      nextOACMeeting: "",
      selectedPhotos: agg.allPhotos,
    }});
  };

  return (
    <div className="fade-in" style={{ maxWidth: "960px" }}>
      <div style={{
        background: `linear-gradient(135deg, ${T.navy[800]}, ${T.navy[700]})`,
        borderRadius: T.radius.xl, padding: "32px", marginBottom: "24px", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "100%", background: T.orange[500], opacity: 0.08, transform: "skewX(-20deg) translateX(40px)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Badge color="orange">JOB #{project.jobNumber}</Badge>
            <Badge color="navy">{project.client}</Badge>
          </div>
          <h1 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: T.white, marginBottom: "4px", letterSpacing: "-0.02em" }}>
            {project.jobName}
          </h1>
          <p style={{ fontSize: "14px", color: T.navy[400] }}>
            Week ending {fmtDateShort(getWeekEnding(new Date()))} &middot; {thisWeekReports.length} daily report{thisWeekReports.length !== 1 ? "s" : ""} this week
          </p>
        </div>
      </div>

      <ProjectAI state={state} project={project} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => dispatch({ type: "NEW_DAILY" })} style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px",
          background: T.white, border: `2px solid ${T.orange[500]}`, borderRadius: T.radius.lg,
          cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = T.orange[100]; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.white; }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: T.radius.md, background: T.orange[500], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={20} style={{ color: T.white }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: T.navy[800] }}>New Daily Entry</div>
            <div style={{ fontSize: "12px", color: T.neutral[500] }}>Start today's report</div>
          </div>
        </button>

        <button onClick={generateWeekly} style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px",
          background: T.white, border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.lg,
          cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.navy[600]; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.neutral[200]; }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: T.radius.md, background: T.navy[800], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarRange size={20} style={{ color: T.white }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: T.navy[800] }}>Generate Weekly</div>
            <div style={{ fontSize: "12px", color: T.neutral[500] }}>From this week's dailies</div>
          </div>
        </button>

        <button onClick={() => dispatch({ type: "SET_VIEW", view: "photos" })} style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px",
          background: T.white, border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.lg,
          cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.neutral[400]; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.neutral[200]; }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: T.radius.md, background: T.neutral[200], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Camera size={20} style={{ color: T.navy[600] }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: T.navy[800] }}>Photo Gallery</div>
            <div style={{ fontSize: "12px", color: T.neutral[500] }}>View all progress photos</div>
          </div>
        </button>
      </div>

      <SectionTitle icon={FileText}>Recent Daily Reports</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {projectDailies.slice().reverse().map(report => (
          <Card key={report.id} padding="16px 20px" style={{ cursor: "pointer", transition: "all 0.15s" }}
            onClick={() => dispatch({ type: "VIEW_DAILY", report })}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.orange[500]; e.currentTarget.style.transform = "translateX(4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.neutral[200]; e.currentTarget.style.transform = "translateX(0)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <WeatherIcon weather={report.weather} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: T.navy[800] }}>{fmtDate(report.date)}</div>
                    <div style={{ fontSize: "12px", color: T.neutral[500] }}>{report.weather}</div>
                  </div>
                </div>
                {report.delaysProblems && (
                  <Badge color="red">Delay</Badge>
                )}
                {report.incidents && report.incidents !== "N/A" && (
                  <Badge color="red">Incident</Badge>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: T.neutral[400] }}>
                  {report.generalNotes ? report.generalNotes.substring(0, 60) + "..." : "No notes"}
                </span>
                <ChevronRight size={16} style={{ color: T.neutral[400] }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {weeklyReports.filter(r => r.projectId === project.id).length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <SectionTitle icon={CalendarRange}>Saved Weekly Reports</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {weeklyReports.filter(r => r.projectId === project.id).slice().reverse().map(report => (
              <Card key={report.id} padding="16px 20px" style={{ cursor: "pointer", transition: "all 0.15s" }}
                onClick={() => dispatch({ type: "VIEW_WEEKLY", report })}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.navy[600]; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.neutral[200]; e.currentTarget.style.transform = "translateX(0)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: T.radius.md, background: T.navy[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CalendarRange size={18} style={{ color: T.navy[600] }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: T.navy[800] }}>Week Ending {fmtDateShort(report.weekEnding)}</div>
                      <div style={{ fontSize: "12px", color: T.neutral[500] }}>{(report.ongoingCompleted || []).filter(Boolean).length} items completed</div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: T.neutral[400] }} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "32px" }}>
        <SectionTitle icon={CircleDot}>Milestone Tracking</SectionTitle>
        <Card padding="0" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: T.navy[800] }}>
                {["Description","Milestone","Target","Actual"].map(h => (
                  <th key={h} scope="col" style={{ padding: "10px 16px", textAlign: "left", color: T.white, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project.milestones.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${T.neutral[100]}`, background: i % 2 === 0 ? T.white : T.neutral[50] }}>
                  <td style={{ padding: "10px 16px", fontWeight: 500, color: m.actualDate ? T.green[500] : T.navy[800] }}>{m.description}</td>
                  <td style={{ padding: "10px 16px", color: T.neutral[500] }}>{fmtDateShort(m.milestoneDate)}</td>
                  <td style={{ padding: "10px 16px", color: T.neutral[500] }}>{fmtDateShort(m.targetDate)}</td>
                  <td style={{ padding: "10px 16px", color: m.actualDate ? T.green[500] : T.neutral[300] }}>{fmtDateShort(m.actualDate) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ─── Project Setup Component ─────────────────────────────────
function ProjectSetup({ state, dispatch }) {
  const project = getActiveProject(state);
  if (!project) return <ProjectsList state={state} dispatch={dispatch} />;
  return (
    <div className="fade-in" style={{ maxWidth: "860px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: T.navy[800], marginBottom: "24px", letterSpacing: "-0.02em" }}>
        Project Setup
      </h2>

      <Card style={{ marginBottom: "20px" }}>
        <SectionTitle icon={Building2}>Job Information</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
          <Input label="Job Number" value={project.jobNumber} onChange={e => dispatch({ type: "SET_PROJECT", data: { jobNumber: e.target.value } })} />
          <Input label="Job Name" value={project.jobName} onChange={e => dispatch({ type: "SET_PROJECT", data: { jobName: e.target.value } })} />
          <Input label="Client" value={project.client} onChange={e => dispatch({ type: "SET_PROJECT", data: { client: e.target.value } })} />
          <Input label="Default Report Author" value={project.preparedBy || ""} onChange={e => dispatch({ type: "SET_PROJECT", data: { preparedBy: e.target.value } })} />
        </div>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <SectionTitle icon={CircleDot} action={<Btn icon={Plus} size="sm" onClick={() => dispatch({ type: "ADD_MILESTONE" })}>Add</Btn>}>
          Milestones
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "8px", fontSize: "12px", fontWeight: 600, color: T.neutral[500], marginBottom: "8px", padding: "0 4px" }}>
          <span>Description</span><span>Milestone</span><span>Target</span><span>Actual</span><span></span>
        </div>
        {project.milestones.map(m => (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
            <input value={m.description} onChange={e => dispatch({ type: "UPDATE_MILESTONE", id: m.id, data: { description: e.target.value } })}
              style={{ padding: "8px 10px", border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.sm, fontSize: "13px", outline: "none" }}
            />
            <input type="date" value={m.milestoneDate} onChange={e => dispatch({ type: "UPDATE_MILESTONE", id: m.id, data: { milestoneDate: e.target.value } })}
              style={{ padding: "8px 6px", border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.sm, fontSize: "12px", outline: "none" }}
            />
            <input type="date" value={m.targetDate} onChange={e => dispatch({ type: "UPDATE_MILESTONE", id: m.id, data: { targetDate: e.target.value } })}
              style={{ padding: "8px 6px", border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.sm, fontSize: "12px", outline: "none" }}
            />
            <input type="date" value={m.actualDate} onChange={e => dispatch({ type: "UPDATE_MILESTONE", id: m.id, data: { actualDate: e.target.value } })}
              style={{ padding: "8px 6px", border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.sm, fontSize: "12px", outline: "none" }}
            />
            <button onClick={() => dispatch({ type: "REMOVE_MILESTONE", id: m.id })} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: T.neutral[400] }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <SectionTitle icon={Truck} action={
          <div style={{ display: "flex", gap: "8px" }}>
            <Btn icon={Plus} size="sm" variant="secondary" onClick={() => dispatch({ type: "ADD_EQUIPMENT_OWNED" })}>Owned</Btn>
            <Btn icon={Plus} size="sm" variant="secondary" onClick={() => dispatch({ type: "ADD_EQUIPMENT_RENTED" })}>Rented</Btn>
          </div>
        }>
          Equipment Roster
        </SectionTitle>

        {project.equipmentOwned.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: T.neutral[500], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Owned</div>
            {project.equipmentOwned.map(e => (
              <div key={e.id} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
                <input value={e.description} onChange={ev => dispatch({ type: "UPDATE_EQUIPMENT_OWNED", id: e.id, data: { description: ev.target.value } })} placeholder="Equipment description"
                  style={{ flex: 1, padding: "8px 10px", border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.sm, fontSize: "13px", outline: "none" }}
                />
                <button onClick={() => dispatch({ type: "REMOVE_EQUIPMENT", id: e.id })} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.neutral[400] }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {project.equipmentRented.length > 0 && (
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: T.neutral[500], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Rented</div>
            {project.equipmentRented.map(e => (
              <div key={e.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
                <input value={e.description} onChange={ev => dispatch({ type: "UPDATE_EQUIPMENT_RENTED", id: e.id, data: { description: ev.target.value } })} placeholder="Equipment description"
                  style={{ padding: "8px 10px", border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.sm, fontSize: "13px", outline: "none" }}
                />
                <input value={e.vendor} onChange={ev => dispatch({ type: "UPDATE_EQUIPMENT_RENTED", id: e.id, data: { vendor: ev.target.value } })} placeholder="Vendor"
                  style={{ padding: "8px 10px", border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.sm, fontSize: "13px", outline: "none" }}
                />
                <button onClick={() => dispatch({ type: "REMOVE_EQUIPMENT", id: e.id })} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.neutral[400] }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Daily Entry Component ──────────────────────────────────
function DailyEntry({ state, dispatch }) {
  const report = state.editingDaily;
  const project = getActiveProject(state);
  const [isRecording, setIsRecording] = useState(false);
  const [photoDesc, setPhotoDesc] = useState("");
  const [aiRevising, setAiRevising] = useState(null); // stores the field key being revised, e.g. "generalNotes"
  const [aiRevisedText, setAiRevisedText] = useState("");
  const [aiPreviewField, setAiPreviewField] = useState(null); // which field is showing the preview
  const [voiceTarget, setVoiceTarget] = useState("generalNotes"); // which field voice is recording into
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  if (!report) {
    return (
      <div className="fade-in">
        <EmptyState icon={ClipboardEdit} title="No report in progress"
          description="Start a new daily report or select an existing one to edit."
          action={<Btn icon={Plus} onClick={() => dispatch({ type: "NEW_DAILY" })}>New Daily Entry</Btn>}
        />
      </div>
    );
  }

  const update = (data) => dispatch({ type: "UPDATE_EDITING_DAILY", data });
  const updateWorkforce = (role, shift, val) => {
    update({ workforce: { ...report.workforce, [role]: { ...report.workforce[role], [shift]: parseInt(val) || 0 } } });
  };

  const toggleEquipment = (id) => {
    const present = report.equipmentPresent.includes(id);
    update({ equipmentPresent: present ? report.equipmentPresent.filter(e => e !== id) : [...report.equipmentPresent, id] });
  };
  const toggleDown = (id) => {
    const down = report.equipmentDown.includes(id);
    update({ equipmentDown: down ? report.equipmentDown.filter(e => e !== id) : [...report.equipmentDown, id] });
  };

  const handleVoice = (fieldKey = "generalNotes") => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    setVoiceTarget(fieldKey);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim = transcript;
        }
      }
      const currentVal = report[fieldKey] || "";
      const separator = currentVal && !currentVal.endsWith(" ") && !currentVal.endsWith("\n") ? " " : "";
      update({ [fieldKey]: currentVal.trimEnd() + separator + finalTranscript + interim });
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone access in your browser settings.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);
  };

  const handleReviseField = async (fieldKey) => {
    const text = report[fieldKey];
    if (!text || !text.trim()) {
      alert("Please add some text first.");
      return;
    }

    setAiRevising(fieldKey);
    try {
      const response = await fetch("/.netlify/functions/revise-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: text })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setAiRevisedText(data.revised);
      setAiPreviewField(fieldKey);
    } catch (error) {
      console.error("Error revising notes:", error);
      alert("Failed to revise notes. Please try again.");
    } finally {
      setAiRevising(null);
    }
  };

  // Reusable voice + AI buttons for any text field
  const FieldTools = ({ fieldKey }) => (
    <>
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <Btn variant={isRecording && voiceTarget === fieldKey ? "danger" : "secondary"} icon={isRecording && voiceTarget === fieldKey ? MicOff : Mic} size="sm"
          onClick={() => handleVoice(fieldKey)}>
          {isRecording && voiceTarget === fieldKey ? "Stop" : "Voice Note"}
        </Btn>
        <Btn variant="secondary" icon={Sparkles} size="sm" onClick={() => handleReviseField(fieldKey)} disabled={aiRevising === fieldKey}>
          {aiRevising === fieldKey ? "Revising..." : "Revise with AI"}
        </Btn>
      </div>
      {aiPreviewField === fieldKey && (
        <div style={{ background: T.orange[100], border: `1px solid ${T.orange[500]}`, borderRadius: T.radius.md, padding: "16px", marginTop: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: T.orange[600], marginBottom: "8px", textTransform: "uppercase" }}>AI Revision Preview</div>
          <div style={{ fontSize: "13px", color: T.navy[800], lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: "12px" }}>{aiRevisedText}</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Btn size="sm" icon={Check} onClick={() => { update({ [fieldKey]: aiRevisedText }); setAiPreviewField(null); setAiRevisedText(""); }}>Accept</Btn>
            <Btn variant="secondary" size="sm" onClick={() => { update({ [fieldKey]: aiRevisedText }); setAiPreviewField(null); setAiRevisedText(""); }}>Edit</Btn>
            <Btn variant="ghost" size="sm" onClick={() => { setAiPreviewField(null); setAiRevisedText(""); }}>Cancel</Btn>
          </div>
        </div>
      )}
    </>
  );

  const addPhoto = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhoto = {
        id: `ph-${Date.now()}`,
        url: e.target.result,
        description: photoDesc || file.name || "Progress photo",
        includeInWeekly: false
      };
      update({ photos: [...(report.photos || []), newPhoto] });
      setPhotoDesc("");
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) addPhoto(file);
    e.target.value = "";
  };

  const workforceRoles = [
    { key: "indirectLabor", label: "Indirect Labor" },
    { key: "apprentices", label: "Apprentices" },
    { key: "foreman", label: "Foreman" },
    { key: "operators", label: "Operators" },
    { key: "laborers", label: "Laborers" },
    { key: "carpenters", label: "Carpenters" },
    { key: "cementMasons", label: "Cement Masons" },
  ];

  const totalDay = workforceRoles.reduce((sum, r) => sum + (report.workforce[r.key]?.day || 0), 0);
  const totalNight = workforceRoles.reduce((sum, r) => sum + (report.workforce[r.key]?.night || 0), 0);

  return (
    <div className="fade-in" style={{ maxWidth: "900px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: T.navy[800], letterSpacing: "-0.02em" }}>Daily Report Entry</h2>
          <p style={{ fontSize: "13px", color: T.neutral[500] }}>JOB #{project.jobNumber} &middot; {project.jobName}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Btn variant="ghost" onClick={() => dispatch({ type: "SET_VIEW", view: "dashboard" })}>Cancel</Btn>
          <Btn icon={Save} onClick={() => dispatch({ type: "SAVE_DAILY" })}>Save Report</Btn>
        </div>
      </div>

      <Card style={{ marginBottom: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
          <Input label="Date" type="date" value={report.date}
            onChange={e => {
              const d = new Date(e.target.value + "T12:00:00");
              update({ date: e.target.value, day: DAYS[d.getDay()] });
            }}
          />
          <Input label="Day" value={report.day} readOnly inputStyle={{ background: T.neutral[50] }} />
          <Select label="Weather" value={report.weather} onChange={e => update({ weather: e.target.value })}
            options={[
              { value: "Sunny / Clear", label: "Sunny / Clear" },
              { value: "Cloudy", label: "Cloudy" },
              { value: "Rain", label: "Rain" },
              { value: "Wind", label: "Wind" },
              { value: "Snow", label: "Snow" },
              { value: "Cloudy / Wind", label: "Cloudy / Wind" },
              { value: "Rain / Wind", label: "Rain / Wind" },
            ]}
          />
          <Input label="Incidents" value={report.incidents} onChange={e => update({ incidents: e.target.value })} placeholder="N/A" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
          <Select label="Shift" value={report.shift.type} onChange={e => update({ shift: { ...report.shift, type: e.target.value } })}
            options={[{ value: "Day", label: "Day" }, { value: "Night", label: "Night" }, { value: "Day + Night", label: "Day + Night" }]}
          />
          <Input label="Shift Hours" value={report.shift.hours} onChange={e => update({ shift: { ...report.shift, hours: e.target.value } })} placeholder="8hr" />
        </div>
      </Card>

      <Card style={{ marginBottom: "16px" }}>
        <SectionTitle icon={Edit3}>General Notes</SectionTitle>
        <TextArea value={report.generalNotes} onChange={e => update({ generalNotes: e.target.value })}
          placeholder="Describe today's work activities, observations, and updates..."
        />
        <FieldTools fieldKey="generalNotes" />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card>
          <SectionTitle icon={Users}>Daily Workforce</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "4px", fontSize: "12px", fontWeight: 600, color: T.neutral[500], marginBottom: "6px" }}>
            <span>Role</span><span style={{ textAlign: "center" }}>Day</span><span style={{ textAlign: "center" }}>Night</span>
          </div>
          {workforceRoles.map(r => {
            const dayVal = report.workforce[r.key]?.day || 0;
            const nightVal = report.workforce[r.key]?.night || 0;
            const stepperBtn = (onClick, icon) => (
              <button onClick={onClick} style={{
                width: "28px", height: "28px", border: "none", borderRadius: "6px",
                background: T.neutral[100], cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", color: T.navy[700],
                transition: "all 0.15s", flexShrink: 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = T.orange[100]; e.currentTarget.style.color = T.orange[600]; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.neutral[100]; e.currentTarget.style.color = T.navy[700]; }}
              >{icon}</button>
            );
            return (
              <div key={r.key} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "4px", marginBottom: "4px", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: T.navy[700] }}>{r.label}</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  {stepperBtn(() => updateWorkforce(r.key, "day", Math.max(0, dayVal - 1)), <ChevronDown size={14} />)}
                  <span style={{
                    minWidth: "28px", textAlign: "center", fontSize: "14px", fontWeight: 700,
                    color: dayVal > 0 ? T.navy[800] : T.neutral[300],
                  }}>{dayVal}</span>
                  {stepperBtn(() => updateWorkforce(r.key, "day", dayVal + 1), <ChevronUp size={14} />)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  {stepperBtn(() => updateWorkforce(r.key, "night", Math.max(0, nightVal - 1)), <ChevronDown size={14} />)}
                  <span style={{
                    minWidth: "28px", textAlign: "center", fontSize: "14px", fontWeight: 700,
                    color: nightVal > 0 ? T.navy[800] : T.neutral[300],
                  }}>{nightVal}</span>
                  {stepperBtn(() => updateWorkforce(r.key, "night", nightVal + 1), <ChevronUp size={14} />)}
                </div>
              </div>
            );
          })}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "4px", marginTop: "8px", paddingTop: "8px", borderTop: `2px solid ${T.navy[800]}` }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: T.navy[800] }}>Total</span>
            <span style={{ textAlign: "center", fontWeight: 700, fontSize: "14px", color: T.orange[500] }}>{totalDay}</span>
            <span style={{ textAlign: "center", fontWeight: 700, fontSize: "14px", color: T.orange[500] }}>{totalNight}</span>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Truck} action={
            <div style={{ display: "flex", gap: "6px" }}>
              <Btn icon={Plus} size="sm" variant="secondary" onClick={() => dispatch({ type: "ADD_EQUIPMENT_OWNED" })}>Owned</Btn>
              <Btn icon={Plus} size="sm" variant="secondary" onClick={() => dispatch({ type: "ADD_EQUIPMENT_RENTED" })}>Rented</Btn>
            </div>
          }>Major Equipment</SectionTitle>
          <div style={{ fontSize: "12px", fontWeight: 700, color: T.neutral[500], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Owned</div>
          {project.equipmentOwned.map(e => {
            const present = report.equipmentPresent.includes(e.id);
            const down = report.equipmentDown.includes(e.id);
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <button
                  onClick={() => toggleEquipment(e.id)}
                  aria-label={`${present ? "Remove" : "Add"} ${e.description || "equipment"} ${present ? "from" : "to"} report`}
                  aria-pressed={present}
                  style={{
                    width: "22px", height: "22px", borderRadius: "4px", border: `1.5px solid ${present ? T.green[500] : T.neutral[300]}`,
                    background: present ? T.green[100] : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                  {present && <Check size={14} style={{ color: T.green[500] }} aria-hidden="true" />}
                </button>
                <input value={e.description}
                  onChange={ev => dispatch({ type: "UPDATE_EQUIPMENT_OWNED", id: e.id, data: { description: ev.target.value } })}
                  placeholder="Equipment name"
                  style={{ flex: 1, fontSize: "13px", color: present ? T.navy[800] : T.neutral[400], padding: "4px 8px", border: `1px solid transparent`, borderRadius: T.radius.sm, outline: "none", background: "transparent" }}
                  onFocus={ev => { ev.target.style.borderColor = T.neutral[200]; ev.target.style.background = T.white; }}
                  onBlur={ev => { ev.target.style.borderColor = "transparent"; ev.target.style.background = "transparent"; }}
                />
                {present && (
                  <button
                    onClick={() => toggleDown(e.id)}
                    aria-label={`Mark ${e.description || "equipment"} as ${down ? "operational" : "down"}`}
                    aria-pressed={down}
                    style={{
                      padding: "2px 8px", borderRadius: "4px", border: `1px solid ${down ? T.red[500] : T.neutral[300]}`,
                      background: down ? T.red[100] : "transparent", cursor: "pointer", fontSize: "11px", fontWeight: 600,
                      color: down ? T.red[500] : T.neutral[400],
                    }}>
                    {down ? "DOWN" : "OK"}
                  </button>
                )}
                <button
                  onClick={() => dispatch({ type: "REMOVE_EQUIPMENT", id: e.id })}
                  aria-label={`Remove ${e.description || "equipment"}`}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: T.neutral[300], padding: "2px", flexShrink: 0 }}
                  onMouseEnter={ev => { ev.currentTarget.style.color = T.red[500]; }}
                  onMouseLeave={ev => { ev.currentTarget.style.color = T.neutral[300]; }}
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </div>
            );
          })}
          {project.equipmentOwned.length === 0 && <div style={{ fontSize: "12px", color: T.neutral[400], padding: "4px 0" }}>No owned equipment. Click "+ Owned" to add.</div>}

          <div style={{ fontSize: "12px", fontWeight: 700, color: T.neutral[500], textTransform: "uppercase", letterSpacing: "0.06em", margin: "12px 0 8px" }}>Rented</div>
          {project.equipmentRented.map(e => {
            const present = report.equipmentPresent.includes(e.id);
            const down = report.equipmentDown.includes(e.id);
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <button
                  onClick={() => toggleEquipment(e.id)}
                  aria-label={`${present ? "Remove" : "Add"} ${e.description || "equipment"} ${present ? "from" : "to"} report`}
                  aria-pressed={present}
                  style={{
                    width: "22px", height: "22px", borderRadius: "4px", border: `1.5px solid ${present ? T.green[500] : T.neutral[300]}`,
                    background: present ? T.green[100] : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                  {present && <Check size={14} style={{ color: T.green[500] }} aria-hidden="true" />}
                </button>
                <input value={e.description}
                  onChange={ev => dispatch({ type: "UPDATE_EQUIPMENT_RENTED", id: e.id, data: { description: ev.target.value } })}
                  placeholder="Equipment name"
                  style={{ flex: 2, fontSize: "13px", color: present ? T.navy[800] : T.neutral[400], padding: "4px 8px", border: `1px solid transparent`, borderRadius: T.radius.sm, outline: "none", background: "transparent", minWidth: 0 }}
                  onFocus={ev => { ev.target.style.borderColor = T.neutral[200]; ev.target.style.background = T.white; }}
                  onBlur={ev => { ev.target.style.borderColor = "transparent"; ev.target.style.background = "transparent"; }}
                />
                <input value={e.vendor}
                  onChange={ev => dispatch({ type: "UPDATE_EQUIPMENT_RENTED", id: e.id, data: { vendor: ev.target.value } })}
                  placeholder="Vendor (e.g. United Rentals)"
                  style={{ flex: 1, fontSize: "11px", color: T.neutral[500], padding: "4px 8px", border: `1px solid ${T.neutral[200]}`, borderRadius: T.radius.sm, outline: "none", background: T.neutral[50], minWidth: 0 }}
                  onFocus={ev => { ev.target.style.borderColor = T.orange[500]; }}
                  onBlur={ev => { ev.target.style.borderColor = T.neutral[200]; }}
                />
                {present && (
                  <button onClick={() => toggleDown(e.id)} style={{
                    padding: "2px 8px", borderRadius: "4px", border: `1px solid ${down ? T.red[500] : T.neutral[300]}`,
                    background: down ? T.red[100] : "transparent", cursor: "pointer", fontSize: "11px", fontWeight: 600,
                    color: down ? T.red[500] : T.neutral[400], flexShrink: 0,
                  }}>
                    {down ? "DOWN" : "OK"}
                  </button>
                )}
                <button onClick={() => dispatch({ type: "REMOVE_EQUIPMENT", id: e.id })}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: T.neutral[300], padding: "2px", flexShrink: 0 }}
                  onMouseEnter={ev => { ev.currentTarget.style.color = T.red[500]; }}
                  onMouseLeave={ev => { ev.currentTarget.style.color = T.neutral[300]; }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
          {project.equipmentRented.length === 0 && <div style={{ fontSize: "12px", color: T.neutral[400], padding: "4px 0" }}>No rented equipment. Click "+ Rented" to add.</div>}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card>
          <TextArea label="Third Party Utilities" value={report.thirdPartyUtilities}
            onChange={e => update({ thirdPartyUtilities: e.target.value })} placeholder="Note any third-party utility work..."
            style={{ fontSize: "13px" }}
          />
          <FieldTools fieldKey="thirdPartyUtilities" />
        </Card>
        <Card>
          <TextArea label="Material Deliveries" value={report.materialDeliveries}
            onChange={e => update({ materialDeliveries: e.target.value })} placeholder="Note any material deliveries..."
          />
          <FieldTools fieldKey="materialDeliveries" />
        </Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card>
          <TextArea label="Delays / Problems" value={report.delaysProblems}
            onChange={e => update({ delaysProblems: e.target.value })} placeholder="Document any delays or problems..."
          />
          <FieldTools fieldKey="delaysProblems" />
        </Card>
        <Card>
          <TextArea label="Extra Work / Claims / Misc." value={report.extraWork}
            onChange={e => update({ extraWork: e.target.value })} placeholder="Note extra work, claims, or miscellaneous..."
          />
          <FieldTools fieldKey="extraWork" />
        </Card>
      </div>

      <Card style={{ marginBottom: "16px" }}>
        <SectionTitle icon={CheckCircle2}>Milestone Check-In</SectionTitle>
        <p style={{ fontSize: "13px", color: T.neutral[500], marginBottom: "12px" }}>Was a milestone completed or hit today?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {project.milestones.filter(m => !m.actualDate).map(m => (
            <button key={m.id} onClick={() => update({ milestoneHit: report.milestoneHit?.id === m.id ? null : { id: m.id, date: report.date } })}
              style={{
                padding: "8px 14px", borderRadius: T.radius.md, cursor: "pointer",
                border: `1.5px solid ${report.milestoneHit?.id === m.id ? T.green[500] : T.neutral[200]}`,
                background: report.milestoneHit?.id === m.id ? T.green[100] : T.white,
                color: report.milestoneHit?.id === m.id ? T.green[500] : T.navy[700],
                fontSize: "13px", fontWeight: 500, transition: "all 0.15s",
              }}>
              {report.milestoneHit?.id === m.id && <Check size={14} style={{ marginRight: "6px", verticalAlign: "-2px" }} />}
              {m.description}
            </button>
          ))}
          {project.milestones.filter(m => !m.actualDate).length === 0 && (
            <span style={{ fontSize: "13px", color: T.neutral[400] }}>All milestones have been completed</span>
          )}
        </div>
      </Card>

      <Card style={{ marginBottom: "16px" }}>
        <SectionTitle icon={Camera}>Progress Photos</SectionTitle>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} />
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileSelect} style={{ display: "none" }} />
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <Input placeholder="Photo description (optional)..." value={photoDesc} onChange={e => setPhotoDesc(e.target.value)} style={{ flex: 1 }} />
          <Btn icon={Upload} variant="secondary" onClick={() => fileInputRef.current?.click()}>Upload</Btn>
          <Btn icon={Camera} variant="secondary" onClick={() => cameraInputRef.current?.click()}>Camera</Btn>
        </div>
        {(report.photos || []).length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
            {report.photos.map((p, i) => (
              <div key={p.id} style={{
                border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.md,
                background: T.neutral[50], overflow: "hidden",
              }}>
                {p.url ? (
                  <img src={p.url} alt={p.description} style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Camera size={32} style={{ color: T.neutral[300] }} />
                  </div>
                )}
                <div style={{ padding: "8px" }}>
                  <input
                    value={p.description}
                    onChange={e => {
                      const updatedPhotos = [...report.photos];
                      updatedPhotos[i] = { ...updatedPhotos[i], description: e.target.value };
                      update({ photos: updatedPhotos });
                    }}
                    placeholder="Add description..."
                    style={{
                      width: "100%", fontSize: "12px", color: T.navy[700], padding: "4px 6px",
                      border: `1px solid transparent`, borderRadius: T.radius.sm, outline: "none",
                      background: "transparent", fontFamily: T.font,
                    }}
                    onFocus={e => { e.target.style.borderColor = T.neutral[200]; e.target.style.background = T.white; }}
                    onBlur={e => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
                  />
                  <button onClick={() => update({ photos: report.photos.filter((_, j) => j !== i) })}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: T.neutral[400], fontSize: "11px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}
                    onMouseEnter={e => { e.currentTarget.style.color = T.red[500]; }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.neutral[400]; }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
          <Input label="Report Prepared By" value={report.preparedBy} onChange={e => update({ preparedBy: e.target.value })} style={{ flex: 1 }} />
          <Btn icon={Save} size="lg" onClick={() => dispatch({ type: "SAVE_DAILY" })}>Save Daily Report</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── Daily View Component ────────────────────────────────────
function DailyView({ state, dispatch }) {
  const report = state.viewingDaily;
  const project = getActiveProject(state);
  const [includePhotos, setIncludePhotos] = React.useState(true);

  if (!report) return null;

  const allEquip = [...project.equipmentOwned.map(e => ({ ...e, type: "Owned" })), ...project.equipmentRented.map(e => ({ ...e, type: "Rented" }))];
  const presentEquip = allEquip.filter(e => report.equipmentPresent.includes(e.id));

  const workforceRoles = [
    { key: "indirectLabor", label: "Indirect Labor" }, { key: "apprentices", label: "Apprentices" },
    { key: "foreman", label: "Foreman" }, { key: "operators", label: "Operators" },
    { key: "laborers", label: "Laborers" }, { key: "carpenters", label: "Carpenters" },
    { key: "cementMasons", label: "Cement Masons" },
  ];
  const totalDay = workforceRoles.reduce((sum, r) => sum + (report.workforce[r.key]?.day || 0), 0);
  const totalNight = workforceRoles.reduce((sum, r) => sum + (report.workforce[r.key]?.night || 0), 0);

  return (
    <div className="fade-in" style={{ maxWidth: "900px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <Btn variant="ghost" icon={ArrowLeft} onClick={() => dispatch({ type: "SET_VIEW", view: "dashboard" })}>Back</Btn>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {(report.photos || []).length > 0 && (
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: T.navy[600], cursor: "pointer" }}>
              <input type="checkbox" checked={includePhotos} onChange={e => setIncludePhotos(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: T.navy[600] }} />
              Include photos
            </label>
          )}
          <Btn variant="secondary" icon={Edit3} onClick={() => dispatch({ type: "EDIT_DAILY", report })}>Edit</Btn>
          <Btn variant="secondary" icon={FileDown} size="sm" onClick={() => exportDailyPDF(report, project, includePhotos)}>Export PDF</Btn>
        </div>
      </div>

      <Card style={{ marginBottom: "16px", background: T.navy[800], color: T.white, border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: T.orange[500], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Daily Report</div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "4px" }}>{project.jobName}</h2>
            <div style={{ fontSize: "13px", color: T.navy[400] }}>JOB #{project.jobNumber}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
              <WeatherIcon weather={report.weather} />
              <span style={{ fontWeight: 600 }}>{report.weather}</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>{fmtDate(report.date)}</div>
            <div style={{ fontSize: "13px", color: T.navy[400] }}>Shift: {report.shift.hours} {report.shift.type}</div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: T.orange[500], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>General Notes</div>
        <p style={{ fontSize: "14px", lineHeight: 1.7, color: T.navy[700] }}>{report.generalNotes || "No notes recorded."}</p>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card padding="0" style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: T.navy[800], color: T.white, fontWeight: 700, fontSize: "13px" }}>Daily Workforce</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.neutral[200]}` }}>
                <th scope="col" style={{ padding: "8px 12px", textAlign: "left", color: T.neutral[500], fontWeight: 600 }}>Role</th>
                <th scope="col" style={{ padding: "8px 12px", textAlign: "center", color: T.neutral[500], fontWeight: 600 }}>D</th>
                <th scope="col" style={{ padding: "8px 12px", textAlign: "center", color: T.neutral[500], fontWeight: 600 }}>N</th>
              </tr>
            </thead>
            <tbody>
              {workforceRoles.map((r, i) => (
                <tr key={r.key} style={{ borderBottom: `1px solid ${T.neutral[100]}` }}>
                  <td style={{ padding: "7px 12px" }}>{r.label}</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", fontWeight: 600 }}>{report.workforce[r.key]?.day || "—"}</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", fontWeight: 600 }}>{report.workforce[r.key]?.night || "—"}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${T.navy[800]}` }}>
                <td style={{ padding: "8px 12px", fontWeight: 700 }}>Total</td>
                <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, color: T.orange[500] }}>{totalDay}</td>
                <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, color: T.orange[500] }}>{totalNight}</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card padding="0" style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: T.navy[800], color: T.white, fontWeight: 700, fontSize: "13px" }}>Major Equipment</div>
          <div style={{ padding: "12px 16px" }}>
            {presentEquip.map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.neutral[100]}` }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>{e.description}</span>
                  {e.vendor && <span style={{ fontSize: "11px", color: T.neutral[400], marginLeft: "8px" }}>({e.vendor})</span>}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <Badge color={e.type === "Owned" ? "navy" : "orange"}>{e.type}</Badge>
                  {report.equipmentDown.includes(e.id) && <Badge color="red">DOWN</Badge>}
                </div>
              </div>
            ))}
            {presentEquip.length === 0 && <span style={{ fontSize: "13px", color: T.neutral[400] }}>No equipment listed</span>}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {[
          { label: "Third Party Utilities", value: report.thirdPartyUtilities },
          { label: "Material Deliveries", value: report.materialDeliveries },
          { label: "Delays / Problems", value: report.delaysProblems, highlight: true },
          { label: "Extra Work / Claims", value: report.extraWork },
        ].map(s => (
          <Card key={s.label}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: s.highlight && s.value ? T.red[500] : T.orange[500], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{s.label}</div>
            <p style={{ fontSize: "13px", color: s.value ? T.navy[700] : T.neutral[400], lineHeight: 1.6 }}>{s.value || "None"}</p>
          </Card>
        ))}
      </div>

      <div style={{ textAlign: "right", fontSize: "13px", color: T.neutral[500], padding: "8px 0" }}>
        Report prepared by <span style={{ fontWeight: 600, color: T.navy[700] }}>{report.preparedBy}</span>
      </div>
    </div>
  );
}

// ─── Weekly Generator Component ──────────────────────────────
function WeeklyGenerator({ state, dispatch }) {
  const weekly = state.editingWeekly;
  const project = getActiveProject(state);

  if (!weekly) {
    const weekEnding = getWeekEnding(new Date());
    const generateNew = () => {
      const weekReports = state.dailyReports.filter(r => r.projectId === project.id && getWeekEnding(r.date) === weekEnding);
      const agg = aggregateWeeklyData(weekReports, project);
      dispatch({ type: "SET_EDITING_WEEKLY", data: {
        id: `wr-${Date.now()}`, projectId: project.id, weekEnding,
        ongoingCompleted: agg.ongoingCompleted,
        lookAhead: [""], outstandingRFIs: "None", hotSubmittals: "",
        safety: agg.safety,
        importantDates: "", ownerDeliveryDates: "", outstandingOwnerItems: "",
        upcomingInspections: "", hindrances: agg.delays, additionalDelays: "",
        nextOACMeeting: "", selectedPhotos: agg.allPhotos,
      }});
    };

    return (
      <div className="fade-in">
        <EmptyState icon={CalendarRange} title="Generate Weekly Report"
          description="Create a weekly report from this week's daily entries."
          action={<Btn icon={Plus} onClick={generateNew}>Generate from Daily Reports</Btn>}
        />
      </div>
    );
  }

  const update = (data) => dispatch({ type: "UPDATE_EDITING_WEEKLY", data });
  const updateList = (field, index, value) => {
    const list = [...weekly[field]];
    list[index] = value;
    update({ [field]: list });
  };
  const addListItem = (field) => update({ [field]: [...weekly[field], ""] });
  const removeListItem = (field, index) => update({ [field]: weekly[field].filter((_, i) => i !== index) });

  const ListEditor = ({ label, field }) => (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: T.navy[600] }}>{label}</span>
        <button onClick={() => addListItem(field)} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.orange[500], fontSize: "12px", fontWeight: 600 }}>+ Add</button>
      </div>
      {weekly[field].map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
          <span style={{ fontSize: "13px", color: T.neutral[400], padding: "8px 4px", minWidth: "16px" }}>&bull;</span>
          <input value={item} onChange={e => updateList(field, i, e.target.value)}
            style={{ flex: 1, padding: "7px 10px", border: `1.5px solid ${T.neutral[200]}`, borderRadius: T.radius.sm, fontSize: "13px", outline: "none" }}
          />
          {weekly[field].length > 1 && (
            <button onClick={() => removeListItem(field, i)} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.neutral[400] }}>
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: "900px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: T.navy[800], letterSpacing: "-0.02em" }}>Weekly Report</h2>
          <p style={{ fontSize: "13px", color: T.neutral[500] }}>Week ending {fmtDateShort(weekly.weekEnding)} &middot; {project.client}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Btn variant="ghost" onClick={() => dispatch({ type: "SET_VIEW", view: "dashboard" })}>Cancel</Btn>
          <Btn variant="navy" icon={FileDown} size="sm" onClick={() => exportWeeklyPDF(weekly, project)}>Export PDF</Btn>
          <Btn icon={Save} onClick={() => dispatch({ type: "SAVE_WEEKLY" })}>Save</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card>
          <ListEditor label="On-going / Completed Work" field="ongoingCompleted" />
        </Card>
        <Card>
          <TextArea label="Outstanding RFIs" value={weekly.outstandingRFIs} onChange={e => update({ outstandingRFIs: e.target.value })} />
          <div style={{ marginTop: "12px" }}>
            <TextArea label="Hot Submittals" value={weekly.hotSubmittals} onChange={e => update({ hotSubmittals: e.target.value })} />
          </div>
          <div style={{ marginTop: "12px" }}>
            <TextArea label="Safety" value={weekly.safety} onChange={e => update({ safety: e.target.value })} />
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card>
          <ListEditor label="Look Ahead Schedule" field="lookAhead" />
        </Card>
        <Card>
          <TextArea label="Important Dates" value={weekly.importantDates} onChange={e => update({ importantDates: e.target.value })} />
          <div style={{ marginTop: "12px" }}>
            <TextArea label="Owner Furnished Delivery Dates" value={weekly.ownerDeliveryDates} onChange={e => update({ ownerDeliveryDates: e.target.value })} />
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card>
          <TextArea label="Outstanding Items from Owner" value={weekly.outstandingOwnerItems} onChange={e => update({ outstandingOwnerItems: e.target.value })} />
        </Card>
        <Card>
          <TextArea label="Upcoming Inspections" value={weekly.upcomingInspections} onChange={e => update({ upcomingInspections: e.target.value })} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card>
          <TextArea label="Hindrances / Additional Delays" value={weekly.hindrances || ""} onChange={e => update({ hindrances: e.target.value })} />
        </Card>
        <Card>
          <Input label="Next OAC Meeting" type="date" value={weekly.nextOACMeeting} onChange={e => update({ nextOACMeeting: e.target.value })} />
        </Card>
      </div>

      <Card style={{ marginBottom: "16px" }}>
        <SectionTitle icon={CircleDot}>Milestone Tracking</SectionTitle>
        <div style={{ fontSize: "11px", color: T.neutral[500], marginBottom: "12px" }}>
          Milestone = Owner Contract Schedule &ensp;|&ensp; Target = Sub OPS Schedule &ensp;|&ensp; Actual = Work Completed
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: T.navy[800] }}>
              {["Description","Milestone","Target","Actual"].map(h => (
                <th key={h} scope="col" style={{ padding: "10px 14px", textAlign: "left", color: T.white, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {project.milestones.map((m, i) => (
              <tr key={m.id} style={{ borderBottom: `1px solid ${T.neutral[100]}`, background: i % 2 === 0 ? T.white : T.neutral[50] }}>
                <td style={{ padding: "9px 14px", fontWeight: 500, color: m.actualDate ? T.green[500] : T.navy[800] }}>{m.description}</td>
                <td style={{ padding: "9px 14px", color: T.neutral[500] }}>{fmtDateShort(m.milestoneDate)}</td>
                <td style={{ padding: "9px 14px", color: T.neutral[500] }}>{fmtDateShort(m.targetDate)}</td>
                <td style={{ padding: "9px 14px", color: m.actualDate ? T.green[500] : T.neutral[300] }}>{fmtDateShort(m.actualDate) || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {(weekly.selectedPhotos || []).length > 0 && (
        <Card style={{ marginBottom: "16px" }}>
          <SectionTitle icon={Camera} action={
            <span style={{ fontSize: "12px", color: T.neutral[500] }}>
              {weekly.selectedPhotos.filter(p => p.selected !== false).length} of {weekly.selectedPhotos.length} selected
            </span>
          }>Progress Photos for Report</SectionTitle>
          <p style={{ fontSize: "12px", color: T.neutral[500], marginBottom: "12px" }}>
            Toggle which photos to include in the exported weekly PDF.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
            {weekly.selectedPhotos.map((photo, i) => {
              const isSelected = photo.selected !== false;
              return (
                <div key={photo.id || i}
                  onClick={() => {
                    const updated = [...weekly.selectedPhotos];
                    updated[i] = { ...updated[i], selected: !isSelected };
                    update({ selectedPhotos: updated });
                  }}
                  style={{
                    border: `2px solid ${isSelected ? T.green[500] : T.neutral[200]}`,
                    borderRadius: T.radius.md, overflow: "hidden", cursor: "pointer",
                    transition: "all 0.15s", opacity: isSelected ? 1 : 0.5,
                  }}
                >
                  <div style={{
                    height: "80px", background: `linear-gradient(135deg, ${T.neutral[200]}, ${T.neutral[100]})`,
                    display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                  }}>
                    <Camera size={24} style={{ color: T.neutral[300] }} />
                    {isSelected && (
                      <div style={{
                        position: "absolute", top: "6px", right: "6px", width: "20px", height: "20px",
                        borderRadius: "50%", background: T.green[500], display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Check size={12} style={{ color: T.white }} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "6px 8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: T.navy[800] }}>{photo.description}</div>
                    <div style={{ fontSize: "10px", color: T.neutral[500] }}>{fmtDateShort(photo.date)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Weekly View Component (Read-only) ───────────────────────
function WeeklyView({ state, dispatch }) {
  const weekly = state.viewingWeekly;
  const project = getActiveProject(state);

  if (!weekly) return null;

  const ListDisplay = ({ label, items }) => (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: T.navy[600], marginBottom: "6px" }}>{label}</div>
      {(items || []).filter(Boolean).length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          {items.filter(Boolean).map((item, i) => (
            <li key={i} style={{ fontSize: "13px", color: T.navy[700], marginBottom: "4px" }}>{item}</li>
          ))}
        </ul>
      ) : (
        <span style={{ fontSize: "13px", color: T.neutral[400] }}>None</span>
      )}
    </div>
  );

  const FieldDisplay = ({ label, value }) => (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: T.navy[600], marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "13px", color: value ? T.navy[700] : T.neutral[400] }}>{value || "None"}</div>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: "900px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <Btn variant="ghost" icon={ArrowLeft} onClick={() => dispatch({ type: "SET_VIEW", view: "dashboard" })} style={{ marginBottom: "8px" }}>Back</Btn>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: T.navy[800], letterSpacing: "-0.02em" }}>Weekly Report</h2>
          <p style={{ fontSize: "13px", color: T.neutral[500] }}>Week ending {fmtDateShort(weekly.weekEnding)} &middot; {project.jobName}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Btn variant="secondary" icon={Edit3} onClick={() => dispatch({ type: "SET_EDITING_WEEKLY", data: weekly })}>Edit</Btn>
          <Btn variant="navy" icon={FileDown} onClick={() => exportWeeklyPDF(weekly, project)}>Export PDF</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card>
          <ListDisplay label="On-going / Completed Work" items={weekly.ongoingCompleted} />
        </Card>
        <Card>
          <ListDisplay label="Look Ahead Schedule" items={weekly.lookAhead} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card><FieldDisplay label="Outstanding RFI's" value={weekly.outstandingRFIs} /></Card>
        <Card><FieldDisplay label="Hot Submittals" value={weekly.hotSubmittals} /></Card>
        <Card><FieldDisplay label="Safety" value={weekly.safety} /></Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Card><FieldDisplay label="Important Dates" value={weekly.importantDates} /></Card>
        <Card><FieldDisplay label="Owner Delivery Dates" value={weekly.ownerDeliveryDates} /></Card>
        <Card><FieldDisplay label="Outstanding Items – Owner" value={weekly.outstandingOwnerItems} /></Card>
        <Card><FieldDisplay label="Upcoming Inspections" value={weekly.upcomingInspections} /></Card>
        <Card><FieldDisplay label="Hindrances" value={weekly.hindrances} /></Card>
        <Card><FieldDisplay label="Next OAC Meeting" value={fmtDateShort(weekly.nextOACMeeting)} /></Card>
      </div>

      {(weekly.selectedPhotos || []).filter(p => p.selected !== false).length > 0 && (
        <Card>
          <SectionTitle icon={Camera}>Progress Photos</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
            {weekly.selectedPhotos.filter(p => p.selected !== false).map((photo, i) => (
              <div key={photo.id || i} style={{ border: `1px solid ${T.neutral[200]}`, borderRadius: T.radius.md, overflow: "hidden" }}>
                {photo.url ? (
                  <img src={photo.url} alt={photo.description} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "120px", background: T.neutral[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Camera size={24} style={{ color: T.neutral[300] }} />
                  </div>
                )}
                <div style={{ padding: "8px", fontSize: "12px", color: T.navy[700] }}>{photo.description}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Photo Gallery Component ─────────────────────────────────
function PhotoGallery({ state, dispatch }) {
  const allPhotos = state.dailyReports.flatMap(r =>
    (r.photos || []).map(p => ({ ...p, date: r.date, reportId: r.id }))
  );

  return (
    <div className="fade-in" style={{ maxWidth: "960px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: T.navy[800], letterSpacing: "-0.02em" }}>Photo Gallery</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <Btn variant="secondary" icon={Filter} size="sm">Filter</Btn>
        </div>
      </div>

      {allPhotos.length === 0 ? (
        <EmptyState icon={Image} title="No photos yet"
          description="Photos added to daily reports will appear here. Start by adding photos to a daily entry."
          action={<Btn icon={Plus} onClick={() => dispatch({ type: "NEW_DAILY" })}>New Daily with Photos</Btn>}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {allPhotos.map((photo, i) => (
            <Card key={i} padding="0" style={{ overflow: "hidden" }}>
              <div style={{
                height: "160px", background: `linear-gradient(135deg, ${T.neutral[200]}, ${T.neutral[100]})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Camera size={40} style={{ color: T.neutral[300] }} />
              </div>
              <div style={{ padding: "12px 16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: T.navy[800] }}>{photo.description}</div>
                <div style={{ fontSize: "12px", color: T.neutral[500], marginTop: "2px" }}>{fmtDate(photo.date)}</div>
                <div style={{ marginTop: "8px" }}>
                  <button onClick={() => {}} style={{
                    padding: "4px 10px", borderRadius: T.radius.sm, fontSize: "11px", fontWeight: 600,
                    border: `1px solid ${photo.includeInWeekly ? T.green[500] : T.neutral[300]}`,
                    background: photo.includeInWeekly ? T.green[100] : "transparent",
                    color: photo.includeInWeekly ? T.green[500] : T.neutral[400],
                    cursor: "pointer",
                  }}>
                    {photo.includeInWeekly ? "In Weekly" : "Add to Weekly"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP WITH SUPABASE PERSISTENCE
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [saving, setSaving] = useState(false);
  const loadedRef = useRef(false);
  const prevProjectsRef = useRef(null);
  const prevDailiesRef = useRef(null);
  const prevWeekliesRef = useRef(null);

  // Load data from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const [projects, dailyReports, weeklyReports] = await Promise.all([
          loadProjects(),
          loadDailyReports(),
          loadWeeklyReports(),
        ]);
        dispatch({ type: "LOAD_DATA", projects, dailyReports, weeklyReports });
        loadedRef.current = true;
      } catch (err) {
        console.error("Failed to load data:", err);
        dispatch({ type: "SET_LOADING", loading: false });
        loadedRef.current = true;
      }
    })();
  }, []);

  // Watch for project changes and save
  useEffect(() => {
    if (!loadedRef.current || state.loading) return;
    if (prevProjectsRef.current !== null) {
      state.projects.forEach(p => {
        const prev = prevProjectsRef.current?.find(pp => pp.id === p.id);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(p)) {
          saveProject(p).catch(err => console.error("Failed to save project:", err));
        }
      });
    }
    prevProjectsRef.current = state.projects;
  }, [state.projects, state.loading]);

  // Watch for daily report changes and save
  useEffect(() => {
    if (!loadedRef.current || state.loading) return;
    if (prevDailiesRef.current !== null) {
      state.dailyReports.forEach(r => {
        const prev = prevDailiesRef.current?.find(pr => pr.id === r.id);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(r)) {
          saveDailyReport(r).catch(err => console.error("Failed to save daily report:", err));
        }
      });
    }
    prevDailiesRef.current = state.dailyReports;
  }, [state.dailyReports, state.loading]);

  // Watch for weekly report changes and save
  useEffect(() => {
    if (!loadedRef.current || state.loading) return;
    if (prevWeekliesRef.current !== null) {
      state.weeklyReports.forEach(r => {
        const prev = prevWeekliesRef.current?.find(pr => pr.id === r.id);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(r)) {
          saveWeeklyReport(r).catch(err => console.error("Failed to save weekly report:", err));
        }
      });
    }
    prevWeekliesRef.current = state.weeklyReports;
  }, [state.weeklyReports, state.loading]);

  // Handle project deletion
  useEffect(() => {
    if (!loadedRef.current || !prevProjectsRef.current) return;
    const deleted = prevProjectsRef.current.filter(p => !state.projects.find(sp => sp.id === p.id));
    deleted.forEach(p => {
      deleteProject(p.id).catch(err => console.error("Failed to delete project:", err));
    });
  }, [state.projects]);

  // Handle daily deletion
  useEffect(() => {
    if (!loadedRef.current || !prevDailiesRef.current) return;
    const deleted = prevDailiesRef.current.filter(r => !state.dailyReports.find(sr => sr.id === r.id));
    deleted.forEach(r => {
      deleteDailyReport(r.id).catch(err => console.error("Failed to delete daily report:", err));
    });
  }, [state.dailyReports]);

  const renderView = () => {
    switch (state.currentView) {
      case "projects": return <ProjectsList state={state} dispatch={dispatch} />;
      case "dashboard": return <Dashboard state={state} dispatch={dispatch} />;
      case "projectSetup": return <ProjectSetup state={state} dispatch={dispatch} />;
      case "dailyEntry": return <DailyEntry state={state} dispatch={dispatch} />;
      case "dailyView": return <DailyView state={state} dispatch={dispatch} />;
      case "weeklyGen": return <WeeklyGenerator state={state} dispatch={dispatch} />;
      case "weeklyView": return <WeeklyView state={state} dispatch={dispatch} />;
      case "photos": return <PhotoGallery state={state} dispatch={dispatch} />;
      default: return <Dashboard state={state} dispatch={dispatch} />;
    }
  };

  return (
    <ErrorBoundary>
      <style>{globalCSS}</style>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div style={{ minHeight: "100vh", background: T.neutral[50] }}>
        {state.loading && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: T.white, display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
          role="status"
          aria-label="Loading application"
          >
            <div style={{ textAlign: "center" }}>
              <Loader2 size={48} style={{ color: T.orange[500], margin: "0 auto 16px", animation: "spin 1s linear infinite" }} aria-hidden="true" />
              <p style={{ fontSize: "16px", color: T.navy[700], fontWeight: 600 }}>Loading projects...</p>
            </div>
          </div>
        )}
        <Sidebar currentView={state.currentView} dispatch={dispatch} projects={state.projects} activeProjectId={state.activeProjectId} />
        <MobileNav currentView={state.currentView} dispatch={dispatch} projects={state.projects} activeProjectId={state.activeProjectId} />
        <main id="main-content" className="main-content" style={{ marginLeft: "220px", padding: "32px", minHeight: "100vh" }} role="main">
          {renderView()}
        </main>
      </div>
    </ErrorBoundary>
  );
}
