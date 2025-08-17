// frontend/src/pages/KelolaJadwal.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import './KelolaJadwal.css';
import ConfirmPopup from '../components/ConfirmPopup';

// --- Komponen untuk Baris Jadwal ---
const SortableRow = ({ row, filteredKelas, filteredJadwal, editingRowId, setEditingRowId, handleUpdateRow, handleDeleteRow, handleCellClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: row.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <tr ref={setNodeRef} style={style} className={row.type === 'activity' ? 'special-row' : ''}>
            <td {...attributes} {...listeners} className="drag-handle">☰</td>
            {editingRowId === row.id ? (
                <>
                    <td><input type="text" value={row.name} className="row-name-input" onChange={e => handleUpdateRow(row.id, 'name', e.target.value)} /></td>
                    <td className="time-edit-cell">
                        <input type="time" value={row.waktuMulai} onChange={e => handleUpdateRow(row.id, 'waktuMulai', e.target.value)} />
                        <span>-</span>
                        <input type="time" value={row.waktuSelesai} onChange={e => handleUpdateRow(row.id, 'waktuSelesai', e.target.value)} />
                        <button className="save-button" onClick={() => setEditingRowId(null)} title="Simpan">✓</button>
                    </td>
                </>
            ) : (
                <>
                    <td><strong>{row.name}</strong></td>
                    <td className="editable-time">
                        <span onClick={() => setEditingRowId(row.id)} title="Klik untuk edit">{`${row.waktuMulai} - ${row.waktuSelesai}`} ✏️</span>
                        <button 
                            className="delete-row-button" 
                            title="Hapus baris"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRow(row.id);
                            }}>
                            🗑️
                        </button>
                    </td>
                </>
            )}
            {row.type === 'activity' ? (
                <td colSpan={filteredKelas.length || 1}><div className="activity-placeholder">{row.name}</div></td>
            ) : (
                filteredKelas.map(k => {
                    const cellJadwal = filteredJadwal.find(j => j.jam_ke === row.jam_ke && j.id_kelas === k.id);
                    return (
                        <td key={k.id} className="jadwal-cell" onClick={() => handleCellClick(row, k, cellJadwal)}>
                            {cellJadwal ? (
                                <div className="cell-content">
                                    <span>{cellJadwal.nama_mapel}</span>
                                    <small>{cellJadwal.nama_guru}</small>
                                </div>
                            ) : (<div className="cell-content empty">+</div>)}
                        </td>
                    );
                })
            )}
        </tr>
    );
};

// --- Komponen Utama KelolaJadwal ---
const KelolaJadwal = () => {
    const [jadwal, setJadwal] = useState([]);
    const [penugasan, setPenugasan] = useState([]);
    const [kelas, setKelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ id_penugasan: '', hari: '', jam_ke: ''});
    const [editingJadwalId, setEditingJadwalId] = useState(null);
    const [selectedTingkat, setSelectedTingkat] = useState('10');
    const [selectedDay, setSelectedDay] = useState('Senin');
    
    const initialDayStructure = useMemo(() => [
        { id: 'item-1', type: 'activity', name: 'Tadarus', jam_ke: null, waktuMulai: '07:00', waktuSelesai: '07:15' },
        { id: 'item-2', type: 'lesson', name: 'Jam Ke-1', jam_ke: 1, waktuMulai: '07:15', waktuSelesai: '08:00' },
        { id: 'item-3', type: 'lesson', name: 'Jam Ke-2', jam_ke: 2, waktuMulai: '08:00', waktuSelesai: '08:45' },
        { id: 'item-4', type: 'activity', name: 'Istirahat', jam_ke: null, waktuMulai: '08:45', waktuSelesai: '09:15' },
    ], []);

    const [dayStructure, setDayStructure] = useState(initialDayStructure);
    const [editingRowId, setEditingRowId] = useState(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, }));
    
    const fetchAllData = async () => {
        try {
            const [jadwalRes, kelasRes, penugasanRes] = await Promise.all([
                fetch('http://localhost:3001/api/jadwal'),
                fetch('http://localhost:3001/api/kelas'),
                fetch('http://localhost:3001/api/penugasan')
            ]);
            if (!jadwalRes.ok || !kelasRes.ok || !penugasanRes.ok) throw new Error('Gagal menghubungi server.');
            setJadwal(await jadwalRes.json());
            setKelas(await kelasRes.json());
            setPenugasan(await penugasanRes.json());
        } catch (e) {
            console.error("Error fetching data:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchAllData(); }, []);

    const filteredKelas = useMemo(() => kelas.filter(k => k.tingkat === selectedTingkat), [kelas, selectedTingkat]);
    const filteredJadwal = useMemo(() => jadwal.filter(j => j.hari === selectedDay), [jadwal, selectedDay]);
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setDayStructure((current) => {
                const oldIndex = current.findIndex(item => item.id === active.id);
                const newIndex = current.findIndex(item => item.id === over.id);
                return arrayMove(current, oldIndex, newIndex);
            });
        }
    };
    
    const handleUpdateRow = (id, field, value) => setDayStructure(c => c.map(row => row.id === id ? { ...row, [field]: value } : row));
    const handleDeleteRow = (idToDelete) => setDayStructure(c => c.filter(item => item.id !== idToDelete));

    const handleCellClick = (row, k, cellJadwal) => {
        if (cellJadwal) {
            setFormData({ id_penugasan: cellJadwal.id_penugasan, hari: cellJadwal.hari, jam_ke: cellJadwal.jam_ke });
            setEditingJadwalId(cellJadwal.id);
        } else {
            const relevantPenugasan = penugasan.find(p => p.id_kelas === k.id);
            setFormData({ id_penugasan: relevantPenugasan ? relevantPenugasan.id : '', hari: selectedDay, jam_ke: row.jam_ke });
            setEditingJadwalId(null);
        }
        setShowForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const row = dayStructure.find(d => d.jam_ke === formData.jam_ke);
        if (!row) return;

        const payload = { ...formData, jam_mulai: row.waktuMulai, jam_selesai: row.waktuSelesai };
        const url = editingJadwalId ? `http://localhost:3001/api/jadwal/${editingJadwalId}` : 'http://localhost:3001/api/jadwal';
        const method = editingJadwalId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal menyimpan jadwal');
            }
            setShowForm(false);
            fetchAllData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddLessonSlot = () => {
        const newId = `item-${new Date().getTime()}`;
        const lastLesson = [...dayStructure].reverse().find(item => item.type === 'lesson');
        const newJamKe = lastLesson ? lastLesson.jam_ke + 1 : 1;
        const newSlot = { id: newId, type: 'lesson', name: `Jam Ke-${newJamKe}`, jam_ke: newJamKe, waktuMulai: '00:00', waktuSelesai: '00:00' };
        setDayStructure(prev => [...prev, newSlot]);
        setEditingRowId(newId);
    };
    
    const handleAddSharedSlot = () => {
        const newId = `item-${new Date().getTime()}`;
        const newSlot = { id: newId, type: 'activity', name: 'Waktu Mandiri', jam_ke: null, waktuMulai: '00:00', waktuSelesai: '00:00' };
        setDayStructure(prev => [...prev, newSlot]);
        setEditingRowId(newId);
    };
    
    if (loading) return <div className="full-page-loader">Loading...</div>;
    if (error) return <div className="full-page-error">Error: {error}</div>;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="kelola-jadwal-container fade-in">
                {showForm && (
                    <div className="form-modal-overlay">
                        <form onSubmit={handleFormSubmit} className="jadwal-form">
                            <h3>{editingJadwalId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
                            <div className="form-group">
                                <label>Penugasan:</label>
                                <select name="id_penugasan" value={formData.id_penugasan} onChange={(e) => setFormData(f => ({...f, id_penugasan: e.target.value}))} required>
                                    <option value="">Pilih Penugasan</option>
                                    {penugasan.map(p => <option key={p.id} value={p.id}>{`${p.nama_guru} - ${p.nama_mapel} (${p.nama_kelas})`}</option>)}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-button">Simpan</button>
                                <button type="button" onClick={() => setShowForm(false)} className="cancel-button">Batal</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="table-header">
                    <h2>Kelola Jadwal Pelajaran</h2>
                    <div className="header-buttons">
                        <button onClick={handleAddLessonSlot} className="add-button">+ Tambah Jam Pelajaran</button>
                        <button onClick={handleAddSharedSlot} className="add-button secondary">+ Tambah Waktu Mandiri</button>
                    </div>
                </div>

                <div className="jadwal-selectors">
                    <div className="jadwal-tabs">
                        <button onClick={() => setSelectedTingkat('10')} className={selectedTingkat === '10' ? 'active' : ''}>X</button>
                        <button onClick={() => setSelectedTingkat('11')} className={selectedTingkat === '11' ? 'active' : ''}>XI</button>
                        <button onClick={() => setSelectedTingkat('12')} className={selectedTingkat === '12' ? 'active' : ''}>XII</button>
                    </div>
                     <div className="jadwal-tabs">
                        {days.map(day => (
                             <button key={day} onClick={() => setSelectedDay(day)} className={selectedDay === day ? 'active' : ''}>{day}</button>
                        ))}
                    </div>
                </div>

                <div className="jadwal-table-container">
                    <table className="jadwal-table">
                        <thead>
                           <tr>
                                <th style={{ width: '50px' }}></th>
                                <th style={{ width: '150px' }}>Status</th>
                                <th style={{ width: '220px' }}>Waktu</th>
                                {filteredKelas.map(k => <th key={k.id}>{k.nama_kelas}</th>)}
                            </tr>
                        </thead>
                        <SortableContext items={dayStructure.map(item => item.id)} strategy={verticalListSortingStrategy}>
                            <tbody>
                                {dayStructure.map((row) => (
                                    <SortableRow
                                        key={row.id}
                                        row={row}
                                        filteredKelas={filteredKelas}
                                        filteredJadwal={filteredJadwal}
                                        editingRowId={editingRowId}
                                        setEditingRowId={setEditingRowId}
                                        handleUpdateRow={handleUpdateRow}
                                        handleDeleteRow={handleDeleteRow}
                                        handleCellClick={handleCellClick}
                                    />
                                ))}
                            </tbody>
                        </SortableContext>
                    </table>
                </div>
            </div>
        </DndContext>
    );
};

export default KelolaJadwal;