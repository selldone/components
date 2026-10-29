<template>
  <div class="b-order-timeline-grouped text-start" :aria-busy="busy">
    <header class="sd-modern-header b-order-timeline-grouped__header">
      <div>
        <div class="b-order-timeline-grouped__context sd-modern-list-header"><img v-if="orderImage" :src="orderImage" alt="" width="16" height="18" /><span>{{ $t('global.commons.orders') }}</span><span>/</span><bdi>{{ getBasketOrderCode(order) }}</bdi></div>
        <h1 class="sd-modern-title-text b-order-timeline-grouped__title">{{ $t('global.commons.timeline') }}</h1>
        <div class="b-order-timeline-grouped__subtitle">
          <p class="sd-modern-subtitle">{{ $t('order_timeline.modern.subtitle') }}</p>
          <v-tooltip location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true" :open-on-click="true">
            <template #activator="{ props }"><v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('order_timeline.modern.about_timeline')"><v-icon size="15" aria-hidden="true">info_outline</v-icon></v-btn></template>
            {{ $t('order_timeline.modern.help') }}
          </v-tooltip>
        </div>
      </div>
      <v-btn class="sd-modern-button b-order-timeline-grouped__add" color="primary" variant="flat" :disabled="showAdd || busy || failed" @click="$emit('add-note')">
        <v-icon start size="18" aria-hidden="true">note_add</v-icon>{{ $t('global.commons.add_note') }}
      </v-btn>
    </header>

    <section class="sd-modern-widget b-order-timeline-grouped__widget" :aria-label="$t('order_timeline.modern.title')">
      <div class="b-order-timeline-grouped__toolbar">
        <v-btn-group class="b-order-timeline-grouped__filters" role="group" :aria-label="$t('order_timeline.modern.title')">
          <v-btn v-for="category in categories" :key="category" variant="text" :class="{ 'is-current': filter === category }" :aria-pressed="filter === category" @click="filter = category">
            {{ $t(`order_timeline.modern.filters.${category}`) }}
          </v-btn>
        </v-btn-group>
        <span class="b-order-timeline-grouped__sort"><v-icon size="15" aria-hidden="true">arrow_downward</v-icon>{{ $t('order_timeline.modern.latest_first') }}</span>
      </div>

      <div v-if="showAdd" class="b-order-timeline-grouped__composer"><slot name="composer" /></div>

      <div v-if="busy && !timelines.length" class="b-order-timeline-grouped__loading" role="status"><u-loading-ellipsis css-mode /></div>
      <div v-else-if="failed" class="sd-modern-notice b-order-timeline-grouped__error" role="alert">
        <v-icon size="20" aria-hidden="true">error_outline</v-icon><span>{{ $t('order_timeline.modern.load_error') }}</span>
        <v-btn class="sd-modern-button sd-modern-button--compact" variant="text" :disabled="busy" @click="$emit('retry')"><v-icon start size="16" aria-hidden="true">refresh</v-icon>{{ $t('order_timeline.modern.retry') }}</v-btn>
      </div>
      <template v-else>
        <div v-if="!sections.length" class="sd-modern-empty-state b-order-timeline-grouped__empty">
          <v-icon size="26" aria-hidden="true">{{ filter === 'note' ? 'edit_note' : 'history' }}</v-icon>
          <h2>{{ $t(filter === 'note' ? 'order_timeline.modern.empty_notes_title' : 'order_timeline.modern.empty_title') }}</h2>
          <p>{{ $t(filter === 'note' ? 'order_timeline.modern.empty_notes_message' : 'order_timeline.modern.empty_message') }}</p>
        </div>
        <section v-for="section in sections" :key="section.key" class="b-order-timeline-grouped__section" :class="{ 'b-order-timeline-grouped__section--pinned': section.pinned }">
          <h2 class="b-order-timeline-grouped__day">
            <v-icon v-if="section.pinned" size="15" aria-hidden="true">push_pin</v-icon>
            <span>{{ section.pinned ? $t('order_timeline.modern.pinned_notes') : section.date ? getLocalDateString(section.date) : $t('order_timeline.modern.unknown_date') }}</span>
            <span class="b-order-timeline-grouped__count">{{ $t('order_timeline.modern.event_count', { count: sectionCount(section) }) }}</span>
          </h2>
          <div v-for="row in section.rows" :key="row.key" class="b-order-timeline-grouped__row" :class="{ 'b-order-timeline-grouped__row--bundle': row.bundle }">
            <div v-if="row.bundle" class="b-order-timeline-grouped__bundle">
              <v-tooltip location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">
                <template #activator="{ props }"><time v-bind="props" class="b-order-timeline-grouped__bundle-time" :datetime="row.items[0].created_at"><span>{{ getLocalTimeOnlyString(row.items[0].created_at) }}</span><span>{{ getFromNowString(row.items[0].created_at) }}</span></time></template>
                {{ getLocalTimeString(row.items[0].created_at) }}
              </v-tooltip>
              <span class="b-order-timeline-grouped__bundle-icon"><v-icon size="16" aria-hidden="true">notifications_none</v-icon></span>
              <div class="b-order-timeline-grouped__bundle-main">
                <button type="button" class="b-order-timeline-grouped__bundle-toggle" :aria-expanded="isBundleOpen(row)" :aria-controls="bundleId(row)" @click="toggleBundle(row)">
                  <span>{{ $t(row.titleKey || 'order_timeline.modern.bundle_notifications') }}</span><span class="b-order-timeline-grouped__count">{{ $t('order_timeline.modern.event_count', { count: row.items.length }) }}</span><v-icon size="16" aria-hidden="true">{{ isBundleOpen(row) ? 'expand_less' : 'expand_more' }}</v-icon>
                </button>
                <span class="b-order-timeline-grouped__channels">{{ bundleChannels(row) }}</span>
              </div>
            </div>
            <div v-show="!row.bundle || isBundleOpen(row)" :id="row.bundle ? bundleId(row) : undefined" :class="{ 'b-order-timeline-grouped__bundle-items': row.bundle }">
              <b-order-timeline-event
                v-for="item in row.items"
                :key="item.id"
                :item="item"
                :shop="shop"
                :order="order"
                :order-type="orderType"
                :get-title="getTitle"
                :compact="row.bundle"
                :busy-edit="busyEdit"
                :busy-delete="busyDelete"
                :busy-resend="busyResend"
                @preview="$emit('preview', $event)"
                @resend="$emit('resend', $event)"
                @edit="$emit('edit', $event)"
                @save="$emit('save', $event)"
                @cancel-edit="$emit('cancel-edit', $event)"
                @pin="$emit('pin', $event)"
                @delete="$emit('delete', $event)"
              />
            </div>
          </div>
        </section>
        <footer class="sd-modern-table-footer b-order-timeline-grouped__footer"><span>{{ $t('order_timeline.modern.loaded_count', { count: visibleCount }) }}</span><span>{{ $t('order_timeline.modern.latest_activity') }}</span></footer>
      </template>
    </section>
  </div>
</template>

<script lang="ts">
import DateMixin from '../../../mixin/date/DateMixin.ts';
import ProductMixin from '../../../mixin/product/ProductMixin.ts';
import ULoadingEllipsis from '../../../ui/loading/ellipsis/ULoadingEllipsis.vue';
import BOrderTimelineEvent from './BOrderTimelineEvent.vue';
import { buildTimelineSections, getTimelineCategory } from './timelinePresentation.ts';

export default {
  name: 'BOrderTimelineGrouped',
  mixins: [DateMixin, ProductMixin],
  components: { BOrderTimelineEvent, ULoadingEllipsis },
  emits: ['add-note', 'preview', 'resend', 'edit', 'save', 'cancel-edit', 'pin', 'delete', 'retry'],
  props: {
    shop: {type:Object,required:true}, order: {type:Object,required:true}, timelines: {type:Array,default:()=>[]},
    orderType: String, getTitle: {type:Function,required:true}, busy:Boolean, failed:Boolean, showAdd:Boolean,
    busyEdit:{default:null}, busyDelete:{default:false}, busyResend:{default:null},
  },
  data() { return {filter:'all',expandedBundles:{}}; },
  computed: {
    categories() { return ['all','order','payment','message','note']; },
    sections() { return buildTimelineSections(this.timelines, this.filter); },
    visibleCount() { return this.timelines.filter(item=>this.filter==='all'||getTimelineCategory(item.type)===this.filter).length; },
    firstBundleKey() { return this.sections.flatMap(section=>section.rows).find(row=>row.bundle)?.key; },
    orderImage() { return this.getBasketTypeImage(this.order.type); },
  },
  watch: {
    'order.id'() { this.filter='all';this.expandedBundles={}; },
  },
  methods: {
    sectionCount(section) { return section.rows.reduce((count,row)=>count+row.items.length,0); },
    isBundleOpen(row) { return this.expandedBundles[row.key] ?? row.key===this.firstBundleKey; },
    toggleBundle(row) { this.expandedBundles[row.key]=!this.isBundleOpen(row); },
    bundleId(row) { return `order-timeline-${this.orderType}-${this.order.id}-${row.key}`; },
    bundleChannels(row) { return row.items.some(item=>String(item.type).startsWith('email-')) && row.items.some(item=>String(item.type).startsWith('sms-')) ? this.$t('order_timeline.modern.sms_email') : ''; },
  },
};
</script>

<style scoped lang="scss">
.b-order-timeline-grouped {
  min-width: 0; font-family: inherit; color: rgb(var(--v-theme-on-surface));
  &__header { align-items: center; gap:20px; margin-block-end:22px; }
  &__context { display:flex; align-items:center; gap:7px; margin-block-end:5px; img {object-fit:contain;} }
  &__title { margin:0; font-size:22px; line-height:29px; font-weight:500; letter-spacing:-.3px; }
  &__subtitle { display:flex; align-items:center; gap:6px; margin-block-start:4px; .sd-modern-subtitle {margin:0;font-size:12px;font-weight:400;line-height:20px;} }
  &__add { font-size:13px; font-weight:500; line-height:20px; }
  &__widget { padding:0; border-radius:15px; overflow:visible; }
  &__toolbar { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding:15px 20px; border-block-end:1px solid var(--sd-modern-border); }
  &__filters { display:flex; align-items:center; flex-wrap:wrap; gap:4px; max-width:100%; height:auto; padding:4px; overflow:visible; background:var(--sd-modern-inset); border-radius:10px !important;
    > .v-btn { flex:none; min-width:0; min-height:32px; height:auto; padding:6px 10px; border:0; border-radius:7px !important; background:transparent; color:var(--sd-modern-muted); font-family:inherit; font-size:12px; font-weight:400; line-height:20px; letter-spacing:0; text-transform:none; }
    > .v-btn.is-current {color:rgb(var(--v-theme-on-surface));background:rgb(var(--v-theme-surface));box-shadow:var(--sd-modern-selected-shadow);:deep(.v-btn__overlay){opacity:0;}}
    :deep(.v-btn__content){font-family:inherit;font-size:12px;font-weight:400;line-height:20px;letter-spacing:0;}
  }
  &__sort {display:inline-flex;align-items:center;gap:5px;color:var(--sd-modern-muted);font-size:11px;line-height:18px;white-space:nowrap;}
  &__composer {padding:20px;border-block-end:1px solid var(--sd-modern-border);}
  &__loading {display:grid;place-items:center;min-height:160px;}
  &__error {margin:20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:12px;line-height:20px;>span{flex:1;}}
  &__section {padding:0 20px 4px;&--pinned {padding-block-end:8px;border-block-end:1px solid var(--sd-modern-border);}}
  &__day {display:flex;align-items:center;gap:10px;margin:0;padding:21px 0 9px;font-size:12px;font-weight:500;line-height:20px;&:after{content:'';height:1px;background:var(--sd-modern-border);flex:1;margin-inline-start:5px;}}
  &__count {color:var(--sd-modern-muted);font-size:11px;font-weight:400;line-height:17px;}
  &__row {position:relative;&:not(:last-child):after{position:absolute;content:'';height:1px;inset-inline-start:124px;inset-inline-end:0;bottom:0;background:var(--sd-modern-border);}&+&:before{content:'';position:absolute;width:1px;inset-inline-start:98px;top:-7px;height:36px;background:var(--sd-modern-border);}}
  &__bundle {display:grid;grid-template-columns:72px 28px minmax(0,1fr);gap:12px;align-items:start;padding-block:14px;}
  &__bundle-time {display:flex;flex-direction:column;gap:2px;padding-block-start:2px;color:var(--sd-modern-muted);font-size:11px;line-height:17px;font-variant-numeric:tabular-nums;>span:first-child{color:rgb(var(--v-theme-on-surface));font-size:12px;}}
  &__bundle-icon {display:grid;place-items:center;width:28px;height:28px;border:1px solid var(--sd-modern-border);border-radius:50%;background:rgb(var(--v-theme-surface));color:var(--sd-modern-muted);position:relative;z-index:1;}
  &__bundle-main {min-width:0;}
  &__bundle-toggle {display:flex;align-items:center;gap:7px;flex-wrap:wrap;min-height:24px;padding:0;border:0;background:transparent;color:rgb(var(--v-theme-on-surface));font-family:inherit;font-size:13px;font-weight:500;line-height:20px;text-align:start;cursor:var(--cursor-interaction,pointer);}
  &__channels {display:block;margin-block-start:3px;color:var(--sd-modern-muted);font-size:12px;line-height:20px;}
  &__bundle-items {margin-inline-start:124px;padding-block-end:8px;}
  &__footer {padding:15px 20px;margin:0;font-size:11px;font-weight:400;line-height:18px;color:var(--sd-modern-muted);}
  &__empty {padding:50px 20px;h2{margin-block:12px 5px;font-size:13px;font-weight:500;line-height:22px;}p{margin:0;color:var(--sd-modern-muted);font-size:12px;line-height:20px;}}
  @media(max-width:600px) {
    &__header {align-items:flex-start;gap:14px;margin-block-end:18px;}
    &__title {font-size:21px;line-height:28px;}
    &__subtitle {align-items:flex-start;}
    &__toolbar {padding:12px;gap:9px;}
    &__filters {padding:0;gap:3px;background:transparent;> .v-btn{padding-inline:8px;}}
    &__sort {width:100%;}
    &__section {padding-inline:12px;}
    &__day {gap:7px;flex-wrap:wrap;}
    &__row {&:not(:last-child):after{inset-inline-start:36px;}&+&:before{inset-inline-start:12px;top:-8px;}}
    &__bundle {grid-template-columns:26px minmax(0,1fr);gap:5px 10px;}
    &__bundle-icon {grid-column:1;grid-row:1 / 3;width:25px;height:25px;margin-block-start:2px;}
    &__bundle-main {grid-column:2;grid-row:1;}
    &__bundle-time {grid-column:2;grid-row:2;flex-direction:row;flex-wrap:wrap;gap:7px;>span:first-child{font-size:11px;}}
    &__bundle-items {margin-inline-start:36px;}
    &__composer {padding:14px 12px;}
    &__footer {padding:13px 12px;gap:5px;}
  }
  @media(max-width:600px),(pointer:coarse) {&__filters>.v-btn{min-height:44px;}&__bundle-toggle{min-height:44px;}}
}
</style>
