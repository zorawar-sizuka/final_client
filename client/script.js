const BACKEND_URL = "https://autobill-server-2.onrender.com"; // Replace with actual Render URL
const socket = io(BACKEND_URL); // WebSocket connection to the backend

let InitialCount = 0; // Track the number of products loaded initially

// ✅ Listen for WebSocket Product Updates and Re-render UI
socket.on("cart-update", () => {
    console.log("🔄 Cart Update Triggered!");
    loadProducts();
});

// ✅ Function to Load Products and Update UI
const loadProducts = async () => {
    let res = await axios.get(`${BACKEND_URL}/products`);
    const products = res.data;
    let len = products.length;

    if (len > InitialCount) {
        $("#1").css("display", "none");
        $("#home").css("display", "grid");
        $("#2").css("display", "grid");

        let payable = 0;

        products.forEach(product => {
            payable += parseFloat(product.payable);
        });

        let product = products[products.length - 1];  // Get the latest product
        const productHTML = `
        <section>
            <div class="card card-long animated fadeInUp once">
                <img src="assets/images/${product.id}.jpg" class="album">
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
                    <span>${product.payable}</span>
                </div>
            </div>
        </section>`;

        document.getElementById("home").innerHTML += productHTML;
        document.getElementById("2").innerHTML = `CHECKOUT $${payable}`;
        InitialCount += 1;
    }
};

// ✅ Checkout function to handle payment and display QR code
const checkout = async () => {
    document.getElementById("2").innerHTML = "<span class='loader-16' style='margin-left: 44%;'></span>";

    try {
        let res = await axios.get(`${BACKEND_URL}/products`);
        let products = res.data;
        let payable = products.reduce((sum, product) => sum + parseFloat(product.payable), 0);

        // Generate QR code for payment using the payable amount
        let qrURL = `https://api.scanova.io/v2/qrcode/text?data=upi%3A%2F%2Fpay%3Fpa%3Dshebinjosejacob2014%40oksbi%26pn%3DTXN965654954321%26tn%3DA%26am%3D${payable}%26cu%3DINR&size=l&error_correction=M`;

        await fetch(qrURL)
            .then((data) => data.blob())
            .then((img) => {
                let image = URL.createObjectURL(img);
                $("#home, #final").css("display", "none");
                $("#qr").css("display", "grid");
                $("#image").attr("src", image);
            });

        setTimeout(() => {
            $("#qr").css("display", "none");
            $("#success").css("display", "grid");
        }, 10000);

        // After the checkout, clear the cart and update the UI
        await axios.post(`${BACKEND_URL}/checkout`);
        deleteProducts(); // Clear the products from the cart
    } catch (error) {
        alert("❌ Checkout Failed!");
        console.error(error);
    }
};

// ✅ Function to delete all products from the cart
const deleteProducts = async () => {
    let res = await axios.get(`${BACKEND_URL}/products`);
    const products = res.data;

    for (let product of products) {
        await axios.delete(`${BACKEND_URL}/clear`);
    }

    location.reload();
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// Load products every 1 second instead of every 100ms to optimize performance
window.onload = () => {
    setInterval(loadProducts, 1000);
};
