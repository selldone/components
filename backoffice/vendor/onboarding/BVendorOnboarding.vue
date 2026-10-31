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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ██████████████████████ Vendor request form ██████████████████████ -->

  <v-card v-if="modernReview" v-bind="$attrs" class="sd-modern-canvas b-vendor-onboarding-modern text-start">
    <v-card-title class="b-vendor-onboarding-modern__header">
      <div>
        <h2>{{ company.name || modelValue?.user?.name || $t('marketplace_requests.modern.review.title') }}</h2>
        <div class="b-vendor-onboarding-modern__subtitle">
          <span>{{ $t('marketplace_requests.modern.review.title') }}</span>
          <span class="sd-modern-status sd-modern-status--plain" role="status">
            <span class="sd-modern-status__dot" :class="'sd-modern-status__dot--' + (reviewStatus === 'accepted' ? 'success' : reviewStatus === 'rejected' ? 'error' : 'warning')"></span>
            {{ $t('marketplace_requests.modern.review.' + reviewStatus) }}
          </span>
          <button v-if="modelValue?.created_at" type="button" class="b-vendor-onboarding-modern__created" :aria-label="$t('marketplace_requests.modern.review.created') + ': ' + getLocalTimeString(modelValue.created_at)">
            {{ getFromNowString(modelValue.created_at) }}
            <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ $t('marketplace_requests.modern.review.created') }}: {{ getLocalTimeString(modelValue.created_at) }}</v-tooltip>
          </button>
        </div>
      </div>
      <v-btn class="sd-modern-icon-button" variant="text" icon :disabled="busy_accept !== null" :aria-label="$t('global.actions.close')" @click="close">
        <v-icon size="16" aria-hidden="true">close</v-icon>
        <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
      </v-btn>
    </v-card-title>
    <v-card-text class="b-vendor-onboarding-modern__body">
      <div class="b-vendor-onboarding-modern__layout">
        <nav class="sd-modern-section-nav b-vendor-onboarding-modern__nav" :aria-label="$t('marketplace_requests.modern.review.title')">
          <button v-for="tab in reviewSections" :key="tab.value" type="button" class="sd-modern-section-nav__item" :class="{ 'sd-modern-section-nav__item--active': step === tab.value }" :aria-current="step === tab.value ? 'location' : undefined" @click="setReviewStep(tab.value)">
            <v-icon size="15" aria-hidden="true">{{ tab.icon }}</v-icon><span>{{ $t('marketplace_requests.modern.review.' + tab.key) }}</span>
          </button>
        </nav>
        <section ref="reviewContent" class="b-vendor-onboarding-modern__content" :aria-label="$t('marketplace_requests.modern.review.' + reviewSection.key)">
          <h3>{{ $t('marketplace_requests.modern.review.' + reviewSection.key) }}</h3>
          <p class="b-vendor-onboarding-modern__intro">{{ $t('marketplace_requests.modern.review.' + reviewSection.key + 'Intro') }}</p>
          <div v-if="step < 5" class="sd-modern-widget b-vendor-onboarding-modern__widget">
            <dl class="b-vendor-onboarding-modern__fields">
              <div v-for="field in reviewFields" :key="field.key" :class="{ 'b-vendor-onboarding-modern__full': field.full }">
                <dt>{{ $t('marketplace_requests.modern.review.' + field.label) }}</dt>
                <dd :class="{ 'b-vendor-onboarding-modern__missing': !hasReviewValue(field.value) }">
                  <template v-if="hasReviewValue(field.value)"><flag v-if="field.key === 'country'" :iso="field.value" :squared="false" class="me-2" /><bdi>{{ field.key === 'country' ? getCountryName(field.value) || field.value : field.value }}</bdi></template>
                  <span v-else>{{ $t('marketplace_requests.modern.review.missing') }}</span>
                </dd>
              </div>
            </dl>
          </div>
          <div v-else-if="step === 5" class="sd-modern-widget b-vendor-onboarding-modern__widget">
            <ul v-if="reviewDocuments.length" class="b-vendor-onboarding-modern__documents">
              <li v-for="(doc, index) in reviewDocuments" :key="doc.type + '-' + index">
                <div class="b-vendor-onboarding-modern__document-heading">
                  <div><h4>{{ documentTitle(doc) }}</h4><p v-if="doc.name" class="b-vendor-onboarding-modern__document-name">{{ doc.name }}</p></div>
                  <v-btn v-if="doc.type === 'Embed'" class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :disabled="!doc.code" @click="showEmbedForm(doc)">{{ $t('marketplace_requests.modern.review.openDocument') }}</v-btn>
                  <v-btn v-else-if="doc.type === 'Link'" class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :href="doc.link" :disabled="!doc.link" target="_blank" rel="noopener noreferrer">{{ $t('marketplace_requests.modern.review.openLink') }}<v-icon size="16" end aria-hidden="true">north_east</v-icon></v-btn>
                </div>
                <div v-if="doc.guide || getType(doc)?.description" class="b-vendor-onboarding-modern__guide" v-html="doc.guide ? (['Embed', 'Link'].includes(doc.type) ? doc.guide : smartConvert(doc.guide)) : $t(getType(doc).description)"></div>
                <template v-if="!['Embed', 'Link'].includes(doc.type)">
                  <div v-for="attachment in attachments?.filter(a => a.type === doc.type)" :key="attachment.id" class="b-vendor-onboarding-modern__file">
                    <v-avatar :image="FileHelper.GetFileIcon(attachment.name || '')" size="30" rounded class="hover-scale-small" />
                    <div class="b-vendor-onboarding-modern__file-body">
                      <div class="b-vendor-onboarding-modern__filename" dir="auto">{{ attachment.name || $t('marketplace_requests.modern.review.missing') }}</div>
                      <div class="b-vendor-onboarding-modern__file-meta"><bdi :aria-label="$t('marketplace_requests.modern.review.fileType')">{{ fileExtension(attachment.name) }}</bdi><span>·</span><span :aria-label="$t('marketplace_requests.modern.review.fileSize')">{{ numeralFormat(attachment.size, '0.[0] ib') }}</span></div>
                      <p v-if="attachment.note" class="b-vendor-onboarding-modern__file-note" dir="auto">{{ attachment.note }}</p>
                    </div>
                    <v-btn v-if="modelValue?.id && attachment.id" class="sd-modern-icon-button" variant="text" icon :href="getDownloadLink(attachment)" target="_blank" rel="noopener noreferrer" :aria-label="$t('marketplace_requests.modern.review.download') + ': ' + (attachment.name || documentTitle(doc))" @click.stop>
                      <v-icon size="16" aria-hidden="true">download</v-icon><v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('marketplace_requests.modern.review.download') }}</v-tooltip>
                    </v-btn>
                  </div>
                  <p v-if="!attachments?.some(a => a.type === doc.type)" class="b-vendor-onboarding-modern__missing-file">{{ $t('marketplace_requests.modern.review.missingDocument') }}</p>
                </template>
              </li>
            </ul>
            <p v-else class="b-vendor-onboarding-modern__missing-file">{{ $t('marketplace_requests.modern.review.emptyDocuments') }}</p>
          </div>
          <div v-else class="sd-modern-widget b-vendor-onboarding-modern__widget">
            <p class="sd-modern-notice"><v-icon size="17" aria-hidden="true">{{ reviewStatus === 'pending' ? 'schedule' : 'info_outline' }}</v-icon><span>{{ $t('marketplace_requests.modern.review.' + (reviewStatus === 'pending' ? 'pendingHelp' : 'reconsider')) }}</span></p>
            <div class="b-vendor-onboarding-modern__choices" role="group" :aria-label="$t('marketplace_requests.modern.review.decision')">
              <u-smart-verify :model-value="accept" class="b-vendor-onboarding-modern__choice" color="primary" false-gray :disabled="busy_accept !== null" :true-title="$t('marketplace_requests.modern.review.accept')" :true-description="$t('marketplace_requests.modern.review.acceptHint')" role="checkbox" :aria-checked="accept" :tabindex="busy_accept !== null ? -1 : 0" @update:model-value="setDecision(true, $event)" @keydown.enter.prevent="setDecision(true, !accept)" @keydown.space.prevent="setDecision(true, !accept)" />
              <u-smart-verify :model-value="reject" class="b-vendor-onboarding-modern__choice" color="error" false-gray :disabled="busy_accept !== null" :true-title="$t('marketplace_requests.modern.review.reject')" :true-description="$t('marketplace_requests.modern.review.rejectHint')" role="checkbox" :aria-checked="reject" :tabindex="busy_accept !== null ? -1 : 0" @update:model-value="setDecision(false, $event)" @keydown.enter.prevent="setDecision(false, !reject)" @keydown.space.prevent="setDecision(false, !reject)" />
            </div>
            <p v-if="accept || reject" class="sd-modern-notice"><v-icon size="17" aria-hidden="true">info_outline</v-icon><span>{{ $t('marketplace_requests.modern.review.' + (accept ? 'acceptWarning' : 'rejectWarning')) }}</span></p>
            <p class="b-vendor-onboarding-modern__decision-help">{{ $t('marketplace_requests.modern.review.decisionHelp') }}</p>
            <div v-if="reviewDecisionDate" class="b-vendor-onboarding-modern__decision-date"><v-icon size="17" aria-hidden="true">event_available</v-icon><div><span>{{ $t('marketplace_requests.modern.review.currentDecision') }} · {{ $t('marketplace_requests.modern.review.' + reviewStatus) }}</span><time :datetime="reviewDecisionDate">{{ getFromNowString(reviewDecisionDate) }} · {{ getLocalTimeString(reviewDecisionDate) }}</time></div></div>
          </div>
        </section>
      </div>
    </v-card-text>
    <v-card-actions class="b-vendor-onboarding-modern__footer">
      <span class="b-vendor-onboarding-modern__readonly" :class="{ 'b-vendor-onboarding-modern__readonly--hidden': step === 100 }" :aria-hidden="step === 100">{{ $t('marketplace_requests.modern.review.readonly') }}</span>
      <div class="b-vendor-onboarding-modern__actions">
        <v-btn class="sd-modern-button" variant="outlined" :disabled="busy_accept !== null" @click="close">{{ $t('global.actions.close') }}</v-btn>
        <v-btn v-if="step !== 100" class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" prepend-icon="rate_review" @click="setReviewStep(100)">{{ $t('marketplace_requests.modern.review.decision') }}</v-btn>
        <v-btn v-else-if="accept" class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" prepend-icon="check" :disabled="busy_accept !== null" :loading="busy_accept === 'true'" @click="acceptRequest(true)">{{ $t('marketplace_requests.modern.review.acceptAction') }}</v-btn>
        <v-btn v-else-if="reject" class="sd-modern-button" color="error" variant="outlined" prepend-icon="close" :disabled="busy_accept !== null" :loading="busy_accept === 'false'" @click="acceptRequest(false)">{{ $t('marketplace_requests.modern.review.rejectAction') }}</v-btn>
      </div>
    </v-card-actions>
  </v-card>
  <v-card v-else v-bind="$attrs" class="text-start">
    <v-card-title class="d-flex align-center">
      <v-icon class="me-1">add_business</v-icon>
      {{
        adminMode
          ? "Review vendor's request"
          : modelValue?.id
            ? "Edit vendor request"
            : "Add new vendor"
      }}
      <v-spacer></v-spacer>
      <v-btn icon variant="text" @click="close()">
        <v-icon> close</v-icon>
      </v-btn>
    </v-card-title>
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <v-card-text :class="{ disabled: busy_fetch }">
      <v-stepper
        v-model="step"
        border
        class="max-width-container-1280px mx-auto mb-5"
        editable
        flat
        mandatory
        rounded="xl"
      >
        <v-stepper-header>
          <v-stepper-item
            :color="valid_company ? 'green' : '#000'"
            :complete="valid_company && step !== 1"
            :value="1"
            class="text-start"
          >
            Company
            <v-expand-transition>
              <small v-if="valid_company" class="d-block">{{
                company?.name
              }}</small>
              <small v-else class="d-block text-red">Complete form!</small>
            </v-expand-transition>
          </v-stepper-item>

          <div class="flex-grow-1 hr-dashed"></div>

          <v-stepper-item
            :color="valid_personal ? 'green' : '#000'"
            :complete="valid_personal && step !== 2"
            :value="2"
            class="text-start"
          >
            Person
            <v-expand-transition>
              <small v-if="valid_personal" class="d-block">{{
                personal?.name
              }}</small>
              <small v-else-if="step > 2" class="d-block text-red"
                >Complete form!</small
              >
            </v-expand-transition>
          </v-stepper-item>

          <div class="flex-grow-1 hr-dashed"></div>

          <v-stepper-item
            :color="valid_products ? 'green' : '#000'"
            :complete="valid_products && step !== 3"
            :value="3"
            class="text-start"
          >
            Merchandise
            <v-expand-transition>
              <small class="d-block">About Products</small>
            </v-expand-transition>
          </v-stepper-item>

          <div class="flex-grow-1 hr-dashed"></div>

          <v-stepper-item
            :color="valid_bank ? 'green' : '#000'"
            :complete="valid_bank && step !== 4"
            :value="4"
            class="text-start"
          >
            Payout
            <v-expand-transition>
              <small class="d-block">Bank Information</small>
            </v-expand-transition>
          </v-stepper-item>
          <div class="flex-grow-1 hr-dashed"></div>

          <v-stepper-item
            :color="valid_document ? 'green' : '#000'"
            :complete="valid_document && step !== 5"
            :value="5"
            class="text-start"
          >
            Documents
            <v-expand-transition>
              <small class="d-block">Upload Files</small>
            </v-expand-transition>
          </v-stepper-item>

          <template v-if="adminMode">
            <div class="flex-grow-1 hr-dashed"></div>

            <v-stepper-item
              :color="modelValue?.accepted_at ? 'green' : '#000'"
              :complete="!!modelValue?.accepted_at"
              :error="!!modelValue?.rejected_at"
              :value="100"
              class="text-start"
            >
              Marketplace
              <v-expand-transition>
                <small class="d-block">{{
                  modelValue?.rejected_at
                    ? "Rejected"
                    : modelValue?.accepted_at
                      ? "Accepted"
                      : "Accept/Reject Actions"
                }}</small>
              </v-expand-transition>
            </v-stepper-item>
          </template>
        </v-stepper-header>
      </v-stepper>

      <v-form ref="form" lazy-validation>
        <v-scroll-y-reverse-transition group hide-on-leave>
          <div v-if="step === 1">
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Status ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
            <div
              v-if="modelValue && modelValue.created_at"
              class="widget-box mb-5"
            >
              <u-widget-header
                icon="workspaces"
                title="Last status"
              ></u-widget-header>
              <v-list-subheader>
                Here, you can view the latest status of the vendor request.
              </v-list-subheader>
              <div class="py-1">
                <div class="min-width-200 my-1">
                  <small class="float-end">{{
                    $t("global.commons.created_at")
                  }}</small>
                  {{ getFromNowString(modelValue.created_at) }}<br />
                  <small>
                    {{ getLocalTimeString(modelValue.created_at) }}
                  </small>
                </div>

                <div v-if="modelValue.accepted_at" class="min-width-200 my-1">
                  <v-chip class="float-end" color="green"
                    >{{ $t("global.status.accepted") }}
                  </v-chip>
                  <v-icon class="me-1" size="small"
                    >subdirectory_arrow_right
                  </v-icon>
                  {{ getFromNowString(modelValue.accepted_at) }}<br />
                  <small>
                    {{ getLocalTimeString(modelValue.accepted_at) }}
                  </small>
                </div>

                <div
                  v-else-if="modelValue.rejected_at"
                  class="min-width-200 my-1"
                >
                  <v-chip class="float-end" color="red"
                    >{{ $t("global.status.rejected") }}
                  </v-chip>
                  <v-icon class="me-1" size="small"
                    >subdirectory_arrow_right
                  </v-icon>
                  {{ getFromNowString(modelValue.rejected_at) }}<br />
                  <small>
                    {{ getLocalTimeString(modelValue.rejected_at) }}
                  </small>
                </div>

                <div v-else class="min-width-200 my-1">
                  <v-icon class="me-1">hourglass_top</v-icon>
                  {{ $t("global.commons.pending") }}...
                </div>
              </div>
            </div>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Company information ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <div class="widget-box mb-5">
              <u-widget-header
                icon="business"
                title="Company information"
              ></u-widget-header>
              <v-list-subheader>
                This is the information regarding the vendor's business.
              </v-list-subheader>
              <v-text-field
                v-model="company.name"
                :readonly="adminMode"
                :rules="[GlobalRules.required()]"
                label="Company name*"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="company.address"
                :label="$t('global.commons.address') + '*'"
                :readonly="adminMode"
                :rules="[GlobalRules.required()]"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="company.postal_code"
                :label="$t('global.map_view.postal_code')"
                :readonly="adminMode"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="company.phone"
                :label="$t('global.map_view.phone_input') + '*'"
                :readonly="adminMode"
                :rules="[GlobalRules.required()]"
                placeholder="(+45) 2225 6000"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="company.email"
                :label="$t('global.commons.email') + '*'"
                :readonly="adminMode"
                :rules="[GlobalRules.required(), GlobalRules.email()]"
                placeholder="john@sample.com"
                variant="underlined"
              ></v-text-field>
              <v-text-field
                v-model="company.web"
                :label="$t('global.commons.website')"
                :readonly="adminMode"
                placeholder="https://..."
                variant="underlined"
              ></v-text-field>
            </div>
          </div>

          <div v-if="step === 2">
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Personal information ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <div class="widget-box mb-5">
              <u-widget-header
                icon="person"
                title="Personal information"
              ></u-widget-header>
              <v-list-subheader>
                Personal information of the vendor account owner.
              </v-list-subheader>
              <v-text-field
                v-model="personal.name"
                :label="$t('global.commons.name') + '*'"
                :readonly="adminMode"
                :rules="[GlobalRules.required()]"
                variant="underlined"
              ></v-text-field>

              <s-country-select
                v-model="personal.country"
                :label="$t('global.commons.country')"
                :readonly="adminMode"
                variant="underlined"
              ></s-country-select>
            </div>
          </div>
          <div v-if="step === 3">
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃ Products Category ▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <div class="widget-box mb-5">
              <u-widget-header
                icon="inventory"
                title="Your products"
              ></u-widget-header>
              <v-list-subheader
                >What are the products or items that your company offers for
                sale?
              </v-list-subheader>

              <v-textarea
                v-model="product.description"
                :readonly="adminMode"
                auto-grow
                placeholder="About your products... Keep it short."
                rows="3"
                variant="underlined"
              ></v-textarea>
            </div>
          </div>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bank info  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div v-if="step === 4">
            <div class="widget-box mb-5">
              <u-widget-header icon="paid" title="Payout Information">
              </u-widget-header>
              <v-list-subheader
                >Input your bank details here for payouts.
              </v-list-subheader>

              <v-text-field
                v-model="bank.name"
                :label="$t('global.commons.bank_name')"
                append-inner-icon="account_balance"
                auto-grow
                hint="The name of the bank where the vendor has their account."
                persistent-placeholder
                placeholder="Your bank name.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.account_name"
                :label="$t('global.commons.bank_account_name')"
                hint="This should match the name associated with the bank account."
                persistent-placeholder
                placeholder="Your name.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.account_number"
                :label="$t('global.commons.bank_account_number')"
                hint="The vendor's unique account number."
                persistent-placeholder
                placeholder="Your bank account number.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.routing_number"
                :label="$t('global.commons.bank_routing_number')"
                hint="This number varies by country. It's used to identify the specific bank branch the vendor uses."
                persistent-placeholder
                placeholder="Your bank routing number, sort code, or BSB number.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.iban"
                hint="International Bank Account Number): If the vendor's bank is in Europe or certain other countries."
                label="IBAN"
                persistent-placeholder
                placeholder="Your IBAN number..  eg. DE89 3704 0044 0000 0000 00"
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.swift"
                hint="International Bank Account Number): If the vendor's bank is in Europe or certain other countries."
                label="Swift Code/BIC"
                persistent-placeholder
                placeholder="Your Swift code/BIC.."
                variant="underlined"
              ></v-text-field>

              <v-text-field
                v-model="bank.branch_address"
                :label="$t('global.commons.bank_branch_address')"
                hint="The address of the bank branch where the vendor has their account."
                persistent-placeholder
                placeholder="Your bank address.."
                variant="underlined"
              ></v-text-field>
            </div>
          </div>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Documents  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div v-if="step === 5">
            <div class="widget-box mb-5">
              <u-widget-header
                icon="pageview"
                title="Upload Document"
                class="mt-3"
              >
              </u-widget-header>
              <v-list-subheader
                >Please upload the necessary business, IP, and address
                verification documents. We require this information to confirm
                your partnership and provide you with the necessary access.
              </v-list-subheader>

              <!-- ----------------- Embed Docs ----------------- -->
              <template v-for="(doc, i) in documents_embed" :key="'e' + i">
                <u-widget-header
                  :icon="getType(doc)?.icon"
                  :title="doc.title ? doc.title : $t(getType(doc)?.title)"
                  class="mt-5"
                >
                </u-widget-header>
                <v-list-subheader
                  v-html="doc.guide ? doc.guide : $t(getType(doc)?.description)"
                >
                </v-list-subheader>

                <div class="widget-buttons">
                  <v-btn
                    append-icon="edit"
                    size="x-large"
                    @click="showEmbedForm(doc)"
                  >
                    {{ doc.title ? doc.title : $t(getType(doc)?.title) }}
                  </v-btn>
                </div>
              </template>

              <!-- ----------------- Link Docs ----------------- -->

              <template v-for="(doc, i) in documents_link" :key="'l' + i">
                <u-widget-header
                  :icon="getType(doc)?.icon"
                  :title="doc.title ? doc.title : $t(getType(doc)?.title)"
                  class="mt-5"
                >
                </u-widget-header>
                <v-list-subheader
                  v-html="doc.guide ? doc.guide : $t(getType(doc)?.description)"
                >
                </v-list-subheader>

                <div class="widget-buttons">
                  <v-btn
                    append-icon="open_in_new"
                    size="x-large"
                    :href="doc.link"
                    target="_blank"
                  >
                    {{ doc.title ? doc.title : $t(getType(doc)?.title) }}
                  </v-btn>
                </div>
              </template>

              <!-- ----------------- Upload Docs ----------------- -->

              <template v-for="(item, i) in documents_upload" :key="i">
                <u-widget-header
                  :icon="getType(item)?.icon"
                  :title="
                    (item.title ? item.title : $t(getType(item)?.title)) +
                    (item.name ? ` | ${item.name}` : '')
                  "
                  class="mt-5"
                >
                </u-widget-header>

                <v-list-subheader v-if="item.guide">
                  <span v-html="smartConvert(item.guide)"></span>
                </v-list-subheader>

                <v-list-item
                  v-for="attachment in attachments?.filter(
                    (a) => a.type === item.type,
                  )"
                  :key="attachment.id"
                  :subtitle="attachment.name"
                  :title="`File | ${numeralFormat(attachment.size, '0.[0] ib')}`"
                  class="mb-5"
                >
                  <template v-slot:prepend>
                    <v-avatar
                      :image="FileHelper.GetFileIcon(attachment.name)"
                      rounded
                    >
                    </v-avatar>
                  </template>
                  <template v-slot:append>
                    <v-btn
                      v-if="adminMode && modelValue.id"
                      :href="getDownloadLink(attachment)"
                      class="me-2"
                      icon
                      target="_blank"
                      title="Download File"
                      variant="text"
                      @click.stop
                    >
                      <v-icon>download</v-icon>
                    </v-btn>

                    <v-btn
                      v-if="!adminMode"
                      :loading="busy_delete === attachment"
                      color="red"
                      icon
                      variant="text"
                      @click.stop="removeAttachment(attachment)"
                    >
                      <v-icon>close</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
                <v-file-input
                  v-if="!attachments?.some((a) => a.type === item.type)"
                  v-model="files[item.type]"
                  accept=".png,.jpg,.jpeg,.pdf"
                  chips
                  class="mb-5"
                  clearable
                  label="Select image or pdf..."
                  messages="Max image size: 8MB"
                  prepend-icon=""
                  prepend-inner-icon="attach_file"
                  show-size
                  variant="outlined"
                >
                </v-file-input>
              </template>
            </div>
          </div>
        </v-scroll-y-reverse-transition>
      </v-form>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Admin Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <div v-if="step === 100">
        <div v-if="adminMode" class="widget-box mb-5">
          <u-widget-header icon="rate_review" title="Actions"></u-widget-header>
          <v-list-subheader
            >As the marketplace admin, please review the vendor's request. Here,
            you can accept or reject the request. Accepting the request will
            create the vendor account in your marketplace.
          </v-list-subheader>
          <u-smart-verify
            v-model="accept"
            color="green"
            false-gray
            true-description="Approve the vendor's request to create their account in the marketplace."
            true-title="Accept Request"
            @update:model-value="reject = false"
          ></u-smart-verify>

          <u-smart-verify
            v-model="reject"
            color="red"
            false-gray
            true-description="Deny the vendor's request to create their account in the marketplace."
            true-title="Reject Request"
            @update:model-value="accept = false"
          ></u-smart-verify>
        </div>
      </div>
    </v-card-text>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Admin Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-card-actions v-if="adminMode">
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="close()">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="reject"
          :loading="busy_accept === 'false'"
          color="red"
          size="x-large"
          variant="elevated"
          @click="acceptRequest(false)"
        >
          <v-icon start>thumb_down_alt</v-icon>
          Reject vendor
        </v-btn>

        <v-btn
          v-if="accept"
          :loading="busy_accept === 'true'"
          color="success"
          size="x-large"
          variant="elevated"
          @click="acceptRequest(true)"
        >
          <v-icon start>thumb_up_alt</v-icon>
          Accept and create vendor
        </v-btn>
      </div>
    </v-card-actions>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Vendor Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
    <v-card-actions v-else>
      <div class="widget-buttons">
        <v-btn v-if="step === 1" size="x-large" variant="text" @click="close()">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>
        <v-btn v-else size="x-large" variant="text" @click="step--">
          <v-icon start>{{ $t("icons.chevron_back") }}</v-icon>

          {{ $t("global.actions.back") }}
        </v-btn>

        <v-btn
          v-if="modelValue"
          :loading="busy_save || busy_upload"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="saveChange"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <template v-else>
          <v-btn
            v-if="step === 5"
            :loading="busy_save || busy_upload"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="saveChange"
          >
            <v-icon start>add</v-icon>
            {{ $t("global.actions.add") }}
          </v-btn>

          <v-btn
            v-else
            :loading="busy_save || busy_upload"
            color="primary"
            size="x-large"
            variant="flat"
            @click="step++"
          >
            {{ $t("global.actions.next") }}
            <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
          </v-btn>
        </template>
      </div>
    </v-card-actions>
  </v-card>

  <!-- ██████████████████████ Dialog > Embed Form ██████████████████████ -->

  <v-dialog
    v-model="dialog_embed"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card v-if="selected_embed" class="text-start" color="#eee">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">view_cozy</v-icon>
        {{ selected_embed.title }}
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-sheet
            v-html="selected_embed.code"
            color="#fff"
            rounded="lg"
            class="overflow-hidden"
            v-dynamic-scripts="true"
            min-height="20vh"
          >
          </v-sheet>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_embed = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";
import SCountrySelect from "@selldone/components-vue/ui/country/select/SCountrySelect.vue";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";
import VendorDocumentType from "@selldone/core-js/enums/vendor/VendorDocumentType";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import { FileHelper } from "@selldone/core-js/utils/file/FileHelper.ts";
import DynamicScriptDirective from "@selldone/components-vue/directives/script/DynamicScriptDirective.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BVendorOnboarding",
  mixins: [DateMixin],
  directives: { "dynamic-scripts": DynamicScriptDirective },
  components: {
    UWidgetHeader,
    SCountrySelect,
    USmartVerify,
  },
  emits: ["update:modelValue", "update", "updated", "close"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    modelValue: {},
    adminMode: { type: Boolean, default: false },
    modern: { type: Boolean, default: false },
  },
  data: () => ({
    FileHelper: FileHelper,

    step: 1,

    company: {},
    personal: {},
    product: {},
    bank: {},

    busy_save: false,
    busy_upload: false,
    busy_fetch: false,
    busy_delete: null,

    files: {},
    //-------------------
    accept: false,
    reject: false,
    busy_accept: null,
    decisionRequestId: 0,

    selected_embed: null,
    dialog_embed: false,
  }),

  computed: {
    modernReview() { return this.modern && this.adminMode; },
    reviewStatus() { return this.modelValue?.accepted_at ? 'accepted' : this.modelValue?.rejected_at ? 'rejected' : 'pending'; },
    reviewDecisionDate() { return this.modelValue?.accepted_at || this.modelValue?.rejected_at || null; },
    reviewSections() {
      return [
        { value: 1, key: 'company', icon: 'business' },
        { value: 2, key: 'person', icon: 'person_outline' },
        { value: 3, key: 'merchandise', icon: 'inventory_2' },
        { value: 4, key: 'payout', icon: 'account_balance' },
        { value: 5, key: 'documents', icon: 'description' },
        { value: 100, key: 'decision', icon: 'fact_check' },
      ];
    },
    reviewSection() { return this.reviewSections.find(tab => tab.value === this.step) || this.reviewSections[0]; },
    reviewFields() {
      const group = this.step === 1 ? this.company : this.step === 2 ? this.personal : this.step === 3 ? this.product : this.bank;
      const fields = this.step === 1
        ? [['name', 'companyName', true], ['address', 'address', true], ['postal_code', 'postal'], ['phone', 'phone'], ['email', 'email'], ['web', 'web']]
        : this.step === 2
          ? [['name', 'personName', true], ['country', 'country', true]]
          : this.step === 3
            ? [['description', 'description', true]]
            : [['name', 'bankName', true], ['account_name', 'accountName'], ['account_number', 'accountNumber'], ['routing_number', 'routing'], ['iban', 'iban'], ['swift', 'swift'], ['branch_address', 'branch', true]];
      return fields.map(([key, label, full]) => ({ key, label, full, value: group[key] }));
    },
    reviewDocuments() {
      // Embed/link configurations may repeat; keep attachments after a configuration is removed.
      const documents = [], types = new Set();
      for (const doc of this.marketplace?.documents || []) {
        if (['Embed', 'Link'].includes(doc.type) || !types.has(doc.type)) documents.push(doc);
        types.add(doc.type);
      }
      for (const attachment of this.attachments || []) {
        if (!types.has(attachment.type)) {
          documents.push({ type: attachment.type });
          types.add(attachment.type);
        }
      }
      return documents;
    },
    valid_company() {
      return !!(
        this.company.address &&
        this.company.name &&
        this.company.phone &&
        this.company.email
      );
    },
    valid_personal() {
      return !!this.personal.name;
    },

    valid_products() {
      return !!this.product.description;
    },

    valid_bank() {
      return !!(
        this.bank.name &&
        this.bank.account_name &&
        this.bank.account_number
      );
    },

    valid_document() {
      return (
        this.attachments?.length || Object.values(this.files).some((f) => !!f)
      );
    },
    marketplace() {
      return this.shop.marketplace;
    },
    marketplace_documents() {
      return this.marketplace?.documents?.uniqueByKey("type"); // array of {type,guide}
    },
    attachments() {
      return this.modelValue?.attachments;
    },

    documents_upload() {
      return this.marketplace_documents?.filter(
        (x) =>
          ![
            VendorDocumentType.Embed.code,
            VendorDocumentType.Link.code,
          ].includes(x.type),
      );
    },

    documents_embed() {
      return this.marketplace_documents?.filter(
        (x) => VendorDocumentType.Embed.code === x.type,
      );
    },

    documents_link() {
      return this.marketplace_documents?.filter(
        (x) => VendorDocumentType.Link.code === x.type,
      );
    },
  },

  watch: {
    modelValue() {
      this.assign();
    },
    'shop.id'() { if (this.modernReview) this.assign(); },
    modernReview() {
      this.decisionRequestId++;
      this.busy_accept = null;
      this.accept = false;
      this.reject = false;
      if (this.modernReview) this.assign();
    },
  },

  created() {
    this.assign();

    if (!this.adminMode) {
      // Only fetch last vendor request for vendors! Not admin!
      this.fetchRequest();
    }
  },
  beforeUnmount() { this.decisionRequestId++; },

  methods: {
    hasReviewValue(value) { return value !== null && value !== undefined && value !== ''; },
    documentTitle(document) { return document.title || this.$t(this.getType(document)?.title || 'marketplace_requests.modern.review.document'); },
    fileExtension(name) { return /\.([^.]+)$/.exec(name || '')?.[1]?.toUpperCase() || this.$t('marketplace_requests.modern.review.missing'); },
    setReviewStep(value) {
      if (!this.reviewSections.some(tab => tab.value === value)) return;
      this.step = value;
      if (this.$refs?.reviewContent) this.$refs.reviewContent.scrollTop = 0;
    },
    setDecision(accepted, checked) {
      if (!this.modernReview || this.step !== 100 || this.busy_accept !== null) return;
      this.accept = accepted && checked;
      this.reject = !accepted && checked;
    },
    assign() {
      this.decisionRequestId++;
      if (this.modelValue) {
        this.company = Object.assign({}, this.modelValue.company);
        this.personal = Object.assign({}, this.modelValue.personal);
        this.product = Object.assign({}, this.modelValue.product);
        this.bank = Object.assign({}, this.modelValue.bank);
      } else if (this.modernReview) {
        this.company = {};
        this.personal = {};
        this.product = {};
        this.bank = {};
      }
      if (this.modernReview) {
        this.step = 1;
        this.busy_accept = null;
        this.dialog_embed = false;
        this.selected_embed = null;
      }
      this.reject = false;
      this.accept = false;
      this.files = {};
    },

    fetchRequest() {
      this.busy_fetch = true;

      axios
        .get(window.VAPI.GET_ADD_VENDOR_REQUEST(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("update:modelValue", data.vendor_request);
          } else {
            // We don't have any request! no need to show error!
            // NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    saveChange() {
      const valid = this.$refs.form.validate();
      if (!valid) return;

      this.busy_save = true;

      axios
        .post(window.VAPI.POST_SEND_ADD_VENDOR_REQUEST(), {
          shop_id: this.shop.id,
          company: this.company,
          personal: this.personal,
          product: this.product,
          bank: this.bank,
        })
        .then(({ data }) => {
          if (!data.error) {
            if (Object.values(this.files)?.some((f) => !!f)) {
              this.$emit("update:modelValue", data.vendor_request);
              this.uploadFiles(data.vendor_request);
              NotificationService.showSuccessAlert(
                "Uploading files...",
                "Your vendor request is received!",
              );
            } else {
              NotificationService.showSuccessAlert(
                null,
                "Your vendor request is received!",
              );
              this.$emit("update:modelValue", data.vendor_request);

              this.close();
            }
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
    },
    uploadFiles(vendor_request) {
      this.busy_upload = true;

      let formData = new FormData();

      formData.append("shop_id", this.shop.id);

      // Append files
      for (let key in this.files) {
        if (this.files[key] !== null) {
          formData.append(key, this.files[key]);
        }
      }

      axios
        .post(window.VAPI.POST_VENDOR_REQUEST_UPLOAD_FILES(), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(({ data }) => {
          if (!data.error) {

            vendor_request.attachments.push(...data.attachments);
            this.$emit("update:modelValue", vendor_request);

            this.files = {};

            NotificationService.showSuccessAlert(
              null,
              "Files uploaded successfully!",
            );
            this.close();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_upload = false;
        });
    },

    close() {
      if (this.modernReview) {
        this.accept = false;
        this.reject = false;
      }
      this.$emit("close");
    },

    removeAttachment(attachment) {
      NotificationService.openDangerAlert(
        "Delete Attachment",
        "Are you sure you want to delete this attachment?",
        "Yes, Delete Now",
        () => {
          this.busy_delete = attachment;

          axios
            .delete(
              window.VAPI.DELETE_VENDOR_REQUEST_ATTACHMENT(attachment.id),
              {
                params: { shop_id: this.shop.id },
              },
            )
            .then(({ data }) => {
              if (!data.error) {
                this.DeleteItemByID(this.attachments, data.id);

                NotificationService.showSuccessAlert(
                  null,
                  "Attachment removed successfully!",
                );
              } else {
                NotificationService.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = null;
            });
        },
      );
    },

    getDownloadLink(attachment) {
      return window.API.GET_SHOP_VENDOR_REQUEST_ATTACHMENT_DOWNLOAD_LINK(
        this.shop.id,
        this.modelValue.id,
        attachment.id,
      );
    },

    //▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Admin Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    acceptRequest(accept) {
      const modernRequest = this.modern;
      if (modernRequest && (
        !this.adminMode || !this.modelValue?.id || this.busy_accept !== null || this.step !== 100 ||
        typeof accept !== 'boolean' || (accept ? !this.accept || this.reject : !this.reject || this.accept)
      )) return;
      const requestId = ++this.decisionRequestId;
      const shopId = this.shop.id;
      const request = this.modelValue;
      const requestIdValue = request.id;
      const wasPending = !request.accepted_at && !request.rejected_at;
      const current = () => !modernRequest || (
        requestId === this.decisionRequestId && this.modernReview && this.shop.id === shopId &&
        this.modelValue === request && this.modelValue?.id === requestIdValue
      );
      this.busy_accept = "" + accept;

      return axios
        .post(
          window.API.POST_SHOP_VENDOR_REQUESTS_ACCEPT(
            this.shop.id,
            this.modelValue.id,
          ),
          {
            accept: accept,
          },
        )
        .then(({ data }) => {
          if (!current()) return;
          if (!data.error) {
            Object.assign(this.modelValue, data.vendor_request);
            this.$emit("update", data.vendor_request);
            if (modernRequest) this.$emit("updated", this.modelValue);
            this.close();

            // Only the first review removes a pending application from the modern badge.
            if (this.shop?.vendors?.waiting_count && (!modernRequest || wasPending)) {
              this.shop.vendors.waiting_count--;
            }
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (!current()) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (!current()) return;
          this.busy_accept = null;
        });
    },

    smartConvert(guide) {
      return SmartConvertTextToHtml(guide, false);
    },
    getType(document) {
      return VendorDocumentType[document?.type];
    },

    showEmbedForm(doc) {
      this.selected_embed = doc;
      this.dialog_embed = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-vendor-onboarding-modern {
  &.v-card { display: flex; flex-direction: column; height: 100dvh; max-height: 100dvh; padding: 0; border-radius: 0 !important; font-family: inherit; font-size: 14px; line-height: 23px; overflow: hidden; }
  &__header { display: flex; align-items: flex-start; justify-content: space-between; flex-shrink: 0; gap: 16px; padding: 22px 24px 18px; background: rgb(var(--v-theme-surface)); border-block-end: 1px solid var(--sd-modern-border); white-space: normal;
    > div { min-width: 0; }
    h2 { margin: 0; font-family: inherit; font-size: 21px; font-weight: 600; line-height: 29px; overflow-wrap: anywhere; }
  }
  &__subtitle { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 10px; margin-block-start: 4px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px;
    .sd-modern-status { font-size: 12px; line-height: 19px; }
  }
  &__created { padding: 0; color: inherit; font-family: inherit; font-size: inherit; line-height: inherit; text-align: start; }
  &__body { flex: 1 1 auto; min-height: 0; padding: 28px 24px 30px !important; overflow: hidden !important; }
  &__layout { display: grid; grid-template-columns: 174px minmax(0, 1fr); height: 100%; min-height: 0; gap: 30px; }
  &__nav { display: flex; flex-direction: column; align-self: start; max-height: 100%; min-height: 0; overflow-y: auto; gap: 6px; padding: 6px 4px 10px;
    .sd-modern-section-nav__item { display: flex; align-items: center; justify-content: flex-start; gap: 9px; min-height: 43px; flex-shrink: 0; padding: 11px 12px; border-radius: 9px; font-family: inherit; font-size: 13px; font-weight: 400; line-height: 20px; text-align: start; white-space: normal;
      > span { min-width: 0; overflow-wrap: anywhere; }
    }
  }
  &__content { width: 100%; max-width: 760px; height: 100%; min-width: 0; min-height: 0; margin-inline: auto; padding: 6px 4px 24px; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable;
    > h3 { margin: 0; font-family: inherit; font-size: 23px; font-weight: 600; line-height: 31px; letter-spacing: -.4px; }
  }
  &__intro { margin: 5px 0 17px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__widget { padding: 26px; border-radius: 17px; min-width: 0; }
  &__fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 21px 24px; margin: 0;
    > div { min-width: 0; }
    dt { margin: 0 0 5px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
    dd { margin: 0; min-height: 23px; font-size: 14px; line-height: 23px; white-space: pre-line; overflow-wrap: anywhere; }
  }
  &__full { grid-column: 1/-1; }
  &__missing { color: var(--sd-modern-muted); }
  &__documents { list-style: none; padding: 0; margin: 0;
    > li { padding-block: 16px; border-block-end: 1px solid var(--sd-modern-border); }
    > li:first-child { padding-block-start: 0; }
    > li:last-child { padding-block-end: 0; border: 0; }
  }
  &__document-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;
    > div { min-width: 0; }
    h4 { margin: 0; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 23px; overflow-wrap: anywhere; }
    > .v-btn { flex-shrink: 0; }
  }
  &__document-name, &__guide { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; overflow-wrap: anywhere;
    :deep(p:last-child) { margin-block-end: 0; }
  }
  &__file { display: flex; align-items: flex-start; gap: 10px; margin-block-start: 15px;
    > .v-avatar { flex-shrink: 0; margin-block-start: 2px; }
    > .v-btn { flex-shrink: 0; margin-inline-start: auto; }
  }
  &__file-body { min-width: 0; }
  &__filename { font-size: 13px; line-height: 21px; overflow-wrap: anywhere; }
  &__file-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__file-note { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; overflow-wrap: anywhere; }
  &__missing-file { margin: 12px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__choices { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; margin-block: 18px; }
  &__choice { min-width: 0; min-height: 100px; padding: 13px; border: 1px solid var(--sd-modern-border); border-radius: 12px;
    &.s--smart-verify--checked { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 3px 10px rgba(var(--v-theme-on-surface), .07); }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
    :deep(.p-2) { padding: 0 !important; }
    :deep(b) { font-size: 14px; font-weight: 500; line-height: 22px; }
    :deep(.small) { font-size: 13px; line-height: 21px; }
    :deep(.v-avatar) { width: 24px !important; height: 24px !important; min-width: 24px !important; }
  }
  &__decision-help { margin: 12px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__decision-date { display: flex; align-items: flex-start; gap: 10px; margin-block-start: 16px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px;
    > .v-icon { margin-block-start: 2px; }
    time { display: block; margin-block-start: 3px; }
  }
  .sd-modern-notice { align-items: flex-start; gap: 10px; margin: 0 0 17px; font-size: 13px; line-height: 21px;
    > .v-icon { margin-block-start: 2px; }
  }
  &__footer { display: flex; align-items: center; flex-wrap: wrap; flex-shrink: 0; gap: 12px; padding: 16px 24px; background: rgb(var(--v-theme-surface)); border-block-start: 1px solid var(--sd-modern-border); }
  &__readonly { color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__readonly--hidden { visibility: hidden; }
  &__actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-inline-start: auto; }
  .sd-modern-icon-button { --sd-modern-icon-button-size: 33px; }
  @media (max-width: 850px) {
    &__header { padding: 18px 15px 16px; }
    &__body { padding: 12px 11px 16px !important; }
    &__layout { display: flex; flex-direction: column; gap: 14px; }
    &__nav { width: 100%; flex: 0 0 auto; max-height: 35dvh; flex-direction: row; flex-wrap: wrap; gap: 6px; padding-block: 6px;
      .sd-modern-section-nav__item { max-width: 100%; min-height: 44px; padding: 8px; gap: 6px; > span { overflow-wrap: normal; } }
    }
    &__content { flex: 1 1 auto; height: auto; padding-block-start: 4px; > h3 { font-size: 22px; line-height: 30px; } }
    &__widget { padding: 18px 16px; }
    &__footer { padding: 14px 15px; }
    &__readonly { width: 100%; }
    .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
  }
  @media (max-width: 440px) {
    &__fields, &__choices { grid-template-columns: minmax(0, 1fr); }
    &__document-heading { flex-wrap: wrap; gap: 8px; }
  }
  @media (pointer: coarse) { .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; } &__nav .sd-modern-section-nav__item { min-height: 44px; } }
  @media (prefers-reduced-motion: reduce) { &__choice :deep(.interactive-zoom-in) { animation: none !important; } }
}
</style>
