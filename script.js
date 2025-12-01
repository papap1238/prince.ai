const GEMINI_API_KEY = "AIzaSyBVgGiZz8DEdHhWO9z5qWm8eMd8JAMLadI"; 
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Hanya jalankan logika chat jika elemen-elemen ini ada
if (chatHistory && userInput && sendButton) {
    
    const MODEL_NAME = 'gemini-2.5-flash'; 
    let conversationHistory = []; 

    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        
        if (sender === 'bot') {
            const p = document.createElement('p');
            p.innerHTML = text.replace(/\n/g, '<br>'); 
            messageDiv.appendChild(p);
        } else {
            messageDiv.innerHTML = `<p>${text}</p>`;
        }

        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (userMessage === "") return;

        appendMessage(userMessage, 'user');
        userInput.value = ''; 
        sendButton.disabled = true; 

        conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });

        const loadingMessageDiv = document.createElement('div');
        loadingMessageDiv.classList.add('message', 'bot-message');
        loadingMessageDiv.innerHTML = '<p>Mengetik<span class="loading-indicator"></span></p>';
        chatHistory.appendChild(loadingMessageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: conversationHistory, 
                }),
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`);
            }

            const data = await response.json();
            
            chatHistory.removeChild(loadingMessageDiv);

            const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya gagal mendapatkan respons dari Gemini.";
            
            appendMessage(botResponse, 'bot');
            conversationHistory.push({ role: 'model', parts: [{ text: botResponse }] });

        } catch (error) {
            console.error("Kesalahan API Gemini:", error);
            chatHistory.removeChild(loadingMessageDiv); 
            appendMessage(`Terjadi kesalahan: ${error.message}. Cek konsol browser untuk detail.`, 'bot');
            conversationHistory.pop(); 
        } finally {
            sendButton.disabled = false; 
            userInput.focus(); 
        }
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !sendButton.disabled) {
            sendMessage();
        }
    });

}
