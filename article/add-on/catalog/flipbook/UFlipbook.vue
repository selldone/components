<template>
  <div>
    <slot
        v-bind="{
        canFlipLeft,
        canFlipRight,
        canZoomIn,
        canZoomOut,
        page,
        numPages,
        flipLeft,
        flipRight,
        zoomIn,
        zoomOut
      }"
    />
    <div
        class="viewport"
        ref="viewport"
        :class="{ zoom: zooming || zoom > 1, 'drag-to-scroll': dragToScroll }"
        :style="{ cursor: cursor === 'grabbing' ? 'grabbing' : 'auto' }"
        @touchmove="onTouchMove"
        @pointermove="onPointerMove"
        @mousemove="onMouseMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @mouseup="onMouseUp"
        @wheel="onWheel"
    >
      <div class="flipbook-container" :style="{ transform: `scale(${zoom})` }">
        <div
            class="click-to-flip left"
            :style="{ cursor: canFlipLeft ? 'pointer' : 'auto' }"
            @click="flipLeft"
        />
        <div
            class="click-to-flip right"
            :style="{ cursor: canFlipRight ? 'pointer' : 'auto' }"
            @click="flipRight"
        />
        <div :style="{ transform: `translateX(${centerOffsetSmoothed}px)` }">
          <img
              class="page fixed"
              :style="{
              width: pageWidth + 'px',
              height: pageHeight + 'px',
              left: xMargin + 'px',
              top: yMargin + 'px'
            }"
              :src="pageUrlLoading(leftPage, true)"
              v-if="showLeftPage"
              @load="didLoadImage"
          />
          <img
              class="page fixed"
              :style="{
              width: pageWidth + 'px',
              height: pageHeight + 'px',
              left: viewWidth / 2 + 'px',
              top: yMargin + 'px'
            }"
              v-if="showRightPage"
              :src="pageUrlLoading(rightPage, true)"
              @load="didLoadImage"
          />
          <div :style="{ opacity: flip.opacity }">
            <div
                v-for="([key, bgImage, lighting, bgPos, transform, z], index) in polygonArray"
                :key="key"
                class="polygon"
                :class="{ blank: !bgImage }"
                :style="{
                backgroundImage: bgImage ? `url(${loadImage(bgImage)})` : '',
                backgroundSize: polygonBgSize,
                backgroundPosition: bgPos,
                width: polygonWidth,
                height: polygonHeight,
                transform: transform,
                zIndex: z
              }"
            >
              <div
                  class="lighting"
                  v-show="lighting.length"
                  :style="{ backgroundImage: lighting }"
              />
            </div>
          </div>
          <div
              class="bounding-box"
              :style="{
              left: boundingLeft + 'px',
              top: yMargin + 'px',
              width: boundingRight - boundingLeft + 'px',
              height: pageHeight + 'px',
              cursor: cursor
            }"
              @touchstart="onTouchStart"
              @pointerdown="onPointerDown"
              @mousedown="onMouseDown"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Matrix from "./matrix.ts";
import spinner from "./spinner.svg";

// easing functions
function easeIn(x) {
  return Math.pow(x, 2);
}
function easeOut(x) {
  return 1 - easeIn(1 - x);
}
function easeInOut(x) {
  return x < 0.5 ? easeIn(x * 2) / 2 : 0.5 + easeOut((x - 0.5) * 2) / 2;
}

export default {
  name: "UFlipbook",
  props: {
    pages: {
      type: Array,
      required: true
    },
    pagesHiRes: {
      type: Array,
      default: () => []
    },
    flipDuration: {
      type: Number,
      default: 1000
    },
    zoomDuration: {
      type: Number,
      default: 500
    },
    zooms: {
      type: Array,
      default: () => [1, 2, 4]
    },
    perspective: {
      type: Number,
      default: 2400
    },
    nPolygons: {
      type: Number,
      default: 10
    },
    ambient: {
      type: Number,
      default: 0.4
    },
    gloss: {
      type: Number,
      default: 0.6
    },
    swipeMin: {
      type: Number,
      default: 3
    },
    singlePage: {
      type: Boolean,
      default: false
    },
    forwardDirection: {
      type: String,
      validator: (val) => val === "right" || val === "left",
      default: "right"
    },
    centering: {
      type: Boolean,
      default: true
    },
    startPage: {
      type: Number,
      default: null
    },
    loadingImage: {
      type: String,
      default: spinner
    },
    clickToZoom: {
      type: Boolean,
      default: true
    },
    dragToFlip: {
      type: Boolean,
      default: true
    },
    wheel: {
      type: String,
      default: "scroll"
    }
  },
  data() {
    return {
      viewWidth: 0,
      viewHeight: 0,
      imageWidth: null,
      imageHeight: null,
      displayedPages: 1,
      nImageLoad: 0,
      nImageLoadTrigger: 0,
      imageLoadCallback: null,
      currentPage: 0,
      firstPage: 0,
      secondPage: 1,
      zoomIndex: 0,
      zoom: 1,
      zooming: false,
      touchStartX: null,
      touchStartY: null,
      maxMove: 0,
      activeCursor: null,
      hasTouchEvents: false,
      hasPointerEvents: false,
      minX: Infinity,
      maxX: -Infinity,
      preloadedImages: {},
      flip: {
        progress: 0,
        direction: null,
        frontImage: null,
        backImage: null,
        auto: false,
        opacity: 1
      },
      currentCenterOffset: null,
      animatingCenter: false,
      startScrollLeft: 0,
      startScrollTop: 0,
      scrollLeft: 0,
      scrollTop: 0,
      loadedImages: {}
    };
  },
  computed: {
    IE() {
      return typeof navigator !== "undefined" && /Trident/.test(navigator.userAgent);
    },
    canFlipLeft() {
      return this.forwardDirection === "left" ? this.canGoForward : this.canGoBack;
    },
    canFlipRight() {
      return this.forwardDirection === "right" ? this.canGoForward : this.canGoBack;
    },
    canZoomIn() {
      return !this.zooming && this.zoomIndex < this.zooms_.length - 1;
    },
    canZoomOut() {
      return !this.zooming && this.zoomIndex > 0;
    },
    numPages() {
      return this.pages[0] == null ? this.pages.length - 1 : this.pages.length;
    },
    page() {
      return this.pages[0] != null ? this.currentPage + 1 : Math.max(1, this.currentPage);
    },
    zooms_() {
      return this.zooms || [1];
    },
    canGoForward() {
      return !this.flip.direction && this.currentPage < this.pages.length - this.displayedPages;
    },
    canGoBack() {
      return (
          !this.flip.direction &&
          this.currentPage >= this.displayedPages &&
          !(this.displayedPages === 1 && !this.pageUrl(this.firstPage - 1))
      );
    },
    leftPage() {
      return this.forwardDirection === "right" || this.displayedPages === 1
          ? this.firstPage
          : this.secondPage;
    },
    rightPage() {
      return this.forwardDirection === "left" ? this.firstPage : this.secondPage;
    },
    showLeftPage() {
      return this.pageUrl(this.leftPage);
    },
    showRightPage() {
      return this.pageUrl(this.rightPage) && this.displayedPages === 2;
    },
    cursor() {
      if (this.activeCursor) {
        return this.activeCursor;
      } else if (this.IE) {
        return "auto";
      } else if (this.clickToZoom && this.canZoomIn && this.zoom!==1) {
        return "zoom-in";
      } else if (this.clickToZoom && this.canZoomOut  && this.zoom!==1) {
        return "zoom-out";
      } else if (this.dragToFlip) {
        return "grab";
      } else {
        return "auto";
      }
    },
    pageScale() {
      const vw = this.viewWidth / this.displayedPages;
      const xScale = vw / this.imageWidth;
      const yScale = this.viewHeight / this.imageHeight;
      const scale = xScale < yScale ? xScale : yScale;
      return scale < 1 ? scale : 1;
    },
    pageWidth() {
      return Math.round(this.imageWidth * this.pageScale);
    },
    pageHeight() {
      return Math.round(this.imageHeight * this.pageScale);
    },
    xMargin() {
      return (this.viewWidth - this.pageWidth * this.displayedPages) / 2;
    },
    yMargin() {
      return (this.viewHeight - this.pageHeight) / 2;
    },
    polygonWidth() {
      let w = this.pageWidth / this.nPolygons;
      w = Math.ceil(w + 1 / this.zoom);
      return w + "px";
    },
    polygonHeight() {
      return this.pageHeight + "px";
    },
    polygonBgSize() {
      return `${this.pageWidth}px ${this.pageHeight}px`;
    },
    polygonArray() {
      return this.makePolygonArray("front").concat(this.makePolygonArray("back"));
    },
    boundingLeft() {
      if (this.displayedPages === 1) {
        return this.xMargin;
      } else {
        const x = this.pageUrl(this.leftPage) ? this.xMargin : this.viewWidth / 2;
        return x < this.minX ? x : this.minX;
      }
    },
    boundingRight() {
      if (this.displayedPages === 1) {
        return this.viewWidth - this.xMargin;
      } else {
        const x = this.pageUrl(this.rightPage) ? this.viewWidth - this.xMargin : this.viewWidth / 2;
        return x > this.maxX ? x : this.maxX;
      }
    },
    centerOffset() {
      return this.centering
          ? Math.round(this.viewWidth / 2 - (this.boundingLeft + this.boundingRight) / 2)
          : 0;
    },
    centerOffsetSmoothed() {
      return Math.round(this.currentCenterOffset);
    },
    dragToScroll() {
      return !this.hasTouchEvents;
    },
    scrollLeftMin() {
      const w = (this.boundingRight - this.boundingLeft) * this.zoom;
      if (w < this.viewWidth) {
        return (this.boundingLeft + this.centerOffsetSmoothed) * this.zoom - (this.viewWidth - w) / 2;
      } else {
        return (this.boundingLeft + this.centerOffsetSmoothed) * this.zoom;
      }
    },
    scrollLeftMax() {
      const w = (this.boundingRight - this.boundingLeft) * this.zoom;
      if (w < this.viewWidth) {
        return (this.boundingLeft + this.centerOffsetSmoothed) * this.zoom - (this.viewWidth - w) / 2;
      } else {
        return (this.boundingRight + this.centerOffsetSmoothed) * this.zoom - this.viewWidth;
      }
    },
    scrollTopMin() {
      const h = this.pageHeight * this.zoom;
      if (h < this.viewHeight) {
        return this.yMargin * this.zoom - (this.viewHeight - h) / 2;
      } else {
        return this.yMargin * this.zoom;
      }
    },
    scrollTopMax() {
      const h = this.pageHeight * this.zoom;
      if (h < this.viewHeight) {
        return this.yMargin * this.zoom - (this.viewHeight - h) / 2;
      } else {
        return (this.yMargin + this.pageHeight) * this.zoom - this.viewHeight;
      }
    },
    scrollLeftLimited() {
      return Math.min(this.scrollLeftMax, Math.max(this.scrollLeftMin, this.scrollLeft));
    },
    scrollTopLimited() {
      return Math.min(this.scrollTopMax, Math.max(this.scrollTopMin, this.scrollTop));
    }
  },
  mounted() {
    window.addEventListener("resize", this.onResize, { passive: true });
    this.onResize();
    this.zoom = this.zooms_[0];
    this.goToPage(this.startPage);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize, { passive: true });
  },
  methods: {
    onResize() {
      const viewport = this.$refs.viewport;
      if (!viewport) return;
      this.viewWidth = viewport.clientWidth;
      this.viewHeight = viewport.clientHeight;
      this.displayedPages = this.viewWidth > this.viewHeight && !this.singlePage ? 2 : 1;
      if (this.displayedPages === 2) {
        this.currentPage &= ~1; // clear lowest bit
      }
      this.fixFirstPage();
      this.minX = Infinity;
      this.maxX = -Infinity;
    },
    fixFirstPage() {
      if (this.displayedPages === 1 && this.currentPage === 0 && this.pages.length && !this.pageUrl(0)) {
        this.currentPage++;
      }
    },
    pageUrl(page, hiRes = false) {
      if (hiRes && this.zoom > 1 && !this.zooming) {
        const url = this.pagesHiRes[page];
        if (url) return url;
      }
      return this.pages[page] || null;
    },
    pageUrlLoading(page, hiRes = false) {
      const url = this.pageUrl(page, hiRes);
      // High‑res image doesn’t use “loading”
      if (hiRes && this.zoom > 1 && !this.zooming) return url;
      return url && this.loadImage(url);
    },
    flipLeft() {
      if (!this.canFlipLeft) return;
      this.flipStart("left", true);
    },
    flipRight() {
      if (!this.canFlipRight) return;
      this.flipStart("right", true);
    },
    makePolygonArray(face: "front" | "back"): Array<[string, string | null, string, string, string, number]> {
      // If image dimensions are not yet available, skip computing polygons.
      if (!this.imageWidth || !this.imageHeight) {
        return [];
      }

      // If no flip is in progress, return an empty array.
      if (!this.flip.direction) return [];

      // Determine effective progress and flip direction.
      let progress = this.flip.progress;
      let direction = this.flip.direction;
      if (this.displayedPages === 1 && direction !== this.forwardDirection) {
        progress = 1 - progress;
        direction = this.forwardDirection;
      }

      // Compute opacity locally (do not update reactive state here).
      const opacity = (this.displayedPages === 1 && progress > 0.7)
          ? 1 - (progress - 0.7) / 0.3
          : 1;
      // (Optionally, update this.flip.opacity outside this function.)

      // Select the image based on the face.
      const image = face === "front" ? this.flip.frontImage : this.flip.backImage;
      const polygonWidth = this.pageWidth / this.nPolygons;
      let pageX = this.xMargin;
      let originRight = false;

      // Determine the starting X offset and origin based on displayed pages and flip direction.
      if (this.displayedPages === 1) {
        if (this.forwardDirection === "right") {
          if (face === "back") {
            originRight = true;
            pageX = this.xMargin - this.pageWidth;
          }
        } else {
          if (direction === "left") {
            if (face === "back") {
              pageX = this.pageWidth - this.xMargin;
            } else {
              originRight = true;
            }
          } else {
            if (face === "front") {
              pageX = this.pageWidth - this.xMargin;
            } else {
              originRight = true;
            }
          }
        }
      } else {
        if (direction === "left") {
          if (face === "back") {
            pageX = this.viewWidth / 2;
          } else {
            originRight = true;
          }
        } else {
          if (face === "front") {
            pageX = this.viewWidth / 2;
          } else {
            originRight = true;
          }
        }
      }

      // Build a transformation matrix for the page.
      const pageMatrix = new Matrix();
      pageMatrix.translate(this.viewWidth / 2, 0);
      pageMatrix.perspective(this.perspective);
      pageMatrix.translate(-this.viewWidth / 2, 0);
      pageMatrix.translate(pageX, this.yMargin);

      // Calculate page rotation.
      let pageRotation = 0;
      if (progress > 0.5) {
        pageRotation = -(progress - 0.5) * 2 * 180;
      }
      if (direction === "left") {
        pageRotation = -pageRotation;
      }
      if (face === "back") {
        pageRotation += 180;
      }
      if (pageRotation) {
        if (originRight) {
          pageMatrix.translate(this.pageWidth, 0);
        }
        pageMatrix.rotateY(pageRotation);
        if (originRight) {
          pageMatrix.translate(-this.pageWidth, 0);
        }
      }

      // Determine the angle for the page flip.
      let theta = progress < 0.5
          ? progress * 2 * Math.PI
          : (1 - (progress - 0.5) * 2) * Math.PI;
      if (theta === 0) theta = 1e-9; // avoid division by zero
      const radius = this.pageWidth / theta;
      let radian = 0;
      const dRadian = theta / this.nPolygons;
      let rotate = (dRadian / 2 / Math.PI) * 180;
      let dRotate = (dRadian / Math.PI) * 180;
      if (originRight) {
        rotate = -theta / Math.PI * 180 + dRotate / 2;
      }
      if (face === "back") {
        rotate = -rotate;
        dRotate = -dRotate;
      }

      // Use local variables for min/max X values.
      let localMinX = Infinity;
      let localMaxX = -Infinity;
      const polygons: Array<[string, string | null, string, string, string, number]> = [];

      // For each polygon segment, compute its transform.
      for (let i = 0; i < this.nPolygons; i++) {
        const bgPos = `${(i / (this.nPolygons - 1)) * 100}% 0px`;
        const m = pageMatrix.clone();
        const rad = originRight ? theta - radian : radian;
        let x = Math.sin(rad) * radius;
        if (originRight) {
          x = this.pageWidth - x;
        }
        let z = (1 - Math.cos(rad)) * radius;
        if (face === "back") {
          z = -z;
        }

        // If any computed value is NaN, skip this segment.
        if (isNaN(x) || isNaN(z)) {
          continue;
        }

        m.translate3d(x, 0, z);
        m.rotateY(-rotate);
        const x0 = m.transformX(0);
        const x1 = m.transformX(polygonWidth);
        localMaxX = Math.max(x0, x1, localMaxX);
        localMinX = Math.min(x0, x1, localMinX);
        const lighting = this.computeLighting(pageRotation - rotate, dRotate);
        radian += dRadian;
        rotate += dRotate;
        polygons.push([face + i, image, lighting, bgPos, m.toString(), Math.abs(Math.round(z))]);
      }

      // (Optional) If you need to update reactive min/max values, do so in a watcher or separate method.
      return polygons;
    }
,
    computeLighting(rot, dRotate) {
      const gradients = [];
      const lightingPoints = [-0.5, -0.25, 0, 0.25, 0.5];
      if (this.ambient < 1) {
        const blackness = 1 - this.ambient;
        const diffuse = lightingPoints.map(
            (d) => (1 - Math.cos((rot - dRotate * d) / 180 * Math.PI)) * blackness
        );
        gradients.push(`linear-gradient(to right,
            rgba(0, 0, 0, ${diffuse[0]}),
            rgba(0, 0, 0, ${diffuse[1]}) 25%,
            rgba(0, 0, 0, ${diffuse[2]}) 50%,
            rgba(0, 0, 0, ${diffuse[3]}) 75%,
            rgba(0, 0, 0, ${diffuse[4]}))`);
      }
      if (this.gloss > 0 && !this.IE) {
        const DEG = 30;
        const POW = 200;
        const specular = lightingPoints.map((d) =>
            Math.max(
                Math.cos((rot + DEG - dRotate * d) / 180 * Math.PI) ** POW,
                Math.cos((rot - DEG - dRotate * d) / 180 * Math.PI) ** POW
            )
        );
        gradients.push(`linear-gradient(to right,
            rgba(255, 255, 255, ${specular[0] * this.gloss}),
            rgba(255, 255, 255, ${specular[1] * this.gloss}) 25%,
            rgba(255, 255, 255, ${specular[2] * this.gloss}) 50%,
            rgba(255, 255, 255, ${specular[3] * this.gloss}) 75%,
            rgba(255, 255, 255, ${specular[4] * this.gloss}))`);
      }
      return gradients.join(",");
    },
    flipStart(direction, auto) {
      if (direction !== this.forwardDirection) {
        if (this.displayedPages === 1) {
          this.flip.frontImage = this.pageUrl(this.currentPage - 1);
          this.flip.backImage = null;
        } else {
          this.flip.frontImage = this.pageUrl(this.firstPage);
          this.flip.backImage = this.pageUrl(this.currentPage - this.displayedPages + 1);
        }
      } else {
        if (this.displayedPages === 1) {
          this.flip.frontImage = this.pageUrl(this.currentPage);
          this.flip.backImage = null;
        } else {
          this.flip.frontImage = this.pageUrl(this.secondPage);
          this.flip.backImage = this.pageUrl(this.currentPage + this.displayedPages);
        }
      }
      this.flip.direction = direction;
      this.flip.progress = 0;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this.flip.direction !== this.forwardDirection) {
            if (this.displayedPages === 2) {
              this.firstPage = this.currentPage - this.displayedPages;
            }
          } else {
            if (this.displayedPages === 1) {
              this.firstPage = this.currentPage + this.displayedPages;
            } else {
              this.secondPage = this.currentPage + 1 + this.displayedPages;
            }
          }
          if (auto) {
            this.flipAuto(true);
          }
        });
      });
    },
    flipAuto(ease) {
      const t0 = Date.now();
      const duration = this.flipDuration * (1 - this.flip.progress);
      const startRatio = this.flip.progress;
      this.flip.auto = true;
      this.$emit(`flip-${this.flip.direction}-start`, this.page);
      const animate = () => {
        const t = Date.now() - t0;
        let ratio = startRatio + t / duration;
        if (ratio > 1) ratio = 1;
        this.flip.progress = ease ? easeInOut(ratio) : ratio;
        if (ratio < 1) {
          requestAnimationFrame(animate);
        } else {
          if (this.flip.direction !== this.forwardDirection) {
            this.currentPage -= this.displayedPages;
          } else {
            this.currentPage += this.displayedPages;
          }
          this.$emit(`flip-${this.flip.direction}-end`, this.page);
          if (this.displayedPages === 1 && this.flip.direction === this.forwardDirection) {
            this.flip.direction = null;
          } else {
            this.onImageLoad(1, () => (this.flip.direction = null));
          }
          this.flip.auto = false;
        }
      };
      animate();
    },
    flipRevert() {
      const t0 = Date.now();
      const duration = this.flipDuration * this.flip.progress;
      const startRatio = this.flip.progress;
      this.flip.auto = true;
      const animate = () => {
        const t = Date.now() - t0;
        let ratio = startRatio - (startRatio * t) / duration;
        if (ratio < 0) ratio = 0;
        this.flip.progress = ratio;
        if (ratio > 0) {
          requestAnimationFrame(animate);
        } else {
          this.firstPage = this.currentPage;
          this.secondPage = this.currentPage + 1;
          if (this.displayedPages === 1 && this.flip.direction !== this.forwardDirection) {
            this.flip.direction = null;
          } else {
            this.onImageLoad(1, () => (this.flip.direction = null));
          }
          this.flip.auto = false;
        }
      };
      animate();
    },
    onImageLoad(trigger, cb) {
      this.nImageLoad = 0;
      this.nImageLoadTrigger = trigger;
      this.imageLoadCallback = cb;
    },
    didLoadImage(ev) {
      const target = ev.target || (ev.path && ev.path[0]);
      if (this.imageWidth == null) {
        this.imageWidth = target.naturalWidth;
        this.imageHeight = target.naturalHeight;
        this.preloadImages();
      }
      if (!this.imageLoadCallback) return;
      this.nImageLoad++;
      if (this.nImageLoad >= this.nImageLoadTrigger) {
        this.imageLoadCallback();
        this.imageLoadCallback = null;
      }
    },
    zoomIn(zoomAt = null) {
      if (!this.canZoomIn) return;
      this.zoomIndex++;
      this.zoomTo(this.zooms_[this.zoomIndex], zoomAt);
    },
    zoomOut(zoomAt = null) {
      if (!this.canZoomOut) return;
      this.zoomIndex--;
      this.zoomTo(this.zooms_[this.zoomIndex], zoomAt);
    },
    zoomTo(zoom, zoomAt = null) {
      const viewport = this.$refs.viewport;
      let fixedX, fixedY;
      if (zoomAt) {
        const rect = viewport.getBoundingClientRect();
        fixedX = zoomAt.pageX - rect.left;
        fixedY = zoomAt.pageY - rect.top;
      } else {
        fixedX = viewport.clientWidth / 2;
        fixedY = viewport.clientHeight / 2;
      }
      const start = this.zoom;
      const end = zoom;
      const startX = viewport.scrollLeft;
      const startY = viewport.scrollTop;
      const containerFixedX = fixedX + startX;
      const containerFixedY = fixedY + startY;
      const endX = (containerFixedX / start) * end - fixedX;
      const endY = (containerFixedY / start) * end - fixedY;
      const t0 = Date.now();
      this.zooming = true;
      this.$emit("zoom-start", zoom);
      const animate = () => {
        const t = Date.now() - t0;
        let ratio = t / this.zoomDuration;
        if (ratio > 1 || this.IE) ratio = 1;
        ratio = easeInOut(ratio);
        this.zoom = start + (end - start) * ratio;
        this.scrollLeft = startX + (endX - startX) * ratio;
        this.scrollTop = startY + (endY - startY) * ratio;
        if (t < this.zoomDuration) {
          requestAnimationFrame(animate);
        } else {
          this.$emit("zoom-end", zoom);
          this.zooming = false;
          this.zoom = zoom;
          this.scrollLeft = endX;
          this.scrollTop = endY;
        }
      };
      animate();
      if (end > 1) {
        this.preloadImages(true);
      }
    },
    zoomAt(zoomAt) {
      this.zoomIndex = (this.zoomIndex + 1) % this.zooms_.length;
      this.zoomTo(this.zooms_[this.zoomIndex], zoomAt);
    },
    swipeStart(touch) {
      this.touchStartX = touch.pageX;
      this.touchStartY = touch.pageY;
      this.maxMove = 0;
      if (this.zoom <= 1) {
        if (this.dragToFlip) {
          this.activeCursor = "grab";
        }
      } else {
        this.startScrollLeft = this.$refs.viewport.scrollLeft;
        this.startScrollTop = this.$refs.viewport.scrollTop;
        this.activeCursor = "all-scroll";
      }
    },
    swipeMove(touch) {
      if (this.touchStartX == null) return;
      const x = touch.pageX - this.touchStartX;
      const y = touch.pageY - this.touchStartY;
      this.maxMove = Math.max(this.maxMove, Math.abs(x), Math.abs(y));
      if (this.zoom > 1) {
        if (this.dragToScroll) {
          this.dragScroll(x, y);
        }
        return;
      }
      if (!this.dragToFlip) return;
      if (Math.abs(y) > Math.abs(x)) return;
      this.activeCursor = "grabbing";
      if (x > 0) {
        if (this.flip.direction == null && this.canFlipLeft && x >= this.swipeMin) {
          this.flipStart("left", false);
        }
        if (this.flip.direction === "left") {
          this.flip.progress = x / this.pageWidth;
          if (this.flip.progress > 1) this.flip.progress = 1;
        }
      } else {
        if (this.flip.direction == null && this.canFlipRight && x <= -this.swipeMin) {
          this.flipStart("right", false);
        }
        if (this.flip.direction === "right") {
          this.flip.progress = -x / this.pageWidth;
          if (this.flip.progress > 1) this.flip.progress = 1;
        }
      }
      return true;
    },
    swipeEnd(touch) {
      if (this.touchStartX == null) return;
      if (this.clickToZoom && this.maxMove < this.swipeMin) {
        this.zoomAt(touch);
      }
      if (this.flip.direction != null && !this.flip.auto) {
        if (this.flip.progress > 1 / 4) {
          this.flipAuto(false);
        } else {
          this.flipRevert();
        }
      }
      this.touchStartX = null;
      this.activeCursor = null;
    },
    onTouchStart(ev) {
      this.hasTouchEvents = true;
      this.swipeStart(ev.changedTouches[0]);
    },
    onTouchMove(ev) {
      if (this.swipeMove(ev.changedTouches[0]) && ev.cancelable) {
        ev.preventDefault();
      }
    },
    onTouchEnd(ev) {
      this.swipeEnd(ev.changedTouches[0]);
    },
    onPointerDown(ev) {
      this.hasPointerEvents = true;
      if (this.hasTouchEvents) return;
      if (ev.which && ev.which !== 1) return; // ignore right-click
      this.swipeStart(ev);
      try {
        ev.target.setPointerCapture(ev.pointerId);
      } catch (e) {}
    },
    onPointerMove(ev) {
      if (!this.hasTouchEvents) this.swipeMove(ev);
    },
    onPointerUp(ev) {
      if (this.hasTouchEvents) return;
      this.swipeEnd(ev);
      try {
        ev.target.releasePointerCapture(ev.pointerId);
      } catch (e) {}
    },
    onMouseDown(ev) {
      if (this.hasTouchEvents || this.hasPointerEvents) return;
      if (ev.which && ev.which !== 1) return; // ignore right-click
      this.swipeStart(ev);
    },
    onMouseMove(ev) {
      if (!this.hasTouchEvents && !this.hasPointerEvents) {
        this.swipeMove(ev);
      }
    },
    onMouseUp(ev) {
      if (!this.hasTouchEvents && !this.hasPointerEvents) {
        this.swipeEnd(ev);
      }
    },
    dragScroll(x, y) {
      this.scrollLeft = this.startScrollLeft - x;
      this.scrollTop = this.startScrollTop - y;
    },
    onWheel(ev) {
      if (this.wheel === "scroll" && this.zoom > 1 && this.dragToScroll) {
        this.scrollLeft = this.$refs.viewport.scrollLeft + ev.deltaX;
        this.scrollTop = this.$refs.viewport.scrollTop + ev.deltaY;
        if (ev.cancelable) ev.preventDefault();
      }
      if (this.wheel === "zoom") {
        if (ev.deltaY >= 100) {
          this.zoomOut(ev);
          ev.preventDefault();
        } else if (ev.deltaY <= -100) {
          this.zoomIn(ev);
          ev.preventDefault();
        }
      }
    },
    preloadImages(hiRes = false) {
      for (let i = this.currentPage - 3; i <= this.currentPage + 3; i++) {
        this.pageUrlLoading(i);
      }
      if (hiRes) {
        for (let i = this.currentPage; i < this.currentPage + this.displayedPages; i++) {
          const src = this.pagesHiRes[i];
          if (src) {
            new Image().src = src;
          }
        }
      }
    },
    goToPage(p) {
      if (p == null || p === this.page) return;
      if (this.pages[0] == null) {
        this.currentPage = this.displayedPages === 2 && p === 1 ? 0 : p;
      } else {
        this.currentPage = p - 1;
      }
      this.minX = Infinity;
      this.maxX = -Infinity;
      this.currentCenterOffset = this.centerOffset;
    },
    loadImage(url) {
      if (this.imageWidth == null) {
        // The first loaded image defines the true dimensions.
        return url;
      } else {
        if (this.loadedImages[url]) {
          return url;
        } else {
          const img = new Image();
          img.onload = () => {
            if (this.$set) {
              this.$set(this.loadedImages, url, true);
            } else {
              this.loadedImages[url] = true;
            }
          };
          img.src = url;
          return this.loadingImage;
        }
      }
    }
  },
  watch: {
    currentPage() {
      this.firstPage = this.currentPage;
      this.secondPage = this.currentPage + 1;
      this.preloadImages();
    },
    centerOffset() {
      if (this.animatingCenter) return;
      const animate = () => {
        const rate = 0.1;
        const diff = this.centerOffset - this.currentCenterOffset;
        if (Math.abs(diff) < 0.5) {
          this.currentCenterOffset = this.centerOffset;
          this.animatingCenter = false;
        } else {
          this.currentCenterOffset += diff * rate;
          requestAnimationFrame(animate);
        }
      };
      this.animatingCenter = true;
      animate();
    },
    scrollLeftLimited(val) {
      if (this.IE) {
        requestAnimationFrame(() => {
          this.$refs.viewport.scrollLeft = val;
        });
      } else {
        this.$refs.viewport.scrollLeft = val;
      }
    },
    scrollTopLimited(val) {
      if (this.IE) {
        requestAnimationFrame(() => {
          this.$refs.viewport.scrollTop = val;
        });
      } else {
        this.$refs.viewport.scrollTop = val;
      }
    },
    pages(newVal, oldVal) {
      this.fixFirstPage();
      if ((!oldVal || !oldVal.length) && newVal && newVal.length) {
        if (this.startPage > 1 && newVal[0] == null) {
          this.currentPage++;
        }
      }
    },
    startPage(p) {
      this.goToPage(p);
    }
  }
};
</script>

<style scoped>
.viewport {
  -webkit-overflow-scrolling: touch;
  width: 100%;
  height: 100%;
}

.viewport.zoom {
  overflow: scroll;
}

.viewport.zoom.drag-to-scroll {
  overflow: hidden;
}

.flipbook-container {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: top left;
  user-select: none;
}

.click-to-flip {
  position: absolute;
  width: 50%;
  height: 100%;
  top: 0;
  user-select: none;
}

.click-to-flip.left {
  left: 0;
}

.click-to-flip.right {
  right: 0;
}

.bounding-box {
  position: absolute;
  user-select: none;
}

.page {
  position: absolute;
  backface-visibility: hidden;
}

.polygon {
  position: absolute;
  top: 0;
  left: 0;
  background-repeat: no-repeat;
  backface-visibility: hidden;
  transform-origin: center left;
}

.polygon.blank {
  background-color: #ddd;
}

.polygon .lighting {
  width: 100%;
  height: 100%;
}
</style>
