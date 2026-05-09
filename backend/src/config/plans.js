export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    messages: 100,
    devices: 1,
  },
  STARTER: {
    name: "Starter",
    price: 9,
    messages: 1000,
    devices: 1,
  },
  PRO: {
    name: "Pro",
    price: 19,
    messages: 5000,
    devices: 2,
  },
  BUSINESS: {
    name: "Business",
    price: 39,
    messages: 15000,
    devices: 5,
  }
};
const STRIPE_PLANS = {
  // ...
  starter: {
    // ...
    stripePriceId: 'price_1TTj4qLL1KA02vvSEep1e8L3', // Replace with actual
  },
  pro: {
    // ...
    stripePriceId: 'price_1TTjMGLL1KA02vvSyR8YRokZ', // Replace with actual
  },
  business: {
    // ...
    stripePriceId: 'price_1TTjMaLL1KA02vvSLyG8ukEA', // Replace with actual
  },
};