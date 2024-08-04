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
		<div
			className={cn(
				"bg-white w-[100px] h-[100px] rounded-full border-[10px] border-red-400 absolute",
				className,
				!isCurrent && "border-stone-400"
			)}
		>
			<div
				className={cn(
					"flex flex-col w-full h-full justify-center items-center text-stone-800 text-[48px] font-bold select-none",
					!isCurrent && "text-stone-700"
				)}
			>
				{children}
			</div>
		</div>
	)
}
