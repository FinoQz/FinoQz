import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface UserExportRow {
  fullName: string;
  email: string;
  mobile?: string | null;
  status: string;
  registrationDate: string | Date;
  lastLogin: string | Date;
}

export const exportToExcel = async (data: UserExportRow[], fileName: string) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Users");
  sheet.columns = [
    { header: "Name", key: "fullName", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "mobile", width: 15 },
    { header: "Status", key: "status", width: 12 },
    { header: "Registered", key: "registrationDate", width: 20 },
    { header: "Last Login", key: "lastLogin", width: 20 },
  ];
  data.forEach((row) => sheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${fileName}.xlsx`; a.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = <T extends object>(data: T[], fileName: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${fileName}.json`; a.click();
};

export const exportToPDF = (data: UserExportRow[], fileName: string) => {
  const doc = new jsPDF();
  const tableColumn = ["Name", "Email", "Phone", "Status", "Registered", "Last Login"];
  const fmt = (v: string | Date) => v instanceof Date ? v.toLocaleString() : v;
  const tableRows = data.map((u) => [u.fullName, u.email, u.mobile || "N/A", u.status, fmt(u.registrationDate), fmt(u.lastLogin)]);
  autoTable(doc, { head: [tableColumn], body: tableRows, styles: { fontSize: 8 } });
  doc.save(`${fileName}.pdf`);
};

export interface SuggestionExportRow {
  name: string; email: string; category: string; priority: string;
  suggestion: string; status: string; date: string | Date;
}

export const exportSuggestionsToExcel = async (data: SuggestionExportRow[], fileName: string) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Suggestions");
  sheet.columns = [
    { header: "Name", key: "name", width: 20 }, { header: "Email", key: "email", width: 30 },
    { header: "Category", key: "category", width: 20 }, { header: "Priority", key: "priority", width: 15 },
    { header: "Suggestion", key: "suggestion", width: 50 }, { header: "Status", key: "status", width: 15 },
    { header: "Date", key: "date", width: 20 },
  ];
  data.forEach((row) => sheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${fileName}.xlsx`; a.click();
  URL.revokeObjectURL(url);
};

export const exportSuggestionsToPDF = (data: SuggestionExportRow[], fileName: string) => {
  const doc = new jsPDF();
  const tableColumn = ["Name", "Email", "Category", "Priority", "Suggestion", "Status", "Date"];
  const fmt = (v: string | Date) => { if (v instanceof Date) return v.toLocaleDateString(); if (typeof v === 'string') return new Date(v).toLocaleDateString(); return String(v); };
  const tableRows = data.map((s) => [s.name, s.email || "N/A", s.category, s.priority, s.suggestion, s.status, fmt(s.date)]);
  autoTable(doc, { head: [tableColumn], body: tableRows, styles: { fontSize: 7, overflow: 'linebreak' }, columnStyles: { 4: { cellWidth: 50 } } });
  doc.save(`${fileName}.pdf`);
};

// ─── Quiz Participant Export ──────────────────────────────────────────────────

export interface ParticipantExportRow {
  name: string; email: string; phone: string;
  enrolledAt: string; startedAt: string; submittedAt: string;
  timeTaken: string; attemptStatus: string; paymentStatus: string;
  score: string; totalScore: string; totalMarks: string;
  correctCount: number; incorrectCount: number; totalQuestions: number;
}

export const exportParticipantsToExcel = async (data: ParticipantExportRow[], quizTitle: string) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Participants");
  sheet.columns = [
    { header: "Name", key: "name", width: 25 }, { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 15 }, { header: "Enrolled At", key: "enrolledAt", width: 22 },
    { header: "Started At", key: "startedAt", width: 22 }, { header: "Submitted At", key: "submittedAt", width: 22 },
    { header: "Time Taken", key: "timeTaken", width: 14 }, { header: "Attempt Status", key: "attemptStatus", width: 16 },
    { header: "Payment Status", key: "paymentStatus", width: 16 }, { header: "Score %", key: "score", width: 12 },
    { header: "Marks", key: "totalScore", width: 10 }, { header: "Total Marks", key: "totalMarks", width: 12 },
    { header: "Correct", key: "correctCount", width: 10 }, { header: "Incorrect", key: "incorrectCount", width: 10 },
    { header: "Total Qs", key: "totalQuestions", width: 10 },
  ];
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF253A7B' } };
  data.forEach((row) => sheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${quizTitle.replace(/\s+/g, '_')}_participants.xlsx`; a.click();
  URL.revokeObjectURL(url);
};

export const exportParticipantsToPDF = (data: ParticipantExportRow[], quizTitle: string) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14); doc.text(`Participants — ${quizTitle}`, 14, 15);
  doc.setFontSize(9); doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [["Name", "Email", "Phone", "Started", "Submitted", "Time", "Status", "Payment", "Score%", "✓", "✗"]],
    body: data.map(r => [r.name, r.email, r.phone, r.startedAt, r.submittedAt, r.timeTaken, r.attemptStatus, r.paymentStatus, r.score, r.correctCount, r.incorrectCount]),
    styles: { fontSize: 7, overflow: 'linebreak' },
    headStyles: { fillColor: [37, 58, 123], textColor: 255, fontStyle: 'bold' },
  });
  doc.save(`${quizTitle.replace(/\s+/g, '_')}_participants.pdf`);
};

// ─── Leaderboard Export ───────────────────────────────────────────────────────

export interface LeaderboardExportRow {
  rank: number; name: string; email: string;
  avgPercentage: number; totalScore: number;
  totalAttempts: number; certificatesEarned: number;
}

export const exportLeaderboardToExcel = async (data: LeaderboardExportRow[], quizTitle: string) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leaderboard");
  sheet.columns = [
    { header: "Rank", key: "rank", width: 8 }, { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 }, { header: "Avg Score %", key: "avgPercentage", width: 14 },
    { header: "Total Score", key: "totalScore", width: 14 }, { header: "Attempts", key: "totalAttempts", width: 12 },
    { header: "Certificates", key: "certificatesEarned", width: 14 },
  ];
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF253A7B' } };
  data.forEach(row => sheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${quizTitle.replace(/\s+/g, '_')}_leaderboard.xlsx`; a.click();
  URL.revokeObjectURL(url);
};

export const exportLeaderboardToPDF = (data: LeaderboardExportRow[], quizTitle: string) => {
  const doc = new jsPDF();
  doc.setFontSize(14); doc.text(`Leaderboard — ${quizTitle}`, 14, 15);
  doc.setFontSize(9); doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [["Rank", "Name", "Email", "Avg Score%", "Total Score", "Attempts", "Certificates"]],
    body: data.map(r => [r.rank, r.name, r.email, `${r.avgPercentage?.toFixed(1)}%`, r.totalScore, r.totalAttempts, r.certificatesEarned]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 58, 123], textColor: 255, fontStyle: 'bold' },
  });
  doc.save(`${quizTitle.replace(/\s+/g, '_')}_leaderboard.pdf`);
};
