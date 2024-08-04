import { FC, PropsWithChildren } from "react"
import { cn } from "./lib/classname"

type Props = {
	isCurrent: boolean
	className?: string
}
export const StateNode: FC<PropsWithChildren<Props>> = ({
	children,
	isCurrent,
	className
}) => {
	return (
		<div className={cn("absolute z-20", className)}>
			<div
				className={cn(
					"relative bg-white w-[100px] h-[100px] rounded-full border-[10px] border-stone-400",
					isCurrent && "border-[#965745] animate-[bounce_300ms_infinite]"
				)}
			>
				{isCurrent && (
					<>
						<img
							src="/tsuno.png"
							alt="左角"
							className="absolute left-[-80px] top-[-10px] scale-x-[-1] rotate-[4deg]"
						/>
						<img
							src="/tsuno.png"
							alt="右角"
							className="absolute right-[-80px] top-[-10px] rotate-[-4deg]"
						/>
					</>
				)}
				<div
					className={cn(
						"flex flex-col w-full h-full justify-center items-center text-stone-400 text-[48px] font-bold select-none",
						isCurrent && "text-[#965745]"
					)}
				>
					{children}
				</div>
			</div>
		</div>
	)
}
