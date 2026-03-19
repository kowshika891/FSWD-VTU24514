/* --- 1. GLOBAL DATA --- */
const inventory = [
    { id: 1, name: "Silk Lotus Saree", price: 4500, img: "https://picsum.photos/id/102/300", cat: "Fashion" },
    { id: 2, name: "Brass Tulip Vase", price: 1200, img: "https://picsum.photos/id/152/300", cat: "Home" },
    { id: 3, name: "Organic Forest Honey", price: 450, img: "https://picsum.photos/id/312/300", cat: "Grocery" },
    { id: 4, name: "Copper Water Bottle", price: 850, img: "https://picsum.photos/id/201/300", cat: "Home" },
    { id: 5, name: "Handwoven Cotton Stole", price: 1800, img: "https://picsum.photos/id/103/300", cat: "Fashion" },
    { id: 6, name: "Sandalwood Incense", price: 300, img: "https://picsum.photos/id/104/300", cat: "Home" }
];

let cartItems = []; 
let savedItems = [];
let discountRate = 0;

/* --- 2. AUTH & NAVIGATION --- */
function handleLogin() {
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    const rememberBox = document.getElementById('remember');

    const username = userField.value;
    const password = passField.value;

    if (username.trim() !== "" && password.trim() !== "") {
        // SAVING LOGIC
        if (rememberBox.checked) {
            localStorage.setItem('saved_user', username);
            localStorage.setItem('saved_pass', password);
        } else {
            localStorage.removeItem('saved_user');
            localStorage.removeItem('saved_pass');
        }

        // --- NEW: DISPLAY USERNAME IN NAVBAR ---
        const userDisplay = document.getElementById('user-display');
        if (userDisplay) {
            userDisplay.innerText = "Welcome, " + username + "!";
        }

        // NAVIGATION LOGIC
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        showPage('home');
    } else {
        alert("Please fill in both fields.");
    }
}

function forgotPassword() {
    const email = prompt("Please enter your registered email address to reset your password:");
    if (email) {
        alert("A reset link has been sent to " + email + ". (This is a demo)");
    }
}

function initLogin() {
    const storedUser = localStorage.getItem('saved_user');
    const storedPass = localStorage.getItem('saved_pass');

    if (storedUser && storedPass) {
        document.getElementById('username').value = storedUser;
        document.getElementById('password').value = storedPass;
        document.getElementById('remember').checked = true;
    }
}

initLogin();

function showPage(pageName) {
    const homeView = document.getElementById('home-view');
    const cartView = document.getElementById('cart-view');

    if (pageName === 'home') {
        homeView.style.display = 'block';
        cartView.style.display = 'none';
        renderStore();
    } else if (pageName === 'cart') {
        homeView.style.display = 'none';
        cartView.style.display = 'block';
        updateUI();
    }
}

/* --- 3. STORE LOGIC (HOME PAGE) --- */
function renderStore() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = inventory.map(item => `
        <div class="product-card-ui">
            <img src="${item.img}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p style="font-weight:bold; color:var(--fur-brown)">₹${item.price.toLocaleString('en-IN')}</p>
            <button class="checkout-btn" onclick="addToCart(${item.id})">Add to Cart</button>
        </div>
    `).join('');
}

function addToCart(productId) {
    const item = inventory.find(p => p.id === productId);
    const inCart = cartItems.find(p => p.id === productId);

    if (inCart) {
        inCart.qty++;
    } else {
        cartItems.push({ ...item, qty: 1 });
    }
    updateCartCounts();
    alert(`${item.name} added to cart!`);
}

/* --- 4. CART & SAVED LOGIC --- */
function updateUI() {
    renderCartItems();
    renderSavedDrawer(); // NEW: Render saved items into the drawer, not the main page
    calculateTotals();
    updateCartCounts();
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = cartItems.length === 0 ? `<p>Your cart is empty.</p>` : '';

    cartItems.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <img src="${item.img}" style="width:80px; border-radius:8px;">
                <div style="flex:1; margin-left:15px;">
                    <h4 style="margin:0">${item.name}</h4>
                    <p>₹${item.price.toLocaleString('en-IN')}</p>
                    <div class="controls">
                        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                    </div>
                    <button class="save-icon" onclick="moveToSaved(${item.id})">❤️ Save</button>
                    <button onclick="removeItem(${item.id})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px;">Remove</button>
                </div>
            </div>`;
    });
}

// NEW: This renders favorites inside the sliding sidebar drawer
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
                    <button onclick="moveToCartFromSaved(${item.id})" style="font-size:10px; color:var(--primary); background:none; border:none; cursor:pointer; padding:0;">Move to Cart</button>
                </div>
            </div>`;
    });
    
    const countLabel = document.getElementById('saved-count');
    if(countLabel) countLabel.innerText = savedItems.length;
}

function moveToSaved(id) {
    const index = cartItems.findIndex(i => i.id === id);
    if (index !== -1) {
        savedItems.push(cartItems.splice(index, 1)[0]);
        updateUI();
    }
}

function moveToCartFromSaved(id) {
    const index = savedItems.findIndex(i => i.id === id);
    if (index !== -1) {
        cartItems.push(savedItems.splice(index, 1)[0]);
        updateUI();
    }
}

function changeQty(id, delta) {
    const item = cartItems.find(i => i.id === id);
    if (item) {
        item.qty = Math.max(1, item.qty + delta);
        updateUI();
    }
}

function removeItem(id) {
    cartItems = cartItems.filter(i => i.id !== id);
    updateUI();
}

/* --- 5. THEME & UTILS --- */
function toggleTheme() {
    document.body.classList.toggle('night-mode');
    const btn = document.getElementById('theme-toggle');
    btn.innerText = document.body.classList.contains('night-mode') ? "🌙" : "☀️";
}

function toggleSavedDrawer() {
    const drawer = document.getElementById('saved-drawer');
    drawer.classList.toggle('open');
}

function calculateTotals() {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const total = subtotal - (subtotal * discountRate);
    document.getElementById('subtotal-val').innerText = `₹${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('total-val').innerText = `₹${total.toLocaleString('en-IN')}`;
}

function updateCartCounts() {
    const count = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const cartCountLabel = document.getElementById('cart-count');
    if(cartCountLabel) cartCountLabel.innerText = count;
}

function checkSavedLogin() {
    const savedUser = localStorage.getItem('saved_user');
    const savedPass = localStorage.getItem('saved_pass');

    if (savedUser && savedPass) {
        document.getElementById('username').value = storedUser;
        document.getElementById('password').value = storedPass;
        document.getElementById('remember').checked = true;
    }
}

updateUI();