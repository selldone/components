<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template>
  <v-dialog
    v-model="dialogProxy"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start sld-bfb-dialog" rounded="0">
      <v-toolbar flat class="sld-bfb-dialog__toolbar">
        <v-btn icon variant="text" @click="onCancel">
          <v-icon>close</v-icon>
        </v-btn>

        <v-toolbar-title class="font-weight-black">
          Listing Onboarding Builder
        </v-toolbar-title>

        <v-spacer />

        <v-btn variant="text" :disabled="busy_confirm" @click="resetToDefault">
          <v-icon start>restart_alt</v-icon>
          Reset
        </v-btn>

        <v-btn
          color="primary"
          variant="elevated"
          :loading="busy_confirm"
          @click="onConfirm"
        >
          <v-icon start>check</v-icon>
          Confirm
        </v-btn>
      </v-toolbar>

      <v-divider />

      <v-card-text class="pa-0">
        <b-listing-form-builder v-model="draft" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BListingFormBuilder from "./BListingFormBuilder.vue";

type AnyObject = Record<string, any>;

export default {
  name: "BListingFormBuilderDialog",

  components: { BListingFormBuilder },

  props: {
    dialog: { type: Boolean, default: false },

    /**
     * The onboarding schema stored in listing options.
     * You will save the returned object in your options payload.
     */
    modelValue: { type: Object, default: null },
  },

  emits: ["update:dialog", "update:modelValue"],

  data: () => ({
    draft: null as AnyObject | null,
    busy_confirm: false,
  }),

  computed: {
    dialogProxy: {
      get(): boolean {
        return !!(this as any).dialog;
      },
      set(v: boolean) {
        (this as any).$emit("update:dialog", v);
      },
    },
  },

  watch: {
    dialog: {
      immediate: true,
      handler(isOpen: boolean) {
        if (isOpen) {
          const src = (this as any).modelValue;
          (this as any).draft = src ? (this as any).cloneDeep(src) : (this as any).defaultSchema();
        } else {
          (this as any).draft = null;
        }
      },
    },
  },

  methods: {
    cloneDeep(obj: any) {
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch {
        return obj;
      }
    },

    defaultSchema() {
      return {
        version: 1,
        slides: [
          {
            id: (this as any).uid(),
            layout: "split_right",
            title: "Tell us about your item",
            subtitle: "A short title helps customers understand what you offer.",
            tips: "Keep it clear and specific.",
            image: null,
            field: {
              type: "text",
              name: "title",
              title: "Title",
              placeholder: "e.g. Senior Lawyer in New York",
              required: true,
            },
          },
        ],
      };
    },

    uid(): string {
      const rnd = Math.random().toString(16).slice(2);
      return `s_${Date.now()}_${rnd}`;
    },

    validateSchema(schema: any): string[] {
      const errors: string[] = [];

      const slides = Array.isArray(schema?.slides) ? schema.slides : [];
      if (!slides.length) {
        errors.push("You must add at least one step.");
        return errors;
      }

      const usedNames = new Set<string>();

      slides.forEach((s: any, i: number) => {
        const step = i + 1;
        const title = String(s?.title || "").trim();
        if (!title) errors.push(`Step ${step}: title is required.`);

        const field = s?.field || null;
        if (!field) return;

        const type = String(field?.type || "").trim();
        const name = String(field?.name || "").trim();

        if (!type) errors.push(`Step ${step}: field type is required.`);
        if (!name) errors.push(`Step ${step}: field key (name) is required.`);

        if (name) {
          const key = name.toLowerCase();
          if (usedNames.has(key)) {
            errors.push(`Step ${step}: duplicate field key "${name}". Keys must be unique.`);
          } else {
            usedNames.add(key);
          }
        }

        if (type === "select") {
          const opts = Array.isArray(field?.options) ? field.options : [];
          if (!opts.length) errors.push(`Step ${step}: select options are required.`);
        }
      });

      return errors;
    },

    resetToDefault() {
      (this as any).draft = (this as any).defaultSchema();
      NotificationService.showSuccessAlert(null, "Builder reset to default.");
    },

    onCancel() {
      (this as any).dialogProxy = false;
    },

    async onConfirm() {
      if ((this as any).busy_confirm) return;
      (this as any).busy_confirm = true;

      try {
        const schema = (this as any).draft;
        const errors = (this as any).validateSchema(schema);

        if (errors.length) {
          NotificationService.showErrorAlert(null, errors.join("\n"));
          return;
        }

        // Normalize version
        const out = (this as any).cloneDeep(schema);
        out.version = 1;

        (this as any).$emit("update:modelValue", out);
        (this as any).dialogProxy = false;

        NotificationService.showSuccessAlert(null, "Onboarding schema updated.");
      } finally {
        (this as any).busy_confirm = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-dialog {
  background: #fff;

  &__toolbar {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
  }
}
</style>