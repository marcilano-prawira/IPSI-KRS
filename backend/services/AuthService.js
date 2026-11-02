import jwt from "jsonwebtoken";
import { HttpError } from "../errors/HttpError.js";

export class AuthService {
  constructor({ userRepository, passwordVerifier, jwtSecret, expiresIn = "8h" }) {
    this.userRepository = userRepository;
    this.passwordVerifier = passwordVerifier;
    this.jwtSecret = jwtSecret;
    this.expiresIn = expiresIn;
  }

  async login(username, password) {
    if (!username || !password) {
      throw HttpError.badRequest("NIM dan password wajib diisi");
    }

    const user = await this.userRepository.findByUsername(username);
    const valid = user && (await this.passwordVerifier.verify(password, user.password));
    if (!valid) throw HttpError.unauthorized("NIM atau password salah");

    const token = jwt.sign(
      { username: user.username, role: user.role, nim: user.nim },
      this.jwtSecret,
      { expiresIn: this.expiresIn }
    );

    return {
      token,
      user: { username: user.username, role: user.role, nim: user.nim, nama: user.nama },
    };
  }

  verifyToken(token) {
    return jwt.verify(token, this.jwtSecret);
  }
}
