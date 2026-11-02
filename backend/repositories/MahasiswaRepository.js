import { BaseRepository } from "./BaseRepository.js";

export class MahasiswaRepository extends BaseRepository {
  findByNim(nim) {
    return this.one(
      `SELECT m.nim, m.nama, m.kode_prodi, m.semester, m.ips,
              p.nama_prodi, d.nama AS dosen_wali
       FROM mahasiswa m
       JOIN prodi p ON p.kode_prodi = m.kode_prodi
       LEFT JOIN dosen d ON d.id_dosen = m.id_dosen_pa
       WHERE m.nim = $1`,
      [nim]
    );
  }
}
