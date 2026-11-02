/**
 * Kelas dasar repository.
 * `db` boleh berupa Database (pool) atau client transaksi, keduanya punya .query().
 */
export class BaseRepository {
  constructor(db) {
    this.db = db;
  }

  /** Salinan repository yang memakai client transaksi. */
  withClient(client) {
    return new this.constructor(client);
  }

  async many(text, params) {
    return (await this.db.query(text, params)).rows;
  }

  async one(text, params) {
    return (await this.db.query(text, params)).rows[0] ?? null;
  }
}
