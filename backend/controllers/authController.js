// Dummy data for demonstration. In a real application, this would be a database query.
const users = [
    { username: 'staf_tu', password: 'password123', role: 'Staf TU' },
    { username: 'waka', password: 'password123', role: 'Waka Kurikulum' },
    { username: 'kepala_sekolah', password: 'password123', role: 'Kepala Sekolah' },
];

exports.login = (req, res) => {
    const { username, password } = req.body;

    // Find user in the dummy data
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // If user exists, send success response with user data
        // In a real app, a JWT token would be generated and sent here.
        res.status(200).json({ message: 'Login berhasil!', user: { username: user.username, role: user.role } });
    } else {
        // If user not found, send error response
        res.status(401).json({ message: 'Username atau password salah.' });
    }
};