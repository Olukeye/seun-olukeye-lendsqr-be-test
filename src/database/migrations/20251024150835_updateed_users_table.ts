import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20).notNullable();
    table.boolean('is_blacklisted').defaultTo(false);
    table.timestamps(true, true);
    
    table.index('email');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}

