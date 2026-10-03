import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, ease } from "../theme";
import { Display, Rise, Tile } from "./parts";
import { mono } from "../fonts";
import type { Scene } from "../reviews/types";

export const Title: React.FC<{ scene: Extract<Scene, { type: "title" }>; accent: string }> = ({ scene, accent }) => {
	const frame = useCurrentFrame();
	const tile = ease(frame, 0, 40);
	return (
		<AbsoluteFill style={{ background: C.ink, padding: 96 }}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(60% 70% at 78% 45%, ${accent}38, transparent 70%)`,
				}}
			/>
			<div style={{ position: "absolute", right: 150, top: 230, transform: `scale(${0.4 + tile * 0.6}) rotate(${(1 - tile) * -24}deg)`, opacity: tile }}>
				<Tile symbol={scene.symbol} number={scene.number} color={accent} size={560} />
			</div>
			<div style={{ position: "absolute", left: 96, bottom: 150, width: 1100 }}>
				<Rise delay={6}>
					<Display size={170}>Zyxel</Display>
				</Rise>
				<Rise delay={12}>
					<Display size={170} style={{ color: accent }}>
						NWA50BE
					</Display>
				</Rise>
				<Rise delay={24} style={{ marginTop: 36 }}>
					<div style={{ fontSize: 42, color: C.dust, fontWeight: 500 }}>{scene.subtitle}</div>
				</Rise>
				<div style={{ display: "flex", gap: 14, marginTop: 40 }}>
					{scene.tags.map((t, i) => (
						<div
							key={t}
							style={{
								fontFamily: mono,
								fontSize: 20,
								textTransform: "uppercase",
								letterSpacing: "0.06em",
								padding: "12px 20px",
								border: `1px solid ${C.line}`,
								borderRadius: 999,
								color: C.bone,
								opacity: ease(frame, 36 + i * 5, 20),
								transform: `translateY(${(1 - ease(frame, 36 + i * 5, 26)) * 20}px)`,
							}}
						>
							{t}
						</div>
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};
