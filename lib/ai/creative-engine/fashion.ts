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

// Archetype-specific base wardrobes — 3 variations per archetype for visual diversity
const ARCHETYPE_WARDROBES: Record<string, Partial<FashionOutput>[]> = {
  "dark-luxury": [
    {
      top: "premium black leather jacket",
      bottom: "black tailored trousers",
      footwear: "Chelsea boots",
      accessories: ["minimal gold signet ring"],
    },
    {
      top: "draped black silk shirt with open collar",
      bottom: "slim black wool trousers",
      footwear: "polished leather loafers",
      accessories: ["thin gold chain necklace", "black onyx ring"],
    },
    {
      top: "structured charcoal wool overcoat over black turtleneck",
      bottom: "black slim-fit denim",
      footwear: "polished derby shoes",
      accessories: ["silver tie pin", "dark aviator sunglasses"],
    },
  ],
  "luxury-rap": [
    {
      top: "designer logo hoodie",
      bottom: "relaxed designer joggers",
      footwear: "premium statement sneakers",
      accessories: ["layered gold chains", "diamond stud earring"],
    },
    {
      top: "velvet bomber jacket over graphic tee",
      bottom: "tailored track pants with side stripe",
      footwear: "diamond-encrusted luxury sneakers",
      accessories: ["diamond pendant necklace", "gold pinky ring", "designer watch"],
    },
    {
      top: "fur-collared leather coat",
      bottom: "designer distressed jeans",
      footwear: "luxury high-top sneakers",
      accessories: ["layered platinum chains", "diamond grill", "branded bucket hat"],
    },
  ],
  "street-avant": [
    {
      top: "deconstructed oversized jacket",
      bottom: "wide-leg cargo trousers",
      footwear: "chunky platform boots",
      accessories: ["asymmetric silver ear cuff"],
    },
    {
      top: "patchwork denim jacket with raw edges",
      bottom: "extra wide-leg pleated trousers",
      footwear: "chunky lug-sole sneakers",
      accessories: ["woven leather wrist wrap", "safety pin ear chain"],
    },
    {
      top: "oversized utility vest over layered longline tee",
      bottom: "tapered parachute pants",
      footwear: "heavy combat boots",
      accessories: ["carabiner chain belt", "fingerless gloves"],
    },
  ],
  "minimal-pop": [
    {
      top: "clean crew-neck sweater",
      bottom: "slim tailored chinos",
      footwear: "minimal white sneakers",
      accessories: ["delicate chain necklace"],
    },
    {
      top: "relaxed-fit blazer over plain tee",
      bottom: "straight-leg vintage denim",
      footwear: "suede minimal loafers",
      accessories: ["thin gold bracelet", "small hoop earrings"],
    },
    {
      top: "cashmere quarter-zip sweater",
      bottom: "pleated wide-leg trousers",
      footwear: "clean suede low-top sneakers",
      accessories: ["minimalist watch", "single pendant necklace"],
    },
  ],
  "retro-soul": [
    {
      top: "vintage suede jacket",
      bottom: "corduroy straight-leg pants",
      footwear: "leather loafers",
      accessories: ["warm-toned beaded bracelet", "round sunglasses"],
    },
    {
      top: "ribbed knit turtleneck in burnt orange",
      bottom: "wide-leg wool trousers in earth tone",
      footwear: "suede chelsea boots",
      accessories: ["vintage aviator glasses", "leather pendant"],
    },
    {
      top: "silk patterned shirt with retro collar",
      bottom: "tapered corduroy pants",
      footwear: "vintage leather oxfords",
      accessories: ["gold chain bracelet", "tortoiseshell sunglasses"],
    },
  ],
  "cyber-future": [
    {
      top: "reflective techwear shell jacket",
      bottom: "tapered utility pants",
      footwear: "futuristic high-top sneakers",
      accessories: ["LED accent bracelet", "geometric silver pendant"],
    },
    {
      top: "matte black armor-plated moto jacket",
      bottom: "jogger-style cargo pants with zip pockets",
      footwear: "LED-accented chunky sneakers",
      accessories: ["holographic visor", "carbon fiber watch"],
    },
    {
      top: "translucent iridescent rain shell",
      bottom: "tapered technical cargos",
      footwear: "chrome-accented trail runners",
      accessories: ["neon wire ear piece", "reflective crossbody bag"],
    },
  ],
  "experimental-editorial": [
    {
      top: "sculptural oversized blazer",
      bottom: "avant-garde draped trousers",
      footwear: "artisan leather boots",
      accessories: ["statement sculptural earring"],
    },
    {
      top: "asymmetric wrap top with architectural seams",
      bottom: "voluminous balloon-leg pants",
      footwear: "platform sandals with sculptural heel",
      accessories: ["oversized geometric ring", "woven headband"],
    },
    {
      top: "cropped puffer vest with unusual proportions",
      bottom: "deconstructed skirt-pants hybrid",
      footwear: "knee-high pointed boots",
      accessories: ["layered chain belt", "abstract face brooch"],
    },
  ],
  "roots-ridim": [
    {
      top: "vibrant printed shirt",
      bottom: "tailored linen trousers",
      footwear: "leather sandals or clean sneakers",
      accessories: ["handcrafted beaded necklace", "warm gold cuff"],
    },
    {
      top: "dashiki-inspired tunic with embroidered neckline",
      bottom: "tailored joggers in warm earth tone",
      footwear: "woven leather sneakers",
      accessories: ["cowrie shell bracelet", "wooden bead necklace"],
    },
    {
      top: "bold patterned bomber jacket",
      bottom: "cropped tapered pants",
      footwear: "handmade leather boots",
      accessories: ["layered leather cord necklace", "brass arm cuff"],
    },
  ],
  "desert-noir": [
    {
      top: "worn leather duster coat",
      bottom: "dusty denim straight jeans",
      footwear: "weathered western boots",
      accessories: ["turquoise pendant", "leather wrap bracelet"],
    },
    {
      top: "shearling-lined suede jacket",
      bottom: "heavyweight canvas trousers",
      footwear: "suede chelsea boots with western heel",
      accessories: ["concho belt", "silver turquoise ring"],
    },
    {
      top: "faded western shirt with snap buttons",
      bottom: "dark selvedge denim",
      footwear: "tooled leather cowboy boots",
      accessories: ["bandana necktie", "antique silver belt buckle"],
    },
  ],
};

export function determineFashion(
  subject: SubjectAnalysis,
  archetype: ArchetypeDefinition,
  variantIndex: number = 0
): FashionOutput {
  const wardrobes = ARCHETYPE_WARDROBES[archetype.id] ?? ARCHETYPE_WARDROBES["dark-luxury"]!;
  const base = wardrobes[variantIndex % wardrobes.length]!;

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
