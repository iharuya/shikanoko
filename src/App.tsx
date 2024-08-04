import { FC, useCallback, useEffect, useRef, useState } from "react"
import { Arrow } from "./Arrow"
import { CyclicArrow } from "./CyclicArrow"
import { StateNode } from "./StateNode"

const states = ["b", "し", "か", "の", "こ", "た", "ん"] as const
type State = (typeof states)[number]
const stateToAudioName = {
	b: "beat",
	し: "shi",
	か: "ka",
	の: "no-1",
	こ: "ko-1",
	た: "tan",
	ん: "n"
} satisfies Record<State, string>

const P = [
	[1 / 2, 1 / 2, 0, 0, 0, 0, 0],
	[0, 0, 1 / 2, 0, 0, 1 / 2, 0],
	[0, 0, 0, 1, 0, 0, 0],
	[0, 0, 0, 0, 1, 0, 0],
	[0, 1 / 4, 0, 1 / 2, 1 / 4, 0, 0],
	[0, 0, 0, 0, 0, 0, 1],
	[1 / 2, 0, 0, 0, 0, 1 / 2, 0]
]

export const App: FC = () => {
	const audioContextRef = useRef<AudioContext | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentState, setCurrentState] = useState<State>("b")
	const [audioBuffers, setAudioBuffers] = useState<Record<
		State,
		AudioBuffer
	> | null>(null)
	const [steps, setSteps] = useState(0)

	const loadAudioFiles = useCallback(async () => {
		setAudioBuffers(null)
		const audioBuffers = {} as Record<State, AudioBuffer>
		for (const state of states) {
			const path = `/audio/${stateToAudioName[state]}.mp3`
			try {
				const buffer = await loadAudioFile(path)
				if (!buffer) throw new Error("No buffer")
				audioBuffers[state] = buffer
			} catch (error) {
				console.error(error)
				throw new Error(`Failed to load audio file: ${path}`)
			}
		}
		setAudioBuffers(audioBuffers)
	}, [])

	const loadAudioFile = useCallback(async (url: string) => {
		if (!audioContextRef.current) return
		const response = await fetch(url)
		const arrayBuffer = await response.arrayBuffer()
		return await audioContextRef.current.decodeAudioData(arrayBuffer)
	}, [])

	const next = useCallback(async () => {
		if (!audioBuffers || !audioContextRef.current) return
		const currentIndex = states.indexOf(currentState)
		let nextStateIndex = 0
		const randomValue = Math.random()
		let cumulativeProbability = 0
		for (let i = 0; i < 7; i++) {
			cumulativeProbability += P[currentIndex][i]
			if (randomValue < cumulativeProbability) {
				nextStateIndex = i
				break
			}
		}
		const nextState = states[nextStateIndex]
		setCurrentState(nextState)

		// 音声を再生
		const source = audioContextRef.current.createBufferSource()
		source.buffer = audioBuffers[nextState]
		source.connect(audioContextRef.current.destination)
		source.start()
		// 再生終了を待つ
		await new Promise<void>((resolve) => {
			source.onended = async () => {
				// await sleep(1000)
				resolve()
			}
		})
		setSteps((prev) => prev + 1)
	}, [audioBuffers, currentState])

	const handleStart = useCallback(async () => {
		if (isPlaying) return
		if (!audioContextRef.current) {
			setIsLoading(true)
			audioContextRef.current = new AudioContext()
			await loadAudioFiles()
			setIsLoading(false)
		}
		setIsPlaying(true)
	}, [isPlaying, loadAudioFiles])

	const handleStop = () => {
		setIsPlaying(false)
		if (!audioContextRef.current) return
		audioContextRef.current = null
	}

	// const updateP = useCallback((newP: number[][]) => {
	//   for (const row of newP) {
	//     if (row.length !== 7) return
	//     let sum = 0
	//     for (const p of row) {
	//       if (p < 0 || p > 1) return
	//       sum += p
	//     }
	//     if (sum !== 1) return
	//   }
	//   setP(newP)
	// }, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: Emit when step changes
	useEffect(() => {
		if (!isPlaying) return
		next()
	}, [steps, isPlaying])

	return (
		<main className="mx-auto text-center">
			<div className="relative my-6 mx-auto w-[750px] h-[450px]">
				<StateNode
					isCurrent={currentState === "b"}
					className="top-[50px] left-[175px]"
				>
					★
				</StateNode>
				<StateNode
					isCurrent={currentState === "し"}
					className="top-[175px] left-[325px]"
				>
					し
				</StateNode>
				<StateNode
					isCurrent={currentState === "か"}
					className="top-[50px] left-[475px]"
				>
					か
				</StateNode>
				<StateNode
					isCurrent={currentState === "の"}
					className="top-[175px] left-[625px]"
				>
					の
				</StateNode>
				<StateNode
					isCurrent={currentState === "こ"}
					className="top-[300px] left-[475px]"
				>
					こ
				</StateNode>
				<StateNode
					isCurrent={currentState === "た"}
					className="top-[300px] left-[175px]"
				>
					た
				</StateNode>
				<StateNode
					isCurrent={currentState === "ん"}
					className="top-[175px] left-[25px]"
				>
					ん
				</StateNode>

				{/* b -> し */}
				<Arrow
					value={"1/2"}
					start={{ x: 275, y: 100 }}
					mid={{ x: 330, y: 100 }}
					end={{ x: 345, y: 185 }}
					offset={{ x: 20, y: -20 }}
				/>

				{/* b -> b */}
				<CyclicArrow
					value={"1/2"}
					center={{ x: 225, y: 43 }}
					radius={30}
					startAngle={(Math.PI * 5) / 6}
					endAngle={(Math.PI * 1) / 6}
					offset={{ x: 0, y: -40 }}
				/>

				{/* し -> か */}
				<Arrow
					value={"1/2"}
					start={{ x: 405, y: 185 }}
					mid={{ x: 420, y: 100 }}
					end={{ x: 475, y: 100 }}
					offset={{ x: -20, y: -20 }}
				/>

				{/* か -> の */}
				<Arrow
					value={"1"}
					start={{ x: 575, y: 100 }}
					mid={{ x: 630, y: 100 }}
					end={{ x: 645, y: 185 }}
					offset={{ x: 20, y: -20 }}
				/>

				{/* の -> こ */}
				<Arrow
					value={"1"}
					start={{ x: 645, y: 265 }}
					mid={{ x: 630, y: 350 }}
					end={{ x: 575, y: 350 }}
					offset={{ x: 20, y: 20 }}
				/>

				{/* こ -> の */}
				<Arrow
					value={"1/2"}
					start={{ x: 545, y: 305 }}
					mid={{ x: 570, y: 225 }}
					end={{ x: 625, y: 225 }}
					offset={{ x: -20, y: -20 }}
				/>

				{/* こ -> こ */}
				<CyclicArrow
					value={"1/4"}
					center={{ x: 525, y: 407 }}
					radius={30}
					endAngle={(Math.PI * 7) / 6}
					startAngle={(-Math.PI * 1) / 6}
					offset={{ x: 0, y: -20 }}
				/>

				{/* こ -> し */}
				<Arrow
					value={"1/4"}
					start={{ x: 475, y: 350 }}
					mid={{ x: 445, y: 350 }}
					end={{ x: 405, y: 265 }}
					offset={{ x: -20, y: 20 }}
				/>

				{/* し -> た */}
				<Arrow
					value={"1/2"}
					start={{ x: 345, y: 265 }}
					mid={{ x: 330, y: 350 }}
					end={{ x: 275, y: 350 }}
					offset={{ x: 20, y: 20 }}
				/>

				{/* た -> ん */}
				<Arrow
					value={"1"}
					start={{ x: 175, y: 350 }}
					mid={{ x: 145, y: 350 }}
					end={{ x: 105, y: 265 }}
					offset={{ x: -20, y: 20 }}
				/>

				{/* ん -> た */}
				<Arrow
					value={"1/2"}
					start={{ x: 125, y: 225 }}
					mid={{ x: 180, y: 225 }}
					end={{ x: 195, y: 310 }}
					offset={{ x: 20, y: -20 }}
				/>

				{/* ん -> b */}
				<Arrow
					value={"1/2"}
					start={{ x: 105, y: 185 }}
					mid={{ x: 120, y: 100 }}
					end={{ x: 175, y: 100 }}
					offset={{ x: -20, y: -20 }}
				/>
			</div>

			<div className="flex justify-center items-center gap-2 md:gap-8 whitespace-nowrap">
				<button
					type="button"
					className="bg-[#6D2A1A] text-white font-bold p-4 text-4xl rounded-lg enabled:hover:brightness-150 disabled:bg-stone-500 disabled:cursor-not-allowed enabled:animate-bounce"
					onClick={handleStart}
					disabled={isPlaying || isLoading}
				>
					スタート
				</button>
				<button
					type="button"
					className="bg-[#6D2A1A] text-white font-bold p-4 text-4xl rounded-lg enabled:hover:brightness-150 disabled:bg-stone-500 disabled:cursor-not-allowed"
					onClick={handleStop}
					disabled={!isPlaying || isLoading}
				>
					ストップ
				</button>
			</div>

			{isLoading && (
				<p className="my-6 text-stone-500 animate-pulse">よみこみちゅう...</p>
			)}
		</main>
	)
}
