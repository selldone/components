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
  <v-container
    v-resize="onResize"
    class="p-0"
    :class="{ 'b-contacts-modern': modern }"
    fluid
  >
    <template v-if="modern">
      <div class="sd-modern-list-toolbar b-contacts-modern__toolbar">
        <div class="sd-modern-title">
          <v-icon icon="question_answer" size="18" aria-hidden="true" />
          <h2>{{ $t("shop_contacts.modern.conversations") }}</h2>
          <span
            v-if="!busy_fetch && !fetch_error"
            class="b-contacts-modern__count"
            >{{ $n(totalItems) }}</span
          >
        </div>
        <v-text-field
          v-model="search"
          :placeholder="$t('shop_contacts.modern.search')"
          :aria-label="$t('shop_contacts.modern.search')"
          class="b-contacts-modern__search"
          clearable
          hide-details
          prepend-inner-icon="search"
          single-line
          variant="plain"
        />
      </div>
      <div class="sd-modern-list-toolbar b-contacts-modern__tools">
        <div class="b-contacts-modern__sort">
          <span>{{ $t("global.data_toolbar.sort_by") }}</span>
          <v-select
            v-model="sortBy[0].key"
            :items="keys"
            :item-title="(item) => $t(item.label)"
            item-value="value"
            :aria-label="$t('global.data_toolbar.sort_by')"
            :menu-props="{ contentClass: 'sd-modern-select-menu' }"
            class="b-contacts-modern__sort-select"
            hide-details
            variant="plain"
          />
          <v-tooltip
            content-class="sd-modern-tooltip"
            location="top"
            :text="$t('shop_contacts.modern.reverse_sort')"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="sortBy[0].order === 'desc' ? 'south' : 'north'"
                :aria-label="$t('shop_contacts.modern.reverse_sort')"
                variant="text"
                class="sd-modern-icon-button"
                @click="
                  sortBy[0].order = sortBy[0].order === 'desc' ? 'asc' : 'desc'
                "
              />
            </template>
          </v-tooltip>
        </div>
        <div class="b-contacts-modern__options">
          <v-menu :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                prepend-icon="tune"
                variant="outlined"
                class="sd-modern-button sd-modern-button--small"
                >{{ $t("shop_contacts.modern.filters") }}</v-btn
              >
            </template>
            <v-sheet class="b-contacts-modern__filters text-start" rounded="lg">
              <h3>{{ $t("global.commons.category") }}</h3>
              <v-checkbox
                v-for="(category, key) in SupportCategory"
                :key="key"
                v-model="categories"
                :label="$t(category.name)"
                :value="key"
                hide-details
                density="compact"
                color="primary"
              />
              <v-divider class="my-2" />
              <v-switch
                v-model="details"
                :label="$t('global.commons.show_details')"
                hide-details
                density="compact"
                color="primary"
                inset
              />
            </v-sheet>
          </v-menu>
          <label class="b-contacts-modern__per-page">
            <span>{{ $t("shop_contacts.modern.per_page") }}</span>
            <v-select
              v-model="itemsPerPage"
              :items="[6, 12, 24, 48]"
              :aria-label="$t('shop_contacts.modern.per_page')"
              :menu-props="{ contentClass: 'sd-modern-select-menu' }"
              hide-details
              variant="plain"
            />
          </label>
        </div>
      </div>
      <div v-if="fetch_error" class="sd-modern-empty-state" role="status">
        <p>{{ $t("shop_contacts.modern.load_error") }}</p>
        <v-btn
          variant="text"
          class="sd-modern-button sd-modern-button--small"
          @click="reloadModern"
          >{{ $t("global.actions.retry") }}</v-btn
        >
      </div>
      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        v-model:sort-by="sortBy"
        :headers="modernHeaders"
        :items="contacts"
        :items-length="totalItems"
        :loading="busy_fetch"
        :aria-busy="busy_fetch"
        :row-props="modernRowProps"
        :mobile-breakpoint="760"
        :hide-default-header="$vuetify.display.width < 760"
        class="sd-modern-data-table b-contacts-modern__table"
        item-value="id"
        hide-default-footer
        @update:options="updateModernOptions"
        @click:row="(_, row) => showContact(row.item)"
      >
        <template #item.customer="{ item }">
          <div class="b-contacts-modern__customer">
            <v-avatar size="32"
              ><img
                :src="
                  item.user_id
                    ? getUserAvatar(item.user_id)
                    : require('../../../assets/icons/user.svg')
                "
                alt=""
            /></v-avatar>
            <div class="b-contacts-modern__identity">
              <div class="b-contacts-modern__name" dir="auto">
                {{ item.user?.name || item.name || $t("global.commons.user") }}
              </div>
              <div class="b-contacts-modern__state">
                <span class="sd-modern-status sd-modern-status--plain">
                  <span
                    class="sd-modern-status__dot"
                    :class="contactStatusClass(item)"
                  />{{ contactStatus(item) }}
                </span>
                <u-rating-emoji
                  v-if="item.closed"
                  :model-value="item.rate"
                  dense
                  no-stars
                  read-only
                  x-small
                />
              </div>
            </div>
          </div>
          <div
            v-if="details"
            class="b-contacts-modern__details"
            @click.stop
            @keydown.stop
          >
            <span v-copy dir="auto">{{
              item.user?.email || item.email || "—"
            }}</span>
            <span v-copy dir="auto">{{
              item.user?.phone || item.phone || "—"
            }}</span>
            <u-rating-emoji :model-value="item.rate" dense read-only x-small />
            <span
              >{{ $t("global.commons.created_at") }}:
              {{ getLocalTimeStringSmall(item.created_at) }}</span
            >
            <span
              >{{ $t("global.commons.updated_at") }}:
              {{ getLocalTimeStringSmall(item.updated_at) }}</span
            >
          </div>
        </template>
        <template #item.message="{ item }">
          <p class="b-contacts-modern__preview" dir="auto">
            <template v-if="getLastMessage(item)?.message">{{
              getLastMessage(item).message
            }}</template>
            <template v-else-if="getLastMessage(item)?.product"
              ><v-icon icon="local_mall" size="16" aria-hidden="true" />
              {{
                getLastMessage(item).product.title ||
                $t("global.commons.product")
              }}</template
            >
            <template v-else>—</template>
          </p>
          <v-tooltip
            :activator="'#contact-preview-' + $.uid + '-' + item.id"
            :disabled="preview_overflow !== item.id"
            content-class="sd-modern-tooltip"
            location="top"
            :text="getLastMessage(item)?.message"
          />
        </template>
        <template #item.officer_id="{ item }">
          <v-avatar
            v-if="item.officer_id"
            size="24"
            :aria-label="$t('global.commons.officer')"
            ><img :src="getUserAvatar(item.officer_id)" alt="" /></v-avatar
          ><span v-else>—</span>
        </template>
        <template #item.mention_id="{ item }">
          <v-avatar
            v-if="item.mention_id"
            size="24"
            :aria-label="$t('global.sort.mention')"
            ><img :src="getUserAvatar(item.mention_id)" alt="" /></v-avatar
          ><span v-else>—</span>
        </template>
        <template #item.updated_at="{ item }"
          ><span class="b-contacts-modern__date">{{
            getFromNowString(item.closed ? item.closed_at : item.updated_at)
          }}</span></template
        >
        <template #no-data>
          <div v-if="!fetch_error" class="sd-modern-empty-state">
            <v-icon
              :icon="search ? 'search_off' : 'question_answer'"
              size="26"
              aria-hidden="true"
            />
            <h3>
              {{
                $t(
                  search
                    ? "shop_contacts.modern.no_results"
                    : "shop_contacts.modern.empty",
                )
              }}
            </h3>
          </div>
        </template>
        <template #bottom>
          <footer
            v-if="totalItems"
            class="sd-modern-table-footer b-contacts-modern__footer"
          >
            <span aria-live="polite">{{
              $t("shop_contacts.modern.range", {
                from: $n((page - 1) * itemsPerPage + 1),
                to: $n(Math.min(page * itemsPerPage, totalItems)),
                total: $n(totalItems),
              })
            }}</span>
            <v-pagination
              v-if="pageCount > 1"
              v-model="page"
              :length="pageCount"
              :total-visible="5"
              class="sd-modern-pagination"
              density="compact"
            />
          </footer>
        </template>
      </v-data-table-server>
      <v-dialog
        :model-value="messenger_open"
        fullscreen
        :transition="false"
        :aria-label="$t('shop_contacts.modern.inbox')"
        @update:model-value="
          (value) => {
            if (!value) closeMessenger();
          }
        "
      >
        <v-card
          class="sd-modern-widget b-contacts-messenger text-start"
          :class="{
            'b-contacts-messenger--list': mobile_list,
            'b-contacts-messenger--customer': mobile_customer,
            'b-contacts-messenger--with-context': customer_context_open,
          }"
        >
          <header class="b-contacts-messenger__header">
            <v-btn
              variant="text"
              :prepend-icon="$t('icons.chevron_back')"
              class="sd-modern-button sd-modern-button--small"
              @click="closeMessenger"
              >{{ $t("shop_contacts.modern.back_to_contacts") }}</v-btn
            >
            <h2>
              <v-icon icon="forum" size="20" aria-hidden="true" />{{
                $t("shop_contacts.modern.inbox")
              }}
            </h2>
          </header>
          <div class="b-contacts-messenger__workspace">
            <aside
              class="b-contacts-messenger__sidebar"
              :aria-label="$t('shop_contacts.modern.conversations')"
            >
              <div class="b-contacts-messenger__sidebar-heading">
                <h3>{{ $t("shop_contacts.modern.conversations") }}</h3>
                <span v-if="!busy_fetch && !fetch_error">{{
                  $n(totalItems)
                }}</span>
              </div>
              <div class="sd-modern-list-toolbar b-contacts-messenger__search">
                <v-text-field
                  v-model="search"
                  :placeholder="$t('shop_contacts.modern.search')"
                  :aria-label="$t('shop_contacts.modern.search')"
                  prepend-inner-icon="search"
                  clearable
                  hide-details
                  single-line
                  variant="plain"
                />
              </div>
              <v-progress-linear
                v-if="busy_fetch"
                indeterminate
                color="primary"
                height="2"
                :aria-label="$t('shop_contacts.modern.conversations')"
              />
              <div
                v-if="fetch_error"
                class="b-contacts-messenger__notice"
                role="status"
              >
                <p>{{ $t("shop_contacts.modern.load_error") }}</p>
                <v-btn
                  variant="text"
                  class="sd-modern-button sd-modern-button--small"
                  @click="reloadModern"
                  >{{ $t("global.actions.retry") }}</v-btn
                >
              </div>
              <nav
                class="b-contacts-messenger__contacts"
                :aria-label="$t('shop_contacts.modern.conversations')"
                :aria-busy="busy_fetch"
              >
                <button
                  v-for="contact in contacts"
                  :key="contact.id"
                  :id="'messenger-preview-' + $.uid + '-' + contact.id"
                  type="button"
                  class="sd-modern-clickable-item b-contacts-messenger__contact"
                  :class="{
                    'b-contacts-messenger__contact--selected':
                      contact.id === selectedContact?.id,
                  }"
                  :aria-pressed="contact.id === selectedContact?.id"
                  @mouseenter="checkPreview($event, contact)"
                  @focusin="checkPreview($event, contact)"
                  @click="showContact(contact)"
                >
                  <v-avatar size="40"
                    ><img
                      :src="
                        contact.user_id
                          ? getUserAvatar(contact.user_id)
                          : require('../../../assets/icons/user.svg')
                      "
                      alt=""
                  /></v-avatar>
                  <span class="b-contacts-messenger__contact-copy">
                    <span class="b-contacts-messenger__contact-top"
                      ><strong dir="auto">{{
                        contact.user?.name ||
                        contact.name ||
                        $t("global.commons.user")
                      }}</strong
                      ><time>{{
                        getFromNowString(
                          contact.closed
                            ? contact.closed_at
                            : contact.updated_at,
                        )
                      }}</time></span
                    >
                    <span class="b-contacts-messenger__preview" dir="auto"
                      ><template v-if="getLastMessage(contact)?.message">{{
                        getLastMessage(contact).message
                      }}</template
                      ><template v-else-if="getLastMessage(contact)?.product"
                        ><v-icon
                          icon="local_mall"
                          size="14"
                          aria-hidden="true"
                        />
                        {{ $t("global.commons.product") }}</template
                      ><template v-else>—</template></span
                    >
                    <span
                      class="sd-modern-status sd-modern-status--plain b-contacts-messenger__status"
                      ><span
                        class="sd-modern-status__dot"
                        :class="contactStatusClass(contact)"
                      />{{ contactStatus(contact) }}</span
                    >
                  </span>
                  <v-tooltip
                    :activator="
                      '#messenger-preview-' + $.uid + '-' + contact.id
                    "
                    :disabled="preview_overflow !== contact.id"
                    content-class="sd-modern-tooltip"
                    location="top"
                    :text="getLastMessage(contact)?.message"
                  />
                </button>
                <div
                  v-if="!contacts.length && !busy_fetch && !fetch_error"
                  class="sd-modern-empty-state"
                >
                  <v-icon
                    :icon="search ? 'search_off' : 'question_answer'"
                    size="26"
                    aria-hidden="true"
                  />
                  <p>
                    {{
                      $t(
                        search
                          ? "shop_contacts.modern.no_results"
                          : "shop_contacts.modern.empty",
                      )
                    }}
                  </p>
                </div>
              </nav>
              <footer v-if="totalItems" class="b-contacts-messenger__footer">
                <span aria-live="polite">{{
                  $t("shop_contacts.modern.range", {
                    from: $n((page - 1) * itemsPerPage + 1),
                    to: $n(Math.min(page * itemsPerPage, totalItems)),
                    total: $n(totalItems),
                  })
                }}</span>
                <v-pagination
                  v-if="pageCount > 1"
                  v-model="page"
                  :length="pageCount"
                  :total-visible="3"
                  density="compact"
                  class="sd-modern-pagination"
                />
              </footer>
            </aside>
            <main class="b-contacts-messenger__thread">
              <b-contact-conversation
                v-if="selectedContact"
                :key="selectedContact.id"
                :selected-contact="selectedContact"
                :shop="shop"
                modern
                :can-write="can_write"
                class="b-contacts-messenger__conversation"
                @update="(support) => AddOrUpdateItemByID(contacts, support)"
                @update:selectedContact="
                  (value) => $emit('update:selectedContact', value)
                "
                @click:close="showMessengerList"
                @click:customer="showCustomerContext"
              />
            </main>
            <aside v-if="selectedContact && customer_context_open" class="b-contacts-messenger__customer" :aria-label="$t('shop_contacts.modern.context.title')">
              <b-contact-customer-context :shop="shop" :contact="selectedContact" @close="hideCustomerContext" />
            </aside>
          </div>
        </v-card>
      </v-dialog>
    </template>
    <template v-else>
      <s-data-iterator-toolbar
        v-model:items-per-page="itemsPerPage"
        v-model:search="search"
        v-model:sort-key="sortBy[0].key"
        v-model:sort-order="sortBy[0].order"
        :base-items-count="6"
        :color="isSmall ? ThemeColorDark : undefined"
        :dark="isSmall"
        :sort-keys="keys"
        dense
        small
        style="margin: 0 !important"
      >
        <v-menu :close-on-content-click="false" z-index="99999999">
          <template v-slot:activator="{ props }">
            <v-btn icon size="small" v-bind="props">
              <v-icon>more_vert</v-icon>
            </v-btn>
          </template>

          <v-sheet
            class="p-2 text-start small-label"
            color="#fff"
            min-width="220"
            rounded
          >
            <small class="font-weight-bold">
              {{ $t("global.commons.options") }}
            </small>
            <v-switch
              v-model="details"
              :label="$t('global.commons.show_details')"
              color="blue"
              density="compact"
              hide-details
              inset
            ></v-switch>

            <v-checkbox
              v-for="(category, key) in SupportCategory"
              :key="key"
              v-model="categories"
              :label="$t(category.name)"
              :value="category.code"
              hide-details
            >
            </v-checkbox>
          </v-sheet>
        </v-menu>
      </s-data-iterator-toolbar>

      <v-row :no-gutters="small_mode" class="mt-3" style="min-height: 100%">
        <v-col
          v-if="!selectedContact || !small_mode"
          :class="small_mode ? '' : 'border-end'"
          :md="small_mode ? 12 : 3"
          class="d-flex flex-column min-height-60vh"
          cols="12"
        >
          <!------------------------------- List ----------------------------------->

          <v-data-iterator
            v-model:options="options"
            v-model:page="page"
            v-model:sort-by="sortBy"
            :class="{ 'chats-list-popup': small_mode }"
            :items="contacts"
            :items-length="totalItems"
            :items-per-page="itemsPerPage"
            :loading="busy_fetch"
            :search="search"
            class="flex-grow-1"
            hide-default-footer
            no-data-text=""
          >
            <template v-slot:loading>
              <u-loading-ellipsis css-mode light></u-loading-ellipsis>
            </template>
            <template v-slot:no-data>
              <v-icon class="center-absolute" color="#ddd" size="80"
                >add_comment
              </v-icon>
            </template>

            <template v-slot:default="{ items }">
              <v-fade-transition group hide-on-leave>
                <v-card
                  v-for="item in items"
                  :key="item.raw.id"
                  :class="{ '-active': item === selectedContact }"
                  :color="item === selectedContact ? ThemeColorDark : undefined"
                  :dark="item === selectedContact"
                  class="support-item text-nowrap"
                  @click="showContact(item.raw)"
                >
                  <v-card-title>
                    <v-avatar class="me-2 hover-scale-small" size="36">
                      <img
                        :src="
                          item.raw.user_id
                            ? getUserAvatar(item.raw.user_id)
                            : require('../../../assets/icons/user.svg')
                        "
                      />
                    </v-avatar>

                    <div class="text-start small">
                      <b>
                        {{ item.raw.user ? item.raw.user.name : item.raw.name }}
                      </b>
                      <u-rating-emoji
                        v-if="item.raw.closed"
                        v-model="item.raw.rate"
                        class="ms-1 inline-block"
                        dense
                        no-stars
                        read-only
                        x-small
                      ></u-rating-emoji>

                      <p v-if="getLastMessage(item.raw)" class="m-0">
                        <small class="me-1 cap">
                          {{
                            getLastMessage(item.raw).officer
                              ? $t("global.commons.officer")
                              : $t("global.commons.user")
                          }}:
                        </small>
                        <small
                          class="limited-text-100px d-inline-block vertical-align-middle"
                        >
                          <span v-if="getLastMessage(item.raw).message">
                            {{ getLastMessage(item.raw).message }}
                          </span>
                          <span v-else-if="getLastMessage(item.raw).product">
                            <v-icon size="small">local_mall</v-icon>
                            {{ $t("global.commons.product") }}
                          </span>
                        </small>
                      </p>
                    </div>

                    <v-spacer></v-spacer>

                    <v-badge v-if="item.raw.mention_id" color="#C2185B" dot>
                      <v-avatar
                        class="hover-scale-small me-1"
                        size="24"
                        title="Mention"
                      >
                        <img :src="getUserAvatar(item.raw.mention_id)" />
                      </v-avatar>
                    </v-badge>

                    <v-badge v-if="item.raw.officer_id" color="blue" dot>
                      <v-avatar
                        class="hover-scale-small"
                        size="24"
                        title="Officer"
                      >
                        <img :src="getUserAvatar(item.raw.officer_id)" />
                      </v-avatar>
                    </v-badge>

                    <v-chip
                      v-if="item.raw.waiting"
                      class="absolute-top-start"
                      color="transparent"
                      size="x-small"
                    >
                      <v-icon
                        class="blink-me"
                        color="#CDDC39"
                        size="x-small"
                        start
                        >lens
                      </v-icon>
                      {{ $t("global.commons.waiting") }}
                    </v-chip>

                    <small
                      v-if="!item.raw.closed"
                      class="absolute-top-end ch-time"
                      >{{ getFromNowString(item.raw.updated_at) }}</small
                    >
                    <small v-else class="absolute-top-end ch-time text-success">
                      <v-icon class="me-1" color="success" size="small"
                        >done_all
                      </v-icon>
                      {{ getFromNowString(item.raw.closed_at) }}</small
                    >
                  </v-card-title>

                  <v-card-text v-if="details">
                    <div class="d-flex text-center mb-1">
                      <div class="w-50 mb-1 p-1">
                        <v-icon class="me-2" size="small">mail</v-icon>
                        <span v-copy
                          >{{
                            item.raw.user ? item.raw.user.email : item.raw.email
                          }}
                        </span>
                      </div>
                      <div class="w-50 mb-1 p-1">
                        <v-icon class="me-2" size="small">phone</v-icon>
                        <span v-copy
                          >{{
                            item.raw.user ? item.raw.user.phone : item.raw.phone
                          }}
                        </span>
                      </div>
                    </div>

                    <div
                      class="d-flex text-center align-items-center border-between"
                    >
                      <div class="w-50 p-1">
                        <u-rating-emoji
                          v-model="item.raw.rate"
                          dense
                          read-only
                          x-small
                        ></u-rating-emoji>
                      </div>

                      <div class="w-50 p-1">
                        <div>
                          <small>{{ $t("global.commons.created_at") }}: </small
                          >{{ getLocalTimeStringSmall(item.raw.created_at) }}
                        </div>
                        <div>
                          <small>{{ $t("global.commons.updated_at") }}: </small
                          >{{ getLocalTimeStringSmall(item.raw.updated_at) }}
                          <br /><span class="small"
                            >({{ getFromNowString(item.raw.created_at) }})</span
                          >
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-fade-transition>
            </template>

            <template v-slot:footer>
              <v-pagination
                v-if="pageCount > 1"
                v-model="page"
                :length="pageCount"
                rounded
              />
            </template>
          </v-data-iterator>
        </v-col>

        <v-col v-if="selectedContact" :md="small_mode ? 12 : 9" cols="12">
          <!------------------------------- Chat ----------------------------------->
          <b-contact-conversation
            :popup="isSmall"
            :selected-contact="selectedContact"
            :shop="shop"
            @update="(support) => AddOrUpdateItemByID(contacts, support)"
            @update:selectedContact="
              (val) => $emit('update:selectedContact', val)
            "
            @click:close="$emit('update:selectedContact', null)"
          ></b-contact-conversation>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="showContact(null)">
              <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
              {{ $t("global.actions.back") }}
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import { SupportCategory } from "@selldone/core-js/enums/support/SupportCategory";
import URatingEmoji from "../../../ui/rating/emoji/URatingEmoji.vue";
import { throttle } from "lodash-es";
import BContactConversation from "../../contact/conversation/BContactConversation.vue";
import SDataIteratorToolbar from "../../../ui/toolbar/SDataIteratorToolbar.vue";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import BContactCustomerContext from "../context/BContactCustomerContext.vue";

export default {
  name: "BContactsList",
  mixins: [TemplateMixin, DateMixin],

  components: {
    BContactCustomerContext,
    ULoadingEllipsis,
    SDataIteratorToolbar,
    BContactConversation,
    URatingEmoji,
  },

  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    isSmall: {
      default: false,
      type: Boolean,
    },

    selectedContact: {
      default: null,
      type: Object,
    },
  },

  data: () => ({
    contacts: [],

    offset: 0,
    more: true,

    busy_fetch: false,
    fetch_error: false,
    request_id: 0,
    preview_overflow: null,
    messenger_open: false,
    mobile_list: false,
    mobile_customer: false,
    customer_context_open: true,

    search: "",
    filter: {},
    sortBy: [{ key: null, order: "desc" }],

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},

    //------------------

    details: false,

    categories: Object.keys(SupportCategory),
    SupportCategory: SupportCategory,

    //------------------

    windowSize: {
      x: 0,
      y: 0,
    },
    //------------------
    message: null,
    busy_send: false,
  }),

  computed: {
    can_write() {
      return this.writeShopAccess(ShopPermissionRegions.CUSTOMERS.code);
    },
    modernHeaders() {
      return [
        {
          title: this.$t("shop_contacts.modern.customer"),
          key: "customer",
          sortable: false,
          width: "25%",
        },
        {
          title: this.$t("shop_contacts.modern.latest_message"),
          key: "message",
          sortable: false,
          width: "35%",
        },
        {
          title: this.$t("shop_contacts.modern.staff"),
          key: "officer_id",
          sortable: false,
          width: "12%",
        },
        {
          title: this.$t("global.sort.mention"),
          key: "mention_id",
          sortable: false,
          width: "12%",
        },
        {
          title: this.$t("shop_contacts.modern.updated"),
          key: "updated_at",
          sortable: false,
          width: "16%",
        },
      ];
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    keys() {
      return [
        { label: "global.sort.user", value: "user_id" },
        { label: "global.sort.officer", value: "officer_id" },
        { label: "global.sort.mention", value: "mention_id" },
        { label: "global.sort.created_at", value: "created_at" },
        { label: "global.sort.updated_at", value: "updated_at" },
      ];
    },
    small_mode() {
      return this.isSmall || this.windowSize.x < 960;
    },

    headers() {
      return [
        {
          title: "Shop",
          align: "center",
          sortable: true,
          value: "shop_id",
        },
        {
          title: "User",
          align: "start",
          sortable: true,
          value: "user_id",
        },
        {
          title: "Date",
          align: "start",
          sortable: true,
          value: "created_at",
        },
        {
          title: "Closed",
          align: "start",
          sortable: true,
          value: "closed_at",
        },
        {
          title: "Last message",
          align: "start",
          sortable: true,
          value: "messages",
        },

        {
          title: "Status",
          align: "center",
          sortable: false,
        },

        {
          title: "Officer",
          align: "center",
          sortable: true,
          value: "officer_id",
        },

        {
          title: "Mention",
          align: "center",
          sortable: true,
          value: "mention_id",
        },

        {
          title: "Link",
          align: "center",
          sortable: true,
          value: "shop_id",
        },
      ];
    },
  },

  watch: {
    selectedContact(value) {
      if (this.modern && !value) {
        this.messenger_open = false;
        this.mobile_list = false;
        this.mobile_customer = false;
        this.customer_context_open = true;
      }
    },
    // Pagination:
    options: {
      handler() {
        if (this.modern) return;
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchSupports(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    search: throttle(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      if (this.modern) return this.resetModernQuery();
      //  console.log("search", newVal);
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchSupports(1, sortBy[0]?.key, sortBy[0]?.order === "desc", false);
    }, window.SERACH_THROTTLE),

    categories() {
      if (this.modern) return this.resetModernQuery();
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchSupports(1, sortBy[0]?.key, sortBy[0]?.order === "desc", false);
    },
  },

  mounted() {
    this.onResize();
  },
  methods: {
    updateModernOptions({ page, itemsPerPage, sortBy }) {
      this.page = page;
      this.itemsPerPage = itemsPerPage;
      this.sortBy = sortBy.length
        ? sortBy
        : [{ key: "updated_at", order: "desc" }];
      return this.reloadModern();
    },
    resetModernQuery() {
      if (this.page !== 1) {
        this.page = 1;
        return;
      }
      return this.reloadModern();
    },
    reloadModern() {
      return this.fetchSupports(
        this.page,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    },
    modernRowProps({ item }) {
      return {
        id: "contact-preview-" + this.$.uid + "-" + item.id,
        class: "sd-modern-clickable-item",
        tabindex: 0,
        onMouseenter: (event) => this.checkPreview(event, item),
        onFocusin: (event) => this.checkPreview(event, item),
        onKeydown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.showContact(item);
          }
        },
      };
    },
    checkPreview(event, item) {
      const preview = event.currentTarget.querySelector(
        ".b-contacts-modern__preview, .b-contacts-messenger__preview",
      );
      this.preview_overflow =
        preview && preview.scrollHeight > preview.clientHeight + 1
          ? item.id
          : null;
    },
    contactStatus(contact) {
      const status = contact.closed
        ? "closed"
        : contact.waiting
          ? "awaiting_reply"
          : this.getLastMessage(contact)?.officer
            ? "replied"
            : "open_conversation";
      return this.$t("shop_contacts.modern." + status);
    },
    contactStatusClass(contact) {
      if (
        contact.closed ||
        (this.getLastMessage(contact)?.officer && !contact.waiting)
      )
        return "sd-modern-status__dot--success";
      return contact.waiting ? "sd-modern-status__dot--warning" : "";
    },
    fetchSupports(page, sortBy, sortDesc = true) {
      const request = ++this.request_id;
      this.busy_fetch = true;
      this.fetch_error = false;

      return axios
        .get(window.API.GET_SHOP_CONTACT_US_LIST(this.shop.id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,

            search: this.search,

            categories: this.categories,
          },
        })
        .then(({ data }) => {
          if (request !== this.request_id) return;
          if (data.error) {
            this.fetch_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.contacts = data.contacts;
          this.totalItems = data.total;
        })
        .catch((error) => {
          if (request !== this.request_id) return;
          this.fetch_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request === this.request_id) this.busy_fetch = false;
        });
    },

    showContact(contact) {
      if (this.modern) {
        if (contact && !this.messenger_open)
          this.customer_context_open = this.windowSize.x > 1000;
        this.messenger_open = !!contact;
        this.mobile_list = false;
        this.mobile_customer = false;
        if (!contact) this.customer_context_open = true;
      }
      this.$emit("update:selectedContact", contact);
    },
    closeMessenger() {
      this.showContact(null);
    },
    showMessengerList() {
      this.mobile_list = true;
      this.mobile_customer = false;
    },
    showCustomerContext() {
      if (this.windowSize.x <= 760) {
        this.mobile_customer = true;
        this.mobile_list = false;
        this.customer_context_open = true;
      } else {
        this.customer_context_open = !this.customer_context_open;
      }
    },
    hideCustomerContext() {
      this.customer_context_open = false;
      this.mobile_customer = false;
    },

    getLastMessage(contact) {
      return contact.messages?.[contact.messages.length - 1];
    },

    onResize() {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight };
    },

    //-----------------------------------------------------------------------------------
    sendForm() {
      this.message = this.message.replace(/<[^>]*>?/gm, "");
      if (!this.message) return;

      this.busy_send = true;

      const user = this.USER();

      axios
        .post(window.XAPI.POST_CONTACT_US_FORM(this.shop.name), {
          name: user.name,
          email: user.email,
          phone: user.phone,
          message: this.message,
          category: this.category,
          url: window.location.href,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.message = "";
            this.category = null;
            this.AddOrUpdateItemByID(this.contacts, data.contact, "id", false);
            this.totalItems++;

            setTimeout(() => {
              this.showContact(data.contact);
            }, 550);

            NotificationService.showSuccessAlert(
              null,
              this.$t("contact_us_form.notifications.success"),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_send = false;
        });
    },
  },

  created() {
    if (this.modern) {
      this.itemsPerPage = 6;
      this.sortBy = [{ key: "updated_at", order: "desc" }];
    }
  },
};
</script>

<style lang="scss" scoped>
.b-contacts-messenger {
  width: 100%;
  height: 100%;
  max-height: 100dvh;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;

  &.v-card {
    overflow: hidden;
  }

  &__header {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 24px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__header h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }
  &__workspace {
    flex: 1;
    display: grid;
    grid-template-columns: 218px minmax(0, 1fr);
    min-height: 0;
    min-width: 0;
    position: relative;
  }
  &--with-context &__workspace {
    grid-template-columns: 218px minmax(0, 1fr) 272px;
  }
  &__customer {
    min-width: 0;
    min-height: 0;
    border-inline-start: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }
  &__sidebar {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    background: rgba(var(--v-theme-on-surface), 0.018);
    border-inline-end: 1px solid var(--sd-modern-border);
  }
  &__sidebar-heading {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 20px 16px 8px;
  }
  &__sidebar-heading h3 {
    margin: 0;
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
  }
  &__sidebar-heading > span {
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__search {
    margin: 0;
    padding: 0 16px 14px;
    flex: 0 0 auto;
  }
  &__contacts {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-block: 4px;
  }
  &__contact {
    width: 100%;
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 9px;
    padding: 16px 14px;
    border: 0;
    border-inline-start: 2px solid transparent;
    border-block-end: 1px solid var(--sd-modern-border);
    text-align: start;
    color: inherit;
    background: transparent;
    font: inherit;
    :deep(.v-avatar) { width: 32px !important; height: 32px !important; }
  }
  &__contact--selected {
    border-inline-start-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.055);
  }
  &__contact-copy {
    display: grid;
    gap: 5px;
    min-width: 0;
  }
  &__contact-top {
    display: flex;
    align-items: baseline;
    gap: 5px;
    justify-content: space-between;
    min-width: 0;
  }
  &__contact-top strong {
    min-width: 0;
    font-size: 12px;
    line-height: 19px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  &__contact-top time {
    flex: 0 0 auto;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__preview {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  &__status {
    font-size: 11px;
    line-height: 17px;
    justify-self: start;
  }
  &__notice {
    padding: 12px 20px;
    color: rgb(var(--v-theme-on-surface));
    font-size: 12px;
    line-height: 19px;
  }
  &__notice p {
    margin: 0 0 6px;
  }
  &__footer {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    border-block-start: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__thread {
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }
  &__conversation
    :deep(.b-contact-conversation-modern__identity > .sd-modern-icon-button) {
    display: none;
  }
  &__conversation :deep(.b-contact-conversation-modern__message) {
    max-width: min(91%, 680px);
  }

  @media (min-width: 761px) and (max-width: 1000px) {
    &--with-context &__workspace { grid-template-columns: 218px minmax(0, 1fr); }
    &__customer { position: absolute; inset-inline-end: 0; top: 0; bottom: 0; width: 272px; z-index: 3; box-shadow: -12px 0 28px rgba(var(--v-theme-on-surface), .1); }
  }

  @media (max-width: 760px) {
    &__header {
      padding: 10px 14px;
      gap: 8px;
    }
    &__header h2 {
      font-size: 14px;
      line-height: 22px;
    }
    &__workspace, &--with-context &__workspace {
      display: block;
    }
    &__sidebar {
      height: 100%;
      border: 0;
      display: none;
    }
    &__thread {
      height: 100%;
    }
    &__customer { display: none; height: 100%; border: 0; }
    &--list &__sidebar {
      display: flex;
    }
    &--list &__thread {
      display: none;
    }
    &--customer &__sidebar, &--customer &__thread { display: none; }
    &--customer &__customer { display: block; }
    &__contact { grid-template-columns: 40px minmax(0, 1fr); gap: 12px; padding: 17px 18px; :deep(.v-avatar) { width: 40px !important; height: 40px !important; } }
    &__contact-top strong { font-size: 13px; }
    &__preview { font-size: 12px; line-height: 19px; }
    &__conversation
      :deep(.b-contact-conversation-modern__identity > .sd-modern-icon-button) {
      display: inline-flex;
    }
    &__conversation :deep(.b-contact-conversation-modern__message) {
      max-width: 96%;
    }
    &__search :deep(.v-field__input) {
      font-size: 16px;
    }
  }
}
.b-contacts-modern {
  font-size: 13px;
  line-height: 20px;
  &__toolbar {
    padding: 20px 24px 12px;
    border: 0;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  h2 {
    font-size: 16px;
    line-height: 22px;
    font-weight: 500;
  }
  &__count {
    color: var(--sd-modern-muted);
    font-size: 12px;
    margin-inline-start: 3px;
  }
  &__search {
    flex: 0 1 240px;
    min-width: 160px;
  }
  &__tools {
    padding: 0 24px 15px;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  &__sort,
  &__options,
  &__per-page {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  &__sort,
  &__per-page {
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__sort-select {
    width: 130px;
    flex: 0 1 130px;
  }
  &__options > .sd-modern-button {
    border-color: var(--sd-modern-border);
  }
  &__per-page .v-input {
    width: 58px;
  }
  &__filters {
    padding: 16px 20px;
    min-width: 230px;
    max-width: calc(100vw - 32px);
  }
  &__filters h3 {
    font: inherit;
    font-weight: 500;
  }
  &__table {
    --sd-modern-table-font-size: 13px;
    --sd-modern-table-line-height: 20px;
    padding-inline: 12px;
  }
  &__customer {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  &__identity {
    min-width: 0;
  }
  &__name {
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  &__state {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-block-start: 2px;
  }
  &__state .sd-modern-status {
    font-size: 11px;
    line-height: 17px;
    white-space: normal;
  }
  &__preview {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  &__date {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  &__details {
    display: grid;
    gap: 5px;
    padding-block-start: 10px;
    font-size: 11px;
    line-height: 17px;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
  }
  &__footer {
    padding: 16px 12px;
    margin: 0;
    font-size: 11px;
  }
  @media (max-width: 760px) {
    &__toolbar {
      padding: 18px;
      gap: 10px;
    }
    &__search {
      flex-basis: 100%;
    }
    &__tools {
      padding: 0 18px 15px;
      gap: 12px;
    }
    &__sort,
    &__options {
      width: 100%;
      justify-content: space-between;
    }
    &__sort-select {
      flex: 1;
      min-width: 0;
    }
    &__options .sd-modern-button {
      white-space: normal;
      height: auto;
      min-height: 44px;
    }
    &__per-page {
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
    }
    &__table {
      padding-inline: 18px;
    }
    &__footer {
      padding-inline: 0;
      gap: 12px;
      flex-wrap: wrap;
    }
    :deep(.v-field__input) {
      font-size: 16px;
    }
    :deep(.v-select__selection-text) {
      font-size: 16px;
    }
  }
}
.support-item {
  text-align: start;
  padding: 4px 8px 0 8px;
  // border-bottom: solid #ddd thin !important;
  box-shadow: none !important;
  font-weight: 400;
  transition: all 0.3s ease-in-out;
  margin: 8px 0;

  &:hover {
    box-shadow: 0px 10px 50px 0px rgba(96, 96, 96, 0.2) !important;
    border-radius: 8px;
    z-index: 2;
  }

  .-officer {
    border: solid #0f75ac 4px;
  }

  .-mention {
    border: solid #8fc108 4px;
  }

  &.-active {
    box-shadow: 0px 10px 50px 0px rgba(96, 96, 96, 0.2) !important;
    color: #fff !important;
    border-radius: 8px;

    small {
      color: rgba(255, 255, 255, 0.93);
    }

    .v-card__title {
      .cap {
        color: #fff;
      }
    }
  }

  .v-card__title {
    font-size: 1.1rem;

    .v-avatar {
      margin: 4px;
    }
  }

  .v-card__title {
    text-align: left !important;
    line-height: normal !important;

    .cap {
      color: #0c91d3;
    }
  }
}

.chats-list-popup {
  //height: 550px;
  // max-height: calc(100vh - 180px);
  padding: 0 8px;
  scrollbar-width: thin;
  overflow-y: auto;
  background-color: #fafafa;
  padding-bottom: 60px;
  min-height: 50vh;
}

.ch-time {
  font-size: 0.6em !important;
}

.bottom-action {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  z-index: 9;
}
</style>
