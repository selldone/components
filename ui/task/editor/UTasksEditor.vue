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
  <draggable
    v-model="list"
    handle=".handle"
    style="list-style-type: none"
    tag="div"
    :class="{ 's-service-tasks-modern': modern }"
    v-bind="dragOptions"
    @end="drag = false"
    @start="drag = true"
    @update:modelValue="$emit('update:modelValue', list)"
  >
    <template v-slot:item="{ element, index }">
      <li
        class="list-group-item bg-transparent"
        :class="{ 's-service-tasks-modern__item': modern }"
      >
        <v-text-field
          v-if="editable"
          v-model="element.title"
          flat
          hide-details
          :placeholder="
            modern
              ? $t('process_center.modern.service_task_title')
              : 'Write task title here...'
          "
          :label="
            modern
              ? $t('process_center.modern.service_task_title')
              : 'Task Title'
          "
          :variant="modern ? 'underlined' : 'solo-filled'"
          :class="{
            'sd-modern-underlined-field s-service-tasks-modern__title-field':
              modern,
          }"
          persistent-placeholder
        >
          <template v-slot:prepend>
            <v-tooltip
              v-if="modern"
              location="top"
              :open-on-focus="true"
              :open-on-click="true"
              content-class="sd-modern-tooltip text-start"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  type="button"
                  icon="drag_indicator"
                  variant="text"
                  class="handle sd-modern-icon-button s-service-tasks-modern__handle"
                  :aria-label="$t('process_center.modern.service_task_reorder')"
                  @keydown.up.prevent="moveTask(index, -1)"
                  @keydown.down.prevent="moveTask(index, 1)"
                />
              </template>
              {{ $t("process_center.modern.service_task_reorder") }}
            </v-tooltip>
            <v-icon
              v-else
              :style="{ cursor: editable ? 'move' : undefined }"
              class="handle"
            >
              unfold_more
            </v-icon>
          </template>

          <template v-slot:append-inner>
            <v-tooltip
              v-if="modern"
              location="top"
              :open-on-focus="true"
              :open-on-click="true"
              content-class="sd-modern-tooltip text-start"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  type="button"
                  icon="close"
                  variant="text"
                  class="sd-modern-icon-button"
                  :aria-label="$t('process_center.modern.service_task_remove')"
                  @click.stop="deleteItem(index)"
                />
              </template>
              {{ $t("process_center.modern.service_task_remove") }}
            </v-tooltip>
            <v-btn
              v-else
              variant="text"
              icon
              title="Delete item"
              @click="deleteItem(index)"
              @click.stop
            >
              <v-icon color="red"> close</v-icon>
            </v-btn>
          </template>
        </v-text-field>

        <p v-else class="task-title" v-text="element.title"></p>
        <div v-if="modern" class="s-service-tasks-modern__progress">
          <v-slider
            v-if="!viewOnlyProgress"
            v-model="element.progress"
            :min="0"
            :max="100"
            :step="1"
            :track-size="4"
            :thumb-size="14"
            :aria-label="
              $t('process_center.modern.service_task_progress', {
                title: element.title,
              })
            "
            color="primary"
            hide-details
            @update:model-value="
              element.progress = Math.round(element.progress);
              $emit('change');
            "
          />
          <v-progress-linear
            v-else
            :model-value="element.progress"
            :reverse="$vuetify.locale.isRtl"
            color="primary"
            height="4"
            rounded
          />
          <span class="s-service-tasks-modern__percent"
            ><v-icon v-if="viewOnlyProgress" size="12" aria-hidden="true"
              >lock</v-icon
            >{{ element.progress }}%</span
          >
        </div>
        <v-progress-linear
          v-else
          v-model="element.progress"
          clickable
          :class="{ 'pointer-event-none': viewOnlyProgress }"
          :reverse="$vuetify.locale.isRtl"
          bg-color="#aaa"
          class="pointer-pointer my-2 border"
          color="primary"
          height="18"
          rounded
          striped
          @update:model-value="
            element.progress = Math.round(element.progress);
            $emit('change');
          "
        >
          <small v-if="viewOnlyProgress && editable">
            <v-icon class="me-1" size="12">lock</v-icon>
            lock
          </small>
        </v-progress-linear>
      </li>
    </template>

    <template v-slot:footer>
      <div
        v-if="editable"
        :class="modern ? 's-service-tasks-modern__add' : 'widget-buttons'"
      >
        <v-btn
          v-if="modern"
          type="button"
          color="primary"
          variant="text"
          class="sd-modern-button sd-modern-button--inline"
          @click="addItem"
          ><v-icon start size="18" aria-hidden="true">add</v-icon
          >{{ $t("process_center.modern.service_task_add") }}</v-btn
        >
        <v-btn
          v-else
          size="x-large"
          variant="flat"
          color="#000"
          @click="addItem"
        >
          <v-icon start>add</v-icon>
          <div>
            {{ $t("global.actions.add") }}
            <div class="small mt-1">Create new item for todo list</div>
          </div>
        </v-btn>
      </div>
    </template>
  </draggable>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";

export default {
  name: "UTasksEditor",
  components: { draggable: defineAsyncComponent(() => import("vuedraggable")) },
  props: {
    modern: { type: Boolean, default: false },
    modelValue: {},
    editable: {
      default: false,
      type: Boolean,
    },
    viewOnlyProgress: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    drag: false,
    index: 0,
    list: [],
  }),

  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      };
    },
  },

  watch: {
    modelValue() {
      this.list = this.modelValue;
    },
  },

  created() {
    this.list =
      this.modelValue && Array.isArray(this.modelValue) ? this.modelValue : [];
  },
  methods: {
    moveTask(index, offset) {
      if (!this.modern || !this.editable) return;
      const next = index + offset;
      if (next < 0 || next >= this.list.length) return;
      const [task] = this.list.splice(index, 1);
      this.list.splice(next, 0, task);
      this.$emit("update:modelValue", this.list);
      this.$emit("change");
    },
    deleteItem(index) {
      this.list.splice(index, 1);
      this.$emit("update:modelValue", this.list);
      this.$emit("change");
    },
    addItem() {
      this.list.push({ title: "", progress: 0 });
      this.$emit("update:modelValue", this.list);
      this.$emit("change");
    },
  },
};
</script>

<style lang="scss" scoped>
.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.list-group-item {
  padding: 6px;
  position: relative;
  list-style: none;
  border: none;

  .task-title {
    font-weight: 700;
    font-size: 1rem;
    //line-height: 2rem;
    text-align: start;
  }
}

.s-service-tasks-modern {
  &__item {
    padding: 14px 0;
    border-block-end: 1px solid var(--sd-modern-border);

    &:first-child {
      padding-block-start: 0;
    }
    &:last-child {
      border-block-end: 0;
    }
    .task-title {
      margin: 0 0 8px;
      font-size: 13px;
      line-height: 20px;
      font-weight: 500;
      overflow-wrap: anywhere;
    }
  }
  &__title-field :deep(.v-field__input) {
    font-size: 13px;
    line-height: 20px;
  }
  &__title-field :deep(.v-input__prepend) {
    margin-inline-end: 8px;
  }
  &__handle {
    cursor: grab;
    color: var(--sd-modern-muted);
  }
  &__progress {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-block-start: 10px;
    min-block-size: 26px;
  }
  &__progress :deep(.v-slider) {
    flex: 1;
    margin: 0;
    min-inline-size: 0;
  }
  &__progress :deep(.v-progress-linear) {
    flex: 1;
  }
  &__percent {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-inline-size: 44px;
    justify-content: end;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    font-variant-numeric: tabular-nums;
  }
  &__add {
    padding-block-start: 8px;
  }

  @media (max-width: 600px) {
    &__title-field :deep(.v-field__input) {
      font-size: 16px;
    }
    &__progress :deep(.v-slider-thumb__surface) {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
