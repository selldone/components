if (typeof window !== 'undefined' && window.SwiperElementRegisterParams) {
  window.SwiperElementRegisterParams(['materialEffect']);
}

function elementTransitionEnd(el, callback) {
  function fireCallBack(e) {
    if (e.target !== el) return;
    callback.call(el, e);
    el.removeEventListener('transitionend', fireCallBack);
  }
  if (callback) {
    el.addEventListener('transitionend', fireCallBack);
  }
}

function effectVirtualTransitionEnd({
  swiper,
  duration,
  transformElements,
  allSlides,
}) {
  const { activeIndex } = swiper;
  const getSlide = (el) => {
    if (!el.parentElement) {
      // assume shadow root
      const slide = swiper.slides.filter(
        (slideEl) => slideEl.shadowRoot && slideEl.shadowRoot === el.parentNode,
      )[0];
      return slide;
    }
    return el.parentElement;
  };
  if (swiper.params.virtualTranslate && duration !== 0) {
    let eventTriggered = false;
    let transitionEndTarget;
    if (allSlides) {
      transitionEndTarget = transformElements;
    } else {
      transitionEndTarget = transformElements.filter((transformEl) => {
        const el = transformEl.classList.contains('swiper-slide-transform')
          ? getSlide(transformEl)
          : transformEl;
        return swiper.getSlideIndex(el) === activeIndex;
      });
    }
    transitionEndTarget.forEach((el) => {
      elementTransitionEnd(el, () => {
        if (eventTriggered) return;
        if (!swiper || swiper.destroyed) return;
        eventTriggered = true;
        swiper.animating = false;
        const evt = new window.CustomEvent('transitionend', {
          bubbles: true,
          cancelable: true,
        });
        swiper.wrapperEl.dispatchEvent(evt);
      });
    });
  }
}

export default function EffectMaterial({ swiper, on, extendParams }) {
  extendParams({
    materialEffect: {
      slideSplitRatio: 0.65,
    },
  });
  const setTranslate = () => {
    const { slides, slidesSizesGrid, params, size: swiperSize } = swiper;
    const { slidesPerView, spaceBetween, cssMode, centeredSlides } = params;
    const largeSlideRatio = centeredSlides
      ? 0.5
      : Math.min(Math.max(params.materialEffect.slideSplitRatio, 0), 1);
    const smallSlideRatio = centeredSlides
      ? 0.5
      : 1 - Math.min(Math.max(params.materialEffect.slideSplitRatio, 0), 1);
    for (let i = 0; i < slides.length; i += 1) {
      const slideEl = slides[i];
      const materialEl = slideEl.querySelector('.swiper-material-wrapper');
      const opacityEls = slideEl.querySelectorAll(
        '.swiper-material-animate-opacity',
      );
      const scaleEls = slideEl.querySelectorAll('[data-swiper-material-scale]');
      const progress = -slideEl.progress;
      const offset = slideEl.swiperSlideOffset;
      const swiperTranslate = swiper.translate;
      let scale;
      let translate = 0;
      let opacity = 0;
      const currentSlideSize = slidesSizesGrid[i];
      const scaleDiff =
        smallSlideRatio === 0 && !centeredSlides
          ? 0
          : spaceBetween / 2 / currentSlideSize;
      const cssModeTranslateOffset = cssMode ? swiperTranslate : 0;
      const isCenteredOdd = centeredSlides && slidesPerView % 2 === 1;
      const isCenteredEven = centeredSlides && slidesPerView % 2 === 0;

      if (progress <= 0) {
        // SLIDES BEFORE ACTIVE SLIDE / PREVIOUS
        if (centeredSlides && slidesPerView > 1) {
          // CENTERED/ACTIVE SLIDES
          if (progress <= 0 && progress >= -(slidesPerView - 2)) {
            translate = swiperTranslate;
            scale = 1;
            opacity = 1;
          }

          // current to zero
          if (
            isCenteredOdd &&
            progress < -(slidesPerView - Math.ceil(slidesPerView / 2))
          ) {
            const currentProgress =
              Math.ceil(slidesPerView / 2) - Math.abs(progress);
            scale = currentProgress;
            opacity = scale ** 4;
            translate =
              swiperTranslate +
              currentSlideSize * (1 - currentProgress) * (1 + scaleDiff * 2);
          }
          // current to large
          if (
            isCenteredEven &&
            progress < -(slidesPerView / 2 - 1) &&
            progress >= -(slidesPerView / 2)
          ) {
            const currentProgress = slidesPerView / 2 - Math.abs(progress);

            scale =
              largeSlideRatio -
              scaleDiff +
              (smallSlideRatio + scaleDiff * 2) *
                (slidesPerView / 2 - Math.abs(progress));

            opacity = ((scale - largeSlideRatio) / (1 - largeSlideRatio)) ** 4;
            translate =
              swiperTranslate +
              currentSlideSize *
                (smallSlideRatio + scaleDiff) *
                (1 - currentProgress);
          }

          // large to zero
          if (isCenteredEven && progress < -slidesPerView / 2) {
            let currentProgress = slidesPerView / 2 + 1 - Math.abs(progress);
            // let translateAdd = 0;
            scale = 0;
            if (currentProgress >= 0) {
              currentProgress =
                -scaleDiff * 2 + currentProgress * (1 + scaleDiff * 2);
              currentProgress = Math.max(Math.min(currentProgress, 1), 0);
              scale = (smallSlideRatio - scaleDiff) * currentProgress;
            }
            translate =
              swiperTranslate +
              currentSlideSize *
                (smallSlideRatio + scaleDiff) *
                (2 - currentProgress) +
              currentSlideSize *
                (smallSlideRatio - scaleDiff) *
                (1 - currentProgress);
          }
        } else {
          // NOT CENTERED SLIDES
          scale = 1 + progress;
          translate = -offset;
          opacity = scale ** 4;
        }
      }
      if (slidesPerView === 1) {
        if (progress > 0) {
          scale = 1 - progress;
          translate = -offset + swiperSize * Math.min(progress, 1);
          opacity = scale ** 4;
        }
      } else {
        // ACTIVE SLIDES
        if (progress > 0 && progress <= slidesPerView - 2) {
          translate = swiperTranslate;
          scale = 1;
          opacity = 1;
        }
        // SLIDES AFTER ACTIVE SLIDE / NEXT
        // large to current
        const isLargeToCurrent = isCenteredEven
          ? progress > slidesPerView / 2 - 1 && progress <= slidesPerView / 2
          : progress > slidesPerView - 2 && progress <= slidesPerView - 1;
        if (isLargeToCurrent) {
          const minus = isCenteredEven ? Math.floor(slidesPerView / 2) : 1;
          scale =
            largeSlideRatio -
            scaleDiff +
            (smallSlideRatio + scaleDiff * 2) *
              (slidesPerView - minus - Math.abs(progress));
          translate = swiperTranslate;
          if (largeSlideRatio === 1) {
            opacity = scale ** 4;
          } else {
            opacity = ((scale - largeSlideRatio) / (1 - largeSlideRatio)) ** 4;
          }
        }

        // zero to current
        if (
          isCenteredOdd &&
          progress > slidesPerView - Math.ceil(slidesPerView / 2)
        ) {
          const currentProgress =
            Math.ceil(slidesPerView / 2) - (slidesPerView - Math.abs(progress));
          translate =
            swiperTranslate -
            currentSlideSize * (scaleDiff * 2) * currentProgress;
          scale = 1 - currentProgress;
          opacity = scale ** 4;
        }
        // small to large: 0.35 -> 0.65
        if (
          progress > slidesPerView - 1 &&
          progress <= slidesPerView &&
          !centeredSlides
        ) {
          const currentProgress = slidesPerView - Math.abs(progress);
          const largeWithDiff = largeSlideRatio - scaleDiff;
          const smallWithDiff = smallSlideRatio - scaleDiff;
          scale =
            smallWithDiff + (largeWithDiff - smallWithDiff) * currentProgress;
          translate =
            swiperTranslate -
            currentSlideSize *
              (smallSlideRatio + scaleDiff) *
              (1 - currentProgress);
          if (smallSlideRatio === 0) {
            opacity = scale ** 4;
          }
        }
        // zero to small: 0 -> 0.35
        if (
          progress > (centeredSlides ? slidesPerView / 2 : slidesPerView) &&
          !isCenteredOdd
        ) {
          let currentProgress =
            (centeredSlides ? slidesPerView / 2 + 1 : slidesPerView + 1) -
            Math.abs(progress);
          let translateAdd = 0;
          scale = 0;
          if (currentProgress >= 0) {
            currentProgress =
              -scaleDiff * 2 + currentProgress * (1 + scaleDiff * 2);
            currentProgress = Math.max(Math.min(currentProgress, 1), 0);
            scale = (smallSlideRatio - scaleDiff) * currentProgress;
            translateAdd =
              -currentProgress *
                (smallSlideRatio + scaleDiff) *
                currentSlideSize +
              currentProgress * spaceBetween;
          }
          translate =
            -offset + swiperSize * Math.min(progress, 1) + translateAdd;
          opacity = 0;
        }
      }
      if (scale < 0) {
        scale = 0;
      }
      if (scale > 1) {
        scale = 1;
      }
      // if (scale === 0) {
      //   scale = 0.0001;
      // }
      slideEl.style.setProperty('--swiper-material-scale', scale);
      opacityEls.forEach((opacityEl) => {
        opacityEl.style.opacity = opacity;
      });
      scaleEls.forEach((scaleEl) => {
        let elementScale = parseFloat(
          scaleEl.getAttribute('data-swiper-material-scale'),
        );
        if (Number.isNaN(elementScale) || (!elementScale && elementScale !== 0))
          elementScale = 1;
        scaleEl.style.transform = `scale(${
          1 + (elementScale - 1) * (1 - scale)
        })`;
      });
      if (swiper.isHorizontal()) {
        materialEl.style.width = `${100 * scale}%`;
        materialEl.style.transform = `translate3d(${
          translate - cssModeTranslateOffset
        }px, 0, 0)`;
      } else {
        materialEl.style.height = `${100 * scale}%`;
        materialEl.style.transform = `translate3d(0, ${
          translate - cssModeTranslateOffset
        }px, 0)`;
      }
    }
  };
  const setTransition = (duration) => {
    const { slides } = swiper;
    const transformElements = [];
    for (let i = 0; i < slides.length; i += 1) {
      const slideEl = slides[i];
      const materialEl = slideEl.querySelector('.swiper-material-wrapper');
      const opacityEls = slideEl.querySelectorAll(
        '.swiper-material-animate-opacity',
      );
      const scaleEls = slideEl.querySelectorAll('[data-swiper-material-scale]');

      [materialEl, ...scaleEls, ...opacityEls].forEach((opacityEl) => {
        opacityEl.style.transitionDuration = `${duration}ms`;
      });

      transformElements.push(materialEl);
    }

    effectVirtualTransitionEnd({
      swiper,
      duration,
      transformElements,
      allSlides: true,
    });
  };

  on('beforeInit', () => {
    if (swiper.params.effect !== 'material') return;
    swiper.classNames.push(`${swiper.params.containerModifierClass}material`);
    if (swiper.isElement && swiper.hostEl) {
      swiper.hostEl.classList.add(`swiper-${swiper.params.direction}`);
    }
    const overwriteParams = {
      loopAdditionalSlides: 1,
      watchSlidesProgress: true,
      virtualTranslate: !swiper.params.cssMode,
    };

    Object.assign(swiper.params, overwriteParams);
    Object.assign(swiper.originalParams, overwriteParams);
  });
  on('setTranslate', () => {
    if (swiper.params.effect !== 'material') return;
    setTranslate();
  });
  on('setTransition', (_s, duration) => {
    if (swiper.params.effect !== 'material') return;
    setTransition(duration);
  });
  on('slidesUpdated', () => {
    if (
      !swiper.params.centeredSlides &&
      swiper.params.slidesPerView > 1 &&
      !swiper.params.loop &&
      swiper.params.materialEffect.slideSplitRatio < 1
    ) {
      const lastItem = swiper.snapGrid[swiper.snapGrid.length - 1];
      swiper.snapGrid.push(
        lastItem + swiper.slidesSizesGrid[0] + swiper.params.spaceBetween,
      );
    }
    swiper.el.style.setProperty(
      '--swiper-material-slide-size',
      `${swiper.slidesSizesGrid[0]}px`,
    );
  });
}
