### Vue Dragscroll Directive - `v-dragscroll`

The `v-dragscroll` directive allows elements to be scrollable through mouse drag. It supports several modifiers and
values:

- `v-dragscroll`: Basic usage, enables drag-scrolling on the element.
- `.x` modifier: Enables horizontal drag-scrolling only.
- `.y` modifier: Enables vertical drag-scrolling only.
- `.xy` modifier: Enables both horizontal and vertical drag-scrolling.
- `.ctrl` modifier: Drag-scrolling is activated only when the CTRL key is held down.
- `.shift` modifier: Drag-scrolling is activated only when the Shift key is held down.
- `.alt` modifier: Drag-scrolling is activated only when the Alt key is held down.
- `.meta` modifier: Drag-scrolling is activated only when the Meta key (Command on macOS, Windows key on Windows) is
  held down.
- `.no-child-drag` modifier: Prevents dragging from child elements.
- `.no-select` modifier: Disables text selection while dragging.
- `v-dragscroll="{ target: 'element' }"`: Applies the directive to a child DOM element specified by a CSS selector.

