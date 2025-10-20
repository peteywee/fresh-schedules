#!/usr/bin/env ts-node

/**
 * Fresh Schedules — Firestore Seeder
 * Deterministic, emulator/production aware, validates with Zod.
 *
 * Usage:
 *  # Emulator
 *  export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
 *  pnpm seed

 *  # Production
 *  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/sa.json"
 *  pnpm seed --prod --yes
 *
 * Flags:
 *  --prod  : require explicit confirmation to run against production
 *  --yes   : skip interactive confirmation prompt
 *  --wipe  : delete seeded docs before reseeding (safe for emulator)
 *  --orgs  : comma list of org slugs to seed (default: all)
 *  --weeks : number of weeks to seed forecasts/schedules (default: 2)
 *  --seed  : numeric PRNG seed (default: 20251017)
 */

import 'dotenv/config';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { z } from 'zod';
import { createHash } from 'crypto';
import { faker as fakerFactory } from '@faker-js/faker';
import { addDays, startOfWeek, format as formatTz, parseISO } from 'date-fns';

// ---------- Config & CLI ----------
const args = new Set(process.argv.slice(2));
const getArgVal = (name: string, fallback?: string) => {
  const idx = process.argv.findIndex(a => a === `--${name}`);
  if (idx >= 0 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) {
    return process.argv[idx + 1];
  }
  return fallback;
};

const PROD = args.has('--prod');
const YES = args.has('--yes');
const WIPE = args.has('--wipe');
const ORGS_FILTER = getArgVal('orgs')?.split(',').map(s => s.trim().toLowerCase()) ?? null;
const WEEKS = parseInt(getArgVal('weeks', '2')!, 10);
const PRNG_SEED = Number(getArgVal('seed', process.env.SEED_PRNG ?? '20251017'));

const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
if (!isEmulator && !PROD) {
  console.error('⚠️  Not on emulator. Use --prod to allow production writes.');
  process.exit(1);
}
if (PROD && !YES) {
  const msg = [
    '🛑 You are attempting to seed PRODUCTION.',
    'Re-run with: --prod --yes'
  ].join('\n');
  console.error(msg);
  process.exit(1);
}

console.log(`\n🚀 Seed start — target=${isEmulator ? 'EMULATOR' : 'PRODUCTION'}  weeks=${WEEKS}  seed=${PRNG_SEED}\n`);

// ---------- Deterministic Faker ----------
const faker = fakerFactory;
faker.seed(PRNG_SEED);

// ---------- Schemas ----------
const Org = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
type Org = z.infer<typeof Org>;

const User = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  phone: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
type User = z.infer<typeof User>;

const Membership = z.object({
  id: z.string(),
  orgId: z.string(),
  uid: z.string(),
  roles: z.array(z.enum(['admin', 'manager', 'staff'])),
  createdAt: z.number(),
});
type Membership = z.infer<typeof Membership>;

const Location = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  createdAt: z.number(),
});
type Location = z.infer<typeof Location>;

const LaborSettings = z.object({
  orgId: z.string(),
  avgWage: z.number().positive(),
  laborPct: z.number().min(1).max(99),
  effectiveFrom: z.string(), // ISO date (UTC midnight)
  updatedAt: z.number(),
});
type LaborSettings = z.infer<typeof LaborSettings>;

const Forecast = z.object({
  orgId: z.string(),
  date: z.string(), // YYYY-MM-DD
  lastYearSales: z.number().nonnegative(),
  lastWeekSameDaySales: z.number().nonnegative(),
  trendPct: z.number(), // e.g., 0.05 for +5%
  forecastSales: z.number().nonnegative(),
  allowedDollars: z.number().nonnegative(),
  allowedHours: z.number().nonnegative(),
  updatedAt: z.number(),
});
type Forecast = z.infer<typeof Forecast>;

const Schedule = z.object({
  id: z.string(),
  orgId: z.string(),
  weekStartISO: z.string(), // YYYY-MM-DD (Monday)
  createdAt: z.number(),
});
type Schedule = z.infer<typeof Schedule>;

const Shift = z.object({
  id: z.string(),
  orgId: z.string(),
  scheduleId: z.string(),
  locationId: z.string(),
  uid: z.string(),
  role: z.enum(['admin', 'manager', 'staff']),
  start: z.string(), // ISO
  end: z.string(),   // ISO
  createdAt: z.number(),
});
type Shift = z.infer<typeof Shift>;

// ---------- Constants / Helpers ----------
const now = () => Date.now();
const toDateKey = (d: Date) => formatTz(d, 'yyyy-MM-dd');
const mondayOf = (d: Date) => startOfWeek(d, { weekStartsOn: 1 });
const idOf = (...parts: string[]) => createHash('sha1').update(parts.join('::')).digest('hex').slice(0, 20);

// ---------- Seed Plan ----------
const ORGS: Array<{ slug: string; name: string }> = [
  { slug: 'top-shelf-service', name: 'Top Shelf Service' },
  { slug: 'lone-star-coffee', name: 'Lone Star Coffee' },
];

const ROLES: Array<'admin' | 'manager' | 'staff'> = ['admin', 'manager', 'staff'];

function pickTexasCityZip() {
  const cities = [
    ['Arlington', '76010'], ['Dallas', '75201'], ['Austin', '73301'],
    ['Houston', '77002'], ['Fort Worth', '76102'], ['San Antonio', '78205'],
  ];
  return faker.helpers.arrayElement(cities);
}

function shiftSpan(day: Date, kind: 'open' | 'mid' | 'close') {
  const base = new Date(day);
  const set = (h: number, m = 0) => new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), h, m, 0));
  if (kind === 'open')  return [set(12, 30), set(20, 30)]; // 6:30a–2:30p CST ≈ 12:30–20:30 UTC (approx; UI displays in TZ)
  if (kind === 'mid')   return [set(16, 0),  set(24, 0)];
  return [set(20, 0), set(28, 30)]; // 2p–10:30p CST ≈ 20:00–04:30 UTC
}

function calcForecast(lastYear: number, lastWeek: number, trendPct: number) {
  // Simple blend: average of (lastYear*(1+trend)) and lastWeek, then slight nudge by trend
  const blended = (lastYear * (1 + trendPct) + lastWeek) / 2;
  return Math.max(0, Math.round(blended * (1 + trendPct * 0.25)));
}

async function ensureDoc<T extends z.ZodTypeAny>(
  db: Firestore,
  col: string,
  id: string,
  data: z.infer<T>,
  schema: T
) {
  const parsed = schema.parse(data);
  await db.collection(col).doc(id).set(parsed as any, { merge: true });
}

async function maybeWipeOrg(db: Firestore, orgId: string) {
  if (!WIPE) return;
  const collections = ['memberships', 'locations', 'forecasts', 'schedules', 'shifts'];
  for (const col of collections) {
    const q = db.collection(col).where('orgId', '==', orgId);
    const snap = await q.get();
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}

// ---------- Firebase Init ----------
const app = initializeApp(
  process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? { credential: applicationDefault() }
    : {}
);
const db = getFirestore();

// ---------- Main ----------
(async () => {
  // Filter orgs if requested
  const orgInputs = ORGS.filter(o => !ORGS_FILTER || ORGS_FILTER.includes(o.slug));

  for (const { slug, name } of orgInputs) {
    const orgId = idOf('org', slug);
    const ts = now();

    const org: Org = { id: orgId, slug, name, createdAt: ts, updatedAt: ts };
    await ensureDoc(db, 'orgs', orgId, org, Org);

    if (WIPE) await maybeWipeOrg(db, orgId);

    // Labor settings (stable but different per org)
    const avgWage = faker.number.int({ min: 12, max: 22 });  // USD/hr
    const laborPct = faker.number.int({ min: 18, max: 28 }); // %
    const laborSettings: LaborSettings = {
      orgId,
      avgWage,
      laborPct,
      effectiveFrom: toDateKey(new Date()),
      updatedAt: ts,
    };
    await ensureDoc(db, 'laborSettings', orgId, laborSettings, LaborSettings);

    // Users (3 core + shared staff)
    const coreUsers: User[] = [];
    for (let i = 0; i < 3; i++) {
      const first = faker.person.firstName();
      const last = faker.person.lastName();
      const email = `${first}.${last}.${slug.replace(/-/g, '')}@example.com`.toLowerCase();
      const uid = idOf('uid', email);
      const user: User = {
        uid,
        email,
        displayName: `${first} ${last}`,
        phone: faker.phone.number(),
        createdAt: ts,
        updatedAt: ts,
      };
      await ensureDoc(db, 'users', uid, user, User);
      coreUsers.push(user);
    }

    // Assign roles: user0 = admin+manager, user1 = manager, user2 = staff
    const memberships: Membership[] = [
      { id: idOf('m', orgId, coreUsers[0].uid), orgId, uid: coreUsers[0].uid, roles: ['admin', 'manager'], createdAt: ts },
      { id: idOf('m', orgId, coreUsers[1].uid), orgId, uid: coreUsers[1].uid, roles: ['admin', 'manager'], createdAt: ts },
      { id: idOf('m', orgId, coreUsers[2].uid), orgId, uid: coreUsers[2].uid, roles: ['staff'], createdAt: ts },
    ];
    for (const m of memberships) {
      await ensureDoc(db, 'memberships', m.id, m, Membership);
    }

    // Shared staff pool (cross-org), deterministic emails
    const sharedStaffCount = 6;
    const shared: User[] = [];
    for (let i = 0; i < sharedStaffCount; i++) {
      const first = faker.person.firstName();
      const last = faker.person.lastName();
      const email = `staff${i}.${slug.replace(/-/g, '')}@example.com`.toLowerCase();
      const uid = idOf('uid', email);
      const user: User = {
        uid,
        email,
        displayName: `${first} ${last}`,
        phone: faker.phone.number(),
        createdAt: ts,
        updatedAt: ts,
      };
      await ensureDoc(db, 'users', uid, user, User);
      shared.push(user);
      const mem: Membership = { id: idOf('m', orgId, uid), orgId, uid, roles: ['staff'], createdAt: ts };
      await ensureDoc(db, 'memberships', mem.id, mem, Membership);
    }

    // Locations (3 per org)
    const locations: Location[] = [];
    for (let i = 0; i < 3; i++) {
      const [city, zip] = pickTexasCityZip();
      const locName = ['Main', 'Uptown', 'South'][i] + ' Location';
      const id = idOf('loc', orgId, String(i));
      const loc: Location = {
        id,
        orgId,
        name: locName,
        address: faker.location.streetAddress(),
        city,
        state: 'TX',
        zip,
        createdAt: ts,
      };
      await ensureDoc(db, 'locations', id, loc, Location);
      locations.push(loc);
    }

    // Forecasts & allowed budgets for N weeks (Mon-Sun)
    const today = new Date();
    const firstMonday = mondayOf(today);
    const forecastDays: Forecast[] = [];

    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < 7; d++) {
        const day = addDays(firstMonday, w * 7 + d);
        const dateKey = toDateKey(day);

        // Base sales (deterministic but varied)
        const weekday = day.getUTCDay(); // 0 Sun .. 6 Sat
        const base = [0.8, 0.9, 1.0, 1.05, 1.1, 1.2, 1.3][weekday]; // weekends stronger
        const lastYear = Math.round(3000 * base + faker.number.int({ min: -200, max: 200 }));
        const lastWeek = Math.round(3200 * base + faker.number.int({ min: -180, max: 220 }));
        const trendPct = faker.helpers.arrayElement([ -0.03, 0.0, 0.03, 0.05 ]); // down flat up up+
        const forecastSales = calcForecast(lastYear, lastWeek, trendPct);
        const allowedDollars = Math.round(forecastSales * (laborSettings.laborPct / 100));
        const allowedHours = Number((allowedDollars / laborSettings.avgWage).toFixed(1));

        const f: Forecast = {
          orgId,
          date: dateKey,
          lastYearSales: lastYear,
          lastWeekSameDaySales: lastWeek,
          trendPct,
          forecastSales,
          allowedDollars,
          allowedHours,
          updatedAt: ts,
        };
        forecastDays.push(f);
        // store under forecasts/{orgId}/daily/{dateKey}
        await ensureDoc(db, `forecasts/${orgId}/daily`, dateKey, f, Forecast);
      }
    }

    // Schedules (one per week)
    const schedules: Schedule[] = [];
    for (let w = 0; w < WEEKS; w++) {
      const weekStart = toDateKey(addDays(firstMonday, w * 7));
      const id = idOf('sched', orgId, weekStart);
      const s: Schedule = { id, orgId, weekStartISO: weekStart, createdAt: ts };
      await ensureDoc(db, 'schedules', id, s, Schedule);
      schedules.push(s);
    }

    // Shifts — generate open/mid/close across locations using staff
    const allStaff = [...shared, coreUsers[2]]; // ensure at least one local staff
    const managers = [coreUsers[0], coreUsers[1]];

    for (const s of schedules) {
      for (let d = 0; d < 7; d++) {
        const day = parseISO(s.weekStartISO);
        day.setUTCDate(day.getUTCDate() + d);

        // manager coverage (one per day)
        {
          const mUser = managers[d % managers.length];
          const [start, end] = shiftSpan(day, 'open');
          const id = idOf('shift', s.id, 'mgr', String(d));
          const shift: Shift = {
            id,
            orgId,
            scheduleId: s.id,
            locationId: locations[d % locations.length].id,
            uid: mUser.uid,
            role: 'manager',
            start: start.toISOString(),
            end: end.toISOString(),
            createdAt: ts,
          };
          await ensureDoc(db, 'shifts', id, shift, Shift);
        }

        // staff coverage (2–3 per day)
        const staffCount = (d % 2 === 0) ? 3 : 2;
        for (let i = 0; i < staffCount; i++) {
          const staffUser = allStaff[(d + i) % allStaff.length];
          const kind = i === 0 ? 'mid' : (i === 1 ? 'open' : 'close');
          const [start, end] = shiftSpan(day, kind as 'open' | 'mid' | 'close');
          const id = idOf('shift', s.id, 'staff', String(d), String(i));
          const shift: Shift = {
            id,
            orgId,
            scheduleId: s.id,
            locationId: locations[(d + i) % locations.length].id,
            uid: staffUser.uid,
            role: 'staff',
            start: start.toISOString(),
            end: end.toISOString(),
            createdAt: ts,
          };
          await ensureDoc(db, 'shifts', id, shift, Shift);
        }
      }
    }

    console.log(`✅ Seeded org: ${name} (${slug})  users=${3 + 6}  locations=3  weeks=${WEEKS}`);
  }

  console.log('\n🎉 Done. Deterministic seed complete.\n');
})().catch(err => {
  console.error('💥 Seed failed:', err);
  process.exit(1);
});
