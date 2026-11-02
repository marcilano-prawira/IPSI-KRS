/** Menyimpan token & data user di localStorage. */
export class SessionStore {
  getToken() {
    return localStorage.getItem("token");
  }

  getUser() {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }

  save(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  clear() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}
