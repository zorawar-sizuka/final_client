const BACKEND_URL = "https://autobill-server-2.onrender.com";
const socket = io(BACKEND_URL);

let InitialCount = -1;

// ✅ Delete All Products (After Checkout)
const deleteProducts = async () => {
    try {
        const res = await axios.get(`${BACKEND_URL}/products`);
        const products = res.data;

        for (let product of products) {
            await axios.delete(`${BACKEND_URL}/product/${product.id}`);
        }

        location.reload();
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error("❌ Error Deleting Products:", error);
    }
};

// ✅ Load Products from Backend
const loadProducts = async () => {
    try {
        const res = await axios.get(`${BACKEND_URL}/products`);
        const products = res.data;
        let len = products.length;

        if (len > InitialCount + 1) {
            $("#1").hide();
            $("#home").css("display", "grid");
            $("#2").css("display", "grid");

            let payable = 0;
            let productHTML = "";

            for (let product of products) {
                payable += parseFloat(product.payable);

                productHTML += `
                <section>
                    <div class="card card-long animated fadeInUp once">
                        <img src="./assets/images/${product.id}.jpg" class="album">
                        <div class="span1">Product Name</div>
                        <div class="card__product"><span>${product.name}</span></div>
                        <div class="span2">Per Unit</div>
                        <div class="card__price"><span>${product.price}</span></div>
                        <div class="span3">Units</div>
                        <div class="card__unit"><span>${product.taken} ${product.unit}</span></div>
                        <div class="span4">Payable</div>
                        <div class="card__amount"><span>${product.payable}</span></div>
                    </div>
                </section>`;
            }

            document.getElementById("home").innerHTML = productHTML;
            document.getElementById("2").innerText = `CHECKOUT $${payable}`;
            InitialCount = len;
        }
    } catch (error) {
        console.error("❌ Failed to Load Products:", error);
    }
};

// ✅ Checkout Process (Generate QR Code)
const checkout = async () => {
    document.getElementById("2").innerHTML = "<span class='loader-16' style='margin-left: 44%;'></span>";

    try {
        const res = await axios.get(`${BACKEND_URL}/products`);
        const products = res.data;
        let payable = products.reduce((sum, item) => sum + parseFloat(item.payable), 0);

        let qrURL = `https://api.scanova.io/v2/qrcode/text?data=upi%3A%2F%2Fpay%3Fpa%3Dshebinjosejacob2014%40oksbi%26pn%3DTXN965654954321%26tn%3DA%26am%3D${payable}%26cu%3DINR&size=l`;
        let qrRes = await fetch(qrURL);
        let qrBlob = await qrRes.blob();
        let image = URL.createObjectURL(qrBlob);

        $("#home").hide();
        $("#final").hide();
        window.scrollTo({ top: 0, behavior: "smooth" });
        $('#image').attr('src', image);
        $("#qr").show();

        setTimeout(() => {
            $("#qr").hide();
            $("#success").show();
        }, 10000);

        deleteProducts();
    } catch (error) {
        alert("❌ Checkout Failed!");
        console.error(error);
    }
};

// ✅ Listen for WebSocket Updates
socket.on("product_update", () => {
    console.log("🔄 Product List Updated!");
    loadProducts();
});

// ✅ Initial Data Load
loadProducts();
