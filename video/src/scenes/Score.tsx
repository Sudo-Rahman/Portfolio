import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, ease } from "../theme";
import { countTo, Display, Label, Rise } from "./parts";
import { mono, sans } from "../fonts";
import type { Scene } from "../reviews/types";

export const Score: React.FC<{ scene: Extract<Scene, { type: "score" }>; accent: string }> = ({ scene, accent }) => {
	const frame = useCurrentFrame();
	const value = countTo(frame, 8, scene.score, 60);
	const col = (items: string[], color: string, sign: string, delay: number) =>
		items.map((t, i) => (
			<div
				key={t}
				style={{
					display: "flex",
					gap: 20,
					alignItems: "baseline",
					fontSize: 34,
					fontWeight: 560,
					lineHeight: 1.25,
					marginBottom: 20,
					opacity: ease(frame, delay + i * 7, 22),
					transform: `translateX(${(1 - ease(frame, delay + i * 7, 30)) * 40}px)`,
				}}
			>
				<span style={{ fontFamily: mono, color, fontSize: 30 }}>{sign}</span>
				<span>{t}</span>
			</div>
		));
	return (
		<AbsoluteFill style={{ background: C.ink, padding: 96 }}>
			<AbsoluteFill style={{ background: `radial-gradient(55% 70% at 25% 55%, ${accent}33, transparent 70%)` }} />
			<Label style={{ opacity: ease(frame, 0, 20) }}>08 — Verdict</Label>
			<div style={{ position: "absolute", left: 96, top: 190, display: "flex", alignItems: "baseline", gap: 24 }}>
				<Display size={560} style={{ color: C.bone }}>
					{value.toFixed(1).replace(".", ",")}
				</Display>
				<div style={{ fontFamily: mono, fontSize: 56, color: accent }}>/{scene.max}</div>
			</div>
			<div style={{ position: "absolute", left: 96, bottom: 120 }}>
				<Rise delay={30}>
					<div style={{ fontFamily: sans, fontWeight: 700, fontStretch: "112%", fontSize: 64, letterSpacing: "-0.03em" }}>{scene.verdict}</div>
				</Rise>
			</div>
			<div style={{ position: "absolute", right: 96, top: 210, width: 780 }}>
				<Label color={C.web} style={{ marginBottom: 22 }}>Points forts</Label>
				{col(scene.pros, C.web, "+", 22)}
				<Label color={C.mobile} style={{ margin: "54px 0 22px" }}>Point faible</Label>
				{col(scene.cons, C.mobile, "−", 52)}
			</div>
		</AbsoluteFill>
	);
};
