/** Klien HTTP: otomatis menyisipkan token dan menangani error. */
export class ApiClient {
  constructor(baseUrl, session) {
    this.baseUrl = baseUrl;
    this.session = session;
    this.onUnauthorized = () => {};
  }

  async request(path, { method = "GET", body } = {}) {
    const token = this.session.getToken();
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));

    // 401 saat sedang login (belum ada token) berarti NIM/password salah, bukan sesi habis
    if (res.status === 401 && token) this.onUnauthorized();
    if (!res.ok) throw new Error(data.message || "Terjadi kesalahan");
    return data;
  }

  get(path) { return this.request(path); }
  post(path, body) { return this.request(path, { method: "POST", body }); }
  delete(path) { return this.request(path, { method: "DELETE" }); }
}
