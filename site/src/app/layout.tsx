import type { Metadata } from "next"
import "./globals.css"
import { Merriweather } from "next/font/google"

const merriweather = Merriweather({
	weight: ['300', '700'],
	style: ['normal', 'italic'],
	subsets: ["latin"],
	variable: "--font-merriweather",
})

export const metadata: Metadata = {
	title: "scrollType — Typography that adapts to how fast you're reading",
	icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
	description: "scrollType adapts letter-spacing, weight, and optical size in real time based on scroll velocity. Fast scanning needs wider tracking and heavier weight; slow reading needs neither.",
	keywords: ["typography", "variable font", "scroll", "velocity", "reading speed", "scanning", "wght", "opsz", "letter-spacing", "TypeScript", "npm", "react"],
	openGraph: {
		title: "scrollType — Typography that adapts to how fast you're reading",
		description: "Adapts letter-spacing, weight, and optical size in real time based on scroll velocity. A precision typesetting tool for scroll-heavy interfaces.",
		url: "https://scrolltype.com",
		siteName: "scrollType",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "scrollType — Typography that adapts to how fast you're reading",
		description: "Adapts letter-spacing, weight, and optical size in real time based on scroll velocity.",
	},
	metadataBase: new URL("https://scrolltype.com"),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`h-full antialiased ${merriweather.variable}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
