let currentChatId = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistoryList();
    document.getElementById('new-chat-btn').addEventListener('click', startNewChat);
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
});

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (!message) return;

    if (!currentChatId) {
        currentChatId = 'chat-' + Date.now();
    }

    displayMessage('user', message);
    userInput.value = '';
    
    // Save to history before sending to API
    saveToHistory(currentChatId, 'user', message);
    
    // Show loading indicator
    const loadingMsg = displayMessage('bot', 'Thinking...');
    const loadingIndicator = document.createElement('span');
    loadingIndicator.className = 'loading-indicator';
    loadingMsg.appendChild(loadingIndicator);
    
    fetch("chatbot.php", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: message})
    })
    .then(response => response.json())
    .then(data => {
        loadingMsg.remove();
        const botResponse = data.error ? `Error: ${data.error}` : data.response;
        displayMessage('bot', botResponse);
        saveToHistory(currentChatId, 'bot', botResponse);
    })
    .catch(error => {
        loadingMsg.remove();
        displayMessage('bot', 'Failed to get response');
        saveToHistory(currentChatId, 'bot', 'API request failed');
    });
}

function displayMessage(sender, content) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = content;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

function startNewChat() {
    currentChatId = 'chat-' + Date.now();
    document.getElementById('chat-box').innerHTML = '';
    document.getElementById('user-input').focus();
    loadChatHistoryList();
}

function clearCurrentChat() {
    if (!confirm('Clear the current chat?')) return;
    document.getElementById('chat-box').innerHTML = '';
}

// Updated saveToHistory function to ensure proper storage
function saveToHistory(chatId, sender, message) {
    let history = JSON.parse(localStorage.getItem('chatHistory')) || {};
    
    if (!history[chatId]) {
        history[chatId] = {
            id: chatId,
            title: 'Chat ' + new Date().toLocaleTimeString(),
            messages: [],
            lastUpdated: new Date().toISOString(),
            preview: ''
        };
    }
    
    history[chatId].messages.push({sender, message, timestamp: new Date().toISOString()});
    history[chatId].lastUpdated = new Date().toISOString();
    
    // Update preview with last 2 messages
    const lastMessages = history[chatId].messages.slice(-2);
    history[chatId].preview = lastMessages.map(m => 
        `${m.sender === 'user' ? 'You' : 'Bot'}: ${m.message.substring(0, 25)}${m.message.length > 25 ? '...' : ''}`
    ).join(' | ');
    
    localStorage.setItem('chatHistory', JSON.stringify(history));
    loadChatHistoryList();
}

// Enhanced loadChatHistoryList function
function loadChatHistoryList() {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || {};
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    if (Object.keys(history).length === 0) {
        historyList.innerHTML = '<div class="no-history">No previous chats</div>';
        return;
    }
    
    const sortedChats = Object.values(history).sort((a, b) => 
        new Date(b.lastUpdated) - new Date(a.lastUpdated));
    
    sortedChats.forEach(chat => {
        const item = document.createElement('div');
        item.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
        item.innerHTML = `
            <div class="history-title">
                <span>${chat.title}</span>
                <span class="history-time">${formatTime(chat.lastUpdated)}</span>
            </div>
            <div class="history-preview">${chat.preview || 'New chat'}</div>
        `;
        
        item.addEventListener('click', () => {
            currentChatId = chat.id;
            loadChat(chat.id);
        });
        
        historyList.appendChild(item);
    });
}

function loadChat(chatId) {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || {};
    const chat = history[chatId];
    const chatBox = document.getElementById('chat-box');
    
    chatBox.innerHTML = '';
    
    if (chat && chat.messages) {
        chat.messages.forEach(msg => {
            displayMessage(msg.sender, msg.message);
        });
    }
    
    // Update active state in history list
    loadChatHistoryList();
    document.getElementById('user-input').focus();
}

function formatTime(isoString) {
    return new Date(isoString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}