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
  <div class="widget widget-hover min-h-100">
    <v-btn
      :caption="$t('global.actions.delete')"
      :loading="busy_delete === courier.id"
      class="absolute-top-end sub-caption -hover"
      color="red"
      icon
      variant="text"
      @click="deletePerson(courier)"
    >
      <v-icon>close</v-icon>
    </v-btn>

    <div class="absolute-top-start">
      <u-smart-toggle
        v-model="courier.enable"
        :false-title="$t('global.commons.disable')"
        :loading="busy_enable === courier.id"
        :true-title="$t('global.commons.enable')"
        color="success"
        @change="setEnable(courier, courier.enable)"
      ></u-smart-toggle>
    </div>

    <v-avatar :size="60" class="mb-2 mx-auto avatar-gradient -thin -role">
      <v-img :src="getUserAvatar(courier.user_id)" />
    </v-avatar>

    <div class="text-center">
      <p class="m-0">
        <b>{{ courier.user.name }}</b>
      </p>
      <p class="small mb-3">
        {{ courier.user.email }}
      </p>
    </div>
    <v-row class="text-center" dense>
      <v-col cols="4">
        <small>{{ $t("global.sort.distance") }}:</small>
        <br />{{ numeralFormat(courier.distance, "0,0.[0]") }} Km
        <div>
          <b v-if="courier.success + courier.fail" class="text-success"
            >({{
              numeralFormat(
                courier.distance / (courier.success + courier.fail),
                "0,0.[0]",
              )
            }}) Km</b
          >
        </div>
      </v-col>

      <v-col cols="4">
        <small>{{ $t("global.sort.duration") }}: </small>
        <br />{{ numeralFormat(courier.duration, "0,0.[0]") }} h
        <div>
          <b v-if="courier.success + courier.fail" class="text-success"
            >({{
              numeralFormat(
                courier.duration / (courier.success + courier.fail),
                "0,0.[0]",
              )
            }}) {{ $t("global.commons.hours") }}</b
          >
        </div>
      </v-col>

      <v-col :title="getLocalTimeString(courier.reset_at)" cols="4">
        <small>{{ $t("global.sort.reset_at") }}:</small>
        <br />{{ getFromNowString(courier.reset_at) }}
        <div>
          <v-btn
            :caption="$t('global.actions.reset')"
            :loading="busy_reset === courier.id"
            class="m-1 sub-caption -hover"
            icon
            size="small"
            variant="text"
            @click="resetPerson(courier)"
          >
            <v-icon>refresh</v-icon>
          </v-btn>
        </div>
      </v-col>

      <v-col cols="4">
        <small>{{ $t("global.sort.jobs") }}:</small>
        <br />{{ numeralFormat(courier.jobs, "0,0.[0]") }}
      </v-col>
      <v-col cols="4">
        <small>{{ $t("global.sort.success") }}:</small>
        <br />{{ numeralFormat(courier.success, "0,0.[0]") }}
        <div>
          <u-chart-radial-bar
            :colors="['#8BC34A']"
            :height="80"
            :labels="[$t('add_product.completed')]"
            :series="[(100 * courier.success) / courier.jobs]"
            :to-colors="['#388E3C']"
            class=""
            small
          >
          </u-chart-radial-bar>
        </div>
      </v-col>
      <v-col cols="4">
        <small>{{ $t("global.sort.fail") }}:</small>
        <br />{{ numeralFormat(courier.fail, "0,0.[0]") }}

        <div>
          <u-chart-radial-bar
            :colors="['#E91E63']"
            :height="80"
            :labels="[$t('add_product.completed')]"
            :series="[(100 * courier.fail) / courier.jobs]"
            :to-colors="['#D32F2F']"
            class=""
            small
          >
          </u-chart-radial-bar>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import UChartRadialBar from "../../../../ui/chart/radial/bar/UChartRadialBar.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";

export default defineComponent({
  name: "BTransportationCourierCard",
  components: { USmartToggle, UChartRadialBar },
  props: {
    courier: {
      require: true,
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
    //――――――――――――――――――――――― Transportation > Person > Edit ―――――――――――――――――――――――

    setEnable(person, enable) {
      this.busy_enable = person.id;
      axios
        .put(
          window.API.PUT_TRANSPORTATION_PERSON_UPDATE(
            this.$route.params.shop_id,
            this.transportation.id,
            person.id,
          ),
          {
            enable: enable,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.AddOrUpdateItemByID(this.persons, data.person);
            this.showSuccessAlert(
              null,
              this.$t("transportation_persons.notifications.success_update"),
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_enable = null;
        });
    },

    //――――――――――――――――――――――― Transportation > Person > Reset ―――――――――――――――――――――――

    deletePerson(person) {
      this.openDangerAlert(
        this.$t("transportation_persons.remove.title"),
        this.$t("transportation_persons.remove.message"),
        this.$t("transportation_persons.remove.action"),
        () => {
          this.busy_delete = person.id;
          axios
            .delete(
              window.API.DELETE_TRANSPORTATION_PERSON(
                this.$route.params.shop_id,
                this.transportation.id,
                person.id,
              ),
            )
            .then(({ data }) => {
              if (data.error) {
                this.showErrorAlert(null, data.error_msg);
              } else {
                this.DeleteItemByID(this.persons, data.id);
                this.showSuccessAlert(
                  null,
                  this.$t(
                    "transportation_persons.notifications.success_remove",
                  ),
                );
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = null;
            });
        },
      );
    },

    //――――――――――――――――――――――― Transportation > Person > Reset ―――――――――――――――――――――――

    resetPerson(person) {
      this.openDangerAlert(
        this.$t("transportation_persons.reset.title"),
        this.$t("transportation_persons.reset.message"),
        this.$t("transportation_persons.reset.action"),
        () => {
          this.busy_reset = person.id;
          axios
            .post(
              window.API.POST_TRANSPORTATION_PERSON_RESET(
                this.$route.params.shop_id,
                this.transportation.id,
                person.id,
              ),
            )
            .then(({ data }) => {
              if (data.error) {
                this.showErrorAlert(null, data.error_msg);
              } else {
                this.AddOrUpdateItemByID(this.persons, data.person);
                this.showSuccessAlert(
                  null,
                  this.$t("transportation_persons.notifications.success_reset"),
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
  },
});
</script>

<style lang="scss" scoped></style>
