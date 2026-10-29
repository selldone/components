<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
    v-if="Array.isArray(samples) && samples?.length"
    class="u-smart-suggestion"
    :class="{ 'u-smart-suggestion--modern': modern }"
  >
    <template v-if="modern">
      <v-btn
        v-for="n in samples_processed.slice(0, previewCount)"
        :key="is_object ? n[valueKey] : n"
        class="u-smart-suggestion__sample"
        variant="plain"
        :aria-label="is_object ? n[titleKey] : n"
        @click="$emit('select', is_object ? n[valueKey] : n)"
      >
        {{ (is_object ? n[titleKey] : n)?.limitWords(4) }}
        <v-tooltip
          v-if="
            (is_object ? n[titleKey] : n)?.limitWords(4) !==
            (is_object ? n[titleKey] : n)
          "
          activator="parent"
          :text="is_object ? n[titleKey] : n"
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-hover="true"
          :open-on-focus="true"
          :persistent="false"
        />
      </v-btn>
      <v-menu
        v-model="menu"
        width="320"
        max-width="min(320px, calc(100vw - 32px))"
        :max-height="320"
        :offset="6"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="u-smart-suggestion__more"
            variant="text"
            icon
            :aria-label="moreLabel"
          >
            <v-icon icon="more_horiz" size="16" aria-hidden="true" />
            <v-tooltip
              activator="parent"
              :text="moreLabel"
              :disabled="menu"
              location="top"
              content-class="sd-modern-tooltip text-start"
              :open-on-hover="true"
              :open-on-focus="true"
              :persistent="false"
            />
          </v-btn>
        </template>
        <v-list
          class="u-smart-suggestion__choices u-smart-suggestion__menu text-start"
          density="compact"
          :lines="is_object ? 'two' : 'one'"
        >
          <v-list-item
            v-for="n in samples_processed"
            :key="is_object ? n[valueKey] : n"
            rounded="lg"
            @click="
              $emit('select', is_object ? n[valueKey] : n);
              menu = false;
            "
          >
            <v-list-item-title class="text-wrap">
              {{ is_object ? n[titleKey] : n }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="is_object">
              {{ n[valueKey] }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
    <template v-else>
      <v-slide-group show-arrows>
        <v-slide-group-item key="o">
          <v-btn
            class="u-smart-suggestion__more"
            :aria-label="moreLabel"
            icon
            variant="text"
            @click="showDialog"
          >
            <v-icon icon="more_horiz" size="16" aria-hidden="true" />
            <v-tooltip
              activator="parent"
              :text="moreLabel"
              location="top"
              content-class="sd-modern-tooltip text-start"
              :open-on-focus="true"
              :persistent="false"
            />
          </v-btn>
        </v-slide-group-item>
        <v-slide-group-item
          v-for="n in samples_processed"
          :key="is_object ? n[valueKey] : n"
        >
          <v-btn
            :title="is_object ? n[titleKey] : n"
            :aria-label="is_object ? n[titleKey] : n"
            class="tnt u-smart-suggestion__sample"
            size="small"
            variant="plain"
            @click="$emit('select', is_object ? n[valueKey] : n)"
          >
            {{ (is_object ? n[titleKey] : n)?.limitWords(4) }}
          </v-btn>
        </v-slide-group-item>
      </v-slide-group>

      <!-- ██████████████████████ Dialog ██████████████████████ -->

      <v-dialog
        v-if="dialog_pre"
        v-model="dialog"
        fullscreen
        scrollable
        transition="dialog-bottom-transition"
      >
        <v-card class="text-start">
          <v-card-text class="py-16">
            <v-list
              class="u-smart-suggestion__choices max-widget-width mx-auto text-start overflow-visible"
              lines="two"
            >
              <v-list-item
                v-for="n in samples_processed"
                :key="is_object ? n[valueKey] : n"
                rounded="lg"
                @click="
                  $emit('select', is_object ? n[valueKey] : n);
                  closeDialog();
                "
              >
                <v-list-item-title class="text-wrap">
                  {{ is_object ? n[titleKey] : n }}
                </v-list-item-title>
                <v-list-item-subtitle v-if="is_object">
                  {{ n[valueKey] }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions>
            <div class="widget-buttons">
              <v-btn size="x-large" variant="text" @click="closeDialog">
                <v-icon start>close</v-icon>
                {{ $t("global.actions.close") }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Seasons from "./Seasons.ts";
import { isObject } from "lodash-es";

export default defineComponent({
  name: "USmartSuggestion",
  components: {},

  emits: ["select"],
  props: {
    samples: {},
    addSession: { type: Boolean },
    noRandom: { type: Boolean },
    modern: { type: Boolean, default: false },
    previewCount: { type: Number, default: 3 },
    moreLabel: { type: String, default: "More suggestions" },
    valueKey: {
      default: "value",
    },
    titleKey: {
      default: "title",
    },
  },
  data: () => ({
    dialog_pre: false,
    dialog: false,
    menu: false,
  }),
  computed: {
    is_object() {
      return this.samples && isObject(this.samples[0]);
    },

    samples_processed() {
      if (this.is_object) return this.samples; // Not available for objects
      let out = this.samples;
      if (this.addSession) {
        // Get current date
        const date = new Date();

        // Get current month and year
        const month = date.getMonth();
        const year = date.getFullYear();

        // Get current season
        const found = Object.values(Seasons).find((s) =>
          s.months.includes(month),
        );
        const currentSeason = found ? this.$t(found.name) : "";

        out = this.samples?.map((n) => n + ` | ${currentSeason} ${year}`);
      }
      if (this.noRandom) return out;

      return out.random();
    },
  },
  methods: {
    showDialog() {
      this.dialog_pre = true;
      this.$nextTick(() => {
        this.dialog = true;
      });
    },
    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.dialog_pre = false;
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.u-smart-suggestion {
  .u-smart-suggestion__sample.v-btn {
    min-width: 0;
    min-height: 26px;
    height: auto;
    padding: 3px 8px;
    border: 0;
    border-radius: 999px;
    font-family: inherit;
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0;
    text-indent: 0;
    text-transform: none;
    color: rgba(var(--v-theme-on-surface), 0.62);
    background: rgba(var(--v-theme-on-surface), 0.045);
    box-shadow: none;
    opacity: 1;

    :deep(.v-btn__content) {
      font: inherit;
      letter-spacing: inherit;
      white-space: normal;
      text-align: start;
      opacity: 1;
    }
  }
  .u-smart-suggestion__sample:hover {
    color: rgba(var(--v-theme-on-surface), 0.78);
    background: rgba(var(--v-theme-on-surface), 0.075);
  }
  .u-smart-suggestion__more.v-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    box-shadow: none;
    color: rgba(var(--v-theme-on-surface), 0.62);
  }
  .u-smart-suggestion__more.v-btn:focus-visible,
  .u-smart-suggestion__sample.v-btn:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
}
.u-smart-suggestion--modern {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
}
.u-smart-suggestion:not(.u-smart-suggestion--modern) {
  .u-smart-suggestion__sample,
  .u-smart-suggestion__more {
    margin-inline-end: 6px;
  }
}
.u-smart-suggestion__choices {
  padding: 6px;
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0;

  :deep(.v-list-item) {
    min-height: 40px;
    padding: 9px 12px;
  }
  :deep(.v-list-item:focus-visible) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -2px;
  }
  :deep(.v-list-item-title) {
    font: inherit;
    white-space: normal;
    hyphens: none;
    overflow-wrap: anywhere;
  }
  :deep(.v-list-item-subtitle) {
    color: rgba(var(--v-theme-on-surface), 0.62);
    font-size: 11px;
    line-height: 17px;
    letter-spacing: 0;
    white-space: normal;
    hyphens: none;
    overflow-wrap: anywhere;
    -webkit-line-clamp: unset;
    opacity: 1;
  }
}
.u-smart-suggestion__menu.v-list {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 6px 20px rgba(var(--v-theme-on-surface), 0.09);
  scrollbar-width: thin;
}
@media (max-width: 600px), (pointer: coarse) {
  .u-smart-suggestion {
    .u-smart-suggestion__sample.v-btn {
      min-width: 44px;
      min-height: 44px;
    }
    .u-smart-suggestion__more.v-btn {
      width: 44px;
      height: 44px;
      min-width: 44px;
    }
  }
  .u-smart-suggestion__choices :deep(.v-list-item) {
    min-height: 44px;
  }
}
</style>
