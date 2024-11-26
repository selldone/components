import { DirectiveBinding } from 'vue';

/**
 * A custom Vue 3 directive to handle Ctrl + [key] keyboard shortcuts.
 * Usage: v-ctrl.[modifier]="yourFunction"
 * Example: v-ctrl.s="saveFunction" to trigger a save function on Ctrl + S.
 */
export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    /**
     * Handle key press events and execute the provided function if the combination matches.
     *
     * @param event - The keyboard event.
     */
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!binding.modifiers) return;

      // Check if Ctrl key is pressed
      if (event.ctrlKey) {
        // Map modifiers to event codes for more consistency across different keyboard layouts
        const modifierCodes: Record<string, string> = {
          a: 'KeyA',
          b: 'KeyB',
          c: 'KeyC',
          d: 'KeyD',
          e: 'KeyE',
          f: 'KeyF',
          g: 'KeyG',
          h: 'KeyH',
          i: 'KeyI',
          j: 'KeyJ',
          k: 'KeyK',
          l: 'KeyL',
          m: 'KeyM',
          n: 'KeyN',
          o: 'KeyO',
          p: 'KeyP',
          q: 'KeyQ',
          r: 'KeyR',
          s: 'KeyS',
          t: 'KeyT',
          u: 'KeyU',
          v: 'KeyV',
          w: 'KeyW',
          x: 'KeyX',
          y: 'KeyY',
          z: 'KeyZ',
          '1': 'Digit1',
          '2': 'Digit2',
          '3': 'Digit3',
          '4': 'Digit4',
          '5': 'Digit5',
          '6': 'Digit6',
          '7': 'Digit7',
          '8': 'Digit8',
          '9': 'Digit9',
          '0': 'Digit0',
        };

        // Iterate through the modifiers to determine if the key matches
        const modifiers = Object.keys(binding.modifiers);
        for (const modifier of modifiers) {
          const expectedCode = modifierCodes[modifier.toLowerCase()];
          if (expectedCode && event.code === expectedCode) {
            // Override the default behavior of the key press
            event.preventDefault();

            // Execute the provided function in the binding value
            if (typeof binding.value === 'function') {
              binding.value();
            }
            break;
          }
        }
      }
    };

    // Attach the event listener to the window object
    window.addEventListener('keydown', handleKeyPress);

    // Store the cleanup function to remove the event listener
    (el as any)._handleKeyPress = handleKeyPress;

    // Add visual hint for the keyboard shortcut (e.g., "Ctrl + S")
    const modifiers = binding.modifiers ? Object.keys(binding.modifiers) : [];
    if (modifiers.length > 0) {
      const hintElement = document.createElement('small');
      hintElement.className = 'x-small';
      hintElement.textContent = `Ctrl + ${modifiers.join(', ').toUpperCase()}`;
      hintElement.style.position = 'absolute';
      hintElement.style.top = '4px';
      hintElement.style.right = '8px';
      el.style.position = 'relative'; // Ensure the parent has a position for absolute children

      el.appendChild(hintElement);
    }
  },

  beforeUnmount(el: HTMLElement) {
    // Remove the event listener when the element is unmounted to avoid memory leaks
    if ((el as any)._handleKeyPress) {
      window.removeEventListener('keydown', (el as any)._handleKeyPress);
      delete (el as any)._handleKeyPress; // Clean up reference
    }
  },
};
