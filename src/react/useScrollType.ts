// scrollType/src/react/useScrollType.ts — React hook for scrollType
import { useEffect, type RefObject } from 'react'
import { startScrollType, removeScrollType } from '../core/adjust'
import type { ScrollTypeOptions } from '../core/types'

/**
 * React hook that starts a scroll-adaptive typography loop on mount
 * and cleans up on unmount.
 *
 * The loop listens to window scroll events and applies letter-spacing,
 * font-variation-settings (wght + opsz), and opacity adjustments based
 * on scroll velocity.
 *
 * @param ref     - Ref to the target HTMLElement
 * @param options - ScrollTypeOptions
 */
export function useScrollType(ref: RefObject<HTMLElement | null>, options?: ScrollTypeOptions): void {
	useEffect(() => {
		const el = ref.current
		if (!el) return
		const stop = startScrollType(el, options)
		return () => {
			stop()
		}
	// Re-start when options identity changes (shallow — caller should memoize if needed)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			const el = ref.current
			if (el) removeScrollType(el)
		}
	}, [])
}
