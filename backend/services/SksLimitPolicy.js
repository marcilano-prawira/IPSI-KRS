/**
 * Aturan batas SKS berdasarkan semester dan IPS.
 * - Semester 1 (belum punya IPS): batas tetap (bawaan 20 SKS).
 * - Semester 2 ke atas: mengikuti tabel batas_sks_ips (IPS minimal -> SKS maksimal).
 * Angka-angkanya dibaca dari database, jadi bisa diubah tanpa mengubah kode.
 */
export class SksLimitPolicy {
  constructor({ batasSemester1, tiers }) {
    this.batasSemester1 = Number(batasSemester1);
    this.tiers = tiers
      .map((t) => ({ ipsMin: Number(t.ips_min), maxSks: Number(t.max_sks) }))
      .sort((a, b) => b.ipsMin - a.ipsMin); // dari IPS terbesar
  }

  /** @returns {{maxSks: number|null, keterangan: string}} maxSks null = tidak bisa ditentukan */
  hitung({ semester, ips }) {
    if (Number(semester) <= 1) {
      return {
        maxSks: this.batasSemester1,
        keterangan: `Semester 1: batas ${this.batasSemester1} SKS`,
      };
    }

    if (ips === null || ips === undefined || ips === "") {
      return {
        maxSks: null,
        keterangan: "IPS kamu belum terdaftar, hubungi bagian akademik",
      };
    }

    const nilai = Number(ips);
    const tier = this.tiers.find((t) => nilai >= t.ipsMin);
    if (!tier) {
      return { maxSks: null, keterangan: "Batas SKS untuk IPS ini belum diatur" };
    }
    return {
      maxSks: tier.maxSks,
      keterangan: `IPS ${nilai.toFixed(2)}: batas ${tier.maxSks} SKS`,
    };
  }
}
