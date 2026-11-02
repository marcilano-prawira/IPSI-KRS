/**
 * Pengecek password sementara (teks biasa).
 * Nanti cukup buat BcryptPasswordVerifier dengan method verify() yang sama
 * (bcrypt.compare) lalu ganti di index.js. Kelas lain tidak perlu diubah.
 */
export class PlainPasswordVerifier {
  async verify(plain, stored) {
    return plain === stored;
  }
}
