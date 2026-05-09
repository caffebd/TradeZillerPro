export interface ScaleCalibration {
  /** How many PDF user units equal one metre */
  pdfUnitsPerMetre: number;
  pageIndex: number;
}

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
