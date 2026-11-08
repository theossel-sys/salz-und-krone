/* Salz & Krone – die Geschichte: Prolog, Kapitel, Briefe und Epilog.
 * Figuren: deine Großmutter Mechthild (Ratgeberin), dein verschollener Vater Johan, und als Rivale
 * das jeweils stärkste andere Handelshaus. */
(function (root) {
  'use strict';

  const rival = (S, pl) => S.players.filter(p => p !== pl).sort((a, b) => root.SK.score(S, b) - root.SK.score(S, a))[0];
  const city = pl => root.SK.C[pl.home].name;

  // Intro-Animation: Tafeln für alle
  const INTRO = [
    'Anno Domini 1370.',
    'Die Koggen der Hanse beherrschen die Meere des Nordens – von den Tuchhallen Brügges bis zu den Pelzmärkten von Reval.',
    'Salz macht Hering haltbar, Hering macht Städte reich, und Reichtum kauft Land, Titel – und Macht.',
    'Doch das Meer nimmt, was es gibt.',
  ];

  // Szenen der Story-Karten: Symbol, Titel, Text (Funktionen bekommen Spielstand und Spieler)
  const BEATS = {
    prolog: {
      icon: 'kerze', title: 'Ein Brief zur Nacht',
      text: (S, pl) => [
        `Mein liebes Kind,`,
        `heute vor einem Monat kehrte die Flotte deines Vaters Johan nicht aus ${pl.home === 'bergen' ? 'Reval' : 'Bergen'} zurück. Von sieben Schiffen blieb uns allein die „${pl.ships[0] ? pl.ships[0].name : 'Seeadler'}“ – sie lag zur Ausbesserung im Hafen.`,
        `Unser Haus war einst das erste am Markt von ${city(pl)}. Heute nicken die Ratsherren nur noch höflich, wenn ich vorübergehe. Uns bleiben die alte Kogge, das kleine Gut vor der Stadt und 1.200 Gulden in der Truhe.`,
        `Du bist jung, aber du hast den Kopf deines Großvaters. Kauf, wo das Salz billig ist, verkauf, wo man es braucht. Kauf Land, wenn du kannst – Land geht nicht unter. Und vergiss nie das Volk auf deinem Gut: Ein hungriger Bauer ist ein schlechter Freund.`,
        `Bring unseren Namen zurück zu Ehren.`,
        `— Deine Großmutter Mechthild`,
      ],
      sign: 'Ziel: Steige vom Krämer zum Reichsfürsten auf.',
    },
    auftrag: {
      icon: 'rolle', title: 'Der erste Auftrag',
      text: () => [
        `Ein Bote mit dem Siegel eines fremden Stadtrates klopft an deine Tür. Die Räte der Hansestädte vergeben Lieferaufträge an Kaufleute, denen sie trauen – gut bezahlt und gut für den Ruf.`,
        `„Wer pünktlich liefert, dem öffnen sich die Türen der Rathäuser“, sagt Mechthild. „Wer es nicht tut, über den spricht man in jeder Schänke zwischen Brügge und Reval.“`,
      ],
      sign: 'Angenommene Aufträge findest du auf der Karte. Abgeliefert wird im Markt der Zielstadt.',
    },
    erbe: {
      icon: 'kerze', title: 'Mechthilds letzter Wille',
      text: (S, pl) => [
        `In der Nacht zum Frühjahr ist deine Großmutter Mechthild still eingeschlafen. Die halbe Stadt ${city(pl)} folgt dem Sarg – mehr Menschen, als dein Haus in den Jahren der Not Freunde hatte.`,
        `Der Notar verliest ihr Testament: 1.500 Gulden, die sie heimlich beiseitegelegt hatte, und ihr Siegelring. Auf einem Zettel in ihrer krummen Schrift steht:`,
        `„Ich habe gesehen, was du aus dem Wrack gemacht hast, das Johan uns hinterließ. Jetzt mach den Rest. Ich schaue zu.“`,
      ],
      sign: '+1.500 Gold · Ansehen +5',
    },
    schiffbruch: {
      icon: 'schiff', title: 'Das Meer nimmt',
      text: () => [
        `Treibgut an der Küste, ein zerbrochenes Ruder mit deinem Zeichen. Die Fischer bringen die Nachricht schweigend.`,
        `Mechthild legt dir die Hand auf die Schulter: „Dein Vater hat sieben Schiffe verloren und ist doch jeden Morgen zum Hafen gegangen. Bewaffne deine Koggen, verteile die Ladung auf mehrere Rümpfe – und dann geh zum Hafen.“`,
      ],
      sign: 'Tipp: Holke sinken seltener als Schniggen. Im Winter stürmt es häufiger.',
    },
    schulden: {
      icon: 'muenze', title: 'Bei den Wechslern',
      text: () => [
        `Die Wechsler in ihren pelzbesetzten Mänteln lächeln freundlich, als sie deinen Schuldschein ausstellen. Jede Jahreszeit fressen die Zinsen an deinem Vermögen – und an deinem Ruf.`,
        `„Schulden sind wie Seewasser im Kiel“, brummt dein alter Steuermann. „Erst merkst du sie nicht, dann liegst du schief.“`,
      ],
      sign: 'Verkaufe Waren oder ein Schiff, um die Schulden schnell loszuwerden.',
    },
    hunger: {
      icon: 'aehre', title: 'Der Hungerwinter',
      text: (S, pl) => [
        `Vor den Toren deines Gutes stehen Frauen mit leeren Körben. In den Dörfern schließt man die Türen vor den Steuereintreibern.`,
        `Ein Bauer spuckt vor deinem Pferd aus: „Herr, Euer Getreide fährt nach Bergen, und unsere Kinder essen Rinde.“`,
        `Wer sein Volk hungern lässt, verliert es – an den Tod oder an einen besseren Herrn.`,
      ],
      sign: 'Halte im Herbst genug Getreide bereit: 0,3 Last je Untertan und Jahr.',
    },
    dom: {
      icon: 'krone', title: 'Steine für die Ewigkeit',
      text: (S, pl) => [
        `Der Grundstein des Doms von ${city(pl)} trägt dein Wappen. Steinmetze aus Brabant, Glasmaler aus Köln – die Glocken wird man bis aufs Meer hören.`,
        `Der Bischof segnet dich vor der versammelten Stadt. Man sagt, nur Fürsten bauen so.`,
      ],
      sign: 'Der Dom ist Bedingung für den höchsten Rang.',
    },
    rang1: {
      icon: 'krone', title: 'Kapitel I · Kaufmann',
      text: (S, pl) => [
        `Zum ersten Mal seit dem Unglück wirst du in die Gilde der Kaufleute von ${city(pl)} geladen. Man rückt auf der Bank zusammen, um dir Platz zu machen.`,
        `Mechthild trägt an diesem Abend ihr bestes Kleid. „Siehst du“, sagt sie, „Salz ist das ehrlichste Geschäft der Welt.“`,
      ],
    },
    rang2: {
      icon: 'krone', title: 'Kapitel II · Ratsherr',
      text: (S, pl) => {
        const r = rival(S, pl);
        return [
          `Der Rat von ${city(pl)} wählt dich in seine Mitte. Dein Platz ist der dritte von links – derselbe, auf dem einst dein Großvater saß.`,
          r ? `Unter den Gästen: die Gesandten des Hauses ${r.name}. Man flüstert, sie hätten gehofft, dein Haus würde nie wieder aufstehen.` : '',
        ];
      },
    },
    rang3: {
      icon: 'krone', title: 'Kapitel III · Bürgermeister',
      text: (S, pl) => [
        `Mit dem Schlüssel der Stadt um den Hals führst du den Rat von ${city(pl)}. Die Marktfrauen rufen deinen Namen, die Zünfte schicken Geschenke.`,
        `Abends findest du auf deinem Schreibpult ein altes Hauptbuch deines Vaters Johan. Auf der letzten Seite: eine Liste der Häfen, die er noch erobern wollte.`,
      ],
    },
    rang4: {
      icon: 'krone', title: 'Kapitel IV · Landvogt',
      text: (S, pl) => [
        `Der Landesherr verleiht dir die Vogtei über die Dörfer um ${city(pl)}. Du sprichst nun Recht über Bauern, Müller und Fischer.`,
        `Zum ersten Mal reitest du nicht als Kaufmann, sondern als Herr über dein Land. Die Leute ziehen die Mützen – manche aus Achtung, manche aus Angst. Es liegt an dir, welche mehr werden.`,
      ],
    },
    rang5: {
      icon: 'krone', title: 'Kapitel V · Graf',
      text: (S, pl) => {
        const r = rival(S, pl);
        return [
          `Ein Herold verliest die Urkunde: Dein Haus wird in den Grafenstand erhoben. Wappen, Banner, ein Sitz auf dem Landtag.`,
          r ? `${r.name} schickt einen silbernen Becher – und einen Boten, der nach der Stärke deiner Mauern fragt. Freundschaft und Feindschaft sitzen hier am selben Tisch.` : '',
        ];
      },
    },
    rang6: {
      icon: 'krone', title: 'Kapitel VI · Herzog',
      text: (S, pl) => [
        `Herzog. Das Wort klingt fremd in deinem Mund. Die Hansestädte schicken Gesandte, Könige schreiben dir Briefe in feinem Latein.`,
        `Nachts gehst du manchmal noch zum Hafen und siehst den Koggen zu. Ganz oben ist es still – nur ein Schritt fehlt noch.`,
      ],
    },
    rang7: {
      icon: 'krone', title: 'Kapitel VII · Reichsfürst',
      text: (S, pl) => [
        `Der Kaiser selbst erhebt dich in den Reichsfürstenstand. Die Glocken von ${city(pl)} läuten einen ganzen Tag lang.`,
        `Am Abend stehst du allein am Grab von Mechthild und legst ihren Siegelring auf den Stein. „Das erste Haus am Markt“, sagst du leise. „Und ein wenig mehr.“`,
      ],
    },
  };

  // Brief zum Jahreswechsel (kurz, passt sich der Lage an)
  function yearLetter(S, pl) {
    const SK = root.SK;
    const alive = !pl.flags.erbe;
    const from = alive ? 'Mechthild' : 'Dein Verwalter';
    const r = rival(S, pl);
    const need = pl.pop * SK.GRAIN_PER_HEAD, grain = pl.kontore[pl.home].getreide;
    const lines = [];
    if (pl.gold < 0) lines.push('Die Wechsler fragen nach ihrem Geld. Verkaufe, was du entbehren kannst.');
    else if (grain < need * 0.6) lines.push('Die Speicher sind fast leer. Denk an das Getreide für den Herbst.');
    if (r && SK.score(S, r) > SK.score(S, pl) * 1.25) lines.push(`Das Haus ${r.name} prahlt in allen Gildestuben. Ihre Schiffe sieht man inzwischen öfter als unsere.`);
    else if (r && SK.score(S, pl) > SK.score(S, r) * 1.25) lines.push(`Man erzählt sich, ${r.name} verliere gegen dich die Geduld. Pass auf deine Lager auf.`);
    if (pl.quest) lines.push(`Vergiss den Auftrag für ${SK.C[pl.quest.city].name} nicht: ${pl.quest.qty} Last ${SK.G[pl.quest.good].name}.`);
    if (!pl.buildings.muehle && pl.gold > 1500) lines.push('Eine Mühle auf dem Gut würde unsere Ernte deutlich vergrößern.');
    if (pl.ships.length === 1 && pl.gold > 2500) lines.push('Ein zweites Schiff verdoppelt das Glück – und halbiert das Pech.');
    if (!lines.length) lines.push(pick(S, [
      'Der Winter war mild, die Kinder auf dem Gut sind gesund. Mehr kann man nicht verlangen.',
      'Im Hafen erzählt man sich, in Riga zahle man für Salz fast mit Silber.',
      'Die Glocken von Sankt Marien haben einen Sprung. Der Pfarrer sieht schon zu dir herüber.',
      'Ein Spielmann sang gestern ein Lied über deinen Vater. Ich musste weinen und lachen zugleich.',
      'Die Heringsschwärme ziehen dieses Jahr dicht an Bergen vorbei, sagt man.',
      'Händler aus Brügge berichten, ihr Wein finde im Osten reißenden Absatz.',
    ]));
    return { title: `Neujahr ${SK.year(S)}`, icon: 'feder', text: lines.slice(0, 2).concat(['— ' + from]) };
  }
  function pick(S, arr) { return arr[(S.round * 7 + arr.length) % arr.length]; }

  function epilogue(S, pl) {
    const SK = root.SK, won = S.winner === pl.id;
    if (won && pl.rank === SK.RANKS.length - 1)
      return 'Das Haus, das einst nur eine alte Kogge besaß, gehört nun zu den ersten des Reiches. Die Chronisten von ' + city(pl) + ' werden deinen Namen noch in hundert Jahren schreiben.';
    if (won) return `Nach ${S.years} Jahren steht kein Haus im Reich höher als deines. Mechthild hätte gelächelt.`;
    return `${S.players[S.winner].name} hat dich diesmal überflügelt – doch dein Haus ist wieder ein Name, den man in ${city(pl)} mit Achtung ausspricht.`;
  }

  root.STORY = { INTRO, BEATS, yearLetter, epilogue };
})(typeof window !== 'undefined' ? window : globalThis);
