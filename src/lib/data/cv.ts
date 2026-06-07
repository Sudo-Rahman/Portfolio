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
	startDate?: string;
	endDate?: string;
	date?: string;
	location: string;
	highlights?: string[];
}

export const profile = {
	name: "Rahman YILMAZ",
	headline: "Ingénieur logiciel full stack - Data & IA",
	location: "Chalon-sur-Saône, France",
	email: "contact@rahman.ovh",
	phone: "+33 7 81 38 88 82",
	website: "https://sudo-rahman.fr/",
	github: "https://github.com/Sudo-Rahman",
	linkedin: "https://www.linkedin.com/in/rahman-yilmaz-9236ab270/",
	summary:
		"Ingénieur logiciel Bac+5 en Bases de Données et Intelligence Artificielle. Deux ans d'alternance chez Sweepin sur des applications mobiles et web multi-clients, avec maintenance corrective/évolutive, analyse d'anomalies, publication de versions, APIs, back-offices et bases de données. Missions freelance autour d'un SaaS et de pipelines IA. J'intègre Codex App dans un workflow de développement agentique pour accélérer l'implémentation, itérer sur l'architecture et maintenir une forte productivité.",
};

export const skills: Skill[] = [
	{
		label: "Applications métier",
		details:
			"Mobile/web, APIs, back-offices, dashboards, maintenance applicative, publication de versions",
	},
	{
		label: "Backend & Data",
		details:
			"Symfony, Node.js, Axum, API REST, Prisma, PostgreSQL, MariaDB, MongoDB, Redis, Neo4j",
	},
	{
		label: "Data & BI",
		details:
			"SQL, PostgreSQL, ETL Python/Pandas, data warehouse, Metabase, nettoyage de métadonnées",
	},
	{
		label: "IA appliquée",
		details:
			"Pipelines LLM, transcription/traduction IA, analyse de texte, analyse de sentiment, préparation de datasets",
	},
	{
		label: "Langages & outils",
		details:
			"TypeScript, Kotlin, Python, PHP, Java, Rust, C/C++, Git, Docker, GitHub Actions",
	},
	{
		label: "Frontend & Mobile",
		details:
			"SvelteKit, Svelte 5, Tailwind CSS, Android, Jetpack Compose, SwiftUI",
	},
	{
		label: "Desktop & Système",
		details: "Tauri 2, Qt 5/6, Iced, MPI, sockets TCP, rclone, CMake, Conan 2",
	},
	{
		label: "Langues",
		details: "Français natif, Turc bilingue, Anglais B2",
	},
];

export const experiences: Experience[] = [
	{
		company: "MediaFlow",
		position: "Développeur produit full stack desktop (Projet indépendant)",
		startDate: "2026-01",
		endDate: "présent",
		location: "Remote",
		highlights: [
			"Développement d'une application desktop locale en Tauri 2, Rust et Svelte 5 pour automatiser des traitements multimédias : extraction de pistes, fusion, transcription, OCR, traduction de sous-titres, mediainfo et renommage en masse",
			"Conception d'un backend Rust orchestrant des traitements longs via FFmpeg/FFprobe, avec gestion de files d'attente, progression temps réel, validation des chemins et annulation des tâches",
			"Intégration progressive de fonctionnalités IA : transcription audio, traduction multi-fournisseurs, préparation de sous-titres et réutilisation de segments traduits",
			"Mise en place d'une base produit robuste : état persistant, logs, gestion des erreurs, interface Svelte 5, packaging desktop et CI GitHub Actions pour macOS/Linux/Windows",
		],
	},
	{
		company: "Steerway",
		position: "Développeur Full Stack (Freelance)",
		startDate: "2025-11",
		endDate: "2026-01",
		location: "Remote",
		highlights: [
			"Conception et livraison d'une plateforme SaaS monorepo en SvelteKit 5/TypeScript avec authentification, dashboard client, PostgreSQL/Prisma et logique de licences",
			"Intégration du paiement par abonnement, des webhooks et de la synchronisation des états d'abonnement, avec historique de transactions et gestion de tokens/licences",
			"Mise en place d'une architecture événementielle Redis + BullMQ + Resend pour les emails transactionnels et l'automatisation des rappels",
			"Contribution à un pipeline LLM de bout en bout : scraping multi-sources, normalisation en Markdown, préparation de textes et de datasets d'évaluation",
		],
	},
	{
		company: "Solo Agilis Sweepin",
		position: "Développeur Full Stack et mobile (Alternance)",
		startDate: "2023-09",
		endDate: "2025-09",
		location: "Dijon, France",
		highlights: [
			"Développement d'applications métier mobiles et web pour les solutions SmartCity et e-santé de Sweepin, dans un contexte multi-clients et multi-produits",
			"Mainteneur principal de la solution Android SmartCity : analyse d'anomalies, maintenance corrective/évolutive, ajout de fonctionnalités, création de modules et publication de versions",
			"Intégration de Jetpack Compose dans l'écosystème Android de Sweepin et contribution à la modernisation des interfaces et outils internes",
			"Élargissement progressif vers un rôle full stack avec contributions Android, frontend web et backend PHP/Symfony sur les applications, APIs, back-offices et besoins produit",
		],
	},
];

export const education: Education[] = [
	{
		institution: "Université de Bourgogne / Université de Bourgogne Europe",
		area: "Informatique - Bases de Données et Intelligence Artificielle",
		degree: "Master",
		startDate: "2023-09",
		endDate: "2025-09",
		location: "Dijon, France",
		highlights: [
			"Parcours orienté bases de données, intelligence artificielle, systèmes d'information et exploitation de données",
		],
	},
	{
		institution: "Université de Bourgogne",
		area: "Informatique",
		degree: "Licence",
		date: "2023",
		location: "Dijon, France",
	},
	{
		institution: "Lycée privé catholique",
		area: "Série scientifique",
		degree: "Baccalauréat",
		date: "2020",
		location: "Chalon-sur-Saône, France",
	},
];

export function formatDate(date: string): string {
	if (!date.includes("-")) return date;

	const [year, month] = date.split("-");
	const months = [
		"Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
		"Juil", "Août", "Sep", "Oct", "Nov", "Déc",
	];
	return `${months[parseInt(month) - 1]} ${year}`;
}

export function formatDateRange(entry: {
	startDate?: string;
	endDate?: string;
	date?: string;
}): string {
	if (entry.date) return formatDate(entry.date);
	if (entry.startDate && entry.endDate) {
		return `${formatDate(entry.startDate)} – ${formatDate(entry.endDate)}`;
	}
	return "";
}
