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
	headline: "Développeur Android / Full Stack",
	location: "Chalon-sur-Saône, France",
	email: "contact@rahman.ovh",
	phone: "+33 7 81 38 88 82",
	website: "https://sudo-rahman.fr/",
	github: "https://github.com/Sudo-Rahman",
	linkedin: "https://www.linkedin.com/in/rahman-yilmaz-9236ab270/",
	summary:
		"Développeur Android / Full Stack, Bac+5 en informatique, avec deux ans d'expérience chez Sweepin sur des applications SmartCity et e-santé. Passionné par l'informatique depuis jeune, curieux et autonome, j'aime apprendre vite lorsqu'un projet demande une nouvelle technologie.",
};

export const skills: Skill[] = [
	{
		label: "Android",
		details: "Kotlin, Java, Jetpack Compose, Clean Architecture, Gradle",
	},
	{
		label: "Web & backend",
		details:
			"Node.js, SvelteKit, TypeScript, PHP/Symfony, APIs REST, PostgreSQL, MySQL, Prisma, Redis, Paddle, Stripe, webhooks",
	},
	{
		label: "Tests & livraison",
		details:
			"Tests unitaires, tests d'intégration, CI/CD, GitHub Actions, Docker, debugging, documentation",
	},
	{
		label: "Logiciel & desktop",
		details:
			"Rust, Tauri 2, C++23, Qt 6, FFmpeg, rclone, CMake, Conan",
	},
	{
		label: "Data, IA & automatisation",
		details:
			"Python, Pandas, SQL, OCR, transcription, traduction IA, pipelines LLM, BullMQ",
	},
	{
		label: "Langues",
		details: "Français natif, Turc bilingue, Anglais B2",
	},
];

export const experiences: Experience[] = [
	{
		company: "Solo Agilis Sweepin",
		position: "Développeur Android & Full Stack",
		startDate: "2023-09",
		endDate: "2025-09",
		location: "Dijon, France",
		highlights: [
			"Maintenu la solution Android SmartCity : analyse d'anomalies, corrections, évolutions, création de modules et publication de versions",
			"Intégré Jetpack Compose dans l'écosystème Android de Sweepin pour moderniser des interfaces mobiles et outils internes",
			"Développé des fonctionnalités mobiles et web pour les solutions SmartCity et e-santé dans un contexte multi-clients",
			"Connecté les écrans Android aux APIs REST, back-offices et services PHP/Symfony",
		],
	},
	{
		company: "Steerway",
		position: "Développeur logiciel freelance",
		startDate: "2025-11",
		endDate: "2026-01",
		location: "Remote",
		highlights: [
			"Développé une plateforme SaaS SvelteKit/TypeScript avec authentification, dashboard client, PostgreSQL/Prisma et gestion de licences",
			"Intégré Paddle : abonnements, webhooks, synchronisation d'états, historique de transactions et tokens/licences",
			"Mis en place une architecture événementielle Redis + BullMQ + Resend pour les emails transactionnels et les rappels",
			"Contribué à un pipeline documentaire : scraping multi-sources, normalisation Markdown, recherche hybride et contenus exploitables",
		],
	},
	{
		company: "Indépendant",
		position: "Développeur & éditeur de logiciels",
		startDate: "2025-09",
		endDate: "présent",
		location: "Remote",
		highlights: [
			"Conçu et commercialisé des logiciels destinés aux particuliers : architecture, développement, paiements Stripe (abonnements/achats uniques), tests, packaging et maintenance",
			"Développé des applications desktop, mobile et sites produit avec Tauri/Rust, SvelteKit, SwiftUI ou Kotlin selon le besoin",
			"Mis en place des tests unitaires, tests d'intégration, CI GitHub Actions, documentation et suivi des releases",
			"Piloté l'acquisition produit : SEO technique, pages produit, tracking, Google Ads, Apple Ads et suivi des conversions",
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
