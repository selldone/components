<template>
  <div class="sld-bfb-fprev">
    <div v-if="!fieldSafe" class="sld-bfb-fprev__none">
      <v-icon size="18" class="me-1">info</v-icon>
      No input on this step.
    </div>

    <template v-else>
      <v-text-field
        v-if="fieldSafe.type === 'text'"
        :label="fieldSafe.title || 'Text'"
        :placeholder="fieldSafe.placeholder || ''"
        variant="outlined"
        density="comfortable"
      />

      <v-textarea
        v-else-if="fieldSafe.type === 'textarea'"
        :label="fieldSafe.title || 'Textarea'"
        :placeholder="fieldSafe.placeholder || ''"
        variant="outlined"
        density="comfortable"
        auto-grow
        rows="2"
      />

      <v-text-field
        v-else-if="fieldSafe.type === 'number'"
        type="number"
        :label="fieldSafe.title || 'Number'"
        variant="outlined"
        density="comfortable"
      />

      <div v-else-if="fieldSafe.type === 'switch'" class="d-flex align-center">
        <v-switch :label="fieldSafe.title || 'Switch'" inset />
      </div>

      <div v-else-if="fieldSafe.type === 'select'">
        <div class="font-weight-bold mb-2">
          {{ fieldSafe.title || "Select" }}
        </div>

        <div class="sld-bfb-fprev__opts">
          <div
            v-for="(o, i) in optionsSafe"
            :key="`o_${i}`"
            class="sld-bfb-fprev__opt"
          >
            <div class="sld-bfb-fprev__optimg">
              <img v-if="o.image" :src="getShopImagePath(o.image)" alt="opt" />
              <v-icon v-else size="18">radio_button_unchecked</v-icon>
            </div>

            <div class="sld-bfb-fprev__optmeta">
              <div class="sld-bfb-fprev__opttitle">{{ o.title || "Option" }}</div>
              <div v-if="o.subtitle" class="sld-bfb-fprev__optsub">{{ o.subtitle }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="fieldSafe.type === 'map'" class="sld-bfb-fprev__placeholder">
        <v-icon size="18" class="me-2">map</v-icon>
        Map input placeholder
      </div>

      <div v-else-if="fieldSafe.type === 'media'" class="sld-bfb-fprev__placeholder">
        <v-icon size="18" class="me-2">cloud_upload</v-icon>
        Media upload placeholder
      </div>

      <div v-else class="sld-bfb-fprev__placeholder">
        <v-icon size="18" class="me-2">help</v-icon>
        Unsupported input type: {{ fieldSafe.type }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default {
  name: "BListingFormBuilderFieldPreview",

  props: {
    field: { type: Object, default: null },
  },

  computed: {
    fieldSafe(): any | null {
      const f = (this as any).field;
      if (!f || typeof f !== "object") return null;
      const t = String(f?.type || "").trim();
      return t ? f : null;
    },

    optionsSafe(): any[] {
      const f = (this as any).fieldSafe;
      const opts = Array.isArray(f?.options) ? f.options : [];
      return opts;
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-fprev {
  &__none {
    color: rgba(0, 0, 0, 0.60);
    display: inline-flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.03);
  }

  &__placeholder {
    padding: 14px 14px;
    border-radius: 16px;
    border: 1px dashed rgba(20, 20, 20, 0.18);
    background: rgba(0, 0, 0, 0.02);
    display: inline-flex;
    align-items: center;
    color: rgba(0, 0, 0, 0.65);
  }

  &__opts {
    display: grid;
    gap: 10px;
  }

  &__opt {
    border: 1px solid rgba(20, 20, 20, 0.10);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.96);
    padding: 12px;
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: 10px;
    align-items: center;
  }

  &__optimg {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(20, 20, 20, 0.08);
    overflow: hidden;
    display: grid;
    place-items: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__opttitle {
    font-weight: 900;
    overflow-wrap: anywhere;
  }

  &__optsub {
    margin-top: 2px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.60);
    overflow-wrap: anywhere;
  }
}
</style>