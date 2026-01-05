'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Download, 
  FileText, 
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import TransactionDetailModal from '../components/payments/TransactionDetailModal';
import ManualRefundModal from '../components/payments/ManualRefundModal';
import GenerateReportModal, { ReportConfig } from '../components/payments/GenerateReportModal';
import RequestPayoutModal from '../components/payments/RequestPayoutModal';
import Toast from '../components/Toast';

type Transaction = {
  id: string;
  userId: string;
  userName: string;
  email: string;
  amount: number;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  method: string;
  date: string;
  quizId: string;
  quizTitle: string;
  gatewayTxnId: string;
  gatewayResponse: string;
  refundHistory?: {
    date: string;
    amount: number;
    reason: string;
    adminUser: string;
  }[];
};

export default function PaymentsRevenue() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [dateRange, setDateRange] = useState('7');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTxns, setSelectedTxns] = useState<string[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Dummy data
  const kpiData = {
    totalRevenue: 2847650,
    totalTransactions: 1243,
    successfulPayments: 1156,
    pendingFailedPayments: 87
  };

  const transactions = [
    {
      id: 'TXN001234567',
      userId: 'USR001',
      userName: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      amount: 2499,
      status: 'success' as const,
      method: 'Razorpay - UPI',
      date: '2024-11-28 14:32',
      quizId: 'QZ001',
      quizTitle: 'Financial Management Basics',
      gatewayTxnId: 'pay_MNoPqRsT123456',
      gatewayResponse: '{"status": "captured", "method": "upi"}',
    },
    {
      id: 'TXN001234566',
      userId: 'USR002',
      userName: 'Priya Patel',
      email: 'priya.patel@example.com',
      amount: 1999,
      status: 'pending' as const,
      method: 'Stripe - Card',
      date: '2024-11-28 13:15',
      quizId: 'QZ002',
      quizTitle: 'Advanced Accounting Quiz',
      gatewayTxnId: 'pi_3AbCdEfGh123456',
      gatewayResponse: '{"status": "processing"}',
    },
    {
      id: 'TXN001234565',
      userId: 'USR003',
      userName: 'Amit Kumar',
      email: 'amit.k@example.com',
      amount: 3499,
      status: 'failed' as const,
      method: 'Razorpay - Card',
      date: '2024-11-28 12:45',
      quizId: 'QZ003',
      quizTitle: 'Stock Market Analysis',
      gatewayTxnId: 'pay_XyZaBcDeF789012',
      gatewayResponse: '{"error": "card_declined", "message": "Insufficient funds"}',
    },
    {
      id: 'TXN001234564',
      userId: 'USR004',
      userName: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      amount: 1499,
      status: 'refunded' as const,
      method: 'Razorpay - UPI',
      date: '2024-11-27 18:20',
      quizId: 'QZ001',
      quizTitle: 'Financial Management Basics',
      gatewayTxnId: 'pay_QwErTyUiOp12345',
      gatewayResponse: '{"status": "refunded"}',
      refundHistory: [{
        date: '2024-11-28 10:00',
        amount: 1499,
        reason: 'Customer requested refund - duplicate purchase',
        adminUser: 'Admin User'
      }]
    },
    {
      id: 'TXN001234563',
      userId: 'USR005',
      userName: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      amount: 2999,
      status: 'success' as const,
      method: 'PhonePe - UPI',
      date: '2024-11-27 16:30',
      quizId: 'QZ004',
      quizTitle: 'Taxation Essentials',
      gatewayTxnId: 'pay_AsD fGhJkL67890',
      gatewayResponse: '{"status": "captured", "method": "upi"}',
    },
  ];

  const revenueBreakdown = [
    { method: 'Razorpay - UPI', percentage: 45, amount: 1281442 },
    { method: 'Razorpay - Card', percentage: 30, amount: 854295 },
    { method: 'Stripe', percentage: 20, amount: 569530 },
    { method: 'PhonePe', percentage: 5, amount: 142383 },
  ];

  const handleViewDetails = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setShowDetailModal(true);
  };

  const handleRefund = (txnId: string, reason: string) => {
    // In production, make API call here
    setToast({ type: 'success', message: `Refund processed successfully for transaction ${txnId}` });
    setShowDetailModal(false);
    // Update transaction status in state (for demo)
    // In production, refetch from API
  };

  const handleManualRefund = (txnId: string, amount: number, reason: string) => {
    // In production, make API call here
    setToast({ 
      type: 'success', 
      message: `Manual refund of ₹${amount.toLocaleString()} processed for ${txnId}` 
    });
  };

  const handleGenerateReport = (config: ReportConfig) => {
    // In production, make API call to generate report
    console.log('Generating report with config:', config);
    
    const reportTypeName = 
      config.reportType === 'summary' ? 'Revenue Summary' :
      config.reportType === 'detailed' ? 'Detailed Transactions' :
      config.reportType === 'refunds' ? 'Refunds Report' :
      config.reportType === 'gateway' ? 'Gateway Analysis' : 'User Payment History';
    
    setToast({ 
      type: 'success', 
      message: `${reportTypeName} is being generated...` 
    });

    // Generate report data
    setTimeout(() => {
      generateAndDownloadReport(config, reportTypeName);
      setToast({ type: 'success', message: 'Report downloaded successfully!' });
    }, 1500);
  };

  const generateAndDownloadReport = (config: ReportConfig, reportName: string) => {
    let content = '';
    
    if (config.format === 'csv') {
      // Generate CSV content
      content = generateCSVReport(config);
      downloadFile(content, `${reportName}_${config.dateFrom}_to_${config.dateTo}.csv`, 'text/csv');
    } else if (config.format === 'excel') {
      // Generate Excel-compatible CSV
      content = generateCSVReport(config);
      downloadFile(content, `${reportName}_${config.dateFrom}_to_${config.dateTo}.csv`, 'text/csv');
    } else {
      // Generate PDF (HTML preview for now)
      content = generatePDFReport(config, reportName);
      downloadFile(content, `${reportName}_${config.dateFrom}_to_${config.dateTo}.html`, 'text/html');
    }
  };

  const generateCSVReport = (config: ReportConfig) => {
    let csv = '';
    
    if (config.reportType === 'summary') {
      csv = 'Revenue Summary Report\n';
      csv += `Generated: ${new Date().toLocaleString()}\n`;
      csv += `Period: ${config.dateFrom} to ${config.dateTo}\n\n`;
      csv += 'Metric,Value\n';
      csv += `Total Revenue,₹${kpiData.totalRevenue.toLocaleString()}\n`;
      csv += `Total Transactions,${kpiData.totalTransactions}\n`;
      csv += `Successful Payments,${kpiData.successfulPayments}\n`;
      csv += `Failed Payments,${kpiData.pendingFailedPayments}\n\n`;
      csv += 'Payment Method,Percentage,Amount\n';
      revenueBreakdown.forEach(item => {
        csv += `${item.method},${item.percentage}%,₹${item.amount.toLocaleString()}\n`;
      });
    } else if (config.reportType === 'detailed') {
      csv = 'Transaction ID,User,Email,Amount,Status,Method,Date,Quiz\n';
      transactions.forEach(txn => {
        if (!config.includeFailedTxns && txn.status === 'failed') return;
        if (!config.includeRefunds && txn.status === 'refunded') return;
        csv += `${txn.id},"${txn.userName}",${txn.email},₹${txn.amount},${txn.status},${txn.method},${txn.date},"${txn.quizTitle}"\n`;
      });
    } else if (config.reportType === 'refunds') {
      csv = 'Transaction ID,User,Amount,Refund Date,Reason,Processed By\n';
      transactions.filter(t => t.status === 'refunded').forEach(txn => {
        const refund = txn.refundHistory?.[0];
        if (refund) {
          csv += `${txn.id},"${txn.userName}",₹${refund.amount},${refund.date},"${refund.reason}",${refund.adminUser}\n`;
        }
      });
    } else if (config.reportType === 'gateway') {
      csv = 'Payment Method,Transaction Count,Total Amount,Success Rate\n';
      revenueBreakdown.forEach(item => {
        const txnCount = Math.floor(item.percentage * 12);
        csv += `${item.method},${txnCount},₹${item.amount.toLocaleString()},${Math.floor(90 + Math.random() * 10)}%\n`;
      });
    } else {
      csv = 'User ID,User Name,Email,Total Spent,Transaction Count,Last Payment\n';
      transactions.slice(0, 5).forEach(txn => {
        csv += `${txn.userId},"${txn.userName}",${txn.email},₹${txn.amount},1,${txn.date}\n`;
      });
    }
    
    return csv;
  };

  const generatePDFReport = (config: ReportConfig, reportName: string) => {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${reportName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #253A7B; padding-bottom: 20px; }
    .header h1 { color: #253A7B; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 5px 0; }
    .section { margin: 30px 0; }
    .section h2 { color: #253A7B; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #253A7B; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    tr:hover { background: #f9fafb; }
    .summary-card { display: inline-block; padding: 15px 25px; margin: 10px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #253A7B; }
    .summary-card h3 { margin: 0; color: #253A7B; font-size: 24px; }
    .summary-card p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
    .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${reportName}</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    <p>Period: ${config.dateFrom} to ${config.dateTo}</p>
    <p>Grouped by: ${config.groupBy.charAt(0).toUpperCase() + config.groupBy.slice(1)}</p>
  </div>
`;

    if (config.reportType === 'summary') {
      html += `
  <div class="section">
    <h2>Revenue Overview</h2>
    <div class="summary-card">
      <h3>₹${kpiData.totalRevenue.toLocaleString()}</h3>
      <p>Total Revenue</p>
    </div>
    <div class="summary-card">
      <h3>${kpiData.totalTransactions}</h3>
      <p>Total Transactions</p>
    </div>
    <div class="summary-card">
      <h3>${kpiData.successfulPayments}</h3>
      <p>Successful Payments</p>
    </div>
    <div class="summary-card">
      <h3>${kpiData.pendingFailedPayments}</h3>
      <p>Failed/Pending</p>
    </div>
  </div>
  
  <div class="section">
    <h2>Payment Method Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Payment Method</th>
          <th>Percentage</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${revenueBreakdown.map(item => `
        <tr>
          <td>${item.method}</td>
          <td>${item.percentage}%</td>
          <td>₹${item.amount.toLocaleString()}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
    } else if (config.reportType === 'detailed') {
      html += `
  <div class="section">
    <h2>Detailed Transaction Records</h2>
    <table>
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>User</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Method</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.filter(txn => {
          if (!config.includeFailedTxns && txn.status === 'failed') return false;
          if (!config.includeRefunds && txn.status === 'refunded') return false;
          return true;
        }).map(txn => `
        <tr>
          <td>${txn.id}</td>
          <td>${txn.userName}<br><small style="color: #666;">${txn.email}</small></td>
          <td>₹${txn.amount.toLocaleString()}</td>
          <td><span style="padding: 4px 8px; border-radius: 4px; background: ${
            txn.status === 'success' ? '#dcfce7; color: #166534' :
            txn.status === 'pending' ? '#fef3c7; color: #854d0e' :
            txn.status === 'failed' ? '#fee2e2; color: #991b1b' :
            '#f3f4f6; color: #374151'
          };">${txn.status}</span></td>
          <td>${txn.method}</td>
          <td>${txn.date}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
    }

    html += `
  <div class="footer">
    <p>This is a system-generated report from FinoQz Payment Management System</p>
    <p>For support, contact: support@finoqz.com</p>
  </div>
</body>
</html>`;

    return html;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const toggleSelectTxn = (id: string) => {
    setSelectedTxns(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedTxns(prev =>
      prev.length === transactions.length ? [] : transactions.map(t => t.id)
    );
  };

  const handleExportCSV = () => {
    const csv = generateQuickCSV();
    const today = new Date().toISOString().split('T')[0];
    downloadFile(csv, `Transactions_Export_${today}.csv`, 'text/csv');
    setToast({ type: 'success', message: 'Transaction data exported successfully!' });
  };

  const generateQuickCSV = () => {
    let csv = 'Transaction ID,User Name,Email,Amount,Status,Payment Method,Date,Quiz Title,Gateway Txn ID\n';
    
    const txnsToExport = selectedTxns.length > 0 
      ? transactions.filter(t => selectedTxns.includes(t.id))
      : transactions;
    
    txnsToExport.forEach(txn => {
      csv += `${txn.id},"${txn.userName}",${txn.email},₹${txn.amount},${txn.status},"${txn.method}",${txn.date},"${txn.quizTitle}",${txn.gatewayTxnId}\n`;
    });
    
    return csv;
  };

  const handleRequestPayout = (amount: number, accountDetails: string) => {
    // In production, make API call to process payout request
    console.log('Payout request:', { amount, accountDetails });
    setToast({ 
      type: 'success', 
      message: `Payout request of ₹${amount.toLocaleString()} submitted successfully! You'll receive confirmation within 2-3 business days.` 
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments & Revenue</h1>
            <p className="text-gray-600 mt-1">Manage transactions, refunds, and revenue reports</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
            <button
              onClick={() => setShowRefundModal(true)}
              className="px-4 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Manual Refund
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">₹{kpiData.totalRevenue.toLocaleString()}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{kpiData.totalTransactions.toLocaleString()}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Transactions</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{kpiData.successfulPayments.toLocaleString()}</h3>
            <p className="text-sm text-gray-600 mt-1">Successful Payments</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{kpiData.pendingFailedPayments.toLocaleString()}</h3>
            <p className="text-sm text-gray-600 mt-1">Pending / Failed</p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transactions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent text-sm bg-white"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent text-sm bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent text-sm bg-white"
                  >
                    <option value="all">All Methods</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="stripe">Stripe</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {selectedTxns.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-3">
                  <span className="text-sm text-gray-600">{selectedTxns.length} selected</span>
                  <button className="text-sm text-[#253A7B] hover:underline font-medium">
                    Export Selected
                  </button>
                  <button className="text-sm text-red-600 hover:underline font-medium">
                    Bulk Refund
                  </button>
                </div>
              )}
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedTxns.length === transactions.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Txn ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedTxns.includes(txn.id)}
                            onChange={() => toggleSelectTxn(txn.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-gray-900">{txn.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{txn.userName}</p>
                            <p className="text-xs text-gray-600">{txn.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">₹{txn.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            txn.status === 'success' ? 'bg-green-100 text-green-700' :
                            txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            txn.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{txn.method}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600">{txn.date}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewDetails(txn)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t-2 border-gray-200 px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">Showing 1-5 of 1,243 transactions</p>
                <div className="flex items-center gap-2">
                  <button className="p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 bg-[#253A7B] text-white rounded-lg font-medium text-sm">1</button>
                  <button className="px-3 py-1.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-sm">2</button>
                  <button className="px-3 py-1.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-sm">3</button>
                  <button className="p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Revenue Summary */}
          <div className="space-y-4">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
                <select className="text-xs border border-gray-200 rounded-lg px-2 py-1">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <div className="h-32 flex items-end justify-between gap-1">
                {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                  <div key={i} className="flex-1 bg-[#253A7B] rounded-t-lg opacity-80 hover:opacity-100 transition" style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-600">Daily revenue over selected period</p>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                {revenueBreakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.method}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#253A7B]" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">₹{item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Transaction</span>
                  <span className="text-sm font-semibold text-gray-900">₹2,291</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Refund Rate</span>
                  <span className="text-sm font-semibold text-red-600">3.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Net Revenue</span>
                  <span className="text-sm font-semibold text-green-600">₹2,761,344</span>
                </div>
              </div>
            </div>

            {/* Payouts */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Settlement Status</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Payout</span>
                  <span className="font-medium text-gray-900">Nov 25, 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-green-600">₹450,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">Completed</span>
                </div>
              </div>
              <button
                onClick={() => setShowPayoutModal(true)}
                className="w-full px-4 py-2 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium text-sm"
              >
                Request Payout
              </button>
            </div>

            {/* Permissions Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-yellow-800">
                <span className="font-semibold">Finance Role Required:</span> Only users with Finance role can process refunds and view sensitive data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransactionDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        transaction={selectedTransaction}
        onRefund={handleRefund}
      />

      <ManualRefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onSubmit={handleManualRefund}
      />

      <GenerateReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={handleGenerateReport}
      />

      <RequestPayoutModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSubmit={handleRequestPayout}
        availableBalance={2761344}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
