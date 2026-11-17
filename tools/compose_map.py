#!/usr/bin/env python3
"""Seekarte aus Einzelflächen montieren, Küsten exakt nach art/guide/map_guide.png.

    python3 tools/compose_map.py        # schreibt art/incoming/map_base.png und map_winter.png

Warum Montage statt Bild-zu-Bild: Mit FLUX.2 klein in Draw Things kommt die Vorlage bis etwa 93 % Stärke
fast unverändert zurück, bei 100 % verschieben sich die Küsten. Deshalb malt Draw Things Land und See
einzeln (art/map_parts/, Ränder schon beschnitten), und dieses Skript setzt sie über die Maske der Vorlage
zusammen: Tuschekontur, Wasserlinien entlang der Küste, Küstentönung und Vignette per Code.
Seeschlange: art/incoming/map_serpent.png (freigestellt), wird in die offene Nordsee gesetzt.
Danach wie immer: python3 tools/import_art.py

Prompts der Flächen (FLUX.2 klein 4B, 8 Schritte, CFG 1, 1600 x 1024, je 8 % Rand abgeschnitten):
  land.jpg         Seed 4713: aged warm parchment background of an antique 15th century hand-painted map, tiny scattered
                   ink illustrations of small hills, little clusters of trees and small fields, drawn small and evenly
                   distributed with plenty of plain parchment between them, fine ink hatching, watercolor wash in muted
                   greens and ochre, top-down map view, no ships, no compass rose, no roads, no rivers, no coastline,
                   no water, no frame, no text
  land_winter.jpg  Seed 4713: dasselbe im Winter (small snowy hills, snow-covered pine trees, light dusting of snow),
                   danach 28 % kühles Weiß darübergelegt
  sea.jpg          Seed 4711 (7 % Rand): open sea painted in muted teal-blue watercolor with fine engraved wave lines
                   evenly across the whole surface, a few small sailing ships, top-down map view, no land, no coastline
  ice.jpg          Seed 4711 (7 % Rand): cold grey-blue sea covered with pale ice floes, fine engraved wave lines
                   between the floes, frosty atmosphere, top-down map view, no land, no coastline
"""
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS = os.path.join(ROOT, 'art', 'map_parts')
INCOMING = os.path.join(ROOT, 'art', 'incoming')
GUIDE = os.path.join(ROOT, 'art', 'guide', 'map_guide.png')
SERPENT_AT = (215, 470)     # offene Nordsee, weit weg von allen Städten


def load(name, size):
    return np.array(Image.open(os.path.join(PARTS, name)).convert('RGB').resize(size, Image.LANCZOS)).astype(float)


def ink(img, a, col):
    a = np.clip(a, 0, 1)[..., None]
    return img * (1 - a) + np.array(col, float) * a


def winter_sea(sea, ice):
    """Westen: Sommer-See kalt getönt; nördliche und östliche Ostsee: Eis, weich übergeblendet."""
    h, w = sea.shape[:2]
    cold = (sea * 0.45 + sea.mean(-1, keepdims=True) * 0.55) * np.array([0.88, 0.97, 1.08])
    yy, xx = np.mgrid[0:h, 0:w]
    wgt = np.clip((xx - 820) / 260, 0, 1)
    wgt = np.maximum(wgt, np.clip((xx - 900) / 200, 0, 1) * np.clip((420 - yy) / 160, 0, 1))
    wgt = np.maximum(wgt, np.clip((380 - yy) / 160, 0, 1) * (xx > 950))
    return cold * (1 - wgt[..., None]) + ice * wgt[..., None]


def compose(land, sea, is_sea, winter):
    h, w = is_sea.shape
    d_sea = ndimage.distance_transform_edt(is_sea)      # Abstand zur Küste, auf See
    d_land = ndimage.distance_transform_edt(~is_sea)    # Abstand zur Küste, an Land
    alpha = ndimage.gaussian_filter(is_sea.astype(float), 1.0)[..., None]
    img = land * (1 - alpha) + sea * alpha
    # Küstentönung an Land
    img = ink(img, np.exp(-d_land / 14.0) * (~is_sea) * 0.22, (150, 160, 170) if winter else (150, 120, 85))
    # Wasserlinien parallel zur Küste (Portolan-Stil)
    col = (60, 75, 90) if winter else (40, 60, 62)
    for k, op in enumerate([0.55, 0.38, 0.25, 0.15], start=1):
        img = ink(img, np.clip(1 - np.abs(d_sea - k * 7.0) / 0.9, 0, 1) * is_sea * op, col)
    # Tuschekontur
    coast = np.maximum(np.clip(1 - np.abs(d_land - 0.5) / 1.6, 0, 1) * (~is_sea), np.clip(1 - d_sea / 1.2, 0, 1) * is_sea)
    img = ink(img, coast * 0.85, (55, 38, 24))
    # Vignette
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    img = img * (1 - 0.28 * np.clip(r - 0.75, 0, 1) ** 1.5)[..., None]
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))


def main():
    g = np.array(Image.open(GUIDE).convert('RGB')).astype(int)
    is_sea = g[..., 2] > g[..., 0]                       # Vorlage: See blau, Land beige
    size = (g.shape[1], g.shape[0])
    sea = load('sea.jpg', size)

    summer = compose(load('land.jpg', size), sea, is_sea, False)
    serpent = os.path.join(INCOMING, 'map_serpent.png')
    if os.path.exists(serpent):
        s = Image.open(serpent).convert('RGBA')
        s = s.crop(s.getbbox())
        s.thumbnail((130, 130))
        summer = summer.convert('RGBA')
        summer.alpha_composite(s, SERPENT_AT)
        summer = summer.convert('RGB')
    summer.save(os.path.join(INCOMING, 'map_base.png'))

    winter = compose(load('land_winter.jpg', size), winter_sea(sea, load('ice.jpg', size)), is_sea, True)
    winter.save(os.path.join(INCOMING, 'map_winter.png'))
    print('art/incoming/map_base.png und map_winter.png geschrieben', size)


if __name__ == '__main__':
    main()
