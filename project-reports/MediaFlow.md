# MediaFlow | Rapport technique

## En bref

- **Boîte à outils multimédia** locale pour l'extraction de pistes, le merge, l'OCR vidéo, la transcription audio, la traduction IA et le renommage en masse.
- Architecture **Tauri 2.0** : backend Rust pour les opérations lourdes (FFmpeg, OCR, gestion de processus), frontend Svelte 5 pour l'interface utilisateur.
- Sept outils intégrés dans une seule application native, avec annulation, progression temps réel et gestion de l'inhibition de veille système.
- OCR **PaddleOCR v5** avec accélération Metal (macOS) / Vulkan (Windows/Linux) et pipeline de frames streamé via FFmpeg.
- Traduction multi-modèles simultanée via OpenAI, Anthropic, Google AI et OpenRouter, avec segmentation intelligente (thèmes/génériques vs dialogues) et mémoire de traduction.
- Build multi-plateforme (macOS, Linux, Windows) via GitHub Actions CI complet.

## Contexte et objectif

MediaFlow s'adresse aux utilisateurs qui manipulent régulièrement des fichiers multimédia — sous-titres, pistes audio, vidéos — et qui ont besoin d'un outil local, rapide et unifié. Le cas d'usage principal est le traitement en masse de fichiers pour des saisons entières de séries : extraire des pistes, merger des sous-titres, OCR des sous-titres gravés, transcrire de l'audio, traduire des sous-titres.

L'application se démarque des solutions en ligne par sa nature local-first : les fichiers ne quittent jamais la machine, les opérations FFmpeg/OCR s'exécutent nativement, et seules les API d'IA (traduction, transcription) nécessitent un accès réseau.

## Fonctionnalités

| Outil | Description |
|-------|-------------|
| **Extraction** | Inspection des conteneurs multimédia via FFprobe, sélection et extraction de pistes audio/vidéo/sous-titres avec préservation des métadonnées. |
| **Merge** | Construction de pipelines de merge par lot : attachement de pistes externes, auto-match par pattern d'épisode, configuration langue/titre/default/forced/delay par piste. |
| **Audio to Subs** | Transcription audio/vidéo vers sous-titres via Deepgram, gestion multi-versions, export SRT/VTT/JSON. |
| **Video OCR** | Extraction de sous-titres gravés (burned-in) par OCR, région globale avec override par fichier, multi-travailleurs avec accélération GPU. |
| **AI Translation** | Traduction de sous-titres via OpenAI, Anthropic, Google AI ou OpenRouter. File multi-fichiers avec splitting en batches, mémoire de traduction pour les génériques. |
| **Rename** | Renommage/copie en masse basé sur des règles, prévisualisation, détection de conflits. |
| **Info** | Inspection rapide : conteneur, pistes, codecs, bitrate, métadonnées. |

Fonctionnalités transversales : drag & drop inter-outils, thème clair/sombre/système, settings persistants via Tauri Store, logs structurés, progression globale unifiée, inhibition de veille pendant les opérations longues.

## Architecture (vue d'ensemble)

```
MediaFlow/
├── src/                          # Frontend SvelteKit (SPA)
│   ├── routes/
│   │   └── +page.svelte          # Point d'entrée unique – routing par state
│   └── lib/
│       ├── components/           # UI par outil + composants partagés + ui/ (shadcn)
│       ├── services/             # Logique métier frontend (parsing, API calls, storage)
│       ├── stores/               # État réactif Svelte 5 (.svelte.ts)
│       ├── types/                # Types TypeScript par domaine
│       ├── hooks/                # Hooks réutilisables
│       └── utils/                # Utilitaires (format, DnD, logs, OCR helpers)
├── src-tauri/                    # Backend Rust (Tauri 2.0)
│   └── src/
│       ├── app/                  # Setup fenêtre native (vibrancy macOS)
│       ├── commands/             # Exposition des modules tools comme commandes Tauri
│       ├── tools/                # Logique métier Rust
│       │   ├── ffmpeg/           # Extraction, download, version check
│       │   ├── ffprobe/          # Probe de fichiers média
│       │   ├── merge/            # Merge de pistes
│       │   ├── ocr/              # Pipeline OCR complet (engine, pipeline, export, subtitles)
│       │   ├── transcription/    # Transcodage Opus, waveform
│       │   ├── tokens/           # Comptage de tokens (tiktoken)
│       │   ├── fs/               # Opérations fichier (rename, copy, metadata)
│       │   ├── data/             # Persistance données d'outils (rsext, transcriptions)
│       │   └── power/            # Inhibition de veille système
│       ├── shared/               # Utilitaires partagés (validation, progress tracking, hash, store)
│       └── test_support/         # Assets de test et helpers
└── .github/workflows/ci.yml     # CI multi-OS
```

**Pattern architectural** : L'application suit un modèle à deux couches clairement séparé. Le backend Rust expose des commandes Tauri (`#[tauri::command]`) que le frontend invoque via `invoke()`. Les événements temps réel (progression, erreurs) transitent par le canal d'événements Tauri (`app.emit()`). Le frontend est un SPA monopage avec un routeur interne piloté par un état `currentView` — les vues sont montées en parallèle mais affichées/masquées via `display:none` pour préserver l'état entre les navigations.

## Choix techniques et raisons

1. **Tauri 2.0 + Rust** : Remplace Electron pour un binaire natif plus léger (~10x plus petit), un accès système direct (process FFmpeg, OCR, I/O bas niveau) et des performances supérieures. L'édition Rust 2024 avec tokio async runtime permet de gérer les processus FFmpeg sans bloquer l'UI.

2. **Svelte 5 + runes** : Les stores utilisent les runes `$state` et `$derived` de Svelte 5 pour une réactivité fine sans boilerplate. L'approche SPA avec `adapter-static` et `ssr: false` est requise par Tauri (pas de serveur Node).

3. **shadcn-svelte + Tailwind CSS v4** : Composants UI accessibles et personnalisables, évitant le vendor lock-in d'une librairie de composants. L'intégration Tailwind v4 via plugin Vite assure des performances de build optimales.

4. **Pipeline OCR streamé** : FFmpeg extrait les frames en PNG vers un pipe (`image2pipe`), un reader async tokio découpe le flux binaire en frames PNG complètes, et des workers synchrones (rayon) distribuent l'OCR via PaddleOCR. Ce pattern évite les I/O disque intermédiaires et permet une parallélisation maximale.

5. **Multi-backend GPU pour l'OCR** : L'utilisation de `ocr-rs` (PaddleOCR bindings Rust) avec sélection de backend Metal (macOS), Vulkan (Windows/Linux) ou CPU offre une flexibilité maximale selon le matériel disponible.

6. **Inhibition de veille multi-plateforme** : Implémentation native via IOKit (macOS), `SetThreadExecutionState` (Windows) et logind/systemd-inhibit (Linux). Un service dédié avec thread dédié et channel mpsc gère les leases avec un RAII guard.

7. **Traduction avec segmentation thématique** : Le service de traduction classe les cues en trois catégories (passthrough, themeCandidate, mainTranslatable), groupe les signatures de génériques identiques, et utilise un cache de traduction (`translation-memory`) pour éviter de re-traduire les openings/endings récurrents.

8. **LLM client multi-provider** : Un client unifié gère OpenAI, Anthropic, Google AI et OpenRouter avec gestion d'erreurs catégorisée (rate limit, quota, auth, timeout), timeout fusionné avec AbortSignal, et retry intelligent.

## Extraits de code remarquables

### 1. Pipeline OCR streamé — extraction de frames PNG depuis FFmpeg

**Fichier** : `src-tauri/src/tools/ocr/pipeline.rs`

```rust
const PNG_SIGNATURE: &[u8; 8] = b"\x89PNG\r\n\x1a\n";
const PNG_IEND_TYPE: &[u8; 4] = b"IEND";

fn take_next_png_frame(buffer: &mut Vec<u8>) -> Result<Option<Vec<u8>>, String> {
    let Some(signature_index) = find_png_signature(buffer) else {
        let tail_len = buffer.len().min(PNG_SIGNATURE.len().saturating_sub(1));
        if buffer.len() > tail_len {
            buffer.drain(..buffer.len() - tail_len);
        }
        return Ok(None);
    };

    if signature_index > 0 {
        buffer.drain(..signature_index);
    }

    let mut cursor = PNG_SIGNATURE.len();
    loop {
        if buffer.len() < cursor + 8 {
            return Ok(None);
        }

        let chunk_len = u32::from_be_bytes([
            buffer[cursor], buffer[cursor + 1],
            buffer[cursor + 2], buffer[cursor + 3],
        ]) as usize;
        let chunk_type = &buffer[cursor + 4..cursor + 8];
        let chunk_end = cursor
            .checked_add(12)
            .and_then(|value| value.checked_add(chunk_len))
            .ok_or_else(|| "PNG chunk length overflow".to_string())?;

        if buffer.len() < chunk_end {
            return Ok(None);
        }

        cursor = chunk_end;
        if chunk_type == PNG_IEND_TYPE {
            return Ok(Some(buffer.drain(..cursor).collect()));
        }
    }
}
```

**Pourquoi c'est intéressant** : Cette fonction parse un flux binaire continu en PNG complets sans écrire sur disque. Elle gère les lectures partielles, le bruit de fond avant la signature PNG, et les chunks PNG de longueur variable. Le pipeline complet (`run_ocr_pipeline_with_bins`) lance trois tâches concurrentes — lecture du stream FFmpeg stdout, lecture de la progression stderr, et OCR processing — communiquant via des channels tokio.

### 2. Distribution multi-worker de l'OCR

**Fichier** : `src-tauri/src/tools/ocr/pipeline.rs`

```rust
fn process_streamed_frames(
    frame_rx: tokio::sync::mpsc::Receiver<StreamedFrame>,
    models_dir: &Path,
    language: &str,
    use_gpu: bool,
    requested_workers: u32,
    progress: Option<OcrProgressEmitter>,
    total_frames_hint: u32,
    file_id: &str,
) -> Result<Vec<OcrFrameResult>, String> {
    let worker_count = resolve_ocr_worker_count(requested_workers);
    let engine_threads = resolve_ocr_engine_threads(worker_count);

    let mut worker_senders = Vec::with_capacity(worker_count);
    let mut worker_handles = Vec::with_capacity(worker_count);

    for _worker_index in 0..worker_count {
        let (worker_tx, worker_rx) =
            std::sync::mpsc::sync_channel::<WorkerMessage>(WORKER_QUEUE_CAPACITY);
        worker_senders.push(worker_tx);

        worker_handles.push(std::thread::spawn(move || {
            let engine = match create_ocr_engine(&models_dir, &language, use_gpu, engine_threads) {
                Ok(engine) => engine,
                Err(error) => { set_fatal_error(&fatal_error, error); return; }
            };

            while let Ok(message) = worker_rx.recv() {
                match message {
                    WorkerMessage::Shutdown => break,
                    WorkerMessage::Frame(frame) => {
                        if is_operation_cancelled(&file_id) { break; }
                        if let Ok(ocr_results) = engine.recognize(&image) {
                            // Collect results via Arc<Mutex>
                        }
                    }
                }
            }
        }));
    }

    // Round-robin dispatch
    while let Some(frame) = frame_rx.blocking_recv() {
        worker_senders[next_worker].send(WorkerMessage::Frame(frame))?;
        next_worker = (next_worker + 1) % worker_count;
    }
}
```

**Pourquoi c'est intéressant** : Le système adapte automatiquement le nombre de workers et de threads par worker en fonction des cœurs physiques disponibles (`num_cpus`). Chaque worker possède son propre moteur OCR avec un channel de capacité 1 (backpressure), ce qui limite la consommation mémoire. Le dispatch round-robin équilibre la charge sans contention.

### 3. Sécurité — Validation des chemins de fichiers

**Fichier** : `src-tauri/src/shared/validation.rs`

```rust
pub(crate) const ALLOWED_MEDIA_EXTENSIONS: &[&str] = &[
    "mkv", "mp4", "avi", "mov", "webm", "m4v", "mks", "mka", "m4a",
    "mp3", "flac", "wav", "ogg", "aac", "ac3", "dts", "srt", "ass",
    "ssa", "vtt", "sub", "sup", "opus", "wma",
];

pub(crate) fn validate_media_path(path: &str) -> Result<(), String> {
    let path = Path::new(path);
    if !path.exists() { return Err(format!("File not found: {}", path.display())); }
    if !path.is_file() { return Err(format!("Not a file: {}", path.display())); }

    let ext = path.extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    if !ALLOWED_MEDIA_EXTENSIONS.contains(&ext.as_str()) {
        return Err(format!("Unsupported file type: .{}", ext));
    }
    Ok(())
}

pub(crate) fn validate_output_path(path: &str) -> Result<(), String> {
    let path_str = path.to_string_lossy();
    if path_str.contains("..") {
        return Err("Path traversal not allowed".to_string());
    }
    if let Some(parent) = path.parent() {
        if !parent.as_os_str().is_empty() && !parent.exists() {
            return Err(format!("Output directory does not exist: {}", parent.display()));
        }
    }
    Ok(())
}
```

**Pourquoi c'est intéressant** : Chaque commande Tauri qui manipule des fichiers valide systématiquement les chemins d'entrée (whitelist d'extensions, existence, type fichier) et de sortie (pas de path traversal, répertoire parent existant). C'est une défense en profondeur essentielle pour une application desktop qui exécute des commandes système.

### 4. Parser de sous-titres multi-format avec placeholders

**Fichier** : `src/lib/services/subtitle-parser.ts`

```typescript
function tokenizeASSText(text: string): { skeleton: string; placeholders: Placeholder[] } {
  const placeholders: Placeholder[] = [];
  let placeholderIndex = 0;

  let skeleton = text.replace(/\{[^}]*\}/g, (match) => {
    const token = makePlaceholder('TAG', placeholderIndex);
    placeholders.push({ index: placeholderIndex, token, original: match });
    placeholderIndex++;
    return token;
  });

  skeleton = skeleton.replace(/\\N/g, (match) => {
    const token = makePlaceholder('BR', placeholderIndex);
    placeholders.push({ index: placeholderIndex, token, original: match });
    placeholderIndex++;
    return token;
  });

  return { skeleton, placeholders };
}
```

**Pourquoi c'est intéressant** : Le parser remplace les éléments de formatage (tags ASS `{...}`, retours à la ligne `\N`, tags HTML, entités) par des placeholders uniques (`⟦TAG_0⟧`, `⟦BR_1⟧`). Cela permet d'envoyer au LLM uniquement le texte visible tout en garantissant la reconstruction exacte du fichier original après traduction. Le système supporte SRT, VTT, ASS et SSA avec une structure de données unifiée (`Cue`).

### 5. Traduction avec segmentation thématique et mémoire de cache

**Fichier** : `src/lib/services/translation.ts`

```typescript
function classifyCueRole(cue: Cue): CueRole {
  const isMaskStyle = isAssLike && !!normalizedStyle
    && NON_TRANSLATABLE_ASS_STYLES.has(normalizedStyle);

  if (isMaskStyle || isAssDrawingCue(cue) || !hasVisibleCueText(cue)) {
    return 'passthroughNonText';
  }
  if (isThemeCue(cue)) {
    return 'themeCandidate';
  }
  return 'mainTranslatable';
}

function buildCanonicalThemeTemplate(cue: Cue): ThemeCueOccurrence {
  const placeholderOrder = cue.placeholders.map(p => p.token);
  let canonicalSkeleton = cue.textSkeleton;
  placeholderOrder.forEach((token, index) => {
    canonicalSkeleton = canonicalSkeleton
      .split(token)
      .join(getCanonicalPlaceholderToken(index));
  });
  return {
    cue,
    signature: normalizeThemeSignature(canonicalSkeleton),
    canonicalSkeleton,
    placeholderOrder
  };
}
```

**Pourquoi c'est intéressant** : Les cues de génériques (opening/ending) partagent souvent le même squelette de texte avec des placeholders variables. Le système les regroupe par signature canonique, traduit une seule fois le template, et réapplique la traduction à toutes les occurrences. Un cache persisté (`translation-memory`) stocke ces traductions de génériques pour les réutiliser entre les épisodes d'une même série, réduisant les appels API et la cohérence.

### 6. Inhibition de veille système avec RAII guard

**Fichier** : `src-tauri/src/shared/sleep_inhibit.rs`

```rust
pub(crate) struct SleepInhibitGuard {
    token: u64,
}

impl SleepInhibitGuard {
    pub(crate) fn try_acquire(reason: impl Into<String>) -> Result<Self, String> {
        let token = acquire_sleep_inhibit(reason)?;
        Ok(Self { token })
    }
}

impl Drop for SleepInhibitGuard {
    fn drop(&mut self) {
        SERVICE.release_best_effort(self.token);
    }
}

// Usage dans les commandes Tauri :
#[tauri::command]
pub(crate) async fn extract_track(app: tauri::AppHandle, /* ... */) -> Result<(), String> {
    let _sleep_guard = SleepInhibitGuard::try_acquire("FFmpeg extraction").ok();
    // ... opération longue ...
    // _sleep_guard est libéré automatiquement à la fin du scope
}
```

**Pourquoi c'est intéressant** : Le pattern RAII garantit que l'inhibition de veille est toujours relâchée, même en cas d'erreur ou d'annulation. Le service tourne sur un thread dédié avec channel mpsc et gère un compteur de leases : la première acquisition active l'inhibition système, la dernière libération la désactive. L'implémentation macOS utilise directement IOKit (`IOPMAssertionCreateWithName`), Windows utilise `SetThreadExecutionState`, et Linux utilise logind ou systemd-inhibit en fallback.

### 7. Progress tracking FFmpeg avec EMA

**Fichier** : `src-tauri/src/shared/ffmpeg_progress.rs`

```rust
pub(crate) struct FfmpegProgressTracker {
    duration_us: Option<u64>,
    start_instant: Instant,
    last_total_size_bytes: Option<u64>,
    last_total_size_elapsed_seconds: Option<f64>,
    smoothed_speed_bytes_per_sec: Option<f64>,
    ema_alpha: f64,
}

impl FfmpegProgressTracker {
    fn update_speed(&mut self, total_size_bytes: u64, elapsed_seconds: f64) {
        let instant_speed = bytes_delta as f64 / elapsed_delta;
        self.smoothed_speed_bytes_per_sec =
            Some(match self.smoothed_speed_bytes_per_sec {
                Some(previous) => {
                    (self.ema_alpha * instant_speed) + ((1.0 - self.ema_alpha) * previous)
                }
                None => instant_speed,
            });
    }
}
```

**Pourquoi c'est intéressant** : Le tracker parse les lignes `out_time_us=`, `total_size=` et `progress=end` du stdout de FFmpeg. Il calcule une vitesse de transfert lissée par moyenne mobile exponentielle (EMA, α=0.25) pour éviter les sauts visuels dans la barre de progression. Ce composant est réutilisé par l'extraction, le merge et le pipeline OCR.

## Qualité, sécurité, maintenance

### Tests

- **Tests unitaires Rust** : Chaque module du backend dispose de tests dédiés (validation, progress tracker, OCR engine, merge args, extraction, token counting). Les tests OCR utilisent un asset vidéo de test (`test_support::assets::ensure_ocr_video()`).
- **Tests d'intégration** : Le pipeline OCR est testé de bout en bout avec un vrai fichier vidéo et les modèles PP-OCRv5. Le merge est testé avec vérification ffprobe du fichier de sortie (langue, titre, disposition).
- **Tests de résilience** : Annulation de pipeline OCR (`cancel_ocr_operation`), fichiers corrompus, index de piste invalide, binaire FFmpeg absent.
- **CI multi-OS** : GitHub Actions exécute `cargo test` et `pnpm tauri build` sur macOS, Ubuntu et Windows, avec installation spécifique des dépendances système (Vulkan SDK, FFmpeg, GTK/WebKit).

### Sécurité

- Validation systématique des chemins d'entrée (whitelist d'extensions) et de sortie (anti-path-traversal).
- CSP désactivé (`null`) dans `tauri.conf.json` pour permettre les appels API externes, compensé par la validation côté backend.
- Timeout sur toutes les opérations FFmpeg (5 min extraction, 10 min merge, 30 min OCR).
- Nettoyage des fichiers partiels en cas d'échec ou de timeout (`remove_partial_output`).
- Les API keys sont stockées localement via Tauri Store.

### Gestion d'erreurs et logging

- Système de logs structuré (`logStore`) avec niveaux (info/warning/error/success), badge de compteur d'erreurs non lues dans le header, et panneau de logs détaillés.
- `logAndToast` combine notification toast + log persistant pour les erreurs critiques (ex: FFmpeg introuvable).
- Le client LLM catégorise les erreurs API (rate limit, quota, auth, timeout, server) avec marquage `retryable` et `retryAfter`.

## Installation et exécution (local)

### Prérequis

- **pnpm** (gestionnaire de paquets obligatoire)
- **Rust toolchain stable** (édition 2024)
- **FFmpeg** et **FFprobe** sur le PATH système
  - macOS : `brew install ffmpeg`
  - Ubuntu/Debian : `sudo apt install ffmpeg`
  - Windows : télécharger depuis [ffmpeg.org](https://ffmpeg.org/download.html)
- **Node.js** ≥ 25

### Développement

```bash
git clone https://github.com/Sudo-Rahman/MediaFlow.git
cd MediaFlow

# Installer les dépendances frontend
pnpm install

# Lancer en mode développement (frontend + Tauri)
pnpm tauri dev

# Frontend uniquement (sans backend Rust)
pnpm dev

# Vérification des types TypeScript
pnpm check

# Build de production (génère les binaires natifs)
pnpm tauri build
```

### Tests Rust

```bash
cd src-tauri
cargo test          # Tests unitaires
cargo test -- --ignored  # Tests d'intégration (lents)
```

## Limites connues et pistes d'amélioration

- **OCR** : Les modèles PP-OCRv5 ne sont pas packagés automatiquement ; l'utilisateur doit les placer dans le dossier `ocr-models`. Un téléchargement automatisé améliorerait le DX.
- **Transcription** : Dépendance exclusive à Deepgram. Un support Whisper local (via whisper.cpp) offrirait une option offline.
- **Single-page routing** : L'état des vues est géré par un système maison (`display:none` toggle) plutôt que par un routeur SvelteKit classique. Cela fonctionne mais complique la gestion du cycle de vie des composants.
- **Pas de tests frontend** : Aucun test unitaire ou E2E côté Svelte n'est présent dans le repo.
- **CSP null** : La Content Security Policy est désactivée. Une configuration plus restrictive avec whitelist de domaines d'API améliorerait la posture de sécurité.
- **Internationalisation** : L'interface est uniquement en anglais. Un système i18n permettrait de toucher un public plus large.

## Liens

- **Repo local** : `/Users/sr-71/Documents/portfolio/repos_to_process/MediaFlow`
- **GitHub** : [https://github.com/Sudo-Rahman/MediaFlow](https://github.com/Sudo-Rahman/MediaFlow)
