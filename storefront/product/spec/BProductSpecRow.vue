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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <li
    :class="$vuetify.locale.isRtl ? 'text-right' : 'text-left'"
    :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'"
    style="list-style-type: none"
  >
    <!-- ████████████████████ Group Title ████████████████████ -->

    <div v-if="isGroup" :class="{ editable: editable }" class="section-group">
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Group > Label ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-text-field
        v-if="editing && !minimize"
        v-model="item.group"
        flat
        hide-details
        placeholder="Spec category title"
        type="text"
        variant="solo"
        @keypress.enter.stop="editing = false"
      />
      <p
        v-else
        :class="{ 'editable-blue': editable }"
        class="flex-grow-1 py-1"
        @click="editing = editable"
      >
        <v-icon v-if="editable" color="#333"> expand_more</v-icon>
        <v-btn
          v-else
          icon
          variant="text"
          @click="
            local_collapse = !local_collapse;
            $emit('update:collapse', local_collapse);
          "
        >
          <v-icon :class="{ 'rotate-180': local_collapse }" color="#333">
            expand_more
          </v-icon>
        </v-btn>
        {{ item.group }}
      </p>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Group > Edit ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-if="editable && !minimize">
        <v-btn
          :color="editing ? 'primary' : '#444'"
          class="section-action"
          icon
          size="small"
          variant="text"
          @click="editing = !editing"
        >
          <v-icon> edit</v-icon>
        </v-btn>
        <v-btn
          class="section-action"
          color="#444"
          icon
          size="small"
          variant="text"
          @click="$emit('delete')"
        >
          <v-icon> delete</v-icon>
        </v-btn>
      </template>
    </div>

    <!-- ████████████████████ Item ████████████████████ -->

    <div v-if="isItem" :class="{ editable: editable }" class="list-item mt-1">
      <div :class="{ '-view-mode': !editable }" class="grid">
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Item > Label ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div
          v-if="editing && !minimize"
          class="section-item strong d-flex align-start"
        >
          <v-text-field
            v-model="item[0]"
            flat
            hide-details
            placeholder="Name of spec.."
            type="text"
            density="compact"
            variant="solo"
            @keypress.enter.stop="editing = false"
          />
        </div>

        <div
          v-else
          :class="{ 'editable-blue': !editing && editable }"
          class="section-item sec2 strong"
          @click="editing = editable"
        >
          {{ item[0] }}
        </div>

        <template v-if="!minimize">
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Item > Value ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div
            v-if="editing"
            class="section-item d-flex flex-column justify-start align-stretch"
            contenteditable="true"
          >
            <v-text-field
              v-for="i in item.length - 1"
              :key="i"
              v-model="item[i]"
              class="mb-1"
              flat
              density="compact"
              hide-details
              placeholder="Value of spec.."
              type="text"
              variant="solo"
              ref="item_value"
              @keypress.enter.stop="
                addInnerItem(item, i);
                moveNestFocus(i);
              "
            >
              <template v-slot:append-inner>
                <v-btn
                  v-if="i !== 1"
                  :title="`Remove item ${item}`"
                  icon
                  size="small"
                  variant="text"
                  @click.stop="
                    () => {
                      if (item.length > 2) item.splice(i, 1);
                    }
                  "
                >
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-text-field>
            <div class="py-1 small">Press Enter to add new row.</div>
          </div>
          <div
            v-else
            :class="{
              'editable-blue': editable,
              '-dense-value': denseValues,
              'section-item has-splitter': !denseValues,
            }"
            class="section-item sec1"
            contenteditable="false"
            @click="editing = editable"
          >
            <div v-for="i in item.length - 1" :key="i">
              {{ item[i] }}
            </div>
          </div>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Item > Edit Actions ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <template v-if="editable">
            <!-- Edit button -->
            <v-btn
              :color="editing ? 'green' : '#444'"
              class="section-action"
              icon
              size="small"
              variant="text"
              @click="editing = !editing && editable"
            >
              <v-icon>
                {{ editing ? "check" : "edit" }}
              </v-icon>
            </v-btn>

            <!-- Delete button -->
            <v-btn
              class="section-action"
              color="red"
              icon
              size="small"
              variant="text"
              @click="$emit('delete')"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </template>
        </template>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
// ―――――――――――――――― A set of vue mixins to turn any list into an animated sortable list ――――――――――――――――

export default {
  name: "BProductSpecRow",
  components: {},
  emits: ["update:collapse", "delete"],
  props: {
    item: {},
    editable: {
      type: Boolean,
      default: false,
    },

    minimize: {
      type: Boolean,
      default: false,
    },
    collapse: {
      type: Boolean,
      default: false,
    },
    denseValues: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    editing: false,
    local_collapse: false,
  }),

  computed: {
    isGroup() {
      return !Array.isArray(this.item) && this.item.group !== undefined;
    },

    isItem() {
      return Array.isArray(this.item);
    },
  },

  watch: {
    collapse(val) {
      this.local_collapse = val;
    },
  },
  created() {
    this.local_collapse = this.collapse;
  },

  methods: {
    addInnerItem(item, index) {
      item.splice(index + 1, 0, "");
    },
    moveNestFocus(i /*Start from 1*/) {
      this.$nextTick(() => {
        if (this.$refs.item_value[i]) this.$refs.item_value[i].focus();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.rtl {
  direction: rtl !important;
}

.list-item {
  position: relative;
  min-height: 42px;
  background: #fafafa;
  margin-right: 0;
  margin-left: 0;
  border-radius: 4px;

  &.editable {
    cursor: move;
    user-select: none;
  }

  width: 100%;

  .grid {
    display: grid;
    grid-template-columns: 35% auto 50px 50px;

    &.-view-mode {
      grid-template-columns: 35% auto;
    }

    @media only screen and (max-width: 900px) {
      //   display: block;
      grid-template-columns: 35% auto !important;

      // grid-template-columns:unset;
      font-size: 0.9rem;
    }
  }

  .section-item {
    // direction: rtl;
    font-weight: 500;
    //text-align: right;
    display: inline-block;
    padding: 4px 8px 4px 8px;

    cursor: text;

    word-wrap: break-word; /* For legacy browsers */
    overflow-wrap: break-word; /* Standard CSS */
    word-break: break-word; /* Modern browsers */

    &.strong {
      font-weight: 700;
    }

    @media only screen and (max-width: 900px) {
      //   display: block;
    }

    &.-dense-value {
      display: flex !important;
      flex-wrap: wrap;
      flex-direction: row;

      & > * {
        padding: 6px;
      }
    }
  }

  .section-action {
    text-align: center !important;
    margin: auto !important;
  }

  .sec1 {
    //   width: 25%;
    div {
      margin: 0;
      padding: 6px;
    }

    &.has-splitter {
      :not(:first-child) {
        padding-top: 8px;
        border-top: #fff solid 2px;
      }
    }
  }

  .sec2 {
    // width: 50%;
    display: flex;
    align-items: center;
  }
}

.section-group {
  min-height: 48px;
  margin-top: 12px;
  padding: 8px 12px;
  font-weight: 800;
  font-size: 1.4em;
  display: flex;
  align-items: center;

  &.editable {
    cursor: move;
    user-select: none;
  }

  p {
    margin: 0;
  }

  @media only screen and (max-width: 900px) {
    font-size: 1.1rem;
  }
}
</style>
