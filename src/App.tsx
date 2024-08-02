import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { StateNode } from './StateNode';

const states = ["b", "し", "か", "の", "こ", "た", "ん"] as const;
type State = typeof states[number];
const stateToAudioName = {
  b: 'beat',
  し: 'shi',
  か: 'ka',
  の: 'no-1',
  こ: 'ko-1',
  た: 'tan',
  ん: 'n'
} satisfies Record<State, string>

const P = [
  [1 / 2, 1 / 2, 0, 0, 0, 0, 0],
  [0, 0, 1 / 2, 0, 0, 1 / 2, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0],
  [0, 1 / 4, 0, 1 / 2, 1 / 4, 0, 0],
  [0, 0, 0, 0, 0, 0, 1],
  [1 / 2, 0, 0, 0, 0, 1 / 2, 0]
] as const

export const App: FC = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentState, setCurrentState] = useState<State>("b");
  const [audioBuffers, setAudioBuffers] = useState<Record<State, AudioBuffer> | null>(null);

  const loadAudioFiles = useCallback(async () => {
    setAudioBuffers(null);
    const audioBuffers = {} as Record<State, AudioBuffer>;
    for (const state of states) {
      const path = `/audio/${stateToAudioName[state]}.mp3`;
      try {
        const buffer = await loadAudioFile(path);
        if (!buffer) throw new Error("No buffer");
        audioBuffers[state] = buffer
      } catch (error) {
        console.error(error);
        throw new Error(`Failed to load audio file: ${path}`);
      }
    }
    setAudioBuffers(audioBuffers);
  }, [])

  const loadAudioFile = useCallback(async (url: string) => {
    if (!audioContextRef.current) return
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContextRef.current.decodeAudioData(arrayBuffer);
  }, [])

  // const createLoopBuffer = useCallback(async () => {
  //   if (!audioContextRef.current || !audioBuffers) return;

  //   let totalDuration = 0;
  //   const buffers: AudioBuffer[] = [];
  //   const states: State[] = ["b", "し", "か", "の", "こ", "の", "こ", "の", "こ", "こ", "し", "た", "ん", "た", "ん", "b"]
  //   for (const state of states) {
  //     const buffer = audioBuffers[state];
  //     buffers.push(buffer)
  //     totalDuration += buffer.duration;
  //   }

  //   const loopBuffer = audioContextRef.current.createBuffer(
  //     2,
  //     audioContextRef.current.sampleRate * totalDuration,
  //     audioContextRef.current.sampleRate,
  //   );

  //   let offset = 0;
  //   for (const buffer of buffers) {
  //     loopBuffer.copyToChannel(buffer.getChannelData(0), 0, offset);
  //     loopBuffer.copyToChannel(buffer.getChannelData(1), 1, offset);
  //     offset += buffer.length;
  //   }

  //   return loopBuffer;
  // }, [audioBuffers])



  const transitionToNextState = useCallback(() => {
    if (!isPlaying || !audioBuffers) return;
    const currentIndex = states.indexOf(currentState);
    let nextStateIndex = 0;
    const randomValue = Math.random();
    let cumulativeProbability = 0;
    for (let i = 0; i < 7; i++) {
      cumulativeProbability += P[currentIndex][i];
      if (randomValue < cumulativeProbability) {
        nextStateIndex = i;
        break;
      }
    }
    const nextState = states[nextStateIndex];
    setCurrentState(nextState);
    playSound(nextState);
  }, [currentState, isPlaying, audioBuffers]);

  const playSound = useCallback(
    (state: State) => {
      if (!audioContextRef.current || !audioBuffers) return;
      console.log(state)
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffers[state];
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        transitionToNextState();
      };
      source.start();
    },
    [audioBuffers, transitionToNextState],
  );

  const handlePlay = useCallback(() => {
    if (isPlaying) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    // if (audioContextRef.current.state === 'suspended') {
    //   audioContextRef.current.resume();
    // }
    setIsPlaying(true);
    playSound(currentState);
  }, [isPlaying, playSound, currentState]);

  // const startLoop = useCallback(async () => {
  //   if (!audioContextRef.current) return;
  //   while (isPlaying) {
  //     const loopBuffer = await createLoopBuffer();
  //     if (!loopBuffer) {
  //       handleStop();
  //       return
  //     }
  //     const source = audioContextRef.current.createBufferSource();
  //     source.buffer = loopBuffer;
  //     source.connect(audioContextRef.current.destination);
  //     source.start();

  //     await new Promise<void>((resolve) => {
  //       source.onended = () => resolve();
  //     });
  //   }
  // }, [isPlaying, createLoopBuffer]);

  const handleStop = () => {
    setIsPlaying(false);
    if (!audioContextRef.current) return
    audioContextRef.current.close();
    audioContextRef.current = null;
    setCurrentState("b");
  };

  const init = useCallback(async() => {
    audioContextRef.current = new AudioContext();
    await loadAudioFiles();
  }, [loadAudioFiles])

  useEffect(() => {
    init()
  }, [init]);

  // useEffect(() => {
  //   startLoop();
  // }, [startLoop]);


  return (
    <main className="max-w-screen-[1000px] mx-auto text-center">
      <div className='relative my-6 mx-auto w-[750px] h-[450px]'>
        <StateNode isCurrent={currentState === "b"} className='top-[50px] left-[175px]'>★</StateNode>
        <StateNode isCurrent={currentState === "し"} className='top-[175px] left-[325px]'>し</StateNode>
        <StateNode isCurrent={currentState === "か"} className='top-[50px] left-[475px]'>か</StateNode>
        <StateNode isCurrent={currentState === "の"} className='top-[175px] left-[625px]'>の</StateNode>
        <StateNode isCurrent={currentState === "こ"} className='top-[300px] left-[475px]'>こ</StateNode>
        <StateNode isCurrent={currentState === "た"} className='top-[300px] left-[175px]'>た</StateNode>
        <StateNode isCurrent={currentState === "ん"} className='top-[175px] left-[25px]'>ん</StateNode>
      </div>
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