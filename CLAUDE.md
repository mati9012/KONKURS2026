@AGENTS.md

# Czarcia Łapa: zasady tworzenia aplikacji

Gra przygodowa 3D po województwie lubelskim na konkurs. Koncepcja, poziomy i kolejność prac są w [PLAN.md](PLAN.md). Ten plik opisuje, jak piszemy kod i jak wprowadzamy zmiany.

## Stack

| Warstwa     | Narzędzie                                                                    |
| ----------- | ---------------------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, `output: 'export'`) + TypeScript (strict)            |
| Pakiety     | pnpm (zawsze `pnpm`, nigdy `npm` ani `yarn`)                                 |
| 3D          | three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing |
| Fizyka      | @react-three/rapier, dodawana tylko gdy mini-gra jej wymaga                  |
| Mapa        | d3-geo + GeoJSON PRG (GUGiK) uproszczony w mapshaper                         |
| Stan        | Zustand + `persist` (localStorage)                                           |
| Treści      | pliki TS/JSON w `src/content` walidowane przez Zod                           |
| UI          | Tailwind CSS 4, Motion (`motion/react`)                                      |
| Dźwięk      | Howler.js                                                                    |
| Modele      | Blender → GLB, gltfjsx, gltf-transform (Draco, WebP/KTX2)                    |
| Debug (dev) | leva, `StatsGl` z drei (r3f-perf wywraca Turbopack w dev)                    |
| Jakość      | ESLint, Prettier, Playwright, CodeRabbit                                     |

Next.js 16 różni się od tego, co znasz z treningu. Przed użyciem API Next sprawdź `node_modules/next/dist/docs/`.

## Workflow Git

1. **Każda zmiana na nowym branchu** odbitym od aktualnego `main`. Nigdy nie commitujemy bezpośrednio do `main`.
2. Nazwa brancha: `<typ>/<krótki-opis-po-angielsku>`, np. `feat/zamosc-level`, `fix/camera-flyto-mobile`, `chore/setup-project`.
3. Typy: `feat`, `fix`, `refactor`, `perf`, `style`, `content`, `assets`, `test`, `docs`, `chore`, `ci`.
4. Commity w formacie Conventional Commits, po angielsku, w trybie rozkazującym, bez kropki na końcu:
   - `feat(map): add camera fly-to on location select`
   - `content(zamosc): add verified facts about Morando plan`
   - Treść commita (opcjonalnie) wyjaśnia _dlaczego_, nie _co_.
5. Jeden branch = jedna sprawa. Małe, czytelne PR-y. Bez mieszania refaktoru z nową funkcją.
6. Przed pushem musi przejść `pnpm check` (lint, typy, format, build).
7. Push brancha i PR do `main` przez `gh pr create` z szablonem z `.github/pull_request_template.md`. PR przegląda CodeRabbit; uwagi poprawiamy kolejnymi commitami na tym samym branchu.
8. Merge tylko po zielonym CI i przejrzeniu uwag CodeRabbit. Merge typu squash, branch usuwany po merge.

## Zasady kodu

- **Zero komentarzy w kodzie.** Kod ma się tłumaczyć nazwami. Jeśli coś wymaga wyjaśnienia, wydziel funkcję o dobrej nazwie albo opisz to w PR.
- Bez martwego kodu, zakomentowanych fragmentów, `console.log`, `TODO`, `any` i `@ts-ignore`.
- Nazwy w kodzie po angielsku. Teksty widoczne dla gracza po polsku.
- Komponenty: `PascalCase.tsx`, jeden eksportowany komponent na plik, eksporty nazwane (default tylko tam, gdzie wymaga tego Next: `page.tsx`, `layout.tsx`).
- Pozostałe pliki: `kebab-case.ts`.
- Importy przez alias `@/`, `import type` dla typów.
- Formatowanie robi Prettier (bez średników, pojedyncze cudzysłowy, szerokość 100). Nie formatujemy ręcznie.
- Najmniejsza zmiana, która w pełni rozwiązuje zadanie. Bez abstrakcji „na zapas”.

## Struktura

```
src/
  app/                 routing Next (tylko cienkie strony)
  components/
    scene/             wszystko, co renderuje się w <Canvas>
    ui/                HUD, paszport, dialogi (DOM + Tailwind)
  levels/<id>/         kod mini-gier, jeden folder na poziom
  content/             treści gry + schematy Zod
    geo/               granica województwa i rzeki (lon/lat) dla wyspy
  store/               store'y Zustand
  lib/                 czyste funkcje (szum, audio, matematyka)
    three/             ładowanie GLB: modele miejsc, wyspa, materiał wody
public/
  geo/                 uproszczony GeoJSON gotowy do wczytania
  models/              GLB po kompresji
  audio/               muzyka, efekty, głos narratora
data/geo/              surowe dane GUGiK (nie trafiają do builda)
scripts/
  island/              generator bazy wyspy: kształt, rzeki, pola, rozmieszczenie drzew
  blender/             budowa wyspy w Blenderze (teren, roślinność, eksport GLB)
e2e/                   testy Playwright
```

## 3D i wydajność

- Komponenty z `@react-three/*` zawsze w plikach z `'use client'`. Scena ładowana przez `next/dynamic` z `ssr: false`.
- Żadnych alokacji (`new Vector3`, `new Material`) w `useFrame`. Obiekty wielokrotnego użytku trzymamy w `useMemo` lub poza komponentem.
- Powtarzalne obiekty (drzewa, domki) przez instancing.
- Jakość grafiki sterowana przez `settings.quality` w store: `PerformanceMonitor` obniża ją na słabszych urządzeniach, a przy `low` wyłączamy postprocessing i cienie.
- Modele z Tripo: pełne pliki w `assets-src/models/` (poza gitem), wersje webowe w `public/models/` przez `pnpm models:optimize` (meshopt + WebP, budżet trójkątów per rodzaj w `scripts/optimize-models.mjs`). Nazwa pliku = id miejsca z `src/content/places.ts`.
- Wyspa (teren, klify, woda, drzewa, roślinność) to jeden plik `public/models/island.glb` plus lżejszy `island-low.glb`, budowane przez `pnpm island:build`: generator z `scripts/island` → Blender (`scripts/blender/build-island.py`) → `EXT_mesh_gpu_instancing` + meshopt + WebP. Nie edytujemy GLB ręcznie, tylko skrypty. Wymaga Blendera (ścieżka w `BLENDER`, domyślnie `/Applications/Blender.app`).
- Pozycje miejsc i wodospadów przychodzą z wyspy jako puste węzły `place-<id>` i `waterfall-<id>`. Modele miejsc ładujemy osobno przez `useModelAsset`.
- `leva` i `StatsGl` tylko w trybie development. Nie dodawaj `r3f-perf`: wywraca Turbopack w `next dev`.

## Treści i fakty

- Każda ciekawostka, pytanie quizu i odpowiedź Kozła ma co najmniej jedno źródło (`sources`) z URL i datą dostępu. Wymusza to schemat Zod w `src/content/schema.ts`.
- Nie wymyślamy faktów. Treść bez sprawdzonego źródła nie trafia do repo.
- Gra działa bez kluczy API i bez backendu. Żadnych wywołań do zewnętrznych API w czasie działania gry.

## Static export

- Brak API routes, server actions, middleware i dynamicznych tras bez `generateStaticParams`.
- Ścieżki do plików z `public/` budujemy z uwzględnieniem `NEXT_PUBLIC_BASE_PATH` (potrzebne dla GitHub Pages).

## Komendy

```bash
pnpm dev            # serwer deweloperski
pnpm check          # lint + typy + format + build (wymagane przed pushem)
pnpm format         # formatowanie Prettier
pnpm test:e2e       # testy Playwright (desktop + mobile); testy z tagiem @scene CI pomija, bo bez GPU scena się nie wczyta
pnpm build          # statyczny build do out/
pnpm island:build   # przebudowa wyspy w Blenderze do public/models/island*.glb
pnpm koziol:build   # rig i animacje Kozła-narratora z modelu Tripo do public/models/koziol.glb
pnpm zamosc:build   # makieta Zamościa z Blendera do public/models/zamosc-city.glb
```
