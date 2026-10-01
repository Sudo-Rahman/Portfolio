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
	/** Applications and products shipped during this experience. */
	products?: string[];
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
	headline: "Développeur Full Stack / Android",
	location: "Chalon-sur-Saône, France",
	email: "contact@rahman.ovh",
	phone: "+33 7 81 38 88 82",
	website: "https://sudo-rahman.fr/",
	github: "https://github.com/Sudo-Rahman",
	linkedin: "https://www.linkedin.com/in/rahman-yilmaz-9236ab270/",
	summary: [
		"Développeur Full Stack / Android, titulaire d'un Master en informatique. J'ai passé deux ans en alternance chez Sweepin sur des applications SmartCity et e-santé : apps Android, back-offices PHP/Symfony, APIs REST et interfaces SvelteKit. Depuis septembre 2025, je développe et je vends mes propres logiciels.",
		"En dehors du code, je m'occupe aussi du matériel : serveur et NAS à la maison, réseau, domotique. J'aime comprendre comment les choses fonctionnent et les installer moi-même.",
	],
};

export const skills: Skill[] = [
	{
		label: "Android",
		details: "Kotlin, Java, Jetpack Compose, Clean Architecture, Gradle",
	},
	{
		label: "Full Stack web",
		details:
			"PHP, Symfony, Doctrine ORM, APIs REST, MariaDB/MySQL, PostgreSQL, JavaScript/TypeScript, SvelteKit, HTML/CSS, Node.js, Prisma, Redis",
	},
	{
		label: "Tests & livraison",
		details:
			"Tests unitaires et d'intégration, Docker, CI/CD, GitHub Actions, Linux/Unix, debugging, documentation, mise en production",
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
			"Maintenance et évolution des applications Android SmartCity en tant que mainteneur principal : intégration de nouveaux clients, création de modules, correction d'anomalies et publication de versions",
			"Développement et maintenance des back-offices et APIs SmartCity et e-santé avec PHP/Symfony, Doctrine ORM, MariaDB, JavaScript, HTML et CSS",
			"Amélioration et maintenance du viewer e-santé, ainsi que développement d'interfaces web avec JavaScript/TypeScript et SvelteKit",
			"Intervention sur l'ensemble du cycle applicatif : analyse des besoins, chiffrage, développement, tests, recette, documentation et mise en production, en collaboration avec les équipes métier, mobile et backend",
		],
		products: [
			"Vitaboucle",
			"Vercors",
			"Dole",
			"Ampi",
			"Chor",
			"Ma Ville Facile !",
			"Corsaire !",
			"ToolBox v2",
			"Floween",
		],
	},
	{
		company: "Steerway",
		position: "Développeur logiciel freelance",
		startDate: "2025-11",
		endDate: "2026-01",
		location: "Remote",
		highlights: [
			"Développement d'une plateforme SaaS avec SvelteKit/TypeScript, authentification, tableau de bord client, PostgreSQL/Prisma et gestion de licences",
			"Intégration des paiements Paddle et mise en place d'une architecture événementielle avec Redis, BullMQ et Resend",
			"Développement en Python d'un pipeline de collecte et de normalisation de documentations techniques issues de npm/PyPI, de dépôts Git, de README, de sites web et de fichiers llms.txt, avec prise en charge des monorepos",
			"Conception en Python d'un système de benchmark et de traitement par lots : jeux de référence, métriques de validation, parallélisation, délais maximums, reprise sur erreur et optimisation des ressources",
		],
	},
	{
		company: "Indépendant",
		position: "Développeur & éditeur de logiciels",
		startDate: "2025-09",
		endDate: "présent",
		location: "Remote",
		highlights: [
			"Conception, développement et commercialisation de logiciels destinés aux particuliers, de l'architecture à la maintenance",
			"Développement d'applications desktop, mobiles et web avec Tauri/Rust, SvelteKit, SwiftUI et Kotlin selon les besoins",
			"Mise en place des tests, de l'intégration continue, du packaging, de la documentation et du suivi des versions",
			"Gestion de la commercialisation des produits : paiements Stripe, pages produit, SEO technique, campagnes publicitaires et suivi des conversions",
		],
		products: ["Ultra Explorer", "renamer", "Nymbra", "linkKeep", "MediaFlow"],
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
