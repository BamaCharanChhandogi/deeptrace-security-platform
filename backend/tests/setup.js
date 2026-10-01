const db = require('../src/config/database');

beforeAll(async () => {
  // Run migrations and seeds
  await db.migrate.latest();
  await db.seed.run();
});

afterAll(async () => {
  await db.destroy();
});
