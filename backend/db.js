// Dipertahankan agar kompatibel. Koneksi sebenarnya ada di config/Database.js
import { Database } from "./config/Database.js";

export default Database.getInstance().pool;
