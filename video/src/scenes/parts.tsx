import type { CSSProperties, ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, ease, expoOut } from "../theme";
import { mono, sans } from "../fonts";

export const Label: React.FC<{ children: ReactNode; color?: string; style?: CSSProperties }> = ({
	children,
	color = C.dust,
	style,
}) => (
	<div
		style={{
			fontFamily: mono,
			fontSize: 22,
			letterSpacing: "0.06em",
			textTransform: "uppercase",
			fontStretch: "90%",
			color,
			...style,
		}}
	>
		{children}
	</div>
);

/** A line of text that rises from behind a mask. */
export const Rise: React.FC<{ children: ReactNode; delay?: number; style?: CSSProperties }> = ({
	children,
	delay = 0,
	style,
}) => {
	const frame = useCurrentFrame();
	const p = ease(frame, delay, 36);
	return (
		<div style={{ overflow: "hidden", paddingBlock: "0.12em", marginBlock: "-0.12em", ...style }}>
			<div style={{ transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 2}deg)`, transformOrigin: "left bottom" }}>
				{children}
			</div>
		</div>
	);
};

export const Display: React.FC<{ children: ReactNode; size: number; style?: CSSProperties }> = ({
	children,
	size,
	style,
}) => (
	<div
		style={{
			fontFamily: sans,
			fontWeight: 760,
			fontStretch: "115%",
			fontSize: size,
			letterSpacing: "-0.04em",
			lineHeight: 0.92,
			...style,
		}}
	>
		{children}
	</div>
);

export const Tile: React.FC<{ symbol: string; number: string; color: string; size: number; style?: CSSProperties }> = ({
	symbol,
	number,
	color,
	size,
	style,
}) => (
	<div
		style={{
			position: "relative",
			width: size,
			height: size,
			borderRadius: size * 0.09,
			border: `2px solid ${color}`,
			background: `radial-gradient(110% 90% at 50% 120%, ${color}66, transparent 60%), linear-gradient(160deg, ${color}24, transparent 55%), ${C.graphite}`,
			boxShadow: `0 ${size * 0.12}px ${size * 0.3}px -${size * 0.1}px ${color}aa`,
			...style,
		}}
	>
		<div style={{ position: "absolute", top: size * 0.06, left: size * 0.07, fontFamily: mono, fontSize: size * 0.065, color }}>{number}</div>
		<div
			style={{
				position: "absolute",
				inset: 0,
				display: "grid",
				placeItems: "center",
				fontFamily: sans,
				fontWeight: 850,
				fontStretch: "125%",
				fontSize: size * 0.46,
				letterSpacing: "-0.05em",
				color: C.bone,
			}}
		>
			{symbol}
		</div>
	</div>
);

/** Lower-third caption shared by clip and photo scenes. */
export const Caption: React.FC<{ label: string; text: string; color: string }> = ({ label, text, color }) => {
	const frame = useCurrentFrame();
	return (
		<div style={{ position: "absolute", left: 96, bottom: 110 }}>
			<div style={{ opacity: ease(frame, 4, 20), transform: `translateX(${(1 - ease(frame, 4, 24)) * -24}px)` }}>
				<Label
					color={color}
					style={{ display: "inline-block", padding: "8px 14px", borderRadius: 8, background: "rgba(9,9,11,0.72)", backdropFilter: "blur(6px)" }}
				>
					{label}
				</Label>
			</div>
			<Rise delay={8} style={{ marginTop: 14 }}>
				<div
					style={{
						fontFamily: sans,
						fontWeight: 700,
						fontStretch: "112%",
						fontSize: 64,
						letterSpacing: "-0.03em",
						lineHeight: 1,
						color: C.bone,
						textShadow: "0 4px 40px rgba(0,0,0,0.6)",
					}}
				>
					{text}
				</div>
			</Rise>
		</div>
	);
};

export const countTo = (frame: number, delay: number, to: number, duration = 45) =>
	to * interpolate(frame, [delay, delay + duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: expoOut });
