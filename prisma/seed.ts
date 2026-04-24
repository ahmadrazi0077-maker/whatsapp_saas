import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed regions
  const regions = [
    { code: 'PK', name: 'Pakistan', currency: 'PKR', currencySymbol: '₨', timezone: 'Asia/Karachi', language: 'ur', priceMultiplier: 0.3 },
    { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', timezone: 'America/New_York', language: 'en', priceMultiplier: 1.0 },
    { code: 'AE', name: 'UAE', currency: 'AED', currencySymbol: 'د.إ', timezone: 'Asia/Dubai', language: 'ar', priceMultiplier: 3.67 },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', currencySymbol: '﷼', timezone: 'Asia/Riyadh', language: 'ar', priceMultiplier: 3.75 },
    { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹', timezone: 'Asia/Kolkata', language: 'hi', priceMultiplier: 0.4 },
    { code: 'BR', name: 'Brazil', currency: 'BRL', currencySymbol: 'R$', timezone: 'America/Sao_Paulo', language: 'pt', priceMultiplier: 0.5 },
  ];
  
  for (const region of regions) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: region,
      create: region,
    });
  }
  
  // Seed default plans
  const plans = [
    { name: 'Basic', slug: 'basic', price: 29, currency: 'USD', messageLimit: 1000, deviceLimit: 1, teamMemberLimit: 1 },
    { name: 'Pro', slug: 'pro', price: 99, currency: 'USD', messageLimit: 5000, deviceLimit: 3, teamMemberLimit: 5 },
    { name: 'Business', slug: 'business', price: 299, currency: 'USD', messageLimit: 20000, deviceLimit: 10, teamMemberLimit: 20 },
  ];
  
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }
  
  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });