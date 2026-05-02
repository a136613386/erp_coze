import 'server-only';

import mysql, { type Pool, type PoolOptions } from 'mysql2/promise';

declare global {
  var __mysqlPool__: Pool | undefined;
}

function getPoolConfig(): PoolOptions {
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DATABASE || 'erp_local',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
  };
}

export function getDb() {
  if (!global.__mysqlPool__) {
    global.__mysqlPool__ = mysql.createPool(getPoolConfig());
  }

  return global.__mysqlPool__;
}
