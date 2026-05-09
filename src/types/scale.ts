export interface ScaleCalibration {
  /** How many PDF user units equal one metre */
  pdfUnitsPerMetre: number;
  pageIndex: number;
}

export const FEET_PER_METRE = 3.28084;
export const FT2_PER_M2 = FEET_PER_METRE * FEET_PER_METRE;

/** Convert PDF area (square units) to square metres */
export function pdfAreaToM2(
  pdfArea: number,
  cal: ScaleCalibration
): number {
  return pdfArea / (cal.pdfUnitsPerMetre * cal.pdfUnitsPerMetre);
}

/** Convert PDF length (units) to metres */
export function pdfLengthToMetres(
  pdfLength: number,
  cal: ScaleCalibration
): number {
  return pdfLength / cal.pdfUnitsPerMetre;
}

export function metresToFeet(metres: number): number {
  return metres * FEET_PER_METRE;
}

export function m2ToFt2(m2: number): number {
  return m2 * FT2_PER_M2;
}
