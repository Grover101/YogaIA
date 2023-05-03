export const drawSegment = (ctx, [mx, my], [tx, ty], color, widthLine = 5) => {
    ctx.beginPath()
    ctx.moveTo(mx, my)
    ctx.lineTo(tx, ty)
    ctx.lineWidth = widthLine
    ctx.strokeStyle = color
    ctx.stroke()
}

export const drawPoint = (ctx, x, y, r, color) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
}
