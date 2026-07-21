// ============================================================
// Fashion Rules Engine — Deterministic wardrobe selection
// ============================================================

import type { SubjectAnalysis, FashionOutput, ArchetypeDefinition } from "./types";

interface FashionRule {
  condition: (s: SubjectAnalysis) => boolean;
  apply: (out: Partial<FashionOutput>) => Partial<FashionOutput>;
}

const UNDERTONE_JEWELRY: FashionRule = {
  condition: (s) => s.face.undertone === "warm",
  apply: () => ({ accessories: ["layered gold jewelry"] }),
};

const COOL_UNDERTONE_JEWELRY: FashionRule = {
  condition: (s) => s.face.undertone === "cool",
  apply: () => ({ accessories: ["silver chain necklace", "silver rings"] }),
};

const BROAD_SHOULDERS: FashionRule = {
  condition: (s) => s.body.shoulders.toLowerCase().includes("broad") || s.body.build.toLowerCase().includes("athletic"),
  apply: () => ({ notes: "structured silhouette, cropped or tailored jacket to balance proportions" }),
};

const SLIM_BUILD: FashionRule = {
  condition: (s) => s.body.build.toLowerCase().includes("slim") || s.body.build.toLowerCase().includes("lean"),
  apply: () => ({ notes: "layered fit, relaxed trousers to add volume" }),
};

const ATHLETIC_BUILD: FashionRule = {
  condition: (s) => s.body.build.toLowerCase().includes("athletic") || s.body.build.toLowerCase().includes("muscular"),
  apply: () => ({ notes: "fitted tops to frame physique, structured trousers" }),
};

const SQUARE_FACE: FashionRule = {
  condition: (s) => s.face.shape.toLowerCase().includes("square"),
  apply: () => ({ notes: "open collar to elongate face" }),
};

const OVAL_FACE: FashionRule = {
  condition: (s) => s.face.shape.toLowerCase().includes("oval"),
  apply: () => ({ accessories: ["layered necklaces"] }),
};

const ALL_RULES: FashionRule[] = [
  UNDERTONE_JEWELRY,
  COOL_UNDERTONE_JEWELRY,
  SLIM_BUILD,
  ATHLETIC_BUILD,
  BROAD_SHOULDERS,
  SQUARE_FACE,
  OVAL_FACE,
];

// Archetype-specific base wardrobes
const ARCHETYPE_WARDROBES: Record<string, Partial<FashionOutput>> = {
  "dark-luxury": {
    top: "premium black leather jacket",
    bottom: "black tailored trousers",
    footwear: "Chelsea boots",
    accessories: ["minimal gold signet ring"],
  },
  "luxury-rap": {
    top: "designer logo hoodie",
    bottom: "relaxed designer joggers",
    footwear: "premium statement sneakers",
    accessories: ["layered gold chains", "diamond stud earring"],
  },
  "street-avant": {
    top: "deconstructed oversized jacket",
    bottom: "wide-leg cargo trousers",
    footwear: "chunky platform boots",
    accessories: ["asymmetric silver ear cuff"],
  },
  "minimal-pop": {
    top: "clean crew-neck sweater",
    bottom: "slim tailored chinos",
    footwear: "minimal white sneakers",
    accessories: ["delicate chain necklace"],
  },
  "retro-soul": {
    top: "vintage suede jacket",
    bottom: "corduroy straight-leg pants",
    footwear: "leather loafers",
    accessories: ["warm-toned beaded bracelet", "round sunglasses"],
  },
  "cyber-future": {
    top: "reflective techwear shell jacket",
    bottom: "tapered utility pants",
    footwear: "futuristic high-top sneakers",
    accessories: ["LED accent bracelet", "geometric silver pendant"],
  },
  "experimental-editorial": {
    top: "sculptural oversized blazer",
    bottom: "avant-garde draped trousers",
    footwear: "artisan leather boots",
    accessories: ["statement sculptural earring"],
  },
  "roots-ridim": {
    top: "vibrant printed shirt",
    bottom: "tailored linen trousers",
    footwear: "leather sandals or clean sneakers",
    accessories: ["handcrafted beaded necklace", "warm gold cuff"],
  },
  "desert-noir": {
    top: "worn leather duster coat",
    bottom: "dusty denim straight jeans",
    footwear: "weathered western boots",
    accessories: ["turquoise pendant", "leather wrap bracelet"],
  },
};

export function determineFashion(
  subject: SubjectAnalysis,
  archetype: ArchetypeDefinition
): FashionOutput {
  const base = ARCHETYPE_WARDROBES[archetype.id] ?? ARCHETYPE_WARDROBES["dark-luxury"]!;

  const output: FashionOutput = {
    top: base.top ?? "premium jacket",
    bottom: base.bottom ?? "tailored trousers",
    footwear: base.footwear ?? "leather boots",
    accessories: [...(base.accessories ?? [])],
    notes: base.notes,
  };

  for (const rule of ALL_RULES) {
    if (rule.condition(subject)) {
      const patch = rule.apply(output);
      if (patch.top) output.top = patch.top;
      if (patch.bottom) output.bottom = patch.bottom;
      if (patch.footwear) output.footwear = patch.footwear;
      if (patch.accessories) {
        output.accessories = [...new Set([...output.accessories, ...patch.accessories])];
      }
      if (patch.notes) {
        output.notes = output.notes ? `${output.notes}; ${patch.notes}` : patch.notes;
      }
    }
  }

  return output;
}

export function fashionToPromptText(fashion: FashionOutput): string {
  const parts = [fashion.top, fashion.bottom, fashion.footwear];
  if (fashion.accessories.length > 0) {
    parts.push(fashion.accessories.join(", "));
  }
  if (fashion.notes) {
    parts.push(fashion.notes);
  }
  return parts.join(", ");
}
