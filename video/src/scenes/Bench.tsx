import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { C, ease, quartInOut } from "../theme";
import { Caption, countTo, Label } from "./parts";
import { mono, sans } from "../fonts";
import type { Scene } from "../reviews/types";

export const Bench: React.FC<{ scene: Extract<Scene, { type: "bench" }>; accent: string }> = ({ scene, accent }) => {
	const frame = useCurrentFrame();
	const rows = [
		{ label: "Descendant", key: "down" as const, unit: "Mb/s", color: accent },
		{ label: "Ascendant", key: "up" as const, unit: "Mb/s", color: C.data },
		{ label: "Latence", key: "ping" as const, unit: "ms", color: C.web },
	];
	return (
		<AbsoluteFill style={{ background: C.ink }}>
			<AbsoluteFill style={{ background: `radial-gradient(60% 60% at 50% 40%, ${accent}22, transparent 70%)` }} />
			{scene.tools.map((t, i) => {
				const p = ease(frame, 2 + i * 6, 36, quartInOut);
				const left = i === 0;
				return (
					<div
						key={t.name}
						style={{
							position: "absolute",
							top: 70,
							[left ? "left" : "right"]: 120,
							width: 330,
							height: 718,
							borderRadius: 34,
							overflow: "hidden",
							border: `1px solid ${C.line}`,
							boxShadow: `0 40px 120px -40px ${accent}88`,
							clipPath: `inset(${(1 - p) * 100}% 0 0 0 round 34px)`,
						}}
					>
						<Img src={staticFile(t.photo)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%" }} />
					</div>
				);
			})}
			<div style={{ position: "absolute", left: 540, right: 540, top: 90, bottom: 280 }}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginLeft: 0 }}>
					{scene.tools.map((t) => (
						<Label key={t.name} style={{ textAlign: "center", opacity: ease(frame, 14, 20) }}>
							{t.name}
						</Label>
					))}
				</div>
				{rows.map((r, ri) => (
					<div key={r.label} style={{ marginTop: ri === 0 ? 30 : 46, opacity: ease(frame, 12 + ri * 8, 20) }}>
						<Label color={r.color} style={{ textAlign: "center" }}>
							{r.label} · {r.unit}
						</Label>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: 6 }}>
							{scene.tools.map((t) => (
								<div
									key={t.name}
									style={{
										textAlign: "center",
										fontFamily: sans,
										fontWeight: 780,
										fontStretch: "118%",
										fontSize: ri === 0 ? 124 : 96,
										letterSpacing: "-0.045em",
										lineHeight: 1,
										fontVariantNumeric: "tabular-nums",
									}}
								>
									{Math.round(countTo(frame, 14 + ri * 8, t[r.key]))}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
			<div style={{ position: "absolute", right: 96, bottom: 110, fontFamily: mono, fontSize: 18, color: C.dust, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", maxWidth: 520 }}>
				{scene.footnote}
			</div>
			<Caption label={scene.label} text={scene.caption} color={accent} />
		</AbsoluteFill>
	);
};
