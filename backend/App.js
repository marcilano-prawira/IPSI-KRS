import express from "express";
import cors from "cors";

import { Database } from "./config/Database.js";
import { ErrorHandler } from "./middleware/ErrorHandler.js";
import { AuthMiddleware } from "./middleware/AuthMiddleware.js";

import { UserRepository } from "./repositories/UserRepository.js";
import { MahasiswaRepository } from "./repositories/MahasiswaRepository.js";
import { PeriodeRepository } from "./repositories/PeriodeRepository.js";
import { AturanRepository } from "./repositories/AturanRepository.js";
import { KelasRepository } from "./repositories/KelasRepository.js";
import { KrsRepository } from "./repositories/KrsRepository.js";

import { PlainPasswordVerifier } from "./services/PlainPasswordVerifier.js";
import { AuthService } from "./services/AuthService.js";
import { KrsService } from "./services/KrsService.js";

import { AuthController } from "./controllers/AuthController.js";
import { KrsController } from "./controllers/KrsController.js";

import { createAuthRouter } from "./routes/authRoutes.js";
import { createKrsRouter } from "./routes/IPSI_KRS.js";

/**
 * Titik rakit aplikasi: membuat semua objek dan menyambungkannya
 * (dependency injection manual).
 */
export class App {
  constructor({ port = 5000 } = {}) {
    this.port = port;
    this.server = express();
    this.#compose();
  }

  #compose() {
    const db = Database.getInstance();

    // repository
    const userRepo = new UserRepository(db);
    const mahasiswaRepo = new MahasiswaRepository(db);
    const periodeRepo = new PeriodeRepository(db);
    const aturanRepo = new AturanRepository(db);
    const kelasRepo = new KelasRepository(db);
    const krsRepo = new KrsRepository(db);

    // service
    const authService = new AuthService({
      userRepository: userRepo,
      passwordVerifier: new PlainPasswordVerifier(), // ganti ke bcrypt nanti
      jwtSecret: process.env.JWT_SECRET || "ganti-rahasia-ini-saat-deploy",
    });
    const krsService = new KrsService({
      db, mahasiswaRepo, periodeRepo, aturanRepo, kelasRepo, krsRepo,
    });

    // controller + middleware
    const authController = new AuthController(authService);
    const krsController = new KrsController(krsService);
    const authMw = new AuthMiddleware(authService);

    // routing
    this.server.use(cors());
    this.server.use(express.json());
    this.server.get("/", (req, res) => res.send("API KRS berjalan"));
    this.server.use("/api/auth", createAuthRouter(authController));
    this.server.use(
      "/api/krs",
      authMw.authenticate,
      authMw.requireRole("mahasiswa"),
      createKrsRouter(krsController)
    );
    this.server.use(ErrorHandler.handle);
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
