/*
 * Copyright (c) 2023-2024. Selldone® Business OS™
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

import type { DirectiveBinding, VNode } from "vue";

const POINTER_START_EVENTS = ["mousedown", "touchstart"];
const POINTER_MOVE_EVENTS = ["mousemove", "touchmove"];
const POINTER_END_EVENTS = ["mouseup", "touchend"];

function addEventListeners(el: any, events: Array<string>, handler: Function) {
  for (let i = 0, len = events.length; i < len; i++) {
    el.addEventListener(events[i], handler, { passive: false });
  }
}

function removeEventListeners(
  el: any,
  events: Array<string>,
  handler: Function,
) {
  for (let i = 0, len = events.length; i < len; i++) {
    el.removeEventListener(events[i], handler, { passive: false });
  }
}

function emitEvent(vnode: any, eventName: string, eventDetail?: any) {
  // Vue 3
  // If vnode is a Vue component instance, use $emit. Otherwise use a native HTML event.
  if (vnode.componentInstance) {
    vnode.componentInstance.$emit(eventName, eventDetail);
  } else {
    const event = new window.CustomEvent(eventName, { detail: eventDetail });
    vnode.el.dispatchEvent(event);
  }
}

const init = function (el: Element, binding: DirectiveBinding, vnode: VNode) {
  if (binding.value === false) {
    return;
  }

  let target = el as any;
  let active = true;
  let container = window as any;

  if (typeof binding.value === "boolean") {
    active = binding.value;
  } else if (typeof binding.value === "object") {
    if (typeof binding.value.target === "string") {
      target = el.querySelector(binding.value.target);
      if (!target) {
        console.error("There is no element with the current target value.");
      }
    } else if (typeof binding.value.target !== "undefined") {
      console.error(
        "The parameter \"target\" should be either 'undefined' or 'string'.",
      );
    }
    if (typeof binding.value.container === "string") {
      container = document.querySelector(binding.value.container);
      if (!container) {
        console.error("There is no element with the current container value.");
      }
    } else if (typeof binding.value.container !== "undefined") {
      console.error(
        "The parameter \"container\" should be be either 'undefined' or 'string'.",
      );
    }
    if (typeof binding.value.active === "boolean") {
      active = binding.value.active;
    } else if (typeof binding.value.active !== "undefined") {
      console.error(
        "The parameter \"active\" value should be either 'undefined', 'true' or 'false'.",
      );
    }
  } else if (typeof binding.value !== "undefined") {
    console.error(
      "The passed value should be either 'undefined', 'true' or 'false' or 'object'.",
    );
  }

  const scrollBy = function (x: number, y: number) {
    if (container === window) {
      window.scrollBy(x, y);
    } else {
      container.scrollLeft += x;
      container.scrollTop += y;
    }
  };

  const reset = function () {
    let lastClientX: number, lastClientY: number, pushed: number;
    let isDragging = false;
    let startX: number, startY: number, startTime: number;

    target.classList.add("cursor-grab");

    target.md = function (e: MouseEvent | TouchEvent) {
      (e as Event).preventDefault();
      const isMouseEvent = e instanceof MouseEvent;
      const pageX = isMouseEvent ? e.pageX : (e as TouchEvent).touches[0].pageX;
      const pageY = isMouseEvent ? e.pageY : (e as TouchEvent).touches[0].pageY;

      startX = pageX;
      startY = pageY;
      startTime = Date.now();

      pushed = 1;
      lastClientX = isMouseEvent
        ? e.clientX
        : (e as TouchEvent).touches[0].clientX;
      lastClientY = isMouseEvent
        ? e.clientY
        : (e as TouchEvent).touches[0].clientY;
    };

    target.mu = function (e: MouseEvent | TouchEvent) {
      pushed = 0;
      if (isDragging) {
        emitEvent(vnode, "dragscrollend");
      }
      isDragging = false;

      const isMouseEvent = e instanceof MouseEvent;
      const endX = isMouseEvent
        ? e.pageX
        : (e as TouchEvent).changedTouches[0].pageX;
      const endY = isMouseEvent
        ? e.pageY
        : (e as TouchEvent).changedTouches[0].pageY;
      const endTime = Date.now();

      const distance = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2),
      );
      const duration = endTime - startTime;

      //console.log('distance',distance,'duration',duration)
      if (distance < 36 && duration < 1000) {
        //console.log('CLICK!')
        (target as HTMLElement)?.click();
        //emitEvent(vnode, "click");
      }
    };

    target.mm = function (e: MouseEvent | TouchEvent) {
      const isMouseEvent = e instanceof MouseEvent;
      let newScrollX, newScrollY;
      if (pushed) {
        e.preventDefault();
        if (!isDragging) {
          emitEvent(vnode, "dragscrollstart");
        }
        isDragging = true;

        const isEndX =
          target.scrollLeft + target.clientWidth >= target.scrollWidth ||
          target.scrollLeft === 0;
        const isEndY =
          target.scrollTop + target.clientHeight >= target.scrollHeight ||
          target.scrollTop === 0;

        newScrollX =
          -lastClientX +
          (lastClientX = isMouseEvent
            ? e.clientX
            : (e as TouchEvent).touches[0].clientX);
        newScrollY =
          -lastClientY +
          (lastClientY = isMouseEvent
            ? e.clientY
            : (e as TouchEvent).touches[0].clientY);

        if (binding.modifiers.pass) {
          target.scrollLeft -= binding.modifiers.y ? -0 : newScrollX;
          target.scrollTop -= binding.modifiers.x ? -0 : newScrollY;
          if (target === document.body) {
            target.scrollLeft -= binding.modifiers.y ? -0 : newScrollX;
            target.scrollTop -= binding.modifiers.x ? -0 : newScrollY;
          }

          if (isEndX || binding.modifiers.y) {
            scrollBy(-newScrollX, 0);
          }
          if (isEndY || binding.modifiers.x) {
            scrollBy(0, -newScrollY);
          }
        } else {
          if (binding.modifiers.x) newScrollY = -0;
          if (binding.modifiers.y) newScrollX = -0;

          target.scrollLeft -= newScrollX;
          target.scrollTop -= newScrollY;
          if (target === document.body) {
            target.scrollLeft -= newScrollX;
            target.scrollTop -= newScrollY;
          }
        }

        emitEvent(vnode, "dragscrollmove", {
          deltaX: -newScrollX,
          deltaY: -newScrollY,
        });
      }
    };

    addEventListeners(target, POINTER_START_EVENTS, target.md);
    addEventListeners(window, POINTER_END_EVENTS, target.mu);
    addEventListeners(window, POINTER_MOVE_EVENTS, target.mm);
  };

  if (active) {
    if (document.readyState === "complete") {
      reset();
    } else {
      window.addEventListener("load", reset);
    }
  } else {
    removeEventListeners(target, POINTER_START_EVENTS, target.md);
    removeEventListeners(window, POINTER_END_EVENTS, target.mu);
    removeEventListeners(window, POINTER_MOVE_EVENTS, target.mm);
  }
};

const destroy = (el: any) => {
  const target = el;
  target.classList.remove("cursor-grab");
  removeEventListeners(target, POINTER_START_EVENTS, target.md);
  removeEventListeners(window, POINTER_END_EVENTS, target.mu);
  removeEventListeners(window, POINTER_MOVE_EVENTS, target.mm);
};

export default {
  mounted: (el: Element, binding: DirectiveBinding, vnode: VNode) =>
    init(el, binding, vnode),
  updated: (el: Element, binding: DirectiveBinding, vnode: VNode) => {
    if (JSON.stringify(binding.value) !== JSON.stringify(binding.oldValue)) {
      init(el, binding, vnode);
    }
  },
  unmounted: (el: Element) => destroy(el),
};
