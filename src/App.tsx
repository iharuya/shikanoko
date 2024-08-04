import { FC, useCallback, useEffect, useRef, useState } from "react"
import { StateNode } from "./StateNode"
import { sleep } from "./lib/time"

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
] as const

export const App: FC = () => {
	const audioContextRef = useRef<AudioContext | null>(null)
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
		console.log("run next")
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
		console.log(nextState)
		setCurrentState(nextState)

		// 音声を再生
		const source = audioContextRef.current.createBufferSource()
		source.buffer = audioBuffers[nextState]
		source.connect(audioContextRef.current.destination)
		source.start()
		// 再生終了を待つ
		await new Promise<void>((resolve) => {
			source.onended = async () => {
				await sleep(100)
				resolve()
			}
		})
		setSteps((prev) => prev + 1)
	}, [audioBuffers, currentState])

	const handleStart = useCallback(async () => {
		if (isPlaying) return
		if (!audioContextRef.current) {
			audioContextRef.current = new AudioContext()
			await loadAudioFiles()
		}
		setIsPlaying(true)
	}, [isPlaying, loadAudioFiles])

	const handleStop = () => {
		setIsPlaying(false)
		if (!audioContextRef.current) return
		audioContextRef.current = null
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: Emit when step changes
	useEffect(() => {
		if (!isPlaying) return
		next()
	}, [steps, isPlaying])

	return (
		<main className="max-w-screen-[1000px] mx-auto text-center">
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
			</div>
			<button
				type="button"
				className="bg-red-950 text-white font-bold p-4 text-4xl rounded-lg hover:brightness-150 disabled:bg-stone-500 mr-4"
				onClick={handleStart}
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
	)
}
