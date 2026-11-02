import { Router } from "express";

export function createKrsRouter(krsController) {
  const router = Router();
  router.get("/saya", krsController.saya);
  router.get("/kelas", krsController.kelas);
  router.post("/detail", krsController.tambah);
  router.delete("/detail/:id_kelas", krsController.hapus);
  router.post("/ajukan", krsController.ajukan);
  return router;
}
