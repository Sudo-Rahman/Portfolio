import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { C, ease, FPS, quartInOut, sec } from "./theme";
import { Fonts, mono } from "./fonts";
import { Label, Tile } from "./scenes/parts";
import { Title } from "./scenes/Title";
import { Clip } from "./scenes/Clip";
import { Photos } from "./scenes/Photos";
import { Bench } from "./scenes/Bench";
import { Score } from "./scenes/Score";
import { Outro } from "./scenes/Outro";
import type { ReviewConfig, Scene } from "./reviews/types";

export const sceneFrames = (s: Scene) =>
	s.type === "clip" ? Math.round(((s.to - s.from) / s.rate) * FPS) : sec(s.seconds);

export const totalFrames = (review: ReviewConfig) => review.scenes.reduce((n, s) => n + sceneFrames(s), 0);

const WIPE = 9;

/** Slab that sweeps over the cut between two scenes. */
const Wipe: React.FC<{ color: string; symbol: string }> = ({ color, symbol }) => {
	const frame = useCurrentFrame();
	const inP = ease(frame, 0, WIPE, quartInOut);
	const outP = ease(frame, WIPE, WIPE + 7, quartInOut);
	return (
		<AbsoluteFill
			style={{
				background: color,
				clipPath: `inset(${outP * 100}% 0 ${(1 - inP) * 100}% 0)`,
				display: "grid",
				placeItems: "center",
				fontFamily: '"Mona", sans-serif',
				fontWeight: 850,
				fontStretch: "125%",
				fontSize: 420,
				letterSpacing: "-0.05em",
				color: C.ink,
			}}
		>
			<span style={{ opacity: 0.18 }}>{symbol}</span>
		</AbsoluteFill>
	);
};

const Hud: React.FC<{ review: ReviewConfig; total: number }> = ({ review, total }) => {
	const frame = useCurrentFrame();
	const t = Math.floor(frame / FPS);
	return (
		<AbsoluteFill style={{ pointerEvents: "none" }}>
			<div style={{ position: "absolute", top: 40, left: 96, display: "flex", alignItems: "center", gap: 16 }}>
				<Tile symbol={review.symbol} number="" color={review.accent} size={52} />
				<Label color={C.bone}>Labo · {review.tag}</Label>
			</div>
			<Label style={{ position: "absolute", top: 52, right: 96 }}>
				00:{String(t).padStart(2, "0")} / 00:{String(Math.round(total / FPS)).padStart(2, "0")}
			</Label>
			<div style={{ position: "absolute", left: 0, bottom: 0, height: 5, width: `${(frame / total) * 100}%`, background: review.accent }} />
		</AbsoluteFill>
	);
};

export const Review: React.FC<{ review: ReviewConfig }> = ({ review }) => {
	const { durationInFrames } = useVideoConfig();
	let at = 0;
	const placed = review.scenes.map((scene) => {
		const from = at;
		const duration = sceneFrames(scene);
		at += duration;
		return { scene, from, duration };
	});
	const accent = review.accent;
	return (
		<AbsoluteFill style={{ background: C.ink, color: C.bone, fontFamily: '"Mona", system-ui, sans-serif' }}>
			<Fonts />
			{placed.map(({ scene, from, duration }, i) => (
				<Sequence key={i} from={from} durationInFrames={duration} premountFor={30}>
					{scene.type === "title" && <Title scene={scene} accent={accent} />}
					{scene.type === "clip" && <Clip scene={scene} accent={accent} />}
					{scene.type === "photos" && <Photos scene={scene} accent={accent} />}
					{scene.type === "bench" && <Bench scene={scene} accent={accent} />}
					{scene.type === "score" && <Score scene={scene} accent={accent} />}
					{scene.type === "outro" && <Outro scene={scene} accent={accent} />}
				</Sequence>
			))}
			<Hud review={review} total={durationInFrames} />
			{placed.slice(1).map(({ from }, i) => (
				<Sequence key={`w${i}`} from={from - WIPE} durationInFrames={WIPE * 2 + 7}>
					<Wipe color={accent} symbol={review.symbol} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};

export { mono };
