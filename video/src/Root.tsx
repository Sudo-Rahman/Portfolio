import { Composition, type CalculateMetadataFunction } from "remotion";
import { Review, totalFrames } from "./Review";
import { zyxelNwa50be } from "./reviews/zyxel-nwa50be";
import type { ReviewConfig } from "./reviews/types";
import { FPS } from "./theme";

type Props = { review: ReviewConfig };

const calculateMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
	durationInFrames: totalFrames(props.review),
});

// One composition per review: add a config in src/reviews/ and register it here.
export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="zyxel-nwa50be"
			component={Review}
			durationInFrames={FPS}
			fps={FPS}
			width={1920}
			height={1080}
			defaultProps={{ review: zyxelNwa50be }}
			calculateMetadata={calculateMetadata}
		/>
	</>
);
