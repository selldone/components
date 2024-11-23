import { DirectiveBinding } from 'vue';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
  hasMoved: boolean;
  mouseMoveHandler: (e: MouseEvent) => void;
  mouseUpHandler: () => void;
}

const dragscrollDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<boolean>) {

    if(!binding.value)return;

    let state: DragState | null = null;

    const mouseMoveHandler = (e: MouseEvent) => {
      if (!state) return;
      const x = e.pageX - el.offsetLeft;
      const y = e.pageY - el.offsetTop;
      const walkX = x - state.startX;
      const walkY = y - state.startY;

      if (Math.abs(walkX) > 5 || Math.abs(walkY) > 5) {
        state.isDragging = true;
        state.hasMoved = true;
        console.log('dragging is moving!');
        el.scrollLeft = state.scrollLeft - walkX;
        el.scrollTop = state.scrollTop - walkY;

        // Add 'pen' class to disable pointer events temporarily
        el.children[0].classList.add('pen');

      }
    };

    const mouseUpHandler = () => {
      if (!state) return;
      document.removeEventListener('mousemove', state.mouseMoveHandler);
      document.removeEventListener('mouseup', state.mouseUpHandler);
      el.style.cursor = 'grab';
      el.style.removeProperty('user-select');

      if (state.hasMoved) {


        // Remove 'pen' class after a short delay to re-enable pointer events
        setTimeout(() => {
          el.children[0].classList.remove('pen');
        }, 300); // Adjust the timeout as needed
      }

      state = null;
    };

    const mouseDownHandler = (e: MouseEvent) => {
      if (!binding.value) return;

      state = {
        isDragging: false,
        startX: e.pageX - el.offsetLeft,
        startY: e.pageY - el.offsetTop,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
        hasMoved: false,
        mouseMoveHandler: mouseMoveHandler,
        mouseUpHandler: mouseUpHandler,
      };

      document.addEventListener('mousemove', state.mouseMoveHandler);
      document.addEventListener('mouseup', state.mouseUpHandler);

      // Prevent default to avoid text selection
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    };

    el.addEventListener('mousedown', mouseDownHandler);
    el.style.cursor = 'grab';

    // Store the handlers so they can be removed later
    (el as any)._vDragScroll = {
      mouseDownHandler,
      mouseMoveHandler,
      mouseUpHandler,
    };
  },
  updated(el: HTMLElement, binding: DirectiveBinding<boolean>) {
    const stored = (el as any)._vDragScroll;
    if (stored) {
      if (binding.value) {
        el.style.cursor = 'grab';
        el.addEventListener('mousedown', stored.mouseDownHandler);
      } else {
        el.style.cursor = 'default';
        el.removeEventListener('mousedown', stored.mouseDownHandler);
      }
    }
  },
  unmounted(el: HTMLElement) {
    const stored = (el as any)._vDragScroll;
    if (stored && stored.mouseDownHandler) {
      el.removeEventListener('mousedown', stored.mouseDownHandler);
      document.removeEventListener('mousemove', stored.mouseMoveHandler);
      document.removeEventListener('mouseup', stored.mouseUpHandler);
    }
    el.style.cursor = '';
    el.style.removeProperty('user-select');
    el.classList.remove('pen');
  },
};

export default dragscrollDirective;
