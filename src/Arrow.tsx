import { FC, useEffect, useRef } from "react"

type Props = {
	value: string
	offset?: { x: number; y: number }
	start: { x: number; y: number }
	mid?: { x: number; y: number }
	end: { x: number; y: number }
}

export const Arrow: FC<Props> = ({ value, offset, start, mid, end }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d")
		if (!ctx) return

		// キャンバスをクリア
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		// 矢印の線
		ctx.strokeStyle = "#A5AFBB"
		ctx.lineWidth = 4
		ctx.beginPath()
		ctx.moveTo(start.x, start.y)
		if (mid) {
			ctx.quadraticCurveTo(mid.x, mid.y, end.x, end.y)
		} else {
			ctx.lineTo(end.x, end.y)
		}
		ctx.stroke()

		// 矢印の先端
		const arrowSize = 15
		const angle = Math.atan2(
			end.y - (mid?.y || start.y),
			end.x - (mid?.x || start.x)
		)
		ctx.beginPath()
		ctx.moveTo(end.x, end.y)
		ctx.lineTo(
			end.x - arrowSize * Math.cos(angle - Math.PI / 6),
			end.y - arrowSize * Math.sin(angle - Math.PI / 6)
		)
		ctx.moveTo(end.x, end.y)
		ctx.lineTo(
			end.x - arrowSize * Math.cos(angle + Math.PI / 6),
			end.y - arrowSize * Math.sin(angle + Math.PI / 6)
		)
		ctx.stroke()

		// value を表示
		const centerX = mid ? (start.x + mid.x + end.x) / 3 : (start.x + end.x) / 2 // mid があれば3点の中心、なければ2点の中心
		const centerY = mid ? (start.y + mid.y + end.y) / 3 : (start.y + end.y) / 2
		const textX = centerX + (offset?.x || 0)
		const textY = centerY + (offset?.y || 0)

		ctx.fillStyle = "#A5AFBB"
		ctx.font = "bold 24px Arial"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillText(value, textX, textY)
	}, [start, mid, end, value, offset])

	return (
		<canvas
			ref={canvasRef}
			width={750}
			height={450}
			className="absolute z-10"
		/>
	)
}
