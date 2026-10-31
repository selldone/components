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
  <div class="text-start" :class="{ 's-service-billing-item-modern': modern }">
    <button
      v-if="modern"
      type="button"
      class="s-service-billing-item-modern__summary"
      :aria-expanded="expand"
      @click="expand = !expand"
    >
      <img
        :src="getProductImage(product.id, IMAGE_SIZE_SMALL)"
        alt=""
        class="s-service-billing-item-modern__image"
      />
      <span class="s-service-billing-item-modern__identity">
        <span class="s-service-billing-item-modern__name"
          >{{ product.title
          }}<span v-if="type" class="s-service-billing-item-modern__type">{{
            $t(type.title)
          }}</span></span
        >
        <span
          v-if="product.title_en"
          class="s-service-billing-item-modern__secondary"
          >{{ product.title_en }}</span
        >
        <span class="s-service-billing-item-modern__facts">
          <u-price
            v-if="
              service_item &&
              service_item.price !== null &&
              service_item.price !== undefined
            "
            :amount="service_item.price"
            :currency="service_item.currency"
            class="s-service-billing-item-modern__price"
          />
          <span v-else class="s-service-billing-item-modern__unpriced"
            ><v-icon size="14" aria-hidden="true">hourglass_top</v-icon
            >{{ $t("process_center.modern.service_not_priced") }}</span
          >
          <span v-if="start_at" class="s-service-billing-item-modern__date"
            ><v-icon size="14" aria-hidden="true">login</v-icon
            >{{ getLocalDateString(start_at) }}</span
          >
          <span v-if="end_at" class="s-service-billing-item-modern__date"
            ><v-icon size="14" aria-hidden="true">logout</v-icon
            >{{ getLocalDateString(end_at) }}</span
          >
          <span
            v-for="(task, index) in tasks"
            :key="index"
            class="s-service-billing-item-modern__task"
          >
            <v-icon size="14" aria-hidden="true">task_alt</v-icon
            ><span>{{ task.title }}</span
            ><v-progress-circular
              :model-value="task.progress"
              :size="16"
              :width="2"
              color="primary"
              aria-hidden="true"
            /><span>{{ task.progress }}%</span>
          </span>
        </span>
      </span>
      <v-icon size="18" :class="{ 'rotate-180': expand }" aria-hidden="true"
        >expand_more</v-icon
      >
      <v-tooltip
        v-if="type"
        activator="parent"
        location="top"
        :open-on-focus="true"
        content-class="sd-modern-tooltip text-start"
        >{{ $t(type.desc) }}</v-tooltip
      >
    </button>
    <div v-else class="d-flex align-items-center pp" @click="expand = !expand">
      <v-img
        :src="getProductImage(product.id, IMAGE_SIZE_SMALL)"
        class="rounded-18px flex-grow-0"
        height="64"
        width="64"
      >
      </v-img>
      <div class="flex-grow-1 ps-3">
        <div class="mb-1 d-flex align-center">
          <b>{{ product.title }}</b>
          <v-chip
            v-if="type"
            :title="$t(type.desc)"
            class="ms-2"
            label
            size="x-small"
            >{{ $t(type.title) }}
          </v-chip>

          <v-btn
            v-if="!viewOnlyProgress /*Admin Panel Only!*/"
            size="x-small"
            variant="elevated"
            class="ms-2 tnt"
            target="_blank"
            append-icon="open_in_new"
            :to="{
              name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? 'Vendor_ProductDashboard'
                : 'BPageProductDashboard',
              params: { product_id: product.id },
            }"
            >Product Admin
          </v-btn>
        </div>
        <div class="text-subtitle-2 m-0">
          {{ product.title_en }}
        </div>

        <v-row align="center" no-gutters>
          <u-price
            v-if="service_item?.price"
            :amount="service_item.price"
            :currency="service_item.currency"
            class="me-2"
            title="Pricing of this item by seller."
          ></u-price>
          <v-chip
            v-else
            class="me-2"
            color="#FFA000"
            variant="elevated"
            size="small"
            prepend-icon="hourglass_top"
            >Not pricing yet!
          </v-chip>

          <div
            v-if="start_at"
            class="ma-1 text-subtitle-2"
            title="Checkin date."
          >
            <v-icon class="mx-1" size="small">login</v-icon>
            {{ getLocalDateString(start_at) }}
          </div>
          <div
            v-if="end_at"
            class="ma-1 text-subtitle-2"
            title="Checkout date."
          >
            <v-icon class="mx-1" size="small">logout</v-icon>
            {{ getLocalDateString(end_at) }}
          </div>

          <v-chip
            v-for="task in tasks"
            size="x-small"
            class="ma-1"
            variant="flat"
            color="#000"
            prepend-icon="add_task"
          >
            {{ task.title?.limitWords(3) }}
            <v-progress-circular
              :model-value="task.progress"
              class="me-n1 ms-2"
              size="16"
              color="#fff"
              bg-color="#aaa"
            ></v-progress-circular>
          </v-chip>
        </v-row>
      </div>

      <v-icon :class="{ 'rotate-180': expand }">expand_more</v-icon>
    </div>
    <div
      v-if="modern && !viewOnlyProgress /*Admin Panel Only!*/"
      class="s-service-billing-item-modern__product-action"
    >
      <v-btn
        variant="text"
        color="primary"
        class="sd-modern-button sd-modern-button--inline"
        target="_blank"
        rel="noopener noreferrer"
        :to="{
          name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? 'Vendor_ProductDashboard'
            : 'BPageProductDashboard',
          params: { product_id: product.id },
        }"
      >
        {{ $t("process_center.modern.service_product_admin")
        }}<v-icon end size="16" aria-hidden="true">north_east</v-icon>
      </v-btn>
    </div>

    <v-expand-transition>
      <div
        v-if="expand"
        :class="{ 's-service-billing-item-modern__body': modern }"
      >
        <v-list-subheader v-if="!modern"></v-list-subheader>
        <!-- ----------------------- Tasks ----------------------- -->
        <div
          v-if="has_tasks"
          :class="
            modern
              ? 's-service-billing-item-modern__section'
              : { 'border-bottom': editing, 'widget-box -large mb-5': true }
          "
        >
          <div
            v-if="modern"
            class="s-service-billing-item-modern__section-header"
          >
            <h3>
              <v-icon size="18" aria-hidden="true">rule</v-icon
              >{{ $t("service_bill.task.title") }}
            </h3>
            <span
              v-if="viewOnlyProgress"
              class="s-service-billing-item-modern__locked"
              ><v-icon size="13" aria-hidden="true">lock</v-icon
              >{{
                $t("process_center.modern.service_task_progress_locked")
              }}</span
            >
          </div>
          <u-widget-header
            v-else
            :title="$t('service_bill.task.title')"
            icon="rule"
          >
          </u-widget-header>

          <p v-if="modern" class="s-service-billing-item-modern__section-copy">
            {{
              $t(
                editing
                  ? "process_center.modern.service_tasks_subtitle"
                  : "process_center.modern.service_tasks_progress_subtitle",
              )
            }}
          </p>
          <v-list-subheader v-else>
            {{ $t("service_bill.task.message") }}
          </v-list-subheader>

          <u-tasks-editor
            v-model="tasks"
            :editable="editing"
            :view-only-progress="viewOnlyProgress"
            :modern="modern"
            @change="updateTasks"
          />
        </div>
        <!-- ----------------------- Date ----------------------- -->
        <div
          v-if="has_reserve"
          :class="
            modern
              ? 's-service-billing-item-modern__section'
              : { 'border-bottom': editing, 'widget-box -large mb-5': true }
          "
        >
          <div
            v-if="modern"
            class="s-service-billing-item-modern__section-header"
          >
            <h3>
              <v-icon size="18" aria-hidden="true">event_available</v-icon
              >{{ $t("global.service.appointment.title") }}
            </h3>
            <v-tooltip
              location="top"
              :open-on-focus="true"
              :open-on-click="true"
              content-class="sd-modern-tooltip text-start"
              ><template #activator="{ props }"
                ><v-btn
                  v-bind="props"
                  icon="info_outline"
                  variant="text"
                  class="sd-modern-icon-button sd-modern-info-button"
                  :aria-label="
                    $t('global.service.appointment.title')
                  " /></template
              >{{
                $t("process_center.modern.service_appointment_help")
              }}</v-tooltip
            >
          </div>
          <u-widget-header
            v-else
            :title="$t('global.service.appointment.title')"
            icon="event_available"
          >
          </u-widget-header>

          <u-date-input
            v-if="!modern || editing"
            v-model="reserved_at"
            :jump-minute="15"
            :min="new Date().toISOString()"
            :class="
              modern
                ? 'sd-modern-underlined-field s-service-billing-item-modern__field'
                : 'max-width-field mx-auto mb-3'
            "
            :color="modern ? 'primary' : '#2196f3'"
            :label="
              modern
                ? $t('process_center.modern.service_appointment_label')
                : 'Appointment'
            "
            :rounded="!modern"
            return-utc
          >
          </u-date-input>
          <p v-else class="s-service-billing-item-modern__record">
            {{
              reserved_at
                ? getLocalTimeString(reserved_at, false)
                : $t("global.commons.not_selected")
            }}
          </p>

          <u-time-week-picker
            v-model="preferences.days"
            :pointed-time-utc="reserved_at"
            :restrictions="outputs.days"
            :class="
              modern
                ? 's-service-billing-item-modern__availability'
                : 'my-2 max-width-field-large mx-auto'
            "
            dis-color="#ddd"
          ></u-time-week-picker>
        </div>

        <!-- ----------------------- Booking ----------------------- -->
        <div
          v-if="has_booking"
          :class="
            modern
              ? 's-service-billing-item-modern__section'
              : { 'border-bottom': editing, 'widget-box -large mb-5': true }
          "
        >
          <div
            v-if="modern"
            class="s-service-billing-item-modern__section-header"
          >
            <h3>
              <v-icon size="18" aria-hidden="true">date_range</v-icon
              >{{ $t("service_bill.booking.title")
              }}<v-tooltip
                location="top"
                :open-on-focus="true"
                :open-on-click="true"
                content-class="sd-modern-tooltip text-start"
                ><template #activator="{ props }"
                  ><v-btn
                    v-bind="props"
                    icon="info_outline"
                    variant="text"
                    class="sd-modern-icon-button sd-modern-info-button"
                    :aria-label="$t('service_bill.booking.title')" /></template
                >{{
                  $t("process_center.modern.service_booking_help")
                }}</v-tooltip
              >
            </h3>
            <v-btn
              v-if="editing"
              variant="text"
              color="primary"
              class="sd-modern-button sd-modern-button--inline"
              @click="show_cal = !show_cal"
              ><v-icon start size="16" aria-hidden="true">calendar_today</v-icon
              >{{ $t("service_bill.booking.show_calendar") }}</v-btn
            >
          </div>
          <u-widget-header
            v-else
            :add-caption="
              editing ? $t('service_bill.booking.show_calendar') : undefined
            "
            :title="$t('service_bill.booking.title')"
            add-icon="calendar_today"
            add-text
            icon="date_range"
            @click:add="show_cal = !show_cal"
          >
          </u-widget-header>
          <v-list-subheader v-if="!modern">
            {{ $t("service_bill.booking.message") }}
          </v-list-subheader>

          <div v-if="modern" class="s-service-billing-item-modern__booking">
            <div>
              <span class="sd-modern-eyebrow">{{
                $t("process_center.modern.service_checkin_label")
              }}</span>
              <strong>{{
                start_at
                  ? getLocalDateString(start_at)
                  : $t("global.commons.not_selected")
              }}</strong>
              <span v-if="outputs.checkin"
                ><bdi
                  >{{ String(outputs.checkin.HH).padStart(2, "0") }}:{{
                    String(outputs.checkin.mm).padStart(2, "0")
                  }}</bdi
                ></span
              >
              <small v-if="preferences.dates?.[0]">{{
                $t("process_center.modern.service_buyer_requested", {
                  date: getLocalDateString(preferences.dates[0]),
                })
              }}</small>
              <small v-else>{{
                $t("process_center.modern.service_buyer_not_selected")
              }}</small>
              <v-btn
                v-if="
                  editing &&
                  preferences.dates?.[0] &&
                  getLocalDateString(start_at) !==
                    getLocalDateString(preferences.dates[0])
                "
                variant="text"
                color="primary"
                class="sd-modern-button sd-modern-button--inline"
                @click="start_at = preferences.dates[0]"
                ><v-icon start size="16" aria-hidden="true">restore</v-icon
                >{{ $t("process_center.modern.service_use_buyer_date") }}</v-btn
              >
            </div>
            <div>
              <span class="sd-modern-eyebrow">{{
                $t("process_center.modern.service_checkout_label")
              }}</span>
              <strong>{{
                end_at
                  ? getLocalDateString(end_at)
                  : $t("global.commons.not_selected")
              }}</strong>
              <span v-if="outputs.checkout"
                ><bdi
                  >{{ String(outputs.checkout.HH).padStart(2, "0") }}:{{
                    String(outputs.checkout.mm).padStart(2, "0")
                  }}</bdi
                ></span
              >
              <small v-if="preferences.dates?.[1]">{{
                $t("process_center.modern.service_buyer_requested", {
                  date: getLocalDateString(preferences.dates[1]),
                })
              }}</small>
              <small v-else>{{
                $t("process_center.modern.service_buyer_not_selected")
              }}</small>
              <v-btn
                v-if="
                  editing &&
                  preferences.dates?.[1] &&
                  getLocalDateString(end_at) !==
                    getLocalDateString(preferences.dates[1])
                "
                variant="text"
                color="primary"
                class="sd-modern-button sd-modern-button--inline"
                @click="end_at = preferences.dates[1]"
                ><v-icon start size="16" aria-hidden="true">restore</v-icon
                >{{ $t("process_center.modern.service_use_buyer_date") }}</v-btn
              >
            </div>
            <div class="s-service-billing-item-modern__days">
              <strong>{{ Math.round(diff_days) }}</strong
              ><span>{{ $t("global.commons.days") }}</span>
            </div>
          </div>
          <div
            v-else
            class="text-subtitle-2 d-flex text-center border-between checks justify-center"
          >
            <!-- Checkin Date -->

            <div class="flex-grow-1">
              <v-icon class="me-1" color="#111" size="small">login</v-icon>
              {{ $t("service_bill.booking.selected_checkin") }}:
              <div
                v-if="preferences.dates && preferences.dates[0]"
                class="mt-1"
              >
                <div>
                  <div
                    v-if="
                      getLocalDateString(start_at) !==
                      getLocalDateString(preferences.dates[0])
                    "
                    style="text-decoration-line: line-through"
                    title="User selected this date but you change it!"
                  >
                    {{
                      getLocalTimeString(
                        preferences.dates[0],
                        false,
                        false,
                        true,
                      )
                    }}

                    <v-btn
                      v-if="editing"
                      :title="
                        'Reset to user selected date: ' +
                        getLocalTimeString(preferences.dates[0])
                      "
                      class="mx-1"
                      icon
                      variant="text"
                      @click="start_at = preferences.dates[0]"
                    >
                      <v-icon size="small">autorenew</v-icon>
                    </v-btn>
                  </div>

                  <div class="font-weight-bold">
                    {{ getLocalTimeString(start_at, false, false, true) }}

                    <span class="ms-5">
                      {{ $t("global.commons.time") }}:
                      <b v-if="outputs.checkin" dir="ltr"
                        >{{ outputs.checkin["HH"] }} :
                        {{ outputs.checkin["mm"] }}</b
                      >
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="mt-1">
                <v-icon class="me-1" color="#111" size="small"
                  >help_center
                </v-icon>

                {{ $t("global.commons.not_selected") }}
              </div>
            </div>

            <!-- Checkout Date -->
            <div class="flex-grow-1">
              <v-icon class="me-1" color="#111" size="small">logout</v-icon>

              {{ $t("service_bill.booking.selected_checkout") }}:

              <div v-if="preferences.date && preferences.dates[1]" class="mt-1">
                <div>
                  <div
                    v-if="
                      getLocalDateString(end_at) !==
                      getLocalDateString(preferences.dates[1])
                    "
                    style="text-decoration-line: line-through"
                    title="User selected this date but you change it!"
                  >
                    {{
                      getLocalTimeString(
                        preferences.dates[1],
                        false,
                        false,
                        true,
                      )
                    }}

                    <v-btn
                      v-if="editing"
                      :title="
                        'Reset to user selected date: ' +
                        getLocalTimeString(preferences.dates[1])
                      "
                      class="mx-1"
                      icon
                      variant="text"
                      @click="end_at = preferences.dates[1]"
                    >
                      <v-icon size="small">autorenew</v-icon>
                    </v-btn>
                  </div>

                  <div class="font-weight-bold">
                    {{ getLocalTimeString(end_at, false, false, true) }}

                    <span class="ms-5">
                      {{ $t("global.commons.time") }}:
                      <b v-if="outputs.checkout" dir="ltr"
                        >{{ outputs.checkout["HH"] }} :
                        {{ outputs.checkout["mm"] }}</b
                      >
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="mt-1">
                <v-icon class="me-1" color="#111" size="small"
                  >help_center
                </v-icon>
                {{ $t("global.commons.not_selected") }}
              </div>
            </div>
            <!-- Days -->

            <div class="flex-grow-0 p-3">
              <h2 class="text-h4">{{ Math.round(diff_days) }}</h2>
              <small>{{ $t("global.commons.days") }}</small>
            </div>
          </div>

          <template v-if="editing">
            <p
              :class="{ 's-service-billing-item-modern__change-dates': modern }"
            >
              <template v-if="!modern">{{
                $t("service_bill.booking.change_days_question")
              }}</template>

              <v-btn
                color="primary"
                variant="text"
                :class="{ 'sd-modern-button sd-modern-button--inline': modern }"
                @click="change_dates = !change_dates"
              >
                <v-icon class="me-1" size="small"
                  >published_with_changes
                </v-icon>
                {{
                  $t(
                    modern
                      ? "process_center.modern.service_change_dates"
                      : "global.actions.click_here",
                  )
                }}
              </v-btn>
            </p>

            <v-expand-transition>
              <v-container
                v-if="change_dates"
                :class="{
                  's-service-billing-item-modern__date-inputs': modern,
                }"
              >
                <v-row class="m-0">
                  <v-col cols="12" sm="6">
                    <u-date-input
                      v-model="start_at"
                      :min="new Date().toISOString()"
                      :class="
                        modern
                          ? 'sd-modern-underlined-field'
                          : 'max-width-field mx-auto border rounded-lg pa-3 bg-white widget-hover'
                      "
                      :color="modern ? 'primary' : '#2196f3'"
                      format="YYYY-MM-DD"
                      :label="
                        modern
                          ? $t('process_center.modern.service_checkin_label')
                          : 'Check-in'
                      "
                      return-utc
                      :rounded="!modern"
                      type="date"
                      :variant="modern ? 'underlined' : 'plain'"
                    >
                    </u-date-input>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <u-date-input
                      v-model="end_at"
                      :min="start_at"
                      :class="
                        modern
                          ? 'sd-modern-underlined-field'
                          : 'max-width-field mx-auto border rounded-lg pa-3 bg-white widget-hover'
                      "
                      :color="modern ? 'primary' : '#2196f3'"
                      format="YYYY-MM-DD"
                      :label="
                        modern
                          ? $t('process_center.modern.service_checkout_label')
                          : 'Check-out'
                      "
                      return-utc
                      :rounded="!modern"
                      type="date"
                      :variant="modern ? 'underlined' : 'plain'"
                    >
                    </u-date-input>
                  </v-col>
                </v-row>
              </v-container>
            </v-expand-transition>

            <v-bottom-sheet
              v-model="show_cal"
              :content-class="
                modern
                  ? 'rounded-t-xl s-service-billing-calendar-modern text-start'
                  : 'rounded-t-xl'
              "
              max-width="840"
            >
              <v-card class="rounded-t-xl" rounded="0">
                <v-card-title></v-card-title>
                <v-card-text>
                  <v-date-picker
                    :model-value="[new Date(start_at), new Date(end_at)]"
                    multiple="range"
                    :allowed-dates="
                      (d) =>
                        !outputs.disabled?.some((x) => d.isSameDay(new Date(x)))
                    "
                    :new-event="new_event"
                    class="my-3"
                    view-mode="month"
                    width="100%"
                    :title="
                      modern
                        ? $t('process_center.modern.service_calendar_title')
                        : 'Booking Calendar'
                    "
                  ></v-date-picker>
                </v-card-text>
                <v-card-actions>
                  <div class="widget-buttons">
                    <v-btn
                      :size="modern ? undefined : 'x-large'"
                      variant="text"
                      :class="{ 'sd-modern-button': modern }"
                      @click="show_cal = false"
                    >
                      <v-icon start>close</v-icon>
                      {{ modern ? $t("global.actions.close") : "Close" }}
                    </v-btn>
                  </div>
                </v-card-actions>
              </v-card>
            </v-bottom-sheet>
          </template>
        </div>
        <!-- ----------------------- Subscription duration ----------------------- -->
        <div
          v-if="has_subscription"
          :class="
            modern
              ? 's-service-billing-item-modern__section'
              : { 'border-bottom': editing, 'widget-box -large mb-5': true }
          "
        >
          <div
            v-if="modern"
            class="s-service-billing-item-modern__section-header"
          >
            <h3>
              <v-icon size="18" aria-hidden="true">extension</v-icon
              >{{ $t("service_bill.subscription.title") }}
            </h3>
            <v-tooltip
              location="top"
              :open-on-focus="true"
              :open-on-click="true"
              content-class="sd-modern-tooltip text-start"
              ><template #activator="{ props }"
                ><v-btn
                  v-bind="props"
                  icon="info_outline"
                  variant="text"
                  class="sd-modern-icon-button sd-modern-info-button"
                  :aria-label="
                    $t('service_bill.subscription.title')
                  " /></template
              >{{
                $t("process_center.modern.service_duration_help")
              }}</v-tooltip
            >
          </div>
          <u-widget-header
            v-else
            :title="$t('service_bill.subscription.title')"
            icon="extension"
          >
          </u-widget-header>
          <v-list-subheader v-if="!modern">
            {{ $t("service_bill.subscription.message") }}
          </v-list-subheader>

          <u-number-input
            v-if="!modern || editing"
            v-model="subscription"
            :decimal="0"
            :label="$t('service_bill.subscription.duration')"
            :min="0"
            :suffix="$t('global.commons.days')"
            :class="
              modern
                ? 'sd-modern-underlined-field s-service-billing-item-modern__field'
                : 'max-width-field mx-auto'
            "
            :filled="!modern"
            :variant="modern ? 'underlined' : undefined"
            placeholder="Ex. 90 days"
            :rounded="!modern"
          >
          </u-number-input>
          <p v-else class="s-service-billing-item-modern__record">
            {{ subscription }} {{ $t("global.commons.days") }}
          </p>
        </div>

        <!-- ----------------------- Charge ----------------------- -->
        <div
          v-if="has_charge"
          :class="
            modern
              ? 's-service-billing-item-modern__section'
              : { 'border-bottom': editing, 'widget-box -large mb-5': true }
          "
        >
          <div
            v-if="modern"
            class="s-service-billing-item-modern__section-header"
          >
            <h3>
              <v-icon size="18" aria-hidden="true">generating_tokens</v-icon
              >{{ $t("service_bill.charge.title") }}
            </h3>
            <v-tooltip
              location="top"
              :open-on-focus="true"
              :open-on-click="true"
              content-class="sd-modern-tooltip text-start"
              ><template #activator="{ props }"
                ><v-btn
                  v-bind="props"
                  icon="info_outline"
                  variant="text"
                  class="sd-modern-icon-button sd-modern-info-button"
                  :aria-label="$t('service_bill.charge.title')" /></template
              >{{ $t("process_center.modern.service_charge_help") }}</v-tooltip
            >
          </div>
          <u-widget-header
            v-else
            :title="$t('service_bill.charge.title')"
            icon="generating_tokens"
          >
          </u-widget-header>
          <v-list-subheader v-if="!modern">
            {{ $t("service_bill.charge.message") }}
          </v-list-subheader>

          <u-number-input
            v-if="!modern || editing"
            v-model="charge"
            :decimal="0"
            :label="$t('service_bill.subscription.charge')"
            :min="0"
            :suffix="$t('global.commons.units')"
            :class="
              modern
                ? 'sd-modern-underlined-field s-service-billing-item-modern__field'
                : 'max-width-field mx-auto'
            "
            :filled="!modern"
            :variant="modern ? 'underlined' : undefined"
            placeholder="Ex. 2000 units"
            :rounded="!modern"
          >
          </u-number-input>
          <p v-else class="s-service-billing-item-modern__record">
            {{ charge }} {{ $t("global.commons.units") }}
          </p>
        </div>

        <!-- ----------------------- Set Price ----------------------- -->

        <div
          v-if="editing"
          :class="
            modern
              ? 's-service-billing-item-modern__pricing'
              : 'widget-box -large mb-5'
          "
        >
          <u-widget-header
            v-if="!modern"
            :title="$t('service_bill.pricing.title')"
            icon="price_change"
          >
          </u-widget-header>
          <v-list-subheader v-if="!modern">
            {{ $t("service_bill.pricing.message") }}
          </v-list-subheader>

          <div
            :class="{ 's-service-billing-item-modern__price-field': modern }"
          >
            <div
              v-if="modern"
              class="s-service-billing-item-modern__price-label"
            >
              <span>{{ $t("process_center.modern.service_price_label") }}</span>
              <v-tooltip
                location="top"
                :open-on-focus="true"
                :open-on-click="true"
                content-class="sd-modern-tooltip text-start"
                ><template #activator="{ props }"
                  ><v-btn
                    v-bind="props"
                    icon="info_outline"
                    variant="text"
                    class="sd-modern-icon-button sd-modern-info-button"
                    :aria-label="
                      $t('process_center.modern.service_price_label')
                    " /></template
                >{{
                  $t("process_center.modern.service_pricing_help")
                }}</v-tooltip
              >
            </div>
            <u-price-input
              v-model="price"
              :currency="currency"
              :disabled="!currency"
              :label="
                $t(
                  modern
                    ? 'process_center.modern.service_price_label'
                    : 'add_product.pricing.price_input',
                )
              "
              :rules="[GlobalRules.required()]"
              :class="
                modern
                  ? 'sd-modern-underlined-field'
                  : 'max-width-field mx-auto my-2 strong-field'
              "
              placeholder="0.00"
              :variant="modern ? 'underlined' : 'solo'"
              :rounded="modern ? false : 'xl'"
              required
            >
              <template v-slot:append-inner>
                <v-icon
                  v-if="
                    modern
                      ? price === null || price === undefined
                      : !price || price <= 0
                  "
                  color="red"
                  class="blink-me ms-2"
                  >warning
                </v-icon>
              </template>
            </u-price-input>
          </div>

          <s-widget-buttons
            :class="{ 's-service-billing-item-modern__save': modern }"
          >
            <v-btn
              :color="
                modern
                  ? isCurrentPricing
                    ? 'primary'
                    : undefined
                  : service_item
                    ? 'primary'
                    : 'success'
              "
              :loading="busy_set"
              :size="
                modern
                  ? isCurrentPricing
                    ? 'x-large'
                    : undefined
                  : !service_item
                    ? 'large'
                    : 'x-large'
              "
              :variant="
                modern
                  ? isCurrentPricing
                    ? 'elevated'
                    : 'outlined'
                  : !!service_item
                    ? 'elevated'
                    : 'outlined'
              "
              :class="
                modern
                  ? [
                      'sd-modern-button',
                      { 'sd-modern-button--x-large': isCurrentPricing },
                    ]
                  : undefined
              "
              @click="setServiceItem"
            >
              <v-icon class="me-1"
                >{{ service_item ? "save" : "check" }}
              </v-icon>
              {{ $t("service_bill.save_item") }}
            </v-btn>
          </s-widget-buttons>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UDateInput from "../../../ui/date/input/UDateInput.vue";
import UTasksEditor from "../../../ui/task/editor/UTasksEditor.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import UTimeWeekPicker from "../../../ui/time/week-picker/UTimeWeekPicker.vue";
import { ServiceTypes } from "@selldone/core-js/enums/product/ServiceTypes";
import UPriceInput from "../../../ui/price/input/UPriceInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import { Basket } from "@selldone/core-js";

import { throttle } from "lodash-es";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "ServiceBillingItem",
  mixins: [DateMixin],

  components: {
    SWidgetButtons,
    UPriceInput,
    UTimeWeekPicker,
    UNumberInput,
    UTasksEditor,
    UDateInput,
  },
  inject: ["$shop"],
  props: {
    modern: { type: Boolean, default: false },
    basket: {
      require: true,
      type: Object,
    },
    item: {
      require: true,
      type: Object,
    },
    product: {
      require: true,
      type: Object,
    },
    editing: {
      default: false,
      type: Boolean,
    },
    initialExpand: {
      default: false,
      type: Boolean,
    },
    viewOnlyProgress: {
      default: false,
      type: Boolean,
    },
  },

  data: function () {
    return {
      expand: false,

      // Set by buyer (inputs of basket item)

      // Set by seller:
      tasks: {},
      reserved_at: null,
      subscription: null,
      charge: null,
      start_at: null,
      end_at: null,

      price: 0,

      //--------------------
      show_cal: false,
      change_dates: false,

      //--------------------
      busy_set: false,

      //-------------------
      service_item: null,

      busy_save: false,
    };
  },

  watch: {
    initialExpand(val) {
      this.expand = val;
    },
  },

  computed: {
    isCurrentPricing() {
      return (
        this.modern &&
        !this.busy_set &&
        !this.basket.reject &&
        !this.service_item?.id &&
        this.basket.status === Basket.Status.Reserved.code &&
        this.basket.delivery_state === Basket.ServiceOrderStates.CheckQueue.code
      );
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    currency() {
      return Currency[this.basket.currency];
    },

    outputs() {
      return this.product.outputs;
    },
    new_event() {
      return {
        name: "Booking",
        start_at: this.start_at,
        end_at: this.end_at,
      };
    },

    preferences() {
      return this.item.preferences;
    },
    /*  service_item() {
      return this.item.service_item;
    },*/

    type() {
      return (
        this.outputs && this.outputs.type && ServiceTypes[this.outputs.type]
      );
    },

    has_tasks() {
      return this.type && this.type.form.includes("tasks");
    },
    has_reserve() {
      return this.type && this.type.form.includes("reserve");
    },
    has_booking() {
      return this.type && this.type.form.includes("booking");
    },
    has_subscription() {
      return this.type && this.type.form.includes("subscription");
    },
    has_charge() {
      return this.type && this.type.form.includes("charge");
    },

    diff_days() {
      if (this.start_at && this.end_at) {
        const diff_days =
          (new Date(this.end_at).getTime() -
            new Date(this.start_at).getTime()) /
          (1000 * 3600 * 24);
        return Math.abs(diff_days);
      }
      return 0;
    },
  },
  created() {
    this.expand = this.initialExpand;

    this.service_item = this.item.service_item;
    if (this.service_item) {
      // Previously added service item:

      this.tasks = Object.assign([], this.service_item.tasks);
      this.subscription = this.service_item.subscription;
      this.charge = this.service_item.charge;

      this.reserved_at = this.service_item.reserved_at;
      this.start_at = this.service_item.start_at;
      this.end_at = this.service_item.end_at;

      this.price = this.service_item.price;
    } else {
      // Load initial state:

      this.tasks = Object.assign([], this.outputs.tasks);
      this.subscription = this.outputs.subscription;
      this.charge = this.outputs.charge;
    }

    if (this.preferences.dates?.length >= 2) {
      this.start_at = this.start_at ? this.start_at : this.preferences.dates[0];
      this.end_at = this.end_at ? this.end_at : this.preferences.dates[1];
    }
  },
  methods: {
    //----------------------------------------------------------------------------
    setServiceItem() {
      this.busy_set = true;

      axios
        .put(
          window.API.PUT_SERVICE_ITEM(
            this.$shop.id,
            this.basket.id,
            this.item.id,
          ),
          {
            price: this.price,

            tasks: this.tasks,
            reserved_at: this.reserved_at,
            subscription: this.subscription,
            charge: this.charge,
            start_at: this.start_at,
            end_at: this.end_at,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.service_item = data.service_item; // Update local object
            this.item.service_item = data.service_item; // Update main object
            this.basket.price = data.basket_price; // Recalculate basket price each time update service item.
            this.item.price = data.item_price; // Update basket item price.

            NotificationService.showSuccessAlert(
              null,
              this.modern
                ? this.$t("process_center.modern.service_item_saved")
                : "Your service order billing has been saved.",
            );
            this.expand = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    //----------------------------------------------------------------------------

    updateTasks: throttle(function () {
      if (this.viewOnlyProgress) return;

      this.busy_save = true;

      axios
        .put(
          this.IS_VENDOR_PANEL
            ? window.VAPI.PUT_MY_VENDOR_SERVICE_ITEM_TASKS(
                /*🟢 Vendor Panel 🟢*/
                this.$route.params.vendor_id,
                this.basket.id, // Vendor order ID
                this.item.id,
              )
            : window.API.PUT_SERVICE_ITEM_TASKS(
                this.$shop.id,
                this.basket.id,
                this.item.id,
              ),
          {
            tasks: this.tasks,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.service_item = data.service_item; // Update local object
            this.item.service_item = data.service_item; // Update main object

            NotificationService.showSuccessAlert();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    }, 5000),
  },
};
</script>

<style lang="scss" scoped>
.s-service-billing-item-modern {
  border: 1px solid var(--sd-modern-border);
  border-radius: 10px;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 12px;
  line-height: 18px;

  &__summary {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    background: var(--sd-modern-inset);
    color: inherit;
    font: inherit;
    text-align: start;

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
    > .v-icon {
      flex: none;
      color: var(--sd-modern-muted);
    }
  }
  &__image {
    width: 48px;
    height: 48px;
    flex: none;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    object-fit: cover;
    background: rgb(var(--v-theme-surface));
  }
  &__identity {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  &__name {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  &__type {
    padding: 1px 6px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 4px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    font-weight: 400;
  }
  &__secondary {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    overflow-wrap: anywhere;
  }
  &__facts {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px 17px;
    font-size: 12px;
    line-height: 18px;
  }
  &__price {
    font-size: 12px;
    line-height: 18px;
    font-weight: 500;
  }
  &__date,
  &__unpriced,
  &__task {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__task {
    min-width: 0;
    font-variant-numeric: tabular-nums;
    > span:first-of-type {
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &__product-action {
    padding: 2px 14px 0;
  }
  &__body {
    padding: 0 18px 18px;
  }
  &__section {
    padding-block: 20px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 14px;
    margin-block-end: 12px;
  }
  &__section-header h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
    > .v-icon {
      color: var(--sd-modern-muted);
    }
  }
  &__section-copy {
    margin: -6px 0 14px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }
  &__locked {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__field {
    max-width: 320px;
    margin-block: 8px;
  }
  &__field :deep(.v-field__input),
  &__date-inputs :deep(.v-field__input) {
    font-size: 13px;
    line-height: 20px;
  }
  &__record {
    margin: 0;
    font-size: 13px;
    line-height: 20px;
  }
  &__availability {
    max-width: 580px;
    margin-block-start: 14px;
  }
  &__booking {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
    gap: 20px;
  }
  &__booking > div {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 5px;
  }
  &__booking strong {
    font-size: 14px;
    line-height: 21px;
    font-weight: 500;
  }
  &__booking small {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__booking .sd-modern-eyebrow {
    font-size: 10px;
    line-height: 16px;
  }
  &__booking .s-service-billing-item-modern__days {
    justify-content: center;
    align-items: center;
    min-width: 62px;
    padding-inline-start: 20px;
    border-inline-start: 1px solid var(--sd-modern-border);
    strong {
      font-size: 24px;
      line-height: 30px;
    }
    > span {
      color: var(--sd-modern-muted);
      font-size: 11px;
      line-height: 17px;
    }
  }
  &__change-dates {
    margin: 12px 0 0;
  }
  &__date-inputs {
    padding: 8px 0 0;
    :deep(.v-col) {
      padding: 8px 12px 0 0;
    }
  }
  &__pricing {
    display: flex;
    align-items: end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px 24px;
    padding-block-start: 20px;
  }
  &__price-field {
    width: 280px;
    max-width: 100%;
  }
  &__price-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    line-height: 18px;
    font-weight: 500;
  }
  &__price-field :deep(.v-field__input) {
    font-size: 16px;
    line-height: 24px;
  }
  &__save {
    flex: none;
    margin: 0;
    padding: 0;
    width: auto;
    :deep(.v-btn) {
      min-width: 0;
      font-weight: 500;
    }
  }

  @media (max-width: 600px) {
    &__summary {
      gap: 10px;
      padding: 12px;
    }
    &__image {
      width: 40px;
      height: 40px;
    }
    &__body {
      padding: 0 12px 16px;
    }
    &__facts {
      gap: 5px 12px;
    }
    &__task > span:first-of-type {
      max-width: 110px;
    }
    &__booking {
      grid-template-columns: 1fr;
      gap: 18px;
    }
    &__booking .s-service-billing-item-modern__days {
      flex-direction: row;
      justify-content: start;
      padding-inline-start: 0;
      border-inline-start: 0;
    }
    &__field :deep(.v-field__input),
    &__date-inputs :deep(.v-field__input) {
      font-size: 16px;
    }
    &__date-inputs :deep(.v-col) {
      padding-inline-end: 0;
    }
  }
}

@media only screen and (max-width: 600px) {
  .checks {
    font-size: 10px !important;

    p,
    button {
      font-size: 9px !important;

      span,
      i {
        font-size: 9px !important;
      }
    }
  }
}
</style>
