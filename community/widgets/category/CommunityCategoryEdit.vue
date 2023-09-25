<template>
  <div >
    <!-- General -->
    <div class="widget-box mb-5">
      <widget-header
        :title="$t('global.commons.general_config')"
        icon="tune"
      ></widget-header>

      <v-subheader> Set a title and provide a concise description for the category.</v-subheader>

      <v-text-field
        v-model="title"
        :counter="128"
        :label="$t('community.category.title')"
        :placeholder="$t('community.category.title_plc')"
        :messages="$t('community.category.title_msg')"
      ></v-text-field>
      <v-text-field
        v-model="desc"
        :counter="256"
        :label="$t('community.category.desc')"
        :placeholder="$t('community.category.desc_plc')"
        :messages="$t('community.category.desc_msg')"
      ></v-text-field>
    </div>

    <!-- image -->
    <div class="widget-box mb-5">
      <widget-header
        :title="$t('global.commons.image')"
        icon="image"
      ></widget-header>
      <v-subheader>You have the option to assign an image to the category.</v-subheader>
      <image-input
        v-model="image_file"
        :src="image && getShopImagePath(image)"
        class="mb-4"
      ></image-input>
    </div>

    <div class="widget-box mb-5">
      <widget-header
        :title="$t('global.commons.seo')"
        icon="track_changes"
      ></widget-header>

      <v-subheader>Here, you can adjust the SEO configurations specifically at the category level. </v-subheader>
      <s-smart-toggle
        v-model="nofollow"
        true-title="No follow links"
        false-title="Follow links"
        :true-description="$t('community.commons.nofollow_msg')"
        false-gray
      ></s-smart-toggle>
    </div>

    <!-- Cross Community -->
    <div class="widget-box mb-5">
      <widget-header
        :title="$t('community.commons.cross_community')"
        icon="leak_add"
      ></widget-header>

      <v-subheader>Categories can be cross-linked and integrated into other communities. </v-subheader>
      <s-smart-toggle
        v-model="cross"
        :true-title="$t('community.commons.crossable')"
        :true-description="$t('community.commons.crossable_msg')"
        false-gray
      ></s-smart-toggle>
    </div>

    <!-- Access -->
    <div class="widget-box mb-5">
      <widget-header
        :title="$t('global.commons.access')"
        icon="private_connectivity"
      ></widget-header>

      <v-subheader>Determine whether customers are permitted to create new topics in this category. </v-subheader>
      <s-smart-toggle
        v-model="restrict"
        :true-title="$t('community.category.restrict')"
        :true-description="$t('community.category.restrict_msg')"
        color="red"
        false-gray
      ></s-smart-toggle>
    </div>
  </div>
</template>

<script>
import ImageInput from "../image/ImageInput.vue";
import SSmartToggle from "@/Components/smart/SSmartToggle.vue";
export default {
  name: "CommunityCategoryEdit",
  components: { SSmartToggle, ImageInput },

  props: {
    community: {
      required: true,
      type: Object,
    },
    category: {},
  },

  data() {
    return {
      busy: false,

      title: "",
      desc: "",
      image: null,
      image_file: null,
      nofollow: false,
      cross: false,
      restrict: false,
    };
  },

  computed: {},

  created() {
    if (this.category) {
      this.title = this.category.title;
      this.desc = this.category.desc;
      this.image = this.category.image;
      this.nofollow = this.category.nofollow;
      this.cross = this.category.cross;
      this.restrict = this.category.restrict;
    } else {
      // Inherit configs:
      this.nofollow = this.community.nofollow;
      this.cross = this.community.cross;
    }
  },
  mounted() {},

  methods: {
    //――――――――――――――――――――――― New category ―――――――――――――――――――――――

    save(callback_busy) {
      if (!this.title) {
        return this.showErrorAlert(null, "Enter title for the category!");
      }
      if (!this.desc) {
        return this.showErrorAlert(null, "Enter description for the category!");
      }

      this.busy = true;
      if (callback_busy) callback_busy(true);

      const formData = new FormData();

      formData.append("title", this.title);
      formData.append("desc", this.desc);
      formData.append("nofollow", this.nofollow);
      formData.append("cross", this.cross);
      formData.append("restrict", this.restrict);

      if (this.image_file)
        formData.append("image", this.image_file, this.image_file.name);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      let promise = null;
      if (this.category) {
        promise = axios.post(
          window.CAPI.POST_COMMUNITY_EDIT_CATEGORY(
            this.community.id,
            this.category.id
          ),
          formData,
          config
        );
      } else {
        promise = axios.post(
          window.CAPI.POST_COMMUNITY_NEW_CATEGORY(this.community.id),
          formData,
          config
        );
      }

      promise
        .then(({ data }) => {
          if (!data.error) {
            if (this.category) {
              this.$emit("update:category", data.category);

              this.$vuetify.goTo(0, {
                duration: 800,
                offset: 0,
                easing: "easeInOutQuad",
              });
            } else {
              this.$emit("add", data.category);
                 this.resetToDefault();      // 🞇 Reset to default
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
          if (callback_busy) callback_busy(false);
        });
    },
  },
};
</script>

<style scoped lang="scss"></style>
