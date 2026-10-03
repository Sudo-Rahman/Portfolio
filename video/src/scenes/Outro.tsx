import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, ease } from "../theme";
import { Display, Label, Rise, Tile } from "./parts";
import { mono } from "../fonts";
import type { Scene } from "../reviews/types";

export const Outro: React.FC<{ scene: Extract<Scene, { type: "outro" }>; accent: string }> = ({ scene, accent }) => {
	const frame = useCurrentFrame();
	const p = ease(frame, 0, 40);
	return (
		<AbsoluteFill style={{ background: C.ink, alignItems: "center", justifyContent: "center" }}>
			<AbsoluteFill style={{ background: `radial-gradient(50% 60% at 50% 50%, ${accent}2a, transparent 70%)` }} />
			<div style={{ transform: `scale(${0.6 + p * 0.4})`, opacity: p }}>
				<Tile symbol="Ry" number="00" color={C.desktop} size={200} />
			</div>
			<div style={{ marginTop: 56, textAlign: "center" }}>
				<Rise delay={8}>
					<Display size={92}>{scene.line}</Display>
				</Rise>
				<div style={{ marginTop: 28, fontFamily: mono, fontSize: 28, color: accent, opacity: ease(frame, 22, 20), letterSpacing: "0.04em" }}>
					{scene.url}
				</div>
			</div>
			<Label style={{ position: "absolute", bottom: 70, opacity: ease(frame, 26, 20) }}>Rahman Yilmaz</Label>
		</AbsoluteFill>
	);
};
