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
  <v-card
    class="b-vendor-editor text-start"
    :class="{ 'b-vendor-editor--dialog': dialogMode }"
    flat
  >
    <v-card-title class="b-vendor-editor__top">
      <v-avatar class="b-vendor-editor__avatar" size="38" rounded="lg">
        <v-img v-if="vendor?.icon" :src="getShopImagePath(vendor.icon, 128)" />
        <v-icon v-else aria-hidden="true">storefront</v-icon>
      </v-avatar>
      <div class="b-vendor-editor__identity">
        <h1>
          {{
            $t(
              vendor
                ? "vendor_add.editor.edit_title"
                : "vendor_add.editor.add_title",
            )
          }}
        </h1>
        <p>{{ name || $t("vendor_add.editor.new_vendor") }}</p>
      </div>
      <div class="b-vendor-editor__top-actions">
        <span v-if="vendor" class="sd-modern-status sd-modern-status--plain">
          <i
            class="sd-modern-status__dot"
            :class="
              enable
                ? 'sd-modern-status__dot--success'
                : 'sd-modern-status__dot--error'
            "
            aria-hidden="true"
          />
          {{ $t(enable ? "global.commons.enable" : "global.commons.disable") }}
        </span>
        <v-btn
          v-if="vendor && !IS_VENDOR_PANEL"
          :href="vendor_listing_page_url"
          :disabled="!vendor.enable"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
          target="_blank"
          rel="noopener noreferrer"
          append-icon="north_east"
        >
          {{ $t("vendor_add.profile.action_see_listing_page") }}
        </v-btn>
        <v-btn
          v-if="dialogMode"
          class="sd-modern-icon-button"
          icon="close"
          variant="text"
          :disabled="busy || busy_delete"
          :aria-label="$t('global.actions.close')"
          @click="$emit('close')"
        >
          <v-icon aria-hidden="true">close</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text class="sd-modern-canvas b-vendor-editor__body">
      <div class="b-vendor-editor__workspace">
        <nav
          class="sd-modern-section-nav b-vendor-editor__nav"
          :aria-label="$t('vendor_add.editor.edit_title')"
        >
          <button
            v-for="section in sections"
            :key="section.value"
            type="button"
            class="sd-modern-section-nav__item"
            :class="{
              'b-vendor-editor__critical-nav': section.value === 'critical',
            }"
            :aria-current="tab === section.value ? 'location' : undefined"
            @click="tab = section.value"
          >
            <v-icon size="17" aria-hidden="true">{{ section.icon }}</v-icon>
            <span>{{ $t(section.label) }}</span>
            <i
              v-if="section.warning"
              class="sd-modern-status__dot sd-modern-status__dot--warning"
              aria-hidden="true"
            />
          </button>
          <div
            v-if="vendor && IS_VENDOR_PANEL"
            class="b-vendor-editor__public-page"
          >
            <v-btn
              :href="vendor_listing_page_url"
              :disabled="!vendor.enable"
              class="sd-modern-button sd-modern-button--inline b-vendor-editor__public-page-link"
              color="primary"
              variant="text"
              target="_blank"
              rel="noopener noreferrer"
              append-icon="north_east"
            >
              {{ $t("vendor_add.profile.action_see_listing_page") }}
            </v-btn>
          </div>
          <div v-if="resource_sections.length" class="sd-modern-section-nav b-vendor-editor__resource-nav">
            <p class="sd-modern-eyebrow">{{ $t('vendor_add.editor.related_resources') }}</p>
            <button
              v-for="section in resource_sections"
              :key="section.value"
              type="button"
              class="sd-modern-section-nav__item"
              :aria-current="tab === section.value ? 'location' : undefined"
              @click="openResource(section.value)"
            >
              <v-icon size="17" aria-hidden="true">{{ section.icon }}</v-icon>
              <span>{{ $t(section.label) }}</span>
            </button>
          </div>
        </nav>

        <div class="b-vendor-editor__content" :class="{ 'b-vendor-editor__content--resource': active_resource }">
          <header class="b-vendor-editor__heading">
            <h2 ref="heading" tabindex="-1">
              {{ $t(active_section?.label || "vendor_add.menu.profile") }}
            </h2>
            <p>{{ $t("vendor_add.editor." + tab + "_subtitle") }}</p>
          </header>

          <v-form
            ref="form"
            v-show="tab !== 'critical' && !active_resource"
            lazy-validation
            @submit.prevent="vendor ? updateVendor() : addVendor()"
          >
            <v-window v-model="tab" :continuous="false" mandatory>
              <v-window-item
                value="profile"
                eager
                :transition="false"
                :reverse-transition="false"
              >
                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Routine drafts stay mounted across sections ▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <div class="b-vendor-editor__stack">
                  <section class="sd-modern-widget b-vendor-editor__widget">
                    <div class="b-vendor-editor__widget-heading">
                      <h3>
                        <v-icon size="17" aria-hidden="true">storefront</v-icon
                        >{{ $t("vendor_add.editor.public_identity") }}
                      </h3>
                      <p>{{ $t("vendor_add.editor.public_subtitle") }}</p>
                    </div>
                    <div v-if="vendor" class="b-vendor-editor__logo">
                      <s-image-uploader
                        :image="getShopImagePath(vendor.icon, 128)"
                        :server="
                          IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                            ? window.VAPI.POST_MY_VENDOR_UPLOAD_VENDOR_ICON(
                                $route.params.vendor_id,
                              )
                            : window.API.POST_UPLOAD_VENDOR_ICON(
                                shop.id,
                                vendor.id,
                              )
                        "
                        auto-compact
                        modern
                        dense
                        :label="$t('vendor_add.inputs.logo.label')"
                        maxFileSize="2MB"
                        @new-path="handleProcessFileIcon"
                      />
                      <p class="b-vendor-editor__hint">
                        {{ $t("vendor_add.editor.logo_separate") }}
                      </p>
                    </div>
                    <div v-else class="sd-modern-notice">
                      <v-icon size="18" aria-hidden="true">info_outline</v-icon>
                      <div class="sd-modern-notice__content">
                        {{ $t("vendor_add.editor.logo_after_create") }}
                      </div>
                    </div>
                    <div
                      class="b-vendor-editor__fields b-vendor-editor__fields--identity"
                    >
                      <v-text-field
                        v-model="name"
                        :id="field_ids.name"
                        :label="$t('global.commons.name')"
                        :rules="[GlobalRules.required()]"
                        class="sd-modern-underlined-field b-vendor-editor__full"
                        variant="underlined"
                      >
                        <template #append-inner>
                          <b-translation-button-vendor
                            v-if="vendor?.id"
                            :label="$t('global.commons.name')"
                            :shop="shop"
                            :vendor="vendor"
                            translation-key="name"
                          />
                        </template>
                      </v-text-field>
                      <v-textarea
                        v-model="description"
                        :label="$t('global.commons.description')"
                        auto-grow
                        rows="2"
                        :placeholder="
                          $t('vendor_add.inputs.description.placeholder')
                        "
                        class="sd-modern-underlined-field b-vendor-editor__full"
                        variant="underlined"
                      >
                        <template #append-inner>
                          <b-translation-button-vendor
                            v-if="vendor?.id"
                            :label="$t('global.commons.description')"
                            :shop="shop"
                            :vendor="vendor"
                            translation-key="description"
                          />
                        </template>
                      </v-textarea>
                    </div>
                  </section>

                  <section class="sd-modern-widget b-vendor-editor__widget">
                    <div class="b-vendor-editor__widget-heading">
                      <h3>
                        <v-icon size="17" aria-hidden="true"
                          >person_outline</v-icon
                        >{{ $t("vendor_add.editor.account_title") }}
                      </h3>
                      <p>{{ $t("vendor_add.editor.account_subtitle") }}</p>
                    </div>
                    <div
                      v-if="invite_email && !user_id"
                      class="b-vendor-editor__invitation"
                    >
                      <div class="b-vendor-editor__row">
                        <span class="sd-modern-status sd-modern-status--plain">
                          <i
                            class="sd-modern-status__dot sd-modern-status__dot--warning"
                            aria-hidden="true"
                          />
                          {{
                            $t(
                              invite_email === vendor?.invite
                                ? "vendor_add.editor.invitation_pending"
                                : "vendor_add.editor.invitation_draft",
                            )
                          }}
                        </span>
                        <v-btn
                          v-if="
                            !IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢 Only marketplace owner can edit user*/
                          "
                          class="sd-modern-icon-button"
                          icon
                          variant="text"
                          :aria-label="
                            $t('vendor_add.editor.remove_invitation')
                          "
                          @click="invite_email = null"
                        >
                          <v-icon aria-hidden="true">close</v-icon>
                          <v-tooltip
                            activator="parent"
                            location="top"
                            open-on-focus
                            content-class="sd-modern-tooltip text-start"
                            >{{
                              $t("vendor_add.editor.remove_invitation")
                            }}</v-tooltip
                          >
                        </v-btn>
                      </div>
                      <p class="b-vendor-editor__value" dir="ltr">
                        {{ invite_email }}
                      </p>
                      <p class="b-vendor-editor__hint">
                        {{
                          $t(
                            invite_email === vendor?.invite
                              ? "vendor_add.send_invitation_tips"
                              : "vendor_add.editor.invitation_save_hint",
                          )
                        }}
                      </p>
                      <v-btn
                        v-if="
                          vendor &&
                          invite_email === vendor.invite &&
                          !IS_VENDOR_PANEL
                        "
                        class="sd-modern-button sd-modern-button--inline"
                        variant="text"
                        color="primary"
                        :loading="busy_send_invitation"
                        @click="sendInvitationEmail"
                        append-icon="send"
                      >
                        {{ $t("vendor_add.profile.send_invitation_email") }}
                      </v-btn>
                      <u-text-copy-box
                        v-if="generated_invite_link"
                        :value="generated_invite_link"
                        small-width-mode
                        text-start
                        :message="$t('vendor_add.profile.invitation_link')"
                      />
                    </div>
                    <s-user-input
                      v-else-if="!IS_VENDOR_PANEL && (user_edit || !user_id)"
                      v-model:user-id="user_id"
                      :label="$t('global.commons.user')"
                      :messages="$t('vendor_add.editor.owner_lookup_help')"
                      variant="underlined"
                      class="sd-modern-underlined-field"
                      can-invite
                      @update:model-value="
                        (val) => {
                          invite_email = val;
                          if (!email) email = val;
                        }
                      "
                    />
                    <div v-else-if="user_id" class="b-vendor-editor__owner">
                      <v-avatar class="avatar-gradient -thin -officer" size="38"
                        ><v-img :src="getUserAvatar(user_id)"
                      /></v-avatar>
                      <div
                        v-if="vendor?.user"
                        class="b-vendor-editor__owner-info"
                      >
                        <h3>
                          {{ vendor.user.name }}
                          <small>· {{ $t("global.commons.owner") }}</small>
                        </h3>
                        <p dir="ltr" v-copy>{{ vendor.user.email }}</p>
                      </div>
                      <v-btn
                        v-if="
                          !IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢 Only marketplace owner can edit user*/
                        "
                        class="sd-modern-icon-button"
                        icon
                        variant="text"
                        :aria-label="$t('global.actions.edit')"
                        @click="user_edit = true"
                      >
                        <v-icon aria-hidden="true">edit</v-icon>
                        <v-tooltip
                          activator="parent"
                          location="top"
                          open-on-focus
                          content-class="sd-modern-tooltip text-start"
                          >{{ $t("global.actions.edit") }}</v-tooltip
                        >
                      </v-btn>
                    </div>
                    <div
                      v-if="IS_VENDOR_PANEL"
                      class="sd-modern-notice b-vendor-editor__spaced"
                    >
                      <v-icon size="18" aria-hidden="true">info_outline</v-icon>
                      <div class="sd-modern-notice__content">
                        {{
                          $t("vendor_add.only_marketplace_owner_can_edit_user")
                        }}
                      </div>
                    </div>
                  </section>

                  <section class="sd-modern-widget b-vendor-editor__widget">
                    <div class="b-vendor-editor__widget-heading">
                      <h3>
                        <v-icon size="17" aria-hidden="true">web</v-icon
                        >{{ $t("vendor_add.page.title") }}
                      </h3>
                      <p>{{ $t("vendor_add.page.subtitle") }}</p>
                    </div>
                    <template
                      v-if="
                        !IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢 Vendor can't select landing page!*/
                      "
                    >
                      <b-page-input
                        v-model="page"
                        :shop="shop"
                        variant="underlined"
                        clearable
                        modern
                        :message="
                          page
                            ? $t('vendor_add.page.vendor_has_landing_msg')
                            : $t('vendor_add.page.no_landing_selected_msg')
                        "
                      />
                      <div
                        v-if="
                          page?.id && !edit_slug && vendor?.id /*Edit mode*/
                        "
                        class="b-vendor-editor__row b-vendor-editor__spaced"
                      >
                        <span class="b-vendor-editor__url" dir="ltr">{{
                          vendor_landing_page_url
                        }}</span>
                        <v-btn
                          class="sd-modern-icon-button"
                          icon
                          variant="text"
                          :aria-label="$t('vendor_add.editor.edit_path')"
                          @click="edit_slug = true"
                        >
                          <v-icon aria-hidden="true">edit</v-icon>
                          <v-tooltip
                            activator="parent"
                            location="top"
                            open-on-focus
                            content-class="sd-modern-tooltip text-start"
                            >{{ $t("vendor_add.editor.edit_path") }}</v-tooltip
                          >
                        </v-btn>
                      </div>
                      <v-text-field
                        v-else-if="page?.id"
                        v-model="slug"
                        :label="$t('vendor_add.inputs.slug.label')"
                        :placeholder="$t('vendor_add.inputs.slug.placeholder')"
                        prepend-inner-icon="view_cozy"
                        :hint="$t('vendor_add.inputs.slug.hint')"
                        variant="underlined"
                        class="sd-modern-underlined-field b-vendor-editor__spaced"
                      />
                    </template>
                    <div v-else class="b-vendor-editor__owner">
                      <v-avatar size="38" rounded>
                        <v-img
                          v-if="page?.image"
                          :src="getShopImagePath(page.image)"
                        />
                        <v-icon v-else aria-hidden="true">web</v-icon>
                      </v-avatar>
                      <div class="b-vendor-editor__owner-info">
                        <h3>
                          {{
                            page?.title || $t("vendor_add.page.no_landing_page")
                          }}
                        </h3>
                        <p>
                          {{
                            page
                              ? vendor_landing_page_url
                              : $t(
                                  "vendor_add.page.we_can_create_dedicated_landing_msg",
                                )
                          }}
                        </p>
                        <span v-if="page" class="b-vendor-editor__hint"
                          ><v-icon size="15" aria-hidden="true"
                            >visibility</v-icon
                          >
                          {{ numeralFormat(page.visits, "0.[0] a") }}</span
                        >
                      </div>
                    </div>
                    <v-btn
                      v-if="page"
                      :href="vendor_landing_page_url"
                      :disabled="!vendor?.enable || !vendor_landing_page_url"
                      class="sd-modern-button sd-modern-button--inline b-vendor-editor__spaced"
                      color="primary"
                      variant="text"
                      target="_blank"
                      rel="noopener noreferrer"
                      append-icon="north_east"
                      >{{ $t("vendor_add.page.action_set_page") }}</v-btn
                    >
                  </section>
                </div>
              </v-window-item>

              <v-window-item
                value="contact"
                eager
                :transition="false"
                :reverse-transition="false"
              >
                <div class="b-vendor-editor__stack">
                  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Contact info ▅▅▅▅▅▅▅▅▅▅▅▅ -->
                  <section class="sd-modern-widget b-vendor-editor__widget">
                    <div class="b-vendor-editor__widget-heading">
                      <h3>
                        <v-icon size="17" aria-hidden="true"
                          >alternate_email</v-icon
                        >{{ $t("vendor_add.contact.title") }}
                      </h3>
                    </div>
                    <div class="b-vendor-editor__fields">
                      <v-text-field
                        v-model="email"
                        :id="field_ids.email"
                        :label="$t('global.commons.email')"
                        :placeholder="
                          vendor?.user
                            ? $t('vendor_add.editor.default_email', {
                                email: vendor.user.email,
                              })
                            : $t('vendor_add.editor.email_placeholder')
                        "
                        :rules="[GlobalRules.email()]"
                        :messages="$t('vendor_add.inputs.email.message')"
                        dir="ltr"
                        class="sd-modern-underlined-field b-vendor-editor__full"
                        variant="underlined"
                      />
                      <div
                        v-if="
                          email && vendor?.user && vendor.user.email !== email
                        "
                        class="sd-modern-notice b-vendor-editor__full"
                      >
                        <v-icon size="18" color="warning" aria-hidden="true"
                          >notification_important</v-icon
                        >
                        <div class="sd-modern-notice__content">
                          {{ $t("vendor_add.editor.email_mismatch") }}
                        </div>
                      </div>
                      <s-country-select
                        v-model="country"
                        :label="$t('global.commons.country')"
                        item-value="alpha2"
                        variant="underlined"
                        class="sd-modern-underlined-field"
                        :menu-props="{ contentClass: 'sd-modern-select-menu' }"
                      />
                      <v-text-field
                        v-model="state"
                        :label="$t('global.address_info.state')"
                        variant="underlined"
                        class="sd-modern-underlined-field"
                      />
                      <v-text-field
                        v-model="address"
                        :label="$t('global.commons.address')"
                        variant="underlined"
                        class="sd-modern-underlined-field b-vendor-editor__full"
                      />
                      <v-text-field
                        v-model="web"
                        :label="$t('global.commons.website')"
                        dir="ltr"
                        variant="underlined"
                        class="sd-modern-underlined-field"
                      />
                      <v-text-field
                        v-model="tel"
                        :label="$t('global.commons.tel')"
                        dir="ltr"
                        variant="underlined"
                        class="sd-modern-underlined-field"
                      />
                    </div>
                    <!-- Preserve the notification recipient explanation and native process diagram. -->
                    <div
                      v-if="email || user_id"
                      class="b-vendor-editor__spaced"
                    >
                      <i18n-t
                        v-if="vendor"
                        keypath="vendor_add.editor.notification_recipient"
                        tag="p"
                        class="b-vendor-editor__hint"
                      >
                        <template #email
                          ><bdi>{{
                            email || vendor?.user?.email
                          }}</bdi></template
                        >
                      </i18n-t>
                      <u-pods-panel>
                        <u-pod-node
                          :image="getShopImagePath(shop.icon, 96)"
                          :title="shop.title"
                        />
                        <u-pod-wire forward />
                        <u-pod-node v-if="email" :title="email" icon="email" />
                        <u-pod-node
                          v-else-if="user_id"
                          :image="getUserAvatar(user_id)"
                          :title="$t('global.commons.user')"
                          rounded
                        />
                      </u-pods-panel>
                    </div>
                  </section>

                  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Location profile ▅▅▅▅▅▅▅▅▅▅▅▅ -->
                  <section class="sd-modern-widget b-vendor-editor__widget">
                    <div class="b-vendor-editor__widget-heading">
                      <h3>
                        <v-icon size="17" aria-hidden="true">location_on</v-icon
                        >{{ $t("vendor_add.editor.location_profile") }}
                      </h3>
                      <p>{{ $t("vendor_add.editor.location_subtitle") }}</p>
                    </div>
                    <div
                      v-if="vendor?.map && vendor?.map_id"
                      class="b-vendor-editor__location"
                    >
                      <v-icon size="25" aria-hidden="true">map</v-icon>
                      <div>
                        <h3>
                          <flag
                            v-if="vendor.map.country"
                            :iso="vendor.map.country"
                            :squared="false"
                            class="me-1"
                          />{{ vendor.map.title }}
                        </h3>
                        <p>{{ vendor.map.address }}</p>
                        <p class="b-vendor-editor__hint">
                          {{ $t("vendor_add.editor.range") }}:
                          <span v-if="vendor.map.range"
                            >{{ vendor.map.range }} km</span
                          ><v-icon v-else size="16">all_inclusive</v-icon>
                        </p>
                      </div>
                      <v-avatar
                        v-if="vendor.map.user_id"
                        class="avatar-gradient -thin -staff"
                        size="24"
                      >
                        <v-img :src="getUserAvatar(vendor.map.user_id)" />
                        <v-tooltip
                          activator="parent"
                          location="top"
                          open-on-focus
                          content-class="sd-modern-tooltip text-start"
                          >{{
                            $t("vendor_add.editor.last_editor", {
                              time: getFromNowString(vendor.map.updated_at),
                            })
                          }}</v-tooltip
                        >
                      </v-avatar>
                    </div>
                    <p v-else class="b-vendor-editor__hint">
                      {{ $t("vendor_add.map.no_map_message") }}
                    </p>
                    <v-btn
                      class="sd-modern-button b-vendor-editor__spaced"
                      variant="outlined"
                      prepend-icon="location_on"
                      @click="showSetMapTag"
                      >{{ $t("vendor_add.editor.choose_location") }}</v-btn
                    >
                  </section>
                </div>
              </v-window-item>

              <v-window-item
                value="business"
                eager
                :transition="false"
                :reverse-transition="false"
              >
                <div class="b-vendor-editor__stack">
                  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Business info ▅▅▅▅▅▅▅▅▅▅▅▅ -->
                  <section class="sd-modern-widget b-vendor-editor__widget">
                    <div class="b-vendor-editor__widget-heading">
                      <h3>
                        <v-icon size="17" aria-hidden="true">business</v-icon
                        >{{ $t("vendor_add.business.title") }}
                      </h3>
                      <p>{{ $t("vendor_add.business.subtitle") }}</p>
                    </div>
                    <u-smart-switch
                      v-model="business"
                      class="sd-modern-smart-select"
                      border
                      :false-description="
                        $t('vendor_add.inputs.business.false_description')
                      "
                      false-icon="person"
                      :false-title="
                        $t('vendor_add.inputs.business.false_title')
                      "
                      :true-description="
                        $t('vendor_add.inputs.business.true_description')
                      "
                      true-icon="business"
                      :true-title="$t('vendor_add.inputs.business.true_title')"
                    />
                    <div
                      v-if="business"
                      class="b-vendor-editor__fields b-vendor-editor__spaced"
                    >
                      <v-text-field
                        v-model="business_name"
                        :label="$t('global.commons.business_name')"
                        variant="underlined"
                        class="sd-modern-underlined-field"
                      />
                      <v-text-field
                        v-model="tax_id"
                        :label="$t('global.commons.tax_id')"
                        variant="underlined"
                        class="sd-modern-underlined-field"
                      />
                    </div>
                  </section>
                  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Default pricing ▅▅▅▅▅▅▅▅▅▅▅▅ -->
                  <section class="sd-modern-widget b-vendor-editor__widget">
                    <div class="b-vendor-editor__widget-heading">
                      <h3>
                        <v-icon size="17" aria-hidden="true">percent</v-icon
                        >{{ $t("vendor_add.default_pricing.title") }}
                      </h3>
                      <p>{{ $t("vendor_add.editor.pricing_subtitle") }}</p>
                    </div>
                    <v-pricing-input
                      v-model="pricing_id"
                      :shop="shop"
                      :default-pricing="vendor?.pricing"
                      class="sd-modern-underlined-field"
                      :label="$t('vendor_add.default_pricing.title')"
                      :placeholder="$t('vendor_add.default_pricing.no_pricing')"
                      :menu-props="{ contentClass: 'sd-modern-select-menu' }"
                    />
                    <div class="sd-modern-notice b-vendor-editor__spaced">
                      <v-icon
                        size="18"
                        :color="!pricing_id ? 'warning' : undefined"
                        aria-hidden="true"
                        >{{
                          pricing_id ? "info_outline" : "warning_amber"
                        }}</v-icon
                      >
                      <div class="sd-modern-notice__content">
                        {{
                          $t(
                            pricing_id
                              ? "vendor_add.editor.pricing_help"
                              : "vendor_add.editor.pricing_optional",
                          )
                        }}
                      </div>
                    </div>
                  </section>
                </div>
              </v-window-item>

              <v-window-item
                value="payout"
                eager
                :transition="false"
                :reverse-transition="false"
              >
                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Bank info ▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <section class="sd-modern-widget b-vendor-editor__widget">
                  <div class="b-vendor-editor__fields">
                    <v-text-field
                      v-model="bank"
                      :label="$t('global.commons.bank_name')"
                      :hint="$t('vendor_add.inputs.bank.hint')"
                      persistent-placeholder
                      :placeholder="$t('vendor_add.inputs.bank.placeholder')"
                      variant="underlined"
                      class="sd-modern-underlined-field"
                    />
                    <v-text-field
                      v-model="bank_info.account_name"
                      :label="$t('global.commons.bank_account_name')"
                      :hint="$t('vendor_add.inputs.account_name.hint')"
                      persistent-placeholder
                      :placeholder="
                        $t('vendor_add.inputs.account_name.placeholder')
                      "
                      variant="underlined"
                      class="sd-modern-underlined-field"
                    />
                    <v-text-field
                      v-model="bank_info.account_number"
                      :label="$t('global.commons.bank_account_number')"
                      :hint="$t('vendor_add.inputs.account_number.hint')"
                      persistent-placeholder
                      :placeholder="
                        $t('vendor_add.inputs.account_number.placeholder')
                      "
                      variant="underlined"
                      class="sd-modern-underlined-field"
                    />
                    <v-text-field
                      v-model="bank_info.routing_number"
                      :label="$t('global.commons.bank_routing_number')"
                      :hint="$t('vendor_add.inputs.routing_number.hint')"
                      persistent-placeholder
                      :placeholder="
                        $t('vendor_add.inputs.routing_number.placeholder')
                      "
                      variant="underlined"
                      class="sd-modern-underlined-field"
                    />
                    <v-text-field
                      v-model="bank_info.iban"
                      label="IBAN"
                      :hint="$t('vendor_add.inputs.iban.hint')"
                      persistent-placeholder
                      :placeholder="$t('vendor_add.inputs.iban.placeholder')"
                      variant="underlined"
                      class="sd-modern-underlined-field"
                    />
                    <v-text-field
                      v-model="bank_info.swift"
                      label="SWIFT / BIC"
                      :hint="$t('vendor_add.inputs.swift.hint')"
                      persistent-placeholder
                      :placeholder="$t('vendor_add.inputs.swift.placeholder')"
                      variant="underlined"
                      class="sd-modern-underlined-field"
                    />
                    <v-text-field
                      v-model="bank_info.branch_address"
                      :label="$t('global.commons.bank_branch_address')"
                      :hint="$t('vendor_add.inputs.branch_address.hint')"
                      persistent-placeholder
                      :placeholder="
                        $t('vendor_add.inputs.branch_address.placeholder')
                      "
                      variant="underlined"
                      class="sd-modern-underlined-field b-vendor-editor__full"
                    />
                  </div>
                </section>
              </v-window-item>

              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Documents ▅▅▅▅▅▅▅▅▅▅▅▅ -->
              <v-window-item
                v-if="has_documents"
                value="documents"
                :transition="false"
                :reverse-transition="false"
              >
                <b-vendor-documents-list :shop="shop" :vendor="vendor" modern />
              </v-window-item>

              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Page template fields ▅▅▅▅▅▅▅▅▅▅▅▅ -->
              <v-window-item
                v-if="has_augment"
                value="page"
                :transition="false"
                :reverse-transition="false"
              >
                <section class="sd-modern-widget b-vendor-editor__widget">
                  <l-augment-form
                    v-model="augment"
                    @change="changed_argument = true"
                  />
                  <v-btn
                    v-if="page"
                    :href="vendor_landing_page_url"
                    :disabled="!vendor?.enable || !vendor_landing_page_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="sd-modern-button sd-modern-button--inline b-vendor-editor__spaced"
                    color="primary"
                    variant="text"
                    append-icon="north_east"
                    >{{ $t("vendor_add.page.action_set_page") }}</v-btn
                  >
                </section>
              </v-window-item>

              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Shipping ▅▅▅▅▅▅▅▅▅▅▅▅ -->
              <v-window-item
                v-if="has_shipping"
                value="shipping"
                :transition="false"
                :reverse-transition="false"
              >
                <div v-if="vendor" class="b-vendor-editor__stack">
                  <section class="sd-modern-widget b-vendor-editor__widget">
                    <div class="b-vendor-editor__widget-heading">
                      <h3>
                        <v-icon size="17" aria-hidden="true"
                          >local_shipping</v-icon
                        >{{ $t("vendor_add.shipping.title") }}
                      </h3>
                      <p>{{ $t("vendor_add.shipping.subtitle") }}</p>
                    </div>
                    <dl class="b-vendor-editor__stats">
                      <div>
                        <dt>
                          {{ $t("vendor_add.shipping.shipping_services") }}
                        </dt>
                        <dd>
                          {{
                            numeralFormat(
                              vendor.static?.shipping_services || 0,
                              "0,0.[00]a",
                            )
                          }}
                        </dd>
                        <p>
                          {{
                            $t("vendor_add.shipping.total_number_of_services")
                          }}
                        </p>
                      </div>
                      <div>
                        <dt>{{ $t("vendor_add.shipping.couriers") }}</dt>
                        <dd>
                          {{
                            numeralFormat(
                              vendor.static?.shipping_couriers || 0,
                              "0,0.[00]a",
                            )
                          }}
                        </dd>
                        <p>
                          {{ $t("vendor_add.shipping.total_couriers_count") }}
                        </p>
                      </div>
                    </dl>
                  </section>
                  <section class="sd-modern-widget b-vendor-editor__widget">
                    <div class="b-vendor-editor__widget-heading">
                      <h3>
                        <v-icon size="17" aria-hidden="true">warehouse</v-icon
                        >{{ $t("admin_shop.logistic.warehouse.title") }}
                      </h3>
                      <p>{{ $t("vendor_add.editor.warehouse_subtitle") }}</p>
                    </div>
                    <div v-if="!warehouse?.location" class="sd-modern-notice">
                      <v-icon size="18" color="warning" aria-hidden="true"
                        >warning_amber</v-icon
                      >
                      <div class="sd-modern-notice__content">
                        {{ $t("admin_shop.logistic.warehouse_btn_error") }}
                      </div>
                    </div>
                    <b-inventory-warehouse
                      :shop="shop"
                      :vendor="vendor"
                      modern
                      class="b-vendor-editor__spaced"
                      @update:warehouse="
                        (val) => {
                          vendor.warehouse = val;
                        }
                      "
                    />
                    <p class="b-vendor-editor__hint b-vendor-editor__spaced">
                      {{ $t("vendor_add.editor.warehouse_separate") }}
                    </p>
                  </section>
                </div>
                <div v-else class="sd-modern-notice">
                  <v-icon size="18" aria-hidden="true">info_outline</v-icon>
                  <div class="sd-modern-notice__content">
                    {{ $t("vendor_add.editor.warehouse_create_first") }}
                  </div>
                </div>
              </v-window-item>

              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Access: marketplace owner only ▅▅▅▅▅▅▅▅▅▅▅▅ -->
              <v-window-item
                v-if="can_manage_vendor"
                value="access"
                :transition="false"
                :reverse-transition="false"
              >
                <section class="sd-modern-widget b-vendor-editor__widget">
                  <div class="b-vendor-editor__widget-heading">
                    <h3>
                      <v-icon size="17" aria-hidden="true"
                        >admin_panel_settings</v-icon
                      >{{ $t("vendor_add.configuration.title") }}
                    </h3>
                  </div>
                  <u-smart-switch
                    v-model="enable"
                    class="sd-modern-smart-select"
                    border
                    false-gray
                    false-icon="close"
                    true-icon="check"
                    :false-title="$t('global.commons.disable')"
                    :true-title="$t('global.commons.enable')"
                    :label="$t('vendor_add.inputs.enable.label')"
                    :hint="$t('vendor_add.inputs.enable.hint')"
                    :true-description="
                      $t('vendor_add.inputs.enable.true_description')
                    "
                  />
                  <u-smart-switch
                    v-model="access"
                    :disabled="!user_id"
                    class="sd-modern-smart-select b-vendor-editor__spaced"
                    border
                    false-gray
                    false-icon="close"
                    true-icon="space_dashboard"
                    :false-title="$t('global.commons.disable')"
                    :true-title="$t('global.commons.enable')"
                    :false-description="
                      $t('vendor_add.inputs.access.false_description')
                    "
                    :label="$t('vendor_add.inputs.access.label')"
                    :true-description="
                      $t('vendor_add.inputs.access.true_description')
                    "
                    :hint="$t('vendor_add.inputs.access.hint')"
                  />
                  <div class="sd-modern-notice b-vendor-editor__spaced">
                    <v-icon
                      size="18"
                      :color="!user_id ? 'warning' : undefined"
                      aria-hidden="true"
                      >{{ user_id ? "info_outline" : "warning_amber" }}</v-icon
                    >
                    <div class="sd-modern-notice__content">
                      {{
                        $t(
                          !user_id
                            ? "vendor_add.set_a_user_for_the_vendor_first_msg"
                            : "vendor_add.editor.access_help",
                        )
                      }}
                    </div>
                  </div>
                </section>
              </v-window-item>
              <v-window-item
                v-if="can_manage_vendor"
                value="critical"
                :transition="false"
                :reverse-transition="false"
              />
              <v-window-item
                v-for="section in resource_sections"
                :key="section.value"
                :value="section.value"
                :transition="false"
                :reverse-transition="false"
              />
            </v-window>
          </v-form>

          <!-- Related lists stay outside the routine form and load only when selected. -->
          <div v-if="active_resource" :key="`${shop.id}:${vendor.id}:${tab}`" class="b-vendor-editor__resource">
            <slot :name="active_resource.value" :vendor="vendor" />
          </div>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅ Deletion is separate from routine form saving ▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <details
            v-if="can_manage_vendor && tab === 'critical'"
            class="sd-modern-widget sd-modern-disclosure sd-modern-critical b-vendor-editor__widget"
            :open="critical_open"
            @toggle="onCriticalToggle"
          >
            <summary class="sd-modern-disclosure__summary">
              <v-icon size="18" aria-hidden="true">warning_amber</v-icon>
              <span class="sd-modern-disclosure__copy">{{
                $t("vendor_add.delete.title")
              }}</span>
              <v-icon
                class="sd-modern-disclosure__chevron"
                size="18"
                aria-hidden="true"
                >expand_more</v-icon
              >
            </summary>
            <div class="sd-modern-disclosure__content">
              <div class="sd-modern-notice">
                <v-icon size="18" color="error" aria-hidden="true"
                  >warning_amber</v-icon
                >
                <div class="sd-modern-notice__content">
                  {{ $t("vendor_add.editor.delete_consequences") }}
                </div>
              </div>
              <u-smart-verify
                v-model="accept_delete"
                class="b-vendor-editor__spaced"
                color="error"
                role="checkbox"
                tabindex="0"
                :aria-checked="accept_delete"
                :aria-label="$t('vendor_add.delete.verify_title')"
                @keydown.space.prevent="accept_delete = !accept_delete"
                @keydown.enter.prevent="accept_delete = !accept_delete"
                :true-description="$t('vendor_add.delete.verify_description')"
                :true-title="$t('vendor_add.delete.verify_title')"
              />
              <div class="sd-modern-actions b-vendor-editor__spaced">
                <v-btn
                  class="sd-modern-button sd-modern-button--danger"
                  :disabled="!accept_delete || !critical_open || busy"
                  :loading="busy_delete"
                  color="error"
                  variant="elevated"
                  prepend-icon="delete_outline"
                  @click="showRemove"
                  >{{ $t("vendor_add.delete.action") }}</v-btn
                >
              </div>
            </div>
          </details>
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="b-vendor-editor__footer">
      <s-widget-buttons
        :auto-fixed-position="!dialogMode"
        class="sd-modern-form-actions b-vendor-editor__footer-actions"
      >
        <p v-if="tab !== 'critical' && !active_resource" class="b-vendor-editor__save-scope">
          {{
            $t(
              IS_VENDOR_PANEL
                ? "vendor_add.editor.draft"
                : "vendor_add.editor.save_scope",
            )
          }}
        </p>
        <v-btn
          v-if="dialogMode"
          class="sd-modern-button"
          variant="outlined"
          :disabled="busy || busy_delete"
          prepend-icon="close"
          @click="$emit('close')"
          >{{ $t("global.actions.close") }}</v-btn
        >
        <v-btn
          v-if="tab !== 'critical' && !active_resource"
          class="sd-modern-button"
          :loading="busy"
          :disabled="busy_delete"
          color="primary"
          variant="elevated"
          :prepend-icon="vendor ? 'save' : 'add'"
          @click="vendor ? updateVendor() : addVendor()"
          >{{
            $t(
              vendor
                ? "global.actions.save_changes"
                : "vendor_add.editor.add_title",
            )
          }}</v-btn
        >
      </s-widget-buttons>
    </v-card-actions>

    <!-- ██████████████████████ Dialog > Select Map Tag ██████████████████████ -->
    <v-dialog
      v-model="map_dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="b-vendor-editor b-vendor-editor--dialog text-start" flat>
        <v-card-title class="b-vendor-editor__top"
          ><h1>
            {{ $t("vendor_add.editor.select_location_title") }}
          </h1></v-card-title
        >
        <v-card-text class="sd-modern-canvas b-vendor-editor__body">
          <section
            class="sd-modern-form sd-modern-widget b-vendor-editor__widget b-vendor-editor__map-widget"
          >
            <div class="b-vendor-editor__widget-heading">
              <div class="b-vendor-editor__row">
                <h3>
                  <v-icon size="17" aria-hidden="true">location_on</v-icon
                  >{{ $t("vendor_add.editor.location_profile") }}
                </h3>
                <v-btn
                  v-if="!IS_VENDOR_PANEL"
                  :to="{ name: 'BPageShopChannelMap' }"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="sd-modern-button sd-modern-button--inline"
                  color="primary"
                  variant="text"
                  append-icon="north_east"
                  >{{ $t("vendor_add.editor.add_location") }}</v-btn
                >
              </div>
              <p>{{ $t("vendor_add.editor.location_dialog_help") }}</p>
            </div>
            <div class="sd-modern-notice">
              <v-icon size="18" aria-hidden="true">info_outline</v-icon>
              <div class="sd-modern-notice__content">
                {{ $t("vendor_add.editor.location_guidance") }}
              </div>
            </div>
            <b-map-tag-input
              v-if="!IS_VENDOR_PANEL /*Vendor can't edit map location!*/"
              v-model="map_input"
              :shop="shop"
              return-object
              class="sd-modern-underlined-field b-vendor-editor__spaced"
            />
            <v-img
              v-if="map_url"
              :src="map_url"
              aspect-ratio="1"
              class="map-view-box rounded-18px mx-auto my-5"
              height="auto"
              max-width="360"
              min-height="250"
              width="100%"
              ><u-map-view-pin class="map-pointer"
            /></v-img>
            <dl class="b-vendor-editor__map-details">
              <template v-if="full_address"
                ><dt>{{ $t("global.commons.address") }}</dt>
                <dd>
                  <flag
                    v-if="map_input.country"
                    :iso="map_input.country"
                    :squared="false"
                    class="me-1"
                  />{{ full_address }}
                </dd></template
              >
              <template v-if="map_input?.message"
                ><dt>{{ $t("global.commons.message") }}</dt>
                <dd>{{ map_input.message }}</dd></template
              >
              <template v-if="map_input"
                ><dt>{{ $t("global.commons.create_date") }}</dt>
                <dd>{{ getLocalTimeString(map_input.created_at) }}</dd>
                <dt>{{ $t("global.commons.update_date") }}</dt>
                <dd>
                  {{ getLocalTimeString(map_input.updated_at) }}
                </dd></template
              >
            </dl>
          </section>
        </v-card-text>
        <v-card-actions class="b-vendor-editor__footer">
          <div class="sd-modern-actions">
            <v-btn
              class="sd-modern-button"
              variant="outlined"
              prepend-icon="close"
              @click="map_dialog = false"
              >{{ $t("global.actions.close") }}</v-btn
            >
            <v-btn
              v-if="!IS_VENDOR_PANEL /*Vendor can't edit map location!*/"
              class="sd-modern-button"
              color="primary"
              variant="elevated"
              prepend-icon="check"
              @click="selectMap(map_input)"
              >{{ $t("global.actions.confirm") }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import SUserInput from "../../user/input/SUserInput.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import SImageUploader from "../../../ui/uploader/SImageUploader.vue";
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";
import BPageInput from "../../page/input/BPageInput.vue";
import UPodsPanel from "../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../ui/pod/wire/UPodWire.vue";
import BMapTagInput from "../../map/tag/input/BMapTagInput.vue";
import UMapViewPin from "../../../ui/map/view/market/UMapViewPin.vue";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import SCountrySelect from "../../../ui/country/select/SCountrySelect.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import BVendorDocumentsList from "../../vendor/documents/list/BVendorDocumentsList.vue";
import BTranslationButtonVendor from "../../translation/button/vendor/BTranslationButtonVendor.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import VPricingInput from "../../../storefront/pricing/VPricingInput.vue";
import UTextCopyBox from "@selldone/components-vue/ui/text/copy-box/UTextCopyBox.vue";
import { ShopURLs } from "@selldone/core-js";
import LAugmentForm from "@selldone/page-builder/components/augment/form/LAugmentForm.vue";
import BInventoryWarehouse from "@selldone/components-vue/backoffice/inventory/warehouse/BInventoryWarehouse.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { Slugify } from "@selldone/core-js/utils/slugify/slugify.ts";

export default {
  name: "BVendorAdd",
  mixins: [DateMixin],
  components: {
    BInventoryWarehouse,
    LAugmentForm,
    UTextCopyBox,
    SWidgetButtons,
    BTranslationButtonVendor,
    BVendorDocumentsList,
    VPricingInput,
    SCountrySelect,
    UMapViewPin,
    BMapTagInput,
    UPodWire,
    UPodNode,
    UPodsPanel,
    BPageInput,
    USmartVerify,
    SImageUploader,
    USmartSwitch,
    SUserInput,
  },
  emits: ["add", "update", "remove", "close"],
  props: {
    shop: {
      required: true,
    },

    vendor: {
      required: false,
      type: Object,
    },
    dialogMode: Boolean,
  },
  data: () => ({
    tab: "profile",
    critical_open: false,

    busy: false,

    name: null,
    description: null,

    email: null,
    invite_email: null, // If invite new user!
    address: null,
    web: null,
    tel: null,
    bank: null,
    bank_info: {},
    country: SetupService.DefaultCountry(),
    state: null,

    business: false,
    business_name: null,
    tax_id: null,

    user_edit: true,
    user_id: null,

    enable: true,
    access: true,

    accept_delete: false,
    busy_delete: false,

    page: null,
    slug: null,
    edit_slug: false,

    map_id: null,
    pricing_id: null,
    //-----------------------------
    map_dialog: false,
    map_input: null,

    //-----------------------------
    busy_send_invitation: false,

    //-----------------------------
    augment: [],
    busy_load: false,
    changed_argument: false,
  }),
  computed: {
    can_manage_vendor() {
      return !!this.vendor?.id && !this.IS_VENDOR_PANEL;
    },
    sections() {
      return [
        { value: "profile", label: "vendor_add.menu.profile", icon: "badge" },
        {
          value: "contact",
          label: "vendor_add.editor.contact_location",
          icon: "contact_mail",
        },
        {
          value: "business",
          label: "vendor_add.editor.business_pricing",
          icon: "business",
          warning: !this.pricing_id,
        },
        {
          value: "payout",
          label: "vendor_add.editor.payout_information",
          icon: "account_balance",
        },
        ...(this.has_documents
          ? [
              {
                value: "documents",
                label: "vendor_add.menu.documents",
                icon: "source",
              },
            ]
          : []),
        ...(this.has_augment
          ? [{ value: "page", label: "vendor_add.menu.page", icon: "web" }]
          : []),
        ...(this.has_shipping
          ? [
              {
                value: "shipping",
                label: "vendor_add.menu.shipping",
                icon: "local_shipping",
                warning: !this.warehouse?.location,
              },
            ]
          : []),
        ...(this.can_manage_vendor
          ? [
              {
                value: "access",
                label: "vendor_add.menu.access",
                icon: "shield",
              },
              {
                value: "critical",
                label: "vendor_add.menu.critical_zone",
                icon: "warning_amber",
              },
            ]
          : []),
      ];
    },
    active_section() {
      return [...this.sections, ...this.resource_sections].find((section) => section.value === this.tab);
    },
    resource_sections() {
      if (!this.can_manage_vendor) return [];
      return [
        { value: "products", label: "vendor_add.editor.products", icon: "inventory_2" },
        { value: "orders", label: "vendor_add.editor.orders", icon: "shopping_bag" },
        { value: "wallets", label: "vendor_add.editor.wallets", icon: "account_balance_wallet" },
        { value: "payments", label: "vendor_add.editor.payments", icon: "payments" },
      ].filter((section) => this.$slots?.[section.value]);
    },
    active_resource() {
      return this.resource_sections.find((section) => section.value === this.tab);
    },
    field_ids() {
      return {
        name: `vendor-editor-${this.$.uid}-name`,
        email: `vendor-editor-${this.$.uid}-email`,
      };
    },
    can_delete_vendor() {
      return (
        this.can_manage_vendor &&
        this.tab === "critical" &&
        this.critical_open &&
        this.accept_delete &&
        !this.busy &&
        !this.busy_delete
      );
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    warehouse() {
      return this.vendor ? this.vendor.warehouse : this.shop.warehouse;
    },

    //----------------------- Select map dialog --------------------
    map_url() {
      return (
        this.map_input &&
        this.map_input.location &&
        this.map_input.location.lng &&
        MapHelper.GetMapImage(
          this.map_input.location.lng,
          this.map_input.location.lat,
          15,
        )
      );
    },
    full_address() {
      return (
        this.map_input &&
        MapHelper.GenerateFullAddressFromMapInfo(this.map_input)
      );
    },

    has_documents() {
      return (
        this.vendor /*Only after vendor created!*/ &&
        this.shop.marketplace?.documents?.length
      ); // array of {type,guide}
    },

    generated_invite_link() {
      return (
        this.invite_email &&
        `${ShopURLs.MainShopUrl(this.shop)}/vendors?email=${this.invite_email}`
      );
    },

    has_augment() {
      return this.augment?.length;
    },

    has_shipping() {
      return this.shop.marketplace?.shipping;
    },

    vendor_listing_page_url() {
      return ShopURLs.GetVendorListingPageUrl(this.shop, this.vendor);
    },

    vendor_landing_page_url() {
      if (!this.page?.id || !this.vendor?.id) return null;
      return ShopURLs.GetVendorLandingPageUrl(this.shop, this.vendor);
    },
  },

  watch: {
    tab() {
      this.accept_delete = false;
      this.critical_open = false;
    },
    sections() {
      if (!this.active_section) this.tab = "profile";
    },
    resource_sections() {
      if (!this.active_section) this.tab = "profile";
    },
    critical_open(value) {
      if (!value) this.accept_delete = false;
    },
    IS_VENDOR_PANEL() {
      this.accept_delete = false;
      this.critical_open = false;
    },
    vendor() {
      this.assign();
    },
    "page.id"(page_id) {
      this.loadArgumentStructure(page_id);
    },
  },

  created() {
    this.assign();
  },

  methods: {
    openResource(value) {
      this.tab = value;
      this.$nextTick(() => {
        this.$refs.heading?.focus({ preventScroll: true });
        this.$refs.heading?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    },
    onCriticalToggle(event) {
      this.critical_open = this.tab === "critical" && event.target.open;
      if (!this.critical_open) this.accept_delete = false;
    },
    async validateVendorForm() {
      const { valid, errors } = await this.$refs.form.validate();
      if (!valid) {
        this.tab = errors?.some((error) => error.id === this.field_ids.name)
          ? "profile"
          : "contact";
      }
      return valid;
    },
    //――――――――――――――――――――――― Edit Vendor ―――――――――――――――――――――――

    assign() {
      this.resetToDefault(); // 🞇 Reset to default

      if (this.vendor) {
        this.augment = this.vendor.augment;

        this.invite_email = this.vendor.invite;

        this.enable = this.vendor.enable;
        this.access = this.vendor.access;

        this.name = this.vendor.name;
        this.description = this.vendor.description;
        this.email = this.vendor.email;

        this.address = this.vendor.address;
        this.web = this.vendor.web;
        this.tel = this.vendor.tel;
        this.bank = this.vendor.bank;
        this.bank_info = this.vendor.bank_info;

        if (!this.bank_info || Array.isArray(this.bank_info))
          this.bank_info = {};

        this.user_id = this.vendor.user_id;

        this.user_edit = !this.user_id;

        this.page = this.vendor.page;
        this.slug = this.vendor.slug
          ? this.vendor.slug
          : Slugify.apply(this.vendor.name);

        this.map_id = this.vendor.map_id;
        this.pricing_id = this.vendor.pricing_id;

        this.country = this.vendor.country;
        this.state = this.vendor.state;
        this.business = this.vendor.business;
        this.business_name = this.vendor.business_name;
        this.tax_id = this.vendor.tax_id;
      }
    },

    async addVendor() {
      if (this.IS_VENDOR_PANEL) {
        return NotificationService.showErrorAlert(
          null,
          "You can not add a new vendor here!",
        );
      }

      if (this.busy || this.busy_delete) return;
      if (!(await this.validateVendorForm()) || this.busy) return;

      this.busy = true;

      axios
        .post(window.API.POST_SHOP_ADD_VENDOR(this.shop.id), {
          invite: this.invite_email, // Send invite email!

          enable: this.enable,
          access: this.access,
          name: this.name,
          description: this.description,
          email: this.email,

          address: this.address,
          web: this.web,
          tel: this.tel,
          bank: this.bank,
          bank_info: this.bank_info,

          user_id: this.user_id,

          page_id: this.page?.id,
          slug: this.slug,

          map_id: this.map_id,
          pricing_id: this.pricing_id,

          country: this.country,
          state: this.state,
          business: this.business,
          business_name: this.business_name,
          tax_id: this.tax_id,

          augment: this.augment,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.vendor);
            this.$emit("close");
            NotificationService.showSuccessAlert(
              null,
              "Vendor has been added successfully.",
            );
            this.resetToDefault(); // 🞇 Reset to default
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

    async updateVendor() {
      if (!this.vendor?.id || this.busy || this.busy_delete) return;
      if (!(await this.validateVendorForm()) || this.busy) return;

      this.busy = true;

      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_ADD_VENDOR_UPDATE_MY_VENDOR_PROFILE(
                this.$route.params.vendor_id,
              )
            : window.API.PUT_SHOP_EDIT_VENDOR(this.shop.id, this.vendor.id),
          {
            invite: this.invite_email, // Send invite email!

            enable: this.enable,
            access: this.access,
            name: this.name,
            description: this.description,

            email: this.email,

            address: this.address,
            web: this.web,
            tel: this.tel,
            bank: this.bank,
            bank_info: this.bank_info,

            user_id: this.user_id,

            page_id: this.page?.id,
            slug: this.slug,

            map_id: this.map_id,
            pricing_id: this.pricing_id,

            country: this.country,
            state: this.state,
            business: this.business,
            business_name: this.business_name,
            tax_id: this.tax_id,

            augment: this.augment,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            Object.assign(this.vendor, data.vendor);
            this.$emit("update", data.vendor);
            this.$emit("close");
            NotificationService.showSuccessAlert(
              null,
              "Vendor has been updated successfully.",
            );
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

    handleProcessFileIcon(path) {
      this.vendor.icon = path;
    },

    showRemove() {
      if (!this.can_delete_vendor) return;
      const vendor_id = this.vendor.id;
      NotificationService.openDangerAlert(
        this.$t("vendor_add.editor.remove_confirm_title", {
          name: this.vendor.name,
        }),
        this.$t("vendor_add.editor.delete_consequences"),
        this.$t("vendor_add.editor.remove_confirm_action"),
        () => {
          if (this.vendor?.id !== vendor_id) return;
          this.remove();
        },
      );
    },
    remove() {
      if (!this.can_delete_vendor) return;
      this.busy_delete = true;

      axios
        .delete(
          window.API.DELETE_SHOP_EDIT_VENDOR(this.shop.id, this.vendor.id),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("remove", data.id);
            this.$emit("close");
            NotificationService.showSuccessAlert(
              null,
              "Vendor has been removed successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_delete = false;
        });
    },

    // ████████████████████ Set Map ████████████████████

    showSetMapTag() {
      this.map_input = this.vendor?.map; // Return object!
      this.map_dialog = true;
    },
    selectMap(map_input) {
      if (this.vendor) {
        this.vendor.map_id = map_input ? map_input.id : null;
        this.vendor.map = map_input; // Assign nested object
      }
      this.map_id = map_input ? map_input.id : null;
      this.map_dialog = false;
    },

    sendInvitationEmail() {
      this.busy_send_invitation = true;

      axios
        .post(
          window.API.POST_SHOP_VENDOR_SEND_INVITE_EMAIL(
            this.shop.id,
            this.vendor.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Invite email has been sent successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_send_invitation = false;
        });
    },

    // ████████████████████ Set Map ████████████████████

    loadArgumentStructure(page_id) {
      this.augment = [];
      if (!page_id) {
        return;
      }

      this.busy_load = true;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.page.getPageAugment(
            this.$route.params.vendor_id,
            page_id,
            this.vendor?.augment,
          )
        : window.$backoffice.page.getPageAugment(
            this.shop.id,
            page_id,
            this.vendor?.augment,
          )
      )

        .then(({ augment }) => {
          this.augment = augment;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_load = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-vendor-editor {
  // Match the approved Refined measurements while retaining the native dialog scroll surface.
  --sd-modern-border: rgba(var(--v-theme-on-surface), 0.09);
  --sd-modern-muted: rgba(var(--v-theme-on-surface), 0.66);
  --sd-modern-inset: rgba(var(--v-theme-on-surface), 0.025);
  --sd-modern-icon-button-size: 33px;
  display: flex;
  flex-direction: column;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;

  &--dialog {
    height: 100%;
    min-height: 0;
  }
  &__top {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 0 0 auto;
    padding: 22px 24px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__avatar {
    flex-shrink: 0;
    background: var(--sd-modern-inset);
  }
  &__identity {
    min-width: 0;
    flex: 1;
  }
  &__top h1 {
    margin: 0;
    font-family: inherit;
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
    letter-spacing: 0;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  &__identity > p {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  &__top-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 12px;
  }
  &__top-actions .sd-modern-status {
    font-size: 13px;
    line-height: 20px;
    white-space: nowrap;
  }
  &.v-card > &__body.v-card-text {
    padding: 0;
    min-height: 0;
  }
  &--dialog > &__body {
    flex: 1 1 auto;
    overflow-y: auto;
  }
  &__workspace {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr);
    gap: 30px;
    width: 100%;
    max-width: 1280px;
    margin-inline: auto;
    padding: 28px 24px 32px;
    align-items: start;
  }
  &__nav {
    align-self: start;
  }
  &__nav .sd-modern-section-nav__item {
    min-height: 43px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  &__nav .sd-modern-status__dot {
    margin-inline-start: auto;
  }
  &__nav .b-vendor-editor__critical-nav {
    margin-block-start: 10px;
  }
  &__public-page {
    min-width: 0;
    width: 100%;
    flex-basis: 100%;
    grid-column: 1 / -1;
    margin-block-start: 14px;
    padding-block-start: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__public-page-link {
    width: 100%;
    height: auto;
    justify-content: flex-start;
    white-space: normal;
  }
  &__public-page-link :deep(.v-btn__content) {
    white-space: normal;
    overflow-wrap: anywhere;
    text-align: start;
  }
  &__resource-nav {
    display: grid;
    gap: 6px;
    margin-block-start: 18px;
    padding-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__resource-nav > p {
    margin: 0 12px 4px;
  }
  &__content {
    min-width: 0;
    width: 100%;
    max-width: 760px;
    margin-inline: auto;
  }
  &__content--resource {
    max-width: none;
  }
  &__resource {
    min-width: 0;
  }
  &__heading {
    margin-block-end: 21px;
  }
  &__heading h2 {
    margin: 0;
    font-size: 19px;
    font-weight: 500;
    line-height: 27px;
    letter-spacing: 0;
  }
  &__heading p {
    margin: 5px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  &__stack {
    display: grid;
    gap: 18px;
  }
  &__widget.sd-modern-widget {
    padding: 22px;
    margin: 0;
    border: 0;
    border-radius: 16px;
    box-shadow: none;
  }
  &__widget-heading {
    margin-block-end: 19px;
  }
  &__widget-heading h3,
  &__owner h3,
  &__location h3 {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  &__widget-heading h3 > .v-icon {
    color: var(--sd-modern-muted);
  }
  &__widget-heading p,
  &__hint {
    margin: 5px 0 0;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 18px;
  }
  &__fields > * {
    min-width: 0;
  }
  &__full {
    grid-column: 1 / -1;
  }
  &__fields--identity {
    margin-block-start: 18px;
  }
  &__widget :deep(.v-field__input) {
    font-family: inherit;
    font-size: 14px;
    line-height: 22px;
  }
  &__widget :deep(.v-input__details) {
    font-size: 13px;
    line-height: 20px;
  }
  &__widget :deep(.s--smart-verify:focus-visible) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 4px;
  }
  &__logo :deep(.v-list-item__content) {
    min-width: 0;
  }
  &__logo :deep(.v-list-item-title) {
    font-size: 14px;
    line-height: 22px;
  }
  &__logo :deep(.v-list-item-subtitle) {
    font-size: 13px;
    line-height: 20px;
  }
  &__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  &__row > h3 {
    flex: 1;
  }
  &__owner {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__owner-info {
    flex: 1;
    min-width: 0;
  }
  &__owner h3 small {
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
  &__owner p {
    margin: 2px 0 0;
    font-size: 13px;
    line-height: 20px;
    color: var(--sd-modern-muted);
    overflow-wrap: anywhere;
  }
  &__value {
    margin: 8px 0 0;
    font-size: 14px;
    line-height: 22px;
    overflow-wrap: anywhere;
  }
  &__url {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  &__spaced {
    margin-block-start: 16px;
  }
  &__location {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__location > div {
    flex: 1;
    min-width: 0;
  }
  &__location p {
    margin: 5px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
    overflow-wrap: anywhere;
  }
  &__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
    margin: 0;
  }
  &__stats dt {
    font-size: 13px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__stats dd {
    margin: 5px 0 0;
    font-size: 24px;
    line-height: 32px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  &__stats p {
    margin: 5px 0 0;
    font-size: 13px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  &__footer.v-card-actions {
    flex: 0 0 auto;
    min-height: 80px;
    justify-content: flex-end;
    padding: 16px 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__footer-actions {
    width: 100%;
  }
  &__footer-actions :deep(.widget-buttons),
  &__footer-actions.widget-buttons {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    max-width: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
  }
  &__footer-actions :deep(.widget-buttons > .sd-modern-button),
  &__footer-actions.widget-buttons > .sd-modern-button {
    flex: 0 0 auto;
    min-width: 0;
    margin: 0;
  }
  &__save-scope {
    flex: 1 1 320px;
    max-width: 650px;
    margin: 0;
    margin-inline: 0 auto;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  &__map-widget.sd-modern-widget {
    margin: 28px auto;
    width: min(760px, calc(100% - 32px));
  }
  &__map-details {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px 18px;
    margin-block: 20px 0;
    font-size: 13px;
    line-height: 20px;
  }
  &__map-details dt {
    color: var(--sd-modern-muted);
  }
  &__map-details dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  @media (min-width: 741px) {
    &--dialog > &__body { overflow: hidden; }
    &--dialog &__workspace { height: 100%; min-height: 0; align-items: stretch; }
    &--dialog &__nav {
      min-height: 0;
      max-height: 100%;
      overflow-y: auto;
      padding-inline: 6px;
      margin-inline: -6px;
    }
    &--dialog &__content {
      min-height: 0;
      max-height: 100%;
      overflow-y: auto;
      padding-block: 6px;
      margin-block: -6px;
    }
  }

  @media (max-width: 740px) {
    &__workspace {
      display: block;
      padding: 22px 16px 28px;
    }
    &__nav {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-block-end: 24px;
    }
    &__nav .sd-modern-section-nav__item {
      min-height: 44px;
    }
    &__nav .b-vendor-editor__critical-nav {
      margin-block-start: 0;
    }
    &__resource-nav {
      grid-column: 1 / -1;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    &__resource-nav > p {
      grid-column: 1 / -1;
    }
  }
  @media (max-width: 600px) {
    &__top {
      position: relative;
      flex-wrap: wrap;
      padding: 18px 16px;
    }
    &__identity {
      flex-basis: calc(100% - 100px);
      padding-inline-end: 36px;
    }
    &__top-actions {
      width: 100%;
      justify-content: space-between;
      gap: 8px;
    }
    &__top-actions > .sd-modern-icon-button {
      position: absolute;
      inset-block-start: 18px;
      inset-inline-end: 16px;
    }
    &__fields {
      grid-template-columns: minmax(0, 1fr);
    }
    &__widget.sd-modern-widget {
      padding: 20px 16px;
    }
    &__widget :deep(input.v-field__input),
    &__widget :deep(textarea.v-field__input) {
      font-size: 16px;
    }
    &__footer.v-card-actions {
      padding: 16px;
    }
    &__footer-actions :deep(.widget-buttons),
    &__footer-actions.widget-buttons {
      flex-wrap: wrap;
    }
    &__save-scope {
      flex-basis: 100%;
      max-width: none;
    }
    &__stats {
      gap: 18px;
    }
  }
  @media (max-width: 740px), (pointer: coarse) {
    &__public-page-link {
      min-height: 44px;
    }
  }
}
</style>
