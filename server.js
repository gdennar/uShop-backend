const express = require("express");
require("dotenv").config();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
	app.use(express.static("build"));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "build", "index.html"));
	});
}

app.get("/", (req, res) => {
	res.send("Welcome to uShop website");
});

//app.use(express.static("public"));

const arr = [];
const calculateOrderAmount = (items) => {
	items.map((item) => {
		const { price, cartQuantity } = item;
		const itemPrices = price * cartQuantity;
		return arr.push(itemPrices);
	});
	const totalAmount = arr.reduce((a, b) => {
		return a + b;
	}, 0);

	return totalAmount * 100;
};

app.post("/create-payment-intent", async (req, res) => {
	const { items, shipping, description } = req.body;

	const paymentIntent = await stripe.paymentIntents.create({
		amount: calculateOrderAmount(items),
		currency: "usd",
		automatic_payment_methods: {
			enabled: true,
		},
		description,
		shipping: {
			address: {
				line1: shipping.line1,
				city: shipping.city,
				state: shipping.state,
			},
			name: shipping.name,
			phone: shipping.phone,
		},
		// receipt_email: userEmail
	});

	res.send({
		clientSecret: paymentIntent.client_secret,
	});
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}`));
