<template>
  <canvas ref="canvasRef" class="squares-canvas" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  direction: { type: String, default: 'diagonal' },
  speed: { type: Number, default: 0.5 },
  squareSize: { type: Number, default: 40 },
  borderColor: { type: String, default: '#1a1a1a' },
  hoverFillColor: { type: String, default: '#111' }
})

const canvasRef = ref(null)
let animId = null
let offset = 0
let hovered = null
let cols = 0
let rows = 0

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  const resize = () => {
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    cols = Math.ceil(canvas.width / props.squareSize) + 2
    rows = Math.ceil(canvas.height / props.squareSize) + 2
  }

  resize()
  window.addEventListener('resize', resize)

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    let col, row
    const s = props.squareSize

    if (props.direction === 'diagonal') {
      col = Math.floor((mx + offset) / s)
      row = Math.floor((my + offset) / s)
    } else if (props.direction === 'right') {
      col = Math.floor((mx + offset) / s)
      row = Math.floor(my / s)
    } else if (props.direction === 'down') {
      col = Math.floor(mx / s)
      row = Math.floor((my + offset) / s)
    } else {
      col = Math.floor(mx / s)
      row = Math.floor(my / s)
    }
    hovered = `${col},${row}`
  }

  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('mouseleave', () => { hovered = null })

  const draw = () => {
    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)
    offset = (offset + props.speed * 0.3) % props.squareSize
    const s = props.squareSize

    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        let x, y
        if (props.direction === 'diagonal') { x = c * s - offset; y = r * s - offset }
        else if (props.direction === 'right') { x = c * s - offset; y = r * s }
        else if (props.direction === 'down') { x = c * s; y = r * s - offset }
        else { x = c * s; y = r * s }

        if (hovered === `${c},${r}`) {
          ctx.fillStyle = props.hoverFillColor
          ctx.fillRect(x, y, s, s)
        }
        ctx.strokeStyle = props.borderColor
        ctx.lineWidth = 0.5
        ctx.strokeRect(x, y, s, s)
      }
    }
    animId = requestAnimationFrame(draw)
  }

  draw()

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    canvas.removeEventListener('mousemove', onMouseMove)
    cancelAnimationFrame(animId)
  })
})
</script>

<style scoped>
.squares-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>