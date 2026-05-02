import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';

const config = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3307),
  rootUser: process.env.MYSQL_ROOT_USER || 'root',
  rootPassword: process.env.MYSQL_ROOT_PASSWORD,
  appUser: process.env.MYSQL_USER || 'erp_app',
  appPassword: process.env.MYSQL_PASSWORD || 'ErpApp_2026!',
  database: process.env.MYSQL_DATABASE || 'erp_app_utf8',
};

if (!config.rootPassword) {
  throw new Error('MYSQL_ROOT_PASSWORD is required to create and grant the database.');
}

function splitSqlStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map(statement => statement.trim())
    .filter(Boolean);
}

const rootConnection = await mysql.createConnection({
  host: config.host,
  port: config.port,
  user: config.rootUser,
  password: config.rootPassword,
  charset: 'utf8mb4',
  multipleStatements: false,
});

await rootConnection.query(
  `CREATE DATABASE IF NOT EXISTS \`${config.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
);
await rootConnection.query(
  `CREATE USER IF NOT EXISTS ?@'127.0.0.1' IDENTIFIED BY ?`,
  [config.appUser, config.appPassword]
);
await rootConnection.query(
  `CREATE USER IF NOT EXISTS ?@'localhost' IDENTIFIED BY ?`,
  [config.appUser, config.appPassword]
);
await rootConnection.query(`GRANT ALL PRIVILEGES ON \`${config.database}\`.* TO ?@'127.0.0.1'`, [
  config.appUser,
]);
await rootConnection.query(`GRANT ALL PRIVILEGES ON \`${config.database}\`.* TO ?@'localhost'`, [
  config.appUser,
]);
await rootConnection.query('FLUSH PRIVILEGES');
await rootConnection.end();

const sqlPath = path.resolve('erp_db.sql');
const sql = await fs.readFile(sqlPath, 'utf8');
const adjustedSql = sql.replace(/^USE\s+erp_local;/m, `USE \`${config.database}\`;`);
const statements = splitSqlStatements(adjustedSql);

const appConnection = await mysql.createConnection({
  host: config.host,
  port: config.port,
  user: config.appUser,
  password: config.appPassword,
  database: config.database,
  charset: 'utf8mb4',
  multipleStatements: false,
});

for (const statement of statements) {
  await appConnection.query(statement);
}

const [counts] = await appConnection.query(`
  SELECT
    (SELECT COUNT(*) FROM customer_t) AS customers,
    (SELECT COUNT(*) FROM order_t) AS orders,
    (SELECT COUNT(*) FROM inventory_t) AS inventory,
    (SELECT COUNT(*) FROM finance_t) AS finance
`);

await appConnection.end();

console.log(`Imported ${sqlPath} into ${config.database}.`);
console.table(counts);
