"use client";
import { useEffect, useState, useRef } from "react";
import styles from "../page.module.css";
import { FaRadio } from "react-icons/fa6";
import { FaPlay, FaPause, FaVolumeDown, FaHeadphones } from 'react-icons/fa';

export default function Home() {
  const [radioData, setRadioData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  const fetchRadioData = async () => {
    try {
      const response = await fetch("https://plejak.sear.cc/v1/radio");
      const data = await response.json();
      setRadioData(data);
    } catch (error) {
      console.error("Error fetching radio data:", error);
    }
  };

  useEffect(() => {
    fetchRadioData();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = () => {
        fetchRadioData();
      };

      audioRef.current.addEventListener("ended", handleEnded);

      return () => {
        audioRef.current.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioRef.current]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRadioData();
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const currentTimestamp = Math.floor(new Date().getTime() / 1000);
        const streamUrl = `https://plejak.sear.cc/stream?_ic2=${currentTimestamp}`;
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const volume = e.target.value;
    setVolume(volume);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  return (
    <div className={styles.main}>
      {radioData && (
        <div className={styles.container}>
          {/* Control Music */}
          <div className={styles.music}>
            <h2><FaRadio className={styles.radioIcon} /> radio robocze</h2>
            <div className={styles.currentMusic}>
              <img src={`https://plejak.sear.cc/${radioData.song.cover}`} alt="Current Song Cover" />
              <p>{radioData.song.name}</p>
            </div>
            <div className={styles.musicControl}>
              <div className={styles.controlButtons}>
                <button onClick={handlePlayPause} className={styles.playPauseButton}>
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
              </div>
              <div className={styles.volumeControls}>
                <FaVolumeDown className={styles.volume} />
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
              </div>
            </div>
            <div className={styles.listenerCount}>
              <FaHeadphones /> {radioData.listeners.current}
            </div>
          </div>

          {/* Playlist Section */}
          <div className={styles.playlistContainer}>
            <h2>Ostatnio grane piosenki</h2>
            <div>
              {radioData.song_history.map((song, index) => (
                <div key={index} className={styles.playlist}>
                  <img src={`https://plejak.sear.cc/${song.song.art}`} alt="Song Cover" />
                  <div className={styles.musicDetails}>
                    <div className={styles.musicDetail}>
                      <p>{song.song.title}</p>
                      <p>{song.song.artist}</p>
                    </div>
                    <p className={styles.timestamp}> {formatTimeAgo(song.played_at)} </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {radioData && <audio ref={audioRef} src="" />}
    </div>
  );
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((new Date() - new Date(timestamp * 1000)) / 1000);
  let interval = seconds / 31536000;

  if (interval >= 1) {
    const years = Math.floor(interval);
    return years + " " + (years === 1 ? "rok" : (years < 5 ? "lata" : "lat")) + " temu";
  }

  interval = seconds / 2592000;
  if (interval >= 1) {
    const months = Math.floor(interval);
    return months + " " + (months === 1 ? "miesiąc" : (months < 5 ? "miesiące" : "miesięcy")) + " temu";
  }

  interval = seconds / 86400;
  if (interval >= 1) {
    const days = Math.floor(interval);
    return days + " " + (days === 1 ? "dzień" : (days < 5 ? "dni" : "dni")) + " temu";
  }

  interval = seconds / 3600;
  if (interval >= 1) {
    const hours = Math.floor(interval);
    return hours + " " + (hours === 1 ? "godzina" : (hours < 5 ? "godziny" : "godzin")) + " temu";
  }

  interval = seconds / 60;
  if (interval >= 1) {
    const minutes = Math.floor(interval);
    return minutes + " " + (minutes === 1 ? "minuta" : (minutes < 5 ? "minuty" : "minut")) + " temu";
  }

  const secs = Math.floor(seconds);
  return secs + " " + (secs === 1 ? "sekunda" : (secs < 5 ? "sekundy" : "sekund")) + " temu";
}
