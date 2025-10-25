import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('wallets').del();

  // Inserts seed entries
  await knex('wallets').insert([
    {
      account_name: 'seun seun',
      provider: 'MainWallet',
      savings_id: '817515',
      user_id: 25,
      account_no:7930035765,
      balance: 15000.50,
      currency: 'NGN',
    },
    {
      account_name: 'bola bola',
      provider: 'MainWallet',
      savings_id: '566908',
      user_id: 26,
      balance: 8200.75,
      account_no:4258383256,
      currency: 'NGN',
    },
    {
      account_name: 'lade lade',
      provider: 'MainWallet',
      savings_id: '994330',
      user_id: 27,
      balance: 500.00,
      account_no:2205344191,
      currency: 'NGN',
    },
  ]);
}
