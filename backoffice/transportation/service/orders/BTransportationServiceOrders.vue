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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    class="b-transportation-service-orders text-start"
    :class="{ 'b-transportation-service-orders--modern': modern }"
  >
    <u-loading-progress
      v-if="busy_fetch || busy_info_order"
    ></u-loading-progress>
    <div
      v-if="modern"
      class="sd-modern-list-toolbar b-transportation-service-orders__toolbar"
    >
      <span class="b-transportation-service-orders__secondary" role="status">
        {{
          busy_fetch || fetch_error
            ? "—"
            : $t("transportation_orders.records", { count: $n(totalItems) })
        }}
      </span>
      <div class="b-transportation-service-orders__sort">
        <label :for="sortControlId">{{ $t("transportation_orders.sort_by") }}</label>
        <select
          :id="sortControlId"
          :value="selectedSort"
          :disabled="busy_fetch"
          @change="setSort($event.target.value)"
        >
          <option
            v-for="choice in sortChoices"
            :key="choice.key"
            :value="choice.key"
          >
            {{ choice.title }}
          </option>
        </select>
        <v-tooltip
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
          :persistent="false"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="text"
              class="sd-modern-icon-button"
              :disabled="busy_fetch"
              :aria-label="
                $t(
                  sortBy[0]?.order === 'desc'
                    ? 'transportation_orders.sort_ascending'
                    : 'transportation_orders.sort_descending',
                )
              "
              @click="reverseSort()"
            >
              <v-icon>{{
                sortBy[0]?.order === "desc" ? "arrow_downward" : "arrow_upward"
              }}</v-icon>
            </v-btn>
          </template>
          {{
            $t(
              sortBy[0]?.order === "desc"
                ? "transportation_orders.sort_ascending"
                : "transportation_orders.sort_descending",
            )
          }}
        </v-tooltip>
      </div>
    </div>
    <div
      v-if="modern && fetch_error"
      class="sd-modern-notice b-transportation-service-orders__error"
      role="alert"
    >
      <v-icon aria-hidden="true">error_outline</v-icon>
      <span>{{ $t("transportation_orders.load_error") }}</span>
      <v-btn class="sd-modern-button" variant="outlined" @click="fetchOrders()">
        {{ $t("transportation_orders.retry") }}
      </v-btn>
    </div>

    <v-data-table-server
      :mobile="modern ? $vuetify.display.width <= 900 : $vuetify.display.xs"
      :page="page"
      v-model:sort-by="sortBy"
      v-model:expanded="expanded"
      :must-sort="modern"
      :hide-default-header="modern && $vuetify.display.width <= 900"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="transportation_orders"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :loading="modern && busy_fetch"
      class="bg-transparent"
      density="compact"
      hide-default-footer
      item-key="id"
      item-value="id"
      :class="{
        disabled: busy_fetch,
        'min-height-60vh': !modern,
        'sd-modern-data-table sd-modern-data-table--compact': modern,
      }"
    >
      <template v-slot:item.address="{ item }">
        <div
          class="b-transportation-service-orders__receiver text-start py-1"
          :class="{ 'min-width-200': !modern }"
        >
          <div v-if="getOrder(item).customer">
            <v-avatar :size="24" class="avatar-gradient -thin me-2">
              <v-img
                v-if="getOrder(item).customer.user_id"
                :src="getUserAvatar(getOrder(item).customer.user_id)"
              />
              <v-icon v-else>face</v-icon>
            </v-avatar>
            <b class="me-2">{{ getOrder(item).customer.name }}</b>
          </div>

          <div class="mt-1" :class="{ 'single-line max-w-200': !modern }">
            <flag
              :iso="getOrder(item).receiver_info?.country"
              :squared="false"
              class="me-1"
            />
            <span
              :class="
                modern
                  ? 'b-transportation-service-orders__secondary'
                  : 'text-subtitle-2'
              "
              :title="
                MapHelper.GenerateFullAddressFromMapInfo(
                  getOrder(item).receiver_info,
                )
              "
              >{{
                MapHelper.GenerateFullAddressFromMapInfo(
                  getOrder(item).receiver_info,
                )
              }}</span
            >
          </div>

          <div v-if="!modern && getOrder(item).receiver_info?.phone">
            <i class="fas fa-phone me-1"></i>
            <span class="text-subtitle-2" v-copy>{{
              getOrder(item).receiver_info.phone
            }}</span>

            <u-button-whatsapp
              class="ms-2"
              :shop="shop"
              :user="{
                phone: getOrder(item).receiver_info.phone,
                name: getOrder(item).customer?.name,
              }"
            ></u-button-whatsapp>
          </div>
          <div
            v-if="modern"
            class="b-transportation-service-orders__destination-actions"
          >
            <u-map-geo-button
              v-if="getOrder(item)?.receiver_info?.location"
              :location="getOrder(item).receiver_info.location"
              small
              text
              append-icon="north_east"
              rel="noopener"
              class="sd-modern-button sd-modern-button--inline"
            />
            <span
              v-if="item.distance"
              class="b-transportation-service-orders__secondary"
              ><bdi>{{ item.distance }} Km</bdi></span
            >
          </div>
        </div>
      </template>

      <template v-slot:item.receiver_info="{ item }">
        <div class="min-width-75">
          <u-map-geo-button
            v-if="getOrder(item)?.receiver_info?.location"
            :location="getOrder(item).receiver_info.location"
            small
            class="my-1"
            :class="{ 'sd-modern-button': modern }"
            :text="modern"
            :block="!modern"
          ></u-map-geo-button>

          <div v-if="item.track">
            <v-btn
              :href="item.track"
              :color="modern ? undefined : 'primary'"
              size="small"
              target="_blank"
              :title="modern ? undefined : 'Tracking page'"
              :variant="modern ? 'outlined' : 'flat'"
              class="my-1"
              :class="{ 'sd-modern-button': modern }"
              prepend-icon="gps_fixed"
              :append-icon="modern ? 'north_east' : undefined"
              :block="!modern"
              rounded="lg"
            >
              {{
                modern
                  ? $t("transportation_orders.tracking_link")
                  : "Tracking Link"
              }}
            </v-btn>
          </div>

          <div v-if="item.distance">
            <v-chip
              size="small"
              class="my-1"
              variant="text"
              prepend-icon="ramp_left"
            >
              {{ item.distance }} Km
            </v-chip>
          </div>
        </div>
      </template>

      <template v-slot:item.basket_id="{ item }">
        <div
          v-if="getOrder(item).items"
          class="d-flex align-center"
          :class="{ 'b-transportation-service-orders__order': modern }"
        >
          <products-dense-images-circles
            :ids="getProductsIDs(getOrder(item))"
            :max-count="modern ? 3 : 8"
            :size="modern ? 30 : 32"
            :big-scale="modern"
            border
          ></products-dense-images-circles>
          <v-spacer></v-spacer>
          <b-order-button-basket
            :order="getOrder(item)"
            class="mb-1"
            :class="{ 'sd-modern-button': modern }"
            :variant="modern ? 'text' : 'flat'"
            small
          ></b-order-button-basket>
        </div>
      </template>

      <template #item.fulfillment="{ item }">
        <div class="b-transportation-service-orders__stack">
          <div
            v-if="item.person"
            class="b-transportation-service-orders__identity"
          >
            <v-avatar
              size="26"
              class="hover-scale force-top avatar-gradient -thin -role"
            >
              <v-img :src="getUserAvatar(item.person.user_id)" />
            </v-avatar>
            <span>{{ $t("transportation_orders.courier") }}</span>
          </div>
          <span v-else class="b-transportation-service-orders__secondary">{{
            $t("transportation_orders.not_assigned")
          }}</span>
          <div
            v-if="item.service"
            class="b-transportation-service-orders__identity"
          >
            <v-avatar size="26" class="hover-scale force-top" rounded="lg">
              <v-img
                :src="
                  DeliveryServiceHelper.GetDeliveryServiceIconById(
                    item.service.service_id,
                  )
                "
              />
            </v-avatar>
            <div>
              <span>{{
                item.rate?.provider || $t("transportation_orders.delivery_service")
              }}</span>
              <span
                class="b-transportation-service-orders__secondary d-block"
                >{{
                  $t(
                    item.service.livemode
                      ? "global.commons.live"
                      : "global.commons.debug",
                  )
                }}</span
              >
            </div>
          </div>
        </div>
      </template>

      <template v-slot:item.person_id="{ item }">
        <div v-if="item.person" class="min-width-75">
          <v-avatar
            :size="38"
            class="hover-scale force-top avatar-gradient -thin -role"
          >
            <v-img :src="getUserAvatar(item.person.user_id)" />
          </v-avatar>
        </div>
      </template>

      <template v-slot:item.service_id="{ item }">
        <div v-if="item.service" class="d-flex flex-column align-center">
          <v-avatar :size="38" class="hover-scale force-top" tile>
            <v-img
              :src="
                DeliveryServiceHelper.GetDeliveryServiceIconById(
                  item.service.service_id,
                )
              "
            />
          </v-avatar>
          <span
            v-if="modern"
            class="sd-modern-status sd-modern-status--plain mt-1"
          >
            <span
              class="sd-modern-status__dot"
              :class="{ 'bg-success': item.service.livemode }"
            ></span>
            {{
              $t(
                item.service.livemode
                  ? "global.commons.live"
                  : "global.commons.debug",
              )
            }}
          </span>
          <v-chip
            v-else-if="!item.service.livemode"
            class="my-1"
            color="amber"
            size="x-small"
            variant="flat"
          >
            {{ $t("global.commons.debug") }}
          </v-chip>
          <v-chip
            v-else
            class="my-1"
            color="success"
            size="x-small"
            variant="flat"
          >
            {{ $t("global.commons.live") }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.delivery_price="{ item }">
        <div
          class="b-transportation-service-orders__price py-1 text-start"
          :class="{ 'min-width-200': !modern }"
        >
          <div
            v-if="getOrder(item)?.delivery_price > 0"
            :class="{ 'min-width-100': !modern }"
          >
            <small v-if="!modern"
              >{{ $t("global.commons.shipping_cost") }}:
            </small>
            <u-price
              :amount="getOrder(item).delivery_price"
              :currency="getOrder(item).currency"
            ></u-price>
          </div>
          <div v-else-if="getOrder(item).delivery_price === 0">
            <span
              v-if="modern"
              class="sd-modern-status sd-modern-status--plain"
            >
              {{ $t("global.commons.free") }}
            </span>
            <v-chip v-else size="x-small" color="cyan"
              >{{ $t("global.commons.free") }}
            </v-chip>
          </div>
          <div v-else-if="getOrder(item).delivery_price === -1">
            <span
              v-if="modern"
              class="sd-modern-status sd-modern-status--plain"
            >
              {{ $t("transportation_orders.shipping_paid_destination") }}
            </span>
            <v-chip v-else size="x-small" color="#E91E63"
              >{{ $t("global.commons.sod") }}
            </v-chip>
          </div>

          <div v-if="getOrder(item).tax_shipping">
            <small>{{ $t("global.commons.shipping_tax") }}: </small>
            <u-price
              :amount="getOrder(item).tax_shipping"
              :currency="getOrder(item).currency"
            ></u-price>
          </div>

          <hr v-if="!modern && (item.rate || item.amount)" class="my-1" />
          <b-transportation-service-rate
            v-if="!modern && item.rate"
            :rate="item.rate"
            class="b-transportation-service-orders__rate"
          ></b-transportation-service-rate>

          <u-price
            v-else-if="!modern && item.amount"
            :amount="item.amount"
            :currency="item.currency"
          ></u-price>
        </div>
      </template>

      <template v-slot:item.send_at="{ item }">
        <v-tooltip
          v-if="modern && item.send_at"
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
          :persistent="false"
        >
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="b-transportation-service-orders__date-button"
              :aria-label="
                $t('global.commons.send_date') +
                ' · ' +
                getLocalTimeString(item.send_at)
              "
              @click="toggleDetails(item)"
            >
              <time :datetime="item.send_at">{{
                shortShippingDate(item.send_at)
              }}</time>
              <span
                class="b-transportation-service-orders__secondary d-block"
                >{{ shortShippingTime(item.send_at) }}</span
              >
            </button>
          </template>
          {{ getFromNowString(item.send_at) }} ·
          {{ getLocalTimeString(item.send_at) }}
        </v-tooltip>
        <div
          v-else-if="item.send_at"
          class="b-transportation-service-orders__date"
          :class="{ 'min-width-200': !modern }"
        >
          <small>{{ $t("global.commons.send_date") }}:</small>
          {{ getFromNowString(item.send_at) }}<br />
          <small>{{ getLocalTimeString(item.send_at) }}</small>
        </div>
      </template>

      <template v-slot:item.label="{ item }">
        <v-tooltip
          v-if="modern && item.label"
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
          :persistent="false"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :href="item.label"
              icon
              target="_blank"
              variant="text"
              class="sd-modern-icon-button"
              :aria-label="$t('transportation_orders.download_label')"
            >
              <v-icon>download</v-icon>
            </v-btn>
          </template>
          {{ $t("transportation_orders.download_label") }}
        </v-tooltip>
        <v-btn
          v-else-if="item.label"
          :href="item.label"
          icon
          target="_blank"
          variant="text"
        >
          <v-icon>download</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.status="{ item }">
        <div
          class="b-transportation-service-orders__status"
          :class="{ 'min-width-200': !modern }"
        >
          <div
            v-if="item.status === 'PENDING'"
            class="d-flex align-items-center"
          >
            <v-menu v-if="!modern || writeShopAccess(ShopPermissionRegions.LOGISTIC.code)">
              <template v-slot:activator="{ props }">
                <v-btn
                  :loading="busy_transportation === item"
                  class="me-2"
                  :color="modern ? undefined : 'primary'"
                  :variant="modern ? 'outlined' : undefined"
                  :aria-label="modern ? $t('global.actions.change_state') + ' · ' + $t('global.commons.pending') : undefined"
                  v-bind="props"
                  :class="{
                    'sd-modern-button': modern,
                    disabled: !writeShopAccess(
                      ShopPermissionRegions.LOGISTIC.code,
                    ),
                  }"
                >
                  <template v-if="modern"
                    ><span class="sd-modern-status__dot bg-primary"></span
                    >{{ $t("global.commons.pending") }}</template
                  >
                  <template v-else>{{
                    $t("global.actions.change_state")
                  }}</template>

                  <v-divider v-if="!modern" class="mx-2" vertical></v-divider>
                  <v-icon size="small">expand_more</v-icon>
                </v-btn>
              </template>
              <v-list
                class="text-start"
                :class="{
                  'b-transportation-service-orders__status-menu': modern,
                }"
              >
                <v-list-item
                  @click="updateTransportationOrderStatus(item, 'DELIVERED')"
                >
                  <template v-slot:prepend>
                    <v-icon color="green">check</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t("global.commons.delivered") }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item
                  @click="updateTransportationOrderStatus(item, 'RETURNED')"
                >
                  <template v-slot:prepend>
                    <v-icon color="amber">keyboard_return</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t("global.commons.returned") }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item
                  @click="updateTransportationOrderStatus(item, 'CANCELED')"
                >
                  <template v-slot:prepend>
                    <v-icon color="red">close</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t("global.commons.canceled") }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <span v-else class="sd-modern-status sd-modern-status--plain">
              <span class="sd-modern-status__dot bg-primary"></span>{{ $t('global.commons.pending') }}
            </span>

            <delivery-service-fulfilled-button
              v-if="service"
              :deliveryService="service"
              :transportation-order="item"
              has-refresh
              @refresh="getOrderInfo(item)"
            >
            </delivery-service-fulfilled-button>
          </div>

          <div v-else-if="item.status === 'DELIVERED'">
            <v-icon class="me-1" color="success" :size="modern ? 7 : 'small'"
              >fiber_manual_record
            </v-icon>
            {{ $t("global.commons.delivered") }}

            <div v-if="!modern && item.deliver_at">
              <small>{{ $t("global.commons.deliver_date") }}:</small>
              {{ getFromNowString(item.deliver_at) }}<br />
              <small>{{ getLocalTimeString(item.deliver_at) }}</small>
            </div>
          </div>
          <div v-else-if="item.status === 'RETURNED'">
            <v-icon class="me-1" color="amber" :size="modern ? 7 : 'small'"
              >fiber_manual_record
            </v-icon>

            {{ $t("global.commons.returned") }}

            <div v-if="!modern && item.return_at">
              <small>{{ $t("global.commons.return_date") }}:</small>
              {{ getFromNowString(item.return_at) }}<br />
              <small>{{ getLocalTimeString(item.return_at) }}</small>
            </div>
          </div>
          <div v-else-if="item.status === 'CANCELED'">
            <v-icon class="me-1" color="red" :size="modern ? 7 : 'small'"
              >fiber_manual_record
            </v-icon>

            {{ $t("global.commons.canceled") }}
          </div>

          <div
            v-if="modern && (item.deliver_at || item.return_at)"
            class="b-transportation-service-orders__secondary"
          >
            {{
              shortShippingDate(
                item.status === "RETURNED" ? item.return_at : item.deliver_at,
              )
            }}
          </div>
          <div
            v-if="modern && item.payment_at"
            class="b-transportation-service-orders__payment b-transportation-service-orders__secondary"
          >
            <v-icon size="14" aria-hidden="true">payments</v-icon
            >{{ $t("transportation_orders.payment_recorded") }}
          </div>
          <div v-if="!modern && item.payment_at">
            <img
              class="me-1"
              height="24"
              src="../../../../assets/icons/pos.svg"
              width="24"
            />

            {{ $t("global.commons.payment") }}

            <div>
              <small>{{ $t("global.commons.payment_date") }}:</small>
              {{ getFromNowString(item.payment_at) }}<br />
              <small>{{ getLocalTimeString(item.payment_at) }}</small>
            </div>
          </div>
          <div
            v-if="modern"
            class="b-transportation-service-orders__row-actions"
          >
            <v-btn
              :id="detailsId(item) + '-button'"
              variant="outlined"
              class="sd-modern-button"
              :aria-expanded="expanded.includes(item.id)"
              :aria-controls="
                expanded.includes(item.id) ? detailsId(item) : undefined
              "
              :append-icon="
                expanded.includes(item.id) ? 'expand_less' : 'expand_more'
              "
              @click="toggleDetails(item)"
              >{{ $t("transportation_orders.details") }}</v-btn
            >
            <v-tooltip
              v-if="item.label"
              location="top"
              content-class="sd-modern-tooltip text-start"
              :open-on-focus="true"
              :persistent="false"
            >
              <template #activator="{ props }"
                ><v-btn
                  v-bind="props"
                  :href="item.label"
                  target="_blank"
                  rel="noopener"
                  icon
                  variant="text"
                  class="sd-modern-icon-button"
                  :aria-label="$t('transportation_orders.download_label')"
                  ><v-icon>download</v-icon></v-btn
                ></template
              >
              {{ $t("transportation_orders.download_label") }}
            </v-tooltip>
          </div>
        </div>
      </template>

      <template v-if="modern" #expanded-row="{ columns, item }">
        <tr class="b-transportation-service-orders__details-row">
          <td :colspan="columns.length">
            <div
              :id="detailsId(item)"
              class="b-transportation-service-orders__details"
              role="region"
              :aria-labelledby="detailsId(item) + '-button'"
            >
              <section>
                <h2 class="sd-modern-eyebrow">
                  {{ $t("transportation_orders.destination_contact") }}
                </h2>
                <p v-if="getOrder(item).customer">
                  {{ getOrder(item).customer.name }}
                </p>
                <p>
                  <flag
                    :iso="getOrder(item).receiver_info?.country"
                    :squared="false"
                    class="me-1"
                  />{{
                    MapHelper.GenerateFullAddressFromMapInfo(
                      getOrder(item).receiver_info,
                    )
                  }}
                </p>
                <div
                  v-if="getOrder(item).receiver_info?.phone"
                  class="b-transportation-service-orders__phone"
                >
                  <button
                    v-copy="getOrder(item).receiver_info.phone"
                    type="button"
                    class="b-transportation-service-orders__copy"
                    :aria-label="
                      $t('global.actions.copy') +
                      ' · ' +
                      getOrder(item).receiver_info.phone
                    "
                  >
                    <v-icon size="14" class="me-1" aria-hidden="true"
                      >content_copy</v-icon
                    ><bdi>{{ getOrder(item).receiver_info.phone }}</bdi>
                  </button>
                  <u-button-whatsapp
                    :shop="shop"
                    modern
                    :user="{
                      phone: getOrder(item).receiver_info.phone,
                      name: getOrder(item).customer?.name,
                    }"
                  />
                </div>
                <div class="b-transportation-service-orders__detail-actions">
                  <u-map-geo-button
                    v-if="getOrder(item)?.receiver_info?.location"
                    :location="getOrder(item).receiver_info.location"
                    small
                    text
                    append-icon="north_east"
                    rel="noopener"
                    class="sd-modern-button"
                  />
                  <v-btn
                    v-if="item.track"
                    :href="item.track"
                    target="_blank"
                    rel="noopener"
                    variant="outlined"
                    class="sd-modern-button"
                    append-icon="north_east"
                    >{{ $t("transportation_orders.tracking_link") }}</v-btn
                  >
                </div>
                <p
                  v-if="item.distance"
                  class="b-transportation-service-orders__secondary"
                >
                  {{ $t("transportation_orders.distance_warehouse") }} ·
                  <bdi>{{ item.distance }} Km</bdi>
                </p>
              </section>
              <section>
                <h2 class="sd-modern-eyebrow">
                  {{ $t("transportation_orders.fulfillment") }}
                </h2>
                <dl class="b-transportation-service-orders__facts">
                  <template v-if="item.send_at"
                    ><dt>{{ $t("global.commons.send_date") }}</dt>
                    <dd>
                      {{ getLocalTimeString(item.send_at)
                      }}<small>{{ getFromNowString(item.send_at) }}</small>
                    </dd></template
                  >
                  <template v-if="item.deliver_at"
                    ><dt>{{ $t("global.commons.deliver_date") }}</dt>
                    <dd>
                      {{ getLocalTimeString(item.deliver_at)
                      }}<small>{{ getFromNowString(item.deliver_at) }}</small>
                    </dd></template
                  >
                  <template v-if="item.return_at"
                    ><dt>{{ $t("global.commons.return_date") }}</dt>
                    <dd>
                      {{ getLocalTimeString(item.return_at)
                      }}<small>{{ getFromNowString(item.return_at) }}</small>
                    </dd></template
                  >
                  <template v-if="item.payment_at"
                    ><dt>{{ $t("global.commons.payment_date") }}</dt>
                    <dd>
                      {{ getLocalTimeString(item.payment_at)
                      }}<small>{{ getFromNowString(item.payment_at) }}</small>
                    </dd></template
                  >
                </dl>
                <div class="b-transportation-service-orders__detail-actions">
                  <v-btn
                    v-if="item.label"
                    :href="item.label"
                    target="_blank"
                    rel="noopener"
                    variant="outlined"
                    class="sd-modern-button"
                    prepend-icon="download"
                    append-icon="north_east"
                    >{{ $t("transportation_orders.download_label") }}</v-btn
                  >
                  <b-order-button-basket
                    v-if="getOrder(item).items"
                    :order="getOrder(item)"
                    class="sd-modern-button"
                    variant="outlined"
                    small
                  />
                </div>
                <products-dense-images-circles
                  v-if="getOrder(item).items"
                  :ids="getProductsIDs(getOrder(item))"
                  border
                  big-scale
                  :size="30"
                />
              </section>
              <section>
                <h2 class="sd-modern-eyebrow">
                  {{ $t("transportation_orders.shipping_charges") }}
                </h2>
                <dl class="b-transportation-service-orders__facts">
                  <dt>{{ $t("global.commons.shipping_cost") }}</dt>
                  <dd>
                    <u-price
                      v-if="getOrder(item).delivery_price > 0"
                      :amount="getOrder(item).delivery_price"
                      :currency="getOrder(item).currency"
                    /><span v-else-if="getOrder(item).delivery_price === 0">{{
                      $t("global.commons.free")
                    }}</span
                    ><span v-else-if="getOrder(item).delivery_price === -1">{{
                      $t("transportation_orders.shipping_paid_destination")
                    }}</span>
                  </dd>
                  <template v-if="getOrder(item).tax_shipping"
                    ><dt>{{ $t("global.commons.shipping_tax") }}</dt>
                    <dd>
                      <u-price
                        :amount="getOrder(item).tax_shipping"
                        :currency="getOrder(item).currency"
                      /></dd
                  ></template>
                </dl>
                <div
                  v-if="item.rate"
                  class="b-transportation-service-orders__detail-rate"
                >
                  <p class="b-transportation-service-orders__secondary">
                    {{ $t("transportation_orders.provider_rate") }}
                  </p>
                  <b-transportation-service-rate :rate="item.rate" />
                </div>
                <div
                  v-else-if="item.amount"
                  class="b-transportation-service-orders__detail-rate"
                >
                  <p class="b-transportation-service-orders__secondary">
                    {{ $t("transportation_orders.shipment_amount") }}
                  </p>
                  <u-price :amount="item.amount" :currency="item.currency" />
                </div>
              </section>
            </div>
          </td>
        </tr>
      </template>

      <template v-if="modern" #no-data>
        <div
          v-if="!busy_fetch && !fetch_error"
          class="sd-modern-empty-state"
          role="status"
        >
          <v-icon aria-hidden="true">local_mall</v-icon>
          <p>{{ $t("transportation_orders.empty") }}</p>
        </div>
      </template>
      <template v-slot:bottom>
        <div
          v-if="modern && !fetch_error"
          class="sd-modern-table-footer b-transportation-service-orders__footer"
        >
          <span class="sd-modern-page-summary">
            {{ $t("global.commons.page") }}
            <bdi>{{ $n(pageCount ? page : 0) }} / {{ $n(pageCount) }}</bdi>
          </span>
          <v-pagination
            v-model="page"
            :length="pageCount"
            :disabled="busy_fetch"
            class="sd-modern-pagination"
          />
        </div>
        <v-pagination
          v-else-if="!modern"
          v-model="page"
          :length="pageCount"
          rounded
        />
      </template>
    </v-data-table-server>
  </div>
</template>
<script lang="ts">
import BOrderButtonBasket from "../../../order/button/basket/BOrderButtonBasket.vue";
import DeliveryServiceFulfilledButton from "../../../transportation/DeliveryServiceFulfilledButton.vue";
import UButtonWhatsapp from "../../../../ui/button/whatsapp/UButtonWhatsapp.vue";
import ProductsDenseImagesCircles from "../../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import BTransportationServiceRate from "../../../transportation/service/rate/BTransportationServiceRate.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import UMapGeoButton from "@selldone/components-vue/ui/map/geo-button/UMapGeoButton.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import MapMixin from "@selldone/components-vue/mixin/map/MapMixin.ts";
import { DeliveryServiceHelper, MapHelper } from "@selldone/core-js/helper";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { useId } from "vue";

export default {
  name: "BTransportationServiceOrders",
  mixins: [DateMixin, MapMixin],
  components: {
    UMapGeoButton,
    BTransportationServiceRate,
    ProductsDenseImagesCircles,
    UButtonWhatsapp,
    DeliveryServiceFulfilledButton,
    BOrderButtonBasket,
  },

  props: {
    modern: Boolean,
    shop: {
      require: true,
      type: Object,
    },

    service: {
      require: false,
    },
    transportation: {
      require: true,
    },
    person: {
      require: false,
    },
  },
  setup() {
    return { sortControlId: `transportation-orders-sort-${useId()}` };
  },
  data() {
    return {
      transportation_orders: [],

      busy_fetch: false,
      fetch_error: false,

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},
      sortBy: [{ key: this.modern ? "send_at" : null, order: "desc" }],
      expanded: [],

      //------------
      busy_transportation: null,

      busy_info_order: false,
    };
  },
  computed: {
    MapHelper() {
      return MapHelper;
    },
    DeliveryServiceHelper() {
      return DeliveryServiceHelper;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    ShopPermissionRegions() {
      return ShopPermissionRegions;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    selectedSort() {
      return this.sortBy[0]?.key || "send_at";
    },
    sortChoices() {
      return [
        { key: "basket_id", title: this.$t("global.sort.order") },
        ...(!this.service && !this.person
          ? [
              {
                key: "person_id",
                title: this.$t("transportation_orders.courier"),
              },
              {
                key: "service_id",
                title: this.$t("transportation_orders.delivery_service"),
              },
            ]
          : []),
        { key: "send_at", title: this.$t("global.commons.send_date") },
        { key: "status", title: this.$t("global.commons.status") },
      ];
    },
    headers() {
      if (this.modern) {
        return [
          {
            title: this.$t("global.sort.order"),
            align: "start",
            sortable: true,
            value: "basket_id",
            width: "15%",
          },
          {
            title: this.$t("transportation_orders.recipient_destination"),
            align: "start",
            sortable: false,
            value: "address",
            width: "25%",
          },
          ...(!this.service && !this.person
            ? [
                {
                  title: this.$t("transportation_orders.fulfillment"),
                  align: "start",
                  sortable: false,
                  value: "fulfillment",
                  width: "17%",
                },
              ]
            : []),
          {
            title: this.$t("global.commons.shipping"),
            align: "start",
            sortable: false,
            value: "delivery_price",
            width: "15%",
          },
          {
            title: this.$t("transportation_orders.shipped"),
            align: "start",
            sortable: true,
            value: "send_at",
            width: "12%",
          },
          {
            title: this.$t("transportation_orders.status_actions"),
            align: "start",
            sortable: true,
            value: "status",
            width: "16%",
          },
        ];
      }
      return [
        {
          title: this.$t("global.commons.address"),
          align: "start",
          sortable: false,
          value: "address",
        },

        {
          title: this.$t("global.commons.location"),
          align: "center",
          sortable: false,
          value: "receiver_info",
        },

        {
          title: this.$t("global.sort.order"),
          align: "center",
          sortable: true,
          value: "basket_id",
        },
        ...(!this.service && !this.person // Not needed show these rows on service or person orders list!
          ? [
              {
                title: this.$t("global.sort.delivery_person"),
                align: "center",
                sortable: true,
                value: "person_id",
              },
              {
                title: this.$t("global.sort.delivery_service"),
                align: "center",
                sortable: true,
                value: "service_id",
              },
            ]
          : []),

        {
          title: this.$t("global.commons.shipping"),
          align: "center",
          sortable: false,
          value: "delivery_price",
        },

        {
          title: this.$t("global.sort.date"),
          align: "start",
          sortable: true,
          value: "send_at",
        },
        {
          title: this.$t("global.commons.label"),
          align: "center",
          value: "label",
          sortable: false,
        },

        {
          title: this.$t("global.commons.status"),
          align: "start",
          sortable: true,
          value: "status",
        },
      ];
    },
  },

  watch: {
    sortBy() {
      if (this.modern && this.page !== 1) {
        this.page = 1;
        return;
      }
      this.fetchOrders();
    },
    page() {
      this.fetchOrders();
    },
  },

  mounted() {},
  created() {
    this.fetchOrders();
  },

  methods: {
    setSort(key) {
      if (!this.sortChoices.some((choice) => choice.key === key)) return;
      this.sortBy = [{ key, order: this.sortBy[0]?.order || "desc" }];
    },
    reverseSort() {
      this.sortBy = [
        {
          key: this.selectedSort,
          order: this.sortBy[0]?.order === "desc" ? "asc" : "desc",
        },
      ];
    },
    detailsId(item) {
      return `${this.sortControlId}-details-${item.id}`;
    },
    toggleDetails(item) {
      this.expanded = this.expanded.includes(item.id)
        ? this.expanded.filter((id) => id !== item.id)
        : [...this.expanded, item.id];
    },
    shortShippingDate(value) {
      if (!value) return "";
      return new Date(value).toLocaleDateString(this.$i18n.locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    shortShippingTime(value) {
      if (!value) return "";
      return new Date(value).toLocaleTimeString(this.$i18n.locale, {
        hour: "numeric",
        minute: "2-digit",
      });
    },
    /**
     * Return order
     * In vendor panel it return vendor_order and in shop it return basket
     * @param item
     */
    getOrder(item) {
      const out = this.IS_VENDOR_PANEL ? item.vendor_order : item.basket;
      return out ? out : {};
    },
    //――――――――――――――――――――――― Fetch transportation orders ―――――――――――――――――――――――

    fetchOrders() {
      this.busy_fetch = true;
      this.fetch_error = false;
      if (this.modern) this.expanded = [];

      axios
        .get(
          this.IS_VENDOR_PANEL
            ? window.VAPI.GET_MY_VENDOR_TRANSPORTATION_ORDERS(
                this.$route.params.vendor_id,
              )
            : window.API.GET_SHOP_TRANSPORTATION_ORDERS(this.shop.id),

          {
            params: {
              transportation_id: this.transportation.id,
              service_id: this.service ? this.service.id : null,
              person_id: this.person ? this.person.id : null,

              offset: (this.page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              sortBy: this.sortBy[0]?.key,
              sortDesc: this.sortBy[0]?.order === "desc",
            },
          },
        )
        .then(({ data }) => {
          this.totalItems = data.total;
          this.transportation_orders = data.transportation_orders;
        })
        .catch((error) => {
          this.fetch_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    //――――――――――――――――――――――― Update transportation status ―――――――――――――――――――――――

    updateTransportationOrderStatus(transportation_order, status) {
      if (
        this.modern &&
        (!this.writeShopAccess(ShopPermissionRegions.LOGISTIC.code) ||
          transportation_order.status !== "PENDING")
      )
        return;
      NotificationService.openDangerAlert(
        this.modern
          ? this.$t("delivery_person.status_dialog.title", {
              status: this.$t(`global.commons.${status.toLowerCase()}`),
            })
          : status,
        this.modern
          ? this.$t("delivery_person.status_dialog.message", {
              status: this.$t(`global.commons.${status.toLowerCase()}`),
            })
          : `Are you sure to change the delivery state to ${status}?`,
        this.modern
          ? this.$t("delivery_person.status_dialog.action")
          : "Yes, Set it!",
        () => {
          if (
            this.modern &&
            (!this.writeShopAccess(ShopPermissionRegions.LOGISTIC.code) ||
              transportation_order.status !== "PENDING")
          )
            return;
          this.busy_transportation = transportation_order;
          axios
            .post(
              this.IS_VENDOR_PANEL
                ? window.VAPI.POST_MY_VENDOR_TRANSPORTATION_ORDER_STATUS(
                    this.$route.params.vendor_id,
                    transportation_order.transportation_id,
                    transportation_order.id,
                  )
                : window.API.POST_TRANSPORTATION_ORDER_STATUS(
                    this.shop.id,
                    transportation_order.transportation_id,
                    transportation_order.id,
                  ),
              {
                status: status,
              },
            )
            .then(({ data }) => {
              if (data.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
              } else {
                NotificationService.showSuccessAlert(
                  null,
                  this.$t("transportation_orders.notifications.success_update"),
                );
                transportation_order.status = data.status;
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy_transportation = null;
            });
        },
      );
    },

    // ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Get Order Info ⬬⬬⬬⬬⬬⬬⬬⬬⬬
    getOrderInfo(transportation_order) {
      this.busy_info_order = true;

      axios
        .get(
          this.IS_VENDOR_PANEL
            ? window.VAPI.GET_MY_VENDOR_DELIVERY_SERVICE_ORDER_INFO(
                transportation_order.vendor_id,
                transportation_order.transportation_id,
                transportation_order.service.id,
                transportation_order.uid,
              )
            : window.API.GET_DELIVERY_SERVICE_ORDER_INFO(
                transportation_order.shop_id,
                transportation_order.transportation_id,
                transportation_order.service.id,
                transportation_order.uid,
              ),
        )
        .then(({ data }) => {
          if (!data.error) {
            if (data.changed) {
              this.fetchOrders();
            }
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_info_order = false;
        });
    },

    getProductsIDs(basket) {
      //console.log('basket',basket)
      const out = [];
      basket.items.forEach((item) => {
        if (!out.includes("" + item.product_id)) out.push("" + item.product_id);
      });

      return out;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-transportation-service-orders--modern {
  min-width: 0;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;

  .sd-modern-button {
    --v-btn-height: 36px;
    min-height: 36px;
    padding: 7px 12px;
    font-size: 12px;
  }

  .b-transportation-service-orders__receiver {
    width: 100%;
    overflow-wrap: anywhere;

    b {
      font-size: 12px;
      font-weight: 500;
    }
  }

  .b-transportation-service-orders__secondary,
  small {
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.5;
  }

  .b-transportation-service-orders__phone {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-block-start: 4px;
  }

  .b-transportation-service-orders__copy {
    padding: 4px 0;
    color: inherit;
    font: inherit;
    background: transparent;
    border: 0;
    text-align: start;
  }

  .b-transportation-service-orders__order {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 4px;
    min-width: 0;

    :deep(.circles-container) {
      max-width: 100%;
      padding: 2px 0 !important;
    }

    :deep(.sd-modern-button) {
      padding-inline: 0;
      min-height: 28px;
      height: auto;
      max-width: 100%;
    }
  }

  .b-transportation-service-orders__price {
    min-width: 0;
    max-width: 100%;
    overflow-wrap: anywhere;

    :deep(.u--price) {
      font-size: 12px;
      font-weight: 400;
    }
  }

  .b-transportation-service-orders__rate :deep(b) {
    font-size: 12px;
    font-weight: 500;
  }

  .b-transportation-service-orders__date {
    min-width: 0;
  }

  .b-transportation-service-orders__status {
    min-width: 0;
    display: grid;
    justify-items: start;
    gap: 4px;

    > div {
      max-width: 100%;
    }

    .v-divider {
      display: none;
    }

    .sd-modern-status__dot {
      margin-inline-end: 6px;
    }
  }

  .b-transportation-service-orders__footer {
    padding: 12px 17px;
  }

  .b-transportation-service-orders__error {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin: 18px;
  }

  .b-transportation-service-orders__toolbar {
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 12px 17px;
  }

  .b-transportation-service-orders__sort {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    font-size: 13px;

    label {
      color: var(--sd-modern-muted);
    }

    select {
      min-height: 36px;
      max-width: 160px;
      padding-inline: 0 8px;
      font: inherit;
      color: inherit;
      background: transparent;
      border: 0;
      appearance: auto;
    }

    option {
      background: rgb(var(--v-theme-surface));
      color: rgb(var(--v-theme-on-surface));
    }
  }

  .b-transportation-service-orders__stack {
    display: grid;
    gap: 8px;
    min-width: 0;
  }

  .b-transportation-service-orders__identity,
  .b-transportation-service-orders__payment {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .b-transportation-service-orders__destination-actions,
  .b-transportation-service-orders__row-actions,
  .b-transportation-service-orders__detail-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    min-width: 0;
    margin-block-start: 5px;
  }

  .b-transportation-service-orders__receiver > .mt-1 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .b-transportation-service-orders__date-button {
    padding: 0;
    color: inherit;
    font: inherit;
    text-align: start;
    font-variant-numeric: tabular-nums;
    background: transparent;
    border: 0;
  }

  .b-transportation-service-orders__details-row > td {
    padding: 0 !important;
  }

  .b-transportation-service-orders__details {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 22px;
    padding: 19px 17px;
    background: var(--sd-modern-inset);
    overflow-wrap: anywhere;

    > section {
      min-width: 0;
    }

    > section + section {
      border-inline-start: 1px solid var(--sd-modern-border);
      padding-inline-start: 22px;
    }

    p {
      margin-block-end: 7px;
    }

    .sd-modern-eyebrow {
      margin-block-end: 10px;
    }
  }

  .b-transportation-service-orders__facts {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.3fr);
    gap: 8px 12px;
    margin: 0;

    dt {
      color: var(--sd-modern-muted);
      font-size: 11px;
    }

    dd {
      margin: 0;
      text-align: end;
      font-variant-numeric: tabular-nums;
    }

    small {
      display: block;
    }
  }

  .b-transportation-service-orders__detail-rate {
    margin-block-start: 15px;

    :deep(b) {
      font-size: 12px;
      font-weight: 500;
    }

    :deep(.u--price) {
      font-size: 12px;
      font-weight: 400;
    }
  }

  :deep(.v-table__wrapper > table) {
    table-layout: fixed;
    width: 100%;

    > tbody > tr > td {
      padding-inline: 13px;
      vertical-align: top;
      overflow-wrap: anywhere;
    }

    > thead > tr > th {
      padding-inline: 13px;
    }
  }

  :deep(.v-data-table__tr--mobile) {
    .b-transportation-service-orders__receiver,
    .b-transportation-service-orders__price,
    .b-transportation-service-orders__order,
    .b-transportation-service-orders__date,
    .b-transportation-service-orders__status {
      min-width: 0;
      width: auto;
      max-width: 100%;
    }

    .sd-modern-button {
      max-inline-size: 100%;

      .v-btn__content {
        white-space: normal;
      }
    }
  }
}

@media (max-width: 900px) {
  .b-transportation-service-orders--modern {
    :deep(.v-table__wrapper > table),
    :deep(.v-table__wrapper > table > tbody) {
      display: block;
      width: 100%;
    }

    :deep(.v-data-table__tr--mobile) {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 15px 12px;
      padding: 17px 13px;
      border-block-end: 1px solid var(--sd-modern-border);

      > td {
        display: block;
        width: auto !important;
        max-width: 100%;
        padding: 0 !important;
        border: 0 !important;
        min-width: 0;
        text-align: start !important;
      }

      > td:first-child,
      > td:nth-child(2),
      > td:last-child {
        grid-column: 1 / -1;
      }

      .v-data-table__td-value {
        min-width: 0;
        width: 100%;
        margin-block-start: 6px;
        text-align: start;
      }
    }

    .b-transportation-service-orders__details-row,
    .b-transportation-service-orders__details-row > td {
      display: block;
      width: 100%;
      height: auto !important;
    }

    .b-transportation-service-orders__details {
      grid-template-columns: 1fr;
      gap: 17px;

      > section + section {
        padding-inline-start: 0;
        padding-block-start: 15px;
        border-inline-start: 0;
        border-block-start: 1px solid var(--sd-modern-border);
      }
    }

    .b-transportation-service-orders__receiver > .mt-1 {
      display: block;
      overflow: visible;
    }

    .b-transportation-service-orders__order {
      flex-direction: row;
      gap: 10px;
    }

    .b-transportation-service-orders__status {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}

.b-transportation-service-orders__status-menu {
  :deep(.v-list-item-title) {
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
  }
}

@media (max-width: 600px), (pointer: coarse) {
  .b-transportation-service-orders--modern {
    .sd-modern-button {
      --v-btn-height: 44px;
      min-height: 44px;
    }

    .b-transportation-service-orders__copy {
      min-height: 44px;
    }

    .b-transportation-service-orders__order :deep(.sd-modern-button) {
      min-height: 44px;
    }

    .b-transportation-service-orders__sort select,
    .b-transportation-service-orders__date-button {
      min-height: 44px;
    }

    .b-transportation-service-orders__sort select {
      font-size: 16px;
    }

    .b-transportation-service-orders__sort {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 44px;
      gap: 8px 12px;
      width: 100%;

      label {
        grid-column: 1 / -1;
      }

      select {
        min-width: 0;
        max-width: none;
        width: 100%;
      }
    }
  }
}
</style>
