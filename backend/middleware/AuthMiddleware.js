import { HttpError } from "../errors/HttpError.js";

export class AuthMiddleware {
  constructor(authService) {
    this.authService = authService;
  }

  /** Wajib login: baca token Bearer, isi req.user. */
  authenticate = (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return next(HttpError.unauthorized("Silakan login terlebih dahulu"));
    try {
      req.user = this.authService.verifyToken(token); // { username, role, nim }
      next();
    } catch {
      next(HttpError.unauthorized("Sesi berakhir, silakan login ulang"));
    }
  };

  requireRole = (role) => (req, res, next) =>
    req.user?.role === role ? next() : next(HttpError.forbidden("Akses ditolak"));
}
