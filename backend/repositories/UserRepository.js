import { BaseRepository } from "./BaseRepository.js";

export class UserRepository extends BaseRepository {
  findByUsername(username) {
    return this.one(
      `SELECT u.username, u.password, u.role, u.nim, m.nama
       FROM users u
       LEFT JOIN mahasiswa m ON m.nim = u.nim
       WHERE u.username = $1`,
      [username]
    );
  }
}
