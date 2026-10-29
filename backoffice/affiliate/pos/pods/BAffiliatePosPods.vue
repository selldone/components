<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <figure v-if="modern" class="b-affiliate-pos-flow text-start">
    <figcaption class="b-affiliate-pos-flow__caption">
      <span class="sd-modern-eyebrow">{{
        $t("affiliate_workspace.pos.flow_title")
      }}</span>
      <span>{{ $t("affiliate_workspace.pos.physical_only") }}</span>
    </figcaption>

    <ol class="b-affiliate-pos-flow__steps">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="b-affiliate-pos-flow__step"
        :class="`b-affiliate-pos-flow__step--${step.id}`"
      >
        <div class="b-affiliate-pos-flow__visual">
          <div
            v-if="step.id === 'request'"
            class="b-affiliate-pos-flow__brands"
          >
            <img
              src="../../../../assets/trademark/instagram.svg"
              alt="Instagram"
              width="23"
              height="23"
            />
            <img
              src="../../../../assets/trademark/snapchat.svg"
              alt="Snapchat"
              width="23"
              height="23"
            />
            <img
              src="../../../../assets/trademark/tik-tok.svg"
              alt="TikTok"
              width="23"
              height="23"
            />
          </div>
          <div
            v-else-if="step.id === 'partner'"
            class="b-affiliate-pos-flow__identity"
          >
            <v-avatar v-if="userId" size="32" class="avatar-gradient -thin">
              <v-img :src="getUserAvatar(userId)" alt="" />
            </v-avatar>
            <v-icon v-else size="28" aria-hidden="true">account_circle</v-icon>
            <span>{{
              userName || $t("affiliate_workspace.pos.partner_fallback")
            }}</span>
          </div>
          <div
            v-else-if="step.id === 'shop'"
            class="b-affiliate-pos-flow__identity"
          >
            <v-icon size="27" aria-hidden="true">storefront</v-icon>
            <span>{{ shop.title }}</span>
          </div>
          <v-icon v-else size="28" aria-hidden="true">{{ step.icon }}</v-icon>
          <span class="b-affiliate-pos-flow__number" aria-hidden="true">{{
            index + 1
          }}</span>
        </div>
        <h3>{{ $t(`affiliate_workspace.pos.${step.id}_title`) }}</h3>
        <p>{{ $t(`affiliate_workspace.pos.${step.id}_body`) }}</p>
        <span
          v-if="index < steps.length - 1"
          class="b-affiliate-pos-flow__connector"
          aria-hidden="true"
        >
          <v-icon size="16">arrow_forward</v-icon>
        </span>
      </li>
    </ol>

    <div class="sd-modern-notice b-affiliate-pos-flow__notice">
      <v-icon size="19" aria-hidden="true">info_outline</v-icon>
      <div class="sd-modern-notice__content">
        <strong>{{ $t("affiliate_workspace.pos.payment_title") }}</strong>
        <p>{{ $t("affiliate_workspace.pos.payment_body") }}</p>
      </div>
    </div>
    <details class="sd-modern-disclosure b-affiliate-pos-flow__help">
      <summary class="sd-modern-disclosure__summary">
        <v-icon size="18" aria-hidden="true">manage_accounts</v-icon>
        <span class="sd-modern-disclosure__copy">{{
          $t("affiliate_workspace.pos.access_title")
        }}</span>
        <v-icon
          class="sd-modern-disclosure__chevron"
          size="18"
          aria-hidden="true"
          >expand_more</v-icon
        >
      </summary>
      <p>{{ $t("affiliate_workspace.pos.access_body") }}</p>
    </details>
  </figure>
  <v-row v-else align="center" class="mb-2" justify="start" no-gutters>
    <div class="pod">
      <div>
        <img
          class="m-1"
          height="20"
          src="../../../../assets/trademark/instagram.svg"
          width="20"
        />
        <img
          class="m-1"
          height="20"
          src="../../../../assets/trademark/snapchat.svg"
          width="20"
        />
        <img
          class="m-1"
          height="20"
          src="../../../../assets/trademark/tik-tok.svg"
          width="20"
        />
      </div>
    </div>

    <div class="flex-grow-1 sph">
      <span class="dot -reverse"></span>
    </div>

    <div class="pod">
      <div>
        <v-avatar v-if="userId" :size="24" class="my-1 avatar-gradient -thin">
          <v-img :src="getUserAvatar(userId)" />
        </v-avatar>
        <v-icon v-else>account_circle</v-icon>
        <small class="d-block">{{ userName }}</small>
      </div>
    </div>

    <div class="flex-grow-1 sph">
      <span class="dot -reverse"></span>
    </div>

    <div class="pod">
      <v-icon>storefront</v-icon>
      <small class="d-block">{{ shop.title }}</small>
    </div>
  </v-row>
</template>

<script lang="ts">
export default {
  name: "BAffiliatePosPods",
  props: {
    modern: { type: Boolean, default: false },
    userId: {},
    userName: {},
    shop: { required: true },
  },
  data() {
    return {
      steps: [
        { id: "request" },
        { id: "partner" },
        { id: "order", icon: "add_shopping_cart" },
        { id: "receipt", icon: "receipt_long" },
        { id: "shop" },
        { id: "commission", icon: "account_balance_wallet" },
      ],
    };
  },
};
</script>

<style scoped lang="scss">
.b-affiliate-pos-flow {
  --flow-accent: rgb(var(--v-theme-primary));
  --flow-forward-angle: 0deg;
  --flow-back-angle: 180deg;
  margin: 24px 0 0;
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
  line-height: 20px;

  .b-affiliate-pos-flow__caption {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-block-end: 18px;
    > :last-child {
      color: var(--sd-modern-muted);
      font-size: 11px;
    }
  }
  .b-affiliate-pos-flow__steps {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 38px 24px;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .b-affiliate-pos-flow__step {
    position: relative;
    min-width: 0;
    padding: 16px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));
    h3 {
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
      margin: 13px 0 5px;
    }
    p {
      font-size: 12px;
      line-height: 19px;
      margin: 0;
      color: var(--sd-modern-muted);
      overflow-wrap: anywhere;
    }
  }
  .b-affiliate-pos-flow__visual {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 34px;
    > .v-icon {
      color: var(--flow-accent);
    }
  }
  .b-affiliate-pos-flow__brands {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .b-affiliate-pos-flow__identity {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
    font-size: 12px;
    font-weight: 500;
    overflow-wrap: anywhere;
    .v-avatar {
      flex-shrink: 0;
    }
    > span {
      min-width: 0;
    }
  }
  .b-affiliate-pos-flow__number {
    align-self: flex-start;
    flex-shrink: 0;
    color: var(--sd-modern-muted);
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    line-height: 18px;
  }
  .b-affiliate-pos-flow__connector {
    position: absolute;
    display: grid;
    place-items: center;
    inline-size: 24px;
    block-size: 2px;
    inset-inline-start: 100%;
    inset-block-start: 50%;
    background: var(--flow-accent);
    color: var(--flow-accent);
    .v-icon {
      position: absolute;
      inset-inline-end: -3px;
      transform: rotate(var(--flow-forward-angle));
    }
  }
  .b-affiliate-pos-flow__step--order .b-affiliate-pos-flow__connector {
    inline-size: 2px;
    block-size: 38px;
    inset-inline-start: 50%;
    inset-block-start: 100%;
    .v-icon {
      inset-inline-end: auto;
      inset-block-end: -3px;
      transform: rotate(90deg);
    }
  }
  .b-affiliate-pos-flow__step--receipt {
    grid-area: 2 / 3;
  }
  .b-affiliate-pos-flow__step--shop {
    grid-area: 2 / 2;
  }
  .b-affiliate-pos-flow__step--commission {
    grid-area: 2 / 1;
  }
  .b-affiliate-pos-flow__step--receipt,
  .b-affiliate-pos-flow__step--shop {
    .b-affiliate-pos-flow__connector {
      inset-inline-start: auto;
      inset-inline-end: 100%;
      .v-icon {
        inset-inline-end: auto;
        inset-inline-start: -3px;
        transform: rotate(var(--flow-back-angle));
      }
    }
  }
  &:dir(rtl) {
    --flow-forward-angle: 180deg;
    --flow-back-angle: 0deg;
  }
  .b-affiliate-pos-flow__notice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-block-start: 22px;
    strong {
      font-size: 12px;
      font-weight: 500;
    }
    p {
      margin: 4px 0 0;
      font-size: 12px;
      line-height: 19px;
    }
    > .v-icon {
      margin-block-start: 1px;
      flex-shrink: 0;
    }
  }
  .b-affiliate-pos-flow__help {
    margin-block-start: 14px;
    border: 0;
    .sd-modern-disclosure__summary {
      padding: 8px 0;
      font-size: 12px;
    }
    > p {
      margin: 10px 0 0;
      font-size: 12px;
      line-height: 20px;
      color: var(--sd-modern-muted);
    }
  }
  @media (max-width: 600px) {
    .b-affiliate-pos-flow__steps {
      grid-template-columns: minmax(0, 1fr);
      gap: 24px;
    }
    .b-affiliate-pos-flow__step {
      grid-area: auto;
      padding: 16px;
    }
    .b-affiliate-pos-flow__identity {
      flex-wrap: nowrap;
    }
    .b-affiliate-pos-flow__step .b-affiliate-pos-flow__connector {
      inline-size: 2px;
      block-size: 24px;
      inset-inline-start: 30px;
      inset-inline-end: auto;
      inset-block-start: 100%;
      .v-icon {
        inset-inline-start: auto;
        inset-inline-end: auto;
        inset-block-end: -3px;
        transform: rotate(90deg);
      }
    }
    .b-affiliate-pos-flow__help .sd-modern-disclosure__summary {
      min-height: 44px;
    }
  }
}
</style>
