// scrollType/src/react/ScrollTypeText.tsx — React component wrapper for scrollType
"use client"
import { useRef, type ElementType } from 'react'
import { useScrollType } from './useScrollType'
import type { ScrollTypeOptions } from '../core/types'

/** Props for the ScrollTypeText component */
interface ScrollTypeTextProps extends ScrollTypeOptions {
	/** HTML element to render. Default: 'p' */
	as?: ElementType
	/** Text content */
	children: React.ReactNode
	/** Inline styles passed through to the element */
	style?: React.CSSProperties
	/** Class name passed through to the element */
	className?: string
}

/**
 * Drop-in React component that adapts its typography in real time
 * based on window scroll velocity. Wider tracking, heavier weight,
 * and larger optical size as scroll speed increases.
 */
export function ScrollTypeText({ as: Tag = 'p', children, style, className, ...options }: ScrollTypeTextProps) {
	const ref = useRef<HTMLElement>(null)
	useScrollType(ref as React.RefObject<HTMLElement | null>, options)
	return <Tag ref={ref} style={style} className={className}>{children}</Tag>
}
