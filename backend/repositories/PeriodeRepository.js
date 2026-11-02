import { BaseRepository } from "./BaseRepository.js";

export class PeriodeRepository extends BaseRepository {
  /** Periode terbaru dianggap periode aktif. */
  findAktif() {
    return this.one(
      "SELECT id_periode, nama_periode FROM periode ORDER BY tgl_mulai DESC LIMIT 1"
    );
  }
}
