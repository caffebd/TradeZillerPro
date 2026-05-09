import { create } from "zustand";
import type { Annotation } from "@/types/annotation";
import type { Product } from "@/types/product";
import {
  polygonArea,
  polylineLength,
  pointDistance,
} from "@/types/annotation";
import { pdfAreaToM2, pdfLengthToMetres } from "@/types/scale";
import type { ScaleCalibration } from "@/types/scale";
import { PRODUCTS_MAP } from "@/data/products";

export interface TakeoffLine {
  annotation: Annotation;
  product: Product;
  /** m² or m depending on product unit */
  measurement: number;
  cost: number;
  unit: "m2" | "m";
}

interface ProductStore {
  getTakeoffs: (
    annotations: Annotation[],
    calibration: ScaleCalibration | null
  ) => TakeoffLine[];
}

export const useProductStore = create<ProductStore>(() => ({
  getTakeoffs: (annotations, calibration) => {
    const lines: TakeoffLine[] = [];

    for (const ann of annotations) {
      if (!ann.productId) continue;
      const product = PRODUCTS_MAP.get(ann.productId);
      if (!product) continue;

      let pdfMeasure = 0;

      if (ann.type === "area") {
        pdfMeasure = polygonArea(ann.points);
      } else if (ann.type === "line") {
        pdfMeasure = pointDistance(ann.start, ann.end);
      } else if (ann.type === "polyline") {
        pdfMeasure = polylineLength(ann.points);
      }

      if (pdfMeasure === 0) continue;

      let measurement = pdfMeasure;
      let unit: "m2" | "m" = product.unit;

      if (calibration) {
        if (product.unit === "m2" && ann.type === "area") {
          measurement = pdfAreaToM2(pdfMeasure, calibration);
        } else if (product.unit === "m") {
          measurement = pdfLengthToMetres(pdfMeasure, calibration);
        }
      } else {
        // No scale set — show raw PDF units
        measurement = pdfMeasure;
      }

      const cost = measurement * product.unitPrice;
      lines.push({ annotation: ann, product, measurement, cost, unit });
    }

    return lines;
  },
}));
