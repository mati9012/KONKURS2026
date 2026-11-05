# Czarcia Łapa: Wyprawa przez Lubelskie

Interaktywna gra przygodowa 3D w przeglądarce. Województwo lubelskie jako unosząca się wyspa low-poly, a każde miejsce to krótki poziom oparty na prawdziwej legendzie, zabytku albo tradycji regionu.

## Uruchomienie

Wymagany Node.js 22+ i pnpm (`corepack enable pnpm`).

```bash
pnpm install
pnpm dev
```

Statyczny build trafia do `out/`:

```bash
pnpm build
```

Dla GitHub Pages ustaw `NEXT_PUBLIC_BASE_PATH=/KONKURS2026` przed buildem.

## Dane mapy

| Dane                                                                   | Źródło                                                                                                                                                       | Licencja                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Granica województwa lubelskiego                                        | Państwowy Rejestr Granic (GUGiK), plik GeoJSON z repozytorium [ppatrzyk/polska-geojson](https://github.com/ppatrzyk/polska-geojson), uproszczony w mapshaper | dane PRG udostępniane bez opłat |
| Rzeki: Wisła, Wieprz, Bystrzyca, Tanew, Krzna, Huczwa, Tyśmienica, Por | © autorzy [OpenStreetMap](https://www.openstreetmap.org/copyright)                                                                                           | ODbL                            |
| Bug                                                                    | wyznaczony z granicy województwa, która biegnie nurtem rzeki                                                                                                 | jak granica                     |

Rzeźba terenu, lasy i jeziora są przybliżone ręcznie na podstawie głównych krain (Roztocze, Wyżyna Lubelska, Polesie).

## Jak użyłem AI

| Obszar                | Narzędzie   | Zakres |
| --------------------- | ----------- | ------ |
| Kod                   | Claude Code |        |
| Tekstury i ilustracje |             |        |
| Głos Kozła            |             |        |
| Pomysły i dialogi     |             |        |

## Weryfikacja faktów

| Fakt | Źródło |
| ---- | ------ |
