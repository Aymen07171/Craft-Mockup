export interface PrintifyTemplateRef {
  id: string;
  brand: 'apple' | 'samsung';
  modelName: string;
  category: 'iPhone' | 'Samsung';
  dimensions: {
    resolutionDpi: number;
    pixelWidth: number;
    pixelHeight: number;
    mmWidth: number;
    mmHeight: number;
    inchWidth: number;
    inchHeight: number;
  };
  cameraCutout: {
    type: 'square-diagonal-dual' | 'square-triple-pro' | 'pill-vertical' | 'pill-horizontal' | 'floating-vertical' | 'center-rounded';
    position: 'top-left' | 'top-center';
    description: string;
    aspectRatio: number; // width / height
    cornerCurvature: 'round' | 'tight' | 'sharp';
  };
  caseFeatures: {
    toughBumper: boolean;
    raisedBezel: boolean;
    wrapBleed: boolean;
  };
}

export const PRINTIFY_TEMPLATES: PrintifyTemplateRef[] = [
  // iPhone Models
  {
    id: 'iphone-15-pro-max',
    brand: 'apple',
    modelName: 'iPhone 15 Pro Max',
    category: 'iPhone',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1289,
      pixelHeight: 2264,
      mmWidth: 109.14,
      mmHeight: 191.68,
      inchWidth: 4.3,
      inchHeight: 7.55,
    },
    cameraCutout: {
      type: 'square-triple-pro',
      position: 'top-left',
      description: 'Square plateau with rounded corners and 3 large triangular camera lenses + LiDAR',
      aspectRatio: 1289 / 2264,
      cornerCurvature: 'round',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'iphone-15-pro',
    brand: 'apple',
    modelName: 'iPhone 15 Pro',
    category: 'iPhone',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1201,
      pixelHeight: 2080,
      mmWidth: 101.69,
      mmHeight: 176.11,
      inchWidth: 4.0,
      inchHeight: 6.93,
    },
    cameraCutout: {
      type: 'square-triple-pro',
      position: 'top-left',
      description: 'Square plateau with rounded corners and 3 protruding Pro lenses',
      aspectRatio: 1201 / 2080,
      cornerCurvature: 'round',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'iphone-15',
    brand: 'apple',
    modelName: 'iPhone 15',
    category: 'iPhone',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1201,
      pixelHeight: 2080,
      mmWidth: 101.69,
      mmHeight: 176.11,
      inchWidth: 4.0,
      inchHeight: 6.93,
    },
    cameraCutout: {
      type: 'square-diagonal-dual',
      position: 'top-left',
      description: 'Square rounded plateau with 2 diagonal dual lenses',
      aspectRatio: 1201 / 2080,
      cornerCurvature: 'round',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'iphone-14-pro-max',
    brand: 'apple',
    modelName: 'iPhone 14 Pro Max',
    category: 'iPhone',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1289,
      pixelHeight: 2264,
      mmWidth: 109.14,
      mmHeight: 191.68,
      inchWidth: 4.3,
      inchHeight: 7.55,
    },
    cameraCutout: {
      type: 'square-triple-pro',
      position: 'top-left',
      description: 'Pro Max massive square camera plateau with triple lenses',
      aspectRatio: 1289 / 2264,
      cornerCurvature: 'round',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'iphone-14',
    brand: 'apple',
    modelName: 'iPhone 14',
    category: 'iPhone',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1201,
      pixelHeight: 2080,
      mmWidth: 101.69,
      mmHeight: 176.11,
      inchWidth: 4.0,
      inchHeight: 6.93,
    },
    cameraCutout: {
      type: 'square-diagonal-dual',
      position: 'top-left',
      description: 'Square cutout with diagonal dual lenses',
      aspectRatio: 1201 / 2080,
      cornerCurvature: 'round',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'iphone-13',
    brand: 'apple',
    modelName: 'iPhone 13',
    category: 'iPhone',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1211,
      pixelHeight: 2097,
      mmWidth: 102.53,
      mmHeight: 177.57,
      inchWidth: 4.037,
      inchHeight: 6.991,
    },
    cameraCutout: {
      type: 'square-diagonal-dual',
      position: 'top-left',
      description: 'Diagonal dual-camera lens cutout',
      aspectRatio: 1211 / 2097,
      cornerCurvature: 'round',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'iphone-13-mini',
    brand: 'apple',
    modelName: 'iPhone 13 Mini',
    category: 'iPhone',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1126,
      pixelHeight: 1922,
      mmWidth: 95.36,
      mmHeight: 162.75,
      inchWidth: 3.754,
      inchHeight: 6.407,
    },
    cameraCutout: {
      type: 'square-diagonal-dual',
      position: 'top-left',
      description: 'Compact chassis with diagonal dual-camera lenses',
      aspectRatio: 1126 / 1922,
      cornerCurvature: 'round',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'iphone-11',
    brand: 'apple',
    modelName: 'iPhone 11',
    category: 'iPhone',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1290,
      pixelHeight: 2160,
      mmWidth: 109.22,
      mmHeight: 182.88,
      inchWidth: 4.3,
      inchHeight: 7.2,
    },
    cameraCutout: {
      type: 'square-diagonal-dual',
      position: 'top-left',
      description: 'Dual vertical lens square island',
      aspectRatio: 1290 / 2160,
      cornerCurvature: 'round',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'iphone-x-xs',
    brand: 'apple',
    modelName: 'iPhone X / XS',
    category: 'iPhone',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1125,
      pixelHeight: 1900,
      mmWidth: 95.25,
      mmHeight: 160.87,
      inchWidth: 3.78,
      inchHeight: 6.37,
    },
    cameraCutout: {
      type: 'pill-vertical',
      position: 'top-left',
      description: 'Vertical dual-lens capsule pill cutout',
      aspectRatio: 1125 / 1900,
      cornerCurvature: 'round',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },

  // Samsung Models
  {
    id: 'samsung-s24',
    brand: 'samsung',
    modelName: 'Samsung Galaxy S24',
    category: 'Samsung',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1192,
      pixelHeight: 2069,
      mmWidth: 100.92,
      mmHeight: 175.18,
      inchWidth: 3.97,
      inchHeight: 6.90,
    },
    cameraCutout: {
      type: 'floating-vertical',
      position: 'top-left',
      description: 'Vertical column of 3 distinct floating circular camera lenses with flash notch cutout',
      aspectRatio: 1192 / 2069,
      cornerCurvature: 'sharp',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'samsung-s23',
    brand: 'samsung',
    modelName: 'Samsung Galaxy S23',
    category: 'Samsung',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1192,
      pixelHeight: 2069,
      mmWidth: 100.92,
      mmHeight: 175.18,
      inchWidth: 3.97,
      inchHeight: 6.90,
    },
    cameraCutout: {
      type: 'floating-vertical',
      position: 'top-left',
      description: 'Vertical 3-camera cutout array with curved top flash contour',
      aspectRatio: 1192 / 2069,
      cornerCurvature: 'sharp',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'samsung-s22',
    brand: 'samsung',
    modelName: 'Samsung Galaxy S22',
    category: 'Samsung',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1192,
      pixelHeight: 2069,
      mmWidth: 100.92,
      mmHeight: 175.18,
      inchWidth: 3.97,
      inchHeight: 6.90,
    },
    cameraCutout: {
      type: 'floating-vertical',
      position: 'top-left',
      description: 'Contour-cut camera island wrapping edge with circular flash cutout',
      aspectRatio: 1192 / 2069,
      cornerCurvature: 'sharp',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'samsung-s21',
    brand: 'samsung',
    modelName: 'Samsung Galaxy S21',
    category: 'Samsung',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1192,
      pixelHeight: 2069,
      mmWidth: 100.92,
      mmHeight: 175.18,
      inchWidth: 3.97,
      inchHeight: 6.90,
    },
    cameraCutout: {
      type: 'floating-vertical',
      position: 'top-left',
      description: 'Contour-cut camera housing flush with edge with flash notch cutout',
      aspectRatio: 1192 / 2069,
      cornerCurvature: 'sharp',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
  {
    id: 'samsung-s6',
    brand: 'samsung',
    modelName: 'Samsung Galaxy S6',
    category: 'Samsung',
    dimensions: {
      resolutionDpi: 300,
      pixelWidth: 1212,
      pixelHeight: 2050,
      mmWidth: 102.70,
      mmHeight: 173.65,
      inchWidth: 4.04,
      inchHeight: 6.84,
    },
    cameraCutout: {
      type: 'center-rounded',
      position: 'top-center',
      description: 'Centered horizontal rounded camera and flash sensor module',
      aspectRatio: 1212 / 2050,
      cornerCurvature: 'round',
    },
    caseFeatures: { toughBumper: true, raisedBezel: true, wrapBleed: true },
  },
];
