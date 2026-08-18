require("dotenv").config({ path: process.argv[2] });
const Razorpay = require("razorpay");

const id = (process.env.RAZORPAY_KEY_ID || "").trim();
const secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

(async () => {
  const result = {
    envFile: process.argv[2],
    keyIdTail: id.slice(-6),
    hasSecret: Boolean(secret),
  };

  try {
    const client = new Razorpay({ key_id: id, key_secret: secret });
    const order = await client.orders.create({
      amount: 200000,
      currency: "INR",
      receipt: `cmp_${Date.now()}`.slice(0, 40),
    });
    result.ok = true;
    result.orderIdTail = String(order.id).slice(-6);
    result.amount = order.amount;
  } catch (e) {
    result.ok = false;
    result.statusCode = e.statusCode;
    result.description = e.error?.description || e.message;
  }

  console.log(JSON.stringify(result));
})();
