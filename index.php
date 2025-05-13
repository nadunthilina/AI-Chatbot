<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NW Chatbot</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="chat-container">
        <div id="sidebar">
            <div id="sidebar-header">
                <h1>NW Chatbot</h1>
                <button id="new-chat-btn">+ New Chat</button>
            </div>
            <div id="chat-history">
                <h3>Conversation History</h3>
                <div id="history-list"></div>
            </div>
        </div>
        <div id="main-chat">
            <div id="chat-box"></div>
            <div id="chat-controls">
                <input type="text" id="user-input" placeholder="Type your message..." autocomplete="off">
                <button id="send-btn" onclick="sendMessage()">Send</button>
                <button id="clear-btn" onclick="clearCurrentChat()">Clear</button>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>