import { BaseRepository } from "./BaseRepository.js";

export class KelasRepository extends BaseRepository {
  findTersedia(idPeriode, kodeProdi) {
    return this.many(
      `SELECT kl.id_kelas, kl.nama_kelas, kl.kuota, kl.hari, kl.jam, kl.ruang,
              mk.kode_mk, mk.nama_mk, mk.sks, mk.semester_ke,
              d.nama AS dosen,
              (SELECT COUNT(*) FROM krs_detail kd
               WHERE kd.id_kelas = kl.id_kelas AND kd.status <> 'ditolak')::int AS terisi
       FROM kelas kl
       JOIN mata_kuliah mk ON mk.kode_mk = kl.kode_mk
       LEFT JOIN dosen d ON d.id_dosen = kl.id_dosen
       WHERE kl.id_periode = $1 AND mk.kode_prodi = $2
       ORDER BY mk.semester_ke, mk.nama_mk, kl.nama_kelas`,
      [idPeriode, kodeProdi]
    );
  }

  /** Kunci baris kelas (dipakai dalam transaksi) agar cek kuota aman. */
  findByIdForUpdate(idKelas) {
    return this.one(
      `SELECT kl.*, mk.sks, mk.kode_prodi
       FROM kelas kl
       JOIN mata_kuliah mk ON mk.kode_mk = kl.kode_mk
       WHERE kl.id_kelas = $1
       FOR UPDATE OF kl`,
      [idKelas]
    );
  }

  async countTerisi(idKelas) {
    const row = await this.one(
      "SELECT COUNT(*)::int AS n FROM krs_detail WHERE id_kelas = $1 AND status <> 'ditolak'",
      [idKelas]
    );
    return row.n;
  }
}
