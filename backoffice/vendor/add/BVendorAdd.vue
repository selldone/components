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
  <v-card class="position-relative text-start" flat>
    <v-card-title class="d-flex align-center">
      <v-avatar class="me-2" rounded>
        <v-img
          v-if="vendor?.icon"
          :src="getShopImagePath(vendor.icon, 128)"
        ></v-img>
        <v-icon v-else>business</v-icon>
      </v-avatar>

      <div class="text-start">
        {{ name }}
        <small class="d-block">{{ description?.limitWords(7) }}</small>
      </div>
    </v-card-title>

    <v-card-text>
      <u-tabs-floating
        v-model="tab"
        :items="[
          { title: 'Profile & Info', icon: 'badge' },
          {
            title: 'Business & Payment',
            icon: 'business',
            warning: !pricing_id,
          },

          ...(has_documents ? [{ title: 'Documents', icon: 'source' }] : []),

          ...(vendor && !IS_VENDOR_PANEL
            ? [
                { title: 'Access', icon: 'shield' },
                { title: 'Critical zone', icon: 'lock_outline' },
              ]
            : []),
        ]"
      ></u-tabs-floating>

      <v-form ref="form" lazy-validation>
        <v-window v-model="tab" direction="vertical" mandatory>
          <v-window-item>
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Profile  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div class="widget-box mb-5">
              <s-widget-header icon="admin_panel_settings" title="Vendor info">
              </s-widget-header>

              <v-list-subheader
                >This information is shown to customers publicly.
              </v-list-subheader>

              <div v-if="vendor">
                <s-image-uploader
                  :image="getShopImagePath(vendor.icon, 128)"
                  :server="
                    IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                      ? window.VAPI.POST_MY_VENDOR_UPLOAD_VENDOR_ICON(
                          $route.params.vendor_id,
                        )
                      : window.API.POST_UPLOAD_VENDOR_ICON(shop.id, vendor.id)
                  "
                  auto-compact
                  label="Vendor logo"
                  maxFileSize="2MB"
                  @new-path="handleProcessFileIcon"
                />
              </div>

              <v-text-field
                v-model="name"
                :label="$t('global.commons.name')"
                :rules="[GlobalRules.required()]"
                variant="underlined"
              >
                <template v-slot:append-inner>
                  <b-translation-button-vendor
                    v-if="vendor?.id && !IS_VENDOR_PANEL"
                    :label="$t('global.commons.name')"
                    :shop="shop"
                    :vendor="vendor"
                    translation-key="name"
                  ></b-translation-button-vendor>
                </template>
              </v-text-field>

              <v-textarea
                v-model="description"
                :label="$t('global.commons.description')"
                auto-grow
                placeholder="Write a public description..."
                rows="2"
                variant="underlined"
              >
                <template v-slot:append-inner>
                  <b-translation-button-vendor
                    v-if="vendor?.id && !IS_VENDOR_PANEL"
                    :label="$t('global.commons.description')"
                    :shop="shop"
                    :vendor="vendor"
                    translation-key="description"
                  ></b-translation-button-vendor>
                </template>
              </v-textarea>

              <v-expand-transition>
                <s-user-input
                  v-if="user_edit || !user_id"
                  v-model:user-id="user_id"
                  :label="$t('affiliates.dialog.user')"
                  messages="Optional, Ex: vendor name in the Selldone"
                  variant="underlined"
                  @update:model-value="
                    (val) => {
                      if (!email) email = val;
                    }
                  "
                ></s-user-input>
                <div v-else class="d-flex align-center">
                  <v-avatar
                    class="m-3 avatar-gradient -thin -officer"
                    size="38"
                  >
                    <v-img :src="getUserAvatar(user_id)" />
                  </v-avatar>

                  <div v-if="vendor?.user" class="flex-grow-1 text-start">
                    <b>{{ vendor.user.name }}</b>
                    <small class="d-block">{{ vendor.user.email }}</small>
                  </div>

                  <v-btn
                    v-if="
                      !IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢 Only marketplace owner can edit user*/
                    "
                    :title="$t('global.actions.edit')"
                    icon
                    variant="text"
                    @click="user_edit = true"
                  >
                    <v-icon>edit</v-icon>
                  </v-btn>
                </div>
              </v-expand-transition>

              <v-list-subheader
                v-if="
                  IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢 Only marketplace owner can edit user*/
                "
              >
                <div>
                  <v-icon size="small">info</v-icon>
                  Only the marketplace owner can edit the user. If you want to
                  change the owner of this vendor, you can send the request to
                  us.
                </div>
              </v-list-subheader>

              <s-widget-header
                class="mt-5"
                icon="view_carousel"
                title="Custom page"
              >
              </s-widget-header>

              <v-list-subheader
              >Set a custom landing page for the vendor, providing them with a unique link to their dedicated page.
              </v-list-subheader>


              <b-page-input
                v-if="
                  !IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢 Vendor cant select landing page!*/
                "
                v-model="page"
                :shop="shop"
                variant="underlined"
                clearable
              ></b-page-input>
              <v-list-item v-else class="my-3">
                <template v-slot:prepend>
                  <v-avatar color="#fff" rounded>
                    <img
                      v-if="page && page.image"
                      :src="getShopImagePath(page.image)"
                    />
                    <v-icon v-else>architecture</v-icon>
                  </v-avatar>
                </template>

                <!-- has page -->
                <template v-if="page">
                  <v-list-item-title>
                    <b>{{ page.title }}</b>

                  </v-list-item-title>
                  <v-list-item-subtitle>
                    /pages/{{ page.name }}
                    <v-chip prepend-icon="visibility" size="x-small" class="ms-2">
                      {{ numeralFormat(page.visits, "0.[0] a") }}
                    </v-chip>
                  </v-list-item-subtitle>
                </template>

                <!-- no page -->

                <template v-else>
                  <v-list-item-title>
                    <small>No landing page</small>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    We can create a dedicated landing page for you.
                  </v-list-item-subtitle>
                </template>

                <template v-slot:append>
                  <v-list-item-action end>
                    <v-btn
                      v-if="page"
                      :href="`${getShopMainUrl(shop)}/pages/${page.name}`"
                      color="primary"
                      icon
                      target="_blank"
                      title="Open landing page"
                      variant="text"
                    >
                      <v-icon>open_in_new</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </div>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Contact info  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div class="widget-box mb-5">
              <s-widget-header
                icon="connect_without_contact"
                title="Contact info"
              >
              </s-widget-header>
              <v-list-subheader
                >Kindly provide valid contact details.
              </v-list-subheader>

              <v-text-field
                v-model="email"
                :label="$t('global.commons.email')"
                :placeholder="
                  vendor?.user
                    ? 'Default is: ' + vendor.user.email
                    : 'Enter email...'
                "
                :rules="[GlobalRules.email()]"
                append-icon="email"
                messages="This email will receive all notifications and updates."
                variant="underlined"
              ></v-text-field>
              <v-expand-transition>
                <div
                  v-if="email && vendor?.user && vendor.user.email !== email"
                >
                  <v-list-subheader>
                    <div>
                      <v-icon size="small">notification_important</v-icon>
                      Entered email does not match with user's email (<b
                        >{{ vendor.user?.name }}:</b
                      >
                      {{ vendor.user?.email }}). Are you sure to send emails to
                      <b>{{ email }}</b
                      >?
                    </div>
                  </v-list-subheader>
                </div>
              </v-expand-transition>

              <s-country-select
                v-model="country"
                :label="$t('global.commons.country')"
                item-value="alpha2"
              ></s-country-select>
              <v-text-field
                v-model="state"
                :label="$t('global.address_info.state')"
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="address"
                :label="$t('global.commons.address')"
                append-icon="place"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="web"
                :label="$t('global.commons.website')"
                append-icon="link"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="tel"
                :label="$t('global.commons.tel')"
                append-icon="phone"
                variant="underlined"
              ></v-text-field>
            </div>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Vendor Profiles ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div class="widget-box mb-5">
              <s-widget-header
                icon="assignment"
                title="Profiles"
              ></s-widget-header>
              <v-list-subheader
                >You can assign location to this vendor.
              </v-list-subheader>

              <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Assign Map Profile ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
              <v-list-item
                class="row-hover"
                prepend-icon="map"
                @click="showSetMapTag()"
              >
                <v-list-item-title class="d-flex align-center">
                  <b>Location</b>

                  <template v-if="vendor?.map && vendor?.map_id">
                    <span>
                      <v-icon class="mx-1" color="#111">{{
                        $t("icons.chevron_next")
                      }}</v-icon>

                      <b>
                        <flag
                          v-if="vendor.map.country"
                          :iso="vendor.map.country"
                          :squared="false"
                          class="me-1"
                        />
                        {{ vendor.map.title }}</b
                      >
                    </span>

                    <v-spacer></v-spacer>
                    <v-avatar
                      v-if="vendor.map.user_id"
                      :title="`Last editor / ${getFromNowString(
                        vendor.map.updated_at,
                      )}`"
                      class="mx-1 avatar-gradient -thin -staff"
                      size="24"
                    >
                      <img :src="getUserAvatar(vendor.map.user_id)" />
                    </v-avatar>
                    <small class="ms-2" title="Range">
                      <v-icon v-if="!vendor.map.range" size="small"
                        >all_inclusive
                      </v-icon>
                      <span v-else>{{ vendor.map.range }} km</span>
                    </small>
                  </template>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    vendor?.map
                      ? vendor.map.address
                      : "Assign a location to the vendor if it's a location-based vendor."
                  }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-list-item-action>
                    <v-btn
                      :color="vendor?.map_id || map_id ? 'success' : 'primary'"
                      icon
                      tile
                      variant="flat"
                    >
                      <v-icon
                        >{{
                          vendor?.map_id || map_id ? "check_box" : "add_box"
                        }}
                      </v-icon>
                    </v-btn>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </div>
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Send email info ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div v-if="email || user_id" class="max-widget-width my-5">
              <p>
                <v-icon class="me-1" color="success">check</v-icon>
                <span
                  v-html="
                    vendor
                      ? `We will send orders information to <b>${
                          email ? email : vendor?.user?.email
                        }</b>.`
                      : 'We will send an invitation email to the user.'
                  "
                ></span>
              </p>
              <u-pods-panel color="#eee">
                <u-pod-node
                  :image="getShopImagePath(shop.icon, 96)"
                  :title="shop.title"
                ></u-pod-node>
                <u-pod-wire forward></u-pod-wire>
                <u-pod-node
                  v-if="email"
                  :title="email"
                  icon="email"
                ></u-pod-node>
                <u-pod-node
                  v-else-if="user_id"
                  :image="getUserAvatar(user_id)"
                  :title="$t('global.commons.user')"
                  rounded
                ></u-pod-node>
              </u-pods-panel>
            </div>
          </v-window-item>

          <v-window-item>
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Business info  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div class="widget-box mb-5">
              <s-widget-header
                :icon="business ? 'business' : 'person'"
                title="Business info"
              >
              </s-widget-header>
              <v-list-subheader
                >Please provide accurate information about your business to
                ensure a swift and seamless revenue collection process.
              </v-list-subheader>

              <u-smart-switch
                v-model="business"
                false-description="I work as an individual."
                false-icon="person"
                false-title="Individual"
                true-description="I operate as a legally recognized business entity."
                true-icon="business"
                true-title="Business"
              >
              </u-smart-switch>

              <template v-if="business">
                <v-text-field
                  v-model="business_name"
                  :label="$t('global.commons.business_name')"
                  append-icon="corporate_fare"
                  variant="underlined"
                ></v-text-field>

                <v-text-field
                  v-model="tax_id"
                  :label="$t('global.commons.tax_id')"
                  append-icon="assured_workload"
                  variant="underlined"
                ></v-text-field>
              </template>
            </div>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bank info  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div class="widget-box mb-5">
              <s-widget-header icon="paid" title="Payout Information">
              </s-widget-header>
              <v-list-subheader
                >Input your bank details here for payouts.
              </v-list-subheader>

              <v-text-field
                v-model="bank"
                :label="$t('global.commons.bank_name')"
                append-icon="account_balance"
                auto-grow
                hint="The name of the bank where the vendor has their account."
                persistent-placeholder
                placeholder="Your bank name.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank_info.account_name"
                :label="$t('global.commons.bank_account_name')"
                hint="This should match the name associated with the bank account."
                persistent-placeholder
                placeholder="Your name.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank_info.account_number"
                :label="$t('global.commons.bank_account_number')"
                hint="The vendor's unique account number."
                persistent-placeholder
                placeholder="Your bank account number.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank_info.routing_number"
                :label="$t('global.commons.bank_routing_number')"
                hint="This number varies by country. It's used to identify the specific bank branch the vendor uses."
                persistent-placeholder
                placeholder="Your bank routing number, sort code, or BSB number.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank_info.iban"
                hint="International Bank Account Number): If the vendor's bank is in Europe or certain other countries."
                label="IBAN"
                persistent-placeholder
                placeholder="Your IBAN number..  eg. DE89 3704 0044 0000 0000 00"
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank_info.swift"
                hint="International Bank Account Number): If the vendor's bank is in Europe or certain other countries."
                label="Swift Code/BIC"
                persistent-placeholder
                placeholder="Your Swift code/BIC.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank_info.branch_address"
                :label="$t('global.commons.bank_branch_address')"
                hint="The address of the bank branch where the vendor has their account."
                persistent-placeholder
                placeholder="Your bank address.."
                variant="underlined"
              ></v-text-field>
            </div>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Default Pricing  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
            <div class="widget-box mb-5">
              <s-widget-header icon="sell" title="Default Pricing">
                <template v-slot:append-title>
                  <v-chip
                    v-if="!pricing_id"
                    class="m-1 ms-2"
                    color="amber"
                    label
                    size="x-small"
                    title="Please set a default pricing model for vendor."
                    variant="flat"
                  >
                    <v-icon size="x-small" start>sell</v-icon>
                    No pricing
                  </v-chip>
                </template>
              </s-widget-header>
              <v-list-subheader
                >You can assign a default pricing model for the vendor. When the
                vendor adds a new product, this pricing model will be used to
                calculate the marketplace margin on the product's price. You can
                later adjust the pricing model for each product individually.
              </v-list-subheader>
              <v-pricing-input
                v-model="pricing_id"
                :shop="shop"
              ></v-pricing-input>
            </div>
          </v-window-item>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Documents  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <v-window-item v-if="has_documents">
            <b-vendor-documents-list
              :shop="shop"
              :vendor="vendor"
            ></b-vendor-documents-list>
          </v-window-item>

          <v-window-item>
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Configuration  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div
              v-if="
                !IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢 Only marketplace owner can change these!*/
              "
              class="widget-box mb-5"
            >
              <s-widget-header icon="tune" title="Configuration">
              </s-widget-header>

              <u-smart-switch
                v-model="enable"
                :false-title="$t('global.commons.disable')"
                :true-title="$t('global.commons.enable')"
                class="mt-5"
                false-gray
                false-icon="close"
                label="Vendor status"
                true-description="They will be able to sell their products through your marketplace."
                true-icon="check"
              ></u-smart-switch>

              <u-smart-switch
                v-model="access"
                :disabled="!user_id"
                :false-title="$t('global.commons.disable')"
                :true-title="$t('global.commons.enable')"
                class="mt-5"
                false-description="The vendor has no access to anything."
                false-gray
                false-icon="close"
                label="Vendor panel & access"
                true-description="The vendor has a dedicated panel to update quantity and price."
                true-icon="space_dashboard"
              ></u-smart-switch>
              <v-list-subheader v-if="!user_id">
                <v-icon class="me-1">warning_amber</v-icon>
                Set a user for the vendor first.
              </v-list-subheader>
            </div>
          </v-window-item>

          <v-window-item>
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Delete  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <div v-if="vendor && !IS_VENDOR_PANEL" class="widget-box mb-5">
              <s-widget-header icon="block" title="Remove vendor">
              </s-widget-header>

              <u-smart-verify
                v-model="accept_delete"
                class="my-3"
                color="red"
                true-description="I know that all vendor product relations will be removed!"
                true-title="I want to delete this vendor."
              ></u-smart-verify>

              <div class="widget-buttons">
                <v-btn
                  :class="{ disabled: !accept_delete }"
                  :loading="busy_delete"
                  color="red"
                  size="x-large"
                  @click="showRemove"
                >
                  <v-icon class="me-1">remove</v-icon>
                  Remove vendor
                </v-btn>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-form>

      <!-- ██████████████████████ Dialog > Select Map Tag ██████████████████████ -->

      <v-dialog
        v-model="map_dialog"
        fullscreen
        scrollable
        transition="dialog-bottom-transition"
      >
        <v-card class="text-start">
          <v-card-title>Select location profile</v-card-title>
          <v-card-text>
            <div class="widget-box -large mb-5">
              <s-widget-header
                :add-caption="IS_VENDOR_PANEL ? undefined : 'Add new location'"
                :to="{ name: 'BPageShopChannelMap' }"
                add-text
                icon="place"
                title="Location profile"
              >
              </s-widget-header>
              <v-list-subheader>
                You can pin vendors on the map location by assigning location
                tags to the them.
              </v-list-subheader>
              <div class="typo-body mb-3">
                <v-icon class="me-1">notification_important</v-icon>
                <b>Important: </b> Assign a location to the vendor
                <b>only</b> if you want to show the vendor on the specific
                location on the map. The pined vendor must have the location as
                its main specification, like <b>grocery</b> or in-person
                services like <b>Hairdressing and Spa</b>.
              </div>
              <b-map-tag-input
                v-if="!IS_VENDOR_PANEL /*Vendor can't edit map location!*/"
                v-model="map_input"
                :shop="shop"
                return-object
              ></b-map-tag-input>

              <v-img
                v-if="map_url"
                :src="map_url"
                aspect-ratio="1"
                class="map-view-box -jumping rounded-18px mx-auto my-5"
                height="auto"
                max-width="360"
                min-height="250"
                width="100%"
              >
                <u-map-view-pin class="map-pointer"></u-map-view-pin>
              </v-img>

              <div v-if="full_address" class="mb-3 typo-body">
                <v-icon class="me-1">assistant_direction</v-icon>
                Address:
                <flag
                  v-if="map_input.country"
                  :iso="map_input.country"
                  :squared="false"
                  class="mx-1"
                />
                {{ full_address }}
              </div>

              <div v-if="map_input && map_input.message" class="mb-3 typo-body">
                <v-icon class="me-1">chat_bubble</v-icon>
                Message:
                {{ map_input.message }}
              </div>

              <v-row v-if="map_input" class="mb-3 typo-body" no-gutters>
                <v-col
                  :title="getFromNowString(map_input.created_at)"
                  cols="12"
                  sm="6"
                >
                  <v-icon class="me-1">calendar_today</v-icon>
                  Create:
                  {{ getLocalTimeString(map_input.created_at) }}
                </v-col>
                <v-col
                  :title="getFromNowString(map_input.updated_at)"
                  cols="12"
                  sm="6"
                >
                  <v-icon class="me-1">edit_calendar</v-icon>
                  Last update:
                  {{ getLocalTimeString(map_input.updated_at) }}
                </v-col>
              </v-row>
            </div>
          </v-card-text>

          <v-card-actions>
            <div class="widget-buttons">
              <v-btn size="x-large" variant="text" @click="map_dialog = false">
                <v-icon start>close</v-icon>
                {{ $t("global.actions.close") }}
              </v-btn>

              <v-btn
                v-if="!IS_VENDOR_PANEL /*Vendor can't edit map location!*/"
                color="primary"
                size="x-large"
                variant="flat"
                @click="selectMap(map_input)"
              >
                <v-icon class="me-1">check</v-icon>
                {{ $t("global.actions.confirm") }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>

    <v-card-actions>
      <s-widget-buttons :auto-fixed-position="!dialogMode">
        <v-btn
          v-if="dialogMode"
          size="x-large"
          variant="text"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="vendor"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="updateVendor"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addVendor"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.add") }}
        </v-btn>
      </s-widget-buttons>
    </v-card-actions>
  </v-card>
</template>

<script>
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
import UTabsFloating from "../../../ui/tab/floating/UTabsFloating.vue";
import BVendorDocumentsList from "../../vendor/documents/list/BVendorDocumentsList.vue";
import BTranslationButtonVendor from "../../translation/button/vendor/BTranslationButtonVendor.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";
import VPricingInput from "../../../storefront/pricing/VPricingInput.vue";

export default {
  name: "BVendorAdd",
  components: {
    SWidgetButtons,
    BTranslationButtonVendor,
    BVendorDocumentsList,
    VPricingInput,
    UTabsFloating,
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
  emits: ["add", "close"],
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
    tab: 0,

    busy: false,

    name: null,
    description: null,

    email: null,
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

    map_id: null,
    pricing_id: null,
    //-----------------------------
    map_dialog: false,
    map_input: null,
  }),
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
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
  },

  watch: {
    vendor() {
      this.assign();
    },
  },

  created() {
    this.assign();
  },

  methods: {
    //――――――――――――――――――――――― Edit Vendor ―――――――――――――――――――――――

    assign() {
      this.resetToDefault(); // 🞇 Reset to default

      if (this.vendor) {
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

        this.map_id = this.vendor.map_id;
        this.pricing_id = this.vendor.pricing_id;

        this.country = this.vendor.country;
        this.state = this.vendor.state;
        this.business = this.vendor.business;
        this.business_name = this.vendor.business_name;
        this.tax_id = this.vendor.tax_id;
      }
    },

    addVendor() {
      if (this.IS_VENDOR_PANEL) {
        return this.showErrorAlert(null, "You can not add a new vendor here!");
      }

      const valid = this.$refs.form.validate();
      if (!valid) return;

      this.busy = true;

      axios
        .post(window.API.POST_SHOP_ADD_VENDOR(this.shop.id), {
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

          map_id: this.map_id,
          pricing_id: this.pricing_id,

          country: this.country,
          state: this.state,
          business: this.business,
          business_name: this.business_name,
          tax_id: this.tax_id,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add", data.vendor);
            this.$emit("close");
            this.showSuccessAlert(null, "Vendor has been added successfully.");
            this.resetToDefault(); // 🞇 Reset to default
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    updateVendor() {
      const valid = this.$refs.form.validate();
      if (!valid) return;

      this.busy = true;

      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_ADD_VENDOR_UPDATE_MY_VENDOR_PROFILE(
                this.$route.params.vendor_id,
              )
            : window.API.PUT_SHOP_EDIT_VENDOR(this.shop.id, this.vendor.id),
          {
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

            map_id: this.map_id,
            pricing_id: this.pricing_id,

            country: this.country,
            state: this.state,
            business: this.business,
            business_name: this.business_name,
            tax_id: this.tax_id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            Object.assign(this.vendor, data.vendor);
            this.$emit("update", data.vendor);
            this.$emit("close");
            this.showSuccessAlert(
              null,
              "Vendor has been updated successfully.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    handleProcessFileIcon(path) {
      this.vendor.icon = path;
    },

    showRemove() {
      this.openDangerAlert(
        `Remove ${this.vendor.name}`,
        "Are you sure to remove this vendor?",
        "Yes,Remove it",
        () => {
          this.remove();
        },
      );
    },
    remove() {
      this.busy_delete = true;

      axios
        .delete(
          window.API.DELETE_SHOP_EDIT_VENDOR(this.shop.id, this.vendor.id),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("remove", data.id);
            this.$emit("close");
            this.showSuccessAlert(
              null,
              "Vendor has been removed successfully.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
  },
};
</script>

<style scoped></style>
