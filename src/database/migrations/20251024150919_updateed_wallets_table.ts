import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('wallets', (table) => {
    table.increments('id').primary();
    table.string('account_name', 100).nullable();
    table.string("account_no", 50).notNullable().unique()
    table.string('provider', 30).notNullable();
    table.string('savings_id', 6).notNullable().unique()
    table.integer('user_id').unsigned().notNullable().unique();
    table.decimal('balance', 15, 2).notNullable().defaultTo(0);
    table.string('currency', 3).notNullable().defaultTo('NGN');
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    table.index('user_id');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wallets');
}

