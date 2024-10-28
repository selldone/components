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
  <v-container>
    <div class="widget-box mb-5">
      <u-widget-header icon="account_circle" title="User"></u-widget-header>
      <v-list-subheader
        >Please provide your contact information below.
      </v-list-subheader>
      <s-user-input
        v-if="!in_edit && isSelldoneAdmin"
        v-model="email"
        label="Email"
        messages="Expert email*. Find user by this email!"
      >
      </s-user-input>
      <v-text-field
        v-else-if="isSelldoneAdmin"
        v-model="email"
        label="Email"
        prepend-inner-icon="account_circle"
        readonly
        variant="underlined"
      >
      </v-text-field>

      <v-text-field
        v-model="name"
        label="Name"
        messages="Expert name*"
        variant="underlined"
      >
      </v-text-field>

      <s-image-uploader
        v-if="in_edit"
        :image="getShopImagePath(modelValue.image)"
        :server="
          isSelldoneAdmin
            ? window.ADMIN_API.POST_EXPERT_UPLOAD_IMAGE(modelValue.id)
            : window.API.POST_MY_EXPERT_UPLOAD_IMAGE()
        "
        auto-compact
        label="Expert avatar"
        maxFileSize="1MB"
        @new-path="handleProcessFileIcon"
      />
    </div>

    <div class="widget-box mb-5">
      <u-widget-header
        icon="place"
        title="Address & Location"
      ></u-widget-header>
      <v-list-subheader>
        Please provide your office location and accurate address. We utilize
        this information to calculate your proximity to clients and offer
        services to clients in your vicinity.
      </v-list-subheader>

      <s-country-select
        v-model="country"
        item-value="alpha2"
        label="Country"
        variant="underlined"
      >
      </s-country-select>

      <v-text-field
        v-model="address"
        label="Address"
        messages="Full address"
        variant="underlined"
      >
      </v-text-field>

      <v-row>
        <v-col cols="6">
          <u-number-input
            v-model="lng"
            :decimal="6"
            :max="100"
            :min="0"
            label="Longitude"
            placeholder="50.0000"
            variant="underlined"
          >
          </u-number-input>
        </v-col>

        <v-col cols="6">
          <u-number-input
            v-model="lat"
            :decimal="6"
            :max="100"
            :min="0"
            label="Latitude"
            placeholder="50.0000"
            variant="underlined"
          >
          </u-number-input>
        </v-col>
      </v-row>
    </div>

    <div class="widget-box mb-5">
      <u-widget-header
        icon="perm_contact_calendar"
        title="Public Profile"
      ></u-widget-header>
      <v-list-subheader>
        Please provide the necessary public information. We will utilize this
        information to create an expert page tailored specifically for the job.
        Please keep the information concise, relevant to the job, and refrain
        from including advertisements or unrealistic claims.
      </v-list-subheader>
      <v-textarea
        v-model="description"
        label="Description"
        messages="About expert"
        variant="underlined"
      >
      </v-textarea>
    </div>

    <div class="widget-box mb-5">
      <u-widget-header
        :title="$t('global.commons.language')"
        icon="translate"
      ></u-widget-header>
      <v-list-subheader>
        Choose the languages you are proficient in for effective communication
        and seamless interaction with your clients in speaking, writing, and
        overall communication.
      </v-list-subheader>
      <u-language-input
        v-model="languages"
        label="Languages"
        max-width="auto"
        multiple
        variant="underlined"
      >
      </u-language-input>
    </div>

    <div class="widget-box mb-5">
      <u-widget-header icon="factory" title="Industries"></u-widget-header>
      <v-list-subheader>
        Select industries where you have expertise and a proven track record of
        successfully completing projects for clients.
      </v-list-subheader>

      <v-select
        v-model="industries"
        :item-title="(val) => $t(val.title)"
        :items="Industries_list"
        :return-object="false"
        chips
        item-value="code"
        label="Industries"
        multiple
        variant="underlined"
      ></v-select>
    </div>

    <div class="widget-box mb-5">
      <u-widget-header icon="share" title="Social"></u-widget-header>
      <v-list-subheader>
        You can include your professional social links in your profile to make
        them publicly accessible. However, please note that adding personal
        links is against the rules.
      </v-list-subheader>
      <v-text-field
        v-model="linkedin"
        append-inner-icon="fa:fab fa-linkedin"
        class="english-field"
        label="LinkedIn"
        placeholder="https://www.linkedin.com/"
        variant="underlined"
      >
      </v-text-field>
      <v-text-field
        v-model="instagram"
        append-inner-icon="fa:fab fa-instagram"
        class="english-field"
        label="Instagram"
        placeholder="https://www.instagram.com/"
        variant="underlined"
      >
      </v-text-field>
      <v-text-field
        v-model="facebook"
        append-inner-icon="fa:fab fa-facebook"
        class="english-field"
        label="Facebook"
        placeholder="https://www.facebook.com/"
        variant="underlined"
      >
      </v-text-field>
      <v-text-field
        v-model="pinterest"
        append-inner-icon="fa:fab fa-pinterest"
        class="english-field"
        label="Pinterest"
        placeholder="https://www.pinterest.com/"
        variant="underlined"
      >
      </v-text-field>
    </div>

    <div class="widget-box mb-5">
      <u-widget-header
        icon="verified"
        title="Expert Verification"
      ></u-widget-header>
      <v-list-subheader
        >Expert profiles require a review process before they can be made
        accessible to the public.
      </v-list-subheader>
      <v-checkbox
        v-model="approved"
        :disabled="!isSelldoneAdmin"
        color="success"
        label="Approved expert"
        messages="If the option is checked, you will have the ability to create a new contract."
        variant="underlined"
      ></v-checkbox>
    </div>
  </v-container>
</template>

<script>
import SUserInput from "../../user/input/SUserInput.vue";
import SImageUploader from "../../../ui/uploader/SImageUploader.vue";
import SCountrySelect from "../../../ui/country/select/SCountrySelect.vue";
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import ULanguageInput from "../../../ui/language/input/ULanguageInput.vue";
import { Industries } from "@selldone/core-js/enums/shop/Industries";

export default {
  name: "BExpertForm",
  components: {
    ULanguageInput,
    UNumberInput,
    SCountrySelect,
    SImageUploader,
    SUserInput,
  },

  props: {
    modelValue: { type: Object },
    isSelldoneAdmin: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    email: null,
    name: null,
    country: null,
    address: null,
    lng: null,
    lat: null,
    description: null,
    languages: [],

    linkedin: null,
    instagram: null,
    facebook: null,
    pinterest: null,
    industries: [],
    approved: true,

    Industries_list: Object.values(Industries),
    Industries: Industries,
  }),

  computed: {
    in_edit() {
      return !!this.modelValue.id;
    },
  },
  watch: {
    modelValue() {
      this.assign();
    },
  },

  created() {
    this.assign();
  },
  methods: {
    assign() {
      this.email = this.modelValue.user ? this.modelValue.user.email : null;
      this.name = this.modelValue.name;
      this.country = this.modelValue.country;
      this.address = this.modelValue.address;

      if (this.modelValue.location) {
        this.lng = this.modelValue.location.lng;
        this.lat = this.modelValue.location.lat;
      } else {
        this.lng = 0;
        this.lat = 0;
      }

      this.description = this.modelValue.description;
      this.languages = this.modelValue.languages;
      this.industries = this.modelValue.industries;

      if (this.modelValue.socials) {
        this.linkedin = this.modelValue.socials.linkedin;
        this.instagram = this.modelValue.socials.instagram;
        this.facebook = this.modelValue.socials.facebook;
        this.pinterest = this.modelValue.socials.pinterest;
      } else {
        this.linkedin = null;
        this.instagram = null;
        this.facebook = null;
        this.pinterest = null;
      }

      this.approved = !!this.modelValue.approved_at;
    },

    getValue() {
      return {
        email: this.email,
        name: this.name,
        country: this.country,
        address: this.address,
        lng: this.lng,
        lat: this.lat,
        description: this.description,
        languages: this.languages,
        industries: this.industries,

        linkedin: this.linkedin,
        instagram: this.instagram,
        facebook: this.facebook,
        pinterest: this.pinterest,

        approved: this.approved,
      };
    },

    handleProcessFileIcon(path) {
      console.log("done", path);
      this.modelValue.image = path;
    },
  },
};
</script>

<style scoped></style>
