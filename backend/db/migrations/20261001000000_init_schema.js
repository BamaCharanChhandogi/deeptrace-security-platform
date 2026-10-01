/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Ensure UUID extension exists
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // 1. Tenants table
  await knex.schema.createTable('tenants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('slug', 100).unique().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 2. Users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('email', 255).notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('name', 255).notNullable();
    table.string('role', 20).notNullable().defaultTo('USER');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['tenant_id', 'email']);
  });

  // Add check constraint for role
  await knex.raw("ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('ADMIN', 'MANAGER', 'USER'))");

  // 3. Campaigns table
  await knex.schema.createTable('campaigns', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('status', 20).notNullable().defaultTo('DRAFT');
    table.date('start_date');
    table.date('end_date');
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'status']);
    table.index(['tenant_id', 'created_at']);
  });

  // Add check constraint for campaign status
  await knex.raw("ALTER TABLE campaigns ADD CONSTRAINT check_campaign_status CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'))");

  // 4. Campaign Members (junction table)
  await knex.schema.createTable('campaign_members', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('campaign_id').notNullable().references('id').inTable('campaigns').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('assigned_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('assigned_at').defaultTo(knex.fn.now());

    table.unique(['campaign_id', 'user_id']);
  });

  // 5. Security Events table
  await knex.schema.createTable('security_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('event_type', 50).notNullable();
    table.string('severity', 20).notNullable();
    table.string('status', 20).notNullable().defaultTo('OPEN');
    table.text('description').notNullable();
    table.string('source', 255);
    table.jsonb('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'severity']);
    table.index(['tenant_id', 'status']);
    table.index(['tenant_id', 'created_at']);
  });

  // Add check constraints for events
  await knex.raw("ALTER TABLE security_events ADD CONSTRAINT check_event_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))");
  await knex.raw("ALTER TABLE security_events ADD CONSTRAINT check_event_status CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'))");

  // 6. Audit Logs table
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 100).notNullable();
    table.string('entity_type', 50);
    table.uuid('entity_id');
    table.jsonb('details');
    table.string('ip_address', 50);
    table.text('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'created_at']);
    table.index(['tenant_id', 'action']);
  });

  // 7. Refresh Tokens table
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('token_hash');
    table.index('user_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('security_events');
  await knex.schema.dropTableIfExists('campaign_members');
  await knex.schema.dropTableIfExists('campaigns');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('tenants');
};
