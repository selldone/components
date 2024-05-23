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
  <div class="map">
    <v-slide-group
      v-if="hasAddressBook"
      :model-value="selected_address_from_list"
      center-active
      class="pa-4 center-items"
      show-arrows
      style="
        position: absolute;
        top: 4px;
        left: 0px;
        z-index: 1;
        overflow-x: auto;
        white-space: nowrap;
        width: 100%;
      "
    >
      <v-slide-group-item v-for="item in address_book" :key="item.id">
        <v-sheet
          :class="{ 'op-0-5': !noMap, 'op-0-9': noMap }"
          :color="selected_address_from_list === item ? '#1976d2' : '#fff'"
          :dark="selected_address_from_list === item"
          :title="item.address"
          class="ma-1 pa-2 position-relative opacity-1-hover pp usn"
          width="180"
          @click="clickOnAddressItem(item)"
        >
          <div class="font-weight-bold single-line d-flex align-center">
            {{ item.title }}
            <v-spacer></v-spacer>
            <v-btn
              :title="$t('global.actions.delete')"
              class="float-end"
              icon
              variant="text"
              @click.stop="deleteAddressBook(item)"
            >
              <v-icon>close</v-icon>
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
            <v-icon v-if="item.phone" size="small"> phone</v-icon>
            <v-icon v-if="item.location" size="small"> pin_drop</v-icon>
          </div>
        </v-sheet>
      </v-slide-group-item>
    </v-slide-group>

    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <div
      v-if="hasAddressBook"
      style="position: absolute; top: 48px; left: 8px; z-index: 1000"
    >
      <div class="mb-5">
        <v-btn
          v-if="mode_bottom_card !== 'detail'"
          class="-black"
          icon
          size="small"
          variant="elevated"
          @click="
            () => {
              $emit('close');
            }
          "
        >
          <v-icon>arrow_downward</v-icon>

          <v-tooltip activator="parent">
            {{ $t("global.actions.close") }}
          </v-tooltip>
        </v-btn>
      </div>

      <div v-if="$vuetify.display.mdAndUp" class="mb-5">
        <v-btn
          v-if="canSaveAddress"
          class="zoomIn"
          color="#1976D2"
          icon
          size="small"
          variant="elevated"
          @click="dialog_add_to_address_book = true"
        >
          <v-icon>add</v-icon>
          <v-tooltip activator="parent">
            {{ $t("global.actions.add") }}
          </v-tooltip>
        </v-btn>
      </div>
      <div v-if="$vuetify.display.mdAndUp" class="mb-5">
        <v-btn
          v-if="canSaveUpdate"
          :loading="busy_update_book"
          class="zoomIn"
          icon
          size="small"
          variant="elevated"
          @click="updateAddressBook"
        >
          <v-icon color="#1976D2"> save</v-icon>
          <v-tooltip activator="parent">
            {{ $t("global.actions.update") }}
          </v-tooltip>
        </v-btn>
      </div>
    </div>

    <!-- ███████████████████████ Map View ███████████████████████ -->

    <v-btn
      v-if="clearable"
      class="absolute-bottom-center z2 m-1"
      color="red"
      size="small"
      variant="flat"
      @click.stop="$emit('clear', null)"
    >
      <v-icon class="me-1" size="small">close</v-icon>
      {{ $t("global.actions.clear") }}
    </v-btn>
    <div
      v-if="!noMap"
      :class="{ full: !hasBottomBar }"
      :style="freeze ? 'pointer-events: none' : ''"
      class="map-container"
    >
      <!-- Pre loading -->
      <u-loading-ellipsis
        v-if="!map_box"
        class="center-absolute"
        css-mode
        light
      ></u-loading-ellipsis>
      <!-- MAP -->
      <div
        :id="`map_box${map_id}`"
        :style="`height: 100%;width: 100%;border-radius: ${radius}px`"
      ></div>

      <div
        v-if="canSelectAddress && !center_clicked"
        :class="{ mini: last_selected_position }"
        class="center-map-view"
        @click.stop="getAddressStringOfCenter"
      >
        <img
          :class="{ jump: !last_selected_position }"
          :src="require('../../../assets/icons/location-center-icon-blue.svg')"
          width="64px"
        />
        <span class="label-icon text-nowrap">
          <span v-if="last_selected_position">
            {{ $t("global.map_view.change") }}
          </span>
          <span v-else>{{ $t("global.map_view.select") }}</span>

          {{ addressType }}
        </span>
      </div>
    </div>
    <!-- ███████████████████████ Bottom View ███████████████████████ -->

    <div
      v-if="hasBottomBar"
      :class="{
        '-detail': mode_bottom_card === 'detail',
        'is-mobile': isMobile,
        'is-full-h': /* isFocus ||*/ mode_bottom_card === 'detail',
        'has-addresses': address_book && address_book.length,
      }"
      class="bottom-card thin-scroll text-start d-flex flex-column"
    >
      <!-- --------- Tab Search address --------- -->

      <v-slide-y-reverse-transition
        v-if="$vuetify.display.smAndDown"
        :style="$vuetify.locale.isRtl ? 'flex-direction: row-reverse;' : ''"
        class="mobile-toolbar"
        group
        tag="v-row"
      >
        <v-btn
          v-if="canSaveAddress"
          key="mt-1"
          :caption="$t('global.actions.add')"
          class="sub-caption b-16px -black mx-2"
          color="#1976D2"
          icon
          size="small"
          variant="elevated"
          @click="dialog_add_to_address_book = true"
        >
          <v-icon>add</v-icon>
        </v-btn>

        <v-btn
          v-if="canSaveUpdate"
          key="mt-2"
          :caption="$t('global.actions.edit')"
          :loading="busy_update_book"
          class="sub-caption b-16px -black mx-2"
          icon
          size="small"
          variant="elevated"
          @click="updateAddressBook"
        >
          <v-icon color="#1976D2"> save</v-icon>
        </v-btn>

        <v-spacer key="mt-s"></v-spacer>
      </v-slide-y-reverse-transition>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Loading ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-progress-circular
        v-if="loading_address"
        :color="SaminColorLight"
        class="loading"
        indeterminate
        size="24"
      />
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Tab Default ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <v-expand-transition>
        <div
          v-if="mode_bottom_card === 'default' && !loading_address"
          key="m_1"
        >
          <v-container>
            <!-- Uncompleted fields errors -->
            <div
              v-if="!isFocus"
              :style="isMobile ? 'position: absolute;bottom: 0' : ''"
              class="mb-4"
            >
              <div v-if="address && !country">
                <v-icon class="me-1" color="red" size="small">warning</v-icon>
                {{ $t("global.notification.country_invalid") }}
              </div>
              <div v-if="address && !postal && has_postcode">
                <v-icon class="me-1" color="red" size="small">warning</v-icon>
                {{ $t("global.notification.postal_code_invalid") }}
              </div>
            </div>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Has Map Mode > Address input (Auto complete) ▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <u-map-address-input
              v-model="address"
              v-model:is-focus="isFocus"
              :bottom="isMobile"
              :center="center"
              :top="!isMobile"
              auto-disable-auto-complete
              @select:address="(it) => onSelectAddress(it)"
            ></u-map-address-input>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Actions ▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <div class="widget-buttons">
              <v-btn
                color="primary"
                size="x-large"
                variant="outlined"
                @click="showDetails"
              >
                <v-icon class="me-1" size="small"> edit_square</v-icon>
                {{ $t("global.map_view.address_detail") }}
                <v-icon
                  v-if="address && ((has_postcode && !postal) || !country)"
                  class="ms-1 blink-me-linear"
                  color="red"
                  size="x-small"
                  >fa:fas fa-exclamation-circle
                </v-icon>
              </v-btn>

              <v-btn color="primary" size="x-large" @click="clickSetLocation">
                <v-icon class="me-1"> done</v-icon>
                {{ confirmText }}
              </v-btn>
            </div>
          </v-container>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Tab Detail ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div v-else-if="mode_bottom_card === 'detail'" key="m_2">
          <v-container>
            <v-row dense>
              <v-col class="pt-4" cols="12">
                <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Has Map Mode > Address input ▃▃▃▃▃▃▃▃▃▃▃▃ -->

                <v-textarea
                  v-if="!noMap"
                  v-model="address"
                  :density="isMobile ? 'compact' : undefined"
                  :label="`▼ ${title}`"
                  :placeholder="$t('global.map_view.enter_your_address')"
                  :readonly="viewOnly"
                  auto-grow
                  color="green"
                  persistent-placeholder
                  prepend-inner-icon="local_shipping"
                  rows="2"
                  variant="underlined"
                />
                <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ No Map Mode > Address input (Auto complete) ▃▃▃▃▃▃▃▃▃▃▃▃ -->

                <u-map-address-input
                  v-else
                  v-model="address"
                  v-model:is-focus="isFocus"
                  :center="center"
                  auto-disable-auto-complete
                  bottom
                  clearable
                  @select:address="(it) => onSelectAddress(it)"
                ></u-map-address-input>
              </v-col>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Building No ▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-col cols="6" sm="6">
                <v-text-field
                  v-model="details_number"
                  :color="SaminColorLight"
                  :density="isMobile ? 'compact' : undefined"
                  :label="$t('global.map_view.building_number')"
                  :readonly="viewOnly"
                  prepend-inner-icon="apartment"
                  variant="underlined"
                />
              </v-col>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Unit No ▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-col cols="6" sm="6">
                <v-text-field
                  v-model="details_unit"
                  :color="SaminColorLight"
                  :density="isMobile ? 'compact' : undefined"
                  :label="$t('global.map_view.building_unit')"
                  :readonly="viewOnly"
                  prepend-inner-icon="roofing"
                  variant="underlined"
                />
              </v-col>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Full Name ▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-col cols="12">
                <v-text-field
                  v-model="details_full_name"
                  :color="SaminColorLight"
                  :density="isMobile ? 'compact' : undefined"
                  :label="
                    $t('global.map_view.full_name_input', {
                      type: receptorType,
                    })
                  "
                  :readonly="viewOnly"
                  prepend-inner-icon="perm_identity"
                  variant="underlined"
                />
              </v-col>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Country ▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-col cols="12" md="6" sm="6">
                <s-country-select
                  v-model="country"
                  :dense="isMobile"
                  :filter="availableCountries"
                  :label="$t('global.address_info.country')"
                  :readonly="viewOnly"
                  item-value="alpha2"
                  required
                ></s-country-select>
              </v-col>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ State ▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-col :sm="6" cols="6">
                <component
                  :is="states && states.length ? 'v-combobox' : 'v-text-field'"
                  v-model="state"
                  :dense="isMobile"
                  :items="states ? states : []"
                  :label="state_label"
                  :readonly="viewOnly"
                  variant="underlined"
                >
                  <template v-if="state_code" v-slot:prepend-inner>
                    <b
                      style="
                        background-color: #000;
                        color: #fff;
                        padding: 4px;
                        border-radius: 4px;
                        font-size: 12px;
                      "
                      >{{ state_code }}</b
                    >
                  </template>
                </component>
              </v-col>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ City ▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-col :sm="6" cols="6">
                <v-text-field
                  v-model="city"
                  :density="isMobile ? 'compact' : undefined"
                  :label="$t('global.address_info.city')"
                  :readonly="viewOnly"
                  variant="underlined"
                >
                </v-text-field>
              </v-col>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Post Code ▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-col v-if="has_postcode" cols="12" sm="6">
                <v-text-field
                  v-model="postal"
                  :color="SaminColorLight"
                  :density="isMobile ? 'compact' : undefined"
                  :label="$t('global.map_view.postal_code')"
                  :readonly="viewOnly"
                  prepend-inner-icon="markunread_mailbox"
                  variant="underlined"
                >
                  <template v-slot:append-inner>
                    <v-fade-transition leave-absolute>
                      <v-icon v-if="validPostalCode" color="success">
                        check_circle
                      </v-icon>
                    </v-fade-transition>
                  </template>
                </v-text-field>
              </v-col>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Phone ▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="phone_number"
                  :color="SaminColorLight"
                  :density="isMobile ? 'compact' : undefined"
                  :label="$t('global.map_view.phone_input')"
                  :readonly="viewOnly"
                  prepend-inner-icon="phone"
                  variant="underlined"
                >
                  <template v-slot:append-inner>
                    <v-fade-transition leave-absolute>
                      <v-icon v-if="validPhoneNumber" color="success">
                        check_circle
                      </v-icon>
                    </v-fade-transition>
                  </template>
                </v-text-field>
              </v-col>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Message ▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-col cols="12">
                <v-textarea
                  v-model="details_message"
                  :color="SaminColorLight"
                  :density="isMobile ? 'compact' : undefined"
                  :label="$t('global.map_view.more_detail_input')"
                  :readonly="viewOnly"
                  :rows="1"
                  auto-grow
                  prepend-inner-icon="sticky_note_2"
                  variant="underlined"
                />
              </v-col>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Actions ▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-col class="text-center" cols="12">
                <div class="widget-buttons">
                  <v-btn
                    color="primary"
                    size="x-large"
                    variant="text"
                    @click="
                      () => {
                        if (noMap) {
                          $emit('close');
                        } else {
                          mode_bottom_card = 'default';
                        }
                      }
                    "
                  >
                    <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
                    {{ $t("global.actions.back") }}
                  </v-btn>

                  <v-btn
                    v-if="noMap"
                    color="primary"
                    size="x-large"
                    variant="elevated"
                    @click="clickSetLocation"
                  >
                    <v-icon start> done</v-icon>
                    {{ confirmText }}
                  </v-btn>
                  <v-btn
                    v-else
                    color="primary"
                    size="x-large"
                    variant="elevated"
                    @click="showDefault()"
                  >
                    <v-icon start>save</v-icon>
                    {{ $t("global.map_view.save_detail_action") }}
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </v-expand-transition>
    </div>

    <!-- ███████████████████████ Dialog > Address book ███████████████████████ -->

    <v-dialog v-model="dialog_add_to_address_book" max-width="500px">
      <v-card>
        <v-card-title>
          <v-icon class="me-2" color="#333">map</v-icon>
          {{ $t("global.map_view.add_address_to_list") }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="new_address_title"
            :label="$t('global.map_view.address_title_input')"
            class="text-start mx-2"
            color="primary"
            prepend-inner-icon="fa:fas fa-tag"
            variant="underlined"
          >
            <template v-slot:prepend-inner>
              <v-fade-transition leave-absolute>
                <v-icon v-if="new_address_title" color="success">
                  check_circle
                </v-icon>
              </v-fade-transition>
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              :class="{ disabled: !new_address_title }"
              :loading="busy_save"
              color="primary"
              size="x-large"
              @click="saveCurrentPosition"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
            <v-btn
              size="x-large"
              variant="text"
              @click="dialog_add_to_address_book = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.cancel") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { createApp, h } from "vue";
import UMapViewPin from "../../../ui/map/view/market/UMapViewPin.vue";
import SCountrySelect from "../../../ui/country/select/SCountrySelect.vue";

//―――――――――――――――――――――― Mapbox ――――――――――――――――――――
import Mapbox from "../../../ui/map/providers/mapbox/MapBox";
import { SetupService } from "@selldone/core-js/server/SetupService";
import UMapAddressInput from "../../../ui/map/address/input/UMapAddressInput.vue";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { installGlobalComponents } from "../../../components-mandetory";

export default {
  name: "UMapView",
  components: { UMapAddressInput, SCountrySelect },
  emits: [
    "update:modelValue",
    "close",
    "select",
    "clear",
    "postalCode",
    "phoneNumber",
  ],
  props: {
    modelValue: {
      type: Object,
    },

    center: {
      type: Object,
    },

    zoom: {
      type: Number,
      default: 6,
    },

    color: {
      type: String,
      default: "#fff",
    },

    markerPosition: {},

    hide: {
      // Determine map is hide or not! (In the dialog mode)
      type: Boolean,
      default: false,
    },

    hasTopBar: {
      type: Boolean,
      default: false,
    },
    hasBottomBar: {
      type: Boolean,
      default: false,
    },

    hasAddressBook: {
      type: Boolean,
      default: false,
    },

    canSelectAddress: {
      type: Boolean,
      default: false,
    },

    showUserLocation: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    startupMode: {
      type: String,
      default: "default",
    },

    title: {
      type: String,
      default: "Shipping address",
    },

    confirmText: {
      type: String,
      default: "Confirm address",
    },

    addressType: {
      type: String,
      default: "Destination",
    },

    receptorType: {
      type: String,
      default: "Receiver",
    },

    newAddressTitle: {
      require: false,
      type: String,
    },

    selectedAddressId: {
      require: false,
    },
    selectedAddressTitle: {
      require: false,
    },

    pinImage: {
      require: false,
      type: String,
      default: require("../../../assets/icons/Truck-fill.svg"),
    },

    pinIcon: {
      require: false,
      type: String,
      default: null,
    },

    radius: {
      require: false,
      type: Number,
      default: 0,
    },
    viewOnly: {
      type: Boolean,
      default: false,
    },
    hideLocationButtons: {
      type: Boolean,
      default: false,
    },
    showSearchBox: Boolean,
    freeze: {
      type: Boolean,
      default: false,
    },
    delayLoad: {
      type: Number,
      default: 0,
    },

    // No map mode (By seller in shop configuration):
    noMap: {
      type: Boolean,
      default: false,
    },

    availableCountries: {
      type: Array,
    },
  },
  data() {
    return {
      map_box: null,
      map_id: Math.round(Math.random() * 999999),

      mode_bottom_card: "default", // search detail default

      /*
       * http://{s}.tile.osm.org/{z}/{x}/{y}.png
       * https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
       * 'https://s3.amazonaws.com/te512.safecast.org/{z}/{x}/{y}.png',
       */

      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      bounds: null,

      map: null,
      tileLayer: null,
      layers: [
        {
          id: 0,
          name: "markers",
          active: true,
          features: "",
        },
      ],

      current_zoom: 17,

      hide_top_bar: false,

      loading_address: false,

      // User location
      user_location: null,

      // Address Book
      address_book: null,
      dialog_add_to_address_book: false,
      new_address_title: null,
      selected_address_from_list: null,

      busy_update_book: false,
      busy_fetch: false,
      busy_save: false,

      // =========== Value Info ===========
      country: SetupService.DefaultCountry(),
      state: null,
      city: null,

      address: null,

      // Details form
      details_number: "",
      details_unit: "",
      details_full_name: "",
      details_message: "",

      postal: "",
      phone_number: "",

      last_selected_position: null,

      center_clicked: false,

      //---------------------------------
      current_markers: [],

      isFocus: false,
    };
  },
  watch: {
    modelValue(val) {
      if (val) this.center_clicked = false;
    },

    startupMode(mode) {
      if (mode) this.mode_bottom_card = mode;
    },

    center(center) {
      //console.log("watch center", center);
      if (!this.map_box) return;
      this.map_box.flyTo({ center: [center.lng, center.lat], zoom: this.zoom });
    },

    markerPosition(markerPosition) {
      this.addCurrentToDestinationList(markerPosition);
    },

    zoom(new_zoom) {
      this.current_zoom = new_zoom;
    },
    postal(val) {
      this.$emit("postalCode", val);
    },
    phone_number(val) {
      this.$emit("phoneNumber", val);
    },

    _location(val) {
      this.location = val;
    },

    // Address book
    selected_address_from_list(val) {
      if (!val) return;
      this.last_selected_position = val.location;
      this.country = val.country;
      this.state = val.state;
      this.city = val.city;

      this.address = val.address;
      this.postal = val.postal;
      this.phone_number = val.phone;

      this.details_number = val.no;
      this.details_unit = val.unit;
      this.details_full_name = val.name;
      this.details_message = val.message;

      this.mode_bottom_card = "default";

      this.centerUpdated(val.location);

      this.addCurrentToDestinationList(this.last_selected_position);
    },

    newAddressTitle(val) {
      this.new_address_title = val;
    },
  },

  computed: {
    //▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Validators ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂

    validPostalCode() {
      return (
        this.postal &&
        this.postal.match("\\b(?!(\\d)\\1{3})[13-9]{4}[1346-9][013-9]{5}\\b") &&
        true
      );
    },
    validPhoneNumber() {
      return this.phone_number && this.phone_number.length > 6;
    },

    canSaveAddress() {
      return this.address;
    },

    canSaveUpdate() {
      return this.address && this.selected_address_from_list;
    },

    //▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Country / State ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂
    countries() {
      return this.$store.getters.getCountries;
    },

    selected_country_detail() {
      return (
        this.country &&
        this.countries &&
        this.countries.find((v) => v.alpha2 === this.country)
      );
    },
    states() {
      // console.log('country',this.country)
      return (
        this.selected_country_detail &&
        this.selected_country_detail.states &&
        this.selected_country_detail.states.map((i) => i.name)
      );
    },

    state_label() {
      return this.states && this.states.length
        ? this.$t("global.address_info.state")
        : this.$t("global.address_info.county");
    },

    has_postcode() {
      return (
        !this.selected_country_detail || !this.selected_country_detail.nozip
      );
    },

    state_code() {
      // Insert state code here:
      if (!this.selected_country_detail?.states?.length) return null;

      const found = this.selected_country_detail?.states?.find(
        (i) => i.name === this.state,
      );
      if (found) {
        // console.log("State Code", found.code);
        return found.code;
      }
      return null;
    },
  },

  mounted() {
    if (!this.noMap)
      setTimeout(() => {
        this.$nextTick(() => {
          //   this.$refs.myMap.mapObject.ANY_LEAFLET_MAP_METHOD();

          this.map_box = new Mapbox.Map({
            container: "map_box" + this.map_id,
            style: SetupService.MapStyle(),
            center: [this.center.lng, this.center.lat],
            zoom: this.zoom,
          });

          if (this.showSearchBox) {
            // Add the control to the map.
            this.map_box.addControl(new MapboxGeocoder({}));
          }

          if (!this.hideLocationButtons) {
            // Add geolocate control to the map.

            this.locateControl = new Mapbox.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true,
              },
              trackUserLocation: false,
            });
            this.map_box.addControl(this.locateControl);

            // Add zoom and rotation controls to the map.
            if (this.$vuetify.display.mdAndUp) {
              this.map_box.addControl(new Mapbox.NavigationControl());

              this.map_box.addControl(new Mapbox.FullscreenControl());
            }
          }

          this.map_box.on("load", () => {
            if (this.markerPosition)
              this.addCurrentToDestinationList(this.markerPosition);
            else if (this.last_selected_position)
              this.addCurrentToDestinationList(this.last_selected_position);
          });
        });
      }, this.delayLoad);
  },

  created() {
    this.current_zoom = this.zoom;

    this.assignDataFromValue();

    if (this.startupMode) this.mode_bottom_card = this.startupMode;

    if (this.hasAddressBook) this.fetchAddressBook();

    this.new_address_title = this.newAddressTitle;

    // No map in shop configuration ➡ Force mode just in detail:
    if (this.noMap) {
      this.mode_bottom_card = "detail";
    }
  },

  methods: {
    onMapMouseDown($event) {
      //  console.log($event);
      this.hide_top_bar = true;
    },
    onMapMouseUp($event) {
      //   console.log($event);
      this.hide_top_bar = false;
    },

    zoomUpdated(zoom) {
      this.current_zoom = zoom;
      this.$emit("zoom", zoom);
    },
    centerUpdated(center) {
      this.$emit("update:center", center);
    },

    boundsUpdated(bounds) {
      // this.bounds = bounds;
    },

    getAddressStringOfCenter() {
      this.loading_address = true;
      this.address = null;
      //  this.last_selected_position = Object.assign({}, this.center);
      this.last_selected_position = this.map_box.getCenter();
      this.$emit("update:center", this.last_selected_position);
      // console.log("center", this.last_selected_position);

      this.$emit("location", this.last_selected_position);
      this.addCurrentToDestinationList(this.last_selected_position);
      this.mode_bottom_card = "default";

      axios
        .get(window.ADDRESS_API.GET_GEO_TO_ADDRESS(), {
          params: {
            lat: this.last_selected_position.lat,
            lon: this.last_selected_position.lng,
            local: this.getCurrentLanguage().locale, // For Auto select service!
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.country = data.country;

            this.address = data.address; //address_compact

            if (!this.details_number) this.details_number = data.no;

            if (!this.postal) this.postal = data.postal;
            this.city = data.city;
            this.state = data.state;
            if (
              data.state_code &&
              this.selected_country_detail?.states?.length
            ) {
              // Force to select state by state code: Maybe miss match state name with local

              const found = this.selected_country_detail.states.find(
                (i) => i.code === data.state_code,
              );
              if (found) this.state = found.name;
            }

            this.center_clicked = true; // TODO: Base on little feedbacks I disappear center pointer after first click!

            this.$emit("address", this.address);
          } else {
            this.showErrorAlert(null.data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.loading_address = false;
        });
    },

    addCurrentToDestinationList(selected_position) {
      if (this.noMap) return; // No map mode!
      // Add marker:
      this.current_markers.forEach((marker) => {
        marker.remove();
      });

      if (selected_position && selected_position.lng && selected_position.lat) {
        if (this.map_box) {
          const el = document.createElement("div");

          const app = createApp({
            render: () =>
              h(UMapViewPin, {
                pinImage: this.pinImage,
                pinIcon: this.pinIcon,
              }),
          });
          // Use Vuetify and i18n instances
          app.use(window.$global_vuetify);
          app.use(this.geti18n());
          installGlobalComponents(app);
          app.mount(el);

          const marker = new Mapbox.Marker(el)
            .setOffset([0, -32])
            .setLngLat([selected_position.lng, selected_position.lat])
            .addTo(this.map_box);

          this.current_markers.push(marker);
        }
      }
    },

    goToMyLocation() {
      navigator.geolocation.getCurrentPosition((location, error) => {
        if (error) {
          console.error("Get current location", error);
          return;
        }

        this.$emit("update:center", {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });

        this.current_zoom = 17;

        /** if (this.canSelectAddress) this.getAddressStringOfCenter(); // hanuz center update nashode! bayad ba delay ejra beshe in!

         if (this.showUserLocation) {
         this.user_location = Object.assign({}, {lat:location.coords.latitude,lng:location.coords.longitude});
         }*/
      });
    },

    clickSetLocation() {
      let out = {};
      out.country = this.country;
      out.state = this.state;
      out.state_code = this.state_code;
      out.city = this.city;

      out.address = this.address;
      out.location = this.last_selected_position;
      out.no = this.details_number;
      out.unit = this.details_unit;
      out.name = this.details_full_name;
      out.phone = this.phone_number;
      out.message = this.details_message;
      out.postal = this.postal;

      this.$emit("update:modelValue", out);
      this.$emit("clickSetLocation", out);
    },

    showDetails() {
      this.mode_bottom_card = "detail";
    },
    showDefault() {
      this.mode_bottom_card = "default";
    },

    onSelectAddress(item) {
      //  console.log("onSelectAddress", item);
      if (item.geometry && item.geometry.type === "Point") {
        const location_geo = {
          lat: item.geometry.coordinates[1],
          lng: item.geometry.coordinates[0],
        };

        this.address = item.address;
        this.centerUpdated(location_geo);
        this.last_selected_position = Object.assign({}, location_geo);
        this.$emit("address", this.address);

        // Set country:
        this.country = item.country;
        this.state = item.state;
        this.city = item.city;
        this.postal = item.postal;
      }
    },

    /*******************************************************************
     *                          Address book
     *******************************************************************/

    clickOnAddressItem(item) {
      this.selected_address_from_list = item;

      // Reset center:
      if (item.location) this.$emit("update:center", item.location);
    },

    setNewAddressName(address) {
      this.dialog_add_to_address_book = address;
    },

    saveCurrentPosition() {
      this.dialog_add_to_address_book = false;
      this.busy_save = true;

      axios
        .post(window.ADDRESS_API.POST_ADDRESS(), {
          title: this.new_address_title,

          country: this.country,
          state: this.state,
          state_code: this.state_code,
          city: this.city,

          address: this.address,
          location: this.last_selected_position,
          no: this.details_number,
          unit: this.details_unit,
          name: this.details_full_name,
          phone: this.phone_number,
          message: this.details_message,
          postal: this.postal,
        })
        .then((response) => {
          if (!response.data.error) {
            this.showSuccessAlert(
              null,
              this.$t("global.map_view.notifications.save_in_list"),
            );
            this.AddOrUpdateItemByID(this.address_book, response.data.address);
            this.selected_address_from_list = null;

            this.new_address_title = "";
          } else {
            this.showErrorAlert(null, response.data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    fetchAddressBook() {
      if (!this.USER()) return;

      this.busy_fetch = true;

      axios
        .get(window.ADDRESS_API.GET_MY_ADDRESSES())
        .then((response) => {
          if (!response.data.error) {
            this.address_book = response.data.addresses;
          } else {
            this.showErrorAlert(null, response.data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    deleteAddressBook(item) {
      this.openDangerAlert(
        this.$t("global.map_view.delete_address_dialog.title"),
        this.$t("global.map_view.delete_address_dialog.message"),
        this.$t("global.map_view.delete_address_dialog.action"),
        () => {
          this.selected_address_from_list = null;

          axios
            .delete(window.ADDRESS_API.DELETE_MY_ADDRESSES(item.id))
            .then((response) => {
              if (!response.data.error) {
                this.DeleteItemByID(this.address_book, response.data.id);
              } else {
                this.showErrorAlert(null, response.data.error_msg);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            });
        },
      );
    },

    updateAddressBook() {
      this.busy_update_book = true;
      axios
        .put(
          window.ADDRESS_API.PUT_ADDRESS(
            this.selectedAddressId
              ? this.selectedAddressId
              : this.selected_address_from_list.id,
          ),
          {
            title: this.selectedAddressTitle
              ? this.selectedAddressTitle
              : this.selected_address_from_list.title,

            country: this.country,
            state: this.state,
            state_code: this.state_code,
            city: this.city,
            address: this.address,
            location: this.last_selected_position,
            no: this.details_number,
            unit: this.details_unit,
            name: this.details_full_name,
            phone: this.phone_number,
            message: this.details_message,
            postal: this.postal,
          },
        )
        .then((response) => {
          if (!response.data.error) {
            this.UpdateItemByID(this.address_book, response.data.address);
            this.showSuccessAlert(
              null,
              this.$t("global.map_view.notifications.edit_success", {
                title: response.data.address.title,
              }),
            );
          } else {
            this.showErrorAlert(null, response.data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update_book = false;
        });
    },

    assignDataFromValue() {
      if (!this.modelValue) return;

      //console.log("assignDataFromValue  old:" + this.last_selected_position);
      this.location = this.modelValue.location;
      this.last_selected_position = this.modelValue.location;

      this.country = this.modelValue.country
        ? this.modelValue.country
        : SetupService.DefaultCountry();
      this.state = this.modelValue.state;
      this.city = this.modelValue.city;

      this.address = this.modelValue.address;
      this.postal = this.modelValue.postal;
      this.phone_number = this.modelValue.phone;

      this.details_number = this.modelValue.no;
      this.details_unit = this.modelValue.unit;
      this.details_full_name = this.modelValue.name;
      this.details_message = this.modelValue.message;

      //console.log("assignDataFromValue  new:" + this.last_selected_position);
    },

    forceUpdate() {
      this.$forceUpdate();
    },
  },
};
</script>
<style lang="scss">
.map-container {
}
</style>

<style lang="scss" scoped>
.map-container {
  display: block;
  position: relative;

  width: 100%;
  height: calc(100% - 140px);

  &.full {
    height: 100%;
  }

  .center-map-view {
    //pointer-events: none;
    cursor: pointer;
    z-index: 1000;
    position: absolute;
    left: 50%;
    margin-left: -32px;
    top: 50%;
    margin-top: -84px;

    transition: all 0.2s ease-in-out;

    // transform: scale(0.8, 0.8);
    transform-origin: center bottom;

    &.mini {
      transform: scale(0.6, 0.6);
      opacity: 0.9;
    }

    .label-icon {
      pointer-events: none;
      user-select: none;
      position: absolute;
      font-weight: 600;
      font-size: 10px;
      left: 50%;
      top: -10%;
      transform: translate(-50%, -80%);
      color: var(--theme-dark);
      margin-bottom: 0;
      background: rgba(255, 255, 255, 0.89);
      padding: 2px 6px;
      border-radius: 8px;
    }

    &:hover {
      transform: scale(1, 1);
      opacity: 1;
    }
  }
}

.bottom-card {
  &.-detail {
    // max-height: 100%;
    overflow: auto;
  }

  display: block;
  font-size: 0.92rem;

  font-weight: 500;

  padding: 4px 14px !important;

  min-height: 150px;
  background: #fff;
  z-index: 1000;
  position: absolute;
  width: 100%;
  bottom: 0;
  border-radius: 20px 20px 0 0;

  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;

  max-height: calc(100% - 120px);

  &.is-mobile {
    padding-bottom: 80px !important;
    max-height: calc(100% - 20px);
    max-width: calc(100% - 8px);

    transition: all 0.4s ease-in-out;

    &.is-full-h {
      min-height: calc(100% - 120px);
    }

    &.has-addresses {
      max-height: calc(
        100% - 130px
      ); // No map mode : Make sure show addresses list correctly!
    }

    > :last-child {
    }
  }

  .loading {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;

    margin: auto;
  }

  p {
    margin: 0 !important;
  }

  .mobile-toolbar {
    position: absolute;
    top: -70px;
    width: 90%;
    left: 5%;
  }
}

@media only screen and (min-width: 900px) {
  .map-container {
    height: 100%;
  }

  .bottom-card {
    max-width: 650px !important;
  }
}

@media only screen and (max-width: 900px) {
}
</style>

<style lang="scss">
.address-input {
  .v-input__slot {
    border-radius: 8px !important;
  }
}

.filed-input {
  .v-input__slot {
    border-radius: 8px !important;
  }
}

.address-book-chip {
  cursor: pointer;
  user-select: none;
}
</style>
