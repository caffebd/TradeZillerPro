import type { Product } from "@/types/product";

export const PRODUCTS: Product[] = [
  {
    id: "porcelain-tiles",
    name: "Porcelain Floor Tiles",
    category: "Flooring",
    unit: "m2",
    unitPrice: 45,
    color: 0x14b8a6,
    colorHex: "#14b8a6",
  },
  {
    id: "engineered-wood",
    name: "Engineered Wood Flooring",
    category: "Flooring",
    unit: "m2",
    unitPrice: 55,
    color: 0xf59e0b,
    colorHex: "#f59e0b",
  },
  {
    id: "carpet",
    name: "Carpet",
    category: "Flooring",
    unit: "m2",
    unitPrice: 25,
    color: 0x8b5cf6,
    colorHex: "#8b5cf6",
  },
  {
    id: "plasterboard-ceiling",
    name: "Plasterboard Ceiling",
    category: "Ceiling",
    unit: "m2",
    unitPrice: 28,
    color: 0x64748b,
    colorHex: "#64748b",
  },
  {
    id: "wall-tiles",
    name: "Wall Tiles (Bathroom)",
    category: "Walls",
    unit: "m2",
    unitPrice: 38,
    color: 0x06b6d4,
    colorHex: "#06b6d4",
  },
  {
    id: "partition-wall",
    name: "Partition Wall",
    category: "Walls",
    unit: "m",
    unitPrice: 85,
    color: 0xef4444,
    colorHex: "#ef4444",
  },
  {
    id: "external-brickwork",
    name: "External Brickwork",
    category: "External",
    unit: "m",
    unitPrice: 95,
    color: 0xf97316,
    colorHex: "#f97316",
  },
];

export const PRODUCTS_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));
