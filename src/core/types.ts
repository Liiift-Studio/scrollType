// scrollType/src/core/types.ts — options interface for the scrollType tool

/** Options controlling how typography adapts to motion velocity */
export interface ScrollTypeOptions {
	/** Letter-spacing range in em: [at rest, at max velocity]. Default: [0, 0.06] */
	trackingRange?: [number, number]
	/** wght axis range: [at rest, at max velocity]. Default: [300, 600] */
	weightRange?: [number, number]
	/** opsz axis range: [at rest, at max velocity]. Default: [12, 24] */
	opszRange?: [number, number]
	/** Opacity range: [at rest, at max velocity]. Default: [1, 0.85] */
	opacityRange?: [number, number]
	/** EMA smoothing factor 0–1. Higher = more smoothing (slower response). Default: 0.12 */
	smoothing?: number
	/** Scroll speed in px/frame at which max adjustments apply. Default: 15 */
	velocityMax?: number
	/** Variable font weight axis tag. Default: 'wght' */
	weightAxis?: string
	/** Variable font optical size axis tag. Default: 'opsz' */
	opszAxis?: string
	/**
	 * Custom velocity provider called on every animation frame.
	 * Should return a normalised value in [0, 1] where 0 = at rest, 1 = maximum.
	 *
	 * When provided, scroll events are not listened to — the caller is responsible
	 * for all velocity computation (gyroscope, accelerometer, audio level, etc.).
	 * Supersedes `velocityMax` since normalisation is the caller's concern.
	 *
	 * @example
	 * // Gyroscope-driven
	 * startScrollType(el, {
	 *   getVelocity: () => Math.min(rotationRate / MAX_RATE, 1),
	 * })
	 */
	getVelocity?: () => number
}
