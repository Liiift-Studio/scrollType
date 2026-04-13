"use client"

// Interactive demo: scrollable container + velocity slider + cursor mode drives scroll-adaptive typography
import { useState, useEffect, useRef, useCallback } from "react"
import { applyScrollType, removeScrollType } from "@liiift-studio/scrolltype"
import type { ScrollTypeOptions } from "@liiift-studio/scrolltype"

/** Sample paragraphs about reading speed, scanning, and how they differ */
const PARAGRAPHS = [
	"Reading is a slow act. When you settle into a paragraph you are moving through it at the pace of thought — roughly 200 to 300 words per minute, eyes tracking forward, occasionally looping back to test comprehension. Typography designed for this mode values economy: tight tracking, moderate weight, letterforms built for recognition at rest.",
	"Scanning is something different. You are not reading the text; you are flying over it, searching for a landmark — a name, a date, a section heading, a number. Your eyes skip in large saccades, pausing for fractions of a second before jumping again. The scanning speed can exceed 1000 words per minute. What you need from typography at this speed is entirely unlike what you need for reading.",
	"At scanning speed, tight tracking becomes noise. Individual letters blur into one another. The distinctiveness that tight spacing provides for careful reading actively hurts when glyphs are glimpsed in peripheral vision. Wider tracking forces air between characters — each letter is given more room to be itself, which matters when the eye only has a moment to decide what it saw.",
	"Weight plays a similar role. Light text at rest has elegance and low noise. At speed, light strokes become invisible. Heavier weight pushes strokes to a width where they survive the perceptual blur of a fast scroll. It is not about emphasis — it is about legibility threshold. Optical size works in the same direction: larger opsz values optimise letterform detail for glyphs you are only half-seeing.",
	"CSS has no mechanism for any of this. letter-spacing, font-weight, and font-variation-settings are static declarations. The browser has no concept of how fast the user is scrolling, or whether the current reading mode is careful or hasty. scrollType bridges that gap — listening to scroll velocity and interpolating tracking, weight, and optical size in real time so that the text is always matched to the pace of the reader.",
]

/** Cursor icon SVG */
function CursorIcon() {
	return (
		<svg width="11" height="14" viewBox="0 0 11 14" fill="currentColor" aria-hidden>
			<path d="M0 0L0 11L3 8L5 13L6.8 12.3L4.8 7.3L8.5 7.3Z" />
		</svg>
	)
}

/** Clamp a number to [min, max] */
function clamp(v: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, v))
}

/** Interactive demo with scrollable container, velocity bar, slider, and cursor mode */
export default function Demo() {
	// Manual velocity for slider and cursor mode (0–1)
	const [sliderVelocity, setSliderVelocity] = useState(0)

	// Interaction modes
	const [cursorMode, setCursorMode] = useState(false)

	// Detected capabilities
	const [showCursor, setShowCursor] = useState(false)

	// Ref to the scrollable text container
	const scrollContainerRef = useRef<HTMLDivElement>(null)

	// Refs to each paragraph element
	const paraRefs = useRef<(HTMLElement | null)[]>([])

	// Velocity bar ref — updated via rAF, not state
	const velocityBarRef = useRef<HTMLDivElement>(null)

	// Current live velocity (shared between scroll and cursor/slider sources)
	const liveVelocityRef = useRef(0)

	// rAF loop for applying scrollType to all paragraphs from slider/cursor source
	const externalRafRef = useRef<number | null>(null)

	// Smoothed EMA state for external (non-scroll) velocity readout
	const smoothedExternalRef = useRef(0)

	// Scroll velocity tracking for the container
	const scrollStateRef = useRef({ lastY: 0, lastTime: 0, velocity: 0 })

	useEffect(() => {
		setShowCursor(window.matchMedia('(hover: hover)').matches)
	}, [])

	// Options for scrollType — resolved from controls
	const [trackingMax, setTrackingMax] = useState(0.06)
	const [weightMax, setWeightMax] = useState(600)
	const [smoothing, setSmoothing] = useState(0.12)

	const options: ScrollTypeOptions = {
		trackingRange: [0, trackingMax],
		weightRange: [300, weightMax],
		opszRange: [12, 24],
		opacityRange: [1, 0.85],
		smoothing,
		velocityMax: 15,
	}
	// Keep a stable ref to options so the rAF tick always reads the latest
	const optionsRef = useRef(options)
	optionsRef.current = options

	// Attach scroll listener to the container for scroll-driven mode
	useEffect(() => {
		const container = scrollContainerRef.current
		if (!container) return

		const onScroll = () => {
			const now = performance.now()
			const st = scrollStateRef.current
			const dt = now - st.lastTime
			const dy = Math.abs(container.scrollTop - st.lastY)
			st.velocity = dt > 0 ? (dy / dt) * 16.67 : 0
			st.lastY = container.scrollTop
			st.lastTime = now
		}

		container.addEventListener('scroll', onScroll, { passive: true })
		return () => container.removeEventListener('scroll', onScroll)
	}, [])

	// Apply scrollType to all paragraphs via a continuous rAF loop
	// Sources: container scroll OR external slider/cursor velocity
	const applyAll = useCallback((velocity: number) => {
		paraRefs.current.forEach(el => {
			if (el) applyScrollType(el, velocity, optionsRef.current)
		})
	}, [])

	useEffect(() => {
		const velocityMax = optionsRef.current.velocityMax ?? 15

		const tick = () => {
			// Merge sources: scroll velocity from container, or external (cursor/slider)
			const scrollVelocity = Math.min(scrollStateRef.current.velocity / velocityMax, 1)
			// Decay scroll velocity when not scrolling
			scrollStateRef.current.velocity *= 0.85

			// Use whichever source is larger
			const rawVelocity = Math.max(scrollVelocity, liveVelocityRef.current)
			liveVelocityRef.current = rawVelocity

			applyAll(rawVelocity)

			// Update velocity bar via DOM (not state — avoids re-renders)
			if (velocityBarRef.current) {
				// Mirror EMA to show smoothed value in bar
				const alpha = 1 - (optionsRef.current.smoothing ?? 0.12)
				smoothedExternalRef.current = smoothedExternalRef.current * alpha + rawVelocity * (1 - alpha)
				velocityBarRef.current.style.width = `${smoothedExternalRef.current * 100}%`
				smoothedExternalRef.current *= 0.85
			}

			externalRafRef.current = requestAnimationFrame(tick)
		}

		externalRafRef.current = requestAnimationFrame(tick)
		return () => {
			if (externalRafRef.current !== null) cancelAnimationFrame(externalRafRef.current)
			// Restore all paragraphs
			paraRefs.current.forEach(el => { if (el) removeScrollType(el) })
		}
	}, [applyAll])

	// When slider changes, push velocity into the live ref
	useEffect(() => {
		if (!cursorMode) {
			liveVelocityRef.current = sliderVelocity
		}
	}, [sliderVelocity, cursorMode])

	// Cursor mode — mouse Y drives velocity (top = max, bottom = 0). Esc to exit.
	useEffect(() => {
		if (!cursorMode) return
		const handleMove = (e: MouseEvent) => {
			liveVelocityRef.current = clamp(1 - e.clientY / window.innerHeight, 0, 1)
		}
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setCursorMode(false)
		}
		window.addEventListener('mousemove', handleMove)
		window.addEventListener('keydown', handleKey)
		return () => {
			window.removeEventListener('mousemove', handleMove)
			window.removeEventListener('keydown', handleKey)
		}
	}, [cursorMode])

	// When cursor mode exits, reset live velocity to slider value
	useEffect(() => {
		if (!cursorMode) {
			liveVelocityRef.current = sliderVelocity
		}
	}, [cursorMode, sliderVelocity])

	const toggleCursor = () => setCursorMode(v => !v)

	return (
		<div className="w-full flex flex-col gap-6">

			{/* Velocity bar — thin strip at top of scroll container */}
			<div className="flex flex-col gap-1">
				<div className="flex justify-between text-xs uppercase tracking-widest opacity-50">
					<span>Velocity</span>
				</div>
				<div className="w-full h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
					<div
						ref={velocityBarRef}
						className="h-full rounded-full transition-none"
						style={{ width: '0%', background: 'rgba(212,184,240,0.7)' }}
					/>
				</div>
			</div>

			{/* Scrollable text container */}
			<div
				ref={scrollContainerRef}
				className="rounded-lg p-6 flex flex-col gap-5 overflow-y-scroll"
				style={{
					maxHeight: '60vh',
					background: 'rgba(212,184,240,0.04)',
					border: '1px solid rgba(212,184,240,0.12)',
					scrollbarWidth: 'none',
				}}
			>
				{PARAGRAPHS.map((text, i) => (
					<p
						key={i}
						ref={el => { paraRefs.current[i] = el }}
						style={{
							fontFamily: 'var(--font-merriweather), serif',
							fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
							lineHeight: 1.75,
							margin: 0,
						}}
					>
						{text}
					</p>
				))}
			</div>

			{/* Controls */}
			<div className="flex flex-wrap items-start gap-6">

				{/* Velocity slider — hidden in cursor mode */}
				{!cursorMode && (
					<div className="flex flex-col gap-1 min-w-48 flex-1">
						<div className="flex justify-between text-xs uppercase tracking-widest opacity-50">
							<span>Manual velocity</span>
							<span className="tabular-nums">{sliderVelocity.toFixed(2)}</span>
						</div>
						<input
							type="range"
							min={0}
							max={1}
							step={0.01}
							value={sliderVelocity}
							aria-label="Manual velocity (0 = at rest, 1 = maximum)"
							onChange={e => setSliderVelocity(Number(e.target.value))}
							onTouchStart={e => e.stopPropagation()}
							style={{ touchAction: 'none' }}
						/>
					</div>
				)}

				{/* Cursor mode toggle */}
				{showCursor && (
					<div className="flex items-center gap-3 pt-1">
						<button
							onClick={toggleCursor}
							title="Move cursor up/down to control velocity"
							className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all"
							style={{
								borderColor: 'currentColor',
								opacity: cursorMode ? 1 : 0.5,
								background: cursorMode ? 'var(--btn-bg)' : 'transparent',
							}}
						>
							<CursorIcon />
							<span>{cursorMode ? 'Esc to exit' : 'Cursor'}</span>
						</button>
						{cursorMode && (
							<p className="text-xs opacity-50 italic">
								Move cursor up for max velocity, down for rest. Press Esc to exit.
							</p>
						)}
					</div>
				)}
			</div>

			{/* Typography controls */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="flex flex-col gap-1">
					<div className="flex justify-between text-xs uppercase tracking-widest opacity-50">
						<span>Tracking max</span>
						<span className="tabular-nums">{trackingMax.toFixed(2)}em</span>
					</div>
					<input
						type="range"
						min={0}
						max={0.15}
						step={0.005}
						value={trackingMax}
						aria-label="Tracking max in em (0 to 0.15)"
						onChange={e => setTrackingMax(Number(e.target.value))}
						onTouchStart={e => e.stopPropagation()}
						style={{ touchAction: 'none' }}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<div className="flex justify-between text-xs uppercase tracking-widest opacity-50">
						<span>Weight max</span>
						<span className="tabular-nums">{weightMax}</span>
					</div>
					<input
						type="range"
						min={300}
						max={900}
						step={10}
						value={weightMax}
						aria-label="Weight max (300 to 900)"
						onChange={e => setWeightMax(Number(e.target.value))}
						onTouchStart={e => e.stopPropagation()}
						style={{ touchAction: 'none' }}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<div className="flex justify-between text-xs uppercase tracking-widest opacity-50">
						<span>Smoothing</span>
						<span className="tabular-nums">{smoothing.toFixed(2)}</span>
					</div>
					<input
						type="range"
						min={0.01}
						max={0.5}
						step={0.01}
						value={smoothing}
						aria-label="EMA smoothing factor (0.01 to 0.5)"
						onChange={e => setSmoothing(Number(e.target.value))}
						onTouchStart={e => e.stopPropagation()}
						style={{ touchAction: 'none' }}
					/>
				</div>
			</div>

			<p className="text-xs opacity-50 italic" style={{ lineHeight: "1.8" }}>
				Scroll the container — or drag the slider — to see how typography adapts to reading speed. Fast scanning needs wider tracking and heavier weight; slow reading needs neither. Useful on any scroll-heavy interface.
			</p>
		</div>
	)
}
