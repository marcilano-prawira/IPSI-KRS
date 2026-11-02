export class KrsService {
  constructor(api) {
    this.api = api;
  }

  getSaya() { return this.api.get("/krs/saya"); }
  getKelas() { return this.api.get("/krs/kelas"); }
  tambah(idKelas) { return this.api.post("/krs/detail", { id_kelas: idKelas }); }
  hapus(idKelas) { return this.api.delete(`/krs/detail/${idKelas}`); }
  ajukan() { return this.api.post("/krs/ajukan"); }
}
