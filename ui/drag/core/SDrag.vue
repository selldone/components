<template>
  <component
    :is="tag"
    :draggable="draggable"
    @drag="emitEvent(events.drag, $event)"
    @dragend="emitEvent(events.dragend, $event)"
    @dragenter="emitEvent(events.dragenter, $event)"
    @dragleave="emitEvent(events.dragleave, $event)"
    @dragstart="emitEvent(events.dragstart, $event)"
  >
    <slot :transfer-data="scopedData"></slot>
  </component>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import transferDataStore from "./transferDataStore.js";
import { dropEffects, effectsAllowed, events } from "./constants.js";

export default defineComponent({
  name: "SDrag",
  props: {
    draggable: { type: Boolean, default: true },
    transferData: {}, // Specify the type if possible
    dropEffect: { validator: (value: string) => value in dropEffects },
    effectAllowed: { validator: (value: string) => value in effectsAllowed },

    imageXOffset: { type: Number, default: 0 },
    imageYOffset: { type: Number, default: 0 },
    tag: { type: String, default: "div" },

    dragImageSrc: String,
    dragImageHtml: String,
    dragImageColor: { default: "#333" },
  },
  data() {
    return {
      dragging: false,
      container: null as HTMLElement | null,
    };
  },
  computed: {
    events: () => events,
    scopedData() {
      return this.dragging && this.transferData;
    },
  },
  methods: {
    emitEvent(name: string, nativeEvent: DragEvent) {
      const transfer = nativeEvent.dataTransfer;

      if (!transfer) {
        return;
      }

      // Set drop effect on dragenter and dragover
      if (
        [events.dragenter, events.dragover].includes(name) &&
        this.dropEffect
      ) {
        transfer.dropEffect = this.dropEffect;
      }

      // A number of things need to happen on drag start
      if (name === events.dragstart) {
        // Set the allowed effects
        if (this.effectAllowed) {
          transfer.effectAllowed = this.effectAllowed;
        }

        // Set the drag image
        if (this.dragImageSrc && transfer.setDragImage) {
          const container = (this.container = document.createElement("div"));

          // Set style properties individually
          container.style.display = "flex";
          container.style.flexDirection = "column";
          container.style.alignItems = "center";
          container.style.justifyContent = "center";
          container.style.position = "fixed";
          container.style.top = "-1000px"; // Make sure to include "px"
          container.style.opacity = "1";
          container.style.padding = "8px";
          container.style.background = this.dragImageColor;
          container.style.borderRadius = "14px";
          container.style.color = "#fff";
          container.style.width = container.style.maxWidth = "100px";
          container.style.fontSize = "11px";

          const image = new Image();
          image.src = this.dragImageSrc;

          // Set image style properties individually
          image.style.borderRadius = "14px";
          image.style.overflow = "hidden";
          image.style.width = "86px";
          image.style.height = "86px";
          image.style.objectFit = "cover";

          container.appendChild(image);

          // Check if the image title exists
          if (this.dragImageHtml) {
            // Create a <p> element for the title
            const title = document.createElement("p");
            title.innerHTML = this.dragImageHtml;
            title.style.marginTop = "4px";

            // Append the title to the image
            container.appendChild(title);
          }
          // Append it to the body, but it won't be visible
          document.body.appendChild(container);

          transfer.setDragImage(
            container,
            this.imageXOffset,
            this.imageYOffset,
          );
        }

        // Set the transfer data
        if (this.transferData !== undefined) {
          transferDataStore.data = this.transferData;
          // Set a dummy string for the real transfer data. Not actually used
          // for anything, but necessary for browser compatibility.
          //
          // TODO: Maybe this should be the actual data serialized. But since
          // it's not actually used for anything it seems like a waste of CPU.
          nativeEvent.dataTransfer.setData("text", "");
        }

        // Indicate that we're dragging.
        this.dragging = true;
      }

      // At last, emit the event.
      this.$emit(name, this.transferData, nativeEvent);

      // Clean up stored data on drag end after emitting.
      if (name === events.dragend && this.container) {
        transferDataStore.data = undefined;
        this.dragging = false;
        document.body.removeChild(this.container);
        this.container = null;
      }
    },
  },
});
</script>
