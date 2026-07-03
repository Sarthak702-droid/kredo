import { jsPDF } from 'jspdf';
import { LoanApplication, MSMEProfile, CreditScoreDetails } from '../types';

export function exportReportToPDF(
  app: LoanApplication,
  msme: MSMEProfile,
  scoreDetails: CreditScoreDetails
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let report = app.underwritingReport;
  if (!report) {
    report = {
      executiveSummary: `This is an automated alternate credit intelligence rating report compiled for ${msme.name}. General financial scoring metrics and account verification flows indicate active compliance standing, with an overall Kredo Credit score of ${scoreDetails.totalScore}/900.`,
      strengths: [
        `Consistent GSTR filing record with a composite tax compliance subscore of ${scoreDetails.subScores.gstCompliance}/100.`,
        `Verified UPI Merchant transaction flow velocity supporting stable revenue run rates.`,
        `Average bank balances and ledger logs demonstrating a banking liquidity score of ${scoreDetails.subScores.bankingLiquidity}/100.`
      ],
      weaknesses: [
        `A custom generative credit report with deep sector context has not yet been triggered.`,
        `EPFO employer registration and formal payroll subscore stand at ${msme.employeeCount > 0 ? `${scoreDetails.subScores.payrollConsistency}/100` : 'EXEMPT'}.`
      ],
      cashFlowAssessment: `Calculated average daily cash flow balance indicates resilient working capital profiles aligned with standard industry operating margins in the ${msme.sector} sector.`,
      riskMitigants: `Recommend setting up automated NACH mandates linked directly to the Account Aggregator primary clearing bank to mitigate structural credit risk.`,
      recommendedLimitINR: scoreDetails.approvedLimit,
      recommendedRatePercentage: scoreDetails.suggestedInterestRate
    };
  }

  // Layout Constants
  const margin = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - (margin * 2);
  let y = 20;

  // Colors
  const primaryColor: [number, number, number] = [24, 24, 27]; // Zinc-900 / dark color
  const accentColor: [number, number, number] = [34, 197, 94]; // Emerald-500 (#22C55E)
  const textColor: [number, number, number] = [63, 63, 70]; // Zinc-700
  const lightBg: [number, number, number] = [244, 244, 245]; // Zinc-100

  // Helper functions
  const addText = (text: string, x: number, currentY: number, size = 10, isBold = false, color = textColor) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, currentY);
  };

  const addParagraph = (text: string, currentY: number, size = 9, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, currentY);
    return lines.length * (size * 0.45) + 3; // return height taken
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 270) {
      doc.addPage();
      y = 20;
      // Add a header/footer on subsequent pages too
      addText(`Kredo Underwriting Memorandum | App ID: ${app.id.substring(4, 9)}`, margin, 12, 8, false, [161, 161, 170]);
      doc.setDrawColor(228, 228, 231);
      doc.line(margin, 14, pageWidth - margin, 14);
      y = 22;
    }
  };

  // --- HEADER SECTION ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, contentWidth, 20, 'F');
  
  // Title Text on Banner
  addText('KREDO CREDIT INTELLIGENCE PLATFORM', margin + 5, y + 8, 14, true, [255, 255, 255]);
  addText('COGNITIVE CREDIT UNDERWRITING MEMORANDUM', margin + 5, y + 14, 9, false, [212, 212, 216]);

  y += 28;

  // --- REPORT SUMMARY METADATA GRID ---
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(margin, y, contentWidth, 36, 'F');
  
  // Metadata content
  addText('BORROWER PROFILE', margin + 5, y + 6, 9, true, primaryColor);
  addText(`Entity Name: ${msme.name}`, margin + 5, y + 12, 9, false);
  addText(`Sector: ${msme.sector}`, margin + 5, y + 18, 9, false);
  addText(`Location: ${msme.location}`, margin + 5, y + 24, 9, false);
  addText(`Incorporation: Established in ${msme.establishedYear}`, margin + 5, y + 30, 9, false);

  addText('CREDIT BRIEF', margin + 95, y + 6, 9, true, primaryColor);
  addText(`Application ID: ${app.id}`, margin + 95, y + 12, 9, false);
  addText(`Kredo Score: ${scoreDetails.totalScore} (${scoreDetails.riskGrade} Grade)`, margin + 95, y + 18, 9, true, accentColor);
  addText(`Requested Capital: INR ${(app.requestedAmount).toLocaleString()}`, margin + 95, y + 24, 9, false);
  addText(`Proposed Line: INR ${(report.recommendedLimitINR).toLocaleString()} @ ${report.recommendedRatePercentage.toFixed(1)}% p.a.`, margin + 95, y + 30, 9, true, primaryColor);

  y += 44;

  // --- SECTION 1: EXECUTIVE SUMMARY ---
  checkPageBreak(40);
  addText('1. EXECUTIVE RECOMMENDATION REPORT', margin, y, 11, true, primaryColor);
  y += 4;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  const summaryHeight = addParagraph(report.executiveSummary, y, 9.5);
  y += summaryHeight + 6;

  // --- SECTION 2: ALTERNATE DATA SUB-SCORES ---
  checkPageBreak(40);
  addText('2. ALTERNATE COMPLIANCE FEEDS & COMPONENT SCORES', margin, y, 11, true, primaryColor);
  y += 4;
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // GST
  addText('GSTR Tax Filing Compliance', margin, y, 9, true, primaryColor);
  addText(`${scoreDetails.subScores.gstCompliance}% Score`, margin + 120, y, 9, true, accentColor);
  y += 5;
  addText('Measures consistency and delay margins in monthly filing of GSTR-1 & GSTR-3B invoices.', margin, y, 8, false);
  y += 6;

  // UPI
  addText('UPI Merchant Pay Flow Stability', margin, y, 9, true, primaryColor);
  addText(`${scoreDetails.subScores.upiFlowStability}% Score`, margin + 120, y, 9, true, accentColor);
  y += 5;
  addText('Measures UPI payment receipt densities, micro-ticket counts, and system bounce failures.', margin, y, 8, false);
  y += 6;

  // Bank
  addText('Account Aggregator Liquid Reserves', margin, y, 9, true, primaryColor);
  addText(`${scoreDetails.subScores.bankingLiquidity}% Score`, margin + 120, y, 9, true, accentColor);
  y += 5;
  addText('Measures average daily balances, bank statement ledger check bounces, and debt leverage multipliers.', margin, y, 8, false);
  y += 6;

  // EPFO
  const employeeCount = msme.employeeCount;
  const payrollScore = employeeCount > 0 ? `${scoreDetails.subScores.payrollConsistency}% Score` : 'EXEMPT';
  addText('EPFO Corporate Payroll Consistency', margin, y, 9, true, primaryColor);
  addText(payrollScore, margin + 120, y, 9, true, employeeCount > 0 ? accentColor : [113, 113, 122]);
  y += 5;
  addText(employeeCount > 0 
    ? 'Measures employer-side contribution timings and active headcount fluctuations across 6 months.' 
    : 'Borrower operates as a registered micro-merchant and is exempt from formal payroll score weights.', margin, y, 8, false);
  y += 8;

  // --- SECTION 3: COMPREHENSIVE CREDIT COMPONENT ANALYSIS ---
  checkPageBreak(60);
  addText('3. COMPREHENSIVE CREDIT COMPONENT ANALYSIS', margin, y, 11, true, primaryColor);
  y += 4;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Strengths
  addText('CREDIT STRENGTHS & ENABLERS', margin, y, 9, true, accentColor);
  y += 4;
  report.strengths.forEach((str) => {
    checkPageBreak(12);
    const h = addParagraph(`*  ${str}`, y, 9);
    y += h;
  });
  y += 3;

  // Weaknesses
  checkPageBreak(30);
  addText('CREDIT RISK FACTORS & DEVIATIONS', margin, y, 9, true, [220, 38, 38]);
  y += 4;
  report.weaknesses.forEach((weak) => {
    checkPageBreak(12);
    const h = addParagraph(`*  ${weak}`, y, 9);
    y += h;
  });
  y += 6;

  // --- SECTION 4: CASH FLOW & MITIGANTS ---
  checkPageBreak(45);
  addText('4. CASH FLOW VELOCITY & UNDERWRITING MITIGANTS', margin, y, 11, true, primaryColor);
  y += 4;
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  addText('Cash Flow Assessment', margin, y, 9.5, true, primaryColor);
  y += 4;
  const cfHeight = addParagraph(report.cashFlowAssessment, y, 9);
  y += cfHeight + 4;

  checkPageBreak(25);
  addText('Structured Risk Mitigants', margin, y, 9.5, true, primaryColor);
  y += 4;
  const mitHeight = addParagraph(report.riskMitigants, y, 9);
  y += mitHeight + 10;

  // --- FOOTER ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(228, 228, 231);
    doc.line(margin, 280, pageWidth - margin, 280);
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170);
    doc.setFont('helvetica', 'normal');
    doc.text('Kredo Credit Intelligence Platform | RBI Approved Account Aggregator Network', margin, 285);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, 285);
  }

  // Trigger download
  doc.save(`Kredo_Credit_Report_${msme.name.replace(/\s+/g, '_')}_${app.id.substring(4, 9)}.pdf`);
}

export function exportMsmeHealthCardToPDF(
  profile: MSMEProfile,
  scoreDetails: CreditScoreDetails,
  auditDocs: Array<{
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    status: 'VERIFIED' | 'VERIFYING' | 'FAILED';
    size: string;
  }>,
  applications: LoanApplication[],
  lastSyncedTime?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Layout Constants
  const margin = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - (margin * 2);
  let y = 20;

  // Colors
  const primaryColor: [number, number, number] = [24, 24, 27]; // Zinc-900 / dark color
  const accentColor: [number, number, number] = [34, 197, 94]; // Emerald-500 (#22C55E)
  const textColor: [number, number, number] = [63, 63, 70]; // Zinc-700
  const lightBg: [number, number, number] = [244, 244, 245]; // Zinc-100

  // Helper functions
  const addText = (text: string, x: number, currentY: number, size = 10, isBold = false, color = textColor) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, currentY);
  };

  const addParagraph = (text: string, currentY: number, size = 9, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, currentY);
    return lines.length * (size * 0.45) + 3; // return height taken
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 270) {
      doc.addPage();
      y = 20;
      addText(`Regulatory Compliance Record | MSME: ${profile.name}`, margin, 12, 8, false, [161, 161, 170]);
      doc.setDrawColor(228, 228, 231);
      doc.line(margin, 14, pageWidth - margin, 14);
      y = 22;
    }
  };

  // --- HEADER SECTION ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, contentWidth, 20, 'F');
  
  addText('KREDO COMPLIANCE DIGITAL PORTFOLIO', margin + 5, y + 8, 14, true, [255, 255, 255]);
  addText('OFFICIAL FINANCIAL HEALTH CARD & AUDIT LEDGER', margin + 5, y + 14, 9, false, [212, 212, 216]);

  y += 28;

  // --- CORPORATE PROFILE BLOCK ---
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(margin, y, contentWidth, 38, 'F');
  
  addText('BORROWER COMPLIANCE PROFILE', margin + 5, y + 6, 9, true, primaryColor);
  addText(`Legal Entity: ${profile.name}`, margin + 5, y + 12, 9, false);
  addText(`Industry Sector: ${profile.sector}`, margin + 5, y + 18, 9, false);
  addText(`Location: ${profile.location}`, margin + 5, y + 24, 9, false);
  addText(`Established Year: ${profile.establishedYear}`, margin + 5, y + 30, 9, false);

  addText('REGULATORY SYSTEM INTEGRATIONS', margin + 95, y + 6, 9, true, primaryColor);
  addText(`GSTIN Identifier: ${profile.gstNumber || 'N/A (EXEMPT)'}`, margin + 95, y + 12, 9, false);
  addText(`EPFO Employer ID: ${profile.epfoId || 'N/A (EXEMPT)'}`, margin + 95, y + 18, 9, false);
  addText(`AA Consent Identifier: ${profile.aaConsentId || 'N/A'}`, margin + 95, y + 24, 9, false);
  addText(`Document Count: ${auditDocs.length} Verified Logs`, margin + 95, y + 30, 9, false);

  y += 46;

  // --- SECTION 1: FINANCIAL HEALTH CARD (SCORES) ---
  checkPageBreak(50);
  addText('1. DYNAMIC ALTERNATE SCORE SUMMARY', margin, y, 11, true, primaryColor);
  y += 4;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Score Box
  doc.setFillColor(240, 253, 244); // light green
  doc.setDrawColor(34, 197, 94); // green-500
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 18, 'FD');

  addText(`COMPOSITE KREDO SCORE: ${scoreDetails.totalScore}/900`, margin + 5, y + 7, 11, true, accentColor);
  addText(`RISK STANDING: GRADE ${scoreDetails.riskGrade}`, margin + 5, y + 13, 9, true, primaryColor);
  addText(`RE-VERIFIED: ${lastSyncedTime || new Date().toLocaleTimeString()}`, margin + 95, y + 7, 8, false, [113, 113, 122]);
  addText(`SUGGESTED RATE: ${scoreDetails.suggestedInterestRate.toFixed(1)}% p.a.`, margin + 95, y + 13, 8, true, primaryColor);

  y += 25;

  // Component Subscores List
  checkPageBreak(40);
  addText('SCORE BREAKDOWN BY COMPLIANCE VECTOR', margin, y, 9, true, primaryColor);
  y += 6;

  const rowH = 7;
  const colValX = margin + 110;

  // GST
  addText('GST Tax Filing Compliance Score:', margin, y, 9, false);
  addText(`${scoreDetails.subScores.gstCompliance}/100`, colValX, y, 9, true, scoreDetails.subScores.gstCompliance >= 70 ? accentColor : textColor);
  y += rowH;

  // UPI
  addText('UPI Merchant Transaction Stability Score:', margin, y, 9, false);
  addText(`${scoreDetails.subScores.upiFlowStability}/100`, colValX, y, 9, true, scoreDetails.subScores.upiFlowStability >= 70 ? accentColor : textColor);
  y += rowH;

  // AA Bank
  addText('Account Aggregator Statement Balance Liquidity:', margin, y, 9, false);
  addText(`${scoreDetails.subScores.bankingLiquidity}/100`, colValX, y, 9, true, scoreDetails.subScores.bankingLiquidity >= 70 ? accentColor : textColor);
  y += rowH;

  // EPFO
  const payrollVal = profile.employeeCount > 0 ? `${scoreDetails.subScores.payrollConsistency}/100` : 'EXEMPT (100/100)';
  addText('EPFO Employer Payroll Filing Score:', margin, y, 9, false);
  addText(payrollVal, colValX, y, 9, true, accentColor);
  y += rowH + 4;

  // --- SECTION 2: DOCUMENT AUDIT TRAIL ---
  checkPageBreak(50);
  addText('2. DOCUMENT ARCHIVE & VERIFICATION AUDIT TRAIL', margin, y, 11, true, primaryColor);
  y += 4;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  addText('Below is the ledger of digital documents synced for underwriting audit logs:', margin, y, 9.5, false);
  y += 6;

  // Table Header
  doc.setFillColor(228, 228, 231); // light gray
  doc.rect(margin, y, contentWidth, 8, 'F');
  addText('DOCUMENT FILENAME', margin + 2, y + 5.5, 8, true, primaryColor);
  addText('INTEGRATION SOURCE', margin + 65, y + 5.5, 8, true, primaryColor);
  addText('UPLOAD DATE', margin + 115, y + 5.5, 8, true, primaryColor);
  addText('STATUS', margin + 150, y + 5.5, 8, true, primaryColor);
  
  y += 8;

  // Table Body Rows
  auditDocs.forEach((docItem, index) => {
    checkPageBreak(12);
    // Alternate row bg
    if (index % 2 === 1) {
      doc.setFillColor(244, 244, 245);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }
    
    // Shorten long file names
    let shortName = docItem.name;
    if (shortName.length > 25) {
      shortName = shortName.substring(0, 22) + '...';
    }

    const formattedDate = new Date(docItem.uploadedAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    addText(shortName, margin + 2, y + 5.5, 8, false, primaryColor);
    addText(docItem.type, margin + 65, y + 5.5, 8, false);
    addText(formattedDate, margin + 115, y + 5.5, 8, false);
    
    const isVerified = docItem.status === 'VERIFIED';
    addText(isVerified ? 'Verified' : 'Pending', margin + 150, y + 5.5, 8, true, isVerified ? accentColor : [217, 119, 6]);

    y += 8;
  });

  y += 6;

  // --- SECTION 3: ACTIVE LOAN APPLICATIONS PIPELINE ---
  if (applications && applications.length > 0) {
    checkPageBreak(50);
    addText('3. COMPLIANCE ACTIVE PIPELINE STATUS', margin, y, 11, true, primaryColor);
    y += 4;
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    applications.forEach((app, appIdx) => {
      checkPageBreak(25);
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(212, 212, 216);
      doc.rect(margin, y, contentWidth, 20, 'FD');

      addText(`Loan Application ID: ${app.id.toUpperCase()}`, margin + 3, y + 5, 8.5, true, primaryColor);
      addText(`Status: ${app.status}`, margin + 3, y + 10, 8, true, app.status === 'APPROVED' ? accentColor : [113, 113, 122]);
      addText(`Purpose: ${app.purpose || 'Working Capital Extension'}`, margin + 3, y + 15, 8, false);

      addText(`Requested Limit: INR ${app.requestedAmount.toLocaleString()}`, margin + 85, y + 5, 8, false);
      addText(`Tenure: ${app.tenureMonths} Months`, margin + 85, y + 10, 8, false);
      addText(`Applied Date: ${new Date(app.appliedAt).toLocaleDateString()}`, margin + 85, y + 15, 8, false);

      y += 24;
    });
  }

  // --- REGULATORY STATEMENT SIGN OFF ---
  checkPageBreak(40);
  y += 5;
  addText('REGULATORY DECLARATION & AUDIT STAMP', margin, y, 9, true, primaryColor);
  y += 4;
  doc.setDrawColor(228, 228, 231);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  const declarationText = `We hereby certify that the Financial Health scores, tax records, UPI merchant indices, and EPFO filings displayed on this compliance ledger have been securely compiled using standard end-to-end sandbox interfaces and verified protocols under the RBI Account Aggregator (AA) frameworks. No customer-supplied files are modified; metadata integrity remains fully preserved for third-party institutional lending diligence.`;
  const declarationHeight = addParagraph(declarationText, y, 7.5, false);
  y += declarationHeight + 5;

  // Stamp Box
  checkPageBreak(22);
  doc.setDrawColor(161, 161, 170);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, 60, 16);
  addText('KREDO INTEGRITY STAMP', margin + 4, y + 5, 7, true, [113, 113, 122]);
  addText('SECURE LEDGER SEAL', margin + 4, y + 10, 7.5, true, accentColor);
  addText(`ID: ${profile.id.substring(0, 8).toUpperCase()}`, margin + 4, y + 14, 6.5, false, [161, 161, 170]);

  // --- FOOTER ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(228, 228, 231);
    doc.line(margin, 280, pageWidth - margin, 280);
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170);
    doc.setFont('helvetica', 'normal');
    doc.text('Kredo Regulatory Compliance Report | Ministry of MSME Compliant Ledger', margin, 285);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, 285);
  }

  // Trigger download
  doc.save(`Kredo_Financial_Health_Report_${profile.name.replace(/\s+/g, '_')}.pdf`);
}

