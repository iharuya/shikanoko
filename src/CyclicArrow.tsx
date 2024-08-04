import { FC, useEffect, useRef } from "react"

type Props = {
	value: string
	offset?: { x: number; y: number }
	center: { x: number; y: number } // 中心座標
	radius: number // 円弧の半径
	startAngle: number // 始点角度 (ラジアン)
	endAngle: number // 終点角度 (ラジアン)
}

export const CyclicArrow: FC<Props> = ({
	value,
	offset,
	center,
	radius,
	startAngle,
	endAngle
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d")
		if (!ctx) return

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		// 矢印の線 (円弧)
		ctx.strokeStyle = "#A5AFBB"
		ctx.lineWidth = 4
		ctx.beginPath()
		ctx.arc(center.x, center.y, radius, startAngle, endAngle, false)
		ctx.stroke()

		// TODO 矢印の先端

		// value を表示
		const textX =
			center.x +
			radius * Math.cos((startAngle + endAngle) / 2) +
			(offset?.x || 0)
		const textY =
			center.y +
			radius * Math.sin((startAngle + endAngle) / 2) +
			(offset?.y || 0)

		ctx.fillStyle = "#A5AFBB"
		ctx.font = "bold 24px Arial"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillText(value, textX, textY)
	}, [value, offset, center, radius, startAngle, endAngle])

	return (
		<canvas
			ref={canvasRef}
			width={750}
			height={450}
			className="absolute z-10"
		/>
	)
}
