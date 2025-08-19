const express = require('express');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path');

// Import semua file rute
const authRoutes = require('./routes/authRoutes');
const guruRoutes = require('./routes/guruRoutes');
const mataPelajaranRoutes = require('./routes/mataPelajaranRoutes');
const kelasRoutes = require('./routes/kelasRoutes');
const userRoutes = require('./routes/userRoutes');
const exportRoutes = require('./routes/exportRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const penugasanRoutes = require('./routes/penugasanRoutes');
const tahunAjaranRoutes = require('./routes/tahunAjaranRoutes'); 
const layoutRoutes = require('./routes/layoutRoutes'); // <-- Rute baru
// Import controller khusus
const uploadController = require('./controllers/uploadController'); 

const app = express();
const PORT = process.env.PORT || 3001; // Gunakan environment variable jika ada

// Middleware
app.use(cors());
app.use(express.json()); // <-- Menggantikan bodyParser.json()
app.use(express.urlencoded({ extended: true })); // Untuk form data

// Konfigurasi Multer untuk upload file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mendaftarkan Rute
app.use('/api', authRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/mata-pelajaran', mataPelajaranRoutes);
app.use('/api/kelas', kelasRoutes);
app.use('/api/users', userRoutes);
app.use('/api/penugasan-guru', penugasanRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/tahun-ajaran', tahunAjaranRoutes); 
app.use('/api/layout', layoutRoutes);
// <-- Rute baru didaftarkan

// Rute statis untuk download template
app.use('/api/templates', express.static(path.join(__dirname, 'templates')));

// Rute khusus untuk upload file
app.post('/api/upload', upload.single('file'), uploadController.uploadData);


// Listener Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});