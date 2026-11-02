BEGIN;

-- ===== 1. STRUKTUR =====
ALTER TABLE krs DROP COLUMN IF EXISTS status;

ALTER TABLE krs_detail
  ADD COLUMN IF NOT EXISTS status  VARCHAR(10) NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS catatan VARCHAR(200);
ALTER TABLE krs_detail DROP CONSTRAINT IF EXISTS krs_detail_status_check;
ALTER TABLE krs_detail ADD CONSTRAINT krs_detail_status_check
  CHECK (status IN ('draft','diajukan','disetujui','ditolak'));

ALTER TABLE kelas
  ADD COLUMN IF NOT EXISTS hari  VARCHAR(10),
  ADD COLUMN IF NOT EXISTS jam   VARCHAR(15),
  ADD COLUMN IF NOT EXISTS ruang VARCHAR(20);

CREATE TABLE IF NOT EXISTS users (
  id_user   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username  VARCHAR(20) UNIQUE NOT NULL,          -- NIM
  password  VARCHAR(100) NOT NULL,                -- sementara plain text
  role      VARCHAR(10) NOT NULL DEFAULT 'mahasiswa'
            CHECK (role IN ('mahasiswa','dosen')),
  nim       VARCHAR(12) REFERENCES mahasiswa(nim) ON DELETE CASCADE,
  id_dosen  INT REFERENCES dosen(id_dosen) ON DELETE CASCADE
);

-- ===== 2. KOSONGKAN DATA LAMA =====
TRUNCATE users, krs_detail, krs, kelas, mata_kuliah, mahasiswa,
         dosen, periode, prodi RESTART IDENTITY CASCADE;

-- ===== 3. DATA DASAR =====
INSERT INTO aturan_akademik (kode, nilai, keterangan)
VALUES ('MAX_SKS', 24, 'Batas maksimal SKS per semester')
ON CONFLICT (kode) DO NOTHING;

INSERT INTO prodi VALUES ('SI', 'Sistem Informasi', 'S1');

INSERT INTO periode VALUES ('20261', 'Ganjil 2026/2027', '2026-09-01', '2027-01-31');

-- ===== 4. DOSEN (NIDN = placeholder, ganti nanti) =====
INSERT INTO dosen (nidn, nama, kode_prodi) VALUES
  ('D01', 'Dr. Ir. Sigit Anggoro, S.T., M.T., IPM', 'SI'),
  ('D02', 'Faiza Renaldi, S.T., M.Sc', 'SI'),
  ('D03', 'Tacbir Hendro Pudjiantoro, S.Si., M.T', 'SI'),
  ('D04', 'Amanda Aprilia Dwisanny, S.T., M.Kom', 'SI'),
  ('D05', 'Dion Abimanyu, S.Pd., M.Pd', 'SI'),
  ('D06', 'Widuri Wulandari, S.I.P., M.I.P', 'SI'),
  ('D07', 'Noer Apptika Fujilestari, S.I.P., M.Si', 'SI'),
  ('D08', 'Syarif Sahidin, S.Kom.I., M.Sos', 'SI'),
  ('D09', 'Irma Santikarama, S.Kom., M.T', 'SI'),
  ('D10', 'Dea Destiani, S.Kom., M.Kom', 'SI'),
  ('D11', 'Dr. Esmeralda Contesa Djamal, S.T., M.T', 'SI'),
  ('D12', 'Soni Yora, S.Kom., M.Kom', 'SI'),
  ('D13', 'Prof. Dr. Heni Nurani Hartikayanti, S.E., M.Si., Ak., CA', 'SI');

-- ===== 5. MATA KULIAH =====
INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, semester_ke, kode_prodi) VALUES
  -- Semester 1
  ('SI101', 'Konsep Sistem Informasi', 3, 1, 'SI'),
  ('SI102', 'Proses Bisnis', 3, 1, 'SI'),
  ('SI103', 'Praktikum Algoritma dan Pemrograman', 1, 1, 'SI'),
  ('SI104', 'Praktikum Proses Bisnis', 1, 1, 'SI'),
  ('SI105', 'Praktikum Konsep Sistem Informasi', 1, 1, 'SI'),
  ('SI106', 'Algoritma dan Pemrograman', 2, 1, 'SI'),
  ('UM101', 'Bahasa Indonesia', 2, 1, 'SI'),
  ('UM102', 'Latihan Dasar Kedisiplinan dan Kepemimpinan', 2, 1, 'SI'),
  ('UM103', 'Pendidikan Pancasila', 2, 1, 'SI'),
  ('UM104', 'Pendidikan Agama', 2, 1, 'SI'),
  -- Semester 3
  ('SI301', 'Perusahaan Rintisan Digital', 3, 3, 'SI'),
  ('SI302', 'Statistika Terapan', 3, 3, 'SI'),
  ('SI303', 'Manajemen Data', 3, 3, 'SI'),
  ('SI304', 'Analisis Perancangan Sistem Informasi', 3, 3, 'SI'),
  ('SI305', 'Pemrograman Obyek', 3, 3, 'SI'),
  ('SI306', 'Praktikum Analisis Perancangan Sistem Informasi', 1, 3, 'SI'),
  ('SI307', 'Praktikum Pemrograman Obyek', 1, 3, 'SI'),
  ('UM301', 'Bahasa Indonesia', 2, 3, 'SI'),
  ('UM302', 'Pendidikan Agama', 2, 3, 'SI'),
  -- Semester 5
  ('SI501', 'Manajemen Proyek Sistem Informasi', 3, 5, 'SI'),
  ('SI502', 'Komunikasi Data dan Jaringan', 2, 5, 'SI'),
  ('SI503', 'Metode Penelitian', 3, 5, 'SI'),
  ('SI504', 'Data Science', 3, 5, 'SI'),
  ('SI505', 'Implementasi dan Pengujian Sistem Informasi', 2, 5, 'SI'),
  ('SI506', 'Praktikum Implementasi dan Pengujian Sistem Informasi', 1, 5, 'SI'),
  ('SI507', 'Knowledge Management', 3, 5, 'SI'),
  ('SI508', 'Praktikum Pemrograman Mobile', 1, 5, 'SI'),
  ('SI509', 'Pemrograman Mobile', 2, 5, 'SI'),
  -- Semester 7
  ('SI701', 'Enterprise Resource Planning', 3, 7, 'SI'),
  ('SI702', 'Kerja Praktik', 4, 7, 'SI'),
  ('SI703', 'Tugas Akhir I', 4, 7, 'SI');

-- ===== 6. KELAS + JADWAL (periode Ganjil 2026/2027) =====
INSERT INTO kelas (kode_mk, id_periode, id_dosen, nama_kelas, kuota, hari, jam, ruang)
SELECT v.kode_mk, '20261', d.id_dosen, v.kelas, 40, v.hari, v.jam, v.ruang
FROM (VALUES
  -- Semester 1
  ('SI101','A','D01','Senin',  '07.00-09.50','R 2-8'),
  ('SI102','A','D02','Senin',  '10.00-12.50','R 3-1'),
  ('SI103','A','D03','Selasa', '13.00-14.50','Lab Komp 2.5'),
  ('SI104','A','D02','Selasa', '13.00-14.50','Lab Komp 2.5'),
  ('SI105','A','D04','Selasa', '15.00-16.50','Lab Komp 2.5'),
  ('UM101','A','D05','Rabu',   '07.00-08.50','R 3-1'),
  ('SI106','A','D03','Rabu',   '09.00-11.50','R 3-1'),
  ('UM102','A','D06','Kamis',  '07.00-08.50','R 3-1'),
  ('UM103','A','D07','Kamis',  '09.00-10.50','R 3-1'),
  ('UM104','A','D08','Kamis',  '15.00-16.50','R 3-1'),
  -- Semester 3
  ('SI301','A','D02','Senin',  '07.00-09.50','R 3-1'),
  ('SI302','A','D01','Senin',  '10.00-12.50','R 2-8'),
  ('SI303','A','D03','Selasa', '07.00-09.50','R 3-1'),
  ('SI304','A','D09','Selasa', '10.00-12.50','R 3-1'),
  ('SI305','A','D10','Rabu',   '09.00-11.50','R 2-7'),
  ('SI306','A','D09','Rabu',   '13.00-14.50','Lab Komp 2.5'),
  ('UM301','A','D05','Kamis',  '07.00-08.50','R 3-1'),
  ('SI307','A','D10','Kamis',  '09.00-10.50','Lab Komp 2.5'),
  ('UM302','A','D08','Kamis',  '13.00-14.50','R 3-1'),
  -- Semester 5
  ('SI501','A','D09','Senin',  '07.00-09.50','R 2-7'),
  ('SI501','B','D09','Senin',  '07.00-09.50','R 2-7'),
  ('SI502','A','D01','Senin',  '15.00-16.50','R 2-8'),
  ('SI502','B','D01','Senin',  '13.00-14.50','R 2-8'),
  ('SI503','A','D10','Selasa', '07.00-09.50','R 2-7'),
  ('SI503','B','D11','Selasa', '07.00-09.50','R 2-8'),
  ('SI504','A','D02','Selasa', '10.00-12.50','R 2-7'),
  ('SI504','B','D04','Selasa', '10.00-12.50','R 2-8'),
  ('SI505','A','D09','Rabu',   '07.00-08.50','R 2-7'),
  ('SI505','B','D01','Rabu',   '07.00-08.50','R 2-8'),
  ('SI506','A','D01','Rabu',   '09.00-10.50','Lab Komp 2.5'),
  ('SI506','B','D09','Rabu',   '09.00-10.50','Lab Komp 2.5'),
  ('SI507','A','D03','Kamis',  '07.00-09.50','R 2-7'),
  ('SI507','B','D03','Kamis',  '10.00-12.50','R 2-7'),
  ('SI508','A','D10','Jumat',  '09.00-10.50','Lab Komp 2.5'),
  ('SI508','B','D12','Jumat',  '13.00-14.50','Lab Komp 2.5'),
  ('SI509','A','D10','Jumat',  '13.00-14.50','R 2-7'),
  ('SI509','B','D12','Jumat',  '13.00-14.50','R 2-8'),
  -- Semester 7
  ('SI701','A','D02','Senin',  '13.00-15.50','R 3-1'),
  ('SI701','B','D13','Senin',  '13.00-15.50','R 2-7'),
  ('SI702','A','D09','Jumat',  '07.00-10.50','R 3-1'),
  ('SI703','A','D02','Jumat',  '13.00-16.50','R 3-1')
) AS v(kode_mk, kelas, nidn, hari, jam, ruang)
JOIN dosen d ON d.nidn = v.nidn;

COMMIT;