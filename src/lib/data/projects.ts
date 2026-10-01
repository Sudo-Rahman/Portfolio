import type { Family, ProjectState } from "./elements.ts";

export interface Project {
	slug: string;
	/** Atomic number: chronological order of the project. */
	number: number;
	symbol: string;
	family: Family;
	year: number;
	state: ProjectState;
	title: string;
	summary: string;
	technologies: string[];
	url?: string;
	websiteUrl?: string;
	appStoreUrl?: string;
	featured: boolean;
	detailsAvailable?: boolean;
}

export const projects: Project[] = [
	{
		slug: "UltraExplorer",
		number: 22,
		symbol: "Ue",
		family: "desktop",
		year: 2026,
		state: "product",
		title: "Ultra Explorer",
		summary:
			"Gestionnaire de fichiers multi-cloud commercialisé : client graphique rclone avec cœur Rust partagé entre une application desktop Tauri 2 et un serveur Axum auto-hébergeable via Docker, interface SvelteKit, explorateur double panneau, file de transferts durable, synchronisations planifiées et licences Pro via Stripe.",
		technologies: ["Rust", "Tauri 2", "SvelteKit", "Axum", "rclone", "SQLite", "Docker", "Stripe"],
		websiteUrl: "https://ultra-explorer.app/",
		featured: true,
	},
	{
		slug: "KARA",
		number: 21,
		symbol: "Ka",
		family: "mobile",
		year: 2026,
		state: "product",
		title: "KARA",
		summary:
			"Application iPhone d'inventaire de métaux précieux (lingots, pièces, bijoux) : valeur estimée au cours du marché, suivi dans le temps, simulation de vente, pièces jointes, rapports PDF et widgets. SwiftUI/SwiftData avec iCloud, API SvelteKit sécurisée par App Attest, sans compte utilisateur.",
		technologies: ["Swift", "SwiftUI", "SwiftData", "CloudKit", "WidgetKit", "SvelteKit", "Redis"],
		url: "https://github.com/Sudo-Rahman/KARA",
		websiteUrl: "https://kara.sudo-rahman.fr/",
		appStoreUrl: "https://apps.apple.com/app/id6795243977",
		featured: true,
	},
	{
		slug: "MediaFlow",
		number: 18,
		symbol: "Mf",
		family: "desktop",
		year: 2025,
		state: "product",
		title: "MediaFlow",
		summary:
			"Application desktop de traitement vidéo et audio basée sur FFmpeg : extraction et muxage de pistes, transcodage, sous-titres générés depuis la parole, OCR des sous-titres incrustés, traduction et renommage par lots. Rust/Tauri 2 et Svelte 5, distribuée sur le Microsoft Store et en téléchargement direct.",
		technologies: ["Rust", "Tauri 2", "Svelte 5", "FFmpeg", "GitHub Actions"],
		url: "https://github.com/Sudo-Rahman/MediaFlow",
		websiteUrl: "https://mediaflowtools.com/",
		featured: true,
	},
	{
		slug: "Projet-DAW",
		number: 6,
		symbol: "Np",
		family: "web",
		year: 2023,
		state: "academic",
		title: "Neptune",
		summary:
			"Plateforme d'apprentissage en ligne : architecture PHP MVC, interface JavaScript et base PostgreSQL réunissant gestion des utilisateurs, cours, évaluations par QCM, forum communautaire et administration.",
		technologies: ["PHP", "PostgreSQL", "JavaScript", "Docker"],
		url: "https://github.com/Sudo-Rahman/Projet-DAW",
		featured: false,
	},
	{
		slug: "Iridium",
		number: 5,
		symbol: "Ir",
		family: "desktop",
		year: 2023,
		state: "open-source",
		title: "Iridium",
		summary:
			"Gestionnaire desktop multi-cloud : client C++23/Qt 6 pilotant rclone pour explorer, rechercher et synchroniser des stockages distants, avec transferts asynchrones, progression en temps réel, packaging multiplateforme et releases GitHub.",
		technologies: ["C++23", "Qt 6", "rclone", "CMake", "Conan"],
		url: "https://github.com/Sudo-Rahman/Iridium",
		featured: true,
	},
	{
		slug: "Nymbra",
		number: 20,
		symbol: "Ny",
		family: "mobile",
		year: 2026,
		state: "product",
		title: "Nymbra",
		summary:
			"Application iPhone publiée sur l'App Store : coffre-fort chiffré pour documents, photos, vidéos, scans, archives et audio, avec Face ID, verrouillage automatique, recherche et synchronisation iCloud optionnelle.",
		technologies: ["iOS", "iCloud", "Face ID", "App Store", "Closed source"],
		websiteUrl: "https://nymbra.sudo-rahman.fr/",
		appStoreUrl: "https://apps.apple.com/us/app/nymbra/id6783014745",
		featured: false,
	},
	{
		slug: "linkKeep",
		number: 19,
		symbol: "Lk",
		family: "mobile",
		year: 2026,
		state: "product",
		title: "linkKeep",
		summary:
			"Application Apple native iOS/iPadOS/macOS : SwiftUI, Core Data/CloudKit, synchronisation iCloud, architecture Domain/Data/Services, tests unitaires Swift et site multilingue SvelteKit.",
		technologies: ["Swift", "SwiftUI", "Core Data", "CloudKit", "Swift Testing"],
		websiteUrl: "https://linkkeep.sudo-rahman.fr/",
		appStoreUrl: "https://apps.apple.com/app/id6760005462",
		featured: false,
	},
	{
		slug: "kotlin-meteo",
		number: 7,
		symbol: "Km",
		family: "mobile",
		year: 2023,
		state: "open-source",
		title: "Kotlin Météo",
		summary:
			"Application Android native de prévisions météo en Kotlin : Open-Meteo, Geoapify, géolocalisation GPS, recherche de ville, prévisions 24 h/10 jours et persistance locale.",
		technologies: ["Kotlin", "Java", "Android", "Gradle"],
		url: "https://github.com/Sudo-Rahman/kotlin-meteo",
		featured: false,
	},
	{
		slug: "Before-After-Image",
		number: 8,
		symbol: "Ba",
		family: "mobile",
		year: 2023,
		state: "open-source",
		title: "Before-After-Image",
		summary:
			"Bibliothèque Android Jetpack Compose : composant before/after réutilisable, API simple, personnalisation du composant, démonstration et publication Gradle.",
		technologies: ["Kotlin", "Jetpack Compose", "Android", "Gradle"],
		url: "https://github.com/Sudo-Rahman/Before-After-Image",
		featured: false,
	},
	{
		slug: "Argon",
		number: 17,
		symbol: "Ar",
		family: "data",
		year: 2025,
		state: "academic",
		title: "Argon",
		summary:
			"Projet décisionnel autour du dataset Yelp : data warehouse Kimball, ETL Python/Pandas, chargement PostgreSQL, nettoyage de métadonnées, analyse de sentiment sur les avis et tableaux de bord Metabase.",
		technologies: ["Python", "Pandas", "PostgreSQL", "Metabase", "Transformers"],
		url: "https://github.com/Sudo-Rahman/Argon",
		featured: false,
	},
	{
		slug: "Fractalium",
		number: 9,
		symbol: "Fr",
		family: "desktop",
		year: 2023,
		state: "academic",
		title: "Fractalium",
		summary:
			"Application C++/Qt de calcul distribué de fractales via MPI : zoom interactif, précision 100 décimales, snapshots de session et exécution sur cluster.",
		technologies: ["C++", "Qt", "MPI", "CMake"],
		url: "https://github.com/Sudo-Rahman/Fractalium",
		featured: false,
	},
	{
		slug: "Lichess-Data",
		number: 2,
		symbol: "Li",
		family: "system",
		year: 2022,
		state: "academic",
		title: "Lichess-Data",
		summary:
			"Serveur Java multi-clients : indexe et interroge des PGN Lichess de plus de 100 Go, avec recherche, statistiques et PageRank.",
		technologies: ["Java", "Sockets", "Concurrency"],
		url: "https://github.com/Sudo-Rahman/Lichess-Data",
		featured: false,
	},
	{
		slug: "renamer",
		number: 14,
		symbol: "Rn",
		family: "desktop",
		year: 2024,
		state: "product",
		title: "renamer",
		summary:
			"Logiciel de renommage de fichiers par lots avec règles combinables et aperçu en direct. La v1 (Tauri 2, API Rust/Axum, licences Stripe) était vendue en direct ; la v2 est publiée sur le Mac App Store sous le nom Renamer Pro.",
		technologies: ["Rust", "Tauri 2", "SvelteKit", "Axum", "Stripe"],
		url: "https://github.com/Sudo-Rahman/renamer",
		websiteUrl: "https://renamer.sudo-rahman.fr/",
		appStoreUrl: "https://apps.apple.com/us/app/renamer-pro/id6753810633?mt=12",
		featured: false,
	},
	{
		slug: "rclone_cpp",
		number: 12,
		symbol: "Rc",
		family: "system",
		year: 2024,
		state: "open-source",
		title: "rclone_cpp",
		summary:
			"Bibliothèque C++ encapsulant rclone en tant que sous-processus, exposant une API orientée objet pour le stockage cloud.",
		technologies: ["C++", "Boost", "rclone", "CMake", "Conan"],
		url: "https://github.com/Sudo-Rahman/rclone_cpp",
		featured: false,
	},
	{
		slug: "PrimeShield",
		number: 16,
		symbol: "Ps",
		family: "desktop",
		year: 2025,
		state: "open-source",
		title: "PrimeShield",
		summary:
			"Démonstration interactive des primitives cryptographiques RSA avec interface graphique (Alice & Bob), construite en Rust avec Iced.",
		technologies: ["Rust", "Iced", "RSA"],
		url: "https://github.com/Sudo-Rahman/PrimeShield",
		featured: false,
	},
	{
		slug: "gold-investment",
		number: 15,
		symbol: "Au",
		family: "web",
		year: 2024,
		state: "open-source",
		title: "gold-investment",
		summary:
			"Calculateur d'investissement dans l'or en ligne : estime les gains potentiels selon la quantité, la durée et les contributions. Site SvelteKit avec suivi du marché des devises.",
		technologies: ["TypeScript", "SvelteKit", "Tailwind CSS", "Docker"],
		url: "https://github.com/Sudo-Rahman/gold-investment",
		featured: false,
	},
	{
		slug: "6-qui-prend",
		number: 4,
		symbol: "Qp",
		family: "system",
		year: 2022,
		state: "academic",
		title: "6-qui-prend",
		summary:
			"Jeu de cartes multijoueur en réseau implémenté en C natif avec communication par sockets TCP.",
		technologies: ["C", "Sockets TCP", "Linux"],
		url: "https://github.com/Sudo-Rahman/6-qui-prend",
		featured: false,
	},
	{
		slug: "Curling-Three-js",
		number: 1,
		symbol: "Cu",
		family: "web",
		year: 2021,
		state: "academic",
		title: "Curling-Three-js",
		summary:
			"Projet académique : partie de curling interactive en 3D dans le navigateur, construite avec Three.js et WebGL.",
		technologies: ["JavaScript", "Three.js", "WebGL", "GLSL"],
		url: "https://github.com/Sudo-Rahman/Curling-Three-js",
		featured: false,
	},
	{
		slug: "Leafium",
		number: 11,
		symbol: "Lf",
		family: "data",
		year: 2024,
		state: "academic",
		title: "Leafium",
		summary:
			"Centralisation et analyse de données cinématographiques dans une base NoSQL pour en extraire des indicateurs décisionnels.",
		technologies: ["MongoDB", "NoSQL", "Python"],
		url: "https://github.com/Sudo-Rahman/Leafium",
		featured: false,
	},
	{
		slug: "Projet-CWA",
		number: 13,
		symbol: "Cd",
		family: "web",
		year: 2024,
		state: "academic",
		title: "Projet-CWA (Cadmium)",
		summary:
			"Application web de gestion de tâches (CRUD complet) construite avec Angular 16 et TypeScript.",
		technologies: ["TypeScript", "Angular", "Tailwind CSS"],
		url: "https://github.com/Sudo-Rahman/Projet-CWA",
		featured: false,
	},
	{
		slug: "Projet-GL",
		number: 10,
		symbol: "Gl",
		family: "desktop",
		year: 2023,
		state: "academic",
		title: "Projet-GL",
		summary:
			"Application Java Swing de gestion d'achat de fruits avec interface graphique desktop.",
		technologies: ["Java", "Swing"],
		url: "https://github.com/Sudo-Rahman/Projet-GL",
		featured: false,
	},
	{
		slug: "Titanium",
		number: 3,
		symbol: "Ti",
		family: "desktop",
		year: 2022,
		state: "academic",
		title: "Titanium",
		summary:
			"Application bureautique de gestion de contacts développée en C++17/23 avec Qt 5/6 (Widgets + SQL).",
		technologies: ["C++", "Qt", "SQL"],
		url: "https://github.com/Sudo-Rahman/Titanium",
		featured: false,
	},
];

export const featuredProjects = projects.filter((p) => p.featured);

/** Projects shipped to users: stores, paid licences or public downloads. */
export const publishedProjects = projects.filter((p) => p.state === "product");

/** Projects in atomic order (oldest first). */
export const elements = [...projects].sort((a, b) => a.number - b.number);

export function hasProjectDetails(project: Project): boolean {
	return project.detailsAvailable !== false;
}

export function getProject(slug: string): Project | undefined {
	return projects.find((p) => p.slug === slug);
}

/** Previous / next element in atomic order that has a detail page. */
export function neighbours(project: Project): { prev?: Project; next?: Project } {
	const browsable = elements.filter(hasProjectDetails);
	const i = browsable.findIndex((p) => p.slug === project.slug);
	return { prev: browsable[i - 1], next: browsable[i + 1] };
}

export function projectHref(project: Project): string | undefined {
	return hasProjectDetails(project) ? `/projects/${project.slug}` : undefined;
}

export function pad(n: number, size = 2): string {
	return String(n).padStart(size, "0");
}
