// backend/server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); 

const authRoutes = require('./routes/authRoutes');
const guruRoutes = require('./routes/guruRoutes');
const mataPelajaranRoutes = require('./routes/mataPelajaranRoutes');
const kelasRoutes = require('./routes/kelasRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadController = require('./controllers/uploadController'); 
const path = require('path');
const exportRoutes = require('./routes/exportRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const penugasanRoutes = require('./routes/penugasanRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = 3001;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Routes
app.use('/api/penugasan', penugasanRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/monitoring', monitoringRoutes); 
app.use('/api/templates', express.static(path.join(__dirname, 'templates')));
app.use('/api/export', (req, res, next) => {
    console.log('Request to /api/export received.');
    next();
}, exportRoutes);
app.use('/api', authRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/mata-pelajaran', mataPelajaranRoutes);
app.use('/api/kelas', kelasRoutes);
app.use('/api/users', userRoutes);


app.post('/api/upload', upload.single('file'), uploadController.uploadData);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});