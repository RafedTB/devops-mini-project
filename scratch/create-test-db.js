const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: 'admin',
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='nestlearn_test'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE nestlearn_test');
      console.log('Database nestlearn_test created successfully!');
    } else {
      console.log('Database nestlearn_test already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
  } finally {
    await client.end();
  }
}

main();
