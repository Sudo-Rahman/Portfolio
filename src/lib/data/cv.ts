export interface Skill {
	label: string;
	details: string;
}

export interface Experience {
	company: string;
	position: string;
	startDate: string;
	endDate: string;
	location: string;
	highlights: string[];
}

export interface Education {
	institution: string;
	area: string;
	degree: string;
	startDate: string;
	endDate: string;
	location: string;
}

export const profile = {
	name: "Rahman YILMAZ",
	headline: "Developpeur Full Stack, Mobile",
	location: "Chalon-sur-Saone, France",
	email: "contact@rahman.ovh",
	phone: "+33 7 81 38 88 82",
	website: "https://sudo-rahman.fr/",
	github: "https://github.com/Sudo-Rahman",
	summary:
		"Developpeur full stack et mobile diplome d'un Master 2 en Bases de Donnees et Intelligence Artificielle. 2 ans d'alternance chez Sweepin puis deux missions freelance pour une startup IA, autour d'un SaaS et de pipelines d'indexation pour LLM. J'aime concevoir des produits de bout en bout, de l'interface a l'infrastructure, avec autonomie et exigence technique.",
};

export const skills: Skill[] = [
	{
		label: "Langages",
		details:
			"Kotlin, Swift, Rust, C/C++ (17/20/23), TypeScript, Python, Java, PHP",
	},
	{
		label: "Web & Frontend",
		details: "SvelteKit, Svelte 5, Tailwind CSS, HTML/CSS",
	},
	{
		label: "Mobile & Apple",
		details:
			"Android (Jetpack Compose, MVVM, SDK), iOS/macOS (SwiftUI), Kotlin Multiplatform",
	},
	{
		label: "Backend & Data",
		details:
			"Symfony, Node.js, Axum, API REST, Prisma, PostgreSQL, MariaDB, MongoDB, Redis, Neo4j",
	},
	{
		label: "Desktop & Systeme",
		details: "Tauri 2, Qt 5/6, Iced, MPI, sockets TCP, rclone",
	},
	{
		label: "Outils IA",
		details: "Opencode, Codex",
	},
	{
		label: "DevOps & Outils",
		details:
			"Docker, GitHub Actions, Git, CMake, Conan 2, Gradle, pnpm, uv",
	},
	{
		label: "Langues",
		details: "Francais (natif), Turc (bilingue), Anglais (intermediaire B1)",
	},
];

export const experiences: Experience[] = [
	{
		company: "Steerway",
		position: "Developpeur Full Stack (Freelance)",
		startDate: "2025-11",
		endDate: "2026-01",
		location: "Remote",
		highlights: [
			"Conception et livraison d'une plateforme SaaS monorepo en SvelteKit 5/TypeScript avec authentification, dashboard client, PostgreSQL/Prisma et logique de licences",
			"Integration du paiement par abonnement, des webhooks et de la synchronisation des etats d'abonnement, avec historique de transactions et gestion de tokens/licences",
			"Mise en place d'une architecture evenementielle Redis + BullMQ + Resend pour les emails transactionnels et l'automatisation des rappels",
			"Contribution a un pipeline RAG/LLM de bout en bout : scraping multi-sources, normalisation en Markdown, indexation hybride FAISS/BM25, embeddings, reranking",
		],
	},
	{
		company: "Solo Agilis Sweepin",
		position:
			"Developpeur Full Stack et mobile (Alternance)",
		startDate: "2023-09",
		endDate: "2025-09",
		location: "Dijon, France",
		highlights: [
			"Developpement d'applications mobiles et web pour les solutions SmartCity et e-sante de Sweepin, dans un contexte multi-clients et multi-produits",
			"Mainteneur principal de la solution Android SmartCity : evolution du socle, correction de bugs, ajout de fonctionnalites, creation de modules et publication des versions",
			"Integration de Jetpack Compose dans l'ecosysteme Android de Sweepin et contribution a la modernisation des interfaces et outils internes",
			"Elargissement progressif vers un role full stack avec contributions Android, frontend web et backend PHP/Symfony sur les applications, APIs et back-offices",
		],
	},
];

export const education: Education[] = [
	{
		institution: "Universite de Bourgogne Europe",
		area: "Informatique - Bases de Donnees et Intelligence Artificielle",
		degree: "Master 2",
		startDate: "2024-09",
		endDate: "2025-09",
		location: "Dijon, France",
	},
	{
		institution: "Universite de Bourgogne",
		area: "Informatique - Bases de Donnees et Intelligence Artificielle",
		degree: "Master 1",
		startDate: "2023-09",
		endDate: "2024-06",
		location: "Dijon, France",
	},
	{
		institution: "Universite de Bourgogne",
		area: "Informatique",
		degree: "Licence 3",
		startDate: "2022-09",
		endDate: "2023-06",
		location: "Dijon, France",
	},
	{
		institution: "Universite de Bourgogne",
		area: "Sciences et techniques",
		degree: "DEUG",
		startDate: "2020-09",
		endDate: "2022-06",
		location: "Dijon, France",
	},
	{
		institution: "Lycee prive catholique",
		area: "Serie S",
		degree: "Baccalaureat",
		startDate: "2018-09",
		endDate: "2020-06",
		location: "Chalon-sur-Saone, France",
	},
];

export function formatDate(date: string): string {
	const [year, month] = date.split("-");
	const months = [
		"Jan", "Fev", "Mar", "Avr", "Mai", "Juin",
		"Juil", "Aout", "Sep", "Oct", "Nov", "Dec",
	];
	return `${months[parseInt(month) - 1]} ${year}`;
}
