const logEntries = [];

export function logDelivery(entry) {
  const record = {
    emailId: entry.emailId,
    channel: entry.channel,
    status: entry.status,
    reason: entry.reason || null,
    providerMessageId: entry.providerMessageId || null,
    sentAt: new Date().toISOString(),
    summary: {
      sender: entry.sender,
      amount: entry.amount,
      due_date: entry.due_date,
    },
  };
  logEntries.push(record);
  return record;
}

export function getDeliveries() {
  return logEntries.slice();
}
