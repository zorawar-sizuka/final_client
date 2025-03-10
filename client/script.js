const BACKEND_URL = "https://autobill-server-2.onrender.com";
const socket = io(BACKEND_URL);

// Load products initially
loadProducts();

// Listen for product updates via WebSocket
socket.on("cart-update", () => {
    console.log("🔄 Product List Updated!");
    loadProducts();
});

// Fetch and display products
async function loadProducts() {
    try {
        let res = await axios.get(`${BACKEND_URL}/products`);
        let products = res.data;

        document.getElementById("home").innerHTML = products.map(product => `
            <section>
                <div class="card">
                    <img src="assets/images/${product.id}.jpg" class="product-img">
                    <div class="details">
                        <h3>${product.name}</h3>
                        <p>Price: $${product.price}</p>
                        <p>Weight: ${product.taken}g</p>
                        <p>Total: $${product.payable.toFixed(2)}</p>
                    </div>
                </div>
            </section>
        `).join("");

        document.getElementById("checkout-btn").innerText = `CHECKOUT ($${products.reduce((sum, p) => sum + p.payable, 0).toFixed(2)})`;
    } catch (error) {
        console.error("❌ Failed to Load Products:", error);
    }
}

// Checkout and clear cart
async function checkout() {
    try {
        document.getElementById("checkout-btn").innerText = "Processing...";
        let res = await axios.post(`${BACKEND_URL}/checkout`);
        alert(`✅ Checkout Successful! Total: $${res.data.total}`);

        // Clear UI and show success
        document.getElementById("home").innerHTML = "";
        document.getElementById("success").style.display = "block";

    } catch (error) {
        alert("❌ Checkout Failed!");
        console.error(error);
    }
}
