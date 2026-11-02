import { HttpError } from "../errors/HttpError.js";

export class ErrorHandler {
  static handle(err, req, res, next) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    if (err.code === "23505") return res.status(409).json({ message: "Data sudah ada" });
    if (err.code === "23503") return res.status(400).json({ message: "Data referensi tidak valid" });
    res.status(500).json({ message: "Server Error" });
  }
}
