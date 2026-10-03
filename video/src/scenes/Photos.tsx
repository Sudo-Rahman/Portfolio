import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, ease, quartInOut } from "../theme";
import { Caption } from "./parts";
import { mono } from "../fonts";
import type { Scene } from "../reviews/types";

export const Photos: React.FC<{ scene: Extract<Scene, { type: "photos" }>; accent: string }> = ({ scene, accent }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const n = scene.items.length;
	const gap = 28;
	const area = { x: 96, y: 130, w: 1920 - 192, h: 640 };
	const cardW = (area.w - gap * (n - 1)) / n;
	const browser = scene.frame === "browser";
	return (
		<AbsoluteFill style={{ background: C.ink }}>
			<AbsoluteFill style={{ background: `radial-gradient(70% 60% at 50% 30%, ${accent}1f, transparent 70%)` }} />
			{scene.items.map((item, i) => {
				const p = ease(frame, 4 + i * 8, 34, quartInOut);
				const drift = interpolate(frame, [0, durationInFrames], [1.0, 1.12]);
				return (
					<div
						key={item.src}
						style={{
							position: "absolute",
							left: area.x + i * (cardW + gap),
							top: area.y,
							width: cardW,
							height: area.h,
							borderRadius: 28,
							overflow: "hidden",
							border: `1px solid ${C.line}`,
							background: C.graphite,
							clipPath: `inset(${(1 - p) * 100}% 0 0 0 round 28px)`,
							boxShadow: `0 40px 120px -40px ${accent}88`,
						}}
					>
						{browser && (
							<div style={{ position: "absolute", inset: "0 0 auto 0", height: 46, background: "#1c1c21", display: "flex", alignItems: "center", gap: 10, paddingLeft: 20, zIndex: 2, borderBottom: `1px solid ${C.line}` }}>
								{["#ff5f57", "#febc2e", "#28c840"].map((c) => (
									<span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
								))}
								<span style={{ marginLeft: 18, fontFamily: mono, fontSize: 15, color: C.dust }}>192.168.1.92</span>
							</div>
						)}
						<Img
							src={staticFile(item.src)}
							style={{
								width: "100%",
								height: "100%",
								objectFit: item.fit ?? "cover",
								objectPosition: item.pos ?? "50% 50%",
								marginTop: browser ? 46 : 0,
								transform: `scale(${drift})`,
								transformOrigin: item.pos ?? "50% 50%",
							}}
						/>
					</div>
				);
			})}
			<AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 60%, rgba(9,9,11,0.9) 100%)", pointerEvents: "none" }} />
			<Caption label={scene.label} text={scene.caption} color={accent} />
		</AbsoluteFill>
	);
};
