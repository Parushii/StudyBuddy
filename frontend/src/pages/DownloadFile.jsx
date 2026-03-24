import React from "react";
import jsPDF from "jspdf";

const DownloadFile = ({ content, title }) => {

  // 🔥 Convert raw text → structured sections
  const parseContent = () => {
    const sections = [];
    const blocks = content.split("\n\n");

    blocks.forEach(block => {
      const lines = block.trim().split("\n");
      if (lines.length > 0) {
        sections.push({
          heading: lines[0],
          body: lines.slice(1).join(" ")
        });
      }
    });

    return sections;
  };

  // 📄 PDF (Styled with bold headings)
  const downloadPDF = () => {
    const pdf = new jsPDF();
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    let y = 20;

    // Title
    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text(title || "Notes", margin, y);
    y += 10;

    const sections = parseContent();

    sections.forEach(section => {
      // Heading
      pdf.setFontSize(13);
      pdf.setFont(undefined, "bold");

      const headingLines = pdf.splitTextToSize(section.heading, maxWidth);
      headingLines.forEach(line => {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, margin, y);
        y += 7;
      });

      // Body
      pdf.setFontSize(11);
      pdf.setFont(undefined, "normal");

      const bodyLines = pdf.splitTextToSize(section.body, maxWidth);
      bodyLines.forEach(line => {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, margin, y);
        y += 6;
      });

      y += 5; // spacing between sections
    });

    pdf.save(`${title || "notes"}.pdf`);
  };

  // 🌐 HTML (bold headings)
  const downloadHTML = () => {
    const sections = parseContent();

    let htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
        </head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>${title || "Notes"}</h1>
    `;

    sections.forEach(section => {
      htmlContent += `
        <h3>${section.heading}</h3>
        <p>${section.body.replace(/\n/g, "<br/>")}</p>
      `;
    });

    htmlContent += `</body></html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title || "notes"}.html`;
    link.click();
  };

  // 📝 TXT (simple)
  const downloadText = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title || "notes"}.txt`;
    link.click();
  };

  // 📘 Word (bold headings)
  const downloadWord = () => {
    const sections = parseContent();

    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
        </head>
        <body>
          <h1>${title || "Notes"}</h1>
    `;

    sections.forEach(section => {
      htmlContent += `
        <h3><b>${section.heading}</b></h3>
        <p>${section.body.replace(/\n/g, "<br/>")}</p>
      `;
    });

    htmlContent += `</body></html>`;

    const blob = new Blob(["\ufeff", htmlContent], {
      type: "application/msword",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title || "notes"}.doc`;
    link.click();
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={downloadPDF} className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-[rgba(80,50,20,0.55)] border border-amber-200/20 text-amber-100 hover:bg-[rgba(120,80,30,0.7)] transition-all text-sm">
        PDF
      </button>
      <button onClick={downloadWord} className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-[rgba(80,50,20,0.55)] border border-amber-200/20 text-amber-100 hover:bg-[rgba(120,80,30,0.7)] transition-all text-sm">
        Word
      </button>
      <button onClick={downloadHTML} className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-[rgba(80,50,20,0.55)] border border-amber-200/20 text-amber-100 hover:bg-[rgba(120,80,30,0.7)] transition-all text-sm">
        HTML
      </button>
      <button onClick={downloadText}className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-[rgba(80,50,20,0.55)] border border-amber-200/20 text-amber-100 hover:bg-[rgba(120,80,30,0.7)] transition-all text-sm">
        TXT
      </button>
    </div>
  );
};

export default DownloadFile;