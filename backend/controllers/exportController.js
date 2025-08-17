// backend/controllers/exportController.js
const db = require('../config/db');
const ExcelJS = require('exceljs');

const getJadwalData = (guru, hari, kelas) => {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT
                j.hari, j.jam_mulai, j.jam_selesai, j.jam_ke,
                g.nama AS nama_guru,
                k.nama_kelas,
                mp.nama_mapel
            FROM
                jadwal j
            JOIN
                penugasan_guru pg ON j.id_penugasan = pg.id
            JOIN
                guru g ON pg.id_guru = g.id
            JOIN
                kelas k ON pg.id_kelas = k.id
            JOIN
                mata_pelajaran mp ON pg.id_mata_pelajaran = mp.id
            WHERE 1=1
        `;
        const params = [];

        if (guru) {
            sql += ' AND g.nama = ?';
            params.push(guru);
        }
        if (hari) {
            sql += ' AND j.hari = ?';
            params.push(hari);
        }
        if (kelas) {
            sql += ' AND k.nama_kelas = ?';
            params.push(kelas);
        }

        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.exportJadwal = async (req, res) => {
    try {
        const { guru, hari, kelas } = req.query;
        const results = await getJadwalData(guru, hari, kelas);
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Jadwal Pelajaran');

        worksheet.columns = [
            { header: 'Hari', key: 'hari', width: 15 },
            { header: 'Jam ke', key: 'jam_ke', width: 10 },
            { header: 'Waktu', key: 'waktu', width: 20 },
            { header: 'Guru', key: 'nama_guru', width: 30 },
            { header: 'Mata Pelajaran', key: 'nama_mapel', width: 30 },
            { header: 'Kelas', key: 'nama_kelas', width: 15 },
        ];

        results.forEach(row => {
            worksheet.addRow({
                hari: row.hari,
                jam_ke: row.jam_ke,
                waktu: `${row.jam_mulai.slice(0, 5)} - ${row.jam_selesai.slice(0, 5)}`,
                nama_guru: row.nama_guru,
                nama_mapel: row.nama_mapel,
                nama_kelas: row.nama_kelas
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'jadwal_pelajaran.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting jadwal:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.previewJadwal = async (req, res) => {
    try {
        const { guru, hari, kelas } = req.query;
        const results = await getJadwalData(guru, hari, kelas);
        res.status(200).json(results);
    } catch (e) {
        console.error('Error fetching preview jadwal:', e);
        res.status(500).json({ error: e.message });
    }
};