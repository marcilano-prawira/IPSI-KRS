import { BaseRepository } from "./BaseRepository.js";

export class AturanRepository extends BaseRepository {
  /** Data mentah untuk SksLimitPolicy. */
  async getAturanSks() {
    const sem1 = await this.one(
      "SELECT nilai FROM aturan_akademik WHERE kode = 'MAX_SKS_SEMESTER_1'"
    );
    const tiers = await this.many("SELECT ips_min, max_sks FROM batas_sks_ips");
    return { batasSemester1: sem1?.nilai ?? 20, tiers };
  }
}
