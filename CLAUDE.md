# Projektkontext für Claude

Sprache: immer auf Deutsch antworten.

## Projekt
**Salz & Krone** – eigenes rundenbasiertes Handels- und Aufbauspiel (Genre der 80er-Wirtschaftssimulationen
wie „Hanse“ und „Kaiser“, die der User liebte). WICHTIG: kein Nachbau dieser Spiele – eigene Welt, Regeln,
Zahlen, Texte, Ränge und Grafik.

- Reines HTML/CSS/JS ohne Build: `index.html`, `style.css`, `engine.js` (Logik, auch in Node), `ui.js` (Oberfläche)
- Spielstand im `localStorage` (Schlüssel `salz-und-krone-v1`)
- Balancing-Test: `node tests/sim.js <seeds> <jahre>` (4 KI gegeneinander)
- Ziel-Plattform: iPhone/iPad (Safari, Home-Bildschirm) und Desktop; Live über GitHub Pages
  https://theossel-sys.github.io/salz-und-krone/

## Entscheidungen des Users
Handel + Herrschaft kombiniert · Hot-Seat 1–4 Spieler + Computergegner · modern-illustrierter Stil · eigenes Repo.

## Verlauf
- 2026-11-08: v0.1 (entstanden im Repo Dragon-Trader, hierher umgezogen). 10 Hansestädte, 9 Waren,
  Schnigge/Kogge/Holk, Kontore, Lehen (Land, Volk, Getreide, Steuern, Herbst-Jahresabschluss), 6 Bauten, Fehde,
  8 Ränge Krämer→Reichsfürst, Zufallsereignisse, Winter-Vereisung. Zugreihenfolge rotiert jede Runde.
- v0.2 (Wunsch: mehr Story, Intro, Audio, schönere Karte): Intro-Animation (Sonnenaufgang, segelnde Kogge, Texttafeln),
  story.js (Prolog-Brief von Großmutter Mechthild, Kapitel je Rang, Neujahrsbriefe, Wendepunkte: erster Auftrag,
  Schiffbruch, Schulden, Hunger, Mechthilds Tod/Erbe im 7. Jahr, Dom, Epilog; Rivale = stärkstes anderes Haus),
  Aufträge der Stadträte (engine: offer/quest/deliverQuest), audio.js (generative Musik D-Dorisch, Meeresrauschen,
  SFX; an/aus), Karte animiert (Wellen, Glitzern, Möwen, schaukelnde Schiffe, Flaggen), Seerouten um Skagen/Sund
  (SK.route), Losschicken mit Zielschildern (Reisezeit + Erlös, bestes Ziel gold), Schiff gleitet los.
- Windrose steht still (User-Wunsch). Design-Leinwand „Salz & Krone – Design“ (Claude Design, privat):
  https://claude.ai/artifact/H9T3tz9jWMQ3jLsWUgyKMG – Stil „Hansekontor“ (Pergament #F4EAD3, Tinte #2A1E14,
  Messing #E0B24A, Siegelrot #9A2B1E, Tiefsee #1F4E63; Cinzel + Crimson Pro). Artboards: Desktop-Karte mit
  linker Navigationsleiste, Markt iPhone (Kaufen/Verkaufen-Umschalter, Stepper, Abschlussleiste), Story-Brief,
  Titel. Noch NICHT ins Spiel übernommen – wartet auf Feedback des Users.
- Ideen für später: Konvois/Kapitäne, Hansetage/Belagerungen, Heirat & Erbfolge, Musik/SFX, bessere Grafiken,
  KI-Schwierigkeitsstufen.
