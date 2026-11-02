export class AuthService {
  constructor(api, session) {
    this.api = api;
    this.session = session;
  }

  async login(username, password) {
    this.session.clear();
    const { token, user } = await this.api.post("/auth/login", { username, password });
    this.session.save(token, user);
    return user;
  }

  logout() {
    this.session.clear();
  }

  currentUser() {
    return this.session.getUser();
  }
}
