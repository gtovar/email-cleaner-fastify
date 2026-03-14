// src/services/actionExecutor.js
export async function executeGmailAction(emailId) {
    // En producción llamaría a gmail.users.messages.modify
    // Por ahora esto es un stub que simula Gmail API:
    return { simulated: true, emailId, action: 'ARCHIVE' };
}

export async function executeInboxAction(emailId, action) {
    // En producción llamaría a gmail.users.messages.modify / trash según la acción.
    // Por ahora esto es un stub explícito para el flujo dedicado de Inbox.
    return {
      simulated: true,
      emailId,
      action,
      source: 'inbox'
    };
}
