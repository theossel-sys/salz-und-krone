# Salz & Krone – Prompts für Karte und Cockpit (Draw Things)

Gleiche Grundregeln wie in `PROMPTS.md`: ein Modell für alles, feste Seed, Dateinamen genau wie unten,
fertige Bilder nach `art/incoming/`, dann `python3 tools/import_art.py`, committen, pushen.
Freizustellende Bilder auf magentafarbenem Hintergrund (#FF00FF) erzeugen oder selbst freistellen (PNG mit Transparenz).

---

## 1. Die Seekarte (Bild-zu-Bild mit Vorlage!)

Die Karte muss **genau** zu den Stadtpositionen im Spiel passen. Deshalb:

1. In Draw Things **`art/guide/map_guide.png`** (1600 × 1024) als Ausgangsbild laden (Bild-zu-Bild / img2img).
   `art/guide/map_guide_staedte.png` zeigt nur zur Kontrolle, wo die Städte liegen – **nicht** als Vorlage verwenden.
2. Größe **1600 × 1024**, **Stärke (Strength) 55–65 %**: hoch genug für Malerei, niedrig genug, dass die
   **Küstenlinien an derselben Stelle bleiben**. Ergebnis mit der Vorlage vergleichen; verschobene Küsten → Stärke senken.
3. Optional ControlNet „Canny“ oder „Lineart“ mit derselben Vorlage, dann darf die Stärke höher sein (70–80 %).

| Datei | Prompt |
|---|---|
| `map_base.png` | antique hand-painted nautical chart of the North Sea and Baltic Sea, 15th century portolan map style, land painted as aged warm parchment with fine ink hatching along every coastline, small hand-drawn hills, forests and fields as tiny ink illustrations inland, sea painted in muted teal-blue watercolor with fine engraved wave lines, a few small sailing ships and a sea serpent in the open North Sea, soft vignette, top-down map view |
| `map_winter.png` *(optional)* | same chart in winter: snow dusting the land, the northern and eastern Baltic sea covered with pale ice floes, cold grey-blue water, frosty atmosphere, top-down map view |

**Negativ-Prompt für die Karten:**
> text, letters, labels, city names, writing, compass rose, cartouche, frame, border, grid lines, roads, modern map,
> satellite photo, 3d, perspective

Wichtig: **keine Schrift, keine Städte, keine Windrose** – Namen, Städte, Schiffe und Windrose zeichnet das Spiel darüber.

---

## 2. Cockpit (Oberfläche)

**Stil-Zusatz für Icons und Zierelemente:**
> , hand-painted medieval illustration, watercolor and ink, warm muted colors, gold leaf accents, clean bold silhouette,
> game UI icon, single object centered, isolated on a solid pure magenta background (#FF00FF), no shadow

**Negativ-Prompt:**
> text, letters, watermark, logo, signature, frame, border, multiple objects, cropped, photo, 3d render, modern objects,
> white background, gradient background

### Navigation (untere Leiste / linke Leiste am Desktop)

| Datei | Prompt |
|---|---|
| `tab_karte.png` | a rolled-out antique sea chart with a small ship drawn on it, edges slightly curled |
| `tab_flotte.png` | a small medieval cog ship with a square sail, front three-quarter view |
| `tab_markt.png` | ornate brass merchant balance scales with two pans |
| `tab_lehen.png` | a small medieval stone manor house with a tower and a red roof on a grassy hill |
| `tab_reich.png` | a golden royal crown with red gems on a small velvet cushion |

### Anzeigen in der Kopfzeile

| Datei | Prompt |
|---|---|
| `ico_gold.png` | a small pile of shiny medieval gold coins |
| `ico_ansehen.png` | a golden laurel wreath around a red wax seal |
| `ico_zug.png` | an antique brass hourglass with golden sand |
| `ico_musik.png` | a small medieval lute |
| `ico_hilfe.png` | an old leather-bound book with a brass clasp |

### Karten-Zierelemente

| Datei | Prompt |
|---|---|
| `map_rose.png` | ornate antique compass rose, 16 points, red and gold, fine ink lines, circular, flat top-down |
| `map_cartouche.png` | an empty decorative baroque scroll banner cartouche for a map title, parchment ribbon with curled ends, empty center, no text, wide horizontal composition |
| `map_serpent.png` | a coiled sea serpent rising from waves, antique map illustration style, ink and watercolor |
| `city_marker.png` | a tiny medieval town emblem: a red brick gate tower with a pointed roof, icon, front view |

### Flächen (mit Hintergrund, **nicht** freistellen)

Zusatz statt „isolated on magenta“: `, seamless tileable texture, flat lighting, top-down, no objects`

| Datei | Größe | Prompt |
|---|---|---|
| `ui_wood.png` | 1024 × 1024 | dark polished oak wood panel texture with fine grain, warm brown, subtle wear |
| `ui_parchment.png` | 1024 × 1024 | aged parchment paper texture, warm cream color, subtle stains and fibers, soft and even |
| `ui_leather.png` | 1024 × 1024 | dark brown tooled leather texture with subtle embossed pattern, book cover |
