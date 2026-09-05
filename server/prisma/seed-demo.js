/**
 * Demo dataset.
 *
 * The base seed (seed.js) creates the reference data — categories, services,
 * regions, locations — plus one admin, one customer and one provider. That
 * provider is linked to no services and no locations, so the marketplace feed
 * shows a single card and every category or location filter comes back empty.
 *
 * This script fills the marketplace in: providers across every category and
 * location, spread over all three trust levels, with completed bookings and the
 * reviews that back their ratings.
 *
 * Idempotent — safe to re-run. Providers are keyed on the user's email, links
 * and bookings are only created when missing.
 *
 *   node prisma/seed-demo.js       (or: npm run seed:demo)
 *
 * Run seed.js first; this script exits with a message if the reference data
 * isn't there.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password123!';

/**
 * Providers are described by the category and location NAMES the base seed
 * creates, then resolved to ids at run time — so this stays correct if the
 * reference data is re-seeded and the ids move.
 *
 * trustScore/jobsCompleted/completionRate are what drive the badge the card
 * shows, so the mix here is deliberate:
 *   Level 3 — skillsVerified AND 20+ jobs AND 95%+ completion
 *   Level 2 — verified, but short of the track record
 *   Level 1 — identity checked only, new to the platform
 */
const PROVIDERS = [
  {
    email: 'yaw.electrical@ghanatrust.com',
    firstName: 'Yaw', lastName: 'Boateng', phoneNumber: '+233244101010',
    businessName: 'Boateng Power & Solar',
    description: 'Master electrician running a four-man crew out of Suame. Domestic rewiring, solar installs and standby generator work. ECG-compliant certificates issued on every job.',
    experienceYears: 12,
    category: 'Electrical',
    services: ['Electrical Wiring', 'Solar Installation', 'Fault Detection'],
    locations: ['Suame, Kumasi', 'Bantama, Kumasi'],
    trustScore: 4.9, jobsCompleted: 214, completionRate: 98.6,
    identityVerified: true, phoneVerified: true, skillsVerified: true, locationVerified: true,
    subscriptionTier: 'FEATURED',
  },
  {
    email: 'abena.plumbing@ghanatrust.com',
    firstName: 'Abena', lastName: 'Owusu', phoneNumber: '+233244202020',
    businessName: 'Owusu Plumbing Works',
    description: 'Fifteen years on borehole systems and pressure pumps across Kumasi. Emergency leak call-outs answered same day, including weekends.',
    experienceYears: 15,
    category: 'Plumbing',
    services: ['Borehole Maintenance', 'Leak Repairs', 'Pipe Fitting'],
    locations: ['Asokwa, Kumasi', 'Ahodwo, Kumasi'],
    trustScore: 4.8, jobsCompleted: 168, completionRate: 97.1,
    identityVerified: true, phoneVerified: true, skillsVerified: true, locationVerified: true,
    subscriptionTier: 'PRO',
  },
  {
    email: 'kofi.ac@ghanatrust.com',
    firstName: 'Kofi', lastName: 'Adjei', phoneNumber: '+233244303030',
    businessName: 'CoolTech AC Services',
    description: 'Samsung and LG certified AC technician. Split units, cassette units and cold rooms. Gas refills done with recovered refrigerant, never vented.',
    experienceYears: 9,
    category: 'AC & Refrigeration',
    services: ['AC Installation', 'AC Servicing', 'AC Gas Refill'],
    locations: ['East Legon, Accra', 'Spintex, Accra'],
    trustScore: 4.7, jobsCompleted: 96, completionRate: 96.2,
    identityVerified: true, phoneVerified: true, skillsVerified: true, locationVerified: true,
    subscriptionTier: 'FEATURED',
  },
  {
    email: 'akosua.carpentry@ghanatrust.com',
    firstName: 'Akosua', lastName: 'Frimpong', phoneNumber: '+233244404040',
    businessName: 'Frimpong Woodcraft',
    description: 'Bespoke kitchen cabinetry and hardwood doors, built in our Bantama workshop from seasoned odum and mahogany. Free measure-up within Kumasi.',
    experienceYears: 11,
    category: 'Carpentry & Woodwork',
    services: ['Cabinet Making', 'Custom Furniture', 'Door Installation'],
    locations: ['Bantama, Kumasi'],
    trustScore: 4.9, jobsCompleted: 143, completionRate: 99.1,
    identityVerified: true, phoneVerified: true, skillsVerified: true, locationVerified: true,
    subscriptionTier: 'PRO',
  },
  {
    email: 'samuel.painting@ghanatrust.com',
    firstName: 'Samuel', lastName: 'Tetteh', phoneNumber: '+233244505050',
    businessName: 'Tetteh Finishes',
    description: 'Interior and exterior decorating, POP ceilings and textured feature walls. Dust sheets and clean-up included as standard.',
    experienceYears: 7,
    category: 'Painting & Decorating',
    services: ['Interior Painting', 'POP Ceiling', 'Wall Texturing'],
    locations: ['Osu, Accra', 'East Legon, Accra'],
    trustScore: 4.6, jobsCompleted: 74, completionRate: 95.4,
    identityVerified: true, phoneVerified: true, skillsVerified: true, locationVerified: false,
  },
  {
    email: 'grace.cleaning@ghanatrust.com',
    firstName: 'Grace', lastName: 'Ansah', phoneNumber: '+233244606060',
    businessName: 'Ansah Cleaning Crew',
    description: 'Post-construction and end-of-tenancy deep cleans with a six-person team. Fumigation carried out by a licensed handler.',
    experienceYears: 6,
    category: 'Cleaning & Janitorial',
    services: ['Post-Construction Cleaning', 'Residential Deep Clean', 'Fumigation'],
    locations: ['Spintex, Accra', 'Osu, Accra'],
    trustScore: 4.8, jobsCompleted: 122, completionRate: 97.8,
    identityVerified: true, phoneVerified: true, skillsVerified: true, locationVerified: true,
  },
  {
    email: 'ibrahim.electrical@ghanatrust.com',
    firstName: 'Ibrahim', lastName: 'Mohammed', phoneNumber: '+233244707070',
    businessName: 'Mohammed Electricals',
    description: 'Generator servicing and automatic changeover panels for shops and small offices. Fault-finding on older installations a speciality.',
    experienceYears: 5,
    category: 'Electrical',
    services: ['Generator Repair', 'Electrical Inspection', 'Fault Detection'],
    locations: ['Ahodwo, Kumasi', 'Asokwa, Kumasi'],
    // Level 2: certified, but the track record is still short of the Level 3 bar.
    trustScore: 4.4, jobsCompleted: 18, completionRate: 93.0,
    identityVerified: true, phoneVerified: true, skillsVerified: true, locationVerified: false,
  },
  {
    email: 'esther.plumbing@ghanatrust.com',
    firstName: 'Esther', lastName: 'Nyarko', phoneNumber: '+233244808080',
    businessName: 'Nyarko Pipeworks',
    description: 'Bathroom and kitchen fit-outs, drain unblocking and water tank installation across the Spintex corridor.',
    experienceYears: 4,
    category: 'Plumbing',
    services: ['Bathroom Fitting', 'Drain Unblocking', 'Pipe Fitting'],
    locations: ['Spintex, Accra'],
    trustScore: 4.3, jobsCompleted: 31, completionRate: 94.2,
    identityVerified: true, phoneVerified: true, skillsVerified: true, locationVerified: false,
  },
  {
    email: 'daniel.ac@ghanatrust.com',
    firstName: 'Daniel', lastName: 'Asare', phoneNumber: '+233244909090',
    businessName: 'Asare Refrigeration',
    description: 'Fridge, freezer and chest-cooler repairs. Compressor replacement and thermostat faults handled at your premises.',
    experienceYears: 3,
    category: 'AC & Refrigeration',
    services: ['Fridge Repairs', 'AC Servicing', 'Vent Cleaning'],
    locations: ['Bantama, Kumasi', 'Suame, Kumasi'],
    // Level 1: identity checked, trade certification still pending.
    trustScore: 4.1, jobsCompleted: 9, completionRate: 88.9,
    identityVerified: true, phoneVerified: true, skillsVerified: false, locationVerified: false,
  },
  {
    email: 'joseph.carpentry@ghanatrust.com',
    firstName: 'Joseph', lastName: 'Amponsah', phoneNumber: '+233245010101',
    businessName: 'Amponsah Roofing & Framing',
    description: 'Roof framework, trusses and wood flooring. Structural timber sourced from certified suppliers in the Ashanti Region.',
    experienceYears: 8,
    category: 'Carpentry & Woodwork',
    services: ['Roof Framework', 'Wood Flooring', 'Custom Furniture'],
    locations: ['Suame, Kumasi', 'Asokwa, Kumasi'],
    trustScore: 4.5, jobsCompleted: 57, completionRate: 96.5,
    identityVerified: true, phoneVerified: true, skillsVerified: true, locationVerified: true,
  },
  {
    email: 'mary.painting@ghanatrust.com',
    firstName: 'Mary', lastName: 'Darko', phoneNumber: '+233245020202',
    businessName: 'Darko Decor',
    description: 'Wallpaper hanging and exterior repaints for residential blocks. Colour consultation included on jobs over two rooms.',
    experienceYears: 2,
    category: 'Painting & Decorating',
    services: ['Wallpaper Installation', 'Exterior Painting', 'Interior Painting'],
    locations: ['East Legon, Accra'],
    trustScore: 4.0, jobsCompleted: 6, completionRate: 83.3,
    identityVerified: true, phoneVerified: false, skillsVerified: false, locationVerified: false,
  },
  {
    email: 'patience.cleaning@ghanatrust.com',
    firstName: 'Patience', lastName: 'Agyeman', phoneNumber: '+233245030303',
    businessName: 'Agyeman Office Care',
    description: 'Scheduled office cleaning and carpet shampooing on weekly or fortnightly contracts. Uniformed, background-checked staff.',
    experienceYears: 5,
    category: 'Cleaning & Janitorial',
    services: ['Office Cleaning', 'Carpet Cleaning', 'Residential Deep Clean'],
    locations: ['Osu, Accra', 'Ahodwo, Kumasi'],
    trustScore: 4.6, jobsCompleted: 88, completionRate: 96.8,
    identityVerified: true, phoneVerified: true, skillsVerified: true, locationVerified: true,
  },
];

// Services the base seed's own provider (Kwame) should offer. He is created
// with no links at all, which is the bug that leaves the feed nearly empty.
const KWAME_SERVICES = ['Electrical Wiring', 'Solar Installation', 'Generator Repair'];
const KWAME_LOCATIONS = ['Bantama, Kumasi', 'Suame, Kumasi'];

// Review copy, drawn on in order so each provider's comments differ.
const REVIEW_POOL = [
  { rating: 5, comment: 'Arrived when he said he would and finished the same day. Explained the fault clearly before starting. Will use again.' },
  { rating: 5, comment: 'Very neat work and cleaned up afterwards. Price was exactly what we agreed, no surprises at the end.' },
  { rating: 4, comment: 'Good job overall. Started about an hour late but the work itself was solid and well finished.' },
  { rating: 5, comment: 'Professional from the first call. Sent photos of the completed work while I was away at the office.' },
  { rating: 4, comment: 'Knew the problem straight away. Had to come back once for a small adjustment but sorted it at no extra cost.' },
];

/** Deterministic date offsets so re-running produces a stable-looking history. */
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function main() {
  console.log('🌱 Seeding GhanaTrust demo marketplace data...\n');

  // ---- Resolve reference data ------------------------------------------
  const [services, locations, customerBase] = await Promise.all([
    prisma.service.findMany({ include: { category: true } }),
    prisma.location.findMany(),
    prisma.user.findFirst({ where: { email: 'customer@ghanatrust.com' } }),
  ]);

  if (!services.length || !locations.length) {
    console.error(
      '❌ Reference data missing. Run the base seed first:\n   npx prisma db seed\n'
    );
    process.exit(1);
  }

  const serviceByName = new Map(services.map((s) => [s.name, s]));
  const locationByName = new Map(locations.map((l) => [l.name, l]));

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);

  // ---- Extra customers, so reviews aren't all from one person ----------
  const customerSpecs = [
    { email: 'ama.customer@ghanatrust.com', firstName: 'Ama', lastName: 'Boakye', phoneNumber: '+233246111111' },
    { email: 'kojo.customer@ghanatrust.com', firstName: 'Kojo', lastName: 'Antwi', phoneNumber: '+233246222222' },
    { email: 'efua.customer@ghanatrust.com', firstName: 'Efua', lastName: 'Quartey', phoneNumber: '+233246333333' },
  ];

  const customers = [];
  if (customerBase) customers.push(customerBase);

  for (const spec of customerSpecs) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: {},
      create: { ...spec, password: hashedPassword, role: 'CUSTOMER' },
    });
    customers.push(user);
  }
  console.log(`✅ ${customers.length} customers ready`);

  // ---- Providers --------------------------------------------------------
  const providerRecords = [];

  for (const spec of PROVIDERS) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: {},
      create: {
        email: spec.email,
        password: hashedPassword,
        firstName: spec.firstName,
        lastName: spec.lastName,
        phoneNumber: spec.phoneNumber,
        role: 'PROVIDER',
      },
    });

    const subscriptionExpiresAt = spec.subscriptionTier
      ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      : null;

    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: spec.businessName,
        description: spec.description,
        experienceYears: spec.experienceYears,
        trustScore: spec.trustScore,
        jobsCompleted: spec.jobsCompleted,
        completionRate: spec.completionRate,
        identityVerified: spec.identityVerified,
        phoneVerified: spec.phoneVerified,
        skillsVerified: spec.skillsVerified,
        locationVerified: spec.locationVerified,
        subscriptionTier: spec.subscriptionTier || 'FREE',
        subscriptionExpiresAt,
      },
    });

    providerRecords.push({ spec, provider, user });
  }
  console.log(`✅ ${providerRecords.length} providers ready`);

  // ---- Link providers to the services and locations they cover ---------
  const linkProvider = async (providerId, serviceNames, locationNames, basePrice) => {
    for (const [i, name] of serviceNames.entries()) {
      const service = serviceByName.get(name);
      if (!service) {
        console.warn(`   ⚠ service not found, skipping: ${name}`);
        continue;
      }
      const existing = await prisma.providerService.findFirst({
        where: { providerId, serviceId: service.id },
      });
      if (existing) continue;

      await prisma.providerService.create({
        data: {
          providerId,
          serviceId: service.id,
          price: basePrice + i * 50,
          priceUnit: 'per job',
          isActive: true,
        },
      });
    }

    for (const [i, name] of locationNames.entries()) {
      const location = locationByName.get(name);
      if (!location) {
        console.warn(`   ⚠ location not found, skipping: ${name}`);
        continue;
      }
      const existing = await prisma.providerLocation.findFirst({
        where: { providerId, locationId: location.id },
      });
      if (existing) continue;

      await prisma.providerLocation.create({
        data: { providerId, locationId: location.id, isPrimary: i === 0 },
      });
    }
  };

  for (const { spec, provider } of providerRecords) {
    // Experience stands in for rate: a 12-year master charges more than a
    // 2-year newcomer, which makes the price column read plausibly.
    await linkProvider(provider.id, spec.services, spec.locations, 150 + spec.experienceYears * 25);
  }

  // The base seed's provider ships with no links at all — fix that here too.
  const kwame = await prisma.provider.findFirst({
    where: { user: { email: 'kwame@ghanatrust.com' } },
  });
  if (kwame) {
    await linkProvider(kwame.id, KWAME_SERVICES, KWAME_LOCATIONS, 350);
    providerRecords.push({ spec: { services: KWAME_SERVICES, locations: KWAME_LOCATIONS }, provider: kwame });
  }
  console.log('✅ Provider services & coverage areas linked');

  // ---- Completed bookings, each with the review that backs the rating ---
  let bookingCount = 0;
  let reviewCount = 0;

  for (const [pIndex, { spec, provider }] of providerRecords.entries()) {
    // Newer providers show fewer reviews, which is what their low job count
    // implies — three for the established, one for the newest.
    const reviewsToMake = (provider.jobsCompleted || 0) >= 50 ? 3 : 1;

    for (let r = 0; r < reviewsToMake; r++) {
      const customer = customers[(pIndex + r) % customers.length];
      const serviceName = spec.services[r % spec.services.length];
      const service = serviceByName.get(serviceName);
      const location = locationByName.get(spec.locations[0]);
      if (!service || !customer) continue;

      // Idempotency: one completed booking per (customer, provider, service).
      const existing = await prisma.booking.findFirst({
        where: { customerId: customer.id, providerId: provider.id, serviceId: service.id },
      });
      if (existing) continue;

      const dayOffset = 7 + pIndex * 3 + r * 5;
      const booking = await prisma.booking.create({
        data: {
          customerId: customer.id,
          providerId: provider.id,
          serviceId: service.id,
          locationId: location?.id ?? null,
          status: 'REVIEWED',
          scheduledDate: daysAgo(dayOffset),
          scheduledEndDate: daysAgo(dayOffset - 1),
          description: `${serviceName} requested through the GhanaTrust marketplace.`,
          address: location ? `Near ${location.name}` : 'Kumasi, Ghana',
          price: 200 + ((pIndex * 7 + r * 13) % 8) * 75,
        },
      });
      bookingCount++;

      const review = REVIEW_POOL[(pIndex + r) % REVIEW_POOL.length];
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          customerId: customer.id,
          providerId: provider.id,
          rating: review.rating,
          comment: review.comment,
          isPublic: true,
        },
      });
      reviewCount++;
    }
  }
  console.log(`✅ ${bookingCount} completed bookings with ${reviewCount} reviews`);

  // ---- A couple of live bookings so the dashboards aren't empty ---------
  const liveCustomer = customers[0];
  const liveTargets = providerRecords.slice(0, 2);
  let liveCount = 0;

  for (const [i, { spec, provider }] of liveTargets.entries()) {
    const service = serviceByName.get(spec.services[0]);
    const location = locationByName.get(spec.locations[0]);
    if (!service || !liveCustomer) continue;

    const status = i === 0 ? 'REQUESTED' : 'ACCEPTED';
    const existing = await prisma.booking.findFirst({
      where: { customerId: liveCustomer.id, providerId: provider.id, status },
    });
    if (existing) continue;

    await prisma.booking.create({
      data: {
        customerId: liveCustomer.id,
        providerId: provider.id,
        serviceId: service.id,
        locationId: location?.id ?? null,
        status,
        scheduledDate: new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000),
        description: `${service.name} — quote requested, awaiting confirmation.`,
        address: location ? `Plot 14, ${location.name}` : 'Kumasi, Ghana',
        price: i === 0 ? null : 450,
      },
    });
    liveCount++;
  }
  console.log(`✅ ${liveCount} in-flight bookings for the dashboards`);

  // ---- Summary ----------------------------------------------------------
  const [users, provs, pServices, pLocations, bookings, reviews] = await Promise.all([
    prisma.user.count(),
    prisma.provider.count(),
    prisma.providerService.count(),
    prisma.providerLocation.count(),
    prisma.booking.count(),
    prisma.review.count(),
  ]);

  console.log('\n📊 Database now holds:');
  console.log(`   users ................ ${users}`);
  console.log(`   providers ............ ${provs}`);
  console.log(`   provider services .... ${pServices}`);
  console.log(`   coverage areas ....... ${pLocations}`);
  console.log(`   bookings ............. ${bookings}`);
  console.log(`   reviews .............. ${reviews}`);
  console.log(`\n🔑 Every demo account uses the password: ${DEMO_PASSWORD}`);
  console.log('   admin@ghanatrust.com     (ADMIN)');
  console.log('   customer@ghanatrust.com  (CUSTOMER)');
  console.log('   yaw.electrical@ghanatrust.com (PROVIDER, Level 3, Featured)');
  console.log('\n🎉 Demo seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Demo seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
