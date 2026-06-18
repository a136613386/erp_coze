import 'server-only';

import mysql, {
  type Pool,
  type PoolConnection,
  type QueryResult,
  type ResultSetHeader,
  type RowDataPacket,
} from 'mysql2/promise';

declare global {
  var __erpMysqlPool: Pool | undefined;
}

function getEnvValue(names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }

  return undefined;
}

function getRequiredEnv(names: string[]) {
  const value = getEnvValue(names);
  if (!value) {
    throw new Error(`Missing required environment variable: ${names.join(' or ')}`);
  }

  return value;
}

function createPool() {
  return mysql.createPool({
    host: getRequiredEnv(['ERP_DB_HOST', 'MYSQL_HOST']),
    port: Number(getEnvValue(['ERP_DB_PORT', 'MYSQL_PORT']) ?? 3306),
    user: getRequiredEnv(['ERP_DB_USER', 'MYSQL_USER']),
    password: getRequiredEnv(['ERP_DB_PASSWORD', 'MYSQL_PASSWORD']),
    database: getRequiredEnv(['ERP_DB_NAME', 'MYSQL_DATABASE']),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export function getMysqlPool() {
  if (!globalThis.__erpMysqlPool) {
    globalThis.__erpMysqlPool = createPool();
  }

  return globalThis.__erpMysqlPool;
}

export async function queryRows<T extends RowDataPacket>(sql: string, params: unknown[] = []) {
  const [rows] = await getMysqlPool().query<T[]>(sql, params);
  return rows;
}

export async function executeStatement<T extends QueryResult = ResultSetHeader>(
  sql: string,
  params: unknown[] = []
) {
  const [result] = await getMysqlPool().execute<T>(sql, params as never[]);
  return result;
}

export async function withTransaction<T>(callback: (connection: PoolConnection) => Promise<T>) {
  const connection = await getMysqlPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
