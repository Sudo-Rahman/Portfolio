# kotlin-meteo | Rapport technique

## En bref

- **Application Android native** de prévisions météorologiques, écrite en Kotlin, exploitant l'API gratuite **Open-Meteo**.
- Affiche les prévisions **horaire (24 h)** et **journalière (10 jours)** avec icônes météo adaptées jour/nuit.
- Architecture **MVVM** avec `ViewModel`, `LiveData`, Navigation Component et ViewBinding.
- Géolocalisation GPS ou recherche de ville via l'API **Geoapify** avec auto-complétion en temps réel.
- Thème dynamique jour/nuit basé sur le code météo renvoyé par l'API (dégradé de fond, couleur de la barre d'état).

## Contexte et objectif

**kotlin-meteo** est une application mobile Android visant à fournir une interface claire et immédiate pour consulter la météo. L'utilisateur peut s'appuyer sur sa position GPS ou rechercher manuellement une ville. Le projet couvre un périmètre métier complet : récupération de données distantes, parsing, affichage conditionnel, navigation inter-écrans et persistance de la dernière localisation.

Le public cible est un utilisateur final souhaitant une application légère, sans inscription, sans publicité, reposant uniquement sur des API ouvertes.

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| **Prévisions horaires** | Affiche les 24 prochaines heures : température, icône météo, probabilité de précipitation. |
| **Prévisions journalières** | Liste sur 10 jours avec températures min/max, icône, précipitation. Jours localisés en français. |
| **Détail journalier** | Écran détaillé pour un jour donné : lever/coucher du soleil, indice UV, vent (vitesse + direction), précipitation max, prévisions horaires du jour. |
| **Géolocalisation GPS** | Bouton GPS demandant la permission `ACCESS_FINE_LOCATION` et utilisant `LocationManager` pour récupérer la position. |
| **Recherche de ville** | Champ texte avec auto-complétion via Geoapify ; résultats affichés dans une liste cliquable. |
| **Persistance de localisation** | Dernière ville et coordonnées sauvegardées en `SharedPreferences` pour un rechargement automatique au démarrage. |
| **Thème jour/nuit** | Dégradé de fond et couleur de la barre d'état changent dynamiquement selon que le fuseau local est en journée ou la nuit. |

## Architecture (vue d'ensemble)

Le projet suit l'architecture **MVVM** (Model – View – ViewModel) encouragée par Android Jetpack. Le module unique `app` contient quatre couches principales :

```
com.sr_71.meteo/
├── API/                     # Couche réseau (Retrofit)
│   ├── WheaterAPI.kt        # Interface Retrofit + singleton Open-Meteo
│   └── GeoapifyAPI.kt       # Interface Retrofit + singleton Geoapify
├── model/                   # Modèles de données (Parcelable + mapping météo)
│   ├── Weather.kt           # Weather, WeatherDaily, WeatherHourly, WeatherCode, weatherCodeToImg
│   └── City.kt              # Citys, Properties, Propertie (Geoapify)
├── view_model/              # ViewModels (logique de présentation)
│   ├── HomeViewModel.kt     # Données météo + localisation + état jour/nuit
│   └── CitySearchViewModel.kt # Recherche de ville
└── view/
    ├── activities/
    │   └── MainActivity.kt  # Activity hôte, héberge le NavHostFragment
    ├── fagments/            # Fragments (UI)
    │   ├── NavHostFragment.kt        # Fragment principal : GPS, titre ville, sous-fragments
    │   ├── HourlyWeatherFragment.kt  # RecyclerView horaire
    │   ├── DailyWeatherFragment.kt   # RecyclerView journalier
    │   ├── DailyDetailWeatherFragment.kt # Détail d'un jour
    │   └── SearchCityFragment.kt     # Recherche ville
    └── adapters/            # RecyclerView Adapters
        ├── HourlyWeatherAdapter.kt
        ├── DailyWeatherAdapter.kt
        ├── SearchCityAdapter.kt
        └── AdapterCityOnClick.kt     # Interface callback clic ville
```

**Flux de données typique** :

1. `NavHostFragment` initialise les sous-fragments et vérifie les `SharedPreferences` pour restaurer la dernière localisation.
2. `HomeViewModel` expose des `LiveData` pour `weatherHourly`, `weatherDaily`, `locationGps`, `isDay`, `elevation`.
3. Les fragments observent ces `LiveData` et mettent à jour leurs adapters RecyclerView.
4. Le `HomeViewModel` lance des coroutines (`viewModelScope.launch`) pour appeler Retrofit, désérialiser la réponse JSON brute avec Gson, et peupler les `LiveData`.
5. La navigation entre écrans utilise le **Navigation Component** avec Safe Args pour passer les objets `Weather` (Parcelable) entre fragments.

```
 MainActivity
   └── NavHostFragment (Navigation Component)
         ├── HourlyWeatherFragment (enfant)
         ├── DailyWeatherFragment  (enfant)
         ├── DailyDetailWeatherFragment (destination nav_graph)
         └── SearchCityFragment         (destination nav_graph)
```

## Choix techniques et raisons

1. **Retrofit + `ScalarsConverterFactory` + Gson manuel** : L'API Open-Meteo retourne du JSON. Plutôt que d'utiliser un convertisseur Gson intégré à Retrofit, la réponse est récupérée en `String` brute puis désérialisée manuellement via `Gson().fromJson()`. Ce pattern, moins automatisé, offre un contrôle total sur le mapping et facilite le débogage (la réponse brute est disponible avant parsing).

2. **Coroutines Kotlin** (`viewModelScope.launch`) : Les appels réseau sont suspendables et automatiquement annulés lorsque le `ViewModel` est nettoyé, évitant les fuites mémoire et les crashes sur des callbacks obsolètes.

3. **Navigation Component + Safe Args** : Le graphe de navigation (`nav_graph.xml`) définit les destinations et les actions. Le plugin `androidx.navigation.safeargs.kotlin` génère des classes typesafe (`NavHostFragmentDirections`) pour passer des arguments entre fragments, éliminant les erreurs de clés string.

4. **`kotlin-parcelize`** : Les data classes `Weather`, `WeatherDaily`, `WeatherHourly` sont annotées `@Parcelize` pour pouvoir traverser les `Bundle` de navigation de manière performante (Parcelable vs Serializable).

5. **ViewBinding** : Activé dans le build.gradle (`viewBinding = true`), il génère des classes de binding typesafe (ex. `FragmentNavHostBinding`), remplaçant les `findViewById` par un accès direct aux vues.

6. **Fragments enfants imbriqués** : `NavHostFragment` utilise `childFragmentManager` pour héberger `HourlyWeatherFragment` et `DailyWeatherFragment`. Cela isole le cycle de vie de ces sous-fragments du graphe de navigation principal, tout en partageant le `HomeViewModel` au scope `activityViewModels()`.

7. **Géolocalisation native** (`LocationManager` + `Geocoder`) : Pas de dépendance à Google Play Services pour la localisation, ce qui rend l'application compatible avec les appareils ne disposant pas des services Google (ROM AOSP, appareils Huawei récents).

8. **Thème dynamique sans Dark Mode système** : Le jour/la nuit est déterminé par le champ `is_day` de l'API Open-Meteo, pas par les paramètres système Android. Cela permet d'afficher un fond nuit à un utilisateur au Canada consultant la météo de Paris en pleine journée.

## Extraits de code remarquables

### 1. API Retrofit – endpoints Open-Meteo

**Fichier** : `app/src/main/java/com/sr_71/meteo/API/WheaterAPI.kt`

```kotlin
interface WeatherAPI {

    enum class DAYS(val value: String) {
        ONE("1"),
        TEN("10")
    }

    @retrofit2.http.GET("v1/forecast?")
    suspend fun getNowWheater(
        @retrofit2.http.Query("latitude") latitude: String,
        @retrofit2.http.Query("longitude") longitude: String,
        @retrofit2.http.Query("hourly") hourly: String = "temperature_2m,weathercode,precipitation_probability,is_day",
        @retrofit2.http.Query("timezone") timezone: String = "auto",
        @retrofit2.http.Query("forecast_days") forecast_days: String = "2",
        @retrofit2.http.Query("daily") daily: String = "sunrise,sunset",
        @retrofit2.http.Query("models") models: String = "best_match",
    ): String

    @retrofit2.http.GET("v1/forecast?")
    suspend fun getWheaterTenDays(
        @retrofit2.http.Query("latitude") latitude: String,
        @retrofit2.http.Query("longitude") longitude: String,
        @retrofit2.http.Query("daily") daily: String = "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,windspeed_10m_max,winddirection_10m_dominant",
        @retrofit2.http.Query("timezone") timezone: String = "auto",
        @retrofit2.http.Query("forecast_days") forecast_days: String = "10",
        @retrofit2.http.Query("models") models: String = "best_match",
        @retrofit2.http.Query("hourly") hourly: String = "temperature_2m,weathercode,precipitation_probability,is_day",
    ): String
}

object WeatherApiManager {
    val retrofitService: WeatherAPI by lazy {
        retrofit.create(WeatherAPI::class.java)
    }
}
```

**Pourquoi c'est intéressant** : L'enum interne `DAYS` sert de discriminateur dans le `HomeViewModel` pour choisir l'endpoint. Les paramètres par défaut des queries Kotlin rendent l'appel concis côté ViewModel. Le singleton `WeatherApiManager` via `lazy` garantit une seule instance Retrofit.

---

### 2. Modèle météo – mapping WMO Weather Code → icônes

**Fichier** : `app/src/main/java/com/sr_71/meteo/model/Weather.kt` (extrait)

```kotlin
enum class WeatherCode(val code: Int) {
    CLEAR_SKY(0),
    MAINLY_CLEAR_SKY(1),
    PARTLY_CLOUDY(2),
    OVERCAST(3),
    FOG(45),
    DRIZZLE_LIGHT(51),
    RAIN_LIGHT(61),
    SNOW_LIGHT(71),
    THUNDERSTORM_HEAVY_WITH_HAIL(99);
    // ... 27 codes au total

    companion object {
        infix fun from(value: Int): WeatherCode? =
            WeatherCode.values().firstOrNull { it.code == value }
    }
}

data class WeatherImg(
    @DrawableRes val day: Int,
    @DrawableRes val night: Int? = null
)

val weatherCodeToImg = mapOf<WeatherCode, WeatherImg>(
    WeatherCode.CLEAR_SKY to WeatherImg(
        R.drawable.day_clear,
        R.drawable.night_half_moon_clear,
    ),
    WeatherCode.PARTLY_CLOUDY to WeatherImg(
        R.drawable.day_partial_cloud,
        R.drawable.night_half_moon_partial_cloud,
    ),
    WeatherCode.RAIN_HEAVY to WeatherImg(
        R.drawable.rain,
    ),
    // ... mapping complet pour les 27 codes
)
```

**Pourquoi c'est intéressant** : L'API Open-Meteo utilise les codes météo standardisés WMO (0 à 99). Le mapping vers des drawables distincts jour/nuit est exhaustif et type-safe grâce à l'enum. Le champ `night` optionnel (`Int?`) permet de gérer les cas où une seule icône suffit (ex. brouillard, orage violent). L'opérateur `infix fun from` rend la lecture fluide : `WeatherCode from code`.

---

### 3. HomeViewModel – logique métier et gestion de la localisation

**Fichier** : `app/src/main/java/com/sr_71/meteo/view_model/HomeViewModel.kt`

```kotlin
class HomeViewModel : ViewModel() {
    private val _weatherDaily = MutableLiveData<Weather>()
    val weatherDaily: LiveData<Weather>
        get() = _weatherDaily

    private val _weatherHourly = MutableLiveData<Weather>()
    val weatherHourly: LiveData<Weather>
        get() = _weatherHourly

    private val _location = MutableLiveData<Pair<Double, Double>>()
    val locationGps: LiveData<Pair<Double, Double>>
        get() = _location

    private val _isDay = MutableLiveData<Boolean>()
    val isDay: LiveData<Boolean>
        get() = _isDay

    fun weather(
        longitude: Double,
        latitude: Double,
        weather: WeatherAPI.DAYS = WeatherAPI.DAYS.ONE
    ) {
        viewModelScope.launch {
            if (weather == WeatherAPI.DAYS.ONE) {
                WeatherApiManager.retrofitService.getNowWheater(
                    longitude = longitude.toString(),
                    latitude = latitude.toString()
                ).let {
                    val gson = com.google.gson.Gson()
                    val parsed = gson.fromJson(it, Weather::class.java)
                    _weatherHourly.value = parsed
                    _isDay.value = parsed.hourly?.is_day?.get(getTime()) == 1
                }
            } else {
                WeatherApiManager.retrofitService.getWheaterTenDays(
                    longitude = longitude.toString(),
                    latitude = latitude.toString()
                ).let {
                    val gson = com.google.gson.Gson()
                    _weatherDaily.value = gson.fromJson(it, Weather::class.java)
                }
            }
        }
    }

    private fun getTime(): Int {
        val utc_date_time = LocalDateTime.now(ZoneId.of("UTC"))
        val offset = _weatherHourly.value?.utc_offset_seconds?.div(3600)
        val date_in_country = offset?.let { utc_date_time.plusHours(it.toLong()) }
        return date_in_country?.hour ?: 0
    }
}
```

**Pourquoi c'est intéressant** : Le ViewModel centralise toute la logique de récupération et d'exposition des données. La méthode `getTime()` est particulièrement remarquable : elle calcule l'heure locale du lieu consulté à partir du décalage UTC retourné par l'API, permettant de déterminer `isDay` pour n'importe quel fuseau horaire. La séparation `_location` (privée, mutable) / `locationGps` (publique, immutable) suit la convention LiveData recommandée par Google.

---

### 4. NavHostFragment – GPS, persistance, thème dynamique

**Fichier** : `app/src/main/java/com/sr_71/meteo/view/fagments/NavHostFragment.kt` (extrait)

```kotlin
class NavHostFragment : Fragment() {
    val _viewModel: HomeViewModel by activityViewModels()
    private lateinit var _binding: FragmentNavHostBinding

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        _binding.gpsButton.setOnClickListener { getLocation() }

        _binding.txt.setOnClickListener {
            val action =
                NavHostFragmentDirections.actionNavHostFragmentToSearchCityFragment()
            findNavController().navigate(action)
        }

        // Restauration de la dernière position depuis SharedPreferences
        val sharedPref = activity?.getSharedPreferences("weather", AppCompatActivity.MODE_PRIVATE)
        sharedPref?.run {
            val city = getString("city", "Paris")
            val longitude = getString("longitude", "0.0")!!.toDouble()
            val latitude = getString("latitude", "0.0")!!.toDouble()
            if (_viewModel.locationGps.value == null) {
                _viewModel.setLocation(Pair(latitude, longitude))
                _binding.txt.text = city
            }
        }

        // Thème dynamique jour/nuit
        _viewModel.isDay.observe(viewLifecycleOwner) {
            requireActivity().findViewById<FrameLayout>(R.id.background).background =
                if (it) activity?.getDrawable(R.drawable.gradient_main_page_day)
                else activity?.getDrawable(R.drawable.gradient_main_page_night)
            activity?.window?.statusBarColor =
                if (it) Color.parseColor("#2196F3") else Color.parseColor("#FF445667")
        }
    }

    private fun getCityName(lat: Double, long: Double): String {
        val geoCoder = context?.let { Geocoder(it, Locale.getDefault()) }
        val address = geoCoder?.getFromLocation(lat, long, 1)
        if (address != null && address.size > 0) {
            return address[0].locality ?: address[0].subAdminArea ?: address[0].adminArea
        }
        return "Unknown"
    }

    private fun saveDate(city: String, longitude: Double, latitude: Double) {
        requireContext().getSharedPreferences("weather", AppCompatActivity.MODE_PRIVATE)?.edit {
            putString("city", city)
            putString("longitude", longitude.toString())
            putString("latitude", latitude.toString())
        }
    }
}
```

**Pourquoi c'est intéressant** : Ce fragment est le chef d'orchestre de l'écran principal. Il gère la restauration de position via `SharedPreferences` (ville par défaut : Paris), le reverse-geocoding avec `Geocoder` pour afficher le nom de la ville, et le changement de thème dynamique. L'utilisation de la delegation `by activityViewModels()` garantit un seul `HomeViewModel` partagé entre tous les fragments de l'activité.

---

### 5. Recherche de ville avec auto-complétion

**Fichier** : `app/src/main/java/com/sr_71/meteo/view/fagments/SearchCityFragment.kt`

```kotlin
class SearchCityFragment() : Fragment(), AdapterCityOnClick {
    private var _citySearchViewModel = CitySearchViewModel()
    val _viewModel: HomeViewModel by activityViewModels()
    private lateinit var _binding: FragmentSearchCityBinding

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        _binding.cityTextEdit.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {}
            override fun onTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
                if (p0.isNullOrBlank()) return
                _citySearchViewModel.searchCity(p0.toString())
            }
            override fun afterTextChanged(p0: Editable?) {}
        })

        _citySearchViewModel.city.observe(viewLifecycleOwner) {
            if (recyclerView.adapter == null) {
                recyclerView.adapter = SearchCityAdapter(
                    _citySearchViewModel.city.value ?: Citys(), this
                )
            } else {
                val adapter = recyclerView.adapter as SearchCityAdapter
                adapter.city = _citySearchViewModel.city.value ?: Citys()
                adapter.notifyDataSetChanged()
            }
        }
    }

    override fun onClick(loc: Pair<Double, Double>) {
        _viewModel.setLocation(loc)
        findNavController().popBackStack()
    }
}
```

**Pourquoi c'est intéressant** : Le pattern `TextWatcher` → appel API → `LiveData` observée illustre un flux réactif simple. La recherche est déclenchée à chaque frappe. Le callback `AdapterCityOnClick` implémenté par le fragment permet de communiquer la ville sélectionnée au `HomeViewModel` partagé, puis de revenir à l'écran principal via `popBackStack()`.

---

### 6. Navigation Safe Args – passage d'objet Weather entre fragments

**Fichier** : `app/src/main/res/navigation/nav_graph.xml`

```xml
<fragment
        android:id="@+id/dailyDetailWeatherFragment"
        android:name="com.sr_71.meteo.view.fagments.DailyDetailWeatherFragment"
        android:label="fragment_daily_detail_weather"
        tools:layout="@layout/fragment_daily_detail_weather">
    <argument
            android:name="position"
            app:argType="integer"
            android:defaultValue="0" />
    <argument
            android:name="weather"
            app:argType="com.sr_71.meteo.model.Weather" />
    <argument
            android:name="dayString"
            app:argType="string" />
</fragment>
```

**Fichier** : `app/src/main/java/com/sr_71/meteo/view/adapters/DailyWeatherAdapter.kt` (extrait)

```kotlin
holder.view.setOnClickListener {
    val action = NavHostFragmentDirections
        .actionNavHostFragmentToDailyDetailWeatherFragment(
            weather, holder.day.text.toString(), position
        )
    holder.view.findNavController().navigate(action)
}
```

**Pourquoi c'est intéressant** : Le plugin Safe Args génère la classe `NavHostFragmentDirections` à partir du graphe XML, offrant une navigation typesafe. L'objet `Weather` (Parcelable) est passé directement en argument, évitant les clés string error-prone et garantissant la compatibilité à la compilation.

## Qualité, sécurité, maintenance

### Tests
Le projet contient les tests Android par défaut (`ExampleUnitTest`, `ExampleInstrumentedTest`) sans couverture métier réelle. Il n'y a pas de tests unitaires pour les ViewModels, les adapters ou les parsers.

### Lint / Format
Aucune configuration de lint ou de formatage personnalisée n'est présente (pas de `detekt.yml`, `lint.xml` ou `editorconfig`). Le style Kotlin suit les conventions officielles (`kotlin.code.style=official` dans `gradle.properties`).

### CI/CD
Aucun pipeline CI/CD n'est configuré (pas de `.github/workflows`, `GitLab CI`, etc.).

### Gestion d'erreurs
Les appels réseau dans les ViewModels ne sont pas encapsulés dans des blocs `try/catch`. Une erreur réseau ou un parsing JSON défectueux provoquerait un crash silencieux de la coroutine. Aucun mécanisme de retry ni d'état d'erreur n'est exposé à l'UI.

### Sécurité
- **Clé API Geoapify codée en dur** dans `GeoapifyAPI.kt` (paramètre `apiKey` de la requête). Cette clé est visible dans le code source et sera incluse dans l'APK. La pratique recommandée serait de la stocker dans `BuildConfig` via `local.properties` ou un keystore sécurisé.
- Les permissions `ACCESS_FINE_LOCATION` et `ACCESS_COARSE_LOCATION` sont déclarées ; la demande d'autorisation est gérée à l'exécution.
- `isMinifyEnabled = false` en release : le code n'est pas obfusqué ni minifié.

### Logs
Des `println()` sont dispersés dans le code (ex. `DailyWeatherAdapter`, `SearchCityFragment`, `NavHostFragment`). Ils seront visibles en production et pourraient fuir des informations.

## Installation et exécution (local)

**Prérequis** :
- Android Studio (Flamingo ou supérieur)
- JDK 8+
- SDK Android : `compileSdk = 34`, `minSdk = 26` (Android 8.0 Oreo)

**Étapes** :

```bash
# 1. Cloner le dépôt
git clone https://github.com/Sudo-Rahman/kotlin-meteo.git
cd kotlin-meteo

# 2. Ouvrir dans Android Studio
# File → Open → sélectionner le dossier kotlin-meteo

# 3. Laisser Gradle synchroniser les dépendances

# 4. Brancher un appareil Android (API 26+) ou utiliser l'émulateur

# 5. Run → Run 'app'
```

**En ligne de commande** :

```bash
./gradlew assembleDebug       # Build debug APK
./gradlew installDebug        # Build + install sur appareil connecté
```

> **Note** : L'application nécessite une connexion internet active pour fonctionner. Pour la recherche GPS, un appareil physique avec capteur de localisation est recommandé.

## Liens

- **GitHub** : [https://github.com/Sudo-Rahman/kotlin-meteo](https://github.com/Sudo-Rahman/kotlin-meteo)
- **API Open-Meteo** : [https://open-meteo.com/](https://open-meteo.com/)
- **API Geoapify** : [https://www.geoapify.com/](https://www.geoapify.com/)
