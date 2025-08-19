import React, { useState, useEffect, useMemo } from 'react';
import './DashboardKepalaSekolah.css';
import JadwalBerikutnya from '../components/JadwalBerikutnya';
import { FaBroadcastTower, FaCalendarAlt, FaChalkboardTeacher, FaSchool, FaBook, FaUserCircle } from 'react-icons/fa';

// Komponen untuk menampilkan jadwal dalam format daftar/list
const JadwalListView = ({ jadwal, error }) => {
    if (error) return <p className="error-message">{error}</p>;
    if (jadwal.length === 0) return <p className="info-kosong">Tidak ada data jadwal yang cocok dengan filter.</p>;

    const groupedSchedule = jadwal.reduce((acc, item) => {
        (acc[item.hari] = acc[item.hari] || []).push(item);
        return acc;
    }, {});

    return (
        <div className="list-view-container">
            {Object.keys(groupedSchedule).sort((a, b) => {
                const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5 };
                return dayOrder[a] - dayOrder[b];
            }).map(day => (
                <div key={day} className="day-section">
                    <h4>{day}</h4>
                    <div className="table-wrapper">
                        <table className="preview-table">
                            <thead>
                                <tr>
                                    <th>Jam ke</th>
                                    <th>Waktu</th>
                                    <th>Guru</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Kelas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedSchedule[day]
                                .sort((a, b) => a.jam_ke - b.jam_ke)
                                .map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.jam_ke}</td>
                                        <td>{`${item.jam_mulai.slice(0, 5)} - ${item.jam_selesai.slice(0, 5)}`}</td>
                                        <td>{item.nama_guru}</td>
                                        <td>{item.nama_mapel}</td>
                                        <td>{item.nama_kelas}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

const DashboardKepalaSekolah = () => {
    const [summary, setSummary] = useState({ gurus: 0, classes: 0, subjects: 0 });
    const [allJadwal, setAllJadwal] = useState([]);
    const [guruMengajarSaatIni, setGuruMengajarSaatIni] = useState([]);
    const [waktuSekarang, setWaktuSekarang] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gurus, setGurus] = useState([]);
    const [allKelas, setAllKelas] = useState([]);
    const [selectedGuru, setSelectedGuru] = useState('');
    const [selectedKelas, setSelectedKelas] = useState('');
    const [selectedHari, setSelectedHari] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Langkah 1: Ambil Tahun Ajaran untuk menemukan yang aktif
                const taRes = await fetch('http://localhost:3001/api/tahun-ajaran');
                if (!taRes.ok) throw new Error('Gagal memuat daftar tahun ajaran.');
                const taData = await taRes.json();
                const activeYear = taData.find(y => y.is_active) || taData[0];
                if (!activeYear) throw new Error("Tidak ada data Tahun Ajaran di database.");

                // Langkah 2: Ambil semua data lain berdasarkan tahun ajaran aktif
                const [gurusRes, kelasRes, subjectsRes, jadwalRes] = await Promise.all([
                    fetch('http://localhost:3001/api/guru'),
                    fetch('http://localhost:3001/api/kelas'),
                    fetch('http://localhost:3001/api/mata-pelajaran'),
                    fetch(`http://localhost:3001/api/jadwal?tahun_ajaran=${activeYear.id}`),
                ]);
                
                if (!gurusRes.ok || !kelasRes.ok || !subjectsRes.ok || !jadwalRes.ok) {
                    throw new Error('Gagal mengambil data dari server.');
                }

                const gurusData = await gurusRes.json();
                const kelasData = await kelasRes.json();
                const subjectsData = await subjectsRes.json();
                const jadwalData = await jadwalRes.json();

                setSummary({ gurus: gurusData.length, classes: kelasData.length, subjects: subjectsData.length });
                setGurus(gurusData || []);
                setAllKelas(kelasData || []);
                setAllJadwal(jadwalData || []);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();

        const timer = setInterval(() => setWaktuSekarang(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const hariIni = days[waktuSekarang.getDay()];
        const jamSekarang = waktuSekarang.toTimeString().slice(0, 5);
        const guruAktif = allJadwal.filter(j => 
            j.hari === hariIni && jamSekarang >= j.jam_mulai.slice(0, 5) && jamSekarang < j.jam_selesai.slice(0, 5)
        );
        setGuruMengajarSaatIni(guruAktif);
    }, [waktuSekarang, allJadwal]);

    const filteredSchedule = useMemo(() => {
        return allJadwal.filter(j => 
            (!selectedGuru || j.nama_guru === selectedGuru) &&
            (!selectedKelas || j.nama_kelas === selectedKelas) &&
            (!selectedHari || j.hari === selectedHari)
        );
    }, [selectedGuru, selectedKelas, selectedHari, allJadwal]);

    if (loading) return <div className="loading-container">Memuat Dashboard...</div>;
    if (error) return <div className="error-container">Error: {error}</div>;

    return (
        <div className="dashboard-kepsek-container">
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Dashboard Monitoring</h1>
                    <p>Selamat datang kembali, Kepala Sekolah!</p>
                </div>
                <div className="user-profile">
                    <FaUserCircle size={24} />
                    <span>Kepala Sekolah</span>
                </div>
            </header>

            <div className="dashboard-grid-kepsek">
                <div className="summary-cards-kepsek">
                    <div className="card-kepsek"><div className="card-icon guru"><FaChalkboardTeacher /></div><div className="card-info"><h3>Total Guru</h3><p>{summary.gurus}</p></div></div>
                    <div className="card-kepsek"><div className="card-icon kelas"><FaSchool /></div><div className="card-info"><h3>Total Kelas</h3><p>{summary.classes}</p></div></div>
                    <div className="card-kepsek"><div className="card-icon mapel"><FaBook /></div><div className="card-info"><h3>Total Mata Pelajaran</h3><p>{summary.subjects}</p></div></div>
                </div>

                <div className="main-content">
                    <div className="widget">
                        <h2><FaCalendarAlt /> Pratinjau Jadwal Pelajaran</h2>
                        <div className="filter-form-kepsek">
                            <div className="form-group">
                                <label>Guru:</label>
                                <select onChange={(e) => setSelectedGuru(e.target.value)} value={selectedGuru}>
                                    <option value="">Semua Guru</option>
                                    {gurus.map(g => <option key={g.id} value={g.nama}>{g.nama}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Kelas:</label>
                                <select onChange={(e) => setSelectedKelas(e.target.value)} value={selectedKelas}>
                                    <option value="">Semua Kelas</option>
                                    {allKelas.map(k => <option key={k.id} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Hari:</label>
                                <select onChange={(e) => setSelectedHari(e.target.value)} value={selectedHari}>
                                    <option value="">Semua Hari</option>
                                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <JadwalListView jadwal={filteredSchedule} error={error ? "Gagal memuat data jadwal." : null} />
                    </div>
                </div>

                <div className="side-content">
                    <div className="widget">
                        <h2><FaBroadcastTower /> Monitoring Saat Ini</h2>
                        <div className="guru-aktif-cards">
                            {guruMengajarSaatIni.length > 0 ? (
                                guruMengajarSaatIni.map(jadwal => (
                                    <div key={jadwal.id} className="guru-card">
                                        <div className="guru-card-header">
                                            <p className="guru-name">{jadwal.nama_guru}</p>
                                            <p className="guru-mapel">{jadwal.nama_mapel}</p>
                                        </div>
                                        <div className="guru-card-body">
                                            <p>Kelas: <strong>{jadwal.nama_kelas}</strong></p>
                                            <p>Waktu: {jadwal.jam_mulai.slice(0,5)} - {jadwal.jam_selesai.slice(0,5)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : <p className="info-kosong">Tidak ada guru yang sedang mengajar saat ini.</p>}
                        </div>
                    </div>
                    <div className="widget">
                        <JadwalBerikutnya allJadwal={allJadwal} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardKepalaSekolah;