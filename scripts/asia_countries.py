"""地理亚洲国家列表（与世行 region 无关，按东亚/东南亚/南亚/西亚/中亚划分）。"""

from __future__ import annotations

ASIA_SUBREGIONS: dict[str, tuple[str, ...]] = {
    "East Asia": (
        "CHN",
        "JPN",
        "KOR",
        "PRK",
        "MNG",
    ),
    "Southeast Asia": (
        "IDN",
        "THA",
        "MYS",
        "SGP",
        "VNM",
        "PHL",
        "MMR",
        "KHM",
        "LAO",
        "BRN",
        "TLS",
    ),
    "South Asia": (
        "IND",
        "PAK",
        "BGD",
        "LKA",
        "NPL",
        "BTN",
        "MDV",
        "AFG",
    ),
    "West Asia": (
        "SAU",
        "ARE",
        "QAT",
        "KWT",
        "OMN",
        "BHR",
        "ISR",
        "JOR",
        "LBN",
        "IRQ",
        "IRN",
        "SYR",
        "YEM",
        "TUR",
        "CYP",
    ),
    "Central Asia": (
        "KAZ",
        "UZB",
        "TKM",
        "KGZ",
        "TJK",
    ),
}

# 图表中不展示（政治敏感，且不在上述地理亚洲列表中）
EXCLUDED_ASIA_COUNTRY_CODES = frozenset({"HKG", "MAC", "TWN"})

ASIA_COUNTRY_CODES: frozenset[str] = frozenset(
    code
    for codes in ASIA_SUBREGIONS.values()
    for code in codes
    if code not in EXCLUDED_ASIA_COUNTRY_CODES
)
