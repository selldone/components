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
  <component
    :is="modern ? 'details' : 'div'"
    :open="modern ? true : undefined"
    :class="modern ? 'b-product-edit-features__panel sd-modern-widget sd-modern-disclosure b-product-rating-input--modern text-start' : 'widget-box'"
  >
    <summary v-if="modern" class="sd-modern-disclosure__summary b-product-edit-features__summary">
      <b-product-edit-info-icon name="ClipboardCheck" :size="18" />
      <span class="sd-modern-disclosure__copy b-product-edit-features__summary-copy">
        <span class="b-product-edit-features__summary-title">{{ $t('add_product.features_modern.survey_title') }}</span>
        <span class="b-product-edit-features__digest">{{ ratingDigest }}</span>
      </span>
      <span class="b-product-edit-features__count">{{ ratingFields.length }} / 5</span>
      <b-product-edit-info-icon name="ChevronDown" :size="16" class="sd-modern-disclosure__chevron b-product-edit-features__chevron" />
    </summary>
    <div :class="{ 'b-product-edit-features__panel-content': modern }">
    <template v-if="!modern">
    <u-widget-header
      :title="$t('add_product.rating_pros_cons.title')"
      icon="ballot"
    ></u-widget-header>
    <v-list-subheader
      >{{ $t("add_product.rating_pros_cons.message") }}
    </v-list-subheader>
    </template>
    <div v-else class="b-product-edit-features__intro">
      <p>{{ $t('add_product.features_modern.survey_intro') }}</p>
      <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('add_product.features_modern.customer_average')">
        <b-product-edit-info-icon name="Info" :size="16" />
        <v-tooltip activator="parent" :text="$t('add_product.features_modern.average_help')" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true" :open-on-click="true" :persistent="false" />
      </v-btn>
    </div>
    <div v-if="modern && ratingFields.length" class="b-product-rating-input__caption sd-modern-list-header">
      <span>{{ $t('add_product.features_modern.criterion') }}</span>
      <span>{{ $t('add_product.features_modern.customer_average') }}</span>
      <span></span>
    </div>

    <div :class="modern ? 'b-product-rating-input__rows' : 'border-between-vertical my-3'">
      <div
        v-for="item in ratingFields"
        :key="item.id"
        :class="modern ? 'b-product-rating-input__row' : 'px-2 d-flex align-center'"
      >
        <span v-if="modern" class="b-product-rating-input__name">{{ item.name }}</span>
        <strong v-else>{{ item.name }}</strong>
        <v-spacer v-if="!modern"></v-spacer>
        <span v-if="modern" class="b-product-rating-input__average">
          <template v-if="ratingAverage(item) !== null">
            <v-rating :model-value="ratingAverage(item)" color="grey" active-color="amber-darken-2" density="compact" half-increments readonly inert aria-hidden="true" :size="14" />
            <span :aria-label="$t('add_product.features_modern.customer_average') + ': ' + ratingAverage(item).toFixed(1) + ' / 5'">{{ ratingAverage(item).toFixed(1) }}</span>
          </template>
          <span v-else class="b-product-rating-input__empty">{{ $t('add_product.features_modern.no_ratings') }}</span>
        </span>
        <v-rating
          v-else
          :model-value="item.value / item.count"
          active-color="yellow-accent-4"
          class="ms-2"
          color="#999"
          density="compact"
          half-increments
          readonly
          size="small"

        ></v-rating>

        <v-btn
          :loading="busy_delete_rating === item"
          :title="modern ? undefined : $t('global.actions.delete')"
          :aria-label="modern ? $t('global.actions.delete') + ' · ' + item.name : undefined"
          :class="modern ? 'sd-modern-icon-button' : 'ms-2'"
          :color="modern ? undefined : 'red'"
          :disabled="modernReadOnly"
          icon
          variant="text"
          @click="deleteRatingField(item)"
        >
          <b-product-edit-info-icon v-if="modern" name="Trash2" :size="16" />
          <v-icon v-else>close</v-icon>
          <v-tooltip v-if="modern" activator="parent" :text="$t('global.actions.delete') + ' · ' + item.name" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true" :persistent="false" />
        </v-btn>
      </div>
    </div>

    <div :class="{ 'b-product-rating-input__add': modern }">
    <v-combobox
      v-model="new_rating"
      :disabled="ratingFields.length >= 5 || modernReadOnly"
      :items="items_select_rating"
      :label="$t(modern ? 'add_product.features_modern.add_criterion' : 'add_product.rating_pros_cons.rating_input')"
      :messages="modern ? undefined : $t('add_product.rating_pros_cons.rating_input_message')"
      :placeholder="$t('add_product.rating_pros_cons.rating_input_placeholder')"
      :class="modern ? 'sd-modern-underlined-field' : 'mb-3'"
      :hide-details="modern ? 'auto' : undefined"
      item-title="name"
      item-value="id"
      variant="underlined"
      @keydown.enter="addRatingField(new_rating)"
    >
      <template v-slot:append-inner>
        <v-slide-y-reverse-transition v-if="!modern">
          <v-btn
            v-if="product.ratings.length < 5 && new_rating"
            :loading="busy_rating"
            @click="addRatingField(new_rating)"
            prepend-icon="add"
            size="small"
          >
            {{ $t("global.actions.add") }}
          </v-btn>
        </v-slide-y-reverse-transition>
      </template>
    </v-combobox>
    <v-btn v-if="modern" class="sd-modern-button" variant="outlined" :loading="busy_rating" :disabled="modernReadOnly || ratingFields.length >= 5 || !new_rating" @click="addRatingField(new_rating)">
      <template #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>
      {{ $t('global.actions.add') }}
    </v-btn>
    </div>
    <p v-if="modern" class="b-product-rating-input__help">{{ ratingFields.length >= 5 ? $t('add_product.features_modern.survey_limit') : $t('add_product.features_modern.remaining', { count: 5 - ratingFields.length }) }}</p>
    </div>
  </component>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default defineComponent({
  name: "BProductRatingInput",
  components: { BProductEditInfoIcon },
  mixins:[],
  props: {
    modern: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    product: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    new_rating: null,
    busy_delete_rating: null,
    busy_rating: false,
    rating_name: "",
  }),

  computed: {
    modernReadOnly() {
      return this.modern && this.readOnly;
    },
    ratingFields() {
      return this.product.ratings || [];
    },
    ratingDigest() {
      const names = this.ratingFields.slice(0, 2).map((item) => item.name).join(' · ');
      if (!names) return this.$t('add_product.features_modern.empty');
      return this.ratingFields.length > 2
        ? this.$t('add_product.features_modern.digest_more', { names, count: this.ratingFields.length - 2 })
        : names;
    },
    items_select_rating() {
      return this.$tm("add_product.rating_pros_cons.suggestion_rating").filter(
        (item) => {
          return (
            !this.product.ratings ||
            !this.product.ratings.some((s) => s.name === item)
          );
        },
      );
    },
  },

  methods: {
    ratingAverage(item) {
      return item.count > 0 ? item.value / item.count : null;
    },
    deleteRatingField(rating) {
      if (this.modernReadOnly) return;
      this.busy_delete_rating = rating;

      axios
        .delete(
          this.IS_VENDOR_PANEL
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_RATING(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.DELETE_PRODUCT_RATING(
                this.product.shop_id,
                this.product.id,
              ),
          {
            params: {
              id: rating.id,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "add_product.rating_pros_cons.notifications.delete_rating_success",
                { rating_name: rating.name },
              ),
            );
            this.DeleteItemByID(this.product.ratings, data.id);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
          this.$forceUpdate(); // Update vue component!
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete_rating = null;
        });
    },

    addRatingField(new_rating) {
      if (this.modern && (this.modernReadOnly || this.busy_rating || this.ratingFields.length >= 5)) return;
      let rating_name = new_rating;
      // console.log("new_item", rating_name);
      if (!rating_name) return;

      this.busy_rating = true;

      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_ADD_PRODUCT_RATING(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_ADD_PRODUCT_RATING(
                this.product.shop_id,
                this.product.id,
              ),
          {
            name: rating_name,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "add_product.rating_pros_cons.notifications.add_rating_success",
                { rating_name: rating_name },
              ),
            );
            if (!this.product.ratings) this.product.ratings = [];

            this.AddOrUpdateItemByID(this.product.ratings, data.rating);

            this.new_rating = null;
            //this.rating_name = "";
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
          this.$forceUpdate(); // Update vue component!
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_rating = false;

          let foundIndex = this.product.ratings.findIndex(
            (element) => element === rating_name,
          );
          if (foundIndex >= 0) this.product.ratings.splice(foundIndex, 1);
        });
    },
  },
});
</script>

<style lang="scss" scoped>
.b-product-rating-input--modern {
  .b-product-edit-features__intro { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .b-product-edit-features__intro > p { flex: 1; min-width: 0; margin: 0; }
  .b-product-rating-input__caption,
  .b-product-rating-input__row { display: grid; grid-template-columns: minmax(0, 1fr) 152px 32px; align-items: center; gap: 12px; }
  .b-product-rating-input__caption { padding: 0 10px 4px; }
  .b-product-rating-input__caption > span:nth-child(2) { text-align: end; }
  .b-product-rating-input__row { min-height: 58px; padding: 10px; }
  .b-product-rating-input__row + .b-product-rating-input__row { border-block-start: 1px solid var(--sd-modern-border); }
  .b-product-rating-input__name { min-width: 0; font-size: 13px; line-height: 20px; overflow-wrap: anywhere; unicode-bidi: plaintext; }
  .b-product-rating-input__average { display: flex; align-items: center; justify-content: flex-end; gap: 8px; font-size: 12px; line-height: 18px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .b-product-rating-input__average :deep(.v-rating) { flex-shrink: 0; }
  .b-product-rating-input__empty { color: var(--sd-modern-muted); }
  .b-product-rating-input__add { display: flex; align-items: center; gap: 13px; margin-block-start: 16px; }
  .b-product-rating-input__add > .v-input { flex: 1; min-width: 0; }
  .b-product-rating-input__add > .v-btn { flex-shrink: 0; }
  .b-product-rating-input__help { margin: 8px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  @media (max-width: 800px) {
    .b-product-rating-input__caption,
    .b-product-rating-input__row { grid-template-columns: minmax(0, 1fr) 113px 32px; gap: 8px; }
    .b-product-rating-input__average { gap: 5px; }
  }
  @media (max-width: 660px) {
    .b-product-rating-input__caption { display: none; }
    .b-product-rating-input__row { grid-template-columns: minmax(0, 1fr) 44px; gap: 6px 10px; padding-block: 12px; }
    .b-product-rating-input__name { grid-column: 1; grid-row: 1; }
    .b-product-rating-input__average { grid-column: 1; grid-row: 2; justify-content: flex-start; }
    .b-product-rating-input__row > .v-btn { grid-column: 2; grid-row: 1 / 3; }
  }
  @media (min-width: 661px) and (max-width: 680px) {
    .b-product-rating-input__caption,
    .b-product-rating-input__row { grid-template-columns: minmax(0, 1fr) 113px 44px; }
  }
  @media (pointer: coarse) and (min-width: 801px) {
    .b-product-rating-input__caption,
    .b-product-rating-input__row { grid-template-columns: minmax(0, 1fr) 152px 44px; }
  }
  @media (pointer: coarse) and (min-width: 661px) and (max-width: 800px) {
    .b-product-rating-input__caption,
    .b-product-rating-input__row { grid-template-columns: minmax(0, 1fr) 113px 44px; }
  }
}
</style>
