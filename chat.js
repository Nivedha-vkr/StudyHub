const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatArea = document.getElementById("chatArea");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const question = userInput.value.trim();
  if (!question) return;

  addMessage(question, "user");
  userInput.value = "";

  fetch("/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  })
    .then((res) => res.json())
    .then((data) => {
      addMessage(data.answer, "ai");
    })
    .catch(() => {
      addMessage("Server error 😢", "ai");
    });
}

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.innerText = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}