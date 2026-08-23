import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting GhanaTrust Database Seeding...');

  // 1. Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123!', salt);

  // 2. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ghanatrust.com' },
    update: {},
    create: {
      email: 'admin@ghanatrust.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      phoneNumber: '+233240000001',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user ready:', admin.email);

  // 3. Create Sample Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@ghanatrust.com' },
    update: {},
    create: {
      email: 'customer@ghanatrust.com',
      password: hashedPassword,
      firstName: 'Ama',
      lastName: 'Serwaa',
      phoneNumber: '+233241112233',
      role: 'CUSTOMER',
    },
  });
  console.log('✅ Customer user ready:', customer.email);

  // 4. Create Sample Provider
  const providerUser = await prisma.user.upsert({
    where: { email: 'kwame@ghanatrust.com' },
    update: {},
    create: {
      email: 'kwame@ghanatrust.com',
      password: hashedPassword,
      firstName: 'Kwame',
      lastName: 'Mensah',
      phoneNumber: '+233245556677',
      role: 'PROVIDER',
      provider: {
        create: {
          businessName: 'Kwame Electrical & Solar Solutions',
          description: 'Certified master electrician with 8+ years of residential and commercial wiring, solar setup, and fault detection experience in Kumasi.',
          experienceYears: 8,
          trustScore: 4.9,
          jobsCompleted: 127,
          completionRate: 98.5,
          identityVerified: true,
          phoneVerified: true,
          skillsVerified: true,
          locationVerified: true,
        },
      },
    },
  });
  console.log('✅ Provider user ready:', providerUser.email);

  // 5. Seed Regions and Locations
  const ashanti = await prisma.region.upsert({
    where: { name: 'Ashanti Region' },
    update: {},
    create: {
      name: 'Ashanti Region',
      locations: {
        create: [
          { name: 'Bantama, Kumasi', latitude: 6.6961, longitude: -1.6364 },
          { name: 'Suame, Kumasi', latitude: 6.7150, longitude: -1.6240 },
          { name: 'Asokwa, Kumasi', latitude: 6.6710, longitude: -1.6050 },
          { name: 'Ahodwo, Kumasi', latitude: 6.6690, longitude: -1.6200 },
        ],
      },
    },
  });

  const accra = await prisma.region.upsert({
    where: { name: 'Greater Accra Region' },
    update: {},
    create: {
      name: 'Greater Accra Region',
      locations: {
        create: [
          { name: 'Osu, Accra', latitude: 5.5560, longitude: -0.1820 },
          { name: 'East Legon, Accra', latitude: 5.6350, longitude: -0.1580 },
          { name: 'Spintex, Accra', latitude: 5.6140, longitude: -0.1090 },
        ],
      },
    },
  });
  console.log('✅ Regions & Locations created');

  // 6. Seed Service Categories
  const categories = [
    { name: 'Electrical', icon: '⚡', description: 'Wiring, solar installation, generator repair, and electrical inspection.' },
    { name: 'Plumbing', icon: '🚰', description: 'Pipe fitting, leak repairs, borehole maintenance, and bathroom fitting.' },
    { name: 'AC & Refrigeration', icon: '❄️', description: 'Air conditioner installation, servicing, and fridge repairs.' },
    { name: 'Carpentry & Woodwork', icon: '🪚', description: 'Custom furniture, roof framework, cabinet making, and door installation.' },
    { name: 'Painting & Decorating', icon: '🎨', description: 'Interior/exterior painting, POP ceiling, and wall texturing.' },
    { name: 'Cleaning & Janitorial', icon: '🧹', description: 'Post-construction cleaning, residential deep clean, and fumigation.' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Service categories created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
