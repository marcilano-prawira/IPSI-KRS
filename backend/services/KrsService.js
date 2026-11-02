import { HttpError } from "../errors/HttpError.js";
import { SksLimitPolicy } from "./SksLimitPolicy.js";

/**
 * Seluruh aturan bisnis KRS ada di sini.
 * Controller hanya meneruskan request, repository hanya mengurus SQL.
 */
export class KrsService {
  constructor({ db, mahasiswaRepo, periodeRepo, aturanRepo, kelasRepo, krsRepo }) {
    this.db = db;
    this.mahasiswaRepo = mahasiswaRepo;
    this.periodeRepo = periodeRepo;
    this.aturanRepo = aturanRepo;
    this.kelasRepo = kelasRepo;
    this.krsRepo = krsRepo;
  }

  // ---------- helper ----------
  async #getMahasiswa(nim, repo = this.mahasiswaRepo) {
    const mhs = await repo.findByNim(nim);
    if (!mhs) throw HttpError.notFound("Mahasiswa tidak ditemukan");
    return mhs;
  }

  async #getPeriodeAktif(repo = this.periodeRepo) {
    const periode = await repo.findAktif();
    if (!periode) throw HttpError.notFound("Periode belum tersedia");
    return periode;
  }

  /** Batas SKS mahasiswa berdasarkan semester & IPS. */
  async #hitungBatasSks(mahasiswa, repo = this.aturanRepo) {
    const policy = new SksLimitPolicy(await repo.getAturanSks());
    return policy.hitung(mahasiswa);
  }

  // ---------- use case ----------
  async getKrsSaya(nim) {
    const mahasiswa = await this.#getMahasiswa(nim);
    const periode = await this.#getPeriodeAktif();
    const batas = await this.#hitungBatasSks(mahasiswa);
    const detail = await this.krsRepo.findDetailByNim(nim, periode.id_periode);
    return {
      mahasiswa,
      periode,
      maxSks: batas.maxSks,
      keteranganBatas: batas.keterangan,
      detail,
    };
  }

  async getKelasTersedia(nim) {
    const mahasiswa = await this.#getMahasiswa(nim);
    const periode = await this.#getPeriodeAktif();
    return this.kelasRepo.findTersedia(periode.id_periode, mahasiswa.kode_prodi);
  }

  async tambahKelas(nim, idKelas) {
    if (!idKelas) throw HttpError.badRequest("Kelas wajib dipilih");

    await this.db.transaction(async (client) => {
      const mahasiswaRepo = this.mahasiswaRepo.withClient(client);
      const periodeRepo = this.periodeRepo.withClient(client);
      const aturanRepo = this.aturanRepo.withClient(client);
      const kelasRepo = this.kelasRepo.withClient(client);
      const krsRepo = this.krsRepo.withClient(client);

      const mahasiswa = await this.#getMahasiswa(nim, mahasiswaRepo);
      const periode = await this.#getPeriodeAktif(periodeRepo);

      const batas = await this.#hitungBatasSks(mahasiswa, aturanRepo);
      if (batas.maxSks === null) throw HttpError.badRequest(batas.keterangan);

      const kelas = await kelasRepo.findByIdForUpdate(idKelas);
      if (!kelas) throw HttpError.notFound("Kelas tidak ditemukan");
      if (kelas.id_periode !== periode.id_periode) {
        throw HttpError.badRequest("Kelas bukan dari periode aktif");
      }
      if (kelas.kode_prodi !== mahasiswa.kode_prodi) {
        throw HttpError.forbidden("Kelas ini bukan dari prodi kamu");
      }

      const idKrs = await krsRepo.ensureKrs(nim, periode.id_periode);

      if ((await kelasRepo.countTerisi(idKelas)) >= kelas.kuota) {
        throw HttpError.badRequest("Kuota kelas sudah penuh");
      }
      if (await krsRepo.mataKuliahSudahDiambil(idKrs, kelas.kode_mk)) {
        throw HttpError.badRequest("Mata kuliah ini sudah diambil");
      }

      const totalSks = await krsRepo.totalSks(idKrs);
      if (totalSks + kelas.sks > batas.maxSks) {
        throw HttpError.badRequest(
          `Total SKS melebihi batas maksimal (${batas.maxSks} SKS). ${batas.keterangan}`
        );
      }

      await krsRepo.addDetail(idKrs, idKelas);
    });

    return { message: "Mata kuliah ditambahkan ke keranjang" };
  }

  async hapusKelas(nim, idKelas) {
    const deleted = await this.krsRepo.removeDetail(nim, idKelas);
    if (deleted === 0) {
      throw HttpError.badRequest("Mata kuliah tidak ditemukan atau sudah disetujui");
    }
    return { message: "Mata kuliah dihapus" };
  }

  async ajukan(nim) {
    const periode = await this.#getPeriodeAktif();
    const count = await this.krsRepo.submitAll(nim, periode.id_periode);
    if (count === 0) {
      throw HttpError.badRequest("Tidak ada mata kuliah di keranjang yang bisa diajukan");
    }
    return { message: `${count} mata kuliah diajukan` };
  }
}
