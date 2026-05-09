import express from "express";
import { stripe } from "../lib/stripe.js";

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const { plan } = req.body;

  const prices = {
    starter: 900,
    pro: 1900,
    business: 3900,
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${plan} Plan`,
          },
          unit_amount: prices[plan],
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000/dashboard",
    cancel_url: "http://localhost:3000/pricing",
  });

  res.json({ url: session.url });
});

export default router;
