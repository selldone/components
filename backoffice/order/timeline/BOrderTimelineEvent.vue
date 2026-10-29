<template>
  <article
    class="b-order-timeline-event text-start"
    :class="{ 'b-order-timeline-event--compact': compact, disabled: busyDelete === item.id }"
    :data-timeline-event="item.id"
  >
    <v-tooltip location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">
      <template #activator="{ props }">
        <time v-bind="props" class="b-order-timeline-event__time" :datetime="validDate ? item.created_at : undefined">
          <span>{{ validDate ? getLocalTimeOnlyString(item.created_at) : $t('order_timeline.modern.unknown_date') }}</span>
          <span v-if="validDate">{{ getFromNowString(item.created_at) }}</span>
        </time>
      </template>
      {{ validDate ? getLocalTimeString(item.created_at) : String(item.created_at || $t('order_timeline.modern.unknown_date')) }}
    </v-tooltip>

    <span class="b-order-timeline-event__icon" :class="{ 'b-order-timeline-event__icon--complete': completedEvent, 'b-order-timeline-event__icon--error': errorEvent }">
      <v-img v-if="data.image" :src="data.image" width="20" height="20" cover />
      <v-icon v-else size="16" aria-hidden="true">{{ item.pin ? 'push_pin' : eventIcon }}</v-icon>
    </span>

    <div class="b-order-timeline-event__body">
      <template v-if="item.type === 'note' && item.editing">
        <u-text-mention-input
          v-model="item.data.message"
          :label="$t('order_timeline.message_input')"
          :shop-id="shop.id"
          modern
          auto-grow
          class="b-order-timeline-event__editor"
        />
        <div class="b-order-timeline-event__edit-actions">
          <v-btn class="sd-modern-button sd-modern-button--compact" variant="outlined" :disabled="busyEdit === item" @click="$emit('cancel-edit', item)">
            <v-icon start size="18" aria-hidden="true">close</v-icon>{{ $t('global.actions.cancel') }}
          </v-btn>
          <v-btn class="sd-modern-button sd-modern-button--compact" color="primary" variant="flat" :loading="busyEdit === item" :disabled="!String(data.message || '').trim()" @click="$emit('save', item)">
            <v-icon start size="18" aria-hidden="true">save</v-icon>{{ $t('global.actions.save') }}
          </v-btn>
        </div>
      </template>
      <template v-else>
        <div class="b-order-timeline-event__heading-row">
          <h3 v-if="heading" class="b-order-timeline-event__heading">{{ heading }}</h3>
          <h3 v-else-if="unknownEvent" class="b-order-timeline-event__heading">{{ String(item.type || '') }}</h3>
          <h3 v-else class="b-order-timeline-event__heading html-style" v-html="titleHtml" />
          <span v-if="hasAmount" class="b-order-timeline-event__amount"><u-currency-icon v-if="hasCurrency" :currency="payment.currency" flag-only small /><u-price v-if="hasCurrency" :amount="payment.amount" :currency="payment.currency" /><span v-else>{{ payment.amount }}</span></span>
          <span v-else-if="hasRecordedAmount" class="b-order-timeline-event__invalid-amount"><span>{{ payment.amount }}</span><v-icon size="14" color="error" aria-hidden="true">error_outline</v-icon><span>{{ $t('global.commons.invalid') }}</span></span>
        </div>
        <div v-if="heading && titleHtml" class="b-order-timeline-event__description html-style" :class="{ 'b-order-timeline-event__description--note': item.type === 'note' }" v-html="titleHtml" />
        <div v-if="unknownEvent && data.message" class="b-order-timeline-event__description">{{ String(data.message) }}</div>

        <!-- Preserve the saved amount/message rather than inferring a payment state. -->
        <div v-if="payment && payment.message !== undefined && payment.message !== null" class="b-order-timeline-event__payment">
          <template v-if="isCurrentOrderReference">
            <v-tooltip location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true" :open-on-click="true">
              <template #activator="{ props }">
                <button v-bind="props" type="button" class="b-order-timeline-event__reference" :aria-label="$t('order_timeline.modern.recorded_reference')">
                  <img v-if="orderImage" :src="orderImage" alt="" width="17" height="19" />
                  <bdi>{{ getBasketOrderCode(order) }}</bdi><v-icon size="14" aria-hidden="true">info_outline</v-icon>
                </button>
              </template>
              <div>{{ $t('order_timeline.modern.reference_help') }}</div>
              <div class="mt-1">{{ $t('order_timeline.modern.recorded_reference') }}: <bdi>{{ payment.message }}</bdi></div>
            </v-tooltip>
          </template>
          <span v-else-if="payment.message !== undefined && payment.message !== null" class="b-order-timeline-event__payment-message">{{ payment.message }}</span>
        </div>

        <div v-if="item.by || data.delivery_service_id || data.delivery_user_id || data.connect_id || (item.pin && validDate)" class="b-order-timeline-event__meta">
          <span v-if="item.by" class="b-order-timeline-event__actor"><v-avatar size="18" class="hover-scale"><v-img :src="getUserAvatar(item.by.id)" /></v-avatar>{{ item.by.name }}</span>
          <span v-if="item.pin && validDate">{{ getLocalDateString(item.created_at) }}</span>
          <span v-if="data.delivery_service_id || data.delivery_user_id" class="b-order-timeline-event__delivery">
            <img :src="wireIcon" alt="" width="16" height="16" />
            <v-avatar v-if="data.delivery_service_id" size="18" rounded="0" class="hover-scale"><v-img :src="deliveryServiceIcon" /></v-avatar>
            <v-avatar v-if="data.delivery_user_id" size="18" class="hover-scale"><v-img :src="getUserAvatar(data.delivery_user_id)" /></v-avatar>
          </span>
          <v-img v-if="data.connect_id" :src="connectIcon" class="b-order-timeline-event__connect hover-scale" width="24" height="24" />
        </div>

        <!-- Each available saved address keeps its original map operation. -->
        <div v-if="addressChanges.length" class="b-order-timeline-event__addresses">
          <div v-for="change in addressChanges" :key="change.key">
            <span class="sd-modern-list-header">{{ $t(change.label) }}</span>
            <p>{{ MapHelper.GenerateFullAddressFromMapInfo(change.address) }}</p>
            <u-map-geo-button v-if="change.address.location" :location="change.address.location" :icon="true" small />
          </div>
        </div>
      </template>
    </div>

    <div v-if="!item.editing" class="b-order-timeline-event__actions">
      <u-smart-menu
        v-if="item.type === 'note'"
        modern
        icon="more_horiz"
        :title="$t('order_timeline.modern.note_actions')"
        :class="{ disabled: busyEdit === item || busyDelete === item.id }"
        :loading="busyEdit === item || busyDelete === item.id"
        :items="noteActions"
      />
      <v-btn v-if="canPreview" class="sd-modern-button sd-modern-button--compact sd-modern-button--inline" variant="text" color="primary" @click.stop="$emit('preview', item)">
        <v-icon start size="16" aria-hidden="true">visibility</v-icon>{{ $t('order_timeline.modern.preview_email') }}
      </v-btn>
      <span v-if="canResend && data.resend" class="b-order-timeline-event__resent">{{ $t('order_timeline.modern.resent_at', { time: resendTime }) }}</span>
      <v-btn v-else-if="canResend && data.can_resend" class="sd-modern-button sd-modern-button--compact sd-modern-button--inline" variant="text" color="primary" :loading="busyResend === item.id" :disabled="busyResend !== null" @click.stop="$emit('resend', item)">
        <v-icon start size="16" aria-hidden="true">send</v-icon>{{ $t('global.actions.resend') }}
      </v-btn>
      <v-tooltip v-if="isSms" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true" :open-on-click="true">
        <template #activator="{ props }"><v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('order_timeline.modern.event_details')"><v-icon size="16" aria-hidden="true">info_outline</v-icon></v-btn></template>
        {{ $t('order_timeline.modern.sms_record_help') }}
      </v-tooltip>
    </div>
  </article>
</template>

<script lang="ts">
import DateMixin from '../../../mixin/date/DateMixin.ts';
import ProductMixin from '../../../mixin/product/ProductMixin.ts';
import TimelineStatus from '@selldone/core-js/enums/timeline/TimelineStatus.ts';
import { DeliveryServiceHelper, MapHelper } from '@selldone/core-js';
import USmartMenu from '../../../ui/smart/menu/USmartMenu.vue';
import UTextMentionInput from '../../../ui/text/mention-input/UTextMentionInput.vue';
import UMapGeoButton from '../../../ui/map/geo-button/UMapGeoButton.vue';
import UPrice from '../../../ui/price/UPrice.vue';
import UCurrencyIcon from '../../../ui/currency/icon/UCurrencyIcon.vue';
import wireIcon from '../../../assets/icons/wire.svg';

const emailTypes = ['email-buy', 'email-payment', 'email-update', 'email-vendor'];
const notificationHeadings = {
  'email-buy': 'email_buy', 'email-payment': 'email_payment', 'email-update': 'email_update', 'email-vendor': 'email_vendor',
  'sms-payment': 'sms_payment', 'sms-ready-to-ship': 'sms_ship', 'sms-ready-to-pickup': 'sms_pickup', 'sms-order-confirmation': 'sms_confirmation',
  'vendor-sms': 'vendor_sms',
};
const materialIcons = {
  note: 'edit_note', info: 'info_outline', error: 'error_outline', buy: 'shopping_basket', payment: 'payments', confirm: 'check',
  prepare: 'inventory_2', send: 'local_shipping', delivered: 'done_all', 'count-adjustment': 'scale', 'fill-inputs': 'edit_note',
  'return-add': 'assignment_return', 'return-accept': 'check_circle', 'return-reject': 'cancel', 'reject-order': 'cancel', 'reject-order-clear': 'restore',
  'delivery-returned': 'assignment_return', 'delivery-canceled': 'cancel',
};

export default {
  name: 'BOrderTimelineEvent',
  mixins: [DateMixin, ProductMixin],
  components: { USmartMenu, UTextMentionInput, UMapGeoButton, UPrice, UCurrencyIcon },
  emits: ['preview', 'resend', 'edit', 'save', 'cancel-edit', 'pin', 'delete'],
  props: {
    item: { type: Object, required: true }, shop: { type: Object, required: true }, order: { type: Object, required: true },
    orderType: String, getTitle: { type: Function, required: true }, compact: Boolean,
    busyEdit: { default: null }, busyDelete: { default: false }, busyResend: { default: null },
  },
  computed: {
    MapHelper() { return MapHelper; },
    wireIcon() { return wireIcon; },
    data() { return this.item.data && typeof this.item.data === 'object' && !Array.isArray(this.item.data) ? this.item.data : {}; },
    payment() { return this.data.payment && typeof this.data.payment === 'object' && !Array.isArray(this.data.payment) ? this.data.payment : null; },
    hasRecordedAmount() { return this.payment && this.payment.amount !== null && this.payment.amount !== undefined && String(this.payment.amount).trim() !== ''; },
    hasAmount() { return this.hasRecordedAmount && ['number','string'].includes(typeof this.payment.amount) && Number.isFinite(Number(this.payment.amount)); },
    hasCurrency() { return typeof this.payment?.currency === 'string' ? !!this.payment.currency.trim() : !!this.payment?.currency?.code; },
    validDate() { return !!this.item.created_at && Number.isFinite(new Date(this.item.created_at).getTime()); },
    titleHtml() { return this.unknownEvent ? '' : String(this.getTitle(this.item) || ''); },
    unknownEvent() { return !Object.hasOwn(TimelineStatus, this.item.type); },
    heading() { return this.item.type === 'note' ? this.$t('order_timeline.modern.internal_note') : Object.hasOwn(notificationHeadings, this.item.type) ? this.$t(`order_timeline.modern.events.${notificationHeadings[this.item.type]}`) : ''; },
    isSms() { return ['sms-payment', 'sms-ready-to-ship', 'sms-ready-to-pickup', 'sms-order-confirmation', 'vendor-sms', 'sms-vendor'].includes(this.item.type); },
    eventIcon() { if (this.isSms) return 'sms'; if (emailTypes.includes(this.item.type)) return 'mail_outline'; const nativeIcon=!this.unknownEvent ? TimelineStatus[this.item.type]?.icon : null; return Object.hasOwn(materialIcons,this.item.type) ? materialIcons[this.item.type] : nativeIcon && !nativeIcon.startsWith('fa:') ? nativeIcon : 'history'; },
    completedEvent() { return !this.item.pin && ['buy', 'confirm', 'prepare', 'send', 'delivered'].includes(this.item.type); },
    errorEvent() { return ['error', 'return-reject', 'reject-order', 'delivery-canceled', 'connect-failed', 'connect-canceled'].includes(this.item.type); },
    canPreview() { return emailTypes.includes(this.item.type); },
    canResend() { return ['email-buy', 'email-payment', 'email-vendor'].includes(this.item.type); },
    resendTime() { return Number.isFinite(new Date(this.data.resend).getTime()) ? this.getLocalTimeStringSmall(this.data.resend) : String(this.data.resend); },
    deliveryServiceIcon() { return this.data.delivery_service_id ? DeliveryServiceHelper.GetDeliveryServiceIconById(this.data.delivery_service_id) : null; },
    connectIcon() { return this.data.connect_id ? window.CDN.GET_CONNECT_ICON(this.data.connect_id) : null; },
    orderImage() { return this.getBasketTypeImage(this.order.type); },
    isCurrentOrderReference() {
      const prefix = ['physical', 'virtual', 'file', 'service', 'subscription'].includes(this.orderType) ? 'Basket' : {pos:'POS',fulfillment:'Fulfilment',avocado:'AVO',hyper:'HYP'}[this.orderType];
      return !!prefix && this.order.id !== undefined && this.payment?.message === `${prefix}-${this.order.id}`;
    },
    addressChanges() { return [{key:'old',label:'order_timeline.modern.previous_address',address:this.data.old},{key:'new',label:'order_timeline.modern.updated_address',address:this.data.new}].filter(change=>change.address && typeof change.address === 'object' && !Array.isArray(change.address)); },
    noteActions() { return [{icon:'push_pin',title:this.$t(this.item.pin?'order_timeline.unpin_action':'order_timeline.pin_action'),click:()=>this.$emit('pin',this.item)},{icon:'edit_note',title:this.$t('global.actions.edit'),click:()=>this.$emit('edit',this.item)},{icon:'delete_outline',title:this.$t('global.actions.delete'),click:()=>this.$emit('delete',this.item)}]; },
  },
};
</script>

<style scoped lang="scss">
.b-order-timeline-event {
  --sd-modern-icon-button-size: 32px;
  display: grid; grid-template-columns: 72px 28px minmax(0, 1fr) auto; gap: 12px;
  align-items: start; min-width: 0; padding-block: 14px; color: rgb(var(--v-theme-on-surface));
  font-family: inherit; font-size: 12px; font-weight: 400; line-height: 20px;
  &__time { display: flex; flex-direction: column; gap: 2px; padding-block-start: 2px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; font-variant-numeric: tabular-nums; > span:first-child {color: rgb(var(--v-theme-on-surface)); font-size: 12px;} }
  &__icon { display: grid; place-items: center; width: 28px; height: 28px; color: var(--sd-modern-muted); background: rgb(var(--v-theme-surface)); border: 1px solid var(--sd-modern-border); border-radius: 50%; position: relative; z-index: 1; &--complete { color: rgb(var(--v-theme-surface)); background: rgb(var(--v-theme-on-surface)); border-color: rgb(var(--v-theme-on-surface)); } &--error > .v-icon { color: rgb(var(--v-theme-error)); } }
  &__body { min-width: 0; }
  &__heading-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  &__heading { margin: 0; color: rgb(var(--v-theme-on-surface)); font-size: 13px; font-weight: 500; line-height: 20px; overflow-wrap: anywhere; }
  &__description { margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 20px; overflow-wrap: anywhere; text-wrap: pretty; }
  &__description--note { color: rgb(var(--v-theme-on-surface)); }
  &__heading, &__description { :deep(img) { vertical-align: middle; } :deep(strong), :deep(b) { font-weight: 500; } }
  &__payment { display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; margin-block-start: 4px; }
  &__amount { display: inline-flex; align-items: center; gap: 4px; color: rgb(var(--v-theme-on-surface)); font-size: 13px; font-weight: 400; font-variant-numeric: tabular-nums; :deep(.u--price) { font-size: inherit; font-weight: inherit; } }
  &__invalid-amount { display: inline-flex; align-items: center; gap: 5px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 17px; }
  &__payment-message { overflow-wrap: anywhere; }
  &__reference { display: inline-flex; align-items: center; gap: 5px; min-height: 26px; padding: 0; border: 0; background: transparent; color: rgb(var(--v-theme-primary)); font: inherit; cursor: var(--cursor-interaction,pointer); }
  &__meta, &__actor, &__delivery { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  &__meta { gap: 7px 12px; margin-block-start: 5px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  &__connect { flex: 0 0 24px; }
  &__actions { display: flex; justify-content: flex-end; align-items: flex-start; flex-wrap: wrap; gap: 5px; max-width: 160px; :deep(.sd-modern-button) { font-size: 12px; line-height: 20px; } }
  &__resent { max-width: 150px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; text-wrap: balance; }
  &__addresses { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; margin-block-start: 12px; font-size: 12px; line-height: 20px; p { margin-block: 4px 0; overflow-wrap: anywhere; } }
  &__edit-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; margin-block-start: 12px; }
  &--compact { grid-template-columns: 20px minmax(0,1fr) auto; gap: 8px; padding-block: 10px; border-block-start: 1px solid var(--sd-modern-border); .b-order-timeline-event__icon { grid-column: 1; grid-row: 1 / 3; width: 20px; height: 24px; border: 0; background: transparent; color: var(--sd-modern-muted); } .b-order-timeline-event__body { grid-column: 2; grid-row: 1; } .b-order-timeline-event__actions { grid-column: 3; grid-row: 1 / 3; } .b-order-timeline-event__time { grid-column: 2; grid-row: 2; flex-direction: row; flex-wrap: wrap; gap: 7px; } }
  @media(max-width: 600px) {
    grid-template-columns: 26px minmax(0,1fr); gap: 5px 10px;
    &__icon { grid-column: 1; grid-row: 1 / 4; width: 25px; height: 25px; margin-block-start: 2px; }
    &__body {grid-column: 2;grid-row: 1;}
    &__time {grid-column: 2;grid-row: 2;flex-direction: row;flex-wrap: wrap;gap: 7px; padding: 0; > span:first-child {font-size: 11px;} }
    &__actions {grid-column: 2;grid-row: 3;justify-content: flex-start;max-width: none;gap: 8px;}
    &__addresses {grid-template-columns: minmax(0,1fr);gap: 10px;}
    &--compact { grid-template-columns: 18px minmax(0,1fr); .b-order-timeline-event__body {grid-column:2;grid-row:1;} .b-order-timeline-event__time {grid-column:2;grid-row:2;} .b-order-timeline-event__actions {grid-column:2;grid-row:3;} }
  }
  @media(max-width: 600px), (pointer: coarse) { &__reference {min-height:44px;} &__actions :deep(.sd-modern-icon-button), &__actions :deep(.sd-modern-info-button) { width:44px; height:44px; min-width:44px; min-height:44px; } }
}
</style>
