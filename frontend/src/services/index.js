import { SessionStore } from "./SessionStore.js";
import { ApiClient } from "./ApiClient.js";
import { AuthService } from "./AuthService.js";
import { KrsService } from "./KrsService.js";

const session = new SessionStore();
const api = new ApiClient(
  import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  session
);

export const authService = new AuthService(api, session);
export const krsService = new KrsService(api);
export { api };
