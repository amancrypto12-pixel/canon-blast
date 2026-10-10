// Game State
let balance = 12856;
let tokenBalance = 238.10;
let energy = 0;
const MAX_ENERGY = 2000;

// Update UI Elements
const balanceEl = document.getElementById('main-balance');
const tokenEl = document.querySelector('.token-balance-big span');

// Tab Switching Logic
function switchTab(tabId) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show target tab
  document.getElementById(`tab-${tabId}`).classList.add('active');
  
  // Update nav buttons
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Find clicked button and make it active
  const clickedBtn = Array.from(document.querySelectorAll('.nav-item')).find(btn => 
    btn.getAttribute('onclick').includes(tabId)
  );
  if (clickedBtn) clickedBtn.classList.add('active');
}

// Feed Dolphin (Clicker Mechanic)
function feedDolphin(event) {
  // Check if we have enough energy or just add to balance
  const feedCost = 84; // Actually giving 84 per tap or taking? The video shows "TAP TO FEED 84".
  
  balance += feedCost;
  balanceEl.innerText = balance.toLocaleString();

  // Show floating +84 text
  showFloatingText(event, `+${feedCost}`);
  
  // Vibrate if on mobile
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

// Floating Text Animation
function showFloatingText(event, text) {
  const floater = document.createElement('div');
  floater.className = 'floating-text';
  floater.innerText = text;
  
  // Position it near the click
  let x, y;
  
  // If clicked on button vs image, get correct coordinates
  if (event.type === 'click' && event.clientX) {
    x = event.clientX;
    y = event.clientY;
  } else {
    // Fallback to center of screen
    x = window.innerWidth / 2;
    y = window.innerHeight / 2;
  }

  // Add a bit of randomness
  x += (Math.random() - 0.5) * 40;
  y += (Math.random() - 0.5) * 40;

  floater.style.left = `${x}px`;
  floater.style.top = `${y}px`;
  
  document.body.appendChild(floater);
  
  // Remove after animation
  setTimeout(() => {
    floater.remove();
  }, 1000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Any startup logic here
});
