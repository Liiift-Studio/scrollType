// scrollType/src/core/adjust.ts — framework-agnostic scroll-adaptive typography algorithm

import type { ScrollTypeOptions } from './types'

// ─── Saved-state registry ─────────────────────────────────────────────────────

/** Original inline styles and smoothed velocity saved per element */
interface SavedState {
	/** el.style.fontVariationSettings at time of first call */
	fvs: string
	/** el.style.letterSpacing at time of first call */
	letterSpacing: string
	/** el.style.opacity at time of first call */
	opacity: string
	/** Current EMA-smoothed velocity 0–1 */
	smoothedVelocity: number
	/** rAF handle for startScrollType loop, if active */
	rafId?: number
}

/**
 * Per-element saved original inline styles and smoothed velocity.
 * The first call to applyScrollType saves the originals; removeScrollType restores them.
 */
const savedState = new WeakMap<HTMLElement, SavedState>()

// ─── Defaults ─────────────────────────────────────────────────────────────────

/** Default option values applied when options are omitted */
const DEFAULTS = {
	trackingRange: [0, 0.06] as [number, number],
	weightRange: [300, 600] as [number, number],
	opszRange: [12, 24] as [number, number],
	opacityRange: [1, 0.85] as [number, number],
	smoothing: 0.12,
	velocityMax: 15,
	weightAxis: 'wght',
	opszAxis: 'opsz',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Linear interpolation between a and b by factor t (clamped 0–1).
 *
 * @param a - Value at t = 0
 * @param b - Value at t = 1
 * @param t - Interpolation factor, clamped to [0, 1]
 */
export function lerp(a: number, b: number, t: number): number {
	const tc = Math.min(1, Math.max(0, t))
	return a + (b - a) * tc
}

/**
 * Override a single axis value inside a font-variation-settings string,
 * preserving all other axis values. Adds the axis if not already present.
 *
 * e.g. overrideAxis('"wght" 300', 'opsz', 18) → '"wght" 300, "opsz" 18'
 *
 * @param baseFVS - Existing font-variation-settings string
 * @param axis    - Axis tag to set (e.g. 'wght', 'opsz')
 * @param value   - Numeric value to assign
 */
export function overrideAxis(baseFVS: string, axis: string, value: number): string {
	if (!baseFVS || baseFVS === 'normal') return `"${axis}" ${value}`
	const pattern = new RegExp(`(["'])${axis}\\1\\s+[\\d.eE+-]+`)
	const replacement = `"${axis}" ${value}`
	return pattern.test(baseFVS)
		? baseFVS.replace(pattern, replacement)
		: `${baseFVS}, ${replacement}`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Apply scroll-adaptive typography to an element given a pre-normalised
 * velocity value (0 = at rest, 1 = maximum velocity).
 *
 * Uses an exponential moving average to smooth the velocity before applying
 * letter-spacing, font-variation-settings (wght + opsz), and opacity.
 *
 * Calling applyScrollType multiple times is idempotent: original styles are
 * saved on the first call and used as the baseline for all subsequent calls.
 *
 * @param el       - Element to adapt
 * @param velocity - Normalised velocity 0–1
 * @param options  - ScrollTypeOptions (merged with defaults)
 */
export function applyScrollType(el: HTMLElement, velocity: number, options: ScrollTypeOptions = {}): void {
	if (typeof window === 'undefined') return

	// Resolve options
	const trackingRange = options.trackingRange ?? DEFAULTS.trackingRange
	const weightRange   = options.weightRange   ?? DEFAULTS.weightRange
	const opszRange     = options.opszRange     ?? DEFAULTS.opszRange
	const opacityRange  = options.opacityRange  ?? DEFAULTS.opacityRange
	const smoothing     = options.smoothing     ?? DEFAULTS.smoothing
	const weightAxis    = options.weightAxis    ?? DEFAULTS.weightAxis
	const opszAxis      = options.opszAxis      ?? DEFAULTS.opszAxis

	// Save original inline styles on first call
	if (!savedState.has(el)) {
		savedState.set(el, {
			fvs: el.style.fontVariationSettings,
			letterSpacing: el.style.letterSpacing,
			opacity: el.style.opacity,
			smoothedVelocity: 0,
		})
	}

	const state = savedState.get(el)!

	// Clamp input velocity
	const clampedVelocity = Math.min(1, Math.max(0, velocity))

	// Apply EMA smoothing: new = prev * (1 - α) + input * α
	// Higher smoothing factor → slower response (more smoothing)
	const alpha = Math.min(1, Math.max(0, 1 - smoothing))
	state.smoothedVelocity = state.smoothedVelocity * alpha + clampedVelocity * (1 - alpha)

	const t = state.smoothedVelocity

	// Compute interpolated values
	const tracking = lerp(trackingRange[0], trackingRange[1], t)
	const weight   = lerp(weightRange[0],   weightRange[1],   t)
	const opsz     = lerp(opszRange[0],     opszRange[1],     t)
	const opacity  = lerp(opacityRange[0],  opacityRange[1],  t)

	// Read base FVS from computed style (inherits parent axis values)
	const baseFVS = getComputedStyle(el).fontVariationSettings

	// Apply: weight axis, then opsz axis
	let newFVS = overrideAxis(baseFVS, weightAxis, Math.round(weight))
	newFVS = overrideAxis(newFVS, opszAxis, Math.round(opsz * 10) / 10)

	// Write all style properties
	el.style.fontVariationSettings = newFVS
	el.style.letterSpacing = `${tracking.toFixed(4)}em`
	el.style.opacity = opacity.toFixed(4)
}

/**
 * Start listening to scroll events on the window (or a custom container)
 * and apply scroll-adaptive typography on every animation frame.
 *
 * Tracks scroll position and timestamp to compute velocity in px/frame,
 * normalises by velocityMax, applies EMA via applyScrollType, and decays
 * velocity when the user stops scrolling.
 *
 * Returns a cleanup function that cancels the loop and restores original styles.
 *
 * @param el      - Element to adapt
 * @param options - ScrollTypeOptions (merged with defaults)
 */
/**
 * Start motion-adaptive typography on an element.
 *
 * By default, listens to window scroll events and normalises velocity by
 * `velocityMax` px/frame. When `options.getVelocity` is provided the scroll
 * listener is skipped entirely — the callback is called every animation frame
 * and should return a pre-normalised value in [0, 1].
 *
 * Returns a cleanup function that cancels the loop and restores original styles.
 *
 * @param el      - Element to adapt
 * @param options - ScrollTypeOptions (merged with defaults)
 */
export function startScrollType(el: HTMLElement, options: ScrollTypeOptions = {}): () => void {
	if (typeof window === 'undefined') return () => undefined

	let rafId: number

	if (options.getVelocity) {
		// ── External velocity source (gyroscope, audio, etc.) ──────────────────
		const tick = () => {
			rafId = requestAnimationFrame(tick)
			applyScrollType(el, options.getVelocity!(), options)
		}
		rafId = requestAnimationFrame(tick)
		return () => {
			cancelAnimationFrame(rafId)
			removeScrollType(el)
		}
	}

	// ── Default: scroll event source ───────────────────────────────────────────
	const velocityMax = options.velocityMax ?? DEFAULTS.velocityMax

	let lastScrollY = window.scrollY
	let lastTime = performance.now()
	let currentVelocity = 0

	/** Compute px-per-frame velocity from scroll delta and elapsed time */
	const onScroll = () => {
		const now = performance.now()
		const dt = now - lastTime
		const dy = Math.abs(window.scrollY - lastScrollY)
		// Normalise to px-per-frame assuming 60fps (16.67ms per frame)
		currentVelocity = dt > 0 ? (dy / dt) * 16.67 : 0
		lastScrollY = window.scrollY
		lastTime = now
	}

	/** Per-frame tick: normalise velocity, apply, decay */
	const tick = () => {
		rafId = requestAnimationFrame(tick)
		const normalised = Math.min(currentVelocity / velocityMax, 1)
		applyScrollType(el, normalised, options)
		// Decay when not scrolling so typography settles back to rest
		currentVelocity *= 0.85
	}

	window.addEventListener('scroll', onScroll, { passive: true })
	rafId = requestAnimationFrame(tick)

	// Store rafId so removeScrollType can cancel it
	if (savedState.has(el)) {
		savedState.get(el)!.rafId = rafId
	}

	return () => {
		cancelAnimationFrame(rafId)
		window.removeEventListener('scroll', onScroll)
		removeScrollType(el)
	}
}

/**
 * Remove scrollType styles and restore the element to its original inline styles.
 * Also cancels any active rAF loop started by startScrollType.
 * No-op if applyScrollType was never called on this element.
 *
 * @param el - The element previously adjusted by applyScrollType
 */
export function removeScrollType(el: HTMLElement): void {
	const state = savedState.get(el)
	if (!state) return
	if (state.rafId !== undefined) {
		cancelAnimationFrame(state.rafId)
	}
	el.style.fontVariationSettings = state.fvs
	el.style.letterSpacing = state.letterSpacing
	el.style.opacity = state.opacity
	savedState.delete(el)
}
