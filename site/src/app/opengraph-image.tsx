import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'scrollType — Typography that adapts to how fast you\'re reading'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
	const merriweatherLight = await readFile(join(process.cwd(), 'public/fonts/merriweather-300.woff'))
	return new ImageResponse(
		(
			<div style={{ background: '#0e0c12', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', fontFamily: 'Merriweather, serif' }}>
				<span style={{ fontSize: 13, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>scrolltype</span>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
					<div style={{ display: 'flex', flexDirection: 'row', gap: 6, marginBottom: 48, alignItems: 'center' }}>
						{[0.25, 0.5, 0.75, 1.0].map((v, i) => (
							<div key={i} style={{ width: `${v * 100 + 40}px`, height: 3, background: `rgba(212,184,240,${v * 0.5})`, borderRadius: 2 }} />
						))}
					</div>
					<div style={{ fontSize: 76, color: '#ffffff', lineHeight: 1.06, fontWeight: 300 }}>Scroll adapts</div>
					<div style={{ fontSize: 76, color: 'rgba(255,255,255,0.4)', lineHeight: 1.06, fontWeight: 300, fontStyle: 'italic' }}>your type.</div>
				</div>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
					<div style={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em', display: 'flex', gap: 20 }}>
						<span>TypeScript</span><span style={{ opacity: 0.4 }}>·</span>
						<span>Zero dependencies</span><span style={{ opacity: 0.4 }}>·</span>
						<span>React + Vanilla JS</span>
					</div>
					<div style={{ fontSize: 13, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>scrolltype.com</div>
				</div>
			</div>
		),
		{ ...size, fonts: [{ name: 'Merriweather', data: merriweatherLight, style: 'normal', weight: 300 }] },
	)
}
