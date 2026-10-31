<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <div
    class="text-start"
    :class="modern ? 'b-listing-opening-hours--modern' : undefined"
  >
    <div class="d-flex align-center mb-2">
      <v-spacer />

      <!-- Quick presets -->
      <v-menu :content-class="modern ? 'sd-modern-menu text-start' : undefined">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :class="
              modern ? 'sd-modern-button sd-modern-button--inline' : undefined
            "
            size="small"
            variant="text"
          >
            <v-icon start>auto_fix_high</v-icon>
            {{
              modern ? $t("shop_listing.item_editor.hours_presets") : "Presets"
            }}
          </v-btn>
        </template>

        <v-list density="compact" class="text-start">
          <v-list-item @click="applyPreset('weekdays_9_18')">
            <v-list-item-title>{{
              modern
                ? $t("shop_listing.item_editor.preset_weekdays")
                : "Weekdays 09:00–18:00"
            }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyPreset('everyday_9_18')">
            <v-list-item-title>{{
              modern
                ? $t("shop_listing.item_editor.preset_everyday")
                : "Everyday 09:00–18:00"
            }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyPreset('everyday_24_7')">
            <v-list-item-title>{{
              modern
                ? $t("shop_listing.item_editor.preset_always")
                : "24/7 (Open all days)"
            }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="applyPreset('clear')">
            <v-list-item-title>{{
              modern ? $t("shop_listing.item_editor.clear_hours") : "Clear all"
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <v-row
      v-for="d in days"
      :key="d.key"
      class="align-center py-2"
      :role="modern ? 'group' : undefined"
      :aria-label="
        modern ? $t('shop_listing.item_editor.weekdays.' + d.key) : undefined
      "
      no-gutters
    >
      <v-col cols="12" md="3" class="pe-2 b-listing-opening-hours__column">
        <span v-if="modern" class="b-listing-opening-hours__day">{{
          $t("shop_listing.item_editor.weekdays." + d.key)
        }}</span>
        <v-chip
          v-else
          label
          size="small"
          variant="tonal"
          class="w-100 justify-center"
        >
          {{ d.title }}
        </v-chip>
      </v-col>

      <v-col cols="12" md="3" class="pe-2 b-listing-opening-hours__column">
        <u-smart-toggle
          v-model="d.opened"
          :class="{ 'b-listing-opening-hours__toggle': modern }"
          :accessible="modern"
          inset
          density="compact"
          hide-details
          :true-title="
            modern ? $t('shop_listing.item_editor.open_day') : 'Open'
          "
          :false-title="
            modern ? $t('shop_listing.item_editor.closed_day') : 'Closed'
          "
          false-gray
        />
      </v-col>

      <v-col cols="6" md="3" class="pe-2 b-listing-opening-hours__column">
        <v-text-field
          v-model="d.from"
          type="time"
          :disabled="!d.opened"
          :label="modern ? $t('shop_listing.item_editor.from_time') : 'From'"
          :variant="variant"
          :class="
            modern
              ? 'sd-modern-underlined-field b-listing-opening-hours__time'
              : undefined
          "
          hide-details
        />
      </v-col>

      <v-col cols="6" md="3" class="pe-2 b-listing-opening-hours__column">
        <v-text-field
          v-model="d.to"
          type="time"
          :disabled="!d.opened"
          :label="modern ? $t('shop_listing.item_editor.to_time') : 'To'"
          :variant="variant"
          :class="
            modern
              ? 'sd-modern-underlined-field b-listing-opening-hours__time'
              : undefined
          "
          hide-details
        />
      </v-col>
    </v-row>

    <div class="text-muted mt-3">
      {{
        modern
          ? $t("shop_listing.item_editor.hours_hint")
          : "Set opening hours for each day. You can quickly apply presets and fine-tune times."
      }}
    </div>
  </div>
</template>

<script lang="ts">
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";

export default {
  name: "BListingOpeningHoursInput",
  components: { USmartToggle },
  emits: ["update:modelValue"],
  props: {
    modern: { type: Boolean, default: false },
    modelValue: {
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    variant: {
      type: String,
      default: "underlined",
    },
  },

  data() {
    return {
      days: [
        {
          key: "mon",
          title: "Monday",
          opened: false,
          from: "09:00",
          to: "18:00",
        },
        {
          key: "tue",
          title: "Tuesday",
          opened: false,
          from: "09:00",
          to: "18:00",
        },
        {
          key: "wed",
          title: "Wednesday",
          opened: false,
          from: "09:00",
          to: "18:00",
        },
        {
          key: "thu",
          title: "Thursday",
          opened: false,
          from: "09:00",
          to: "18:00",
        },
        {
          key: "fri",
          title: "Friday",
          opened: false,
          from: "09:00",
          to: "18:00",
        },
        {
          key: "sat",
          title: "Saturday",
          opened: false,
          from: "09:00",
          to: "18:00",
        },
        {
          key: "sun",
          title: "Sunday",
          opened: false,
          from: "09:00",
          to: "18:00",
        },
      ],
      _ignore_emit: false,
    };
  },

  computed: {
    resolvedLabel(): string {
      if (this.label) return this.label;
      // Safe: using $t only inside computed (no default prop issue)
      // @ts-ignore
      return typeof this.$t === "function"
        ? this.$t("shop_listing.items.opening_hours")
        : "Opening hours";
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(val: any) {
        this.loadFromModelValue(val);
      },
    },

    days: {
      deep: true,
      handler() {
        if (this._ignore_emit) return;
        this.$emit("update:modelValue", this.exportValue());
      },
    },
  },

  methods: {
    loadFromModelValue(val: any) {
      this._ignore_emit = true;

      // Accept array format: [{day, open, close, closed}]
      if (Array.isArray(val)) {
        const map: any = {};
        val.forEach((r: any) => {
          if (r && r.day) map[String(r.day).toLowerCase()] = r;
        });

        this.days.forEach((d: any) => {
          const r = map[d.key];
          if (!r) return;

          const closed = !!r.closed;
          d.opened = !closed;

          if (r.open) d.from = String(r.open);
          if (r.close) d.to = String(r.close);
        });

        this._ignore_emit = false;
        return;
      }

      // Accept object map: { mon: {open,close,closed}, ... }
      if (val && typeof val === "object") {
        this.days.forEach((d: any) => {
          const r = val[d.key];
          if (!r) return;

          const closed = !!r.closed;
          d.opened = !closed;

          if (r.open) d.from = String(r.open);
          if (r.close) d.to = String(r.close);
        });

        this._ignore_emit = false;
        return;
      }

      this._ignore_emit = false;
    },

    exportValue() {
      // Export as array (backend-friendly)
      return this.days.map((d: any) => {
        return {
          day: d.key,
          closed: !d.opened,
          open: d.opened ? d.from : null,
          close: d.opened ? d.to : null,
        };
      });
    },

    applyPreset(type: string) {
      this._ignore_emit = true;

      const setDay = (
        key: string,
        opened: boolean,
        from: string,
        to: string,
      ) => {
        const d = this.days.find((x: any) => x.key === key);
        if (!d) return;
        d.opened = opened;
        d.from = from;
        d.to = to;
      };

      if (type === "weekdays_9_18") {
        ["mon", "tue", "wed", "thu", "fri"].forEach((k) =>
          setDay(k, true, "09:00", "18:00"),
        );
        ["sat", "sun"].forEach((k) => setDay(k, false, "09:00", "18:00"));
      } else if (type === "everyday_9_18") {
        this.days.forEach((d: any) => {
          d.opened = true;
          d.from = "09:00";
          d.to = "18:00";
        });
      } else if (type === "everyday_24_7") {
        this.days.forEach((d: any) => {
          d.opened = true;
          d.from = "00:00";
          d.to = "23:59";
        });
      } else if (type === "clear") {
        this.days.forEach((d: any) => {
          d.opened = false;
        });
      }

      this._ignore_emit = false;
      this.$emit("update:modelValue", this.exportValue());
    },
  },
};
</script>

<style scoped>
.b-listing-opening-hours--modern {
  font-size: 14px;
  line-height: 1.6;
}
.b-listing-opening-hours--modern > .v-row {
  display: grid;
  grid-template-columns:
    minmax(95px, 1.2fr) minmax(130px, 1.2fr) minmax(90px, 1fr)
    minmax(90px, 1fr);
  gap: 12px;
  padding-block: 4px !important;
  border-block-end: 1px solid var(--sd-modern-border);
}
.b-listing-opening-hours--modern > .v-row > .b-listing-opening-hours__column {
  width: 100%;
  max-width: none;
  min-width: 0;
  padding: 0 !important;
}
.b-listing-opening-hours__day {
  font-size: 13px;
  font-weight: 500;
}
.b-listing-opening-hours--modern .b-listing-opening-hours__time {
  --sd-modern-field-height: 48px;
}
.b-listing-opening-hours__time
  :deep(.v-field.v-field--variant-underlined input.v-field__input) {
  padding-block: 20px 4px;
}
.b-listing-opening-hours__toggle :deep([role="switch"]) {
  padding-block: 4px !important;
  padding-inline: 12px !important;
}
.b-listing-opening-hours__toggle :deep(.mnh > .flex-grow-1 > b) {
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}
.b-listing-opening-hours--modern > .text-muted {
  color: var(--sd-modern-muted);
  font-size: 13px;
  line-height: 21px;
}
@media (max-width: 600px) {
  .b-listing-opening-hours--modern > .v-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px 12px;
    padding-block: 8px !important;
  }
}
</style>
