async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value;
    if (!message.trim()) return;
  
    const chatBody = document.getElementById('chat-body');
    chatBody.innerHTML += `<div class='user-msg'>You: ${message}</div>`;
    input.value = '';
  
    const res = await fetch('/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    chatBody.innerHTML += `<div class='bot-msg'>Bot: ${data.reply}</div>`;
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  