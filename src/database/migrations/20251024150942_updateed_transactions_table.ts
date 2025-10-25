import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
   return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('wallet_id').unsigned().notNullable();
    table.enum('type', ['credit', 'debit', 'transfer']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('reference', 100).notNullable().unique();
    table.text('description').nullable();
    table.integer('recipient_wallet_id').unsigned().nullable();
    table.enum('status', ['pending', 'completed', 'failed']).notNullable().defaultTo('completed');
    table.json('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('wallet_id').references('id').inTable('wallets').onDelete('CASCADE');
    table.foreign('recipient_wallet_id').references('id').inTable('wallets').onDelete('SET NULL');
    
    table.index('wallet_id');
    table.index('reference');
    table.index('created_at');
    table.index(['wallet_id', 'created_at']);
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}

