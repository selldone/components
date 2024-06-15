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
  <div :class="{ dark: dark }" class="overflow-x-auto">
    <v-row
      :style="{
        minWidth:
          (businessModel === 'normal'
            ? 3
            : businessModel === 'wholesaler'
              ? 4.5
              : 5.5) *
            110 +
          'px',
      }"
      class="align-center justify-start pa-9 flex-grow-0"
      no-gutters
    >
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Normal ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-if="businessModel === 'normal'">
        <u-pod-node
          :title="$t('global.commons.customers')"
          icon="people_outline"
          :iconColor="dark?'#fff':'#000'"
        >
        </u-pod-node>

        <div class="flex-grow-1">
          <div class="sph my-2">
            <span class="dot slow -reverse -add-offset">
              <v-icon :color="iconColor" class="center-absolute mt-n5"
                >paid</v-icon
              ></span
            >
          </div>

          <div class="sph my-2">
            <span class="dot slow -add-offset">
              <v-icon :color="iconColor" class="center-absolute mt-5"
                >local_mall</v-icon
              ></span
            >
          </div>
        </div>

        <u-pod-node :title="shop.title">
          <v-avatar class="avatar-gradient -thin -shop mb-1" size="24">
            <img :src="getShopImagePath(shop.icon, 96)" />
          </v-avatar>
        </u-pod-node>
      </template>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Wholesaler ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-else-if="businessModel === 'wholesaler'">
        <div>
          <u-pod-node
            class="my-1"
            icon="storefront"
            title="Store A"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
          <u-pod-node
            class="my-1"
            icon="storefront"
            title="Store B"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
        </div>

        <div class="flex-grow-1">
          <div class="sph mb-12">
            <span class="dot -reverse -add-offset">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
          <div class="sph mt-12">
            <span class="dot -reverse -add-offset">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
        </div>

        <u-pod-node :title="shop.title" large>
          <v-avatar class="avatar-gradient -thin -shop mb-1" size="44">
            <img :src="getShopImagePath(shop.icon, 96)" />
          </v-avatar>
        </u-pod-node>

        <div class="flex-grow-1 sph my-2">
          <span class="dot -reverse -add-offset" style="animation-delay: -1s">
            <v-icon :color="iconColor" class="center-absolute mt-5"
              >local_mall</v-icon
            ></span
          >
        </div>

        <u-pod-node
          :title="$t('global.commons.customers')"
          icon="people_outline"
          :iconColor="dark?'#fff':'#000'"
        >
        </u-pod-node>
      </template>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Marketplace ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-else-if="businessModel === 'marketplace'">
        <u-pod-node
          :title="$t('global.commons.customers')"
          icon="people_outline"
          :iconColor="dark?'#fff':'#000'"
        >
        </u-pod-node>

        <div class="sph my-2 flex-grow-1">
          <span class="dot -reverse -add-offset">
            <v-icon :color="iconColor" class="center-absolute mt-n5"
              >paid</v-icon
            ></span
          >
        </div>

        <u-pod-node :title="shop.title" large>
          <v-avatar class="avatar-gradient -thin -shop mb-1" size="44">
            <img :src="getShopImagePath(shop.icon, 96)" />
          </v-avatar>
        </u-pod-node>

        <div class="flex-grow-1">
          <div class="sph mb-12">
            <span class="dot -reverse -add-offset" style="animation-delay: -1s">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
          <div class="sph mt-12">
            <span class="dot -reverse -add-offset" style="animation-delay: -1s">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
        </div>

        <div>
          <u-pod-node
            class="my-1"
            icon="storefront"
            title="Vendor A"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>

          <u-pod-node
            class="my-1"
            icon="storefront"
            title="Vendor B"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
        </div>

        <div class="flex-grow-1">
          <div class="sph mb-10">
            <span
              class="dot -reverse -add-offset"
              style="animation-delay: -0.5s"
            >
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >local_mall</v-icon
              ></span
            >
          </div>
          <div class="sph mt-10">
            <span
              class="dot -reverse -add-offset"
              style="animation-delay: -0.5s"
            >
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >local_mall</v-icon
              ></span
            >
          </div>
        </div>

        <u-pod-node
          :title="$t('global.commons.customers')"
          icon="people_outline"
          :iconColor="dark?'#fff':'#000'"
        >
        </u-pod-node>
      </template>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Franchise ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-else-if="businessModel === 'franchise'">
        <div>
          <u-pod-node
            :title="$t('global.commons.customers')"
            class="my-1"
            icon="people_outline"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>

          <u-pod-node
            :title="$t('global.commons.customers')"
            class="my-1"
            icon="people_outline"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
        </div>

        <div class="flex-grow-1">
          <div class="sph mb-12">
            <span class="dot -reverse -add-offset">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >paidlocal_mall</v-icon
              ></span
            >
          </div>
          <div class="sph mt-12">
            <span class="dot -reverse -add-offset">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >paidlocal_mall</v-icon
              ></span
            >
          </div>
        </div>

        <div>
          <u-pod-node
            :title="$t('global.commons.affiliate')"
            class="my-1"
            icon="storefront"
            title-icon="looks_one"
            :iconColor="dark?'#fff':'#000'"
          >
          </u-pod-node>
          <u-pod-node
            :title="$t('global.commons.affiliate')"
            class="my-1"
            icon="storefront"
            title-icon="looks_two"
            :iconColor="dark?'#fff':'#000'"
          >
          </u-pod-node>
        </div>

        <div class="flex-grow-1">
          <div class="sph mb-12">
            <span class="dot -reverse -add-offset" style="animation-delay: -1s">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
          <div class="sph mt-12">
            <span class="dot -reverse -add-offset" style="animation-delay: -1s">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >paidfact_check</v-icon
              ></span
            >
          </div>
        </div>

        <u-pod-node :title="shop.title" large>
          <v-avatar class="avatar-gradient -thin -shop mb-1" size="44">
            <img :src="getShopImagePath(shop.icon, 96)" />
          </v-avatar>
        </u-pod-node>

        <div class="flex-grow-1">
          <div class="sph mb-12">
            <span
              class="dot -reverse -add-offset"
              style="animation-delay: -0.3s"
            >
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >local_mall</v-icon
              ></span
            >
          </div>
          <div class="sph mt-12">
            <span
              class="dot -reverse -add-offset"
              style="animation-delay: -0.3s"
            >
              <v-icon
                :color="iconColor"
                class="center-absolute mt-5"
                size="small"
                >local_mall</v-icon
              ></span
            >
          </div>
        </div>

        <div>
          <u-pod-node
            :title="$t('global.commons.customers')"
            class="my-1"
            icon="people_outline"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
          <u-pod-node
            :title="$t('global.commons.customers')"
            class="my-1"
            icon="people_outline"
            :iconColor="dark?'#fff':'#000'"
          ></u-pod-node>
        </div>
      </template>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Dropshipping (Connect OS) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-else-if="businessModel === 'dropshipping'">
        <u-pod-node
          :title="$t('global.commons.customers')"
          icon="people_outline"
          :iconColor="dark?'#fff':'#000'"
        >
        </u-pod-node>

        <div class="flex-grow-1">
          <div class="sph">
            <span class="dot -reverse -add-offset">
              <v-icon
                :color="iconColor"
                class="center-absolute mt-n5"
                size="small"
                >paidlocal_mall</v-icon
              ></span
            >
          </div>
        </div>

        <u-pod-node :title="shop.title" large>
          <v-avatar class="avatar-gradient -thin -shop mb-1" size="44">
            <img :src="getShopImagePath(shop.icon, 96)" />
          </v-avatar>
        </u-pod-node>

        <div class="flex-grow-1">
          <div class="mb-12">
            <div class="sph">
              <span class="center-absolute mt-n5 small text-center">
                <v-icon
                  :color="iconColor"
                  class="fa-spin fa-spin-reverse"
                  size="small"
                  >sync</v-icon
                >

                <div class="hide-on-small-900 single-line">
                  Connect <span class="text-gradient bg-desert-hump">OS</span>
                </div>
              </span>
            </div>

            <div class="sph mt-2">
              <span
                class="dot -reverse -add-offset"
                style="animation-delay: -1s"
              >
                <v-icon
                  :color="iconColor"
                  class="center-absolute mt-5"
                  size="small"
                  >fact_check</v-icon
                ></span
              >
            </div>
          </div>

          <div class="mt-12">
            <div class="sph">
              <span class="center-absolute mt-n5 small text-center">
                <v-icon
                  :color="iconColor"
                  class="fa-spin fa-spin-reverse"
                  size="small"
                  >sync</v-icon
                >

                <div class="hide-on-small-900 single-line">
                  Connect <span class="text-gradient bg-desert-hump">OS</span>
                </div>
              </span>
            </div>

            <div class="sph mt-2">
              <span
                class="dot -reverse -add-offset"
                style="animation-delay: -1s"
              >
                <v-icon
                  :color="iconColor"
                  class="center-absolute mt-5"
                  size="small"
                  >fact_check</v-icon
                ></span
              >
            </div>
          </div>
        </div>

        <div class="flex-grow-1">
          <div class="d-flex align-center">
            <u-pod-node class="my-1" title="Bridge" title-icon="looks_one">
              <v-img
                :src="require('../../assets/trademark/printful.svg')"
                height="24"
                width="100%"
              ></v-img>
            </u-pod-node>

            <div class="sph">
              <span
                class="dot -reverse -add-offset"
                style="animation-delay: -0.3s"
              >
                <v-icon
                  :color="iconColor"
                  class="center-absolute mt-n5"
                  size="small"
                  >local_mall</v-icon
                ></span
              >
            </div>

            <u-pod-node
              :title="$t('global.commons.customers')"
              class="my-1"
              icon="people_outline"
              :iconColor="dark?'#fff':'#000'"
            >
            </u-pod-node>
          </div>

          <div class="d-flex align-center">
            <u-pod-node title="Bridge" title-icon="looks_two">
              <v-img
                :src="require('../../assets/trademark/doba.svg')"
                height="24"
                width="100%"
              ></v-img>
            </u-pod-node>

            <div class="sph">
              <span
                class="dot -reverse -add-offset"
                style="animation-delay: -0.3s"
              >
                <v-icon
                  :color="iconColor"
                  class="center-absolute mt-n5"
                  size="small"
                  >local_mall</v-icon
                ></span
              >
            </div>

            <u-pod-node
              :title="$t('global.commons.customers')"
              class="my-1"
              icon="people_outline"
              :iconColor="dark?'#fff':'#000'"
            ></u-pod-node>
          </div>
        </div>
      </template>
    </v-row>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Guide ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-row class="m-0 mx-2 text-muted small flex-grow-0" dense>
      <v-col cols="6 fadeIn">
        <v-icon class="me-1" size="small">local_mall</v-icon>
        Customer order
      </v-col>
      <v-col class="fadeIn" cols="6">
        <v-icon class="me-1" size="small">paid</v-icon>
        Payment
      </v-col>

      <v-col v-if="businessModel === 'wholesaler'" class="fadeIn" cols="6">
        <v-icon class="me-1" size="small">storefront</v-icon>
        Reseller (Independent stores on Selldone)
      </v-col>

      <v-col v-if="businessModel === 'marketplace'" class="fadeIn" cols="6">
        <v-icon class="me-1" size="small">storefront</v-icon>
        Vendors (Sub stores)
      </v-col>

      <v-col v-if="businessModel === 'franchise'" class="fadeIn" cols="6">
        <v-icon class="me-1" size="small">storefront</v-icon>
        Affiliate (+ Custom domain)
      </v-col>

      <v-col v-if="businessModel === 'dropshipping'" class="fadeIn" cols="6">
        <v-icon class="me-1" size="small">sync</v-icon>
        Sync inventory / orders
      </v-col>

      <v-col
        v-if="
          ['wholesaler', 'marketplace', 'franchise', 'dropshipping'].includes(
            businessModel,
          )
        "
        class="fadeIn"
        cols="6"
      >
        <v-icon class="me-1" size="small">fact_check</v-icon>
        Fulfillment order
      </v-col>
    </v-row>
  </div>
</template>

<script>
import UPodNode from "../../ui/pod/node/UPodNode.vue";

export default {
  name: "BusinessModelView",
  components: { UPodNode },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    businessModel: {
      default: "normal",
    },
    dark: {
      default: false,
      type: Boolean,
    },
    iconColor: { default: "primary" },
  },

  data: () => ({}),

  computed: {},

  created() {},
  methods: {},
};
</script>

<style scoped></style>
