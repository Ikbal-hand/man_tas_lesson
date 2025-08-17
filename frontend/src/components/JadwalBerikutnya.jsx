import React, { useState, useEffect } from 'react';
import './JadwalBerikutnya.css';

const JadwalBerikutnya = ({ allJadwal }) => {
    const [nextSchedule, setNextSchedule] = useState(null);
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        const findNextSchedule = () => {
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
            const todayName = days[now.getDay()];

            const upcomingToday = allJadwal
                .filter(j => j.hari === todayName && j.jam_mulai.slice(0, 5) > currentTime)
                .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));

            if (upcomingToday.length > 0) {
                setNextSchedule(upcomingToday[0]);
            } else {
                // Cari untuk hari berikutnya jika hari ini sudah tidak ada jadwal
                // (Logika ini bisa diperluas)
                setNextSchedule(null); 
            }
        };
        findNextSchedule();
    }, [allJadwal]);

    useEffect(() => {
        if (!nextSchedule) {
            setCountdown('');
            return;
        }

        const timer = setInterval(() => {
            const now = new Date();
            const scheduleTime = new Date(`${now.toDateString()} ${nextSchedule.jam_mulai}`);
            const diff = scheduleTime - now;

            if (diff <= 0) {
                setCountdown("Sedang Berlangsung");
                return;
            }

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setCountdown(`${hours} Jam, ${minutes} Menit, ${seconds} Detik`);
        }, 1000);

        return () => clearInterval(timer);
    }, [nextSchedule]);

    if (!nextSchedule) {
        return (
            <div className="countdown-card">
                <p className="countdown-label">Jadwal Berikutnya</p>
                <p className="no-schedule-info">Tidak ada jadwal akan datang untuk hari ini.</p>
            </div>
        );
    }

    return (
        <div className="countdown-card">
            <p className="countdown-label">Jadwal Berikutnya</p>
            <div className="countdown-timer">{countdown}</div>
            <div className="countdown-details">
                <p><strong>Guru:</strong> {nextSchedule.nama_guru}</p>
                <p><strong>Kelas:</strong> {nextSchedule.nama_kelas}</p>
                <p><strong>Mapel:</strong> {nextSchedule.nama_mapel}</p>
            </div>
        </div>
    );
};

export default JadwalBerikutnya;