export type ProductUnit = "m2" | "m";

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: ProductUnit;
  unitPrice: number; // GBP
  color: number; // PixiJS hex color for annotation overlay
  colorHex: string; // CSS hex for UI swatches
}
