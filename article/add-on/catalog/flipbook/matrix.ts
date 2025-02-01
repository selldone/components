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

import {
    identity,
    multiply,
    perspective,
    translate,
    translate3d,
    rotateY,
    toString
} from "rematrix";

export default class Matrix {
    constructor(arg) {
        if (arg) {
            if (arg.m) {
                this.m = [...arg.m];
            } else {
                this.m = [...arg];
            }
        } else {
            this.m = identity();
        }
    }
    clone() {
        return new Matrix(this);
    }
    multiply(m) {
        this.m = multiply(this.m, m);
    }
    perspective(d) {
        this.multiply(perspective(d));
    }
    transformX(x) {
        return (x * this.m[0] + this.m[12]) / (x * this.m[3] + this.m[15]);
    }
    translate(x, y) {
        this.multiply(translate(x, y));
    }
    translate3d(x, y, z) {
        this.multiply(translate3d(x, y, z));
    }
    rotateY(deg) {
        this.multiply(rotateY(deg));
    }
    toString() {
        return toString(this.m);
    }
}
