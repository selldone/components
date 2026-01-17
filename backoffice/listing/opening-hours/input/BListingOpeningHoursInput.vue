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
  <div class="text-start">
    <div class="d-flex align-center mb-2">

      <v-spacer />

      <!-- Quick presets -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" size="small" variant="text">
            <v-icon start>auto_fix_high</v-icon>
            Presets
          </v-btn>
        </template>

        <v-list density="compact" class="text-start">
          <v-list-item @click="applyPreset('weekdays_9_18')">
            <v-list-item-title>Weekdays 09:00–18:00</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyPreset('everyday_9_18')">
            <v-list-item-title>Everyday 09:00–18:00</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyPreset('everyday_24_7')">
            <v-list-item-title>24/7 (Open all days)</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="applyPreset('clear')">
            <v-list-item-title>Clear all</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>



    <v-row v-for="d in days" :key="d.key" class="align-center py-2" no-gutters>
      <v-col cols="12" md="3" class="pe-2">
        <v-chip label size="small" variant="tonal" class="w-100 justify-center">
          {{ d.title }}
        </v-chip>
      </v-col>

      <v-col cols="12" md="3" class="pe-2">
        <u-smart-toggle
          v-model="d.opened"
          inset
          density="compact"
          hide-details
          true-title="Open"
          falseTitle="Closed"
          false-gray
        />
      </v-col>

      <v-col cols="6" md="3" class="pe-2">
        <v-text-field
          v-model="d.from"
          type="time"
          :disabled="!d.opened"
          label="From"
          :variant="variant"
          hide-details
        />
      </v-col>

      <v-col cols="6" md="3" class="pe-2">
        <v-text-field
          v-model="d.to"
          type="time"
          :disabled="!d.opened"
          label="To"
          :variant="variant"
          hide-details
        />
      </v-col>
    </v-row>

    <div class="text-muted mt-3">
      Set opening hours for each day. You can quickly apply presets and
      fine-tune times.
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

<style scoped></style>
