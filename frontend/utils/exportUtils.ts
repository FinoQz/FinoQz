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
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.xlsx`;
  a.click();
};

export const exportToJSON = <T extends object>(data: T[], fileName: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.json`;
  a.click();
};

export const exportToPDF = (data: UserExportRow[], fileName: string) => {
  const doc = new jsPDF();

  const tableColumn = [
    "Name",
    "Email",
    "Phone",
    "Status",
    "Registered",
    "Last Login",
  ];

  const formatDate = (value: string | Date): string => {
    if (value instanceof Date) return value.toLocaleString();
    return value;
  };

  const tableRows = data.map((u) => [
    u.fullName,
    u.email,
    u.mobile || "N/A",
    u.status,
    formatDate(u.registrationDate),
    formatDate(u.lastLogin),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 8 },
  });

  doc.save(`${fileName}.pdf`);
};
export interface SuggestionExportRow {
  name: string;
  email: string;
  category: string;
  priority: string;
  suggestion: string;
  status: string;
  date: string | Date;
}

export const exportSuggestionsToExcel = async (data: SuggestionExportRow[], fileName: string) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Suggestions");

  sheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Email", key: "email", width: 30 },
    { header: "Category", key: "category", width: 20 },
    { header: "Priority", key: "priority", width: 15 },
    { header: "Suggestion", key: "suggestion", width: 50 },
    { header: "Status", key: "status", width: 15 },
    { header: "Date", key: "date", width: 20 },
  ];

  data.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.xlsx`;
  a.click();
};

export const exportSuggestionsToPDF = (data: SuggestionExportRow[], fileName: string) => {
  const doc = new jsPDF();

  const tableColumn = [
    "Name",
    "Email",
    "Category",
    "Priority",
    "Suggestion",
    "Status",
    "Date",
  ];

  const formatDate = (value: string | Date): string => {
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'string') return new Date(value).toLocaleDateString();
    return value;
  };

  const tableRows = data.map((s) => [
    s.name,
    s.email || "N/A",
    s.category,
    s.priority,
    s.suggestion,
    s.status,
    formatDate(s.date),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 7, overflow: 'linebreak' },
    columnStyles: { 4: { cellWidth: 50 } } // Content column
  });

  doc.save(`${fileName}.pdf`);
};
