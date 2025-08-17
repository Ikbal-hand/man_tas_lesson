import React from 'react';
import './JadwalGrid.css';

const JadwalGrid = ({ dayStructure, filteredJadwal, filteredKelas }) => {
    if (!dayStructure || !filteredKelas) {
        return <p>Memuat data untuk grid...</p>;
    }

    return (
        <div className="table-wrapper">
            <table className="preview-grid-table">
                <thead>
                    <tr>
                        {/* --- PERUBAHAN: Menambahkan className --- */}
                        <th className="status-header">Status</th>
                        <th className="time-header">Waktu</th>
                        {filteredKelas.map(k => (
                            <th key={k.id} className="class-header">{k.nama_kelas}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dayStructure.map((row) => (
                        <tr key={row.id} className={row.type === 'activity' ? 'special-row' : ''}>
                            <td><strong>{row.name}</strong></td>
                            <td>{`${row.waktuMulai} - ${row.waktuSelesai}`}</td>
                            {row.type === 'activity' ? (
                                <td colSpan={filteredKelas.length || 1}>
                                    <div className="activity-placeholder">{row.name}</div>
                                </td>
                            ) : (
                                filteredKelas.map(k => {
                                    const cellJadwal = filteredJadwal.find(j => j.jam_ke === row.jam_ke && j.id_kelas === k.id);
                                    return (
                                        <td key={k.id} className="jadwal-cell">
                                            {cellJadwal ? (
                                                <div className="cell-content">
                                                    <span>{cellJadwal.nama_mapel}</span>
                                                    <small>{cellJadwal.nama_guru}</small>
                                                </div>
                                            ) : <div className="cell-content empty"></div>}
                                        </td>
                                    );
                                })
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default JadwalGrid;