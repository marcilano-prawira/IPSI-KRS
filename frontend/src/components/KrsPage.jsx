import { useEffect, useState } from "react";
import { krsService } from "../services";

const statusLabel = {
  draft: "Di keranjang",
  diajukan: "Menunggu persetujuan wali",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

export default function KrsPage({ onLogout }) {
  const [data, setData] = useState(null);
  const [kelasList, setKelasList] = useState([]);
  const [view, setView] = useState("home"); // "home" | "pilih"
  const [semester, setSemester] = useState("all");
  const [error, setError] = useState("");

  const run = async (fn) => {
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSaya = async () => setData(await krsService.getSaya());
  const loadKelas = async () => setKelasList(await krsService.getKelas());

  useEffect(() => {
    run(loadSaya);
  }, []);

  const goPilih = () =>
    run(async () => {
      await loadKelas();
      setView("pilih");
    });

  const handleTambah = (idKelas) =>
    run(async () => {
      await krsService.tambah(idKelas);
      await loadSaya();
      await loadKelas();
    });

  const handleHapus = (idKelas) =>
    run(async () => {
      await krsService.hapus(idKelas);
      await loadSaya();
      if (view === "pilih") await loadKelas();
    });

  const handleAjukan = () =>
    run(async () => {
      await krsService.ajukan();
      await loadSaya();
      setView("home");
    });

  if (!data) {
    return (
      <div className="container">
        {error ? <p className="error">{error}</p> : <p className="center muted">Memuat...</p>}
        <button className="secondary" onClick={onLogout}>Keluar</button>
      </div>
    );
  }

  const { mahasiswa, periode, maxSks, keteranganBatas, detail } = data;
  const aktif = detail.filter((d) => d.status !== "ditolak");
  const totalSks = aktif.reduce((sum, d) => sum + d.sks, 0);
  const pending = detail.filter((d) => d.status === "draft" || d.status === "ditolak").length;
  const menunggu = detail.some((d) => d.status === "diajukan");
  const semesters = [...new Set(kelasList.map((k) => k.semester_ke))];

  const renderTable = (compact) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Kode</th>
            <th>Mata Kuliah</th>
            <th>Kelas</th>
            {!compact && <th>Jadwal</th>}
            <th>SKS</th>
            <th>Keterangan</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {detail.length === 0 ? (
            <tr>
              <td colSpan={compact ? 6 : 7} className="empty">Belum ada mata kuliah</td>
            </tr>
          ) : (
            detail.map((d) => (
              <tr key={d.id_kelas}>
                <td>{d.kode_mk}</td>
                <td>
                  {d.nama_mk}
                  <div className="sub">Smt {d.semester_ke} · {d.dosen}</div>
                </td>
                <td>{d.nama_kelas}</td>
                {!compact && (
                  <td>
                    {d.hari}
                    <div className="sub">{d.jam} · {d.ruang}</div>
                  </td>
                )}
                <td>{d.sks}</td>
                <td>
                  <span className={`badge ${d.status}`}>{statusLabel[d.status]}</span>
                  {d.catatan && <div className="sub">{d.catatan}</div>}
                </td>
                <td>
                  {d.status !== "disetujui" && (
                    <button className="danger" onClick={() => handleHapus(d.id_kelas)}>Hapus</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container">
      <header className="header">
        <h1>Sistem KRS</h1>
        <p>Kartu Rencana Studi · {periode.nama_periode}</p>
      </header>

      <div className="card userbar">
        <div>
          <b>{mahasiswa.nama}</b>
          <div className="sub">
            NIM {mahasiswa.nim} · {mahasiswa.nama_prodi} · Semester {mahasiswa.semester} · IPS{" "}
            {mahasiswa.ips !== null ? Number(mahasiswa.ips).toFixed(2) : "-"}
            <br />
            Dosen wali: {mahasiswa.dosen_wali ?? "-"}
          </div>
        </div>
        <button className="secondary" onClick={onLogout}>Keluar</button>
      </div>

      {error && <p className="error">{error}</p>}
      {maxSks === null && <p className="error">{keteranganBatas}</p>}

      {view === "home" && (
        <div className="card">
          <h2>KRS Saya</h2>
          <div className="detail-info">
            <span>Total SKS: <b>{totalSks} / {maxSks ?? "-"}</b></span>
            <span className="sub">{keteranganBatas}</span>
          </div>

          {renderTable(false)}

          {menunggu && (
            <p className="note">
              Mata kuliah berstatus "Menunggu persetujuan wali" sedang diperiksa dosen wali. Kamu
              masih bisa menambah atau menghapus mata kuliah selama belum disetujui.
            </p>
          )}
          {pending > 0 && (
            <p className="note">Ada {pending} mata kuliah yang belum diajukan ke dosen wali.</p>
          )}

          <div className="detail-actions">
            <button className="ghost" onClick={goPilih}>Pilih Kelas</button>
            {pending > 0 && <button onClick={handleAjukan}>Ajukan KRS ({pending})</button>}
          </div>
        </div>
      )}

      {view === "pilih" && (
        <>
          <button className="secondary" onClick={() => setView("home")}>← Kembali</button>

          <div className="grid-2">
            <div className="card">
              <h2>Daftar Mata Kuliah</h2>
              <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="all">Semua semester</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>

              {semesters
                .filter((s) => semester === "all" || String(s) === semester)
                .map((s) => (
                  <div key={s}>
                    <div className="group-title">Semester {s}</div>
                    {kelasList
                      .filter((k) => k.semester_ke === s)
                      .map((k) => {
                        const inCart = detail.some((d) => d.id_kelas === k.id_kelas && d.status !== "ditolak");
                        const sameMk = detail.some((d) => d.kode_mk === k.kode_mk && d.status !== "ditolak");
                        const full = k.terisi >= k.kuota;
                        return (
                          <div className="kelas-item" key={k.id_kelas}>
                            <div>
                              <b>{k.nama_mk}</b>{" "}
                              <span className="muted">({k.kode_mk} · Kelas {k.nama_kelas})</span>
                              <div className="sub">
                                {k.sks} SKS · {k.dosen} · {k.hari} {k.jam} · {k.ruang} · Kuota {k.terisi}/{k.kuota}
                              </div>
                            </div>
                            <button
                              className="ghost"
                              disabled={sameMk || full}
                              onClick={() => handleTambah(k.id_kelas)}
                            >
                              {inCart ? "Diambil" : sameMk ? "MK sudah diambil" : full ? "Penuh" : "+ Tambah"}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                ))}
            </div>

            <div className="card">
              <h2>Keranjang KRS</h2>
              <div className="detail-info">
                <span>Total SKS: <b>{totalSks} / {maxSks ?? "-"}</b></span>
            <span className="sub">{keteranganBatas}</span>
              </div>
              {renderTable(true)}
              <div className="detail-actions">
                <button onClick={handleAjukan} disabled={pending === 0}>
                  Ajukan KRS ({pending})
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
