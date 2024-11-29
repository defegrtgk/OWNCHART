const OPENAI_API_KEY = "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";

let conversations = []; 
let currentConversation = []; 
let currentHistoryId = 0; 

async function fetchChatGPTResponse(message) {
    const endpoint = "https://api.openai.com/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    };
  
    const body = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
  
    try {
      const response = await fetch(endpoint, { method: "POST", headers, body });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API Error:", errorData);
        throw new Error(`API Error: ${errorData.error.message}`);
      }
  
      const data = await response.json();
      return data.choices[0].message.content;
  
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
      return "Sorry, there was an issue connecting to ChatGPT.";
    }
  }
  

function displayConversation(conversation) {
  const responseArea = document.getElementById("responseArea");
  responseArea.innerHTML = ""; 

  conversation.forEach((messageObj) => {
    const div = document.createElement("div");
    div.classList.add("message", messageObj.sender === "You" ? "user" : "chatgpt");
    div.textContent = messageObj.message;

    responseArea.appendChild(div);
  });
}

function updateHistory(conversationId) {
  const history = document.getElementById("history");

  let existingItem = document.querySelector(`li[data-conversation-id="${conversationId}"]`);
  if (existingItem) return;

  const historyItem = document.createElement("li");
  historyItem.textContent = `Conversation ${conversationId}`;
  historyItem.dataset.conversationId = conversationId;

  historyItem.addEventListener("click", () => {
    document.querySelectorAll(".sidebar li").forEach((item) => {
      item.classList.remove("active");
    });
    historyItem.classList.add("active");

    const conversation = conversations[conversationId - 1];
    displayConversation(conversation);
  });

  history.appendChild(historyItem);
}

document.getElementById("userInput").addEventListener("keypress", async function (e) {
  if (e.key === "Enter") {
    await sendMessage();
  }
});
document.getElementById("sendButton").addEventListener("click", async function () {
  await sendMessage();
});

async function sendMessage() {
  const inputField = document.getElementById("userInput");
  const userMessage = inputField.value.trim();

  if (userMessage) {
    if (currentConversation.length === 0) {
      currentHistoryId = conversations.length + 1; 
      updateHistory(currentHistoryId);
    }

    // Add user message to the current conversation
    currentConversation.push({ sender: "You", message: userMessage });

    // Fetch ChatGPT response
    const chatGPTResponse = await fetchChatGPTResponse(userMessage);

    // Add ChatGPT response to the current conversation
    currentConversation.push({ sender: "ChatGPT", message: chatGPTResponse });

    // Display the updated conversation
    displayConversation(currentConversation);

    // Clear input
    inputField.value = "";
  }
}

// Event listener for "New" button
document.getElementById("newConversationButton").addEventListener("click", function () {
  if (currentConversation.length > 0) {
    // Save the current conversation to history
    conversations.push(currentConversation);
  }

  // Start a new conversation
  currentConversation = [];

  // Clear the response area
  document.getElementById("responseArea").innerHTML =
    '<p class="center-text">What can I help with?</p>';

  // Clear active history highlight
  document.querySelectorAll(".sidebar li").forEach((item) => {
    item.classList.remove("active");
  });
});
function saveHistoryToCookies() {
    const serializedHistory = JSON.stringify(conversations);
    setCookie('chatHistory', serializedHistory, 7); // Store it for 7 days
  }

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/`;
  }
  
  function getCookie(name) {
    const cookieArr = document.cookie.split("; ");
    for (let i = 0; i < cookieArr.length; i++) {
      const cookie = cookieArr[i];
      const [cookieName, cookieValue] = cookie.split("=");
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }
  
  function deleteCookie(name) {
    document.cookie = `${name}=; path=/;`;  // Only delete the cookie without setting an expiration date
  }
  
  // Load the conversation history from cookies when the page is loaded
  window.onload = () => {
    loadHistoryFromCookies();
  };
  