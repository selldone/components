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
  <div>
    <div :class="{ disabled: busy_fetch }" class="widget-box mb-5">
      <s-widget-header
        :disabled="IS_VENDOR_PANEL"
        add-caption="Create new badge"
        disabled-reason="Only marketplace owners"
        icon="verified"
        title="Badges"
        @click:add="showAdd"
      ></s-widget-header>

      <v-list-subheader>Add and edit custom product badges.</v-list-subheader>

      <u-loading-progress v-if="busy_set || busy_fetch"></u-loading-progress>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Custom / Auto mode▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

      <u-smart-switch
        v-model="custom"
        class="mb-5"
        false-description="Products badges are created automatically."
        false-icon="brightness_auto"
        false-title="Auto"
        true-description="Add custom badges in the product page."
        true-icon="verified"
        true-title="Custom products badges"
        @change="
          (val) => {
            badges = val ? [] : null;
            saveProductBadges();
          }
        "
      >
      </u-smart-switch>
      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Custom badges ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <v-expand-transition>
        <div v-if="custom">
          <u-smart-draggable
            v-model="badges"
            :item-image="findImage"
            :item-label="findTitle"
            :item-menu="[
              {
                title: $t('global.actions.edit'),
                click: (id) => showEdit(id),
                icon: 'edit',
              },
              {
                title: $t('global.actions.delete'),
                click: (id) => {
                  remove(badges, id);
                  saveProductBadges();
                },
                icon: 'close',
              },
            ]"
            border-between
            rounded
            @change="saveProductBadges"
          >
            <template v-slot:append-inner>
              <div
                key="_list"
                class="p-2 pp row-hover usn ignore bg-white rounded-xl my-2"
              >
                <v-autocomplete
                  v-model="new_badge"
                  :items="all_badges_filter"
                  flat
                  hide-details
                  item-title="title"
                  item-value="id"
                  placeholder="Select a badge"
                  prepend-inner-icon="add"
                  return-object
                  variant="solo"
                  @update:model-value="addBadge"
                >
                  <template v-slot:item="{ item, props }">
                    <v-list-item :title="item.raw.title" v-bind="props">
                      <template v-slot:prepend>
                        <v-img
                          :src="getShopImagePath(item.raw.image)"
                          class="me-2 flex-grow-0"
                          height="24"
                          width="24"
                        >
                        </v-img>
                      </template>
                      <template v-slot:append>
                        <v-icon
                          v-if="item.raw.link"
                          :title="item.raw.link"
                          class="mx-1"
                          color="blue"
                          size="small"
                          >link
                        </v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </div>
            </template>
          </u-smart-draggable>
        </div>
      </v-expand-transition>
    </div>

    <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Dialog > Add / Edit ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
    <v-dialog
      v-model="show_add"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title></v-card-title>

        <v-card-text>
          <div class="widget-box mb-5">
            <s-widget-header title="Custom badge"></s-widget-header>

            <v-list-subheader
              >Add a new custom badge to my shop. Keep badges count under 10.
              More badges would slow down your shop.
            </v-list-subheader>

            <v-text-field
              v-model="title_input"
              :label="$t('global.commons.title')"
              persistent-placeholder
              placeholder="Public title..."
              variant="underlined"
            ></v-text-field>

            <v-text-field
              v-model="link_input"
              :label="$t('global.commons.link')"
              append-icon="link"
              persistent-placeholder
              placeholder="https://..."
              variant="underlined"
            ></v-text-field>

            <v-file-input
              v-model="image_input"
              accept="image/*"
              color="primary"
              label="Image"
              messages="Max image size: 128KB"
              placeholder="Select a cover image"
              prepend-icon=""
              prepend-inner-icon="image"
              show-size
              variant="underlined"
            />

            <div class="text-end">
              <v-btn
                class="mb-2"
                color="primary"
                variant="text"
                @click="show_advance = !show_advance"
                >Show advanced option
              </v-btn>
            </div>
            <v-expand-transition>
              <div v-if="show_advance">
                <v-text-field
                  v-model="pattern_input"
                  class="mb-3"
                  label="Pattern"
                  messages="Automatically show this badge for products has this matched value in their spec. Regex supported."
                  persistent-placeholder
                  placeholder="To show for all products write: *.*"
                  variant="underlined"
                ></v-text-field>
              </div>
            </v-expand-transition>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="show_add = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
            <v-btn
              v-if="selected_badge"
              :class="{
                disabled: !title_input && !image_input,
              }"
              :loading="busy_save"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="editBadge"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
            <v-btn
              v-else
              :disabled="!title_input && !image_input"
              :loading="busy_save"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="addNewBadge"
            >
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import USmartDraggable from "../../../../ui/smart/draggable/USmartDraggable.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import _ from "lodash-es";

export default {
  name: "BProductBadgesManage",
  components: { USmartSwitch, USmartDraggable },
  props: {
    product: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    custom: false,
    badges: null,
    busy_set: false,
    busy_fetch: false,

    show_add: false,
    new_badge: null,
    all_badges: [],

    title_input: null,
    link_input: null,
    image_input: null,
    pattern_input: null,
    busy_save: false,
    show_advance: false,

    selected_badge: null, // Edit badge mode
  }),

  computed: {
    all_badges_filter() {
      return this.all_badges.filter(
        (b) => !this.badges || !this.badges.includes(b.id),
      );
    },

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {},

  methods: {
    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Fetch Badges ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    fetchShopBadges() {
      this.busy_fetch = true;

      axios
        .get(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.GET_MY_VENDOR_CUSTOM_BADGE(
                this.$route.params.vendor_id,
              )
            : window.API.GET_CUSTOM_BADGE(this.product.shop_id),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.all_badges = data.badges;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Add New badge ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    addNewBadge() {
      this.busy_save = true;

      let formData = new FormData();
      if (this.title_input) formData.append("title", this.title_input);
      if (this.link_input) formData.append("link", this.link_input);

      if (this.image_input)
        formData.append("image", this.image_input);
      if (this.pattern_input) formData.append("pattern", this.pattern_input);

      axios
        .post(
          window.API.POST_ADD_CUSTOM_BADGE(this.product.shop_id),

          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }

          this.show_add = false;
          this.title_input = null;
          this.link_input = null;
          this.image_input = null;
          this.pattern_input = null;

          this.AddOrUpdateItemByID(this.all_badges, data.badge);
          this.showSuccessAlert(null, "Badge added successfully!");
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Edit badge ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    editBadge() {
      this.busy_save = true;

      let formData = new FormData();
      if (this.title_input) formData.append("title", this.title_input);
      if (this.link_input) formData.append("link", this.link_input);

      if (this.image_input)
        formData.append("image", this.image_input);
      if (this.pattern_input) formData.append("pattern", this.pattern_input);

      axios
        .post(
          window.API.POST_EDIT_CUSTOM_BADGE(
            this.product.shop_id,
            this.selected_badge.id,
          ),

          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }

          this.show_add = false;
          this.title_input = null;
          this.link_input = null;
          this.image_input = null;
          this.pattern_input = null;

          this.AddOrUpdateItemByID(this.all_badges, data.badge);

          this.showSuccessAlert(null, "Badge updated successfully!");
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    showAdd() {
      this.selected_badge = null;
      this.title_input = null;
      this.link_input = null;
      this.image_input = null;
      this.pattern_input = null;
      this.show_add = true;
    },
    showEdit(id) {
      const item = this.all_badges.find((b) => b.id === id);
      if (!item) {
        return this.showErrorAlert(
          null,
          "Item not found! Refresh the page or call support.",
        );
      }
      this.selected_badge = item;

      this.title_input = item.title;
      this.link_input = item.link;
      this.image_input = null;
      this.pattern_input = item.pattern;
      this.show_add = true;
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ Set Product Badges ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    addBadge(new_badge) {
      if (!new_badge) return;
      this.badges.push(new_badge.id);

      this.new_badge = null; // Deselect!
      this.saveProductBadges();
    },

    saveProductBadges: _.throttle(function (newVal, oldVal) {
      this.saveProductBadgesNow();
    }, 3000),

    saveProductBadgesNow() {
      this.busy_set = true;

      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_SET_PRODUCT_BADGE(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_SET_PRODUCT_BADGE(
                this.product.shop_id,
                this.product.id,
              ),
          {
            badges: this.badges,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.product.badges = data.badges;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    findImage(id) {
      const f = this.all_badges.find((b) => b.id === id);
      return f && f.image ? this.getShopImagePath(f.image) : null;
    },
    findTitle(id) {
      const f = this.all_badges.find((b) => b.id === id);
      return f ? f.title : null;
    },
  },
  created() {
    this.badges = this.product.badges;
    if (this.badges && !Array.isArray(this.badges)) this.badges = []; // Fix not array bugs!

    if (this.badges) this.custom = true;

    this.fetchShopBadges();
  },
};
</script>

<style lang="scss" scoped></style>
