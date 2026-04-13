import Demo from "@/components/Demo"
import CopyInstall from "@/components/CopyInstall"
import CodeBlock from "@/components/CodeBlock"
import ToolDirectory from "@/components/ToolDirectory"
import { version } from "../../../package.json"

export default function Home() {
	return (
		<main className="flex flex-col items-center px-6 py-20 gap-24">

			{/* Hero */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<p className="text-xs uppercase tracking-widest opacity-50">scrolltype</p>
					<h1 className="text-4xl lg:text-8xl xl:text-9xl" style={{ fontFamily: "var(--font-merriweather), serif", fontVariationSettings: '"wght" 300', lineHeight: "1.05em" }}>
						Scroll adapts<br />
						<span style={{ opacity: 0.5, fontStyle: "italic" }}>your type.</span>
					</h1>
				</div>
				<div className="flex items-center gap-4">
					<CopyInstall />
					<a href="https://github.com/Liiift-Studio/ScrollType" className="text-sm opacity-50 hover:opacity-100 transition-opacity">GitHub</a>
				</div>
				<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-50 tracking-wide">
					<span>TypeScript</span><span>·</span><span>Zero dependencies</span><span>·</span><span>React + Vanilla JS</span>
				</div>
				<p className="text-base opacity-60 leading-relaxed max-w-lg">
					CSS has no mechanism to adapt typography based on scroll velocity — text designed for reading speed looks wrong when scanning at speed, and vice versa. scrollType bridges that gap, interpolating letter&#8209;spacing, wght, and opsz in real time as scroll velocity changes.
				</p>
			</section>

			{/* Demo */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4">
				<p className="text-xs uppercase tracking-widest opacity-50">Live demo — scroll the container, drag the slider, or use cursor mode</p>
				<div className="rounded-xl -mx-8 px-8 py-8" style={{ background: "rgba(0,0,0,0.25)", overflow: 'hidden' }}>
					<Demo />
				</div>
			</section>

			{/* Explanation */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<p className="text-xs uppercase tracking-widest opacity-50">How it works</p>
				<div className="prose-grid grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm leading-relaxed opacity-70">
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Reading vs scanning are different modes</p>
						<p>At reading speed, typography values economy — tight tracking and moderate weight give clean, low-noise letterforms. At scanning speed, those same choices work against legibility: tight tracking merges glyphs, light weight disappears at speed. CSS cannot distinguish these modes — it has no concept of scroll velocity.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Three axes adapt together</p>
						<p>scrollType interpolates three properties simultaneously: letter&#8209;spacing opens up at speed (wider tracking forces air between characters so each letter can be identified quickly), wght increases (heavier strokes survive perceptual blur), and opsz grows (optical size optimises letterform detail for glyphs you are only half-seeing).</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">EMA smoothing prevents jitter</p>
						<p>Raw scroll velocity signals are noisy. scrollType applies an exponential moving average before mapping velocity to type properties — so typography transitions feel deliberate rather than jittery. Velocity also decays smoothly when scrolling stops, letting the type settle back to its reading state without a sharp snap.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Drop-in for any scroll interface</p>
						<p><code className="text-xs font-mono">startScrollType</code> wires up a scroll listener and <code className="text-xs font-mono">requestAnimationFrame</code> loop automatically. <code className="text-xs font-mono">applyScrollType</code> accepts a pre-normalised velocity and lets you drive it from your own loop — useful when you want to combine scroll with other velocity sources.</p>
					</div>
				</div>
			</section>

			{/* Usage */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex items-baseline gap-4">
					<p className="text-xs uppercase tracking-widest opacity-50">Usage</p>
					<p className="text-xs opacity-50 tracking-wide">TypeScript + React · Vanilla JS</p>
				</div>
				<div className="flex flex-col gap-8 text-sm">
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Drop-in component</p>
						<CodeBlock code={`import { ScrollTypeText } from '@liiift-studio/scrolltype'

<ScrollTypeText as="p">
  Body text here — adapts automatically to scroll velocity.
</ScrollTypeText>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Hook — attach to any element</p>
						<CodeBlock code={`import { useScrollType } from '@liiift-studio/scrolltype'
import { useRef } from 'react'

// Inside a React component:
const ref = useRef(null)
useScrollType(ref, { weightRange: [300, 700] })
return <p ref={ref}>Body text</p>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">rAF loop — vanilla JS</p>
						<CodeBlock code={`import { startScrollType } from '@liiift-studio/scrolltype'

const el = document.querySelector('p')
let stop = startScrollType(el, {
  trackingRange: [0, 0.06],
  weightRange: [300, 600],
  velocityMax: 15,
})

// Later — cancel loop and restore styles:
// stop()`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Options</p>
						<table className="w-full text-xs">
							<thead><tr className="opacity-50 text-left"><th className="pb-2 pr-6 font-normal">Option</th><th className="pb-2 pr-6 font-normal">Default</th><th className="pb-2 font-normal">Description</th></tr></thead>
							<tbody className="opacity-70">
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">trackingRange</td><td className="py-2 pr-6">[0, 0.06]</td><td className="py-2">Letter-spacing range in em: [at rest, at max velocity].</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">weightRange</td><td className="py-2 pr-6">[300, 600]</td><td className="py-2">wght axis range: [at rest, at max velocity].</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">opszRange</td><td className="py-2 pr-6">[12, 24]</td><td className="py-2">opsz axis range: [at rest, at max velocity].</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">opacityRange</td><td className="py-2 pr-6">[1, 0.85]</td><td className="py-2">Opacity range: [at rest, at max velocity].</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">smoothing</td><td className="py-2 pr-6">0.12</td><td className="py-2">EMA smoothing factor 0–1. Higher = more smoothing (slower response).</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">velocityMax</td><td className="py-2 pr-6">15</td><td className="py-2">Scroll speed in px/frame at which max adjustments apply.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">weightAxis</td><td className="py-2 pr-6">&apos;wght&apos;</td><td className="py-2">Variable font weight axis tag.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">opszAxis</td><td className="py-2 pr-6">&apos;opsz&apos;</td><td className="py-2">Variable font optical size axis tag.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">as</td><td className="py-2 pr-6">&apos;p&apos;</td><td className="py-2">HTML element to render. (ScrollTypeText only)</td></tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6 pt-8 border-t border-white/10 text-xs">
				<ToolDirectory current="scrollType" />
				<hr className="border-white/10" />
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 opacity-50">
					<a href="https://liiift.studio" className="hover:opacity-100 transition-opacity">liiift.studio</a>
					<span className="sm:col-start-4">scrollType v{version}</span>
				</div>
			</footer>

		</main>
	)
}
