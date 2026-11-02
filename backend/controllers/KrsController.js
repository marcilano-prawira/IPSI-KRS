import { BaseController } from "./BaseController.js";

export class KrsController extends BaseController {
  constructor(krsService) {
    super();
    this.krsService = krsService;
  }

  // NIM selalu dari token (req.user), bukan dari input pengguna.
  saya = this.handle(async (req, res) => {
    res.json(await this.krsService.getKrsSaya(req.user.nim));
  });

  kelas = this.handle(async (req, res) => {
    res.json(await this.krsService.getKelasTersedia(req.user.nim));
  });

  tambah = this.handle(async (req, res) => {
    const result = await this.krsService.tambahKelas(req.user.nim, req.body.id_kelas);
    res.status(201).json(result);
  });

  hapus = this.handle(async (req, res) => {
    res.json(await this.krsService.hapusKelas(req.user.nim, req.params.id_kelas));
  });

  ajukan = this.handle(async (req, res) => {
    res.json(await this.krsService.ajukan(req.user.nim));
  });
}
