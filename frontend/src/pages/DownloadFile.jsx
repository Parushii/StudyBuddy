import React, { useState } from "react";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const DownloadFile = ({ notes, quillRef }) => {
  const [downloadFormat, setDownloadFormat] = useState('html');

  const downloadNotes = () => {
    if (!notes || notes.trim() === '') {
      alert('No content to download!');
      return;
    }

    switch (downloadFormat) {
      case 'html':
        downloadHTML();
        break;
      case 'text':
        downloadText();
        break;
      case 'pdf':
        downloadPDF();
        break;
      case 'word':
        downloadWord();
        break;
      default:
        downloadHTML();
    }
  };

  const downloadHTML = () => {
    const content = notes;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.html';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const downloadText = () => {
    const content = notes.replace(/<[^>]*>/g, '');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.txt';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const downloadPDF = () => {
    const editor = quillRef.current.getEditor();
    const content = editor.root.innerHTML;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    tempDiv.style.padding = '20px';
    tempDiv.style.fontSize = '14px';
    
    document.body.appendChild(tempDiv);
    
    html2canvas(tempDiv).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('notes.pdf');
      document.body.removeChild(tempDiv);
    });
  };

  const downloadWord = () => {
    const content = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>Notes</title>
        </head>
        <body>
          ${notes}
        </body>
      </html>
    `;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.doc';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <>
      <select 
        value={downloadFormat}
        onChange={(e) => setDownloadFormat(e.target.value)}
        style={{ padding: "5px", marginRight: "10px", borderRadius: "3px", border: "1px solid #ccc" }}
      >
        <option value="html">HTML</option>
        <option value="text">Text</option>
        <option value="pdf">PDF</option>
        <option value="word">Word</option>
      </select>
      <button 
        onClick={downloadNotes}
        style={{ padding: "5px 10px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "3px" }}
      >
        Download
      </button>
    </>
  );
};

export default DownloadFile;