let XYDisplay = false;
let coords = null; // Reference to the overlay element
let mouseMoveHandler = null; // To store the event listener so we can remove it later

browser.runtime.onMessage.addListener((message) => {
  console.log("from extension... ", message);
  if (message.action === "toggleXY") {
    XYDisplay = !XYDisplay;
    console.log("Toggling XY coordinates... Now:", XYDisplay);
    showXY();
  }
});

function showXY() {
  if (XYDisplay) {
    // Create and display the overlay
    coords = document.createElement('div');
    coords.style.position = 'fixed';
    coords.style.top = '50%';
    coords.style.left = '50%';
    coords.style.transform = 'translate(-50%, -50%)';
    coords.style.padding = '10px 20px';
    coords.style.fontSize = '20px';
    coords.style.fontFamily = 'monospace';
    coords.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    coords.style.color = 'white';
    coords.style.borderRadius = '8px';
    coords.style.zIndex = '999999';
    coords.style.cursor = 'move';

    document.body.appendChild(coords);

    // Mouse position update
    mouseMoveHandler = (event) => {
      coords.textContent = `X: ${event.clientX}  Y: ${event.clientY}`;
    };
    document.addEventListener('mousemove', mouseMoveHandler);

    // Drag functionality
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    coords.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - coords.getBoundingClientRect().left;
      offsetY = e.clientY - coords.getBoundingClientRect().top;
      coords.style.transform = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging && coords) {
        coords.style.left = `${e.clientX - offsetX}px`;
        coords.style.top = `${e.clientY - offsetY}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  } else {
    // Remove overlay and cleanup
    if (coords) {
      coords.remove();
      coords = null;
    }
    if (mouseMoveHandler) {
      document.removeEventListener('mousemove', mouseMoveHandler);
      mouseMoveHandler = null;
    }
  }
}

function printTranscript() {
  // Inject subtitle container
  const subtitleContainer = document.createElement('div');
  subtitleContainer.id = 'subtitleContainer';
  document.body.appendChild(subtitleContainer);

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #subtitleContainer {
      position: fixed;
      bottom: 30px;
      width: 100%;
      display: flex;
      justify-content: center;
      pointer-events: none;
      z-index: 9999;
    }

    .subtitle {
      background: rgba(0, 0, 0, 0.75);
      color: white;
      padding: 0.6rem 1rem;
      border-radius: 10px;
      font-size: 1.1rem;
      font-family: sans-serif;
      max-width: 80%;
      text-align: center;
      animation: fadeOut 0.5s ease-in-out 2.5s forwards;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .subtitle.command {
      border: 2px solid #2196f3;
    }

    .spinner {
      border: 2px solid #f3f3f3;
      border-top: 2px solid #2196f3;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      animation: spin 1s linear infinite;
    }

    @keyframes fadeOut {
      to {
        opacity: 0;
        transform: translateY(20px);
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    html.grayscale, body.grayscale {
      filter: grayscale(1);
    }
  `;
  document.head.appendChild(style);

  // Listen for transcript messages
  browser.runtime.onMessage.addListener((message) => {
    if (message.action !== "transcript" || !message.payload?.text) return;

    const text = message.payload.text.trim();
    if (!text) return;

    const lcText = text.toLowerCase();
    const isCommand =
      lcText === "initiate visual desaturation" ||
      lcText === "enable full workstation transmission" ||
      lcText === "additional browser viewport instance";

    if (lcText === "enable full workstation transmission") {
      startScreenShare();
    }

    if (lcText === "additional browser viewport instance") {
      openNewTabPage();
    }

    if (lcText === "initiate visual desaturation") {
      document.documentElement.classList.add("grayscale");
      document.body.classList.add("grayscale");
    }

    // Create subtitle
    const subtitle = document.createElement('div');
    subtitle.className = 'subtitle';
    subtitle.textContent = text;

    if (isCommand) {
      subtitle.classList.add('command');
      const spinner = document.createElement('div');
      spinner.className = 'spinner';
      subtitle.appendChild(spinner);
    }

    // Clear previous subtitles
    subtitleContainer.innerHTML = '';
    subtitleContainer.appendChild(subtitle);

    // Remove after 3 seconds
    setTimeout(() => {
      subtitle.remove();
    }, 3000);
  });
}
printTranscript();

function startScreenShare() {
  console.log("Starting screen share...");
   browser.webfuseSession.startScreensharing();
}

function openNewTabPage() {
    console.log("Opening new tab...");
   browser.webfuseSession.openTab();
}