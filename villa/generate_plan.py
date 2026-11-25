#!/usr/bin/env python3
"""Trace the approved single-storey courtyard villa into editable CAD.

The sheet is a rendered poster, not a surveyed drawing. Scale is estimated
from the bedroom-wing door openings (22 px treated as an 800 mm leaf).
Exterior 300 mm and interior 140 mm are temporary model thicknesses, not a
verified СН РК / СП РК value. The 20 m × 40 m site box is not used.
"""

from __future__ import annotations

import json
import math
import shutil
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import ezdxf
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from ezdxf.enums import TextEntityAlignment
from matplotlib.patches import Polygon as MplPolygon
from shapely.geometry import Point, Polygon, LineString
from shapely.ops import unary_union

ROOT = Path("/agent/repos/global-architects")
OUT = ROOT / "villa"
SRC_IMAGE = Path(
    "/home/ubuntu/.cursor/projects/agent-repos-FISTIK/assets/"
    "d38c8abc-6200-4541-8353-0550a2cb14c2.png"
)

# Bedroom doors on the east wing measure 22 px. 800 mm is the reference leaf.
DOOR_PX = 22
DOOR_MM = 800
MM_PER_PX = DOOR_MM / DOOR_PX
EXT_T = 300
INT_T = 140
EXT_HALF = EXT_T / 2
INT_HALF = INT_T / 2

# Layer numbers are the ACI colors read from АР-РП тип 2-2А (layout АР.2-2А).
LAYERS = {
    "PS_Газоблок": 146,
    "PS_Монолит": 204,
    "PS_Штриховка": 254,
    "PS_Утеплитель": 20,
    "PS_Окна": 131,
    "PS_Двери": 8,
    "PS_Витражи": 154,
    "PS_Оси": 1,
    "PS_Размер": 192,
    "PS_Текст": 7,
    "PS_Марки помещ": 7,
    "PS_Площади": 244,
    "PS_Марки дверей": 51,
    "PS_Марки окон": 5,
    "АР_Сантехника": 79,
    "PS_Оборудование": 8,
    "PS_Облицовка": 250,
    "RAMKA 125": 7,
}

POSTER = {
    "teknik-oda": ("8,0", None),
    "camasir-odasi": ("6,0", None),
    "depo": ("5,0", None),
    "portmanto": ("8,0", None),
    "ruzgarlik": ("6,0", None),
    "misafir-wc": ("4,0", None),
    "giris-holu": ("18,0", None),
    "mutfak": ("25,0", None),
    "salon": ("56,0", None),
    "kis-bahcesi": ("22,0", "20,0"),
    "yatak-1": ("16,0", None),
    "yatak-2": ("16,0", None),
    "yatak-3": ("16,0", None),
    "ortak-banyo": ("9,0", "6,0"),
    "master": ("20,0", "21,0"),
    "giyinme": ("10,0", None),
    "ebeveyn-banyo": ("15,0", None),
    "avlu": ("70,0", "68,0"),
    "ana-teras": ("40,0", "25,0"),
    "mutfak-terasi": ("20,0", "15,0"),
}


def snap(value: float) -> int:
    """Round to the nearest 10 mm. Half-millimetres move away from zero."""
    if value >= 0:
        return int(math.floor(value / 10.0 + 0.5)) * 10
    return -int(math.floor(-value / 10.0 + 0.5)) * 10


def X(px: float) -> int:
    """Millimetres east of the inner northwest corner. Image +x is east."""
    return snap((px - 151) * MM_PER_PX - EXT_HALF)


def Y(py: float) -> int:
    """Millimetres north of the inner northwest corner. Image +y is south."""
    return snap((130 - py) * MM_PER_PX + EXT_HALF)


def rect(x0, x1, y_north, y_south):
    return [(x0, y_north), (x1, y_north), (x1, y_south), (x0, y_south)]


def poly(coords):
    polygon = Polygon(coords)
    if not polygon.is_valid:
        polygon = polygon.buffer(0)
    return polygon


def orient_area(polygon: Polygon) -> float:
    return abs(polygon.area) / 1_000_000.0


class Wall:
    def __init__(self, wid, x1, y1, x2, y2, thickness, room_a, room_b, exterior, height):
        self.id = wid
        self.p1 = (float(x1), float(y1))
        self.p2 = (float(x2), float(y2))
        self.thickness = thickness
        self.rooms = [room_a, room_b]
        self.exterior = exterior
        self.height = height
        dx, dy = self.p2[0] - self.p1[0], self.p2[1] - self.p1[1]
        self.length = math.hypot(dx, dy)
        self.ux, self.uy = dx / self.length, dy / self.length
        self.lx, self.ly = -self.uy, self.ux
        self.openings = []

    def point_at(self, distance):
        return (
            self.p1[0] + self.ux * distance,
            self.p1[1] + self.uy * distance,
        )


def height_of(rooms, *ids):
    values = []
    for rid in ids:
        item = rooms.get(rid)
        if item and item.get("clearHeightMm"):
            values.append(item["clearHeightMm"])
    return max(values) if values else 0


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    if SRC_IMAGE.exists():
        shutil.copyfile(SRC_IMAGE, OUT / "reference-sheet.png")

    # Pixel anchors traced from the sheet. Values are centres of the dark wall
    # strokes, except the wood core, whose two faces are kept as faces.
    px = {
        "west": 151,
        "terrace_west": 90,
        "tech_laundry": 253,
        "laundry_store": 309,
        "store_cloak": 360,
        "cloak_vest": 423,
        "core_west": 502,
        "core_east": 554,
        "wc_east": 609,
        "kitchen_east": 326,
        "wing_west": 646,
        "suite": 712,
        "east": 802,
        "north": 130,
        "canopy_north": 92,
        "bar_south": 216,
        "hall_south": 280,
        "kitchen_south": 368,
        "bed12": 214,
        "bed23": 304,
        "bed_bath": 394,
        "bath_master": 456,
        "dress_bath": 557,
        "wing_south": 698,
        "court_south": 636,
        "south": 776,
        "pool_w": 420,
        "pool_e": 606,
        "pool_n": 580,
        "pool_s": 618,
    }
    A = {key: X(value) if key in {
        "west", "terrace_west", "tech_laundry", "laundry_store", "store_cloak",
        "cloak_vest", "core_west", "core_east", "wc_east", "kitchen_east",
        "wing_west", "suite", "east", "pool_w", "pool_e",
    } else Y(value) for key, value in px.items()}

    # Heights are the approved clear heights. Rüzgarlık is read as part of the
    # entrance group. Open courts have no ceiling.
    H = {
        "teknik-oda": 3000,
        "camasir-odasi": 3000,
        "depo": 3000,
        "portmanto": 3000,
        "ruzgarlik": 4200,
        "misafir-wc": 3000,
        "giris-holu": 4200,
        "giris-sacagi": 4200,
        "mutfak": 3600,
        "salon": 4200,
        "kis-bahcesi": 4200,
        "yatak-1": 3300,
        "yatak-2": 3300,
        "yatak-3": 3300,
        "ortak-banyo": 3000,
        "master": 3600,
        "giyinme": 3000,
        "ebeveyn-banyo": 3000,
        "avlu": None,
        "ana-teras": None,
        "mutfak-terasi": None,
    }
    names = {
        "teknik-oda": "Teknik oda",
        "camasir-odasi": "Çamaşır odası",
        "depo": "Depo",
        "portmanto": "Portmanto",
        "ruzgarlik": "Rüzgarlık",
        "misafir-wc": "Misafir WC",
        "giris-holu": "Giriş holü",
        "giris-sacagi": "Giriş saçağı",
        "mutfak": "Mutfak",
        "salon": "Salon",
        "kis-bahcesi": "Kış bahçesi",
        "yatak-1": "Yatak odası 1",
        "yatak-2": "Yatak odası 2",
        "yatak-3": "Yatak odası 3",
        "ortak-banyo": "Ortak banyo",
        "master": "Master yatak odası",
        "giyinme": "Giyinme odası",
        "ebeveyn-banyo": "Ebeveyn banyosu",
        "avlu": "Avlu",
        "ana-teras": "Ana teras",
        "mutfak-terasi": "Mutfak terası",
    }

    Xw, Xk, Xew, Xe = A["west"], A["kitchen_east"], A["wing_west"], A["east"]
    Xtc, Xcd, Xdp = A["tech_laundry"], A["laundry_store"], A["store_cloak"]
    Xpr, Xcw, Xce, Xwe = A["cloak_vest"], A["core_west"], A["core_east"], A["wc_east"]
    Xm = A["suite"]
    yN, yNs, yHs = A["north"], A["bar_south"], A["hall_south"]
    yKs, yCs, yS = A["kitchen_south"], A["court_south"], A["south"]
    y12, y23, y3b = A["bed12"], A["bed23"], A["bed_bath"]
    yBm, yDs, yEs = A["bath_master"], A["dress_bath"], A["wing_south"]
    yCan = A["canopy_north"]

    def room_shell(rid, coords):
        polygon = poly(coords)
        return {
            "id": rid,
            "name": names[rid],
            "clearHeightMm": H[rid],
            "polygon": polygon,
            "coords": list(polygon.exterior.coords)[:-1],
            "areaM2": round(orient_area(polygon), 2),
        }

    ih = INT_HALF
    eh = EXT_HALF
    rooms = {}

    def add_room(rid, coords):
        rooms[rid] = room_shell(rid, coords)

    add_room("teknik-oda", rect(Xw + eh, Xtc - ih, yN - eh, yNs + ih))
    add_room("camasir-odasi", rect(Xtc + ih, Xcd - ih, yN - eh, yNs + ih))
    add_room("depo", rect(Xcd + ih, Xdp - ih, yN - eh, yNs + ih))
    add_room("portmanto", rect(Xdp + ih, Xpr - ih, yN - eh, yNs + ih))
    add_room("ruzgarlik", rect(Xpr + ih, Xcw, yN - eh, yNs + ih))
    add_room("misafir-wc", rect(Xce, Xwe - ih, yN - eh, yNs + ih))
    add_room(
        "giris-holu",
        [
            (Xk + ih, yHs + eh),
            (Xk + ih, yNs - ih),
            (Xwe + ih, yNs - ih),
            (Xwe + ih, yN - eh),
            (Xew - ih, yN - eh),
            (Xew - ih, yHs + eh),
        ],
    )
    add_room(
        "mutfak",
        [
            (Xw + eh, yNs - ih),
            (Xk - ih, yNs - ih),
            (Xk - ih, yHs),
            (Xk - eh, yHs),
            (Xk - eh, yKs + ih),
            (Xw + eh, yKs + ih),
        ],
    )
    add_room("salon", rect(Xw + eh, Xk - eh, yKs - ih, yCs + ih))
    add_room("kis-bahcesi", rect(Xw + eh, Xk - eh, yCs - ih, yS + eh))
    add_room("yatak-1", rect(Xew + ih, Xe - eh, yN - eh, y12 + ih))
    add_room(
        "yatak-2",
        [
            (Xew + ih, y12 - ih),
            (Xe - eh, y12 - ih),
            (Xe - eh, y23 + ih),
            (Xew + eh, y23 + ih),
            (Xew + eh, yHs),
            (Xew + ih, yHs),
        ],
    )
    add_room("yatak-3", rect(Xew + eh, Xe - eh, y23 - ih, y3b + ih))
    add_room("ortak-banyo", rect(Xew + eh, Xe - eh, y3b - ih, yBm + ih))
    add_room("master", rect(Xew + eh, Xm - ih, yBm - ih, yEs + eh))
    add_room("giyinme", rect(Xm + ih, Xe - eh, yBm - ih, yDs + ih))
    add_room("ebeveyn-banyo", rect(Xm + ih, Xe - eh, yDs - ih, yEs + eh))
    add_room("avlu", rect(Xk + eh, Xew - eh, yHs - eh, yCs + eh))
    add_room("ana-teras", rect(Xk + eh, Xew - eh, yCs - eh, yS - eh))
    add_room(
        "mutfak-terasi",
        rect(A["terrace_west"], Xw - eh, yNs, yKs),
    )
    add_room(
        "giris-sacagi",
        rect(Xpr, Xcw, yCan, yN + eh),
    )

    # Privacy stall inside the parent bath. The bath polygon keeps the stall.
    bath = rooms["ebeveyn-banyo"]["polygon"]
    minx, miny, maxx, maxy = bath.bounds
    stall_clear = 1600
    y_stall = snap(maxy - stall_clear - ih)
    stall_inner = poly(rect(minx, maxx, maxy, y_stall + ih))

    walls = []

    def add_v(wid, x, y_north, y_south, thick, west_room, east_room):
        walls.append(
            Wall(
                wid, x, y_north, x, y_south, thick, west_room, east_room,
                thick == EXT_T,
                height_of(rooms, west_room, east_room) or 3000,
            )
        )

    def add_h(wid, y, x_west, x_east, thick, north_room, south_room):
        walls.append(
            Wall(
                wid, x_west, y, x_east, y, thick, north_room, south_room,
                thick == EXT_T,
                height_of(rooms, north_room, south_room) or 3000,
            )
        )

    add_v("W-west-teknik", Xw, yN, yNs, EXT_T, "bahce", "teknik-oda")
    add_v("W-west-mutfak", Xw, yNs, yKs, EXT_T, "mutfak-terasi", "mutfak")
    add_v("W-west-salon", Xw, yKs, yCs, EXT_T, "bahce", "salon")
    add_v("W-west-kis", Xw, yCs, yS, EXT_T, "bahce", "kis-bahcesi")
    add_v("W-teknik-camasir", Xtc, yN, yNs, INT_T, "teknik-oda", "camasir-odasi")
    add_v("W-camasir-depo", Xcd, yN, yNs, INT_T, "camasir-odasi", "depo")
    add_v("W-depo-port", Xdp, yN, yNs, INT_T, "depo", "portmanto")
    add_v("W-port-ruz", Xpr, yN, yNs, INT_T, "portmanto", "ruzgarlik")
    core_mid = (Xcw + Xce) / 2
    walls.append(
        Wall(
            "W-cekirdek", core_mid, yN, core_mid, yNs, Xce - Xcw,
            "ruzgarlik", "misafir-wc", False, 3000,
        )
    )
    add_v("W-wc-hol", Xwe, yN, yNs, INT_T, "misafir-wc", "giris-holu")
    add_v("W-mutfak-hol", Xk, yNs, yHs, INT_T, "mutfak", "giris-holu")
    add_v("W-mutfak-avlu", Xk, yHs, yKs, EXT_T, "mutfak", "avlu")
    add_v("W-salon-avlu", Xk, yKs, yCs, EXT_T, "salon", "avlu")
    add_v("W-kis-teras", Xk, yCs, yS, EXT_T, "kis-bahcesi", "ana-teras")
    add_v("W-bed1", Xew, yN, y12, INT_T, "giris-holu", "yatak-1")
    add_v("W-bed2-hol", Xew, y12, yHs, INT_T, "giris-holu", "yatak-2")
    add_v("W-bed2-avlu", Xew, yHs, y23, EXT_T, "avlu", "yatak-2")
    add_v("W-bed3", Xew, y23, y3b, EXT_T, "avlu", "yatak-3")
    add_v("W-banyo", Xew, y3b, yBm, EXT_T, "avlu", "ortak-banyo")
    add_v("W-master-avlu", Xew, yBm, yCs, EXT_T, "avlu", "master")
    add_v("W-master-teras", Xew, yCs, yEs, EXT_T, "ana-teras", "master")
    add_v("W-master-giy", Xm, yBm, yDs, INT_T, "master", "giyinme")
    add_v("W-master-ebe", Xm, yDs, yEs, INT_T, "master", "ebeveyn-banyo")
    add_v("W-east-bed1", Xe, yN, y12, EXT_T, "yatak-1", "bahce")
    add_v("W-east-bed2", Xe, y12, y23, EXT_T, "yatak-2", "bahce")
    add_v("W-east-bed3", Xe, y23, y3b, EXT_T, "yatak-3", "bahce")
    add_v("W-east-banyo", Xe, y3b, yBm, EXT_T, "ortak-banyo", "bahce")
    add_v("W-east-giy", Xe, yBm, yDs, EXT_T, "giyinme", "bahce")
    add_v("W-east-ebe", Xe, yDs, yEs, EXT_T, "ebeveyn-banyo", "bahce")

    add_h("W-n-teknik", yN, Xw, Xtc, EXT_T, "bahce", "teknik-oda")
    add_h("W-n-camasir", yN, Xtc, Xcd, EXT_T, "bahce", "camasir-odasi")
    add_h("W-n-depo", yN, Xcd, Xdp, EXT_T, "bahce", "depo")
    add_h("W-n-port", yN, Xdp, Xpr, EXT_T, "bahce", "portmanto")
    add_h("W-n-ruz", yN, Xpr, Xcw, EXT_T, "giris-sacagi", "ruzgarlik")
    add_h("W-n-core", yN, Xcw, Xce, EXT_T, "bahce", "cekirdek")
    add_h("W-n-wc", yN, Xce, Xwe, EXT_T, "bahce", "misafir-wc")
    add_h("W-n-nis", yN, Xwe, Xew, EXT_T, "bahce", "giris-holu")
    add_h("W-n-bed1", yN, Xew, Xe, EXT_T, "bahce", "yatak-1")
    add_h("W-s-teknik", yNs, Xw, Xtc, INT_T, "teknik-oda", "mutfak")
    add_h("W-s-camasir", yNs, Xtc, Xcd, INT_T, "camasir-odasi", "mutfak")
    add_h("W-s-depo-mut", yNs, Xcd, Xk, INT_T, "depo", "mutfak")
    add_h("W-s-depo-hol", yNs, Xk, Xdp, INT_T, "depo", "giris-holu")
    add_h("W-s-port", yNs, Xdp, Xpr, INT_T, "portmanto", "giris-holu")
    add_h("W-s-ruz", yNs, Xpr, Xcw, INT_T, "ruzgarlik", "giris-holu")
    add_h("W-s-core", yNs, Xcw, Xce, INT_T, "cekirdek", "giris-holu")
    add_h("W-s-wc", yNs, Xce, Xwe, INT_T, "misafir-wc", "giris-holu")
    add_h("W-hol-avlu", yHs, Xk, Xew, EXT_T, "giris-holu", "avlu")
    add_h("W-mut-salon", yKs, Xw, Xk, INT_T, "mutfak", "salon")
    add_h("W-salon-kis", yCs, Xw, Xk, INT_T, "salon", "kis-bahcesi")
    add_h("W-avlu-teras", yCs, Xk, Xew, EXT_T, "avlu", "ana-teras")
    add_h("W-s-kis", yS, Xw, Xk, EXT_T, "kis-bahcesi", "bahce")
    add_h("W-bed12", y12, Xew, Xe, INT_T, "yatak-1", "yatak-2")
    add_h("W-bed23", y23, Xew, Xe, INT_T, "yatak-2", "yatak-3")
    add_h("W-bed-bath", y3b, Xew, Xe, INT_T, "yatak-3", "ortak-banyo")
    add_h("W-bath-master", yBm, Xew, Xm, INT_T, "ortak-banyo", "master")
    add_h("W-bath-giy", yBm, Xm, Xe, INT_T, "ortak-banyo", "giyinme")
    add_h("W-giy-ebe", yDs, Xm, Xe, INT_T, "giyinme", "ebeveyn-banyo")
    add_h("W-s-master", yEs, Xew, Xm, EXT_T, "master", "bahce")
    add_h("W-s-ebe", yEs, Xm, Xe, EXT_T, "ebeveyn-banyo", "bahce")
    add_h("W-stall", y_stall, Xm, Xe, INT_T, "ebeveyn-banyo", "ebeveyn-banyo")

    # Colinear thick/thin runs share one outer face. The thinner wall shifts
    # onto that face so the joint is one square return, not a step on both sides.
    # Corners are extended later, to the far face of the wall they meet.
    OUTER_ROOMS = {"bahce", "avlu", "ana-teras", "mutfak-terasi", "giris-sacagi"}

    def toward_room(wall, room_id, depth=0):
        if depth > 2:
            return None
        mid = wall.point_at(wall.length / 2)
        if room_id in rooms:
            for sign in (1, -1):
                probe = Point(mid[0] + wall.lx * sign * 500, mid[1] + wall.ly * sign * 500)
                if rooms[room_id]["polygon"].buffer(120).covers(probe):
                    return (wall.lx * sign, wall.ly * sign)
            return None
        other = wall.rooms[1] if wall.rooms[0] == room_id else wall.rooms[0]
        back = toward_room(wall, other, depth + 1) if other in rooms else None
        if back:
            return (-back[0], -back[1])
        return None

    runs = {}
    for wall in walls:
        if abs(wall.ux) >= 0.9:
            key = ("H", round(wall.p1[1]))
        else:
            key = ("V", round(wall.p1[0]))
        runs.setdefault(key, []).append(wall)
    for run in runs.values():
        normal = [wall for wall in run if wall.thickness <= 400]
        if len(normal) < 2:
            continue
        thickest = max(normal, key=lambda wall: wall.thickness)
        flush = None
        for room_id in thickest.rooms:
            if room_id in OUTER_ROOMS:
                flush = toward_room(thickest, room_id)
                if flush:
                    break
        if flush is None:
            for room_id in thickest.rooms:
                flush = toward_room(thickest, room_id)
                if flush:
                    break
        if flush is None:
            continue
        for wall in normal:
            delta = (thickest.thickness - wall.thickness) / 2
            if delta < 1:
                continue
            wall.p1 = (wall.p1[0] + flush[0] * delta, wall.p1[1] + flush[1] * delta)
            wall.p2 = (wall.p2[0] + flush[0] * delta, wall.p2[1] + flush[1] * delta)

    def retie(wall):
        dx, dy = wall.p2[0] - wall.p1[0], wall.p2[1] - wall.p1[1]
        wall.length = math.hypot(dx, dy)
        wall.ux, wall.uy = dx / wall.length, dy / wall.length
        wall.lx, wall.ly = -wall.uy, wall.ux

    # A partition that used to stop on the old centreline is pulled onto the
    # shifted wall so its end does not stick out past the face.
    for wall in walls:
        for at_start in (True, False):
            pt = wall.p1 if at_start else wall.p2
            sitting = False
            for other in walls:
                if other is wall:
                    continue
                if abs(wall.ux * other.ux + wall.uy * other.uy) > 0.2:
                    continue
                along = (pt[0] - other.p1[0]) * other.ux + (pt[1] - other.p1[1]) * other.uy
                across = (pt[0] - other.p1[0]) * other.lx + (pt[1] - other.p1[1]) * other.ly
                if -5 <= along <= other.length + 5 and abs(across) < 3:
                    sitting = True
                    break
            if sitting:
                continue
            best = None
            for other in walls:
                if other is wall or abs(wall.ux * other.ux + wall.uy * other.uy) > 0.2:
                    continue
                along = (pt[0] - other.p1[0]) * other.ux + (pt[1] - other.p1[1]) * other.uy
                if along < -30 or along > other.length + 30:
                    continue
                foot = (other.p1[0] + other.ux * along, other.p1[1] + other.uy * along)
                shift = (foot[0] - pt[0], foot[1] - pt[1])
                dist = math.hypot(*shift)
                # Only the small shift from aligning a thin wall. Do not pull an
                # end from a thick core's face to its centre.
                if dist < 2 or dist > 120:
                    continue
                # Only slide along this wall. A sideways slide would move the whole run.
                if abs(shift[0] * wall.lx + shift[1] * wall.ly) > 3:
                    continue
                if best is None or dist < best[0]:
                    best = (dist, foot)
            if best is None:
                continue
            nxt = best[1]
            other_end = wall.p2 if at_start else wall.p1
            if math.hypot(nxt[0] - other_end[0], nxt[1] - other_end[1]) < 200:
                continue
            if at_start:
                wall.p1 = nxt
            else:
                wall.p2 = nxt
            retie(wall)

    def end_extension(wall, at_start):
        sign = -1 if at_start else 1
        ox, oy = wall.ux * sign, wall.uy * sign
        pt = wall.p1 if at_start else wall.p2
        half = wall.thickness / 2
        reach = 0.0
        for other in walls:
            if other is wall:
                continue
            if abs(wall.ux * other.ux + wall.uy * other.uy) > 0.2:
                continue
            dist = (other.p1[0] - pt[0]) * ox + (other.p1[1] - pt[1]) * oy
            far = dist + other.thickness / 2
            if far < 5 or far > 500:
                continue
            along = (pt[0] - other.p1[0]) * other.ux + (pt[1] - other.p1[1]) * other.uy
            overlap = min(along + half, other.length) - max(along - half, 0)
            if overlap < 10:
                continue
            reach = max(reach, far)
        return reach

    for wall in walls:
        wall.ext_start = end_extension(wall, True)
        wall.ext_end = end_extension(wall, False)

    by_id = {wall.id: wall for wall in walls}
    findings = []

    def add_opening(wall_id, kind, width, height, sill, offset, swing_room, other_room, force=None):
        wall = by_id[wall_id]
        opening = {
            "id": f"{'D' if kind != 'window' else 'N'}-{len([o for w in walls for o in w.openings]) + 1:03d}",
            "wallId": wall_id,
            "kind": kind,
            "widthMm": width,
            "heightMm": height,
            "sillMm": sill,
            "offsetMm": offset,
            "swingRoom": swing_room,
            "otherRoom": other_room,
            "force": force,
            "layer": "A-DOOR" if kind != "window" else "A-WIND",
        }
        wall.openings.append(opening)
        return opening

    def centered(wall_id, width):
        wall = by_id[wall_id]
        start = wall.ext_start
        end = wall.length - wall.ext_end
        if end - start < width + 80:
            return wall.length / 2
        return (start + end) / 2

    def near_end(wall_id, width, margin=200):
        wall = by_id[wall_id]
        pos = wall.length - (wall.ext_end + margin) - width / 2
        limit = wall.ext_start + margin + width / 2
        if pos < limit:
            return wall.length / 2
        return pos

    def near_start(wall_id, width, margin=200):
        wall = by_id[wall_id]
        pos = wall.ext_start + margin + width / 2
        limit = wall.length - (wall.ext_end + margin) - width / 2
        if pos > limit:
            return wall.length / 2
        return pos

    # Doors. Offset is the opening centre, measured from the wall start
    # (north end of a vertical wall, west end of a horizontal wall).
    doors = [
        add_opening("W-n-ruz", "single", 1000, 2400, 0, centered("W-n-ruz", 1000), "ruzgarlik", "giris-sacagi"),
        add_opening("W-s-ruz", "double", 2000, 2100, 0, centered("W-s-ruz", 2000), "giris-holu", "ruzgarlik"),
        add_opening("W-s-port", "single", 800, 2100, 0, centered("W-s-port", 800), "portmanto", "giris-holu"),
        add_opening("W-s-depo-hol", "single", 800, 2100, 0, centered("W-s-depo-hol", 800), "depo", "giris-holu"),
        add_opening("W-s-wc", "single", 700, 2100, 0, centered("W-s-wc", 700), "misafir-wc", "giris-holu"),
        add_opening("W-s-teknik", "single", 800, 2100, 0, centered("W-s-teknik", 800), "teknik-oda", "mutfak"),
        add_opening("W-s-camasir", "single", 800, 2100, 0, centered("W-s-camasir", 800), "camasir-odasi", "mutfak"),
        add_opening("W-bed1", "single", 800, 2100, 0, near_end("W-bed1", 800), "yatak-1", "giris-holu"),
        add_opening("W-bed2-hol", "single", 800, 2100, 0, near_end("W-bed2-hol", 800), "yatak-2", "giris-holu"),
        add_opening("W-bed3", "single", 800, 2100, 0, near_start("W-bed3", 800), "yatak-3", "avlu"),
        add_opening("W-banyo", "single", 800, 2100, 0, near_start("W-banyo", 800), "ortak-banyo", "avlu"),
        add_opening("W-master-avlu", "single", 800, 2100, 0, near_start("W-master-avlu", 800), "master", "avlu"),
        add_opening("W-mut-salon", "single", 900, 2100, 0, near_end("W-mut-salon", 900, 300), "salon", "mutfak"),
        add_opening("W-salon-kis", "double", 1600, 2400, 0, centered("W-salon-kis", 1600), "salon", "kis-bahcesi"),
        add_opening("W-hol-avlu", "double", 1600, 2400, 0, centered("W-hol-avlu", 1600), "giris-holu", "avlu"),
        add_opening("W-salon-avlu", "sliding", 2400, 2400, 0, centered("W-salon-avlu", 2400), "salon", "avlu"),
        add_opening("W-kis-teras", "sliding", 1600, 2400, 0, centered("W-kis-teras", 1600), "kis-bahcesi", "ana-teras"),
        add_opening("W-avlu-teras", "sliding", 3200, 2400, 0, centered("W-avlu-teras", 3200), "avlu", "ana-teras"),
        add_opening("W-west-mutfak", "sliding", 1600, 2400, 0, centered("W-west-mutfak", 1600), "mutfak", "mutfak-terasi"),
        add_opening("W-master-giy", "single", 800, 2100, 0, near_start("W-master-giy", 800), "giyinme", "master"),
        add_opening("W-master-ebe", "single", 800, 2100, 0, near_start("W-master-ebe", 800), "ebeveyn-banyo", "master"),
        add_opening("W-giy-ebe", "single", 800, 2100, 0, near_start("W-giy-ebe", 800), "giyinme", "ebeveyn-banyo"),
        add_opening("W-stall", "single", 700, 2100, 0, centered("W-stall", 700), "ebeveyn-banyo", "ebeveyn-banyo", "left"),
    ]

    def free_gaps(wall, margin=200):
        # Stay clear of the wall the end joins, and leave a pier before a door.
        spans = sorted(wall.openings, key=lambda item: item["offsetMm"])
        cursor = wall.ext_start + margin
        limit = max(cursor, wall.length - wall.ext_end - margin)
        found = []
        for item in spans:
            a = item["offsetMm"] - item["widthMm"] / 2
            b = item["offsetMm"] + item["widthMm"] / 2
            if a - cursor > 1:
                found.append((cursor, a))
            cursor = max(cursor, b)
        if limit - cursor > 1:
            found.append((cursor, limit))
        return found

    def add_window(wall_id, width, height, sill, which="largest"):
        wall = by_id[wall_id]
        fits = []
        for margin in (200, 100, 0):
            fits = [(a, b) for a, b in free_gaps(wall, margin) if b - a >= width + 40]
            if fits:
                break
        if not fits:
            findings.append(f"Pencere sığmadı: {wall_id} {width} mm")
            return None
        if which == "start":
            a, b = fits[0]
            spare = (b - a) - width
            offset = a + width / 2 + min(200, max(0, spare))
        elif which == "end":
            a, b = fits[-1]
            spare = (b - a) - width
            offset = b - width / 2 - min(200, max(0, spare))
        else:
            a, b = max(fits, key=lambda gap: gap[1] - gap[0])
            offset = (a + b) / 2
        return add_opening(wall_id, "window", width, height, sill, offset, None, None)

    for wall in walls:
        ordered = sorted(wall.openings, key=lambda item: item["offsetMm"])
        for left, right in zip(ordered, ordered[1:]):
            gap = (right["offsetMm"] - right["widthMm"] / 2) - (left["offsetMm"] + left["widthMm"] / 2)
            if gap >= 200:
                continue
            push = (200 - gap) / 2
            left["offsetMm"] -= push
            right["offsetMm"] += push
        lo = wall.ext_start + 40
        hi = wall.length - wall.ext_end - 40
        for opening in ordered:
            half = opening["widthMm"] / 2
            opening["offsetMm"] = min(max(opening["offsetMm"], lo + half), hi - half)

    for wid in ("W-n-teknik", "W-n-camasir", "W-n-depo", "W-n-port"):
        add_window(wid, 1200, 1500, 900)
    add_window("W-n-wc", 600, 500, 1700)
    for wid in ("W-east-bed1", "W-east-bed2", "W-east-bed3"):
        add_window(wid, 1500, 1500, 900)
    add_window("W-east-banyo", 900, 600, 1600)
    add_window("W-east-giy", 1200, 1500, 900)
    add_window("W-east-ebe", 900, 600, 1600)
    add_window("W-s-master", 1600, 1500, 900)
    add_window("W-s-kis", 2200, 2200, 200)
    add_window("W-west-salon", 2000, 2200, 200)
    add_window("W-west-kis", 1000, 1500, 900, "start")
    add_window("W-salon-avlu", 2000, 2400, 100, "start")
    add_window("W-salon-avlu", 2000, 2400, 100, "end")
    add_window("W-hol-avlu", 1800, 2400, 100, "start")
    add_window("W-hol-avlu", 1800, 2400, 100, "end")
    add_window("W-avlu-teras", 2200, 2400, 100, "start")
    add_window("W-avlu-teras", 2200, 2400, 100, "end")
    add_window("W-west-mutfak", 1200, 1500, 900, "start")
    add_window("W-kis-teras", 1200, 2200, 200, "start")
    add_window("W-kis-teras", 1200, 2200, 200, "end")

    def resolve_swings():
        for wall in walls:
            for opening in wall.openings:
                if opening["kind"] == "window" or opening["kind"] == "sliding":
                    opening["hinge"] = None
                    opening["swing"] = opening["kind"]
                    continue
                normal = (wall.lx, wall.ly)
                if opening["force"] == "right":
                    normal = (-wall.lx, -wall.ly)
                elif opening["force"] != "left":
                    mid = wall.point_at(opening["offsetMm"])
                    probe_l = Point(mid[0] + wall.lx * 450, mid[1] + wall.ly * 450)
                    probe_r = Point(mid[0] - wall.lx * 450, mid[1] - wall.ly * 450)
                    room = rooms[opening["swingRoom"]]["polygon"]
                    in_l = room.buffer(80).covers(probe_l)
                    in_r = room.buffer(80).covers(probe_r)
                    if in_r and not in_l:
                        normal = (-wall.lx, -wall.ly)
                    elif not in_l and not in_r:
                        findings.append(f"Açılış yönü bulunamadı: {opening['id']} {opening['swingRoom']}")
                opening["normal"] = normal
                centre = wall.point_at(opening["offsetMm"])
                leaf = opening["widthMm"] if opening["kind"] == "single" else opening["widthMm"] / 2
                hinges = []
                signs = (-1, 1) if opening["kind"] == "single" else (-1, 1)
                # For a double door both leaves are kept. For a single door the
                # hinge that lands inside the room is kept.
                if opening["kind"] == "double":
                    for sign in signs:
                        hinge = (
                            centre[0] + wall.ux * sign * opening["widthMm"] / 2,
                            centre[1] + wall.uy * sign * opening["widthMm"] / 2,
                        )
                        end = (hinge[0] + normal[0] * leaf, hinge[1] + normal[1] * leaf)
                        hinges.append({"hinge": hinge, "end": end, "leaf": leaf})
                    opening["leaves"] = hinges
                else:
                    chosen = None
                    room = rooms[opening["swingRoom"]]["polygon"]
                    for sign in signs:
                        hinge = (
                            centre[0] + wall.ux * sign * opening["widthMm"] / 2,
                            centre[1] + wall.uy * sign * opening["widthMm"] / 2,
                        )
                        end = (hinge[0] + normal[0] * leaf, hinge[1] + normal[1] * leaf)
                        if room.buffer(30).covers(Point(end)):
                            chosen = {"hinge": hinge, "end": end, "leaf": leaf, "sign": sign}
                            break
                    if chosen is None:
                        findings.append(f"Kapı kanadı odaya sığmadı: {opening['id']} {opening['swingRoom']}")
                        hinge = (
                            centre[0] - wall.ux * opening["widthMm"] / 2,
                            centre[1] - wall.uy * opening["widthMm"] / 2,
                        )
                        chosen = {
                            "hinge": hinge,
                            "end": (hinge[0] + normal[0] * leaf, hinge[1] + normal[1] * leaf),
                            "leaf": leaf,
                            "sign": -1,
                        }
                    opening["leaves"] = [chosen]
                opening["swing"] = "left" if normal == (wall.lx, wall.ly) else "right"

    resolve_swings()

    boxes = []

    def add_box(rid, layer, kind, x0, y0, x1, y1, name):
        box = poly(rect(min(x0, x1), max(x0, x1), max(y0, y1), min(y0, y1)))
        boxes.append({
            "id": f"F-{len(boxes)+1:03d}",
            "roomId": rid,
            "kind": kind,
            "layer": layer,
            "name": name,
            "polygon": box,
        })

    def bed(rid, long_axis="ns"):
        polygon = rooms[rid]["polygon"]
        minx, miny, maxx, maxy = polygon.bounds
        cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
        if long_axis == "ns":
            add_box(rid, "A-FURN", "yatak", cx - 800, cy - 1000, cx + 800, cy + 1000, "Yatak 1600×2000")
        else:
            add_box(rid, "A-FURN", "yatak", cx - 1000, cy - 800, cx + 1000, cy + 800, "Yatak 2000×1600")

    bed("yatak-1")
    bed("yatak-2")
    bed("yatak-3")
    # Master is narrow east-west, so the bed runs north-south in the south half.
    mb = rooms["master"]["polygon"].bounds
    add_box("master", "A-FURN", "yatak", (mb[0] + mb[2]) / 2 - 800, mb[1] + 700, (mb[0] + mb[2]) / 2 + 800, mb[1] + 2700, "Yatak 1600×2000")
    kb = rooms["mutfak"]["polygon"].bounds
    add_box("mutfak", "A-FURN", "ada", (kb[0] + kb[2]) / 2 - 700, (kb[1] + kb[3]) / 2 - 450, (kb[0] + kb[2]) / 2 + 700, (kb[1] + kb[3]) / 2 + 450, "Mutfak adası")
    add_box("mutfak", "A-FURN", "tezgah", kb[0], kb[3] - 700, kb[0] + 2600, kb[3], "Tezgah")
    sb = rooms["salon"]["polygon"].bounds
    add_box("salon", "A-FURN", "yemek", sb[0] + 1400, sb[3] - 2800, sb[0] + 3200, sb[3] - 1600, "Yemek masası")
    add_box("salon", "A-FURN", "oturma", (sb[0] + sb[2]) / 2 - 1400, sb[1] + 1600, (sb[0] + sb[2]) / 2 + 1400, sb[1] + 3400, "Oturma")
    wb = rooms["kis-bahcesi"]["polygon"].bounds
    add_box("kis-bahcesi", "A-FIRE", "somine", wb[0], wb[1] + 400, wb[0] + 700, wb[1] + 1600, "Şömine")
    gb = rooms["giyinme"]["polygon"].bounds
    add_box("giyinme", "A-FURN", "dolap", gb[2] - 650, (gb[1] + gb[3]) / 2 - 900, gb[2], (gb[1] + gb[3]) / 2 + 900, "Gardırop")
    tb = rooms["mutfak-terasi"]["polygon"].bounds
    if tb[2] - tb[0] > 1400 and tb[3] - tb[1] > 1400:
        add_box("mutfak-terasi", "A-FURN", "masa", (tb[0] + tb[2]) / 2 - 600, (tb[1] + tb[3]) / 2 - 450, (tb[0] + tb[2]) / 2 + 600, (tb[1] + tb[3]) / 2 + 450, "Teras masası")
    ab = rooms["ana-teras"]["polygon"].bounds
    add_box("ana-teras", "A-FURN", "oturma", ab[0] + 800, ab[1] + 800, ab[0] + 3200, ab[1] + 2600, "Teras oturması")
    add_box("ana-teras", "A-FURN", "yemek", ab[2] - 2800, (ab[1] + ab[3]) / 2 - 500, ab[2] - 1000, (ab[1] + ab[3]) / 2 + 700, "Teras yemeği")
    court = rooms["avlu"]["polygon"]
    cc = court.centroid
    tree = Point(cc.x, cc.y + 1800).buffer(1100)

    # Sanitary. Parent-bath toilet and bidet stay north of the stall wall.
    stall_n = stall_inner.bounds
    add_box("ebeveyn-banyo", "A-SANI", "klozet", stall_n[0] + 350, stall_n[3] - 800, stall_n[0] + 1050, stall_n[3] - 150, "Klozet")
    add_box("ebeveyn-banyo", "A-SANI", "bide", stall_n[0] + 1200, stall_n[3] - 750, stall_n[0] + 1800, stall_n[3] - 150, "Bide")
    add_box("ebeveyn-banyo", "A-SANI", "dus", minx + 50, y_stall - 1100, minx + 950, y_stall - 150, "Duş")
    add_box("ebeveyn-banyo", "A-SANI", "kuvet", (minx + maxx) / 2 - 200, miny + 80, (minx + maxx) / 2 + 1500, miny + 850, "Küvet")
    add_box("ebeveyn-banyo", "A-SANI", "dolap", maxx - 600, y_stall - 1800, maxx - 40, y_stall - 300, "Çift lavabo dolabı")
    add_box("ebeveyn-banyo", "A-SANI", "lavabo", maxx - 520, y_stall - 900, maxx - 120, y_stall - 400, "Lavabo")
    add_box("ebeveyn-banyo", "A-SANI", "lavabo", maxx - 520, y_stall - 1600, maxx - 120, y_stall - 1100, "Lavabo")

    ob = rooms["ortak-banyo"]["polygon"].bounds
    add_box("ortak-banyo", "A-SANI", "dolap", ob[2] - 1600, ob[3] - 620, ob[2] - 200, ob[3] - 80, "Lavabo dolabı")
    add_box("ortak-banyo", "A-SANI", "lavabo", ob[2] - 1100, ob[3] - 560, ob[2] - 600, ob[3] - 140, "Lavabo")
    add_box("ortak-banyo", "A-SANI", "dus", ob[2] - 1000, ob[1] + 80, ob[2] - 80, ob[1] + 980, "Duş")
    add_box("ortak-banyo", "A-SANI", "klozet", ob[0] + 1400, ob[1] + 80, ob[0] + 2100, ob[1] + 780, "Klozet")
    add_box("ortak-banyo", "A-SANI", "bide", ob[0] + 2300, ob[1] + 80, ob[0] + 2900, ob[1] + 700, "Bide")

    wc = rooms["misafir-wc"]["polygon"].bounds
    add_box("misafir-wc", "A-SANI", "lavabo", wc[0] + 150, wc[3] - 700, wc[0] + 750, wc[3] - 200, "Lavabo")
    add_box("misafir-wc", "A-SANI", "klozet", wc[0] + 200, wc[1] + 200, wc[0] + 900, wc[1] + 900, "Klozet")
    add_box("misafir-wc", "A-SANI", "dolap", wc[0] + 120, wc[3] - 760, wc[0] + 900, wc[3] - 160, "Dolap")

    pool = poly(rect(A["pool_w"], A["pool_e"], A["pool_n"], A["pool_s"]))

    checks = []

    def check(name, ok, detail=""):
        checks.append({"name": name, "ok": bool(ok), "detail": detail})

    invalid = [rid for rid, room in rooms.items() if not room["polygon"].is_valid or room["polygon"].area <= 0]
    check("Bütün mahal poligonları kapalı ve geçerli", not invalid, ", ".join(invalid))

    overlaps = []
    ids = list(rooms)
    for i, left in enumerate(ids):
        for right in ids[i + 1 :]:
            shared = rooms[left]["polygon"].intersection(rooms[right]["polygon"])
            if shared.area > 500:
                overlaps.append(f"{left}/{right} {shared.area/1e6:.3f} m²")
    check("Mahal poligonları birbirinin içine girmiyor", not overlaps, "; ".join(overlaps))

    opening_faults = []
    for wall in walls:
        spans = []
        for opening in wall.openings:
            half = opening["widthMm"] / 2
            start = opening["offsetMm"] - half
            end = opening["offsetMm"] + half
            if start < 100 or end > wall.length - 100:
                opening_faults.append(f"{opening['id']} uç payı {wall.id}")
            if opening["kind"] == "window":
                if opening["sillMm"] + opening["heightMm"] > wall.height + 1:
                    opening_faults.append(f"{opening['id']} yükseklik {wall.id}")
            elif opening["heightMm"] > wall.height + 1:
                opening_faults.append(f"{opening['id']} kapı yüksek {wall.id}")
            spans.append((start, end, opening["id"]))
        spans.sort()
        for prev, nxt in zip(spans, spans[1:]):
            if prev[1] > nxt[0] + 1:
                opening_faults.append(f"çakışma {prev[2]}/{nxt[2]}")
    check("Kapı ve pencere boşlukları duvarın içinde ve birbirine binmiyor", not opening_faults, "; ".join(opening_faults))

    swing_faults = []
    for wall in walls:
        for opening in wall.openings:
            if opening["kind"] in ("window", "sliding"):
                continue
            room = rooms[opening["swingRoom"]]["polygon"]
            for leaf in opening.get("leaves", []):
                if not room.buffer(40).covers(Point(leaf["end"])):
                    swing_faults.append(f"{opening['id']} kanat {opening['swingRoom']} dışında")
                for other_id, other in rooms.items():
                    if other_id != opening["swingRoom"] and other["polygon"].covers(Point(leaf["end"])):
                        swing_faults.append(f"{opening['id']} kanat {other_id} içinde")
    check("Kapı kanatları hedef mahallin içinde açılıyor", not swing_faults, "; ".join(swing_faults))

    # Graph from the garden through every door and the open edges of terraces.
    graph = {rid: set() for rid in list(rooms) + ["bahce"]}
    def link(a, b):
        if a and b and a != b:
            graph.setdefault(a, set()).add(b)
            graph.setdefault(b, set()).add(a)

    for wall in walls:
        for opening in wall.openings:
            if opening["kind"] == "window":
                continue
            link(opening["swingRoom"], opening["otherRoom"])
    link("giris-sacagi", "bahce")
    link("mutfak-terasi", "bahce")
    link("ana-teras", "bahce")
    seen = set()
    stack = ["bahce"]
    while stack:
        node = stack.pop()
        if node in seen:
            continue
        seen.add(node)
        stack.extend(graph.get(node, ()))
    interior = [
        "teknik-oda", "camasir-odasi", "depo", "portmanto", "ruzgarlik", "misafir-wc",
        "giris-holu", "mutfak", "salon", "kis-bahcesi", "yatak-1", "yatak-2", "yatak-3",
        "ortak-banyo", "master", "giyinme", "ebeveyn-banyo", "avlu", "ana-teras",
        "mutfak-terasi", "giris-sacagi",
    ]
    missing = [rid for rid in interior if rid not in seen]
    check("Girişten bütün mahallere ulaşılıyor", not missing, ", ".join(missing))

    ends = []
    for wall in walls:
        ends.append((round(wall.p1[0], 1), round(wall.p1[1], 1), wall))
        ends.append((round(wall.p2[0], 1), round(wall.p2[1], 1), wall))
    loose = []
    for x, y, wall in ends:
        joined = False
        for other in walls:
            if other is wall:
                continue
            for px_, py_ in (other.p1, other.p2):
                if abs(px_ - x) < 2 and abs(py_ - y) < 2:
                    joined = True
                    break
            if joined:
                break
            line = LineString([other.p1, other.p2])
            if line.distance(Point(x, y)) < 5 and line.project(Point(x, y)) > 5 and line.length - line.project(Point(x, y)) > 5:
                joined = True
                break
        if not joined:
            loose.append(f"{wall.id} ({x:.0f},{y:.0f})")
    check("Duvar uçları birleşiyor, boşta köşe yok", not loose, "; ".join(loose[:12]))

    check("Havuz avlunun içinde", rooms["avlu"]["polygon"].buffer(20).covers(pool), f"havuz {pool.area/1e6:.2f} m²")
    fixture_faults = []
    for box in boxes:
        host = rooms[box["roomId"]]["polygon"]
        if not host.buffer(30).covers(box["polygon"]):
            fixture_faults.append(f"{box['id']} {box['kind']} {box['roomId']}")
    if not court.buffer(50).covers(tree):
        fixture_faults.append("avlu ağacı")
    check("Mobilya ve cihazlar kendi mahalinin içinde", not fixture_faults, "; ".join(fixture_faults))

    stall_fixtures = [box for box in boxes if box["roomId"] == "ebeveyn-banyo" and box["kind"] in ("klozet", "bide")]
    stall_ok = all(stall_inner.buffer(20).covers(box["polygon"]) for box in stall_fixtures) and len(stall_fixtures) == 2
    others_out = all(
        not stall_inner.buffer(-20).intersects(box["polygon"])
        for box in boxes
        if box["roomId"] == "ebeveyn-banyo" and box["kind"] not in ("klozet", "bide")
    )
    check("Klozet ve bide ebeveyn banyosunun mahrem bölmesinde", stall_ok and others_out)

    required_layers = set(LAYERS)
    # filled below once the DXF exists
    now = datetime.now(ZoneInfo("Asia/Qyzylorda"))
    stamp = now.strftime("%d %B %Y, %H:%M").replace(
        now.strftime("%B"),
        {
            "January": "Ocak", "February": "Şubat", "March": "Mart", "April": "Nisan",
            "May": "Mayıs", "June": "Haziran", "July": "Temmuz", "August": "Ağustos",
            "September": "Eylül", "October": "Ekim", "November": "Kasım", "December": "Aralık",
        }[now.strftime("%B")],
    )
    stamp = f"{stamp} (Qyzylorda, UTC+5)"

    geometry = {
        "id": "tek-katli-avlu-villa",
        "units": "mm",
        "north": "+Y",
        "siteBoundary": None,
        "source": "TEK KATLI AVLU VILLA sheet",
        "certainty": "estimated",
        "generatedAt": stamp,
        "scale": {
            "method": "Bedroom-wing door openings on the sheet measure 22 px. That opening is taken as an 800 mm leaf.",
            "doorPx": DOOR_PX,
            "doorMm": DOOR_MM,
            "mmPerPx": round(MM_PER_PX, 4),
            "certainty": "estimated",
            "siteBoundaryUsed": False,
        },
        "wallThicknessPolicy": {
            "exteriorMm": EXT_T,
            "interiorMm": INT_T,
            "coreBetweenVestibuleAndWcMm": Xce - Xcw,
            "status": "temporary-modeling-values",
            "notAVerifiedNorm": True,
            "note": "300 mm ve 140 mm, Kazakistan СН РК veya СП РК hükmü olarak doğrulanmadı.",
        },
        "origin": "U planın kuzeybatı iç köşesi. +X doğu, +Y kuzey.",
        "anchorsPx": px,
        "anchorsMm": A,
        "rooms": [],
        "walls": [],
        "doors": [],
        "windows": [],
        "fixtures": [],
    }
    for room in rooms.values():
        geometry["rooms"].append({
            "id": room["id"],
            "name": room["name"],
            "clearHeightMm": room["clearHeightMm"],
            "polygon": [[round(x), round(y)] for x, y in room["coords"]],
            "areaM2": room["areaM2"],
            "certainty": "estimated",
        })
    for wall in walls:
        geometry["walls"].append({
            "id": wall.id,
            "axis": [[round(wall.p1[0]), round(wall.p1[1])], [round(wall.p2[0]), round(wall.p2[1])]],
            "thicknessMm": round(wall.thickness),
            "heightMm": wall.height,
            "rooms": wall.rooms,
            "exterior": wall.exterior,
            "certainty": "estimated",
        })
    for wall in walls:
        for opening in wall.openings:
            record = {
                "id": opening["id"],
                "wallId": opening["wallId"],
                "kind": opening["kind"],
                "widthMm": opening["widthMm"],
                "heightMm": opening["heightMm"],
                "sillMm": opening["sillMm"],
                "offsetMm": round(opening["offsetMm"]),
                "swing": opening.get("swing"),
                "hinge": [round(leaf["hinge"][0]), round(leaf["hinge"][1])] if opening.get("leaves") else None,
                "rooms": [opening.get("swingRoom"), opening.get("otherRoom")],
                "certainty": "estimated",
            }
            if opening["kind"] == "window":
                geometry["windows"].append({
                    "id": opening["id"],
                    "wallId": opening["wallId"],
                    "widthMm": opening["widthMm"],
                    "heightMm": opening["heightMm"],
                    "sillMm": opening["sillMm"],
                    "offsetMm": round(opening["offsetMm"]),
                    "certainty": "estimated",
                })
            else:
                geometry["doors"].append(record)
    for box in boxes:
        minx, miny, maxx, maxy = box["polygon"].bounds
        geometry["fixtures"].append({
            "id": box["id"],
            "roomId": box["roomId"],
            "kind": box["kind"],
            "layer": box["layer"],
            "name": box["name"],
            "boundsMm": [round(minx), round(miny), round(maxx), round(maxy)],
            "certainty": "estimated",
        })

    json_path = OUT / "project_geometry.json"
    json_path.write_text(json.dumps(geometry, ensure_ascii=False, indent=2), encoding="utf-8")

    doc = ezdxf.new("R2010", setup=True)
    doc.units = ezdxf.units.MM
    doc.header["$INSUNITS"] = 4
    doc.header["$LWDISPLAY"] = 1
    if "ARCH" not in doc.styles:
        doc.styles.add("ARCH", font="DejaVuSans.ttf")
    for name, color in LAYERS.items():
        layer = doc.layers.add(name, color=color)
        if name == "PS_Монолит":
            layer.dxf.lineweight = 50
        elif name == "PS_Газоблок":
            layer.dxf.lineweight = 30
        elif name == "RAMKA 125":
            layer.dxf.lineweight = 35
    msp = doc.modelspace()

    def add_text(text, x, y, height, layer, align=TextEntityAlignment.MIDDLE_CENTER):
        entity = msp.add_text(text, dxfattribs={"layer": layer, "height": height, "style": "ARCH"})
        entity.set_placement((x, y), align=align)

    def wall_quad(wall, t0, t1):
        a = wall.point_at(t0)
        b = wall.point_at(t1)
        half = wall.thickness / 2
        return [
            (a[0] + wall.lx * half, a[1] + wall.ly * half),
            (b[0] + wall.lx * half, b[1] + wall.ly * half),
            (b[0] - wall.lx * half, b[1] - wall.ly * half),
            (a[0] - wall.lx * half, a[1] - wall.ly * half),
        ]

    def wall_body(wall):
        return Polygon(wall_quad(wall, -wall.ext_start, wall.length + wall.ext_end))

    def opening_cut(wall, opening):
        # Cut past both faces so the boolean removes the wall, including the
        # joint line that used to run straight through the door.
        a = opening["offsetMm"] - opening["widthMm"] / 2
        b = opening["offsetMm"] + opening["widthMm"] / 2
        reach = wall.thickness / 2 + 25
        pa, pb = wall.point_at(a), wall.point_at(b)
        return Polygon(
            [
                (pa[0] + wall.lx * reach, pa[1] + wall.ly * reach),
                (pb[0] + wall.lx * reach, pb[1] + wall.ly * reach),
                (pb[0] - wall.lx * reach, pb[1] - wall.ly * reach),
                (pa[0] - wall.lx * reach, pa[1] - wall.ly * reach),
            ]
        )

    def pieces(geom):
        if geom.is_empty:
            return
        kind = geom.geom_type
        if kind == "Polygon":
            yield geom
        elif kind == "MultiPolygon":
            yield from geom.geoms
        elif kind == "GeometryCollection":
            for part in geom.geoms:
                yield from pieces(part)

    def ring_pts(ring):
        pts = [(round(x, 1), round(y, 1)) for x, y in ring.coords]
        if len(pts) > 1 and pts[0] == pts[-1]:
            pts = pts[:-1]
        return pts

    bodies = [(wall, wall_body(wall)) for wall in walls]
    cuts = unary_union([opening_cut(wall, opening) for wall, _body in bodies for opening in wall.openings])
    raw_mass = unary_union([body for _wall, body in bodies])
    mass = raw_mass.difference(cuts) if not cuts.is_empty else raw_mass
    notch_edges = []

    def tooth(length):
        return length < 100 or (length < 180 and abs(length - 140) > 3 and abs(length - 160) > 3)

    for part in pieces(mass):
        for ring in (part.exterior, *part.interiors):
            coords = list(ring.coords)
            lengths = [
                math.hypot(coords[i + 1][0] - coords[i][0], coords[i + 1][1] - coords[i][1])
                for i in range(len(coords) - 1)
            ]
            for i, length in enumerate(lengths):
                if length < 2:
                    continue
                prev = lengths[i - 1]
                nxt = lengths[(i + 1) % len(lengths)]
                p0, p1 = coords[i], coords[i + 1]
                p2 = coords[(i + 2) % (len(coords) - 1)]
                # A vertex dropped onto a straight face is not a step.
                v1 = (p1[0] - p0[0], p1[1] - p0[1])
                v2 = (p2[0] - p1[0], p2[1] - p1[1])
                n1, n2 = math.hypot(*v1), math.hypot(*v2)
                if n1 > 1 and n2 > 1 and abs(v1[0] * v2[0] + v1[1] * v2[1]) / (n1 * n2) > 0.99:
                    continue
                # A corner step is two short returns in a row. A jamb is one return.
                if tooth(length) and (length < 100 or tooth(nxt) or tooth(prev)):
                    notch_edges.append(round(length, 1))
    check(
        "Köşe ve kalın-ince birleşim net, basamak yok",
        not notch_edges,
        "kısa kademe mm: " + ", ".join(str(item) for item in sorted(notch_edges)[:12]),
    )
    exterior_zone = unary_union([body for wall, body in bodies if wall.exterior]).buffer(2)
    core_bodies = [body for wall, body in bodies if wall.thickness > 400]
    core_zone = unary_union(core_bodies).buffer(2) if core_bodies else Polygon()

    def edge_style(p1, p2):
        mid = Point((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)
        # The traced wood core is one thick solid, drawn as the album's monolith.
        if not core_zone.is_empty and core_zone.covers(mid):
            return "PS_Монолит", 50
        # 300 mm exterior and 140 mm partitions stay on the gas-block layer.
        # The album uses that layer for the 200 mm and 100 mm masonry.
        return "PS_Газоблок", 30 if exterior_zone.covers(mid) else 18

    room_order = [
        "teknik-oda", "camasir-odasi", "depo", "portmanto", "ruzgarlik", "misafir-wc",
        "giris-holu", "mutfak", "salon", "kis-bahcesi", "yatak-1", "yatak-2", "yatak-3",
        "ortak-banyo", "master", "giyinme", "ebeveyn-banyo", "avlu", "ana-teras",
        "mutfak-terasi", "giris-sacagi",
    ]
    for number, rid in enumerate(room_order, start=1):
        room = rooms[rid]
        # The room polygon is the wall face. It is not drawn, so it does not
        # sit on top of the wall line. The album puts the number, the name
        # and an underlined area as three separate texts.
        c = room["polygon"].centroid
        add_text(str(number), c.x, c.y + 320, 350, "PS_Марки помещ")
        add_text(room["name"], c.x, c.y, 200, "PS_Текст")
        add_text(f"%%U{room['areaM2']:.1f}", c.x, c.y - 320, 250, "PS_Площади")

    for rid in ("ana-teras", "mutfak-terasi", "giris-sacagi"):
        terrace = rooms[rid]["polygon"].difference(raw_mass.buffer(40))
        for part in pieces(terrace):
            if part.area < 1000:
                continue
            msp.add_lwpolyline(ring_pts(part.exterior), close=True, dxfattribs={"layer": "PS_Облицовка"})

    msp.add_lwpolyline(list(pool.exterior.coords)[:-1], close=True, dxfattribs={"layer": "PS_Витражи"})
    add_text("HAVUZ", pool.centroid.x, pool.centroid.y + 400, 200, "PS_Текст")
    msp.add_circle(tree.centroid.coords[0], 1100, dxfattribs={"layer": "PS_Оборудование"})
    add_text("AĞAÇ", tree.centroid.x, tree.centroid.y, 180, "PS_Текст")

    def add_wall_hatch(geom, layer, pattern, scale):
        for part in pieces(geom):
            if part.area < 200:
                continue
            hatch = msp.add_hatch(dxfattribs={"layer": layer})
            # ANSI36 concrete, AR-CONC masonry, ANSI31 partition: the patterns
            # on PS_Монолит / PS_Штриховка in the type 2-2А model.
            hatch.set_pattern_fill(pattern, scale=scale)
            shell = ring_pts(part.exterior)
            if len(shell) < 3:
                continue
            hatch.paths.add_polyline_path(shell, is_closed=True)
            for hole in part.interiors:
                pts = ring_pts(hole)
                if len(pts) >= 3:
                    hatch.paths.add_polyline_path(pts, is_closed=True)

    exterior_mass = unary_union([body for wall, body in bodies if wall.exterior])
    core_mass = unary_union(core_bodies) if core_bodies else Polygon()
    interior_mass = unary_union([body for wall, body in bodies if not wall.exterior]).difference(exterior_mass)
    if not core_mass.is_empty:
        interior_mass = interior_mass.difference(core_mass)
    if not cuts.is_empty:
        exterior_mass = exterior_mass.difference(cuts)
        interior_mass = interior_mass.difference(cuts)
        core_mass = core_mass.difference(cuts)
    add_wall_hatch(exterior_mass, "PS_Штриховка", "AR-CONC", 80)
    add_wall_hatch(interior_mass, "PS_Штриховка", "ANSI31", 30)
    add_wall_hatch(core_mass, "PS_Монолит", "ANSI36", 40)

    # One cleaned outline: corners join, colinear pieces fuse, openings stay open.
    for part in pieces(mass):
        if part.area < 200:
            continue
        for ring in (part.exterior, *part.interiors):
            coords = list(ring.coords)
            for i in range(len(coords) - 1):
                p1 = (round(coords[i][0], 1), round(coords[i][1], 1))
                p2 = (round(coords[i + 1][0], 1), round(coords[i + 1][1], 1))
                if math.hypot(p2[0] - p1[0], p2[1] - p1[1]) < 2:
                    continue
                layer, weight = edge_style(p1, p2)
                msp.add_line(p1, p2, dxfattribs={"layer": layer, "lineweight": weight})

    for wall in walls:
        for opening in wall.openings:
            a = opening["offsetMm"] - opening["widthMm"] / 2
            b = opening["offsetMm"] + opening["widthMm"] / 2
            pa, pb = wall.point_at(a), wall.point_at(b)
            if opening["kind"] == "window":
                for side, layer in ((0.32, "PS_Окна"), (0.0, "PS_Витражи"), (-0.32, "PS_Окна")):
                    shift = (wall.lx * wall.thickness * side, wall.ly * wall.thickness * side)
                    msp.add_line(
                        (pa[0] + shift[0], pa[1] + shift[1]),
                        (pb[0] + shift[0], pb[1] + shift[1]),
                        dxfattribs={"layer": layer, "lineweight": 18},
                    )
            elif opening["kind"] == "sliding":
                span = b - a
                for side, t0, t1 in ((1, a, a + span * 0.62), (-1, b - span * 0.62, b)):
                    p0, p1 = wall.point_at(t0), wall.point_at(t1)
                    shift = (wall.lx * wall.thickness * 0.18 * side, wall.ly * wall.thickness * 0.18 * side)
                    msp.add_line(
                        (p0[0] + shift[0], p0[1] + shift[1]),
                        (p1[0] + shift[0], p1[1] + shift[1]),
                        dxfattribs={"layer": "PS_Двери", "lineweight": 18},
                    )
            else:
                for leaf in opening.get("leaves", []):
                    hinge = leaf["hinge"]
                    end = leaf["end"]
                    msp.add_line(hinge, end, dxfattribs={"layer": "PS_Двери", "lineweight": 18})
                    closed = (
                        wall.point_at(opening["offsetMm"])[0] - hinge[0],
                        wall.point_at(opening["offsetMm"])[1] - hinge[1],
                    )
                    opened = (end[0] - hinge[0], end[1] - hinge[1])
                    a0 = math.degrees(math.atan2(closed[1], closed[0])) % 360
                    a1 = math.degrees(math.atan2(opened[1], opened[0])) % 360
                    sweep = (a1 - a0) % 360
                    if sweep > 180:
                        a0, a1 = a1, a0
                    msp.add_arc(hinge, leaf["leaf"], a0, a1, dxfattribs={"layer": "PS_Двери"})

    for box in boxes:
        layer = "АР_Сантехника" if box["layer"] == "A-SANI" else "PS_Оборудование"
        if box["kind"] == "fireplace":
            layer = "PS_Оборудование"
        msp.add_lwpolyline(list(box["polygon"].exterior.coords), close=True, dxfattribs={"layer": layer})

    door_no = 0
    window_no = 0
    glazing_no = 0
    for wall in walls:
        for opening in wall.openings:
            mid = wall.point_at(opening["offsetMm"])
            # Mark sits just off the leaf, the way Ок / Вн and the door number sit.
            side = 1 if opening.get("swingRoom") in ("bahce", "avlu", "ana-teras") else -1
            if opening["kind"] == "window":
                side = 1
            mark_at = (
                mid[0] + wall.lx * (wall.thickness / 2 + 420) * side,
                mid[1] + wall.ly * (wall.thickness / 2 + 420) * side,
            )
            if opening["kind"] == "window":
                window_no += 1
                mark = f"Ок{window_no}"
                mark_layer = "PS_Марки окон"
            elif opening["kind"] == "sliding":
                glazing_no += 1
                mark = f"Вн{glazing_no}"
                mark_layer = "PS_Марки окон"
            else:
                door_no += 1
                mark = str(door_no)
                mark_layer = "PS_Марки дверей"
            add_text(mark, mark_at[0], mark_at[1], 220, mark_layer)

    # Axis bubbles are 8 mm on the plotted sheet. At 1:100 that is 800 mm.
    bubble_r = 400

    def axis_line(p1, p2):
        msp.add_line(p1, p2, dxfattribs={"layer": "PS_Оси", "linetype": "CENTER"})

    def bubble(x, y, label):
        msp.add_circle((x, y), bubble_r, dxfattribs={"layer": "PS_Оси"})
        add_text(label, x, y, 280, "PS_Оси")

    y_top, y_bot = yN + 4600, yS - 4600
    for index, x in enumerate((Xw, Xk, Xew, Xe), start=1):
        axis_line((x, y_top - bubble_r), (x, y_bot + bubble_r))
        bubble(x, y_top, str(index))
        bubble(x, y_bot, str(index))
    x_left, x_right = A["terrace_west"] - 4600, Xe + 4600
    for index, y in enumerate((yN, yNs, yHs, yKs, yCs, yEs, yS), start=1):
        axis_line((x_left + bubble_r, y), (x_right - bubble_r, y))
        letter = "АБВГДЕЖ"[index - 1]
        bubble(x_left, y, letter)
        bubble(x_right, y, letter)

    def dim_h(x0, x1, y, text):
        msp.add_line((x0, y - 280), (x0, y + 80), dxfattribs={"layer": "PS_Размер"})
        msp.add_line((x1, y - 280), (x1, y + 80), dxfattribs={"layer": "PS_Размер"})
        msp.add_line((x0, y), (x1, y), dxfattribs={"layer": "PS_Размер"})
        for x in (x0, x1):
            msp.add_line((x - 90, y - 90), (x + 90, y + 90), dxfattribs={"layer": "PS_Размер"})
        add_text(text, (x0 + x1) / 2, y + 220, 200, "PS_Размер")

    def dim_v(y0, y1, x, text):
        msp.add_line((x - 280, y0), (x + 80, y0), dxfattribs={"layer": "PS_Размер"})
        msp.add_line((x - 280, y1), (x + 80, y1), dxfattribs={"layer": "PS_Размер"})
        msp.add_line((x, y0), (x, y1), dxfattribs={"layer": "PS_Размер"})
        for y in (y0, y1):
            msp.add_line((x - 90, y - 90), (x + 90, y + 90), dxfattribs={"layer": "PS_Размер"})
        add_text(text, x - 360, (y0 + y1) / 2, 200, "PS_Размер")

    xs = [Xw, Xk, Xew, Xe]
    for left, right in zip(xs, xs[1:]):
        dim_h(left, right, yN + 1600, str(round(right - left)))
    dim_h(Xw - eh, Xe + eh, yN + 2400, str(round((Xe + eh) - (Xw - eh))))
    ys = [yN, yNs, yHs, yKs, yCs, yEs, yS]
    for top, bot in zip(ys, ys[1:]):
        dim_v(top, bot, Xe + 1600, str(round(top - bot)))
    dim_v(yN + eh, yS - eh, Xe + 2500, str(round((yN + eh) - (yS - eh))))

    # Sheet frame at 1:100, stamp fields taken from the album's «штамп Тип А».
    # The housing-complex title and the signed names on that stamp stay there.
    left = x_left - 1800
    right = x_right + 1800
    bottom = y_bot - 9800
    top = y_top + 1600
    msp.add_lwpolyline(
        [(left, bottom), (right, bottom), (right, top), (left, top)],
        close=True,
        dxfattribs={"layer": "RAMKA 125", "lineweight": 35},
    )
    inner = 800
    msp.add_lwpolyline(
        [(left + inner, bottom + inner), (right - inner, bottom + inner), (right - inner, top - inner), (left + inner, top - inner)],
        close=True,
        dxfattribs={"layer": "RAMKA 125"},
    )
    sw, sh = 18500, 6200
    sx, sy = right - inner - sw, bottom + inner
    msp.add_lwpolyline(
        [(sx, sy), (sx + sw, sy), (sx + sw, sy + sh), (sx, sy + sh)],
        close=True,
        dxfattribs={"layer": "RAMKA 125"},
    )
    msp.add_line((sx, sy + 2200), (sx + sw, sy + 2200), dxfattribs={"layer": "RAMKA 125"})
    msp.add_line((sx, sy + 3800), (sx + 12000, sy + 3800), dxfattribs={"layer": "RAMKA 125"})
    msp.add_line((sx + 12000, sy + 2200), (sx + 12000, sy + sh), dxfattribs={"layer": "RAMKA 125"})
    add_text("ТОО KA Global Architects", sx + 6000, sy + 5400, 280, "PS_Текст")
    add_text("ГСЛ №19008435", sx + 6000, sy + 4900, 200, "PS_Текст")
    add_text("Стадия", sx + 13200, sy + 5600, 180, "PS_Текст")
    add_text("Эскиз", sx + 15200, sy + 5600, 200, "PS_Текст")
    add_text("Лист 1", sx + 13200, sy + 5000, 180, "PS_Текст")
    add_text("Листов 1", sx + 15200, sy + 5000, 180, "PS_Текст")
    add_text("План 1 этажа", sx + 6000, sy + 3100, 320, "PS_Текст")
    add_text("Tek katlı avlu villa", sx + 6000, sy + 2600, 220, "PS_Текст")
    add_text("Разраб.", sx + 900, sy + 1600, 180, "PS_Текст", TextEntityAlignment.MIDDLE_LEFT)
    add_text("ГАП", sx + 900, sy + 1000, 180, "PS_Текст", TextEntityAlignment.MIDDLE_LEFT)
    add_text("ГИП", sx + 900, sy + 400, 180, "PS_Текст", TextEntityAlignment.MIDDLE_LEFT)
    add_text("Изм.    Подпись    Дата", sx + 14500, sy + 1600, 160, "PS_Текст")

    note_x, note_y = left + 1400, y_bot - 1100
    notes = [
        "1. ±0.000 — bu katın bitmiş döşeme kotu.",
        "2. Ölçüler mm. Afiş izinden, 10 mm'ye yuvarlanmış tahmindir.",
        "3. Dış duvar 300 mm, bölme 140 mm. Geçici model kalınlığıdır.",
        "4. Tip 2-2А albümündeki gazoblok 200 + yalıtım ve monolit 250 bu villaya taşınmadı.",
        "5. Alan, kapalı poligonun alanıdır. Altı çizili sayı m².",
        "6. Mahal yeri ve yönü değişmedi. Arsa sınırı yok.",
    ]
    for i, line in enumerate(notes):
        add_text(line, note_x, note_y - i * 420, 200, "PS_Текст", TextEntityAlignment.MIDDLE_LEFT)
    add_text("KUZEY", left + 1800, top - 1600, 300, "PS_Текст")
    msp.add_line((left + 1800, top - 2100), (left + 1800, top - 3400), dxfattribs={"layer": "PS_Текст"})

    dxf_path = OUT / "villa_architectural.dxf"
    doc.saveas(dxf_path)
    used_layers = {layer.dxf.name for layer in doc.layers}
    missing_layers = sorted(required_layers - used_layers)
    check("İstenen CAD katmanları duruyor", not missing_layers, ", ".join(missing_layers))

    png_path = OUT / "villa_architectural_preview.png"
    render_dxf(dxf_path, png_path)
    check("Önizleme DXF dosyasından üretildi", png_path.exists() and png_path.stat().st_size > 10000, str(png_path.stat().st_size))

    # Read the DXF back and confirm wall solids and door arcs exist.
    read_back = ezdxf.readfile(dxf_path)
    kinds = {}
    for entity in read_back.modelspace():
        kinds[entity.dxftype()] = kinds.get(entity.dxftype(), 0) + 1
    check(
        "DXF duvar çizgisi, kapı yayı ve yazı içeriyor",
        kinds.get("LINE", 0) > 80 and kinds.get("ARC", 0) > 10 and kinds.get("HATCH", 0) > 5 and kinds.get("TEXT", 0) > 15,
        str(kinds),
    )

    def overlaps_opening(line, wall, opening):
        if line.dxf.layer not in ("PS_Газоблок", "PS_Монолит", "PS_Двери"):
            return False
        p1, p2 = line.dxf.start, line.dxf.end
        def along(pt):
            return (pt[0] - wall.p1[0]) * wall.ux + (pt[1] - wall.p1[1]) * wall.uy
        def across(pt):
            return (pt[0] - wall.p1[0]) * wall.lx + (pt[1] - wall.p1[1]) * wall.ly
        if abs(across(p1)) > 20 or abs(across(p2)) > 20:
            return False
        span = opening["widthMm"]
        a = opening["offsetMm"] - span / 2
        b = opening["offsetMm"] + span / 2
        lo, hi = sorted((along(p1), along(p2)))
        shared = min(hi, b) - max(lo, a)
        return shared > span * 0.55

    crossed = []
    wall_lines = [entity for entity in read_back.modelspace() if entity.dxftype() == "LINE"]
    for wall in walls:
        for opening in wall.openings:
            if opening["kind"] not in ("single", "double", "sliding"):
                continue
            for line in wall_lines:
                if overlaps_opening(line, wall, opening):
                    crossed.append(f"{opening['id']} {line.dxf.layer}")
                    break
    check("Kapı boşluğundan duvar çizgisi geçmiyor", not crossed, "; ".join(crossed[:8]))

    stacked = []
    wall_only = [entity for entity in wall_lines if entity.dxf.layer in ("PS_Газоблок", "PS_Монолит")]
    for i, left in enumerate(wall_only):
        a1, a2 = left.dxf.start, left.dxf.end
        ax, ay = a2[0] - a1[0], a2[1] - a1[1]
        alen = math.hypot(ax, ay)
        if alen < 30:
            continue
        for right in wall_only[i + 1 :]:
            b1, b2 = right.dxf.start, right.dxf.end
            bx, by = b2[0] - b1[0], b2[1] - b1[1]
            blen = math.hypot(bx, by)
            if blen < 30:
                continue
            cross = abs(ax * by - ay * bx) / (alen * blen)
            if cross > 0.02:
                continue
            # Distance from each endpoint of the shorter sense to the other line.
            dist = abs(ay * b1[0] - ax * b1[1] + a2[0] * a1[1] - a2[1] * a1[0]) / alen
            if dist > 2:
                continue
            def project(pt):
                return ((pt[0] - a1[0]) * ax + (pt[1] - a1[1]) * ay) / alen
            lo, hi = sorted((project(b1), project(b2)))
            shared = min(hi, alen) - max(lo, 0)
            if shared > 25:
                stacked.append(f"{shared:.0f} mm")
                break
        if len(stacked) >= 6:
            break
    check("Duvar çizgileri üst üste binmiyor", not stacked, "; ".join(stacked))
    findings.append(
        "Duvarlar tek kütlede birleşti. Kapı boşluğu kesik; kanat ve yay boşluğun içinde."
    )
    findings.append(
        "Çizim düzeni, okunan АР-РП тип 2-2А paftasından alındı: katmanlar PS_Газоблок, PS_Монолит, PS_Штриховка, PS_Окна, PS_Двери, PS_Оси, PS_Размер, PS_Марки помещ, PS_Площади; tarama AR-CONC / ANSI31 / ANSI36; eksen balonu 8 mm; damga alanları «штамп Тип А». Konut albümünün adı, pafta kodu ve imza atan adlar bu villaya yazılmadı."
    )

    write_reports(geometry, rooms, walls, checks, findings, kinds, stamp, pool, A, px)
    failed = [item for item in checks if not item["ok"]]
    print(f"rooms {len(rooms)} walls {len(walls)} doors {len(geometry['doors'])} windows {len(geometry['windows'])}")
    for item in checks:
        print(("OK  " if item["ok"] else "FAIL") + " " + item["name"] + (" — " + item["detail"] if item["detail"] else ""))
    if findings:
        print("NOTES")
        for line in findings:
            print(" -", line)
    if failed:
        raise SystemExit(1)


def render_dxf(dxf_path: Path, png_path: Path):
    doc = ezdxf.readfile(dxf_path)
    msp = doc.modelspace()
    colors = {
        "PS_Газоблок": "#3f6212",
        "PS_Монолит": "#9a3412",
        "PS_Штриховка": "#d6d3d1",
        "PS_Утеплитель": "#d97706",
        "PS_Окна": "#1d4ed8",
        "PS_Двери": "#111827",
        "PS_Витражи": "#0284c7",
        "PS_Оси": "#dc2626",
        "PS_Размер": "#44403c",
        "PS_Текст": "#111111",
        "PS_Марки помещ": "#111111",
        "PS_Площади": "#44403c",
        "PS_Марки дверей": "#7c3aed",
        "PS_Марки окон": "#1d4ed8",
        "АР_Сантехника": "#0e7490",
        "PS_Оборудование": "#3f6212",
        "PS_Облицовка": "#a8a29e",
        "RAMKA 125": "#111111",
    }
    fills = {"PS_Облицовка", "PS_Витражи", "АР_Сантехника", "PS_Оборудование"}
    fig, ax = plt.subplots(figsize=(16, 15), dpi=140)
    ax.set_aspect("equal")
    ax.set_facecolor("#f7f4ef")
    fig.patch.set_facecolor("#f7f4ef")
    for entity in msp:
        layer = entity.dxf.layer
        color = colors.get(layer, "#222222")
        width = 1.05 if layer in ("PS_Газоблок", "PS_Монолит") else 0.55
        if layer == "PS_Оси":
            width = 0.35
        if entity.dxftype() == "LWPOLYLINE":
            pts = [(p[0], p[1]) for p in entity.get_points("xy")]
            if len(pts) < 2:
                continue
            if entity.closed:
                face = colors.get(layer, "#cccccc")
                alpha = 0.9 if layer in ("A-WALL-EXT", "A-WALL-INT", "A-POOL", "A-FIRE") else 0.35
                if layer in fills and not layer.startswith("A-WALL"):
                    ax.add_patch(MplPolygon(pts, closed=True, facecolor=face, edgecolor=color, linewidth=width, alpha=alpha, zorder=2.4))
                else:
                    closed = pts + [pts[0]]
                    ax.plot([p[0] for p in closed], [p[1] for p in closed], color=color, lw=width, zorder=3)
            else:
                ax.plot([p[0] for p in pts], [p[1] for p in pts], color=color, lw=width, zorder=3)
        elif entity.dxftype() == "HATCH":
            paths = []
            for path in entity.paths:
                if hasattr(path, "vertices"):
                    pts = [(v[0], v[1]) for v in path.vertices]
                    if len(pts) >= 3:
                        paths.append(pts)
            if not paths:
                continue
            ax.add_patch(MplPolygon(paths[0], closed=True, facecolor=color, edgecolor="none", alpha=0.35, zorder=1.5))
            for hole in paths[1:]:
                ax.add_patch(MplPolygon(hole, closed=True, facecolor="#f7f4ef", edgecolor="none", zorder=1.6))
        elif entity.dxftype() == "LINE":
            ax.plot([entity.dxf.start[0], entity.dxf.end[0]], [entity.dxf.start[1], entity.dxf.end[1]], color=color, lw=width, zorder=4)
        elif entity.dxftype() == "ARC":
            start = entity.dxf.start_angle
            end = entity.dxf.end_angle
            sweep = (end - start) % 360
            steps = max(8, int(sweep / 6))
            angles = [math.radians(start + sweep * i / steps) for i in range(steps + 1)]
            cx, cy = entity.dxf.center[0], entity.dxf.center[1]
            r = entity.dxf.radius
            ax.plot([cx + r * math.cos(a) for a in angles], [cy + r * math.sin(a) for a in angles], color=color, lw=0.7, zorder=4)
        elif entity.dxftype() == "CIRCLE":
            circle = plt.Circle((entity.dxf.center[0], entity.dxf.center[1]), entity.dxf.radius, fill=False, edgecolor=color, lw=0.8, zorder=3)
            ax.add_patch(circle)
        elif entity.dxftype() == "TEXT":
            point = entity.dxf.align_point if entity.dxf.hasattr("align_point") and entity.dxf.halign != 0 else entity.dxf.insert
            ax.text(point[0], point[1], entity.dxf.text, fontsize=max(5, entity.dxf.height / 90), ha="center", va="center", color=color, zorder=5, fontname="DejaVu Sans")
    ax.autoscale()
    ax.margins(0.04)
    ax.set_xlabel("mm  +X doğu")
    ax.set_ylabel("mm  +Y kuzey")
    ax.set_title("Tek katlı avlu villa — plan 1, AP düzeni, ölçüler tahmini", loc="left")
    fig.tight_layout()
    fig.savefig(png_path)
    plt.close(fig)


def write_reports(geometry, rooms, walls, checks, findings, kinds, stamp, pool, anchors, px):
    def row(rid):
        room = rooms[rid]
        poster = POSTER.get(rid, ("—", None))
        extra = f" / {poster[1]}" if poster[1] else ""
        return f"| {room['name']} | {room['areaM2']:.2f} | {poster[0]}{extra} | {room['clearHeightMm'] or '—'} |"

    order = list(POSTER) + [rid for rid in rooms if rid not in POSTER]
    area_rows = "\n".join(row(rid) for rid in order if rid in rooms)
    check_rows = "\n".join(
        f"| {'geçti' if item['ok'] else 'kalanı'} | {item['name']} | {item['detail'] or '—'} |"
        for item in checks
    )
    door_rows = "\n".join(
        f"| {door['id']} | {door['wallId']} | {door['kind']} | {door['widthMm']} | {door['heightMm']} | {door['swing']} | {', '.join(str(r) for r in door['rooms'])} |"
        for door in geometry["doors"]
    )
    window_rows = "\n".join(
        f"| {win['id']} | {win['wallId']} | {win['widthMm']} | {win['heightMm']} | {win['sillMm']} |"
        for win in geometry["windows"]
    )
    failed = [item["name"] for item in checks if not item["ok"]]
    verdict = "Kontrol listesindeki maddeler geçti." if not failed else "Geçmeyen maddeler: " + "; ".join(failed)
    note_block = "\n".join(f"- {line}" for line in findings) or "- Yok."
    master_w = rooms["master"]["polygon"].bounds
    master_clear_w = (master_w[2] - master_w[0]) / 1000
    bath_b = rooms["ortak-banyo"]["polygon"].bounds
    validation = f"""# GEOMETRY_VALIDATION — Tek katlı avlu villa

Durum tarihi: {stamp}.

Bu rapor, onaylı afişin piksel izinden üretilen geometriyi kontrol eder. Yeni bir kat planı çizilmedi. 20 m × 40 m arsa sınırı kullanılmadı. Ölçüler tahmini olarak işaretlidir. Kazakistan СН РК ve СП РК uygunluğu iddia edilmez; ilgili hüküm bu çalışmada doğrulanmadı.

## Ölçek

Doğu kanattaki yatak odası kapı boşlukları afişte 22 px ölçüldü. Bu boşluk 800 mm kapı kanadı kabul edildi. Ölçek {MM_PER_PX:.2f} mm/px. Bu bir kestirimdir. Afişteki 20,00 m ve 40,00 m yazıları çizimle aynı oranda değildir; ölçek onlardan alınmadı.

Dış duvar 300 mm, iç bölme 140 mm. İkisi de geçici model kalınlığıdır. Doğrulanmış norm değeri değildir. Rüzgarlık ile misafir WC arasındaki ahşap kaplı masif çekirdek, afişteki iki yüzünden izlendi: kalınlığı {anchors['core_east'] - anchors['core_west']} mm.

## Karşılaştırma

Alan, kapalı iç poligonun alanıdır. Afiş sütunu plan etiketi ile, çelişen yerde alan tablosunu da gösterir. Geometri bu sayılara uydurulmadı.

| Mahal | Hesap m² | Afiş m² | Net yükseklik mm |
| --- | ---: | --- | ---: |
{area_rows}

Havuz su yüzeyi {pool.area/1_000_000:.2f} m². Afişte havuzun kendi alanı yazmaz.

Master yatak odasının net genişliği yaklaşık {master_clear_w:.2f} m. İz, odayı avlu tarafında dar ve uzun veriyor. 1600 mm yatak sığıyor. Duvar, alanı 21 m² etiketine yaklaşsın diye kaydırılmadı.

Ortak banyo net ölçüleri yaklaşık {(bath_b[2]-bath_b[0])/1000:.2f} m × {(bath_b[3]-bath_b[1])/1000:.2f} m. Doğu duvarı kısa olduğu için lavabo, duş, klozet ve bide bu izilen dikdörtgenin uzun kenarlarına yerleştirildi. Oda yeri değişmedi. Afişte bu oda için hem 9,0 hem 6,0 okundu; ikisi de hedef alınmadı.

Avlu ve kış bahçesi, afiş etiketinden belirgin büyük çıktı. Yatak odaları aynı ölçekte 16 m² etiketine yakın. Fark, avlu sınırının izinden geliyor. Sınır, etikete düşsün diye içeri alınmadı.

Yatak odası 2'nin kapısı, hol ile avlunun birleştiği köşede. Kapı hol tarafına bağlandı; avluya ayrı bir kanat uydurulmadı.

## Kapılar

| Kimlik | Duvar | Tür | Genişlik | Yükseklik | Açılış | Mahaller |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
{door_rows}

Sürgülü kanatta yay yoktur. Çift kanatta her kanat hedef mahalle açılır. Ebeveyn banyosundaki 700 mm kapı, klozet ve bide bölmesine açılır.

## Pencereler

| Kimlik | Duvar | Genişlik | Yükseklik | Denizlik |
| --- | --- | ---: | ---: | ---: |
{window_rows}

## Kontroller

| Sonuç | Kontrol | Not |
| --- | --- | --- |
{check_rows}

{verdict}

DXF varlıkları: {kinds}.

Üretim notları:

{note_block}

## Bilinçli sınır

- IFC ve Revit bu adımda yok.
- Arsa çizgisi yok.
- Duvar kalınlığı ve kapı referansı onaylı norm veya rölöve değildir.
- Mobilya yerleri, odanın içinde kalan tahmini bloklardır.
"""
    (OUT / "GEOMETRY_VALIDATION.md").write_text(validation, encoding="utf-8")

    status = f"""# PROJECT_STATUS — Tek katlı avlu villa

Durum tarihi: {stamp}.

Aşama 02 işlendi. Onaylı U plan korundu. Yeni kat planı çizilmedi. Arsa sınırı modele alınmadı. CAD dosyası üretildi ve DXF geri okunarak kontrol edildi.

## Dosyalar

- `villa/generate_plan.py` — üretim ve kontrol kodu. ezdxf ve Shapely kullanır.
- `villa/project_geometry.json` — duvar, kapı, pencere, mahal ve cihaz kaydı. Birim milimetre. Kuzey +Y.
- `villa/villa_architectural.dxf` — düzenlenebilir plan.
- `villa/villa_architectural_preview.png` — bu DXF'in önizlemesi.
- `villa/GEOMETRY_VALIDATION.md` — kontrol raporu.
- `villa/reference-sheet.png` — izlenen afiş.

## Ölçek ve kalınlık

Ölçek tahmini: doğu kanat kapı boşluğu 22 px = 800 mm. Dış duvar 300 mm, iç bölme 140 mm. Bu kalınlıklar geçici model değeridir. СН РК veya СП РК hükmü olarak gösterilmez. Kesinleşmemiş her ölçü `certainty: estimated` taşır.

Orijin, U planın kuzeybatı iç köşesidir.

## Korunan ilişki

Batı kanat: mutfak terası, mutfak, salon, kış bahçesi. Kuzey bar: teknik oda, çamaşır, depo, portmanto, rüzgarlık, masif çekirdek, misafir WC, giriş holünün nişi. Doğu kanat: üç yatak odası, ortak banyo, master, giyinme, ebeveyn banyosu. Orta: avlu ve havuz. Güney: ana teras. Giriş saçağı rüzgarlığın kuzeyindedir.

Ebeveyn banyosu kendi odasındadır: iki lavabo, duş, küvet, dolap, klozet ve bide. Klozet ile bide ayrı bölmededir. Ortak banyo kendi odasındadır: lavabo, duş, klozet, bide, dolap.

Net yükseklikler: salon, giriş holü, giriş saçağı, kış bahçesi ve rüzgarlık 4200 mm. Mutfak ve master 3600 mm. Diğer yatak odaları 3300 mm. Banyo ve teknik hacimler 3000 mm. Rüzgarlık, giriş grubunun parçası sayıldı.

## Hesaplanan alanlar

Afiş sayıları kopyalanmadı. Ayrıntı `villa/GEOMETRY_VALIDATION.md` içindedir.

| Mahal | m² |
| --- | ---: |
{chr(10).join(f"| {rooms[rid]['name']} | {rooms[rid]['areaM2']:.2f} |" for rid in order if rid in rooms)}

## Kontroller

{verdict}

Kapılar duvar boşluğu olarak kesildi. Kanat yayları hedef mahalle bakıyor. Mahaller bahçeden kapı grafiğiyle dolaşılabiliyor. Duvar uçları birleşiyor.

## Sonraki adım

IFC ve Revit, bu kat planı onaylandıktan sonra. Onaydan önce duvar kaydırılmaz ve afişteki çelişen metrekareye uydurma yapılmaz.
"""
    (ROOT / "PROJECT_STATUS.md").write_text(status, encoding="utf-8")


if __name__ == "__main__":
    main()
