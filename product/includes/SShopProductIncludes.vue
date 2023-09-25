<template>
  <v-container v-if="includes?.length" class="s--shop-product-includes">
    <h2>{{ $t("global.commons.included_in_the_product") }}</h2>
    <v-subheader class="justify-center">
      {{ $t("global.commons.included_in_the_product_description") }}
    </v-subheader>
    <v-row v-if="$vuetify.breakpoint.mdAndUp" align="start" justify="center">
      <v-col v-for="it in includes" :key="it.id" cols="3">
        <a v-if="it.url" :target="'_blank'" :href="it.url">
          <img
            v-if="it.image"
            :src="getShopImagePath(it.image)"
            class="-image"
            loading="eager"
          />

          <div class="-title">
            {{ it.title }}
          </div>
        </a>
        <router-link
          v-else-if="it.path"
          :to="
            it.path
              ? {
                  name: 'IncludePageRender',
                  params: { path: it.path, include_id: it.id },
                }
              : undefined
          "
        >
          <img
            v-if="it.image"
            :src="getShopImagePath(it.image)"
            class="-image"
            loading="eager"
          />

          <div class="-title">
            {{ it.title }}
          </div>
        </router-link>
        <div v-else>
          <img
            v-if="it.image"
            :src="getShopImagePath(it.image)"
            class="-image"
            loading="eager"
          />

          <div class="-title">
            {{ it.title }}
          </div>
        </div>
      </v-col>
    </v-row>
    <v-carousel
      v-else
      :continuous="true"
      :cycle="true"
      :show-arrows="false"
      hide-delimiter-background
      delimiter-icon="circle"
      height="300"
      show-arrows-on-hover
    >
      <v-carousel-item
        v-for="it in includes"
        :key="it.id"
        :target="it.url ? '_blank' : undefined"
        :href="it.url"
        :to="
          it.path
            ? {
                name: 'IncludePageRender',
                param: { path: it.path, include_id: it.id },
              }
            : undefined
        "
      >
        <img
          v-if="it.image"
          :src="getShopImagePath(it.image)"
          class="-image"
          loading="eager"
        />

        <div class="-title">
          {{ it.title }}
        </div>
      </v-carousel-item>
    </v-carousel>
  </v-container>
</template>

<script>
export default {
  name: "SShopProductIncludes",
  props: {
    product: {
      required: true,
      type: Object,
    },
  },
  computed: {
    includes() {
      return this.product.includes;
    },
  },
};
</script>

<style lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-includes {
  text-align: center;

  h2 {
    text-transform: capitalize;
  }

  .-image {
    width: 128px;
    height: 128px;
    object-fit: contain;
    border-radius: 8px;
  }

  .-title {
    margin: 12px 4px;
    font-size: 1.1rem;
    font-weight: 800;
  }
  .v-carousel__controls {
    .v-btn {
      &.v-item--active {
        .v-icon {
          transform: scale(1);
          opacity: 1;
        }
      }
      .v-icon {
        color: #111 !important;
        opacity: 0.4;
        transform: scale(0.4);
        transition: all 0.3s ease-in-out;
      }
    }
  }
}
</style>
