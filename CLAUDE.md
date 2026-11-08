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
- Ideen für später: Konvois/Kapitäne, Hansetage/Belagerungen, Heirat & Erbfolge, Musik/SFX, bessere Grafiken,
  KI-Schwierigkeitsstufen.
