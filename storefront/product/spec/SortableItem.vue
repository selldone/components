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
  <div
    :class="$vuetify.rtl ? 'text-right' : 'text-left'"
    :dir="$vuetify.rtl ? 'rtl' : 'ltr'"
  >
    <!-- ████████████████████ Group Title ████████████████████ -->

    <div v-if="isGroup" class="section-group" :class="{ editable: editable }">
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Group > Label ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-text-field
        v-if="editing && !minimize"
        v-model="item.group"
        type="text"
        flat
        solo
        hide-details
        placeholder="Spec category title"
        @keypress.enter.stop="editing = false"
      />
      <p
        v-else
        @click="editing = editable"
        class="flex-grow-1 py-1"
        :class="{ 'editable-blue': editable }"
      >
        <v-icon color="#333" v-if="editable"> expand_more </v-icon>
        <v-btn v-else @click="$emit('update:collapse', !collapse)" icon>
          <v-icon color="#333" :class="{ 'rotate-180': collapse }">
            expand_more
          </v-icon>
        </v-btn>
        {{ item.group }}
      </p>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Group > Edit ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-if="editable && !minimize">
        <v-btn
          class="section-action"
          :color="editing ? 'primary' : '#444'"
          small
          icon
          @click="editing = !editing"
        >
          <v-icon small> edit </v-icon>
        </v-btn>
        <v-btn
          class="section-action"
          small
          icon
          color="#444"
          @click="$emit('delete')"
        >
          <v-icon small> delete </v-icon>
        </v-btn>
      </template>
    </div>

    <!-- ████████████████████ Item ████████████████████ -->

    <div v-if="isItem" class="list-item mt-1" :class="{ editable: editable }">
      <div class="grid" :class="{ '-view-mode': !editable }">
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Item > Label ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div
          class="section-item sec2 strong"
          @click="editing = editable"
          :class="{ 'editable-blue': !editing && editable }"
        >
          <v-text-field
            v-if="editing && !minimize"
            v-model="item[0]"
            type="text"
            solo
            flat
            hide-details
            placeholder="Name of spec.."
            @keypress.enter.stop="editing = false"
          />
          <div v-else>{{ item[0] }}</div>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Value ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <template v-if="!minimize">
          <div v-if="editing" class="section-item sec1" contenteditable="true">
            <v-text-field
              v-for="i in item.length - 1"
              :key="i"
              v-model="item[i]"
              type="text"
              class="my-1"
              solo
              flat
              hide-details
              placeholder="Value of spec.."
              @keypress.enter.stop="addInnerItem(item, i)"
            >
              <template v-slot:append>
                <v-btn
                  v-if="i !== 1"
                  small
                  icon
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
          </div>
          <div
            v-else
            class="section-item sec1"
            :class="{
              'editable-blue': editable,
              '-dense-value': denseValues,
              'section-item has-splitter': !denseValues,
            }"
            contenteditable="false"
            @click="editing = editable"
          >
            <div v-for="i in item.length - 1" :key="i">
              {{ item[i] }}
            </div>
          </div>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Item > Edit ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <template v-if="editable">
            <!-- Edit button -->
            <v-btn
              class="section-action"
              :color="editing ? 'primary' : '#444'"
              small
              icon
              @click="editing = !editing && editable"
            >
              <v-icon :small="!editing">
                {{ editing ? "check" : "edit" }}
              </v-icon>
            </v-btn>

            <!-- Delete button -->
            <v-btn
              class="section-action"
              small
              icon
              color="#444"
              @click="$emit('delete')"
            >
              <v-icon small> delete </v-icon>
            </v-btn>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
// ―――――――――――――――― A set of vue mixins to turn any list into an animated sortable list ――――――――――――――――
//import { ContainerMixin, ElementMixin } from "vue-slicksort";

export default {
  name: "SortableItem",
  //mixins: [ElementMixin],
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
  }),

  computed: {
    isGroup() {
      return !Array.isArray(this.item) && this.item.group !== undefined;
    },

    isItem() {
      return Array.isArray(this.item);
    },
  },

  watch: {},

  methods: {
    addInnerItem(item, index) {
      console.log("index", index);
      item.splice(index + 1, 0, "");
    },
  },
};
</script>

<style scoped lang="scss">
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
    grid-template-columns: 25% auto 50px 50px;

    &.-view-mode {
      grid-template-columns: 25% auto;
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
