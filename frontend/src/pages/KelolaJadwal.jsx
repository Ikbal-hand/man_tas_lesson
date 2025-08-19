import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './KelolaJadwal.css';
import ConfirmPopup from '../components/ConfirmPopup';
import JadwalForm from '../components/JadwalForm';
import ManajemenTahunAjaranModal from '../components/ManajemenTahunAjaranModal';
import { FaEdit, FaEye, FaTrash, FaBroom, FaSave } from 'react-icons/fa';

// --- Komponen untuk Baris Jadwal (SortableRow) ---
const SortableRow = ({ row, filteredKelas, filteredJadwal, editingRowId, setEditingRowId, handleUpdateRow, handleDeleteRow, handleCellClick, handleShowDeleteConfirm, mode }) => {
    const isEditMode = mode === 'edit';
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: row.id, disabled: !isEditMode });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <tr ref={setNodeRef} style={style} className={row.type === 'activity' ? 'special-row' : ''}>
            {isEditMode && <td {...attributes} {...listeners} className="drag-handle">☰</td>}
            
            {isEditMode && editingRowId === row.id ? (
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
                        <span>{`${row.waktuMulai} - ${row.waktuSelesai}`}</span>
                        {isEditMode && (
                            <div className="row-actions">
                                <button onClick={() => setEditingRowId(row.id)} title="Edit Waktu" className="action-btn"><FaEdit /></button>
                                <button onClick={() => handleDeleteRow(row.id)} title="Hapus baris" className="action-btn delete"><FaTrash /></button>
                            </div>
                        )}
                    </td>
                </>
            )}

            {row.type === 'activity' ? (
                <td colSpan={filteredKelas.length || 1}><div className="activity-placeholder">{row.name}</div></td>
            ) : (
                filteredKelas.map(k => {
                    const cellJadwal = filteredJadwal.find(j => j.jam_ke === row.jam_ke && j.id_kelas === k.id);
                    return (
                        <td key={k.id} className={`jadwal-cell ${isEditMode ? 'editable' : ''}`} onClick={() => isEditMode && handleCellClick(row, k, cellJadwal)}>
                            {cellJadwal ? (
                                <div className="cell-content">
                                    <span>{cellJadwal.nama_mapel}</span>
                                    <small>{cellJadwal.nama_guru}</small>
                                    {isEditMode && (
                                        <button 
                                            className="delete-lesson-btn" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShowDeleteConfirm(cellJadwal);
                                            }}
                                        ><FaTrash /></button>
                                    )}
                                </div>
                            ) : ( isEditMode && <div className="cell-content empty">+</div> )}
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
    const [kelas, setKelas] = useState([]);
    const [tahunAjaranList, setTahunAjaranList] = useState([]);
    const [dayStructure, setDayStructure] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [contextualData, setContextualData] = useState({});
    const [selectedTingkat, setSelectedTingkat] = useState('10');
    const [selectedDay, setSelectedDay] = useState('Senin');
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('');
    const [editingRowId, setEditingRowId] = useState(null);
    const [mode, setMode] = useState('preview');
    const [confirmAction, setConfirmAction] = useState(null);
    const [showTaModal, setShowTaModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    
    const fetchTahunAjaran = () => {
        fetch('http://localhost:3001/api/tahun-ajaran')
            .then(res => res.json())
            .then(data => {
                setTahunAjaranList(data);
                if (!selectedTahunAjaran) {
                    const activeYear = data.find(y => y.is_active);
                    if (activeYear) setSelectedTahunAjaran(activeYear.id);
                    else if (data.length > 0) setSelectedTahunAjaran(data[0].id);
                }
            })
            .catch(err => setError("Gagal memuat daftar tahun ajaran."));
    };

    useEffect(() => {
        fetchTahunAjaran();
    }, []);

    useEffect(() => {
        if (!selectedTahunAjaran) return;
        
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [jadwalRes, kelasRes, layoutRes] = await Promise.all([
                    fetch(`http://localhost:3001/api/jadwal?tahun_ajaran=${selectedTahunAjaran}`),
                    fetch('http://localhost:3001/api/kelas'),
                    fetch(`http://localhost:3001/api/layout?tahun_ajaran=${selectedTahunAjaran}`),
                ]);
                if (!jadwalRes.ok || !kelasRes.ok) throw new Error('Gagal memuat data jadwal atau kelas.');
                
                setJadwal(await jadwalRes.json() || []);
                setKelas(await kelasRes.json() || []);

                const defaultLayout = [{ id: 'item-1', type: 'lesson', name: 'Jam Ke-1', jam_ke: 1, waktuMulai: '07:00', waktuSelesai: '07:45' }];
                if (layoutRes.ok) {
                    const savedLayout = await layoutRes.json();
                    setDayStructure(savedLayout && savedLayout.length > 0 ? savedLayout : defaultLayout);
                } else {
                    setDayStructure(defaultLayout);
                }
            } catch(e) { 
                setError(e.message)
            } finally { 
                setLoading(false); 
            }
        };
        fetchAllData();
    }, [selectedTahunAjaran]);
    
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
        setContextualData({ jam_ke: row.jam_ke, id_kelas: k.id });
        if (cellJadwal) {
            setFormData({ id_penugasan: cellJadwal.id_penugasan, isEditing: true, id: cellJadwal.id });
        } else {
            setFormData({ id_penugasan: '', isEditing: false, id: null });
        }
        setShowForm(true);
    };

    const handleFormSubmit = async (formDataFromForm) => {
        setIsSubmitting(true);
        const row = dayStructure.find(d => d.jam_ke === contextualData.jam_ke);
        if (!row) {
            alert("Struktur jam tidak ditemukan.");
            setIsSubmitting(false);
            return;
        }

        const isEditing = !!formData.id;
        const payload = {
            id_penugasan: formDataFromForm.id_penugasan,
            id_kelas: contextualData.id_kelas,
            hari: selectedDay,
            jam_ke: contextualData.jam_ke,
            jam_mulai: row.waktuMulai,
            jam_selesai: row.waktuSelesai,
            id_tahun_ajaran: selectedTahunAjaran,
        };

        const url = isEditing ? `http://localhost:3001/api/jadwal/${formData.id}` : 'http://localhost:3001/api/jadwal';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal menyimpan jadwal');
            }
            const savedJadwal = await res.json();
            setJadwal(current => isEditing ? current.map(j => j.id === formData.id ? savedJadwal : j) : [...current, savedJadwal]);
            setShowForm(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleSaveLayout = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/layout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_tahun_ajaran: selectedTahunAjaran, struktur_json: dayStructure }),
            });
            if (!response.ok) throw new Error('Gagal menyimpan tata letak.');
            alert('Tata letak berhasil disimpan!');
        } catch (err) {
            alert(err.message);
        }
    };
    
    const handleAddLessonSlot = () => {
        const newId = `item-${Date.now()}`;
        const lastLesson = [...dayStructure].reverse().find(item => item.type === 'lesson');
        const newJamKe = lastLesson ? lastLesson.jam_ke + 1 : 1;
        const newSlot = { id: newId, type: 'lesson', name: `Jam Ke-${newJamKe}`, jam_ke: newJamKe, waktuMulai: '00:00', waktuSelesai: '00:00' };
        setDayStructure(prev => [...prev, newSlot]);
        setEditingRowId(newId);
    };
    
    const handleAddSharedSlot = () => {
        const newId = `item-${Date.now()}`;
        const newSlot = { id: newId, type: 'activity', name: 'Aktivitas Baru', jam_ke: null, waktuMulai: '00:00', waktuSelesai: '00:00' };
        setDayStructure(prev => [...prev, newSlot]);
        setEditingRowId(newId);
    };
    
    const handleClearSchedule = (kelasId, namaKelas) => {
        const action = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/jadwal/kelas/${kelasId}?hari=${selectedDay}&tahun_ajaran=${selectedTahunAjaran}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Gagal mengosongkan jadwal.');
                }
                setJadwal(prev => prev.filter(j => !(j.id_kelas === kelasId && j.hari === selectedDay)));
            } catch (err) { alert(err.message); }
            setConfirmAction(null);
        };
        setConfirmAction({ message: `Yakin ingin mengosongkan semua jadwal untuk kelas ${namaKelas} di hari ${selectedDay}?`, onConfirm: action });
    };

    const handleDeleteJadwal = async (jadwalId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/jadwal/${jadwalId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Gagal menghapus jadwal.');
            }
            setJadwal(currentJadwal => currentJadwal.filter(j => j.id !== jadwalId));
        } catch (err) {
            alert(err.message);
        }
        setConfirmAction(null);
    };

    const handleShowDeleteConfirm = (jadwal) => {
        setConfirmAction({
            message: `Yakin ingin menghapus pelajaran "${jadwal.nama_mapel}" oleh ${jadwal.nama_guru}?`,
            onConfirm: () => handleDeleteJadwal(jadwal.id)
        });
    };

    const filteredKelas = useMemo(() => kelas.filter(k => k.tingkat === selectedTingkat), [kelas, selectedTingkat]);
    const filteredJadwal = useMemo(() => jadwal.filter(j => j.hari === selectedDay), [jadwal, selectedDay]);
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    
    if (loading) return <div className="full-page-loader">Memuat Jadwal...</div>;
    if (error) return <div className="full-page-error">Error: {error}</div>;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} disabled={mode === 'preview'}>
            <div className="kelola-jadwal-container">
                {showForm && <JadwalForm initialData={formData} onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} isSubmitting={isSubmitting} error={error} />}
                {showTaModal && <ManajemenTahunAjaranModal onClose={() => setShowTaModal(false)} onDataChange={fetchTahunAjaran} />}

                <div className="page-controls">
                    <div className="tahun-ajaran-selector">
                        <label>Tahun Ajaran:</label>
                        <select value={selectedTahunAjaran} onChange={e => setSelectedTahunAjaran(e.target.value)}>
                            {tahunAjaranList.map(ta => <option key={ta.id} value={ta.id}>{ta.nama_tahun_ajaran}</option>)}
                        </select>
                        <button onClick={() => setShowTaModal(true)} className="manage-button">Kelola</button>
                    </div>
                    <div className="mode-toggle">
                        <button onClick={() => setMode('preview')} className={mode === 'preview' ? 'active' : ''}><FaEye /> Pratinjau</button>
                        <button onClick={() => setMode('edit')} className={mode === 'edit' ? 'active' : ''}><FaEdit /> Edit</button>
                    </div>
                </div>

                <div className="table-header">
                    <h2>Kelola Jadwal Pelajaran</h2>
                    {mode === 'edit' && (
                        <div className="header-buttons">
                             <button onClick={handleSaveLayout} className="add-button secondary"><FaSave /> Simpan Tata Letak</button>
                             <button onClick={handleAddLessonSlot} className="add-button">+ Tambah Jam</button>
                             <button onClick={handleAddSharedSlot} className="add-button secondary">+ Tambah Aktivitas</button>
                        </div>
                    )}
                </div>

                <div className="jadwal-selectors">
                    <div className="jadwal-tabs">
                        <button onClick={() => setSelectedTingkat('10')} className={selectedTingkat === '10' ? 'active' : ''}>X</button>
                        <button onClick={() => setSelectedTingkat('11')} className={selectedTingkat === '11' ? 'active' : ''}>XI</button>
                        <button onClick={() => setSelectedTingkat('12')} className={selectedTingkat === '12' ? 'active' : ''}>XII</button>
                    </div>
                    <div className="jadwal-tabs">
                        {days.map(day => (<button key={day} onClick={() => setSelectedDay(day)} className={selectedDay === day ? 'active' : ''}>{day}</button>))}
                    </div>
                </div>

                <div className="jadwal-table-container">
                    <table className="jadwal-table">
                        <thead>
                            <tr>
                                {mode === 'edit' && <th className="drag-handle-header"></th>}
                                <th>Status</th>
                                <th>Waktu</th>
                                {filteredKelas.map(k => (
                                    <th key={k.id} className="class-header-cell">
                                        <span>{k.nama_kelas}</span>
                                        {mode === 'edit' && (
                                            <button className="clear-schedule-btn" title={`Kosongkan jadwal ${k.nama_kelas}`} onClick={() => handleClearSchedule(k.id, k.nama_kelas)}>
                                                <FaBroom />
                                            </button>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <SortableContext items={dayStructure.map(item => item.id)} strategy={verticalListSortingStrategy} disabled={mode === 'preview'}>
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
                                        handleShowDeleteConfirm={handleShowDeleteConfirm}
                                        mode={mode}
                                    />
                                ))}
                            </tbody>
                        </SortableContext>
                    </table>
                </div>
                {confirmAction && <ConfirmPopup message={confirmAction.message} onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction(null)} />}
            </div>
        </DndContext>
    );
};

export default KelolaJadwal;