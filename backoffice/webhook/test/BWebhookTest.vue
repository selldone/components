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

<template>
  <section class="sd-modern-widget b-webhook-test text-start" :aria-busy="busy">
    <header class="sd-modern-header b-webhook-test__header">
      <div class="sd-modern-title b-webhook-test__heading">
        <v-icon size="21" aria-hidden="true">science</v-icon>
        <div>
          <h2 class="sd-modern-title-text">{{ t("test.title") }}</h2>
          <p class="sd-modern-subtitle">{{ t("test.subtitle") }}</p>
        </div>
      </div>
    </header>

    <b-webhook-flow
      :event-code="webhook.type"
      :url="webhook.url"
      :active="active"
      class="b-webhook-test__flow"
    />

    <v-select
      v-if="webhook_obj.actions"
      v-model="action"
      :items="actions"
      :label="t('test.action')"
      :messages="t('test.action_hint')"
      :disabled="busy"
      :menu-props="{ contentClass: 'sd-modern-select-menu text-start' }"
      class="b-webhook-test__action"
      variant="outlined"
      density="compact"
      color="primary"
    >
      <template #item="{ props }">
        <v-list-item v-bind="props" class="b-webhook-test-option" />
      </template>
    </v-select>

    <div class="b-webhook-test__actions">
      <v-btn
        :loading="busy"
        :disabled="busy"
        class="sd-modern-button b-webhook-test__send"
        color="primary"
        variant="flat"
        @click="sendTest()"
        ><v-icon size="16" start aria-hidden="true">play_arrow</v-icon
        >{{ t("test.send") }}</v-btn
      >
    </div>

    <v-expand-transition>
      <div v-if="response" class="b-webhook-test__response">
        <s-json-table :value="response" dense json-enable></s-json-table>
      </div>
    </v-expand-transition>
  </section>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import WebhookTypes from "@selldone/core-js/enums/webhook/WebhookTypes";
import SJsonTable from "../../../ui/json/table/SJsonTable.vue";
import BWebhookFlow from "../flow/BWebhookFlow.vue";

export default {
  name: "BWebhookTest",
  mixins: [],

  components: { SJsonTable, BWebhookFlow },
  props: {
    webhook: { required: true },
    active: { type: Boolean, default: true },
  },
  data: () => ({
    busy: false,
    response: null,
    action: null,
  }),

  computed: {
    webhook_obj() {
      return WebhookTypes[this.webhook.type];
    },
    actions() {
      return this.webhook_obj.actions;
    },
  },

  watch: {
    actions(actions) {
      this.action = actions ? actions[0] : null;
    },
  },

  created() {
    this.action = this.actions ? this.actions[0] : null;
  },

  methods: {
    t(key, values?) {
      return this.$t(`admin_shop.automation.webhooks.${key}`, values || {});
    },
    sendTest() {
      this.busy = true;
      this.response = null;
      axios
        .post(
          window.API.POST_SHOP_WEBHOOK_TEST(
            this.webhook.shop_id,
            this.webhook.id,
          ),
          {
            action: this.action,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.response = data.response;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-webhook-test-option :deep(.v-list-item-title) {
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
}
.b-webhook-test.sd-modern-widget {
  padding: 24px 26px;
  border-radius: 18px;

  .b-webhook-test__header {
    margin-block-end: 20px;
  }
  .b-webhook-test__heading {
    gap: 11px;

    > .v-icon {
      flex: 0 0 21px;
      margin-block-start: 3px;
      color: var(--sd-modern-muted);
    }
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: -0.25px;
    }
    p {
      margin: 5px 0 0;
      color: var(--sd-modern-muted);
      font-size: 13px;
      font-weight: 400;
      line-height: 1.6;
    }
  }
  .b-webhook-test__flow {
    margin-block-end: 22px;
  }
  .b-webhook-test__action {
    :deep(.v-field) {
      border-radius: 9px;
    }
    :deep(.v-field__input),
    :deep(.v-select__selection-text) {
      font-family: inherit;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
    }
    :deep(.v-field__input) {
      min-height: 44px;
    }
    :deep(.v-messages) {
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 1.6;
    }
  }
  .b-webhook-test__actions {
    display: flex;
    justify-content: end;
    margin-block-start: 22px;
  }
  .b-webhook-test__send {
    min-height: 36px;
    padding: 0 12px;
    font-size: 13px;
    line-height: 1.4;
  }
  .b-webhook-test__response {
    margin-block-start: 22px;
    min-width: 0;
    overflow-wrap: anywhere;
    :deep(.v-table th),
    :deep(.v-table td) {
      font-size: 12px;
      line-height: 1.8;
      overflow-wrap: anywhere;
    }
    :deep(.vjs-tree),
    :deep(.vjs-tree-node) {
      font-size: 12px;
      line-height: 1.8;
    }
    :deep(.vjs-value) {
      color: inherit;
    }
    :deep(.vjs-tree-node:hover) {
      background: var(--sd-modern-inset);
    }
  }
}

@media (max-width: 700px) {
  .b-webhook-test.sd-modern-widget {
    padding: 21px 20px;
  }
}
@media (max-width: 420px) {
  .b-webhook-test.sd-modern-widget {
    padding: 20px 16px;
  }
}
@media (max-width: 799px), (pointer: coarse) {
  .b-webhook-test.sd-modern-widget {
    .b-webhook-test__send {
      min-height: 44px;
    }
    .b-webhook-test__action :deep(.v-field__input),
    .b-webhook-test__action :deep(.v-select__selection-text) {
      font-size: 16px;
    }
  }
}
</style>
