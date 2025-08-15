// frontend/src/pages/RealtimeInfo.jsx

import React, { useState, useEffect } from 'react';
import './RealtimeInfo.css';

const RealtimeInfo = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextLesson, setNextLesson] = useState(null);

    const fetchNextLesson = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/monitoring/next');
            if (!response.ok) {
                throw new Error('Failed to fetch next lesson data.');
            }
            const data = await response.json();
            setNextLesson(data);
        } catch (e) {
            console.error('Error fetching next lesson:', e);
            setNextLesson(null);
        }
    };

    useEffect(() => {
        // Memperbarui waktu setiap detik
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Memuat jadwal berikutnya saat komponen dimuat
        fetchNextLesson();

        // Memuat ulang jadwal berikutnya setiap menit
        const lessonInterval = setInterval(() => {
            fetchNextLesson();
        }, 60000);

        return () => {
            clearInterval(clockInterval);
            clearInterval(lessonInterval);
        };
    }, []);

    const calculateCountdown = () => {
        if (!nextLesson) {
            return 'Tidak ada jadwal berikutnya hari ini.';
        }

        const nextLessonStartTime = new Date();
        const [hours, minutes, seconds] = nextLesson.jam_mulai.split(':').map(Number);
        nextLessonStartTime.setHours(hours, minutes, seconds, 0);

        const timeRemaining = nextLessonStartTime.getTime() - currentTime.getTime();

        if (timeRemaining <= 0) {
            return 'Jadwal telah dimulai.';
        }

        const h = Math.floor(timeRemaining / (1000 * 60 * 60));
        const m = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        return `${h} Jam, ${m} Menit, ${s} Detik`;
    };

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = currentTime.toLocaleDateString('id-ID', options);
    const timeString = currentTime.toLocaleTimeString('id-ID');
    const countdown = calculateCountdown();
    const isClose = nextLesson && (nextLesson.jam_mulai.slice(0, 5) > timeString.slice(0, 5));

    return (
        <div className="realtime-info-container">
            <div className="current-datetime">
                <p className="current-date">{dateString}</p>
                <p className="current-time">{timeString}</p>
            </div>
            <div className="countdown">
                <p className="countdown-text">Jadwal Berikutnya:</p>
                <p className="countdown-value">{countdown}</p>
                {nextLesson && isClose && (
                    <div className="next-lesson-details">
                        <p><strong>Guru:</strong> {nextLesson.nama_guru}</p>
                        <p><strong>Kelas:</strong> {nextLesson.nama_kelas}</p>
                        <p><strong>Mapel:</strong> {nextLesson.nama_mapel}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RealtimeInfo;