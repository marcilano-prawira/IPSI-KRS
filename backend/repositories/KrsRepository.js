import { BaseRepository } from "./BaseRepository.js";

export class KrsRepository extends BaseRepository {
  findDetailByNim(nim, idPeriode) {
    return this.many(
      `SELECT kd.id_kelas, kd.status, kd.catatan,
              kl.nama_kelas, kl.hari, kl.jam, kl.ruang,
              mk.kode_mk, mk.nama_mk, mk.sks, mk.semester_ke,
              d.nama AS dosen
       FROM krs_detail kd
       JOIN krs k ON k.id_krs = kd.id_krs
       JOIN kelas kl ON kl.id_kelas = kd.id_kelas
       JOIN mata_kuliah mk ON mk.kode_mk = kl.kode_mk
       LEFT JOIN dosen d ON d.id_dosen = kl.id_dosen
       WHERE k.nim = $1 AND k.id_periode = $2
       ORDER BY mk.semester_ke, mk.nama_mk`,
      [nim, idPeriode]
    );
  }

  /** Ambil KRS milik mahasiswa di periode ini; dibuat otomatis kalau belum ada. */
  async ensureKrs(nim, idPeriode) {
    await this.db.query(
      `INSERT INTO krs (nim, id_periode) VALUES ($1, $2)
       ON CONFLICT (nim, id_periode) DO NOTHING`,
      [nim, idPeriode]
    );
    const row = await this.one(
      "SELECT id_krs FROM krs WHERE nim = $1 AND id_periode = $2 FOR UPDATE",
      [nim, idPeriode]
    );
    return row.id_krs;
  }

  async mataKuliahSudahDiambil(idKrs, kodeMk) {
    const row = await this.one(
      `SELECT 1 FROM krs_detail kd
       JOIN kelas kl ON kl.id_kelas = kd.id_kelas
       WHERE kd.id_krs = $1 AND kl.kode_mk = $2 AND kd.status <> 'ditolak'`,
      [idKrs, kodeMk]
    );
    return row !== null;
  }

  async totalSks(idKrs) {
    const row = await this.one(
      `SELECT COALESCE(SUM(mk.sks), 0)::int AS total
       FROM krs_detail kd
       JOIN kelas kl ON kl.id_kelas = kd.id_kelas
       JOIN mata_kuliah mk ON mk.kode_mk = kl.kode_mk
       WHERE kd.id_krs = $1 AND kd.status <> 'ditolak'`,
      [idKrs]
    );
    return row.total;
  }

  /** Tambah ke keranjang; kalau sebelumnya ditolak, aktifkan lagi sebagai draft. */
  addDetail(idKrs, idKelas) {
    return this.db.query(
      `INSERT INTO krs_detail (id_krs, id_kelas) VALUES ($1, $2)
       ON CONFLICT (id_krs, id_kelas)
       DO UPDATE SET status = 'draft', catatan = NULL
       WHERE krs_detail.status = 'ditolak'`,
      [idKrs, idKelas]
    );
  }

  /** Hapus mata kuliah selama belum disetujui. Mengembalikan jumlah baris terhapus. */
  async removeDetail(nim, idKelas) {
    const rows = await this.many(
      `DELETE FROM krs_detail kd
       USING krs k
       WHERE kd.id_krs = k.id_krs
         AND k.nim = $1 AND kd.id_kelas = $2
         AND kd.status <> 'disetujui'
       RETURNING kd.id_kelas`,
      [nim, idKelas]
    );
    return rows.length;
  }

  /** Ajukan semua draft/ditolak ke dosen wali. Mengembalikan jumlah baris. */
  async submitAll(nim, idPeriode) {
    const rows = await this.many(
      `UPDATE krs_detail kd
       SET status = 'diajukan', catatan = NULL
       FROM krs k
       WHERE kd.id_krs = k.id_krs
         AND k.nim = $1 AND k.id_periode = $2
         AND kd.status IN ('draft', 'ditolak')
       RETURNING kd.id_kelas`,
      [nim, idPeriode]
    );
    return rows.length;
  }
}
