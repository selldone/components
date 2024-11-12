<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
    class="widget widget-hover pointer-pointer min-h-100"
    @click="
      $router.push({
        name: 'BPageTransportationServiceDashboard',
        params: { service_id: service.id },
      })
    "
  >
    <div class="absolute-top-end">
      <v-btn
        :caption="$t('global.actions.edit')"
        :to="{
          name: 'BPageTransportationServiceEdit',
          params: { service_id: service.id },
        }"
        class="sub-caption -hover"
        icon
        variant="text"
        @click.stop
      >
        <v-icon size="small">edit_square</v-icon>
      </v-btn>
    </div>

    <div class="absolute-top-start">
      <u-check :model-value="service.enable" class="m-2"></u-check>
      <!--
    <v-switch
      inset
      color="success"
      dense
      v-model="service.enable"
      hide-details
      @change="setEnable(service, service.enable)"
      :loading="busy_enable === service.id"
    ></v-switch>
    {{
      service.enable && service.delivery_service.enable
        ? $t("global.commons.enable")
        : $t("global.commons.disable")
    }}-->
    </div>

    <v-avatar :size="60" class="mb-2 mx-auto" tile>
      <v-img :src="getShopImagePath(service.delivery_service.icon)" />
    </v-avatar>

    <p class="m-0 font-weight-bold">
      {{ service.delivery_service.name }}
    </p>
    <p class="small mb-3">
      {{ service.delivery_service.description }}
    </p>
    <v-row class="text-center" dense>
      <v-col cols="4">
        <small>{{ $t("global.sort.distance") }}:</small>
        <br />{{ numeralFormat(service.distance, "0,0.[0]") }} Km
        <div>
          <b v-if="service.success + service.fail" class="text-success"
            >({{
              numeralFormat(
                service.distance / (service.success + service.fail),
                "0,0.[0]",
              )
            }}) Km</b
          >
        </div>
      </v-col>

      <v-col cols="4">
        <small>{{ $t("global.sort.duration") }}: </small>
        <br />{{ numeralFormat(service.duration, "0,0.[0]") }} h
        <div>
          <b v-if="service.success + service.fail" class="text-success"
            >({{
              numeralFormat(
                service.duration / (service.success + service.fail),
                "0,0.[0]",
              )
            }}) {{ $t("global.commons.hours") }}</b
          >
        </div>
      </v-col>

      <v-col :title="getLocalTimeString(service.reset_at)" cols="4">
        <small>{{ $t("global.sort.reset_at") }}:</small>
        <br />{{ getFromNowString(service.reset_at) }}
        <div>
          <v-btn
            :caption="$t('global.actions.reset')"
            :loading="busy_reset === service.id"
            class="m-1 sub-caption -hover"
            icon
            size="small"
            variant="text"
            @click.stop="resetService(service)"
          >
            <v-icon>refresh</v-icon>
          </v-btn>
        </div>
      </v-col>

      <v-col cols="4">
        <small>{{ $t("global.sort.jobs") }}:</small>
        <br />{{ numeralFormat(service.jobs, "0,0.[0]") }}
      </v-col>
      <v-col cols="4">
        <small>{{ $t("global.sort.success") }}:</small>
        <br />{{ numeralFormat(service.success, "0,0.[0]") }}
        <div>
          <u-chart-radial-bar
            :colors="['#8BC34A']"
            :height="80"
            :labels="[$t('add_product.completed')]"
            :series="[(100 * service.success) / service.jobs]"
            :to-colors="['#388E3C']"
            class=""
            small
          >
          </u-chart-radial-bar>
        </div>
      </v-col>
      <v-col cols="4">
        <small>{{ $t("global.sort.fail") }}:</small>
        <br />{{ numeralFormat(service.fail, "0,0.[0]") }}

        <div>
          <u-chart-radial-bar
            :colors="['#E91E63']"
            :height="80"
            :labels="[$t('add_product.completed')]"
            :series="[(100 * service.fail) / service.jobs]"
            :to-colors="['#D32F2F']"
            class=""
            small
          >
          </u-chart-radial-bar>
        </div>
      </v-col>
    </v-row>

    <hr />
    <div class="d-flex">
      <p class="w-50">
        {{ $t("global.commons.token") }}:
        <u-check :model-value="!!service.token"></u-check>
      </p>
      <p class="w-50">
        {{ $t("global.commons.status") }}:
        <b :class="service.livemode ? 'text-success' : 'text-warning'">{{
          service.livemode
            ? $t("global.commons.livemode")
            : $t("global.commons.debug")
        }}</b>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UChartRadialBar from "../../../../ui/chart/radial/bar/UChartRadialBar.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default defineComponent({
  name: "BTransportationServiceCard",
  mixins: [DateMixin],
  components: { UChartRadialBar },
  props: {
    service: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      busy_reset: null,
      busy_enable: null,
    };
  },

  methods: {
    //――――――――――――――――――――――― Transportation > Service > Reset ―――――――――――――――――――――――

    resetService(service) {
      this.openDangerAlert(
        this.$t("transportation_services.reset.title"),
        this.$t("transportation_services.reset.message"),
        this.$t("transportation_services.reset.action"),
        () => {
          this.busy_reset = service.id;
          axios
            .post(
              window.API.POST_TRANSPORTATION_SERVICE_RESET(
                this.$route.params.shop_id,
                this.transportation.id,
                service.id,
              ),
            )
            .then(({ data }) => {
              if (data.error) {
                this.showErrorAlert(null, data.error_msg);
              } else {
                this.AddOrUpdateItemByID(this.services, data.service);
                this.showSuccessAlert(
                  null,
                  this.$t(
                    "transportation_services.notifications.success_reset",
                  ),
                );
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {
              this.busy_reset = null;
            });
        },
      );
    },

    //――――――――――――――――――――――― Transportation > Service > Edit ―――――――――――――――――――――――
    /*
    setEnable(service, enable) {
      this.busy_enable = service.id;
      axios
        .put(
          window.API.PUT_TRANSPORTATION_SERVICE_UPDATE(
            this.$route.params.shop_id,
            this.transportation.id,
            service.id
          ),
          {
            enable: enable,
          }
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.AddOrUpdateItemByID(this.service, data.service);
            this.showSuccessAlert(
              null,
              this.$t("transportation_services.notifications.success_update")
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_enable = null;
        });
    },*/
  },
});
</script>

<style lang="scss" scoped></style>
