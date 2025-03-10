const BACKEND_URL = "https://autobill-server-2.onrender.com";
const socket = io(BACKEND_URL);

// ✅ **Fetch and Render Products**
const loadProducts = async () => {
    try {
        let res = await axios.get(`${BACKEND_URL}/products`);
        let products = res.data;

        console.log("🛒 Products Fetched:", products); // Debugging

        if (!products || products.length === 0) {
            document.getElementById("home").innerHTML = "<h3>No products added yet...</h3>";
            return;
        }

        let totalPayable = products.reduce((sum, p) => sum + parseFloat(p.payable), 0);

        document.getElementById("home").innerHTML = products.map(product => `
            <section>
                <div class="card card-long animated fadeInUp">
                    <img src="assets/images/${product.id}.jpg" class="album" onerror="this.src='assets/images/default.jpg'">
                    <div class="span1">Product Name</div>
                    <div class="card__product">
                        <span>${product.name}</span>
                    </div>
                    <div class="span2">Per Unit</div>
                    <div class="card__price">
                        <span>${product.price}</span>
                    </div>
                    <div class="span3">Units</div>
                    <div class="card__unit">
                        <span>${product.taken} ${product.unit}</span>
                    </div>
                    <div class="span4">Payable</div>
                    <div class="card__amount">
                        <span>${product.payable.toFixed(2)}</span>
                    </div>
                </div>
            </section>
        `).join("");

        document.getElementById("checkout-btn").innerText = `CHECKOUT $${totalPayable.toFixed(2)}`;
    } catch (error) {
        console.error("❌ Failed to Load Products:", error.response ? error.response.data : error.message);
        document.getElementById("home").innerHTML = "<h3>Error loading products. Try again later.</h3>";
    }
};

// ✅ **Listen for WebSocket Updates**
socket.on("product_update", () => {
    console.log("🔄 Product List Updated!");
    loadProducts();
});

// ✅ **Checkout Process**
const checkout = async () => {
    document.getElementById("checkout-btn").innerHTML = "<span class='loader-16' style='margin-left: 44%;'></span>";

    try {
        let res = await axios.post(`${BACKEND_URL}/checkout`);
        let total = res.data.total;

        console.log("✅ Checkout Total:", total);

        let qrURL = `https://api.scanova.io/v2/qrcode/text?data=upi%3A%2F%2Fpay%3Fpa%3Dshebinjosejacob2014%40oksbi%26pn%3DTXN965654954321%26tn%3DA%26am%3D${total}%26cu%3DINR`;

        let qrRes = await fetch(qrURL);
        let qrBlob = await qrRes.blob();
        document.getElementById("image").src = URL.createObjectURL(qrBlob);

        document.getElementById("home").style.display = "none";
        document.getElementById("qr").style.display = "grid";

        setTimeout(() => {
            document.getElementById("qr").style.display = "none";
            document.getElementById("success").style.display = "grid";
        }, 10000);
    } catch (error) {
        alert("❌ Checkout Failed!");
        console.error("❌ Checkout Error:", error);
    }
};

// ✅ **Delete All Products After Checkout**
const deleteProducts = async () => {
    try {
        await axios.delete(`${BACKEND_URL}/clear`);
        console.log("🗑️ Products Cleared");
        loadProducts(); // Refresh UI
    } catch (error) {
        console.error("❌ Error Deleting Products:", error);
    }
};

// ✅ **Auto Refresh Products on Page Load**
window.onload = () => {
    loadProducts();
};
