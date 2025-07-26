// src/services/notificationsService.js
import { actionHistoryService } from './actionHistoryService.js';
import { executeGmailAction } from './actionExecutor.js';

export const notificationsService = (models) => ({
  async getSummary(/* userId */) {
    return [
      {
        id: "test1",
        from: "noti@demo.com",
        subject: "¡Prueba HU4!",
        date: new Date().toISOString(),
        isRead: false,
        category: "demo",
        attachmentSizeMb: 0.1,
        suggestions: ["archive"]
      }
    ];
  },

  async confirmActions({ ids, action, userId }) {
    const results = [];
    const historyService = actionHistoryService(models); // ✅ inicialización correcta

    for (const emailId of ids) {
      let gmailResult = null;

      if (action === 'accept') {
        gmailResult = await executeGmailAction(emailId);
      }

      const history = {
        userId,
        emailId,
        action,
        timestamp: new Date().toISOString(),
        details: {
          gmailResponse: gmailResult,
          note: action === 'accept' ? 'Ejecutado' : 'Ignorado'
        }
      };

      await historyService.record(history);
      results.push(history);
    }

    return {
      success: true,
      processed: results.length,
      data: results
    };
  }
});
