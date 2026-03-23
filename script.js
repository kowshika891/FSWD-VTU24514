/* --- 1. GLOBAL DATA --- */
let inventory = [];
let cartItems = []; 
let savedItems = [];
let discountRate = 0;

/* --- 2. AUTH & NAVIGATION --- */
async function handleLogin() {
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    const username = userField.value.trim();
    const password = passField.value.trim();

    if (username !== "" && password !== "") {
        try {
            const res = await fetch('api/auth.php?action=login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });
            const data = await res.json();
            if (data.status === 'success') {
                onLoginSuccess(data.user);
            } else {
                alert(data.message);
            }
        } catch(e) {
            console.error("Login Error:", e);
            alert("Error connecting to server");
        }
    } else {
        alert("Please fill in both fields.");
    }
}

async function handleRegister() {
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    const username = userField.value.trim();
    const password = passField.value.trim();

    if (username !== "" && password !== "") {
        try {
            const res = await fetch('api/auth.php?action=register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });
            const data = await res.json();
            alert(data.message);
            // Optionally clear fields
            if (data.status === 'success') {
                userField.value = '';
                passField.value = '';
            }
        } catch(e) {
            console.error("Register Error:", e);
            alert("Error connecting to server");
        }
    } else {
        alert("Please fill in both fields.");
    }
}

async function handleLogout() {
    await fetch('api/auth.php?action=logout');
    location.reload();
}

function forgotPassword() {
    const email = prompt("Please enter your registered email address to reset your password:");
    if (email) {
        alert("A reset link has been sent to " + email + ". (This is a demo)");
    }
}

async function initLogin() {
    try {
        const res = await fetch('api/auth.php?action=me');
        const data = await res.json();
        if (data.status === 'success') {
            onLoginSuccess(data.user);
        }
    } catch(e) {
        console.error("Session check failed", e);
    }
}

function onLoginSuccess(username) {
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
        userDisplay.innerText = "Welcome, " + username + "!";
    }
    const loginTrigger = document.querySelector('.login-trigger');
    if (loginTrigger) {
        loginTrigger.innerText = "Logout";
        loginTrigger.onclick = handleLogout;
    }

    document.getElementById('login-page').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    showPage('home');
}

initLogin();

function showPage(pageName) {
    const homeView = document.getElementById('home-view');
    const cartView = document.getElementById('cart-view');

    if (pageName === 'home') {
        homeView.style.display = 'block';
        cartView.style.display = 'none';
        renderStore();
        updateUI(); 
    }

    if (pageName === 'cart') {
        homeView.style.display = 'none';
        cartView.style.display = 'block';
        updateUI();
    }
}

/* --- 3. STORE LOGIC (HOME PAGE) --- */
async function renderStore() {
    try {
        const res = await fetch('api/products.php');
        const data = await res.json();
        if (data.status === 'success') {
            inventory = data.data;
            const grid = document.getElementById('product-grid');
            if (grid) {
                grid.innerHTML = inventory.map(item => `
                    <div class="product-card-ui">
                        <img src="${item.img}" alt="${item.name}">
                        <h3>${item.name}</h3>
                        <p style="font-weight:bold; color:var(--fur-brown)">₹${parseFloat(item.price).toLocaleString('en-IN')}</p>
                        <button class="checkout-btn" onclick="addToCart(${item.id})">Add to Cart</button>
                    </div>
                `).join('');
            }
        }
    } catch(e) {
        console.error("Failed to fetch products", e);
    }
}

async function addToCart(productId) {
    try {
        const res = await fetch('api/cart.php?action=add', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({product_id: productId})
        });
        const data = await res.json();
        if (data.status === 'success') {
            updateUI();
            const item = inventory.find(i => i.id == productId);
            alert(`${item ? item.name : 'Item'} added to cart!`);
        } else {
            alert(data.message || 'Error adding to cart');
        }
    } catch(e) {
        console.error("Add to cart error", e);
    }
}

/* --- 4. CART & SAVED LOGIC --- */
async function updateUI() {
    await fetchCart();
    await fetchSaved();
    renderCartItems();
    renderSavedDrawer();
    calculateTotals();
    updateCartCounts();
}

async function fetchCart() {
    try {
        const res = await fetch('api/cart.php?action=get');
        const data = await res.json();
        if (data.status === 'success') {
            cartItems = data.data;
        }
    } catch(e) {
        console.error("Fetch cart error", e);
    }
}

async function fetchSaved() {
    try {
        const res = await fetch('api/saved.php?action=get');
        const data = await res.json();
        if (data.status === 'success') {
            savedItems = data.data;
        }
    } catch(e) {
        console.error("Fetch saved items error", e);
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if(!container) return;
    
    container.innerHTML = cartItems.length === 0 ? `<p>Your cart is empty.</p>` : '';

    cartItems.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <img src="${item.img}" style="width:80px; border-radius:8px;">
                <div style="flex:1; margin-left:15px;">
                    <h4 style="margin:0">${item.name}</h4>
                    <p>₹${parseFloat(item.price).toLocaleString('en-IN')}</p>
                    <div class="controls">
                        <button class="qty-btn" onclick="changeQty(${item.product_id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${item.product_id}, 1)">+</button>
                    </div>
                    <button class="save-icon" onclick="moveToSaved(${item.product_id})">❤️ Save</button>
                    <button onclick="removeItem(${item.product_id})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px;">Remove</button>
                </div>
            </div>`;
    });
}

function renderSavedDrawer() {
    const drawerContainer = document.getElementById('saved-items-container');
    if (!drawerContainer) return;

    drawerContainer.innerHTML = savedItems.length === 0 ? 
        `<p style="text-align:center; padding:20px;">No favorites yet!</p>` : '';

    savedItems.forEach(item => {
        drawerContainer.innerHTML += `
            <div class="card" style="margin-bottom: 10px; padding: 10px; display: flex; align-items: center;">
                <img src="${item.img}" style="width:50px; border-radius:5px;">
                <div style="flex:1; margin-left:10px;">
                    <h5 style="margin:0">${item.name}</h5>
                    <button onclick="moveToCartFromSaved(${item.product_id})" style="font-size:10px; color:var(--primary); background:none; border:none; cursor:pointer; padding:0;">Move to Cart</button>
                </div>
            </div>`;
    });
    
    const countLabel = document.getElementById('saved-count');
    if(countLabel) countLabel.innerText = savedItems.length;
}

async function moveToSaved(productId) {
    await fetch('api/saved.php?action=add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({product_id: productId})
    });
    await fetch('api/cart.php?action=remove', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({product_id: productId})
    });
    updateUI();
}

async function moveToCartFromSaved(productId) {
    await fetch('api/cart.php?action=add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({product_id: productId})
    });
    await fetch('api/saved.php?action=remove', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({product_id: productId})
    });
    updateUI();
}

async function changeQty(productId, delta) {
    await fetch('api/cart.php?action=update_qty', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({product_id: productId, delta: delta})
    });
    updateUI();
}

async function removeItem(productId) {
    await fetch('api/cart.php?action=remove', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({product_id: productId})
    });
    updateUI();
}

/* --- 5. THEME & UTILS --- */
function toggleTheme() {
    document.body.classList.toggle('night-mode');
    const btn = document.getElementById('theme-toggle');
    if(btn) btn.innerText = document.body.classList.contains('night-mode') ? "🌙" : "☀️";
}

function toggleSavedDrawer() {
    const drawer = document.getElementById('saved-drawer');
    if(drawer) drawer.classList.toggle('open');
}

function calculateTotals() {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const total = subtotal - (subtotal * discountRate);
    const stVal = document.getElementById('subtotal-val');
    const totVal = document.getElementById('total-val');
    
    if(stVal) stVal.innerText = `₹${subtotal.toLocaleString('en-IN')}`;
    if(totVal) totVal.innerText = `₹${total.toLocaleString('en-IN')}`;
}

function updateCartCounts() {
    const count = cartItems.reduce((acc, item) => acc + parseInt(item.qty), 0);
    const cartCountLabel = document.getElementById('cart-count');
    if(cartCountLabel) cartCountLabel.innerText = count;
}

function applyPromoCode() {
    const promoInput = document.getElementById('promo-input');
    if(!promoInput) return;
    
    const code = promoInput.value.trim();

    if (code === "SAVE10") {
        discountRate = 0.10;
        document.getElementById('discount-row').style.display = 'flex';
        alert("Promo applied! 10% discount 🎉");
    } else {
        discountRate = 0;
        const dr = document.getElementById('discount-row');
        if(dr) dr.style.display = 'none';
        alert("Invalid promo code ❌");
    }

    calculateTotals();
}

async function checkout() {
    if (cartItems.length === 0) {
        alert("Your cart is empty.");
        return;
    }
    try {
        const res = await fetch('api/checkout.php', {
            method: 'POST'
        });
        const data = await res.json();
        if (data.status === 'success') {
            alert(data.message);
            updateUI();
        } else {
            alert(data.message || "Failed to checkout.");
        }
    } catch(e) {
        console.error("Checkout error", e);
        alert("Error connecting to server during checkout");
    }
}