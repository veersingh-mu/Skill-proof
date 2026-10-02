/**
 * Polyfill Canvas/DOM globals for pdfjs-dist / pdf-parse in Node.js & serverless runtimes.
 * Prevents "ReferenceError: DOMMatrix is not defined" when @napi-rs/canvas is unavailable.
 */

class DOMMatrixPolyfill {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  m11 = 1;
  m12 = 0;
  m21 = 0;
  m22 = 1;
  m41 = 0;
  m42 = 0;

  constructor(init?: number[] | string) {
    if (Array.isArray(init) && init.length >= 6) {
      this.a = this.m11 = init[0];
      this.b = this.m12 = init[1];
      this.c = this.m21 = init[2];
      this.d = this.m22 = init[3];
      this.e = this.m41 = init[4];
      this.f = this.m42 = init[5];
    }
  }

  multiplySelf(other?: DOMMatrixPolyfill) {
    if (other) {
      const a = this.a * other.a + this.c * other.b;
      const b = this.b * other.a + this.d * other.b;
      const c = this.a * other.c + this.c * other.d;
      const d = this.b * other.c + this.d * other.d;
      const e = this.a * other.e + this.c * other.f + this.e;
      const f = this.b * other.e + this.d * other.f + this.f;
      this.a = this.m11 = a;
      this.b = this.m12 = b;
      this.c = this.m21 = c;
      this.d = this.m22 = d;
      this.e = this.m41 = e;
      this.f = this.m42 = f;
    }
    return this;
  }

  preMultiplySelf(other?: DOMMatrixPolyfill) {
    return this.multiplySelf(other);
  }

  translate(tx = 0, ty = 0) {
    this.e += tx * this.a + ty * this.c;
    this.f += tx * this.b + ty * this.d;
    this.m41 = this.e;
    this.m42 = this.f;
    return this;
  }

  scale(sx = 1, sy = sx) {
    this.a *= sx;
    this.b *= sx;
    this.c *= sy;
    this.d *= sy;
    this.m11 = this.a;
    this.m12 = this.b;
    this.m21 = this.c;
    this.m22 = this.d;
    return this;
  }

  invertSelf() {
    const det = this.a * this.d - this.b * this.c;
    if (det === 0) return this;
    const a = this.d / det;
    const b = -this.b / det;
    const c = -this.c / det;
    const d = this.a / det;
    const e = (this.c * this.f - this.d * this.e) / det;
    const f = (this.b * this.e - this.a * this.f) / det;
    this.a = this.m11 = a;
    this.b = this.m12 = b;
    this.c = this.m21 = c;
    this.d = this.m22 = d;
    this.e = this.m41 = e;
    this.f = this.m42 = f;
    return this;
  }

  getTransform() {
    return this;
  }
}

class Path2DPolyfill {
  addPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  bezierCurveTo() {}
  quadraticCurveTo() {}
  arc() {}
  rect() {}
}

class ImageDataPolyfill {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}

export function ensureCanvasPolyfills(): void {
  const g = globalThis as unknown as Record<string, unknown>;
  if (typeof g.DOMMatrix === "undefined") {
    g.DOMMatrix = DOMMatrixPolyfill;
  }
  if (typeof g.Path2D === "undefined") {
    g.Path2D = Path2DPolyfill;
  }
  if (typeof g.ImageData === "undefined") {
    g.ImageData = ImageDataPolyfill;
  }
}

ensureCanvasPolyfills();
