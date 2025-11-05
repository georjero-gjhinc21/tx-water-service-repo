import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateWaterServiceRequestPDF(request: any) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Water Service Request Form', 105, 20, { align: 'center' });

  // Request ID and Status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Request ID: ${request.id}`, 14, 30);
  doc.text(`Status: ${request.status?.toUpperCase() || 'N/A'}`, 14, 36);
  doc.text(`Submitted: ${new Date(request.created_at).toLocaleDateString()}`, 14, 42);

  let yPosition = 52;

  // Section 1: Contact Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Contact Information', 14, yPosition);
  yPosition += 8;

  const contactData = [
    ['Applicant Name', request.applicant_name || 'N/A'],
    ['Email', request.applicant_email || 'N/A'],
    ['Phone', request.applicant_phone || 'N/A'],
    ['Alternate Phone', request.applicant_alternate_phone || 'N/A'],
    ['Work Phone', request.applicant_work_phone || 'N/A'],
    ['Bill Preference', request.bill_type_preference || 'N/A'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: contactData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Section 2: Service Address
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Service Address', 14, yPosition);
  yPosition += 8;

  const addressData = [
    ['Service Address', request.service_address || 'N/A'],
    ['City', request.service_city || 'N/A'],
    ['State', request.service_state || 'N/A'],
    ['Postal Code', request.service_postal_code || 'N/A'],
    ['Mailing Same as Service', request.mailing_address_same_as_service ? 'Yes' : 'No'],
  ];

  if (!request.mailing_address_same_as_service) {
    addressData.push(
      ['Mailing Address', request.mailing_address || 'N/A'],
      ['Mailing City', request.mailing_city || 'N/A'],
      ['Mailing State', request.mailing_state || 'N/A'],
      ['Mailing Postal Code', request.mailing_postal_code || 'N/A']
    );
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: addressData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Section 3: Service Dates
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Service Dates', 14, yPosition);
  yPosition += 8;

  const datesData = [
    ['Service Start Date', request.service_start_date ? new Date(request.service_start_date).toLocaleDateString() : 'N/A'],
    ['Service Stop Date', request.service_stop_date ? new Date(request.service_stop_date).toLocaleDateString() : 'N/A'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: datesData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Section 4: Property Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Property Information', 14, yPosition);
  yPosition += 8;

  const propertyData = [
    ['Property Use Type', request.property_use_type || 'N/A'],
    ['Service Territory', request.service_territory || 'N/A'],
    ['Trash Carts Needed', request.trash_carts_needed?.toString() || 'N/A'],
    ['Recycle Carts Needed', request.recycle_carts_needed?.toString() || 'N/A'],
    ['Has Sprinkler System', request.has_sprinkler_system ? 'Yes' : 'No'],
    ['Has Pool', request.has_pool ? 'Yes' : 'No'],
  ];

  if (request.property_use_type === 'rent') {
    propertyData.push(
      ['Landlord Name', request.landlord_name || 'N/A'],
      ['Landlord Phone', request.landlord_phone || 'N/A']
    );
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: propertyData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Section 5: Identity Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Identity Information', 14, yPosition);
  yPosition += 8;

  const identityData = [
    ['Driver\'s License Number', request.applicant_drivers_license_number || 'N/A'],
    ['DL State', request.applicant_drivers_license_state || 'N/A'],
    ['Date of Birth', request.applicant_date_of_birth ? new Date(request.applicant_date_of_birth).toLocaleDateString() : 'N/A'],
    ['SSN (Last 4)', request.applicant_ssn_last4 ? `***-**-${request.applicant_ssn_last4}` : 'N/A'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: identityData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Section 6: Co-Applicant (if exists)
  if (request.has_co_applicant) {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('6. Co-Applicant Information', 14, yPosition);
    yPosition += 8;

    const coApplicantData = [
      ['Name', request.co_applicant_name || 'N/A'],
      ['Email', request.co_applicant_email || 'N/A'],
      ['Phone', request.co_applicant_phone || 'N/A'],
      ['Alternate Phone', request.co_applicant_alternate_phone || 'N/A'],
      ['Work Phone', request.co_applicant_work_phone || 'N/A'],
      ['Driver\'s License', request.co_applicant_drivers_license_number || 'N/A'],
      ['DL State', request.co_applicant_drivers_license_state || 'N/A'],
      ['Date of Birth', request.co_applicant_date_of_birth ? new Date(request.co_applicant_date_of_birth).toLocaleDateString() : 'N/A'],
      ['SSN (Last 4)', request.co_applicant_ssn_last4 ? `***-**-${request.co_applicant_ssn_last4}` : 'N/A'],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Field', 'Value']],
      body: coApplicantData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need a new page for documents section
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  // Section 7: Documents
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('7. Documents', 14, yPosition);
  yPosition += 8;

  const documentsData = [
    ['Lease Document', request.lease_document_original_name || 'Not uploaded'],
    ['Lease Uploaded', request.lease_document_uploaded_at ? new Date(request.lease_document_uploaded_at).toLocaleDateString() : 'N/A'],
    ['Deed Document', request.deed_document_original_name || 'Not uploaded'],
    ['Deed Uploaded', request.deed_document_uploaded_at ? new Date(request.deed_document_uploaded_at).toLocaleDateString() : 'N/A'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: documentsData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Section 8: Financial Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('8. Financial Information', 14, yPosition);
  yPosition += 8;

  const financialData = [
    ['Deposit Amount', request.deposit_amount_required ? `$${request.deposit_amount_required.toFixed(2)}` : 'N/A'],
    ['Deposit Paid', request.deposit_paid ? 'Yes' : 'No'],
    ['Deposit Payment Date', request.deposit_payment_date ? new Date(request.deposit_payment_date).toLocaleDateString() : 'N/A'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: financialData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }

  return doc;
}
