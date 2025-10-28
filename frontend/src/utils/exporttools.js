export const handleExportToCSV = () => {
  // Prepare CSV data
  const headers = ['Name', 'Email', 'Phone', 'Booked On', 'Tokens Used'];
  const rows = bookingsWithUsers.map(booking => [
    booking.user?.name || 'Unknown',
    booking.user?.email || 'N/A',
    booking.user?.phone || 'N/A',
    new Date(booking.bookedAt).toLocaleString(),
    booking.tokensUsed
  ]);

  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${classData.title.replace(/[^a-z0-9]/gi, '_')}_bookings_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert(`Exported ${bookingsWithUsers.length} bookings to CSV!`);
};

 export const handleSendEmailToAll = () => {
  if (bookingsWithUsers.length === 0) {
    alert('No participants to email.');
    return;
  }

  // Get all participant emails
  const emails = bookingsWithUsers
    .map(booking => booking.user?.email)
    .filter(email => email && email !== 'N/A')
    .join(',');

  if (emails.length === 0) {
    alert('No valid email addresses found.');
    return;
  }

  // Create email subject and body
  const subject = encodeURIComponent(`Important Update: ${classData.title}`);
  const body = encodeURIComponent(
    `Dear Participant,\n\n` +
    `This is regarding the class "${classData.title}" scheduled for:\n` +
    `Date: ${formatDate(classData.date)}\n` +
    `Time: ${formatTime(classData.time)}\n` +
    `Location: ${classData.location}\n\n` +
    `[Add your message here]\n\n` +
    `Best regards,\nYour Class Team`
  );

  // Open default email client with BCC (blind carbon copy)
  // Note: Using BCC to protect privacy - all emails hidden from each other
  window.location.href = `mailto:?bcc=${emails}&subject=${subject}&body=${body}`;
  
  alert(`Opening email client to send to ${bookingsWithUsers.length} participants.\n\nNote: All emails will be BCC'd to protect privacy.`);
};