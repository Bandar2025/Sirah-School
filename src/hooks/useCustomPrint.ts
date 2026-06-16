import { RefObject } from 'react';

export function useCustomPrint(ref: RefObject<HTMLElement | null>) {
  return () => {
    const element = ref.current;
    if (!element) return;

    // Create a temporary hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-1000';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write('<!DOCTYPE html><html><head><title>طباعة</title>');

    // Copy all style tags and link tags from the main document to the print iframe
    const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleElements.forEach((el) => {
      doc.write(el.outerHTML);
    });

    // Add extra custom print CSS for RTL, Cairo font fallback, and element-specific stylings
    doc.write(`
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        
        body {
          direction: rtl;
          text-align: right;
          font-family: 'Cairo', 'Inter', sans-serif !important;
          background-color: transparent !important;
          color: #1e293b !important;
          padding: 1rem !important;
          margin: 0 !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box;
        }
        
        /* Remove shadows and adapt borders for clean physical ink printing */
        .shadow-sm, .shadow-md, .shadow-lg, .shadow-2xl {
          box-shadow: none !important;
          border: 1px solid #e2e8f0 !important;
        }
        
        /* Custom layouts for components in print output */
        #school-id-card-element {
          width: 320px !important;
          height: 200px !important;
          border-radius: 12px !important;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%) !important;
          color: white !important;
          padding: 1.25rem !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          box-shadow: none !important;
          border: none !important;
          page-break-inside: avoid;
          margin: 20px auto !important;
        }

        #official-money-receipt {
          width: 100% !important;
          max-width: 450px !important;
          margin: 20px auto !important;
          border: 1px dashed #94a3b8 !important;
          padding: 1.5rem !important;
          border-radius: 8px !important;
          page-break-inside: avoid;
        }

        #official-report-certificate {
          width: 100% !important;
          border: 4px double #1e293b !important;
          padding: 2.5rem !important;
          border-radius: 12px !important;
          background: white !important;
        }

        /* Ensure tables extend and have crisp printed borders */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        th, td {
          border: 1px solid #cbd5e1 !important;
          padding: 8px !important;
        }

        /* Avoid breaking rows across pages */
        tr {
          page-break-inside: avoid !important;
        }

        /* Official PDF Mode styling overrides */
        .pdf-official-mode {
          border: 5px double #000000 !important;
          box-shadow: none !important;
          background: #ffffff !important;
          color: #000000 !important;
          padding: 2.5rem !important;
        }
        
        .pdf-official-mode table {
          width: 100% !important;
          margin-top: 1.5rem !important;
          margin-bottom: 1.5rem !important;
          border: 2px solid #000000 !important;
        }

        .pdf-official-mode th {
          background-color: #0f172a !important;
          color: #ffffff !important;
          border: 1px solid #000000 !important;
          font-weight: 800 !important;
          font-size: 11px !important;
          padding: 8px 6px !important;
          text-align: center !important;
        }
        
        .pdf-official-mode th:first-child, 
        .pdf-official-mode td:first-child {
          text-align: right !important;
        }

        .pdf-official-mode td {
          border: 1px solid #000000 !important;
          color: #000000 !important;
          font-size: 10px !important;
          padding: 6px 4px !important;
          background-color: #ffffff !important;
          font-weight: 600 !important;
        }

        .pdf-official-mode tr:nth-child(even) td {
          background-color: #f1f5f9 !important;
        }

        /* Convert any color coded text/metrics to dark high contrast colors */
        .pdf-official-mode .text-emerald-700,
        .pdf-official-mode .text-emerald-800,
        .pdf-official-mode .text-indigo-700,
        .pdf-official-mode .text-indigo-800,
        .pdf-official-mode .text-blue-700,
        .pdf-official-mode .text-rose-750,
        .pdf-official-mode .text-rose-700,
        .pdf-official-mode .text-rose-600,
        .pdf-official-mode .text-amber-700 {
          color: #000000 !important;
          font-weight: 800 !important;
        }

        .pdf-official-mode .bg-indigo-50,
        .pdf-official-mode .bg-indigo-50\/50,
        .pdf-official-mode .bg-emerald-50,
        .pdf-official-mode .bg-amber-50,
        .pdf-official-mode .bg-slate-50,
        .pdf-official-mode .bg-slate-100 {
          background-color: #f8fafc !important;
          color: #000000 !important;
          border-color: #000000 !important;
        }

        /* Hide all lists, dynamic dropdown selectors, action buttons and widgets */
        .pdf-official-mode .no-print,
        .pdf-official-mode .interactive-only,
        .pdf-official-mode button,
        .pdf-official-mode select,
        .pdf-official-mode input,
        .pdf-official-mode .menu-container {
          display: none !important;
        }

        /* Styled Official stamp for printing compatibility */
        .pdf-official-mode .official-stamp,
        .pdf-official-mode div[className*="rounded-full border-dashed"] {
          border: 3px dashed #0284c7 !important;
          background-color: #f0f9ff !important;
          color: #0369a1 !important;
          box-shadow: none !important;
        }
        
        @page {
          size: auto;
          margin: 12mm 15mm 12mm 15mm;
        }
      </style>
    `);

    doc.write('</head><body>');
    doc.write('<div class="print-content">' + element.innerHTML + '</div>');
    doc.write('</body></html>');
    doc.close();

    // Trigger print after iframe content and dynamic styles load
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 400);
    };
  };
}
