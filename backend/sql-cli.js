#!/usr/bin/env node
/**
 * DeepTrace Interactive SQL Playground & Practice CLI
 * Run: node sql-cli.js
 * Or:  node sql-cli.js "SELECT * FROM users"
 */

process.removeAllListeners('warning');
const readline = require('readline');
const db = require('./src/config/database');

const CHALLENGES = [
  {
    id: 1,
    title: 'Warmup: Select All Tenants',
    task: 'Write a query to fetch the name and slug of all tenants in the platform.',
    hint: 'Use SELECT name, slug FROM tenants;',
    solution: 'SELECT name, slug FROM tenants;'
  },
  {
    id: 2,
    title: 'Filtering: Find Active Admins',
    task: 'Find the email, name, and role of all active users whose role is "ADMIN".',
    hint: 'Use WHERE role = \'ADMIN\' AND is_active = true;',
    solution: "SELECT email, name, role FROM users WHERE role = 'ADMIN' AND is_active = true;"
  },
  {
    id: 3,
    title: 'Pattern Matching: Find Phishing Campaigns',
    task: 'Find the name, status, and start_date of all campaigns whose name or description contains the word "Phishing".',
    hint: 'Use ILIKE \'%Phishing%\' with OR condition.',
    solution: "SELECT name, status, start_date FROM campaigns WHERE name ILIKE '%Phishing%' OR description ILIKE '%Phishing%';"
  },
  {
    id: 4,
    title: 'Security Alert: Open Critical Events',
    task: 'List all security events that have severity "CRITICAL" and are NOT resolved (i.e. status != \'RESOLVED\'). Order by created_at descending.',
    hint: 'Combine WHERE severity = \'CRITICAL\' AND status != \'RESOLVED\' ORDER BY created_at DESC;',
    solution: "SELECT event_type, severity, status, description, created_at FROM security_events WHERE severity = 'CRITICAL' AND status != 'RESOLVED' ORDER BY created_at DESC;"
  },
  {
    id: 5,
    title: 'Aggregation: Count Campaigns by Status',
    task: 'Count how many campaigns exist in each status (DRAFT, ACTIVE, COMPLETED, CANCELLED). Display the status and count.',
    hint: 'Use GROUP BY status and count(*).',
    solution: "SELECT status, count(*) AS total_campaigns FROM campaigns GROUP BY status ORDER BY total_campaigns DESC;"
  },
  {
    id: 6,
    title: 'Multi-Tenant Security: Count Events per Tenant',
    task: 'Join security_events with tenants to show each tenant name along with the total count of security events reported for that tenant.',
    hint: 'Use JOIN tenants ON security_events.tenant_id = tenants.id GROUP BY tenants.name;',
    solution: "SELECT t.name AS tenant_name, count(e.id) AS event_count FROM tenants t LEFT JOIN security_events e ON t.id = e.tenant_id GROUP BY t.id, t.name;"
  },
  {
    id: 7,
    title: 'Relational Join: Campaign Members & Users',
    task: 'List campaign names alongside the names and emails of the team members assigned to them.',
    hint: 'Join campaigns -> campaign_members -> users.',
    solution: "SELECT c.name AS campaign_name, u.name AS member_name, u.email AS member_email FROM campaigns c JOIN campaign_members cm ON c.id = cm.campaign_id JOIN users u ON cm.user_id = u.id ORDER BY c.name;"
  },
  {
    id: 8,
    title: 'Audit Trail: Who did what?',
    task: 'Fetch the 5 most recent audit logs, displaying action, entity_type, the user\'s name who performed the action, and created_at timestamp.',
    hint: 'LEFT JOIN users ON audit_logs.user_id = users.id ORDER BY audit_logs.created_at DESC LIMIT 5;',
    solution: "SELECT a.action, a.entity_type, COALESCE(u.name, 'System') AS actor_name, a.created_at FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 5;"
  }
];

async function executeQuery(sql) {
  const start = Date.now();
  try {
    const res = await db.raw(sql);
    const duration = Date.now() - start;

    if (Array.isArray(res.rows)) {
      if (res.rows.length === 0) {
        console.log(`\n(0 rows returned in ${duration}ms)\n`);
      } else {
        console.log(`\nResults (${res.rows.length} row${res.rows.length > 1 ? 's' : ''} in ${duration}ms):`);
        console.table(res.rows);
      }
    } else {
      console.log(`\nQuery executed successfully in ${duration}ms.`);
      if (res.rowCount !== undefined) {
        console.log(`Rows affected: ${res.rowCount}`);
      }
    }
  } catch (err) {
    console.error(`\n[SQL Error] ${err.message}\n`);
  }
}

async function listTables() {
  try {
    const res = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name NOT LIKE 'knex_%'
      ORDER BY table_name;
    `);

    console.log('\n--- DeepTrace Database Tables ---');
    for (const row of res.rows) {
      const countRes = await db.raw(`SELECT count(*) FROM "${row.table_name}"`);
      console.log(`  * ${row.table_name.padEnd(20)} (${countRes.rows[0].count} rows)`);
    }
    console.log('');
  } catch (err) {
    console.error('Error listing tables:', err.message);
  }
}

async function describeTable(tableName) {
  try {
    const res = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ?
      ORDER BY ordinal_position;
    `, [tableName]);

    if (res.rows.length === 0) {
      console.log(`Table "${tableName}" not found.`);
      return;
    }

    console.log(`\nSchema for table: ${tableName}`);
    console.table(res.rows);
  } catch (err) {
    console.error('Error describing table:', err.message);
  }
}

function showChallenges() {
  console.log('\n========================================');
  console.log('       DeepTrace SQL Hands-on Lab        ');
  console.log('========================================');
  CHALLENGES.forEach(c => {
    console.log(`[Challenge ${c.id}] ${c.title}`);
    console.log(`  Task: ${c.task}`);
    console.log(`  Try it by typing the query directly! (or type .hint ${c.id} for hint, .solve ${c.id} for answer)\n`);
  });
}

function showHint(id) {
  const challenge = CHALLENGES.find(c => c.id === parseInt(id, 10));
  if (!challenge) {
    console.log(`Challenge ${id} not found.`);
    return;
  }
  console.log(`\n[Hint for Challenge ${challenge.id}]: ${challenge.hint}\n`);
}

function showSolution(id) {
  const challenge = CHALLENGES.find(c => c.id === parseInt(id, 10));
  if (!challenge) {
    console.log(`Challenge ${id} not found.`);
    return;
  }
  console.log(`\n[Solution for Challenge ${challenge.id}]:`);
  console.log(`  ${challenge.solution}\n`);
}

function showHelp() {
  console.log('\nAvailable Playground Commands:');
  console.log('  .tables               List all DeepTrace application tables & row counts');
  console.log('  .schema <table_name>  Show columns and data types for a table');
  console.log('  .challenges           View all hands-on SQL practice challenges');
  console.log('  .hint <number>        Show hint for a specific challenge');
  console.log('  .solve <number>       Show query solution for a specific challenge');
  console.log('  .help                 Show this help message');
  console.log('  exit / quit           Exit the playground');
  console.log('  Or simply type ANY valid SQL statement (SELECT, INSERT, UPDATE, etc.)\n');
}

async function startREPL() {
  console.log('\n======================================================');
  console.log('   DeepTrace Interactive SQL Playground (PostgreSQL)  ');
  console.log('======================================================');
  console.log('Connected to Neon PostgreSQL Database.');
  console.log('Type .tables to see tables, .challenges for practice tasks, or .help.');
  console.log('Type "exit" or press Ctrl+C to quit.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'deeptrace-sql> '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log('Goodbye! Exiting SQL Playground.');
      await db.destroy();
      process.exit(0);
    }

    if (input === '.tables' || input === '\\dt') {
      await listTables();
    } else if (input.startsWith('.schema ') || input.startsWith('\\d ')) {
      const tbl = input.split(' ')[1];
      await describeTable(tbl);
    } else if (input === '.challenges' || input === '\\c') {
      showChallenges();
    } else if (input.startsWith('.hint ')) {
      showHint(input.split(' ')[1]);
    } else if (input.startsWith('.solve ')) {
      showSolution(input.split(' ')[1]);
    } else if (input === '.help') {
      showHelp();
    } else {
      await executeQuery(input);
    }

    rl.prompt();
  });

  rl.on('close', async () => {
    await db.destroy();
    process.exit(0);
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const query = args.join(' ');
    if (query === '--challenges') {
      showChallenges();
      await db.destroy();
      process.exit(0);
    } else if (query === '--tables') {
      await listTables();
      await db.destroy();
      process.exit(0);
    } else {
      await executeQuery(query);
      await db.destroy();
      process.exit(0);
    }
  } else {
    await startREPL();
  }
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  await db.destroy();
  process.exit(1);
});
