import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateOfferLetterPdf(data: {
  candidateName: string;
  role: string;
  salary: number;
  joiningDate: Date;
  location: string;
  benefits?: string | null;
  companyName: string;
}): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { candidateName, role, salary, joiningDate, location, benefits, companyName } = data;

  const yStart = 750;
  
  // Header
  page.drawText(`${companyName} - Offer of Employment`, { x: 50, y: yStart, size: 24, font: boldFont, color: rgb(0, 0, 0.5) });
  
  page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: yStart - 40, size: 12, font });
  page.drawText(`Dear ${candidateName},`, { x: 50, y: yStart - 70, size: 14, font: boldFont });
  
  const bodyText = `We are thrilled to offer you the position of ${role} at ${companyName}.
We believe your skills and experience are an excellent match for our company.

Please find the details of your offer below:

- Position: ${role}
- Base Salary: $${salary.toLocaleString()} per year
- Work Location: ${location}
- Anticipated Start Date: ${new Date(joiningDate).toLocaleDateString()}
`;
  
  page.drawText(bodyText, {
    x: 50,
    y: yStart - 100,
    size: 12,
    font,
    lineHeight: 16
  });

  if (benefits) {
    page.drawText(`Additional Benefits:\n${benefits}`, {
      x: 50,
      y: yStart - 220,
      size: 12,
      font,
      lineHeight: 16
    });
  }

  page.drawText('Please sign or accept this offer via the candidate portal to acknowledge your agreement.', {
    x: 50,
    y: 150,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3)
  });

  page.drawText('Sincerely,\nThe Hiring Team', {
    x: 50,
    y: 100,
    size: 12,
    font,
    lineHeight: 16
  });

  const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
  return pdfBytes;
}
