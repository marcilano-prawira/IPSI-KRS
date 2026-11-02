-- ============================================================
-- Update: semester & IPS mahasiswa + batas SKS
-- AMAN: tidak menghapus data. Boleh dijalankan berulang kali.
-- ============================================================
BEGIN;

ALTER TABLE mahasiswa
  ADD COLUMN IF NOT EXISTS semester SMALLINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ips NUMERIC(3,2);

ALTER TABLE mahasiswa DROP CONSTRAINT IF EXISTS mahasiswa_semester_check;
ALTER TABLE mahasiswa ADD CONSTRAINT mahasiswa_semester_check
  CHECK (semester BETWEEN 1 AND 14);

ALTER TABLE mahasiswa DROP CONSTRAINT IF EXISTS mahasiswa_ips_check;
ALTER TABLE mahasiswa ADD CONSTRAINT mahasiswa_ips_check
  CHECK (ips IS NULL OR ips BETWEEN 0 AND 4);

-- Tabel batas SKS berdasarkan IPS (bisa diubah kapan saja lewat UPDATE)
CREATE TABLE IF NOT EXISTS batas_sks_ips (
  ips_min     NUMERIC(3,2) PRIMARY KEY,   -- IPS minimal untuk masuk tingkat ini
  max_sks     SMALLINT NOT NULL,
  keterangan  VARCHAR(100)
);

INSERT INTO batas_sks_ips (ips_min, max_sks, keterangan) VALUES
  (3.25, 24, 'IPS >= 3,25'),
  (2.75, 21, 'IPS 2,75 - 3,24'),
  (2.00, 18, 'IPS 2,00 - 2,74'),
  (0.00, 15, 'IPS < 2,00')
ON CONFLICT (ips_min) DO UPDATE
  SET max_sks = EXCLUDED.max_sks, keterangan = EXCLUDED.keterangan;

-- Batas khusus semester 1 (belum punya IPS)
INSERT INTO aturan_akademik (kode, nilai, keterangan)
VALUES ('MAX_SKS_SEMESTER_1', 20, 'Batas SKS mahasiswa semester 1')
ON CONFLICT (kode) DO UPDATE SET nilai = EXCLUDED.nilai, keterangan = EXCLUDED.keterangan;

COMMIT;

-- ============================================================
-- Isi semester & IPS tiap mahasiswa (contoh, ubah sesuai data):
--
--   UPDATE mahasiswa SET semester = 1, ips = NULL WHERE nim = '2026001';
--   UPDATE mahasiswa SET semester = 3, ips = 3.40 WHERE nim = '2025001';
--
-- Semester 1 : batas 20 SKS, IPS dibiarkan NULL.
-- Semester >= 2 : IPS WAJIB diisi, kalau kosong mahasiswa tidak bisa menambah mata kuliah.
-- ============================================================
