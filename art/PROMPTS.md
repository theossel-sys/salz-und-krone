# Salz & Krone – Prompts für Draw Things

## So geht's
1. **Modell:** FLUX.1 (schnell oder dev) oder ein SDXL-Modell (z. B. *Juggernaut XL*). Für alle Bilder **dasselbe Modell**.
2. **Einstellungen:** 1024 × 1024 (Porträts 832 × 1024, Titelbilder 1344 × 768 bzw. 768 × 1344),
   FLUX schnell 4–6 Schritte / SDXL 25–30 Schritte, CFG 4–6. Eine **feste Seed** hält den Stil einheitlich.
3. Prompt **plus Stil-Zusatz**, Negativ-Prompt immer gleich. Pro Bild 2–4 Varianten, die beste nehmen.
4. Speichern als PNG mit dem **Dateinamen aus der Liste**.
5. Hochladen nach **`art/incoming/`** im Repo `salz-und-krone` („Add file → Upload files“) – oder hier im Chat schicken.
   Freistellen, Zuschneiden und Einbauen übernehme ich.

**Stil-Zusatz für Icons, Bauten und Schiffe:**
> , hand-painted medieval illustration, watercolor and ink on aged parchment style, warm muted colors, clean bold
> silhouette, game icon, single object centered, isolated on a solid pure magenta background (#FF00FF), no shadow

**Negativ-Prompt (immer):**
> text, letters, watermark, logo, signature, frame, border, multiple objects, cropped, photo, 3d render, modern objects,
> white background, gradient background

## Waren (Icons)

| Datei | Prompt |
|---|---|
| `good_getreide.png` | a tied linen sack overflowing with golden wheat grain, a few wheat ears on top |
| `good_holz.png` | a neat stack of three cut timber logs bound with rope |
| `good_bier.png` | a wooden beer tankard with frothy foam and iron bands |
| `good_salz.png` | a small wooden bowl heaped with coarse white salt crystals, a linen salt sack behind it |
| `good_hering.png` | two silver herrings crossed over each other, glistening scales |
| `good_eisen.png` | three dark iron ingots stacked, a small blacksmith hammer leaning on them |
| `good_tuch.png` | a rolled bolt of fine dyed cloth in deep red and blue, slightly unrolled |
| `good_wein.png` | a small oak wine barrel with a clay wine jug and a bunch of dark grapes |
| `good_pelze.png` | a folded bundle of luxurious red fox and sable furs tied with a leather strap |

## Bauten

| Datei | Prompt |
|---|---|
| `bld_muehle.png` | a medieval wooden windmill on a small grassy mound, four sails, northern German style |
| `bld_speicher.png` | a tall medieval brick warehouse with a stepped gable and a hoist beam at the top |
| `bld_markt.png` | a small medieval market square with wooden stalls, awnings and a stone well |
| `bld_kirche.png` | a red brick gothic parish church with a single pointed spire, Hanseatic style |
| `bld_mauer.png` | a section of medieval red brick city wall with a round defensive tower and battlements |
| `bld_dom.png` | a grand red brick gothic cathedral with two tall green copper spires, Hanseatic brick gothic |

## Schiffe (Seitenansicht, nach rechts fahrend)

| Datei | Prompt |
|---|---|
| `ship_schnigge.png` | a small fast medieval single-masted sailing boat, low narrow hull, one square sail, side view sailing to the right |
| `ship_kogge.png` | a medieval Hanseatic cog ship, round high wooden hull, single mast with a large square sail, castles at bow and stern, side view sailing to the right |
| `ship_holk.png` | a large medieval hulk merchant ship, bulky curved hull, two masts with square sails, high stern castle, side view sailing to the right |

## Porträts (mit Hintergrund, Stil-Zusatz ohne den Hintergrund-Teil)

| Datei | Prompt |
|---|---|
| `portrait_mechthild.png` | portrait of a wise elderly merchant woman in 14th century northern Germany, white linen wimple, dark wool dress with a silver brooch, kind but determined eyes, candlelit study with ledgers behind her, painted portrait, warm candle light |
| `portrait_johan.png` | portrait of a weathered middle-aged Hanseatic sea merchant captain, short grey beard, fur-trimmed coat, standing on a ship deck in grey sea weather, painted portrait |

## Titelbilder (mit Hintergrund)

| Datei | Prompt |
|---|---|
| `title.png` (1344 × 768) | panoramic painting of a medieval Hanseatic harbor city at dawn, red brick gothic churches and stepped gables, cog ships with square sails in the harbor, warm golden light over the Baltic sea, seagulls, epic and peaceful, empty sky in the upper third for a title |
| `title_portrait.png` (768 × 1344) | the same scene as a vertical composition: a single cog ship with a large square sail in the foreground, the brick gothic harbor city behind, sunrise sky in the upper half for a title |

Negativ-Prompt für Porträts und Titelbilder: `text, letters, watermark, logo, signature, frame, border, modern objects`
