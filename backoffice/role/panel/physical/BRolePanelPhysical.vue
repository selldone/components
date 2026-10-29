<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
-->
<template>
  <section class="b-role-focus text-start" v-bind="$attrs">
    <header class="b-role-focus__heading">
      <h1>{{ $t("role_workspace.title") }}</h1>
      <p>{{ $t("role_workspace.subtitle") }}</p>
    </header>
    <div class="b-role-focus__grid sd-modern-widget">
      <div
        class="b-role-focus__queue"
        :inert="busy_update_state || support_busy"
      >
        <b-role-panel-orders-list
          :dark="dark"
          :role="role"
          :shop="shop"
          :type="ProductType.PHYSICAL"
          modern
          :selected-id="selected?.id"
          @select="selectTask"
          @loaded="onOrdersLoaded"
          @scope-change="clearTask"
          @total-tasks="(value) => (role.total_tasks = value)"
        />
      </div>
      <aside
        v-show="!compact"
        class="b-role-focus__detail"
        :aria-busy="busy_fetch"
      >
        <div v-if="busy_fetch" class="b-role-focus__placeholder" role="status">
          <v-progress-circular indeterminate size="24" width="2" />
          <p>{{ $t("role_workspace.loading_task") }}</p>
        </div>
        <div
          v-else-if="load_error"
          class="b-role-focus__placeholder"
          role="alert"
        >
          <v-icon size="24">error_outline</v-icon>
          <p>{{ $t("role_workspace.task_load_error") }}</p>
          <v-btn
            class="sd-modern-button"
            variant="outlined"
            @click="fetchBasket"
            >{{ $t("role_workspace.retry") }}</v-btn
          >
        </div>
        <Teleport
          v-else-if="basket"
          :to="dialog_target || 'body'"
          :disabled="!dialog || !dialog_target"
        >
          <b-role-panel-task
            :key="taskKey"
            :basket="basket"
            :role="role"
            :shop="shop"
            :dark="dialog && dialogDark"
            :inert="busy_update_state"
            :expandable="!dialog"
            @expand="dialog = true"
            @update-state="updateState"
            @fetch-order="fetchBasket"
            @busy="support_busy = $event"
          />
        </Teleport>
        <div v-else class="b-role-focus__placeholder">
          <v-icon size="28">task_alt</v-icon>
          <h2>{{ $t("role_workspace.select_title") }}</h2>
          <p>{{ $t("role_workspace.select_subtitle") }}</p>
        </div>
      </aside>
    </div>
    <!-- Native task workspace is full screen on mobile; the queue keeps its current scope. -->
    <v-dialog
      :model-value="dialog"
      :persistent="busy_update_state || support_busy"
      fullscreen
      scrollable
      eager
      transition="dialog-bottom-transition"
      @update:model-value="closeTask"
    >
      <v-card
        class="b-role-focus-dialog sd-modern-canvas text-start"
        :theme="dialogDark ? 'dark' : 'light'"
      >
        <v-card-title class="b-role-focus-dialog__bar">
          <v-btn
            :disabled="busy_update_state || support_busy"
            class="sd-modern-button"
            variant="text"
            :prepend-icon="$t('icons.arrow_back')"
            @click="closeTask(false)"
            >{{ $t("role_workspace.back_queue") }}</v-btn
          >
        </v-card-title>
        <v-card-text class="b-role-focus-dialog__body">
          <div
            v-if="busy_fetch"
            class="b-role-focus__placeholder"
            role="status"
          >
            <v-progress-circular indeterminate size="24" width="2" />
            <p>{{ $t("role_workspace.loading_task") }}</p>
          </div>
          <div
            v-else-if="load_error"
            class="b-role-focus__placeholder sd-modern-widget"
            role="alert"
          >
            <p>{{ $t("role_workspace.task_load_error") }}</p>
            <v-btn
              class="sd-modern-button"
              variant="outlined"
              @click="fetchBasket"
              >{{ $t("role_workspace.retry") }}</v-btn
            >
          </div>
          <div
            :ref="(element) => (dialog_target = element)"
            class="b-role-focus-dialog__target sd-modern-widget"
            v-show="basket && !busy_fetch && !load_error"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import BRolePanelOrdersList from "../orders/list/BRolePanelOrdersList.vue";
import BRolePanelTask from "./BRolePanelTask.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { ShopRoles } from "@selldone/core-js/enums/staff/ShopRoles";
import { Basket } from "@selldone/core-js";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BRolePanelPhysical",
  components: { BRolePanelOrdersList, BRolePanelTask },
  props: {
    role: { required: true, type: Object },
    shop: { required: true, type: Object },
    timeSeries: { required: true, type: Object },
    dark: { type: Boolean, default: false },
  },
  data() {
    return {
      ProductType,
      selected: null,
      basket: null,
      busy_fetch: false,
      load_error: false,
      busy_update_state: false,
      support_busy: false,
      dialog: false,
      dialog_target: null,
      requestId: 0,
    };
  },
  computed: {
    dialogDark() {
      return this.dark || !!this.USER?.()?.preferences?.dark;
    },
    compact() {
      return this.$vuetify.display.width <= 1100;
    },
    roleScope() {
      return JSON.stringify([
        this.role.id,
        this.role.level,
        this.shop.id,
        this.role.accepted,
      ]);
    },
    taskKey() {
      return `${this.roleScope}:${this.selected?.id}`;
    },
  },
  watch: {
    roleScope() {
      this.clearTask();
    },
    compact(value) {
      if (value && this.selected) this.dialog = true;
    },
  },
  beforeUnmount() {
    this.requestId++;
  },
  methods: {
    clearTask() {
      this.requestId++;
      this.selected = null;
      this.basket = null;
      this.load_error = false;
      this.busy_fetch = false;
      this.support_busy = false;
      this.dialog = false;
    },
    onOrdersLoaded({ orders }) {
      if (!this.compact && orders.length) this.selectTask(orders[0]);
    },
    selectTask(task) {
      if (this.busy_update_state || this.support_busy) return;
      if (this.selected?.id === task.id && this.basket) {
        if (this.compact) this.dialog = true;
        return;
      }
      this.selected = task;
      this.dialog = this.compact;
      this.fetchBasket();
    },
    closeTask(value) {
      if (this.busy_update_state || this.support_busy) return;
      this.dialog = value;
    },
    fetchBasket() {
      if (!this.selected || this.busy_update_state || this.support_busy) return;
      const requestId = ++this.requestId,
        taskKey = this.taskKey;
      this.basket = null;
      this.busy_fetch = true;
      this.load_error = false;
      return axios
        .get(window.API.GET_MY_ROLE_TASK(this.role.id, this.selected.id))
        .then(({ data }) => {
          if (requestId !== this.requestId || taskKey !== this.taskKey) return;
          if (data.error || !data.basket || data.basket.id !== this.selected.id)
            throw new Error("Invalid role task");
          this.basket = data.basket;
        })
        .catch(() => {
          if (requestId === this.requestId && taskKey === this.taskKey)
            this.load_error = true;
        })
        .finally(() => {
          if (requestId === this.requestId && taskKey === this.taskKey)
            this.busy_fetch = false;
        });
    },
    // Role-scoped endpoint remains authoritative. Recheck UI scope immediately before every write.
    canUpdate(state) {
      const order = this.basket,
        states = Basket.PhysicalOrderStates;
      if (
        !order ||
        order.id !== this.selected?.id ||
        !this.role.accepted ||
        order.reject ||
        ![Basket.Status.Payed.code, Basket.Status.COD.code].includes(
          order.status,
        )
      )
        return false;
      if (this.role.level === ShopRoles.PhysicalOrdersChecking.code)
        return (
          state === states.OrderConfirm.code &&
          [
            states.CheckQueue.code,
            states.OrderConfirm.code,
            states.PreparingOrder.code,
          ].includes(order.delivery_state)
        );
      if (this.role.level === ShopRoles.PhysicalOrdersPackaging.code)
        return (
          state === states.PreparingOrder.code &&
          [states.OrderConfirm.code, states.PreparingOrder.code].includes(
            order.delivery_state,
          )
        );
      if (this.role.level === ShopRoles.PhysicalOrdersDelivery.code)
        return (
          (state === states.SentOrder.code &&
            order.delivery_state === states.PreparingOrder.code) ||
          (state === states.ToCustomer.code &&
            order.delivery_state === states.SentOrder.code)
        );
      return false;
    },
    updateState({ state, list = null, callback = null, delivery_info = null }) {
      if (
        this.busy_update_state ||
        this.support_busy ||
        !this.canUpdate(state)
      ) {
        callback?.();
        return;
      }
      const taskKey = this.taskKey,
        selected = this.selected,
        requestId = this.requestId;
      this.busy_update_state = true;
      return axios
        .post(
          window.API.POST_MY_ROLE_TASK_ACTION(
            this.role.id,
            selected.id,
            "update-status",
          ),
          { state, list, delivery_info },
        )
        .then(({ data }) => {
          if (taskKey !== this.taskKey || requestId !== this.requestId) return;
          if (data.error)
            NotificationService.showErrorAlert(null, data.error_msg);
          else {
            selected.delivery_state = data.delivery_state;
            selected.delivery_at = data.delivery_at;
            selected.done = true;
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.update_status_success",
              ),
            );
          }
        })
        .catch((error) => {
          if (taskKey === this.taskKey && requestId === this.requestId)
            NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update_state = false;
          callback?.();
          // Reload after success or denial so outdated permissions/state cannot remain actionable.
          if (taskKey === this.taskKey && requestId === this.requestId)
            this.fetchBasket();
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-role-focus {
  min-width: 0;
  &__heading {
    margin-block-end: 22px;
    h1 {
      margin: 0 0 6px;
      font-family: inherit;
      font-size: 23px;
      font-weight: 500;
      line-height: 1.35;
      letter-spacing: -0.5px;
    }
    p {
      margin: 0;
      font-size: 12px;
      line-height: 1.6;
      color: var(--sd-modern-muted);
    }
  }
  &__grid.sd-modern-widget {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(310px, 0.9fr);
    align-items: stretch;
    padding: 0;
    border-radius: 16px;
    overflow: hidden;
    height: clamp(600px, calc(100dvh - 290px), 940px);
  }
  &__queue {
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }
  &__detail {
    min-width: 0;
    min-height: 0;
    overflow: auto;
    border-inline-start: 1px solid var(--sd-modern-border);
  }
  &__placeholder {
    min-height: 380px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    text-align: center;
    color: var(--sd-modern-muted);
    h2 {
      color: rgb(var(--v-theme-on-surface));
      font-size: 17px;
      font-weight: 500;
      margin: 0;
    }
    p {
      font-size: 12px;
      line-height: 1.6;
      max-width: 300px;
      margin: 0;
    }
  }
  @media (max-width: 1100px) {
    &__grid.sd-modern-widget {
      grid-template-columns: minmax(0, 1fr);
      height: auto;
    }
  }
}
.b-role-focus-dialog {
  &__bar {
    padding: 12px 16px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__body {
    padding: 20px !important;
  }
  &__target.sd-modern-widget {
    padding: 0;
    max-width: 1050px;
    margin-inline: auto;
  }
  @media (max-width: 600px) {
    &__body {
      padding: 12px !important;
    }
  }
}
@media (prefers-reduced-motion: reduce) {
  .b-role-focus-dialog {
    transition: none;
  }
}
</style>
