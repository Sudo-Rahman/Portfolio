import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const faces = [
	{ family: "Mona", file: "fonts/mona.woff2", stretch: "75% 125%", weight: "200 900" },
	{ family: "Martian", file: "fonts/martian.woff2", stretch: "75% 112.5%", weight: "100 800" },
];

export const Fonts: React.FC = () => {
	const [handle] = useState(() => delayRender("fonts"));
	useEffect(() => {
		Promise.all(
			faces.map(async (f) => {
				const face = new FontFace(f.family, `url(${staticFile(f.file)})`, {
					weight: f.weight,
					stretch: f.stretch,
				});
				document.fonts.add(await face.load());
			}),
		).finally(() => continueRender(handle));
	}, [handle]);
	return null;
};

export const sans = '"Mona", system-ui, sans-serif';
export const mono = '"Martian", ui-monospace, monospace';
