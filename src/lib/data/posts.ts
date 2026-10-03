export type PostCategory = "test" | "presentation";

export const categories: Record<PostCategory, { label: string; plural: string }> = {
	test: { label: "Test", plural: "Tests" },
	presentation: { label: "Présentation", plural: "Présentations" },
};

export interface Post {
	slug: string;
	/** Experiment number: chronological order of the lab notebook. */
	number: number;
	symbol: string;
	category: PostCategory;
	color: string;
	/** ISO date. */
	date: string;
	title: string;
	/** <title> and feed title: the product name as people search for it. */
	seoTitle: string;
	/** Meta description, ~150 characters. */
	description: string;
	/** ISO date of the last substantial edit. */
	updated?: string;
	subtitle: string;
	excerpt: string;
	cover: string;
	video?: { src: string; poster: string };
	rating?: { value: number; max: number };
	price?: string;
	facts: { label: string; value: string }[];
	pros: string[];
	cons: string[];
	specs: { group: string; rows: { label: string; value: string }[] }[];
	sources: { label: string; href: string }[];
}

export const posts: Post[] = [
	{
		slug: "zyxel-nwa50be",
		number: 1,
		symbol: "Nw",
		category: "test",
		color: "#4d8dff",
		date: "2026-10-03",
		title: "Zyxel NWA50BE",
		seoTitle: "Test Zyxel NWA50BE : avis, débits et prix (Wi-Fi 7)",
		description:
			"Test de la borne Wi-Fi 7 Zyxel NWA50BE : déballage, installation en PoE, débits mesurés, interface et verdict. Note 8,5/10 pour 77 €.",
		subtitle: "Une borne Wi-Fi 7 à 77 €, déballée, posée et mesurée.",
		excerpt:
			"Pour couvrir mon garage, j'ai installé la borne Wi-Fi 7 Zyxel NWA50BE (2,5 GbE, PoE+) : déballage, pose et mesures. Elle est imbattable à ce prix, seule son interface web d'un autre âge fait baisser la note.",
		cover: "/blog/zyxel-nwa50be/cover.jpg",
		video: { src: "/blog/zyxel-nwa50be/test.mp4", poster: "/blog/zyxel-nwa50be/poster.jpg" },
		rating: { value: 8.5, max: 10 },
		price: "77 €",
		facts: [
			{ label: "Prix payé", value: "77 € sur Amazon" },
			{ label: "Norme", value: "Wi-Fi 7 · BE5100" },
			{ label: "Port", value: "1 × 2,5 GbE PoE+" },
			{ label: "Installation", value: "Plafond ou mur" },
		],
		pros: [
			"77 € : 20 à 30 € de moins que les alternatives Wi-Fi 7",
			"Wi-Fi 7 double bande et port 2,5 GbE",
			"Alimentation PoE+, un seul câble à tirer",
			"Support mural propre, installation simple",
		],
		cons: ["Interface web standalone digne de Windows 2000"],
		specs: [
			{
				group: "Sans-fil",
				rows: [
					{ label: "Norme", value: "Wi-Fi 7 (802.11be), BE5100" },
					{ label: "Bandes", value: "2,4 GHz et 5 GHz, deux radios" },
					{ label: "Débit théorique", value: "688 Mb/s (2,4 GHz) + 4 324 Mb/s (5 GHz)" },
					{ label: "Antennes", value: "4 flux, 2×2 MU-MIMO par radio" },
					{ label: "Réseau maillé", value: "Smart Mesh, MLO" },
					{ label: "Sécurité", value: "WPA, WPA2, WPA3, VLAN" },
				],
			},
			{
				group: "Connectique",
				rows: [
					{ label: "Réseau", value: "1 × RJ-45 « UPLINK » 1 / 2,5 Gb/s" },
					{ label: "Alimentation", value: "PoE+ (802.3at) ou adaptateur 12 V" },
					{ label: "Consommation", value: "16 W en usage typique" },
					{ label: "Console", value: "Port console sur le dessous" },
				],
			},
			{
				group: "Boîtier et gestion",
				rows: [
					{ label: "Dimensions", value: "150 × 150 × 35 mm" },
					{ label: "Poids", value: "412 g" },
					{ label: "Température", value: "0 à 50 °C" },
					{ label: "Fixation", value: "Support mural ou plafond fourni" },
					{ label: "Gestion", value: "Interface standalone ou cloud Nebula" },
				],
			},
		],
		sources: [
			{ label: "LDLC — fiche NWA50BE", href: "https://www.ldlc.com/en/product/PB00744199.html" },
			{ label: "100mega — Zyxel NWA50BE", href: "https://b2b.100mega.com/en/328033-zyxel-nwa50be" },
			{ label: "Komputronik — Zyxel NWA50BE", href: "https://www.komputronik.pl/product/993355/punkt-dostepu-zyxel-nwa50be.html" },
			{ label: "Zyxel — gamme Wireless", href: "https://www.zyxel.com/global/en/products/wireless" },
		],
	},
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export function neighbours(post: Post): { prev?: Post; next?: Post } {
	const i = posts.indexOf(post);
	return { prev: posts[i - 1], next: posts[i + 1] };
}

export const pad = (n: number) => String(n).padStart(2, "0");

export const formatDate = (iso: string) =>
	new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
