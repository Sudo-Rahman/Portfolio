import { AbsoluteFill, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { Caption } from "./parts";
import type { Scene } from "../reviews/types";

export const Clip: React.FC<{ scene: Extract<Scene, { type: "clip" }>; accent: string }> = ({ scene, accent }) => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();
	const zoom = interpolate(frame, [0, durationInFrames], [1.02, 1.09]);
	return (
		<AbsoluteFill style={{ background: C.ink }}>
			<AbsoluteFill style={{ transform: `scale(${zoom})` }}>
				<OffthreadVideo
					src={staticFile(scene.src)}
					trimBefore={Math.round(scene.from * fps)}
					playbackRate={scene.rate}
					muted
					style={{ width: "100%", height: "100%", objectFit: "cover" }}
				/>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					background:
						"linear-gradient(180deg, rgba(9,9,11,0.55) 0%, transparent 22%, transparent 40%, rgba(9,9,11,0.92) 100%)",
				}}
			/>
			{scene.rate !== 1 && (
				<div
					style={{
						position: "absolute",
						right: 96,
						bottom: 124,
						fontFamily: "monospace",
						fontSize: 22,
						color: accent,
						letterSpacing: "0.06em",
					}}
				>
					×{scene.rate}
				</div>
			)}
			<Caption label={scene.label} text={scene.caption} color={accent} />
		</AbsoluteFill>
	);
};
