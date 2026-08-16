import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Beat, Playlist, MusicSession, BeatStatus } from '../types';
import {
  subscribeToBeats,
  subscribeToPlaylists,
  subscribeToMusicSessions,
  saveBeat,
  deleteBeatDoc,
  savePlaylist,
  deletePlaylistDoc,
  saveMusicSession,
} from '../services/db';
import { uploadBeatAudio, uploadBeatCover, removeBeatAudio } from '../services/storage';
import { getAudioBlobUrl } from '../services/indexedDbStorage';
import { audioEngine } from '../services/audioEngine';
import { generateSampleData } from '../services/sampleData';
import { useAuth } from './AuthContext';

interface ActiveSessionState {
  beatId?: string;
  beatTitle?: string;
  startTime: number;
  elapsedSeconds: number;
  notes: string;
  isRunning: boolean;
}

interface MusicContextType {
  beats: Beat[];
  playlists: Playlist[];
  sessions: MusicSession[];
  
  // Player state
  currentBeat: Beat | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  isShuffle: boolean;
  queue: Beat[];
  queueIndex: number;
  audioStep: number;
  
  // Player actions
  playBeat: (beat: Beat, newQueue?: Beat[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (beat: Beat) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  
  // Beat CRUD & Upload
  uploadBeat: (
    data: {
      title: string;
      bpm: number;
      key: string;
      genre: string;
      tags: string[];
      status: BeatStatus;
      notes?: string;
      color?: string;
    },
    audioFile?: File,
    coverFile?: File,
    onProgress?: (pct: number) => void
  ) => Promise<Beat>;
  updateBeat: (beat: Beat) => Promise<void>;
  deleteBeat: (beatId: string) => Promise<void>;
  toggleFavorite: (beatId: string) => Promise<void>;
  getBeatById: (beatId: string) => Beat | undefined;

  // Playlists
  createPlaylist: (name: string, description?: string, initialBeatIds?: string[]) => Promise<void>;
  updatePlaylist: (playlist: Playlist) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addBeatToPlaylist: (playlistId: string, beatId: string) => Promise<void>;
  removeBeatFromPlaylist: (playlistId: string, beatId: string) => Promise<void>;

  // Session Studio Mode
  activeSession: ActiveSessionState | null;
  startSession: (beatId?: string, beatTitle?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (notes?: string) => Promise<void>;
  updateSessionNotes: (notes: string) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [sessions, setSessions] = useState<MusicSession[]>([]);

  // Player State
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [queue, setQueue] = useState<Beat[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [audioStep, setAudioStep] = useState<number>(0);

  // Active Music Studio Session
  const [activeSession, setActiveSession] = useState<ActiveSessionState | null>(() => {
    const saved = localStorage.getItem('lifebeatos_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const proceduralTimerRef = useRef<number | null>(null);

  // Subscriptions
  useEffect(() => {
    if (!user) {
      const sample = generateSampleData('guest_preview');
      setBeats(sample.beats);
      setPlaylists(sample.playlists);
      setSessions([]);
      return;
    }

    const unsubBeats = subscribeToBeats(user.uid, (data) => setBeats(data));
    const unsubPlaylists = subscribeToPlaylists(user.uid, (data) => setPlaylists(data));
    const unsubSessions = subscribeToMusicSessions(user.uid, (data) => setSessions(data));

    return () => {
      unsubBeats();
      unsubPlaylists();
      unsubSessions();
    };
  }, [user]);

  // Sync activeSession to localStorage
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('lifebeatos_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('lifebeatos_active_session');
    }
  }, [activeSession]);

  // Session timer tick
  useEffect(() => {
    let interval: number | null = null;
    if (activeSession && activeSession.isRunning) {
      interval = window.setInterval(() => {
        setActiveSession((prev) => (prev ? { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 } : null));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession?.isRunning]);

  // Initialize HTML5 Audio Element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        playNext();
      }
    };

    const handleError = () => {
      // If remote URL fails to load, fallback to procedural synthesis engine
      if (currentBeat) {
        startProceduralBeat(currentBeat);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioEngine.stopBeatPattern();
    };
  }, [isLooping]);

  // Set volume to HTML5 Audio and Web Audio Engine
  useEffect(() => {
    const effectiveVol = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = effectiveVol;
    }
    audioEngine.setVolume(effectiveVol);
  }, [volume, isMuted]);

  // Procedural Synth Player handler
  const startProceduralBeat = useCallback((beat: Beat) => {
    audioEngine.startBeatPattern(beat.id, beat.bpm || 120, beat.genre || 'trap', (step) => {
      setAudioStep(step);
    });
    setDuration(beat.duration || 180);
    setIsPlaying(true);

    if (proceduralTimerRef.current) clearInterval(proceduralTimerRef.current);
    proceduralTimerRef.current = window.setInterval(() => {
      setCurrentTime((prev) => {
        const nextTime = prev + 0.25;
        if (nextTime >= (beat.duration || 180)) {
          if (isLooping) return 0;
          playNext();
          return 0;
        }
        return nextTime;
      });
    }, 250);
  }, [isLooping]);

  const stopProcedural = () => {
    audioEngine.stopBeatPattern();
    if (proceduralTimerRef.current) {
      clearInterval(proceduralTimerRef.current);
      proceduralTimerRef.current = null;
    }
  };

  // Main Play Action
  const playBeat = useCallback(async (beat: Beat, newQueue?: Beat[]) => {
    setCurrentBeat(beat);
    setCurrentTime(0);
    setDuration(beat.duration || 180);

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((b) => b.id === beat.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else if (!queue.some((b) => b.id === beat.id)) {
      setQueue((prev) => (prev.length === 0 ? [beat] : [...prev, beat]));
    }

    stopProcedural();

    // Check if audio has a direct audioUrl or local IndexedDB blob
    let playUrl = beat.audioUrl;
    if (beat.audioBlobId) {
      const blobUrl = await getAudioBlobUrl(beat.audioBlobId);
      if (blobUrl) playUrl = blobUrl;
    }

    if (playUrl && playUrl.trim().length > 0 && audioRef.current) {
      try {
        audioRef.current.src = playUrl;
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('HTML5 Audio playback prevented or failed, switching to live synthesis:', err);
        startProceduralBeat(beat);
      }
    } else {
      // Use procedural Web Audio synthesizer
      startProceduralBeat(beat);
    }
  }, [queue, startProceduralBeat]);

  const togglePlay = useCallback(() => {
    if (!currentBeat) {
      if (beats.length > 0) {
        playBeat(beats[0], beats);
      }
      return;
    }

    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [currentBeat, isPlaying, beats, playBeat]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    stopProcedural();
  }, []);

  const resume = useCallback(() => {
    if (!currentBeat) return;
    setIsPlaying(true);

    if (audioRef.current && audioRef.current.src && audioRef.current.src !== window.location.href) {
      audioRef.current.play().catch(() => {
        startProceduralBeat(currentBeat);
      });
    } else {
      startProceduralBeat(currentBeat);
    }
  }, [currentBeat, startProceduralBeat]);

  const seek = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (audioRef.current && !isNaN(seconds)) {
      audioRef.current.currentTime = seconds;
    }
  }, []);

  const setVolume = (vol: number) => {
    setVolumeState(Math.max(0, Math.min(1, vol)));
    if (isMuted && vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleLoop = () => {
    setIsLooping((prev) => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const playNext = useCallback(() => {
    const list = queue.length > 0 ? queue : beats;
    if (list.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * list.length);
    } else if (nextIdx >= list.length) {
      nextIdx = 0;
    }

    setQueueIndex(nextIdx);
    const nextBeat = list[nextIdx];
    if (nextBeat) {
      playBeat(nextBeat);
    }
  }, [queue, beats, queueIndex, isShuffle, playBeat]);

  const playPrevious = useCallback(() => {
    const list = queue.length > 0 ? queue : beats;
    if (list.length === 0) return;

    if (currentTime > 3) {
      seek(0);
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = list.length - 1;
    }

    setQueueIndex(prevIdx);
    const prevBeat = list[prevIdx];
    if (prevBeat) {
      playBeat(prevBeat);
    }
  }, [queue, beats, queueIndex, currentTime, seek, playBeat]);

  const addToQueue = (beat: Beat) => {
    setQueue((prev) => [...prev, beat]);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
    if (index === queueIndex && queue.length > 1) {
      playNext();
    }
  };

  const clearQueue = () => {
    if (currentBeat) {
      setQueue([currentBeat]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
  };

  // Beat CRUD
  const uploadBeat = async (
    data: {
      title: string;
      bpm: number;
      key: string;
      genre: string;
      tags: string[];
      status: BeatStatus;
      notes?: string;
      color?: string;
    },
    audioFile?: File,
    coverFile?: File,
    onProgress?: (pct: number) => void
  ): Promise<Beat> => {
    if (!user) throw new Error('Must be signed in to upload beats');
    const beatId = 'beat_' + Math.random().toString(36).substring(2, 9);
    const now = Date.now();

    let audioUrl = '';
    let blobId: string | undefined;
    let fileSize: number | undefined;

    if (audioFile) {
      const uploadRes = await uploadBeatAudio(user.uid, beatId, audioFile, onProgress);
      audioUrl = uploadRes.url;
      blobId = uploadRes.blobId;
      fileSize = uploadRes.fileSize;
    }

    let coverUrl = '';
    if (coverFile) {
      coverUrl = await uploadBeatCover(user.uid, beatId, coverFile);
    }

    const newBeat: Beat = {
      id: beatId,
      userId: user.uid,
      title: data.title,
      audioUrl,
      audioBlobId: blobId,
      duration: 180,
      bpm: Number(data.bpm) || 120,
      key: data.key || 'C minor',
      genre: data.genre || 'Trap',
      tags: data.tags || [],
      status: data.status || 'wip',
      notes: data.notes || '',
      coverUrl: coverUrl || undefined,
      color: data.color || '#6366f1',
      isFavorite: false,
      fileSize,
      createdAt: now,
      uploadedAt: now,
    };

    await saveBeat(user.uid, newBeat);
    return newBeat;
  };

  const updateBeat = async (beat: Beat) => {
    if (!user) return;
    await saveBeat(user.uid, beat);
    if (currentBeat?.id === beat.id) {
      setCurrentBeat(beat);
    }
  };

  const deleteBeat = async (beatId: string) => {
    if (!user) return;
    const toDelete = beats.find((b) => b.id === beatId);
    if (toDelete) {
      await removeBeatAudio(user.uid, beatId, toDelete.audioUrl);
    }
    await deleteBeatDoc(user.uid, beatId);
    if (currentBeat?.id === beatId) {
      pause();
      setCurrentBeat(null);
    }
  };

  const toggleFavorite = async (beatId: string) => {
    if (!user) return;
    const b = beats.find((item) => item.id === beatId);
    if (!b) return;
    const updated = { ...b, isFavorite: !b.isFavorite };
    await saveBeat(user.uid, updated);
  };

  const getBeatById = useCallback(
    (beatId: string) => {
      return beats.find((b) => b.id === beatId);
    },
    [beats]
  );

  // Playlists
  const createPlaylist = async (name: string, description = '', initialBeatIds: string[] = []) => {
    if (!user) return;
    const newPl: Playlist = {
      id: 'pl_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      name,
      description,
      beatIds: initialBeatIds,
      createdAt: Date.now(),
    };
    await savePlaylist(user.uid, newPl);
  };

  const updatePlaylist = async (playlist: Playlist) => {
    if (!user) return;
    await savePlaylist(user.uid, playlist);
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!user) return;
    await deletePlaylistDoc(user.uid, playlistId);
  };

  const addBeatToPlaylist = async (playlistId: string, beatId: string) => {
    if (!user) return;
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    if (pl.beatIds.includes(beatId)) return;
    const updated = { ...pl, beatIds: [...pl.beatIds, beatId] };
    await savePlaylist(user.uid, updated);
  };

  const removeBeatFromPlaylist = async (playlistId: string, beatId: string) => {
    if (!user) return;
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const updated = { ...pl, beatIds: pl.beatIds.filter((id) => id !== beatId) };
    await savePlaylist(user.uid, updated);
  };

  // Music Session Mode
  const startSession = (beatId?: string, beatTitle?: string) => {
    let resolvedTitle = beatTitle;
    if (beatId && !resolvedTitle) {
      const b = beats.find((item) => item.id === beatId);
      if (b) resolvedTitle = b.title;
    }

    const newSession: ActiveSessionState = {
      beatId,
      beatTitle: resolvedTitle || (beatId ? 'Track Production' : 'Free Studio Session'),
      startTime: Date.now(),
      elapsedSeconds: 0,
      notes: '',
      isRunning: true,
    };
    setActiveSession(newSession);

    // If associated beat, auto cue it in player
    if (beatId) {
      const b = beats.find((item) => item.id === beatId);
      if (b) playBeat(b);
    }
  };

  const pauseSession = () => {
    setActiveSession((prev) => (prev ? { ...prev, isRunning: false } : null));
  };

  const resumeSession = () => {
    setActiveSession((prev) => (prev ? { ...prev, isRunning: true } : null));
  };

  const endSession = async (notes?: string) => {
    if (!user || !activeSession) return;
    const finalNotes = notes !== undefined ? notes : activeSession.notes;
    const sessionRecord: MusicSession = {
      id: 'sess_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      beatId: activeSession.beatId,
      beatTitle: activeSession.beatTitle,
      startTime: activeSession.startTime,
      endTime: Date.now(),
      durationSeconds: activeSession.elapsedSeconds,
      notes: finalNotes,
      createdAt: Date.now(),
    };
    await saveMusicSession(user.uid, sessionRecord);
    setActiveSession(null);
  };

  const updateSessionNotes = (notes: string) => {
    setActiveSession((prev) => (prev ? { ...prev, notes } : null));
  };

  return (
    <MusicContext.Provider
      value={{
        beats,
        playlists,
        sessions,
        currentBeat,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isLooping,
        isShuffle,
        queue,
        queueIndex,
        audioStep,
        playBeat,
        togglePlay,
        pause,
        resume,
        seek,
        setVolume,
        toggleMute,
        toggleLoop,
        toggleShuffle,
        playNext,
        playPrevious,
        addToQueue,
        removeFromQueue,
        clearQueue,
        uploadBeat,
        updateBeat,
        deleteBeat,
        toggleFavorite,
        getBeatById,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addBeatToPlaylist,
        removeBeatFromPlaylist,
        activeSession,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        updateSessionNotes,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
