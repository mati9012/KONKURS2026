Czarcia Łapa: Wyprawa przez Lubelskie
4 lis 2026 · @mati90
Koncepcja w skrócie
Interaktywna gra przygodowa w przeglądarce. Województwo lubelskie jest pokazane jako unosząca się w powietrzu wyspa 3D w stylu low-poly. Każde miejsce na mapie to osobny, krótki poziom związany z prawdziwą legendą, zabytkiem albo tradycją regionu.
Pomysł spełnia od razu kilka punktów regulaminu: interaktywną mapę, grę edukacyjną, escape room i wirtualnego przewodnika. Ma też fabułę, dzięki której jury zapamięta projekt.
Fabuła (haczyk)
Pomysł wyrasta z lubelskiej legendy o Czarciej Łapie. Według niej w 1637 roku w Trybunale Koronnym diabły wydały sprawiedliwszy wyrok niż ludzcy sędziowie, a na blacie stołu został odcisk diabelskiej łapy.
W grze diabeł wraca i kradnie „duszę” regionu: ukrywa siedem jego skarbów. Gracz przemierza województwo, zdobywa pieczęcie w Paszporcie Lubelskim i na końcu wraca do Trybunału na finałową „rozprawę”. Jest nią quiz z całej wyprawy, a wyrok zależy od wyniku.
Mapa 3D (ekran główny)
• Granice województwa i powiatów są wyciągnięte w 3D z danych GeoJSON. Widać na nich Wisłę, Bug, lasy Roztocza i Polesia oraz miniaturowe modele zabytków.
• Kamera płynnie przelatuje do wybranego miejsca.
• Cykl dnia i nocy oraz lekka mgła nad rzekami dają efekt „wow” od pierwszej sekundy.
• Odwiedzone miejsca „zapalają się”, więc widać postęp na mapie.
Poziomy
Każdy poziom ma inną mechanikę, żeby gra nie była powtarzalna.
Miejsce
Mini-gra
Czego uczy
Zamość
Układasz „miasto idealne” według planu Bernarda Morando: pałac jako głowa, główna ulica jako kręgosłup, rynek, bastiony
Renesans, Jan Zamoyski, wpis na listę UNESCO
Lublin
Odsłaniasz freski w Kaplicy Trójcy Świętej (latarka i pędzel) i szukasz ukrytych scen
Połączenie sztuki Wschodu i Zachodu, Unia Lubelska
Chełm
Schodzisz do podziemi kredowych w ciemności, z latarką, a za plecami straszy Bieluch
Kopalnia kredy, legenda o Bieluchu
Kazimierz Dolny
Piekarnia: pieczesz kogutki na czas
Tradycja kogutków, spichlerze, wąwozy lessowe
Roztocze
Nocny las: tropisz koniki polskie po dźwiękach i śladach, znajdujesz Szumy
Przyroda, Roztoczański Park Narodowy
Biłgoraj
Plecenie sita (gra rytmiczno-wzorcowa)
Sitarstwo jako ginące rzemiosło
Kuchnia
Składasz cebularza i pierogi biłgorajskie według receptury
Produkty regionalne
Do tego dochodzi poziom bonusowy „Moje miejsce”: twoja miejscowość albo okolica, z której pochodzisz. Regulamin wprost to punktuje, więc warto zrobić z niego mocny, osobisty akcent.
Element „okiem AI”
AI ma być widoczne w projekcie, a nie tylko w tytule.
• Przewodnik: Lubelski Kozioł (kozioł z herbu Lublina) w roli narratora. Jego dialogi możesz napisać z pomocą AI, a głos wygenerować przez TTS.
• Tryb „Zapytaj Kozła”: gotowa, zweryfikowana baza pytań i odpowiedzi z wyszukiwaniem. Działa bez klucza API, więc nic nie wysypie się jury.
• W README tabelka „Jak użyłem AI” (kod, tekstury, pomysły, głos) oraz osobna „Weryfikacja faktów”: każda ciekawostka ze źródłem, np. strona muzeum, UNESCO albo gminy. Regulamin wymaga samodzielnej weryfikacji informacji, a taka tabelka to udowadnia.
Stack technologiczny
• Next.js (output: 'export') jako statyczna strona na Vercel albo GitHub Pages, czyli link plus zip, zgodnie z wymogami.
• React Three Fiber + drei (sceny, kamera, Html), do tego d3-geo do zamiany GeoJSON na kształty 3D.
• Zustand do stanu gry, localStorage do zapisu paszportu.
• Framer Motion do interfejsu, Howler do dźwięku, Tailwind.
• Modele w GLB z kompresją Draco, instancing dla drzew i domków.
• Na telefonie automatycznie niższa jakość grafiki (wymóg „działa na telefonie”). Można też dodać PWA.
Plan realizacji i film
Najpierw dopracuj jeden poziom do perfekcji, potem dodawaj kolejne. Trzy świetne poziomy wypadną lepiej niż siedem przeciętnych.

1. MVP: mapa 3D, przelot kamery, paszport, 3 poziomy (Zamość, Chełm, Lublin) i finałowy quiz.
2. Rozbudowa: pozostałe poziomy, narrator, dźwięk, poziom „Moje miejsce”.
3. Szlif: wersja mobilna, README, tabelka źródeł, screenshoty i film.
   Film na YouTube (1,5–2 min): zacznij od przelotu nad wyspą, pokaż po kilka sekund z każdej mini-gry, na koniec finał w Trybunale i paszport z pieczęciami. Dobrze, żeby jedno ujęcie było nagrane na telefonie.
