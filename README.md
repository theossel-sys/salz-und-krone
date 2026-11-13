# Salz & Krone

Ein rundenbasiertes Handels- und Aufbauspiel im Browser: Handle mit Salz, Hering, Tuch und Pelzen zwischen den
Hansestädten von Brügge bis Reval, kaufe Land, versorge dein Volk, errichte Bauten und steige vom **Krämer** zum
**Reichsfürsten** auf. 1–4 Spieler abwechselnd an einem Gerät, freie Plätze übernimmt der Computer.

Inspiriert vom Genre der klassischen Wirtschaftssimulationen der 80er Jahre; Spielwelt, Regeln, Zahlen, Texte und
Grafik sind eigenständig.

## Spielen
`index.html` über einen Webserver öffnen (z. B. `python3 -m http.server`), oder über GitHub Pages.
Auf iPhone/iPad: in Safari „Teilen → Zum Home-Bildschirm“.

## Geschichte
Dein Vater Johan ist mit seiner Flotte auf See geblieben; geblieben sind dir eine alte Kogge, ein kleines Gut und
1.200 Gulden. Deine Großmutter Mechthild schreibt dir Briefe, Stadträte vergeben Aufträge, und jeder Rangaufstieg
öffnet ein neues Kapitel – bis zum Epilog. Ein kurzes Intro erzählt den Anfang.

## Regeln in Kürze
- **Runde = Jahreszeit.** Jeder Spieler macht seinen Zug, dann vergeht eine Jahreszeit. Die Zugreihenfolge rotiert.
- **Handel:** Jede Stadt erzeugt Waren (billig) und fragt andere nach (teuer). Jeder Kauf treibt den Preis, jeder
  Verkauf drückt ihn – große Mengen lohnen sich nur auf verschiedenen Märkten.
- **Schiffe:** Schnigge (klein, schnell), Kogge, Holk (groß, robust). Stürme und Seeräuber; bewaffnete Schiffe
  sind sicherer. Im Winter frieren Stockholm, Riga und Reval zu.
- **Kontore** in fremden Städten: Lager und Handel ohne Schiff.
- **Lehen:** Land braucht Leute (3 Morgen je Bauer), Leute brauchen Getreide (0,3 Last im Jahr). Im Herbst kommt
  die Ernte, dann verteilst du Getreide und legst die Steuern fest. Satte Untertanen und milde Steuern bringen
  Zuzug und Ansehen.
- **Bauten:** Mühle, Speicher, Marktplatz, Kirche, Stadtmauer, Dom.
- **Fehde:** Mit Soldaten kannst du Rivalen Land und Gold abnehmen – kostet aber Ansehen.
- **Aufstieg:** Krämer → Kaufmann → Ratsherr → Bürgermeister → Landvogt → Graf → Herzog → Reichsfürst.
  Jeder Rang verlangt Vermögen, Ansehen und je nach Stufe Land, Untertanen, Soldaten oder Bauten.
- **Aufträge:** Stadträte bestellen Waren mit Frist – Lohn in Gold und Ansehen, Versäumnis kostet Ruf.
- **Sieg:** Wer zuerst Reichsfürst wird – oder nach Ablauf der Jahre den höchsten Rang und das größte Vermögen hat.

## Technik
- `engine.js` – Spiellogik ohne Oberfläche (läuft auch in Node), `ui.js` – Oberfläche, `style.css`
- `story.js` – Prolog, Kapitel, Briefe, Epilog · `art.js` – Wappen, Schiffe und Stadtsilhouetten, per Code gezeichnet (keine Bilddateien) · `audio.js` – Musik und Geräusche, komplett per Web Audio erzeugt (keine Audiodateien)
- Spielstand automatisch im `localStorage`
- Test: `node tests/sim.js 5 25` lässt 4 Computergegner 25 Jahre gegeneinander spielen (Balancing)
