CREATE TABLE "aturan_akademik" (
  "kode" varchar(30) PRIMARY KEY,
  "nilai" int,
  "keterangan" varchar(200)
);

CREATE TABLE "prodi" (
  "kode_prodi" varchar(10) PRIMARY KEY,
  "nama_prodi" varchar(100),
  "jenjang" varchar(3)
);

CREATE TABLE "dosen" (
  "id_dosen" int PRIMARY KEY,
  "nidn" varchar(10),
  "nama" varchar(100),
  "email" varchar(100),
  "kode_prodi" varchar(10)
);

CREATE TABLE "mahasiswa" (
  "nim" varchar(12) PRIMARY KEY,
  "nama" varchar(100),
  "email" varchar(100),
  "tahun_masuk" smallint,
  "status" varchar(10),
  "kode_prodi" varchar(10),
  "id_dosen_pa" int,
  "created_at" timestamptz,
  "no_hp" varchar(20)
);

CREATE TABLE "periode" (
  "id_periode" varchar(5) PRIMARY KEY,
  "nama_periode" varchar(30),
  "tgl_mulai" date,
  "tgl_selesai" date
);

CREATE TABLE "mata_kuliah" (
  "kode_mk" varchar(10) PRIMARY KEY,
  "nama_mk" varchar(100),
  "sks" smallint,
  "semester_ke" smallint,
  "kode_prodi" varchar(10)
);

CREATE TABLE "kelas" (
  "id_kelas" int PRIMARY KEY,
  "kode_mk" varchar(10),
  "id_periode" varchar(5),
  "id_dosen" int,
  "nama_kelas" varchar(5),
  "kuota" smallint
);

CREATE TABLE "krs" (
  "id_krs" int PRIMARY KEY,
  "nim" varchar(12),
  "id_periode" varchar(5),
  "tgl_isi" date,
  "status" varchar(10)
);

CREATE TABLE "krs_detail" (
  "id_krs" int,
  "id_kelas" int,
  "nilai_huruf" varchar(2),
  PRIMARY KEY ("id_krs", "id_kelas")
);

ALTER TABLE "dosen" ADD FOREIGN KEY ("kode_prodi") REFERENCES "prodi" ("kode_prodi") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "mahasiswa" ADD FOREIGN KEY ("kode_prodi") REFERENCES "prodi" ("kode_prodi") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "mata_kuliah" ADD FOREIGN KEY ("kode_prodi") REFERENCES "prodi" ("kode_prodi") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "mahasiswa" ADD FOREIGN KEY ("id_dosen_pa") REFERENCES "dosen" ("id_dosen") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "kelas" ADD FOREIGN KEY ("id_periode") REFERENCES "periode" ("id_periode") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "krs" ADD FOREIGN KEY ("id_periode") REFERENCES "periode" ("id_periode") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "kelas" ADD FOREIGN KEY ("kode_mk") REFERENCES "mata_kuliah" ("kode_mk") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "kelas" ADD FOREIGN KEY ("id_dosen") REFERENCES "dosen" ("id_dosen") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "krs" ADD FOREIGN KEY ("nim") REFERENCES "mahasiswa" ("nim") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "krs_detail" ADD FOREIGN KEY ("id_krs") REFERENCES "krs" ("id_krs") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "krs_detail" ADD FOREIGN KEY ("id_kelas") REFERENCES "kelas" ("id_kelas") DEFERRABLE INITIALLY IMMEDIATE;
