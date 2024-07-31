import { FC, useCallback, useEffect, useRef, useState } from 'react';

const audioNames = [
  'shi',
  'ka',
  'no-1',
  'ko-1',
  'tan',
  'beat'
] as const;

export const App: FC = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const createLoopBuffer = useCallback(async () => {
    if (!audioContextRef.current) return;

    const shuffledNames = shuffleArray(audioNames);
    let totalDuration = 0;
    const audioBuffers: AudioBuffer[] = [];

    for (const name of shuffledNames) {
      const path = `/audio/${name}.mp3`;
      const buffer = await loadAudioFile(path);
      if (!buffer) continue;
      audioBuffers.push(buffer);
      totalDuration += buffer.duration;
    }

    const loopBuffer = audioContextRef.current.createBuffer(
      2,
      audioContextRef.current.sampleRate * totalDuration,
      audioContextRef.current.sampleRate,
    );

    let offset = 0;
    for (const buffer of audioBuffers) {
      loopBuffer.copyToChannel(buffer.getChannelData(0), 0, offset);
      loopBuffer.copyToChannel(buffer.getChannelData(1), 1, offset);
      offset += buffer.length;
    }

    return loopBuffer;
  }, [])

  const shuffleArray = <T,>(array: readonly T[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadAudioFile = async (url: string) => {
    if (!audioContextRef.current) return
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContextRef.current.decodeAudioData(arrayBuffer);
  };

  const handlePlay = () => {
    if (isPlaying) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(true);
  };

  const playLoop = useCallback(async () => {
    if (!audioContextRef.current) return;

    const loopBuffer = await createLoopBuffer();
    if (!loopBuffer) return;

    while (isPlaying) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = loopBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();

      await new Promise<void>((resolve) => {
        source.onended = () => resolve();
      });
    }
  }, [isPlaying, createLoopBuffer]);

  const handleStop = () => {
    setIsPlaying(false);
    if (!audioContextRef.current) return
    audioContextRef.current.close();
    audioContextRef.current = null;
  };
  
  useEffect(() => {
    playLoop();
  }, [playLoop]);


  return (
    <main className="">
      <button
        type="button"
        className="bg-red-950 text-white font-bold p-4 text-4xl rounded-lg hover:brightness-150 disabled:bg-stone-500 mr-4"
        onClick={handlePlay}
        disabled={isPlaying}
      >
        スタート
      </button>
      <button
        type="button"
        className="bg-gray-900 text-white font-bold p-4 text-4xl rounded-lg hover:brightness-150 disabled:bg-stone-500"
        onClick={handleStop}
        disabled={!isPlaying}
      >
        ストップ
      </button>
    </main>
  );
};