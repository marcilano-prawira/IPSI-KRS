import pg from "pg";

/**
 * Pembungkus koneksi PostgreSQL (Singleton).
 * Semua repository memakai satu pool yang sama.
 */
export class Database {
  static #instance = null;

  constructor() {
    this.pool = new pg.Pool({
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "inipostgre",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "IPSI_KRS",
    });
  }

  static getInstance() {
    if (!Database.#instance) Database.#instance = new Database();
    return Database.#instance;
  }

  query(text, params) {
    return this.pool.query(text, params);
  }

  /** Jalankan beberapa query dalam satu transaksi. */
  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
