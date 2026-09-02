/**
 * Category name → Phosphor icon. The DB `icon` column stores emoji;
 * the UI never renders it — mapping is by name keywords instead.
 */
import {
  Lightning, Wrench, Snowflake, Hammer, PaintBrush, Broom, HardHat,
} from '@phosphor-icons/react';

const RULES = [
  { keywords: ['electr', 'solar', 'generator', 'wiring'], icon: Lightning },
  { keywords: ['plumb', 'pipe', 'borehole', 'water'], icon: Wrench },
  { keywords: ['ac', 'air condition', 'refriger', 'fridge', 'cool'], icon: Snowflake },
  { keywords: ['carpent', 'wood', 'furniture', 'cabinet', 'roof'], icon: Hammer },
  { keywords: ['paint', 'decor', 'pop', 'wall'], icon: PaintBrush },
  { keywords: ['clean', 'janitorial', 'fumigat'], icon: Broom },
];

/** @returns {import('@phosphor-icons/react').Icon} */
export const getCategoryIcon = (name) => {
  const n = String(name || '').toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => n.includes(k))) return rule.icon;
  }
  return HardHat;
};
