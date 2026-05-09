'use client';

const plans = [
  { name: "Starter", price: 9 },
  { name: "Pro", price: 19, popular: true },
  { name: "Business", price: 39 },
];

export default function PricingPage() {

  const handleSubscribe = async (plan: string) => {
    const res = await fetch("http://localhost:3001/api/billing/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan: plan.toLowerCase() }),
    });

    const data = await res.json();

    window.location.href = data.url;
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-10">
      <h1 className="text-4xl text-center mb-10">Pricing</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-6 rounded-xl border ${
              plan.popular ? "border-green-500" : "border-gray-700"
            }`}
          >
            <h2 className="text-xl font-bold">{plan.name}</h2>
            <p className="text-3xl mt-2">${plan.price}/mo</p>

            <button
              onClick={() => handleSubscribe(plan.name)}
              className="mt-4 bg-green-500 text-black px-4 py-2 rounded"
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
