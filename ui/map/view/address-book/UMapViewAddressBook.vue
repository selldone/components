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
  <v-slide-group v-bind="$attrs" :model-value="modelValue">
    <div style="width: 64px"></div>

    <v-slide-group-item
      v-for="item in address_book"
      :key="item.id"
      class="hover-scale-small"
    >
      <v-sheet
        :color="
          modelValue === item ? 'rgba(1,1,2,0.8)' : 'rgba(255,255,255,0.6)'
        "
        :theme="modelValue === item ? 'dark' : 'light'"
        :title="item.address"
        class="ma-1 pa-2 position-relative pp usn"
        width="180"
        style="backdrop-filter: blur(4px)"
        @click="clickOnAddressItem(item)"
        border
        rounded="lg"
      >
        <div class="font-weight-bold single-line d-flex align-center">
          {{ item.title }}

          <v-icon v-if="item.phone" size="14" class="ms-1"> phone</v-icon>
          <v-icon v-if="item.location" size="14" class="ms-1"> pin_drop</v-icon>

          <v-spacer></v-spacer>
          <v-btn
            :title="$t('global.actions.delete')"
            class="float-end"
            icon
            size="24"
            variant="text"
            @click.stop="deleteAddressBook(item)"
          >
            <v-icon size="16">close</v-icon>
          </v-btn>
        </div>
        <div>
          <div class="small single-line text-start">
            <v-icon class="me-1" size="small">map</v-icon>
            <flag
              v-if="item.country"
              :iso="item.country"
              :squared="false"
              class="me-1"
            />

            {{ item.address }}
          </div>
        </div>
      </v-sheet>
    </v-slide-group-item>

    <div v-if="canSaveAddress" class="ma-1">
      <v-btn
        class="zoomIn"
        color="primary"
        variant="elevated"
        height="100%"
        min-height="50"
        stacked
        @click="showAddNew()"
      >
        <v-icon size="20">add_box</v-icon>
        <div class="mt-1 tnt small">
          {{ $t("global.actions.add") }}
        </div>
      </v-btn>
    </div>
    <div v-if="canSaveUpdate" class="ma-1">
      <v-btn
        class="zoomIn"
        color="primary"
        variant="elevated"
        height="100%"
        min-height="50"
        @click="showEdit()"
        stacked
      >
        <v-icon size="20">save</v-icon>
        <div class="mt-1 tnt small">
          {{ $t("global.actions.update") }}
        </div>
      </v-btn>
    </div>
    <div style="width: 64px"></div>

    <u-loading-progress v-if="busy_fetch"></u-loading-progress>
  </v-slide-group>

  <!-- ███████████████████████ Dialog > Address book ███████████████████████ -->

  <v-bottom-sheet
    v-model="dialog_add_to_address_book"
    :max-width="620"
    width="98vw"
    content-class="rounded-t-xl"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title>
        <v-icon class="me-2" color="#333">map</v-icon>
        {{ $t("global.map_view.add_address_to_list") }}
      </v-card-title>
      <v-card-text>

        <div class="text-subtitle-2 mb-5">
          <flag
              :iso="externalPack.country"
              :squared="false"
              class="me-1"
          />

          {{full_address}}
        </div>

        <v-text-field
          v-model="title_input"
          :label="$t('global.map_view.address_title_input')"
          color="primary"
          variant="outlined"
          persistent-placeholder
          placeholder="Enter a name for address..."
          autofocus
          class="mt-5"
        >
          <template v-slot:prepend-inner>
            <v-fade-transition leave-absolute>
              <v-icon v-if="title_input" color="success"> check_circle</v-icon>
            </v-fade-transition>
          </template>
        </v-text-field>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog_add_to_address_book = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            v-if="edit_mode"
            :class="{ disabled: !title_input }"
            :loading="busy_update_book"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="updateAddressBook"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
          <v-btn
            v-else
            :class="{ disabled: !title_input }"
            :loading="busy_save"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="saveCurrentPosition"
          >
            <v-icon start>add</v-icon>
            {{ $t("global.actions.add") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import {MapHelper} from "@selldone/core-js/helper/index";

export default {
  name: "UMapViewAddressBook",
  components: {},
  emits: [],
  props: {
    /**
     * Force selected address ID
     */
    selectedAddressId: {},
    modelValue: {},
    /**
     * Set externally
     * an object contains address, name,...
     */
    externalPack: {},
  },
  data() {
    return {
      address_book: null,
      busy_fetch: false,

      dialog_add_to_address_book: false,
      title_input: null,
      busy_update_book: false,
      busy_save: false,

      edit_mode: false,
    };
  },
  watch: {
    "user.id"() {
      this.fetchAddressBook();
    },
    newAddressTitle(val) {
      this.title_input = val;
    },
  },

  computed: {
    user() {
      return this.USER();
    },

    canSaveAddress() {
      return this.externalPack?.address;
    },

    canSaveUpdate() {
      return this.externalPack?.address && this.modelValue;
    },

    full_address(){
      return MapHelper.GenerateFullAddressFromMapInfo(this.externalPack)
    }
  },

  mounted() {},

  created() {
    this.title_input = this.newAddressTitle;

    this.fetchAddressBook();
  },

  methods: {
    /*******************************************************************
     *                          Address book
     *******************************************************************/

    clickOnAddressItem(item) {
      this.$emit("update:modelValue", item);
    },

    fetchAddressBook() {
      if (!this.user) return;

      this.busy_fetch = true;

      axios
        .get(window.ADDRESS_API.GET_MY_ADDRESSES())
        .then((response) => {
          if (!response.data.error) {
            this.address_book = response.data.addresses;
          } else {
            NotificationService.showErrorAlert(null, response.data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    deleteAddressBook(item) {
      NotificationService.openDangerAlert(
        this.$t("global.map_view.delete_address_dialog.title"),
        this.$t("global.map_view.delete_address_dialog.message"),
        this.$t("global.map_view.delete_address_dialog.action"),
        () => {
          this.$emit("update:modelValue", null);

          axios
            .delete(window.ADDRESS_API.DELETE_MY_ADDRESSES(item.id))
            .then((response) => {
              if (!response.data.error) {
                this.DeleteItemByID(this.address_book, response.data.id);
              } else {
                NotificationService.showErrorAlert(null, response.data.error_msg);
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            });
        },
      );
    },
    showAddNew() {
      this.edit_mode = false;
      this.dialog_add_to_address_book = true;
    },
    showEdit() {
      this.title_input = this.selectedAddressTitle
        ? this.selectedAddressTitle
        : this.modelValue?.title;
      this.edit_mode = true;
      this.dialog_add_to_address_book = true;
    },

    saveCurrentPosition() {
      this.busy_save = true;

      axios
        .post(window.ADDRESS_API.POST_ADDRESS(), {
          title: this.title_input,

          country: this.externalPack.country,
          state: this.externalPack.state,
          state_code: this.externalPack.state_code,
          city: this.externalPack.city,
          address: this.externalPack.address,
          location: this.externalPack.location,
          no: this.externalPack.no,
          unit: this.externalPack.unit,
          name: this.externalPack.name,
          phone: this.externalPack.phone,
          message: this.externalPack.message,
          postal: this.externalPack.postal,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t("global.map_view.notifications.save_in_list"),
            );
            this.AddOrUpdateItemByID(this.address_book, data.address);
            this.$emit("update:modelValue", null);

            this.title_input = "";
            this.dialog_add_to_address_book = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    updateAddressBook() {
      this.busy_update_book = true;
      axios
        .put(
          window.ADDRESS_API.PUT_ADDRESS(
            this.selectedAddressId
              ? this.selectedAddressId
              : this.modelValue.id,
          ),
          {
            title: this.title_input,

            country: this.externalPack.country,
            state: this.externalPack.state,
            state_code: this.externalPack.state_code,
            city: this.externalPack.city,
            address: this.externalPack.address,
            location: this.externalPack.location,
            no: this.externalPack.no,
            unit: this.externalPack.unit,
            name: this.externalPack.name,
            phone: this.externalPack.phone,
            message: this.externalPack.message,
            postal: this.externalPack.postal,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.UpdateItemByID(this.address_book, data.address);
            NotificationService.showSuccessAlert(
              null,
              this.$t("global.map_view.notifications.edit_success", {
                title: data.address.title,
              }),
            );
            this.dialog_add_to_address_book = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update_book = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
