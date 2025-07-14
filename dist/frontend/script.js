const container = document.getElementById("container");
const input = document.getElementById("message");

const ws = new WebSocket(`wss://${window.location.host}`);
// const ws = new WebSocket(`ws://localhost:8080`);

let userId;
let mouseX;
let mouseY;
let color;

document.addEventListener("DOMContentLoaded", function () {
  userId = localStorage.getItem("id");
  color = localStorage.getItem("color");
  if (!userId) {
    userId = generateRandomId();
    localStorage.setItem("id", userId);
  }
  if (!color) {
    color = getRandomColor();
    localStorage.setItem("color", color);
  }
  console.log("userId", userId);

  input.style.backgroundColor = color;
  container.style.backgroundColor = color;
  container.style.borderRadius = "10px";
  container.style.width = "fit-content";
  container.id = userId;
  input.focus();
});

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    input.focus();
  }
});

input.addEventListener("keypress", function (event) {
  input.focus();
});

function mouseMoveHandler(event) {
  input.focus();
  mouseX = event.clientX;
  mouseY = event.clientY;
  container.style.left = `${mouseX + 10}px`;
  container.style.top = `${mouseY + 10}px`;
  container.style.position = "absolute";
  ws.send(
    JSON.stringify({
      [userId]: {
        user_id: userId,
        message: input.value.trim(),
        mouseX,
        mouseY,
        color,
      },
    })
  );
}

function inputHandler(event) {
  ws.send(
    JSON.stringify({
      [userId]: {
        user_id: userId,
        message: event.target.value.trim(),
        mouseX,
        mouseY,
        color,
      },
    })
  );
}

ws.addEventListener("open", function (event) {
  console.log("WebSocket connection established");
  input.focus();
  input.addEventListener("input", debounce(inputHandler, 100));
  document.addEventListener("mousemove", debounce(mouseMoveHandler, 20));
});

ws.addEventListener("message", function (event) {
  const messageData = event.data;
  const { clientCount, ...rest } = JSON.parse(messageData);
  createDynamicContainer(rest);
});

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const a = 0.3;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function generateRandomId() {
  return crypto.randomUUID();
}

function createDynamicContainer(data) {
  for (const key in data) {
    if (key !== userId) {
      const chatContainer = document.getElementById(key);
      if (chatContainer) {
        chatContainer.innerHTML = data[key].message;
        chatContainer.style.left = `${data[key].mouseX}px`;
        chatContainer.style.top = `${data[key].mouseY}px`;
        chatContainer.style.backgroundColor = data[key].color;
      } else {
        const chatContainerNew = document.createElement("div");
        chatContainerNew.classList.add("chat-container");
        document.body.appendChild(chatContainerNew);
        chatContainerNew.style.position = "absolute";
        chatContainerNew.style.left = `${data[key].mouseX}px`;
        chatContainerNew.style.top = `${data[key].mouseY}px`;
        chatContainerNew.style.backgroundColor = data[key].color;
        chatContainerNew.innerHTML = data[key].message;
        chatContainerNew.id = key;
        chatContainerNew.style.maxWidth = "250px";
        chatContainerNew.style.width = "150px";
        chatContainerNew.style.height = "fit-content";
        chatContainerNew.style.minHeight = "15px";
        chatContainerNew.style.borderRadius = "10px";
        chatContainerNew.style.padding = "10px";
        chatContainerNew.style.margin = "10px";
        chatContainerNew.style.boxShadow = "rgba(0, 0, 0, 0.35) 0px 5px 15px";
        chatContainerNew.style.overflow = "hidden";
        chatContainerNew.style.wordWrap = "break-word";
      }
    }
  }
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
