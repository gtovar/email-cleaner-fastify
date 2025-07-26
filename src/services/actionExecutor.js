// src/services/actionExecutor.js
export async function executeGmailAction(emailId) {
    // En producción llamaría a gmail.users.messages.modify
    // Por ahora esto es un stub que simula Gmail API:
    return { simulated: true, emailId, action: 'ARCHIVE' };
}

