export interface Project {
	slug: string;
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
		slug: "KARA",
		title: "KARA",
		summary:
			"Écosystème de gestion et de valorisation de métaux précieux : application iOS Swift/SwiftUI et services web SvelteKit/TypeScript, avec APIs sécurisées, Redis, extraction assistée par IA, pipeline de données, tests automatisés et CI.",
		technologies: ["Swift", "SwiftUI", "SvelteKit", "TypeScript", "Redis"],
		featured: true,
		detailsAvailable: false,
	},
	{
		slug: "MediaFlow",
		title: "MediaFlow",
		summary:
			"Suite desktop de traitement multimédia : interface Svelte 5/TypeScript et backend Rust/Tauri 2 pour l'extraction, l'OCR, la transcription et le traitement par lots avec FFmpeg, tests automatisés et CI multi-OS.",
		technologies: ["Rust", "Tauri 2", "Svelte 5", "FFmpeg", "GitHub Actions"],
		url: "https://github.com/Sudo-Rahman/MediaFlow",
		featured: true,
	},
	{
		slug: "Projet-DAW",
		title: "Neptune",
		summary:
			"Plateforme d'apprentissage en ligne : architecture PHP MVC, interface JavaScript et base PostgreSQL réunissant gestion des utilisateurs, cours, évaluations par QCM, forum communautaire et administration.",
		technologies: ["PHP", "PostgreSQL", "JavaScript", "Docker"],
		url: "https://github.com/Sudo-Rahman/Projet-DAW",
		featured: true,
	},
	{
		slug: "Iridium",
		title: "Iridium",
		summary:
			"Gestionnaire desktop multi-cloud : client C++23/Qt 6 pilotant rclone pour explorer, rechercher et synchroniser des stockages distants, avec transferts asynchrones, progression en temps réel, packaging multiplateforme et releases GitHub.",
		technologies: ["C++23", "Qt 6", "rclone", "CMake", "Conan"],
		url: "https://github.com/Sudo-Rahman/Iridium",
		featured: true,
	},
	{
		slug: "Nymbra",
		title: "Nymbra",
		summary:
			"Application iPhone publiee sur l'App Store : coffre-fort chiffre pour documents, photos, videos, scans, archives et audio, avec Face ID, verrouillage automatique, recherche et synchronisation iCloud optionnelle.",
		technologies: ["iOS", "iCloud", "Face ID", "App Store", "Closed source"],
		websiteUrl: "https://nymbra.sudo-rahman.fr/",
		appStoreUrl: "https://apps.apple.com/us/app/nymbra/id6783014745",
		featured: false,
	},
	{
		slug: "linkKeep",
		title: "linkKeep",
		summary:
			"Application Apple native iOS/iPadOS/macOS : SwiftUI, Core Data/CloudKit, synchronisation iCloud, architecture Domain/Data/Services, tests unitaires Swift et site multilingue SvelteKit.",
		technologies: ["Swift", "SwiftUI", "Core Data", "CloudKit", "Swift Testing"],
		url: "https://github.com/Sudo-Rahman/linkKeep",
		websiteUrl: "https://linkkeep.sudo-rahman.fr/",
		featured: false,
	},
	{
		slug: "kotlin-meteo",
		title: "Kotlin Météo",
		summary:
			"Application Android native de prévisions météo en Kotlin : Open-Meteo, Geoapify, géolocalisation GPS, recherche de ville, prévisions 24 h/10 jours et persistance locale.",
		technologies: ["Kotlin", "Java", "Android", "Gradle"],
		url: "https://github.com/Sudo-Rahman/kotlin-meteo",
		featured: false,
	},
	{
		slug: "Before-After-Image",
		title: "Before-After-Image",
		summary:
			"Bibliothèque Android Jetpack Compose : composant before/after réutilisable, API simple, personnalisation du composant, démonstration et publication Gradle.",
		technologies: ["Kotlin", "Jetpack Compose", "Android", "Gradle"],
		url: "https://github.com/Sudo-Rahman/Before-After-Image",
		featured: false,
	},
	{
		slug: "Argon",
		title: "Argon",
		summary:
			"Projet décisionnel autour du dataset Yelp : data warehouse Kimball, ETL Python/Pandas, chargement PostgreSQL, nettoyage de métadonnées, analyse de sentiment sur les avis et tableaux de bord Metabase.",
		technologies: ["Python", "Pandas", "PostgreSQL", "Metabase", "Transformers"],
		url: "https://github.com/Sudo-Rahman/Argon",
		featured: false,
	},
	{
		slug: "Fractalium",
		title: "Fractalium",
		summary:
			"Application C++/Qt de calcul distribué de fractales via MPI : zoom interactif, précision 100 décimales, snapshots de session et exécution sur cluster.",
		technologies: ["C++", "Qt", "MPI", "CMake"],
		url: "https://github.com/Sudo-Rahman/Fractalium",
		featured: false,
	},
	{
		slug: "Lichess-Data",
		title: "Lichess-Data",
		summary:
			"Serveur Java multi-clients : indexe et interroge des PGN Lichess de plus de 100 Go, avec recherche, statistiques et PageRank.",
		technologies: ["Java", "Sockets", "Concurrency"],
		url: "https://github.com/Sudo-Rahman/Lichess-Data",
		featured: false,
	},
	{
		slug: "renamer",
		title: "renamer",
		summary:
			"Application desktop multiplateforme Tauri 2 : renommage de lots de fichiers avec formatters combinables, aperçu temps réel, API Rust/Axum, licences Stripe et auto-update.",
		technologies: ["Rust", "Tauri 2", "Axum", "TypeScript"],
		url: "https://github.com/Sudo-Rahman/renamer",
		websiteUrl: "https://renamer.sudo-rahman.fr/",
		featured: false,
	},
	{
		slug: "rclone_cpp",
		title: "rclone_cpp",
		summary:
			"Bibliotheque C++ encapsulant rclone en tant que sous-processus, exposant une API orientee objet pour le stockage cloud.",
		technologies: ["C++", "Boost", "rclone", "CMake", "Conan"],
		url: "https://github.com/Sudo-Rahman/rclone_cpp",
		featured: false,
	},
	{
		slug: "PrimeShield",
		title: "PrimeShield",
		summary:
			"Demonstration interactive des primitives cryptographiques RSA avec interface graphique (Alice & Bob), construite en Rust avec Iced.",
		technologies: ["Rust", "Iced", "RSA"],
		url: "https://github.com/Sudo-Rahman/PrimeShield",
		featured: false,
	},
	{
		slug: "gold-investment",
		title: "gold-investment",
		summary:
			"Calculateur d'investissement or en ligne : estime les gains potentiels selon la quantite, la duree et les contributions. Site SvelteKit avec suivi du marche des devises.",
		technologies: ["TypeScript", "SvelteKit", "Tailwind CSS", "Docker"],
		url: "https://github.com/Sudo-Rahman/gold-investment",
		featured: false,
	},
	{
		slug: "6-qui-prend",
		title: "6-qui-prend",
		summary:
			"Jeu de cartes multijoueur en reseau implemente en C natif avec communication par sockets TCP.",
		technologies: ["C", "Sockets TCP", "Linux"],
		url: "https://github.com/Sudo-Rahman/6-qui-prend",
		featured: false,
	},
	{
		slug: "Curling-Three-js",
		title: "Curling-Three-js",
		summary:
			"Projet academique — partie de curling interactive en 3D dans le navigateur, construite avec Three.js et WebGL.",
		technologies: ["JavaScript", "Three.js", "WebGL", "GLSL"],
		url: "https://github.com/Sudo-Rahman/Curling-Three-js",
		featured: false,
	},
	{
		slug: "Leafium",
		title: "Leafium",
		summary:
			"Centralisation et analyse de donnees cinematographiques dans une base NoSQL pour en extraire des indicateurs decisionnels.",
		technologies: ["MongoDB", "NoSQL", "Python"],
		url: "https://github.com/Sudo-Rahman/Leafium",
		featured: false,
	},
	{
		slug: "Projet-CWA",
		title: "Projet-CWA (Cadmium)",
		summary:
			"Application web de gestion de taches (CRUD complet) construite avec Angular 16 et TypeScript.",
		technologies: ["TypeScript", "Angular", "Tailwind CSS"],
		url: "https://github.com/Sudo-Rahman/Projet-CWA",
		featured: false,
	},
	{
		slug: "Projet-GL",
		title: "Projet-GL",
		summary:
			"Application Java Swing de gestion d'achat de fruits avec interface graphique desktop.",
		technologies: ["Java", "Swing"],
		url: "https://github.com/Sudo-Rahman/Projet-GL",
		featured: false,
	},
	{
		slug: "Titanium",
		title: "Titanium",
		summary:
			"Application bureautique de gestion de contacts developpee en C++17/23 avec Qt 5/6 (Widgets + SQL).",
		technologies: ["C++", "Qt", "SQL"],
		url: "https://github.com/Sudo-Rahman/Titanium",
		featured: false,
	},
];

export const featuredProjects = projects.filter((p) => p.featured);

export function hasProjectDetails(project: Project): boolean {
	return project.detailsAvailable !== false;
}

export function getProject(slug: string): Project | undefined {
	return projects.find((p) => p.slug === slug);
}
