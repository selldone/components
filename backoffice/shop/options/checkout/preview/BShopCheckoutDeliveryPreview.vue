<template>
  <figure class="b-checkout-delivery-preview text-start">
    <figcaption class="b-checkout-delivery-preview__caption">
      <h3>{{ $t("shop_configuration.flow_modern.checkout.preview.title") }}</h3>
      <p role="status">{{ $t(descriptionKey) }}</p>
    </figcaption>

    <div class="b-checkout-delivery-preview__window">
      <div class="b-checkout-delivery-preview__header">
        <v-icon icon="local_shipping" size="16" aria-hidden="true" />
        <span>{{
          $t("shop_configuration.flow_modern.checkout.preview.delivery")
        }}</span>
      </div>

      <div v-if="shipping === 'off'" class="b-checkout-delivery-preview__skip">
        <v-icon icon="location_off" size="20" aria-hidden="true" />
        <span>{{
          $t("shop_configuration.flow_modern.checkout.preview.no_address")
        }}</span>
      </div>

      <template v-else>
        <div v-if="map" class="b-checkout-delivery-preview__map-layout">
          <div class="b-checkout-delivery-preview__map" aria-hidden="true">
            <span class="b-checkout-delivery-preview__road" />
            <span
              class="b-checkout-delivery-preview__road b-checkout-delivery-preview__road--cross"
            />
            <v-icon
              class="b-checkout-delivery-preview__pin"
              icon="location_on"
              size="28"
            />
          </div>
          <div class="b-checkout-delivery-preview__autofill">
            <strong>{{
              $t("shop_configuration.flow_modern.checkout.preview.address")
            }}</strong>
            <span>{{
              $t("shop_configuration.flow_modern.checkout.preview.autofill")
            }}</span>
            <div class="b-checkout-delivery-preview__line" aria-hidden="true" />
            <div
              class="b-checkout-delivery-preview__line b-checkout-delivery-preview__line--short"
              aria-hidden="true"
            />
          </div>
        </div>

        <div v-else class="b-checkout-delivery-preview__fields">
          <div
            class="b-checkout-delivery-preview__field b-checkout-delivery-preview__field--wide"
          >
            <span>{{
              $t("shop_configuration.flow_modern.checkout.preview.street")
            }}</span>
            <div class="b-checkout-delivery-preview__line" aria-hidden="true" />
          </div>
          <div class="b-checkout-delivery-preview__field">
            <span>{{
              $t("shop_configuration.flow_modern.checkout.preview.city")
            }}</span>
            <div class="b-checkout-delivery-preview__line" aria-hidden="true" />
          </div>
          <div class="b-checkout-delivery-preview__field">
            <span>{{
              $t("shop_configuration.flow_modern.checkout.preview.postcode")
            }}</span>
            <div class="b-checkout-delivery-preview__line" aria-hidden="true" />
          </div>
        </div>
        <p class="b-checkout-delivery-preview__scope">
          {{
            $t(
              shipping === "physical"
                ? "shop_configuration.flow_modern.checkout.preview.physical_only"
                : "shop_configuration.flow_modern.checkout.preview.physical_and_service",
            )
          }}
        </p>
      </template>

      <div class="b-checkout-delivery-preview__payment">
        <v-icon icon="payments" size="16" aria-hidden="true" />
        <span>{{
          $t("shop_configuration.flow_modern.checkout.preview.payment")
        }}</span>
        <v-icon
          class="b-checkout-delivery-preview__next"
          icon="arrow_forward"
          size="16"
          aria-hidden="true"
        />
      </div>
    </div>
  </figure>
</template>

<script lang="ts">
export default {
  name: "BShopCheckoutDeliveryPreview",
  props: {
    shipping: { type: String, default: "default" },
    map: { type: Boolean, default: true },
  },
  computed: {
    descriptionKey() {
      if (this.shipping === "off")
        return "shop_configuration.flow_modern.checkout.preview.off_description";
      return this.map
        ? "shop_configuration.flow_modern.checkout.preview.map_description"
        : "shop_configuration.flow_modern.checkout.preview.manual_description";
    },
  },
};
</script>

<style lang="scss" scoped>
.b-checkout-delivery-preview {
  --preview-border: var(
    --sd-modern-border,
    rgba(var(--v-theme-on-surface), 0.09)
  );
  --preview-muted: var(
    --sd-modern-muted,
    rgba(var(--v-theme-on-surface), 0.66)
  );
  --preview-inset: var(
    --sd-modern-inset,
    rgba(var(--v-theme-on-surface), 0.025)
  );
  min-width: 0;
  margin: 20px 0 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  text-align: start;

  &__caption {
    margin-block-end: 8px;
  }
  &__caption h3 {
    margin: 0;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__caption p {
    margin: 4px 0 0;
    color: var(--preview-muted);
    font-size: 12px;
    line-height: 1.5;
  }
  &__window {
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--preview-border);
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
  }
  &__header,
  &__payment {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__header {
    border-block-end: 1px solid var(--preview-border);
  }
  &__header > .v-icon,
  &__payment > .v-icon {
    flex: 0 0 16px;
    width: 16px;
    height: 16px;
    color: var(--preview-muted);
    font-size: 16px !important;
  }
  &__map-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
    align-items: center;
    gap: 14px;
    padding: 12px;
  }
  &__map {
    position: relative;
    display: grid;
    place-items: center;
    min-width: 0;
    height: 64px;
    overflow: hidden;
    border: 1px solid var(--preview-border);
    border-radius: 8px;
    background: var(--preview-inset);
  }
  &__road {
    position: absolute;
    inset-inline: -15%;
    inset-block-start: 44%;
    height: 17px;
    border-block: 1px solid var(--preview-border);
    background: rgb(var(--v-theme-surface));
    transform: rotate(-18deg);
  }
  &__road--cross {
    inset-inline: 47% auto;
    inset-block: -20%;
    width: 14px;
    height: auto;
    border: 0;
    border-inline: 1px solid var(--preview-border);
    transform: rotate(24deg);
  }
  &__pin {
    z-index: 1;
    width: 28px;
    height: 28px;
    color: rgb(var(--v-theme-primary));
    font-size: 28px !important;
  }
  &__autofill {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 7px;
    min-width: 0;
  }
  &__autofill strong {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__autofill > span {
    color: var(--preview-muted);
    font-size: 12px;
    line-height: 1.5;
  }
  &__line {
    width: 100%;
    min-width: 0;
    height: 4px;
    border-radius: 3px;
    background: var(--preview-border);
  }
  &__line--short {
    width: 68%;
  }
  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 12px;
  }
  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    padding-block-end: 6px;
    border-block-end: 1px solid var(--preview-border);
  }
  &__field--wide {
    grid-column: 1 / -1;
  }
  &__field > span {
    color: var(--preview-muted);
    font-size: 12px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  &__field > .b-checkout-delivery-preview__line {
    width: 68%;
  }
  &__scope {
    margin: 0;
    padding: 0 12px 8px;
    color: var(--preview-muted);
    font-size: 11px;
    line-height: 1.5;
  }
  &__skip {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 80px;
    padding: 14px 12px;
  }
  &__skip > .v-icon {
    flex: 0 0 20px;
    width: 20px;
    height: 20px;
    color: var(--preview-muted);
    font-size: 20px !important;
  }
  &__payment {
    border-block-start: 1px solid var(--preview-border);
  }
  &__next {
    margin-inline-start: auto;
  }
  &:dir(rtl) &__next {
    transform: rotate(180deg);
  }
}
</style>
