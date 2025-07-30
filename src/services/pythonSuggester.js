// src/services/pythonSuggester.js
export async function suggestActionsFromPython(emails) {
  const res = await fetch('http://localhost:5000/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails })
  });
  return await res.json();
}
