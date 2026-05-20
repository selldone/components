/*
 * Copyright (c) 2025. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

type Matrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];

type MatrixInput = Matrix | Matrix4 | number[];

function identity(): Matrix4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

function multiply(a: number[], b: number[]): Matrix4 {
  const out = new Array<number>(16).fill(0);

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      for (let i = 0; i < 4; i++) {
        out[col * 4 + row] += a[i * 4 + row] * b[col * 4 + i];
      }
    }
  }

  return out as Matrix4;
}

function perspective(distance: number): Matrix4 {
  const out = identity();
  out[11] = -1 / distance;
  return out;
}

function translate(x: number, y: number): Matrix4 {
  return translate3d(x, y, 0);
}

function translate3d(x: number, y: number, z: number): Matrix4 {
  const out = identity();
  out[12] = x;
  out[13] = y;
  out[14] = z;
  return out;
}

function rotateY(deg: number): Matrix4 {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return [
    cos, 0, -sin, 0,
    0, 1, 0, 0,
    sin, 0, cos, 0,
    0, 0, 0, 1,
  ];
}

function toString(matrix: number[]): string {
  return `matrix3d(${matrix.join(",")})`;
}

export default class Matrix {
  m: Matrix4;

  constructor(arg?: MatrixInput) {
    if (arg) {
      if (arg instanceof Matrix) {
        this.m = [...arg.m];
      } else {
        this.m = [...arg] as Matrix4;
      }
    } else {
      this.m = identity();
    }
  }
  clone() {
    return new Matrix(this);
  }
  multiply(m: number[]) {
    this.m = multiply(this.m, m);
  }
  perspective(d: number) {
    this.multiply(perspective(d));
  }
  transformX(x: number) {
    return (x * this.m[0] + this.m[12]) / (x * this.m[3] + this.m[15]);
  }
  translate(x: number, y: number) {
    this.multiply(translate(x, y));
  }
  translate3d(x: number, y: number, z: number) {
    this.multiply(translate3d(x, y, z));
  }
  rotateY(deg: number) {
    this.multiply(rotateY(deg));
  }
  toString() {
    return toString(this.m);
  }
}
