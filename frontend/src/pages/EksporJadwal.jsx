import React, { useState, useEffect, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './EksporJadwal.css';
import JadwalGrid from '../components/JadwalGrid';

// Custom hook untuk menunda eksekusi (mencegah spam API)
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const EksporJadwal = () => {
    // State untuk filter mode daftar
    const [gurus, setGurus] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [selectedGuru, setSelectedGuru] = useState('');
    const [selectedKelas, setSelectedKelas] = useState('');
    const [selectedHari, setSelectedHari] = useState('');

    // State untuk mode grid
    const [dayStructure, setDayStructure] = useState([]);
    const [allJadwal, setAllJadwal] = useState([]);
    const [allKelas, setAllKelas] = useState([]);
    
    // State umum
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' atau 'grid'
    const pdfPreviewRef = useRef(null);

    // Debounce untuk filter mode daftar
    const debouncedGuru = useDebounce(selectedGuru, 500);
    const debouncedKelas = useDebounce(selectedKelas, 500);
    const debouncedHari = useDebounce(selectedHari, 500);

    // Mengambil semua data yang diperlukan saat komponen dimuat
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingFilters(true);
            setError(null);
            try {
                // Langkah 1: Ambil Tahun Ajaran untuk menemukan yang aktif
                const taRes = await fetch('http://localhost:3001/api/tahun-ajaran');
                if (!taRes.ok) throw new Error('Gagal memuat daftar tahun ajaran.');
                const taData = await taRes.json();
                const activeYear = taData.find(y => y.is_active) || taData[0];
                if (!activeYear) throw new Error("Tidak ada data Tahun Ajaran di database.");

                // Langkah 2: Ambil semua data lain, termasuk jadwal DENGAN parameter tahun ajaran
                const [gurusRes, kelasRes, jadwalRes, layoutRes] = await Promise.all([
                    fetch('http://localhost:3001/api/guru'),
                    fetch('http://localhost:3001/api/kelas'),
                    fetch(`http://localhost:3001/api/jadwal?tahun_ajaran=${activeYear.id}`),
                    fetch(`http://localhost:3001/api/layout?tahun_ajaran=${activeYear.id}`)
                ]);

                if (!gurusRes.ok || !kelasRes.ok || !jadwalRes.ok) throw new Error('Gagal mengambil data awal dari server.');
                
                setGurus(await gurusRes.json() || []);
                setAllKelas(await kelasRes.json() || []);
                setAllJadwal(await jadwalRes.json() || []);

                const defaultLayout = [{ id: 'item-1', type: 'lesson', name: 'Jam Ke-1', jam_ke: 1, waktuMulai: '07:00', waktuSelesai: '07:45' }];
                 if (layoutRes.ok) {
                    const savedLayout = await layoutRes.json();
                    setDayStructure(savedLayout && savedLayout.length > 0 ? savedLayout : defaultLayout);
                } else {
                    setDayStructure(defaultLayout);
                }

            } catch (e) {
                setError(e.message);
            } finally {
                setLoadingFilters(false);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch pratinjau untuk mode DAFTAR (ketika filter berubah)
    useEffect(() => {
        if (viewMode !== 'list' || loadingFilters) return;
        
        // Filter dilakukan di frontend, tidak perlu panggil API lagi
        const filtered = allJadwal.filter(j =>
            (!debouncedGuru || j.nama_guru === debouncedGuru) &&
            (!debouncedKelas || j.nama_kelas === debouncedKelas) &&
            (!debouncedHari || j.hari === debouncedHari)
        );
        setPreviewData(filtered);

    }, [debouncedGuru, debouncedKelas, debouncedHari, loadingFilters, viewMode, allJadwal]);

    const handleExport = () => {
        const input = pdfPreviewRef.current;
        if (!input) {
            alert("Area pratinjau tidak ditemukan untuk diekspor.");
            return;
        }

        const orientation = viewMode === 'grid' ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'mm', 'a4');

        html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = canvas.width / canvas.height;
            let imgWidth = pdfWidth - 20;
            let imgHeight = imgWidth / ratio;
            if (imgHeight > pdfHeight - 20) {
                imgHeight = pdfHeight - 20;
                imgWidth = imgHeight * ratio;
            }
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`jadwal-${viewMode}.pdf`);
        });
    };

    const groupDataByDay = (data) => data.reduce((acc, item) => {
        (acc[item.hari] = acc[item.hari] || []).push(item); return acc; }, {});
    const groupedSchedule = groupDataByDay(previewData);

    const kelasByTingkat = useMemo(() => ({
        '10': allKelas.filter(k => k.tingkat === '10'),
        '11': allKelas.filter(k => k.tingkat === '11'),
        '12': allKelas.filter(k => k.tingkat === '12'),
    }), [allKelas]);
    
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    if (loadingFilters) return <div className="loading-container">Memuat filter...</div>;
    if (error) return <div className="error-container">Error: {error}</div>;
    
    return (
        <div className="ekspor-jadwal-container">
            <div className="export-header">
                <h2>Ekspor Jadwal Pelajaran</h2>
                <button 
                    onClick={handleExport} 
                    className="export-button" 
                    disabled={ (viewMode === 'list' && previewData.length === 0) || loadingPreview }
                >
                    Ekspor ke PDF
                </button>
            </div>

            <div className="view-mode-toggle">
                <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>Tampilan Daftar (Filter)</button>
                <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>Tampilan Grid (Keseluruhan)</button>
            </div>

            {viewMode === 'list' && (
                <div className="filter-container">
                    <div className="form-group">
                        <label>Filter Berdasarkan Guru:</label>
                        <select onChange={(e) => setSelectedGuru(e.target.value)} value={selectedGuru}>
                            <option value="">-- Semua Guru --</option>
                            {gurus.map(guru => (<option key={guru.id} value={guru.nama}>{guru.nama}</option>))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Filter Berdasarkan Kelas:</label>
                        <select onChange={(e) => setSelectedKelas(e.target.value)} value={selectedKelas}>
                            <option value="">-- Semua Kelas --</option>
                            {allKelas.map(k => (<option key={k.id} value={k.nama_kelas}>{k.nama_kelas}</option>))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Filter Berdasarkan Hari:</label>
                        <select onChange={(e) => setSelectedHari(e.target.value)} value={selectedHari}>
                            <option value="">-- Semua Hari --</option>
                            {days.map(day => (<option key={day} value={day}>{day}</option>))}
                        </select>
                    </div>
                </div>
            )}
            
            <div className="preview-container">
                {loadingPreview && <p>Memuat pratinjau...</p>}
                
                <div ref={pdfPreviewRef}>
                    {!loadingPreview && !error && viewMode === 'list' && (
                        previewData.length > 0 ? (
                            <div className="pdf-preview-area">
                                <div className="pdf-header"><h3>JADWAL PELAJARAN (TERFILTER)</h3><h4>MAN 2 TASIKMALAYA</h4></div>
                                {Object.keys(groupedSchedule).map(day => (
                                    <div key={day} className="day-section">
                                        <h4>{day}</h4>
                                        <div className="table-wrapper list-view">
                                            <table className="preview-table">
                                                <thead><tr><th>Jam ke</th><th>Waktu</th><th>Guru</th><th>Mata Pelajaran</th><th>Kelas</th></tr></thead>
                                                <tbody>
                                                    {groupedSchedule[day].map((item, index) => (
                                                        <tr key={index}><td>{item.jam_ke}</td><td>{`${item.jam_mulai.slice(0, 5)} - ${item.jam_selesai.slice(0, 5)}`}</td><td>{item.nama_guru}</td><td>{item.nama_mapel}</td><td>{item.nama_kelas}</td></tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p>Tidak ada data jadwal yang cocok dengan filter.</p>
                    )}

                    {!loadingPreview && !error && viewMode === 'grid' && (
                        <div className="pdf-preview-area">
                            {days.map(day => (
                                <div key={day} className="full-day-section">
                                    <div className="pdf-header">
                                        <h3>JADWAL PELAJARAN - HARI {day.toUpperCase()}</h3>
                                        <h4>MAN 2 TASIKMALAYA</h4>
                                    </div>
                                    {Object.keys(kelasByTingkat).map(tingkat => (
                                        kelasByTingkat[tingkat].length > 0 && (
                                            <div key={`${day}-${tingkat}`} className="grade-level-section">
                                                <h5>Tingkat {tingkat}</h5>
                                                <JadwalGrid 
                                                    dayStructure={dayStructure}
                                                    filteredJadwal={allJadwal.filter(j => j.hari === day)}
                                                    filteredKelas={kelasByTingkat[tingkat]}
                                                />
                                            </div>
                                        )
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EksporJadwal;