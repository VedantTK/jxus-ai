document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatContainer = document.getElementById('chatContainer');
    const messagesWrapper = document.getElementById('messagesWrapper');
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    // History & Sidebar Elements
    const historyList = document.getElementById('historyList');
    const newChatBtn = document.getElementById('newChatBtn');

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    // Sidebar & Settings
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const suggestionChips = document.querySelectorAll('.chip');

    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');

    // State Variables
    let chats = JSON.parse(localStorage.getItem('nexus_chats')) || [];
    let currentChatId = null;

    // Initialization
    renderHistoryList();

    // ------------------------------------
    // New Chat & History Logic
    // ------------------------------------

    function createNewChat() {
        currentChatId = Date.now().toString();
        
        // Add new empty chat to state
        chats.unshift({
            id: currentChatId,
            title: 'New Chat',
            messages: []
        });
        
        saveChats();
        renderHistoryList();
        
        // Clear UI
        messagesWrapper.innerHTML = '';
        welcomeScreen.style.display = 'flex';
        
        // Close sidebar on mobile
        if(window.innerWidth <= 768) {
            closeSidebar();
        }
    }

    newChatBtn.addEventListener('click', createNewChat);

    function loadChat(chatId) {
        currentChatId = chatId;
        const chat = chats.find(c => c.id === chatId);
        
        if (!chat) return;
        
        renderHistoryList(); // updates active state
        
        // Render UI
        messagesWrapper.innerHTML = '';
        if (chat.messages.length > 0) {
            welcomeScreen.style.display = 'none';
            chat.messages.forEach(msg => {
                addMessage(msg.text, msg.type, false);
            });
            scrollToBottom();
        } else {
            welcomeScreen.style.display = 'flex';
        }

        // Close sidebar on mobile
        if(window.innerWidth <= 768) {
            closeSidebar();
        }
    }

    function saveChats() {
        localStorage.setItem('nexus_chats', JSON.stringify(chats));
    }

    function renderHistoryList() {
        // Clear except label
        historyList.innerHTML = '<p class="history-label">Recent</p>';
        
        chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'history-item';
            if (chat.id === currentChatId) item.classList.add('active');
            
            // Icon
            const icon = document.createElement('i');
            icon.className = 'fa-regular fa-message';
            
            // Text
            const textSpan = document.createElement('span');
            textSpan.className = 'truncate';
            textSpan.textContent = chat.title || 'New Chat';
            
            // Delete Btn
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-chat-btn';
            delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            delBtn.title = 'Delete Chat';
            
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent triggering loadChat
                deleteChat(chat.id);
            });

            item.appendChild(icon);
            item.appendChild(textSpan);
            item.appendChild(delBtn);
            
            item.addEventListener('click', () => {
                loadChat(chat.id);
            });

            historyList.appendChild(item);
        });
    }

    function deleteChat(chatId) {
        // Remove from array
        chats = chats.filter(c => c.id !== chatId);
        saveChats();
        
        // If we deleted the active chat, clear UI
        if (currentChatId === chatId) {
            currentChatId = null;
            messagesWrapper.innerHTML = '';
            welcomeScreen.style.display = 'flex';
        }
        
        renderHistoryList();
    }

    function updateChatHistory(text, type) {
        if (!currentChatId) {
            // Automatically start a new chat if user just typed with no active chat selected
            currentChatId = Date.now().toString();
            chats.unshift({
                id: currentChatId,
                title: text.substring(0, 30) + (text.length > 30 ? '...' : ''), // Generate title from first message
                messages: []
            });
        }

        // Find the active chat and append
        const chat = chats.find(c => c.id === currentChatId);
        if (chat) {
            chat.messages.push({
                text: text,
                type: type,
                timestamp: Date.now()
            });

            // If it was the first message, update the title
            if (chat.messages.length === 1 && type === 'user') {
                 chat.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
            }
            saveChats();
            renderHistoryList();
        }
    }


    // ------------------------------------
    // Input Handling
    // ------------------------------------

    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        if (this.value.trim() === '') {
            sendBtn.disabled = true;
        } else {
            sendBtn.disabled = false;
        }
    });

    // Handle Enter to send (Shift+Enter for new line)
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const text = this.value.trim();
            if (text !== '') {
                this.value = '';
                this.style.height = 'auto';
                sendBtn.disabled = true;
                handleSendMessage(text);
            }
        }
    });

    // Click to send
    sendBtn.addEventListener('click', () => {
        const text = chatInput.value.trim();
        if (text !== '') {
            chatInput.value = '';
            chatInput.style.height = 'auto';
            sendBtn.disabled = true;
            handleSendMessage(text);
        }
    });


    // ------------------------------------
    // Settings & Sidebar Actions
    // ------------------------------------

    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });

    themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        
        if (newTheme === 'dark') {
            themeIcon.className = 'fa-regular fa-sun';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.className = 'fa-regular fa-moon';
            themeText.textContent = 'Dark Mode';
        }
    });

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    }

    openSidebarBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    });

    closeSidebarBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const text = chip.textContent;
            chatInput.value = '';
            chatInput.style.height = 'auto';
            sendBtn.disabled = true;
            handleSendMessage(text);
        });
    });

    // ------------------------------------
    // Messaging API flow
    // ------------------------------------

    async function handleSendMessage(text) {
        if (!text) return;

        // Hide welcome screen if present
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
        }

        // Add user message visually & to local storage
        addMessage(text, 'user');
        updateChatHistory(text, 'user');

        // Add loading indicator
        const loadingId = addLoadingMessage();
        
        // Scroll to bottom
        scrollToBottom();

        try {
            // Call Backend API
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                removeLoadingMessage(loadingId);
                const errText = "I'm sorry, there was a problem communicating with the server. Please ensure the backend endpoint is running.";
                addMessage(errText, 'ai');
                updateChatHistory(errText, 'ai');
                scrollToBottom();
                return;
            }

            const data = await response.json();
            
            removeLoadingMessage(loadingId);
            
            if (data && data.response) {
                addMessage(data.response, 'ai');
                updateChatHistory(data.response, 'ai');
            } else {
                const malformedText = "Received malformed response from server.";
                addMessage(malformedText, 'ai');
                updateChatHistory(malformedText, 'ai');
            }
        } catch (error) {
            removeLoadingMessage(loadingId);
            console.error("Fetch error:", error);
            const fallbackText = `Server error. Make sure the FastAPI backend and Ollama are working.`;
            addMessage(fallbackText, 'ai');
            updateChatHistory(fallbackText, 'ai');
        }
        
        scrollToBottom();
    }

    function addMessage(text, type, displayOnly = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.innerHTML = type === 'user' ? '<i class="fa-regular fa-user"></i>' : '<i class="fa-solid fa-sparkles"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;

        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(contentDiv);

        messagesWrapper.appendChild(msgDiv);
    }

    function addLoadingMessage() {
        const id = 'loading-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ai`;
        msgDiv.id = id;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.innerHTML = '<i class="fa-solid fa-sparkles"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const loaderDiv = document.createElement('div');
        loaderDiv.className = 'typing-indicator';
        loaderDiv.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;

        contentDiv.appendChild(loaderDiv);
        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(contentDiv);

        messagesWrapper.appendChild(msgDiv);
        return id;
    }

    function removeLoadingMessage(id) {
        const loader = document.getElementById(id);
        if (loader) {
            loader.remove();
        }
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
