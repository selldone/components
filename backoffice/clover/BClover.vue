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
  <div>
    <!--- --------------- Select category --------------- --->

    <u-smart-select
      v-model="category"
      :items="categories"
      :label="$t('global.commons.category')"
      item-description="description"
      item-icon="icon"
      item-text="title"
      item-value="id"
    >
    </u-smart-select>

    <!--- --------------- Select sex --------------- --->
    <v-fade-transition hide-on-leave>
      <u-smart-select
        v-if="category"
        v-model="sex"
        :items="sexes"
        :label="$t('global.commons.gender')"
        item-description="description"
        item-icon="icon"
        item-text="title"
        item-value="id"
      >
      </u-smart-select>
    </v-fade-transition>

    <!--- --------------- Select age --------------- --->
    <v-fade-transition hide-on-leave>
      <u-smart-select
        v-if="category && sex"
        v-model="age"
        :items="ages"
        :label="$t('global.commons.age')"
        item-description="description"
        item-icon="icon"
        item-text="title"
        item-value="id"
      >
      </u-smart-select>
    </v-fade-transition>

    <!--- --------------- Results --------------- --->

    <v-expand-transition>
      <div v-if="items.length">
        <h3 class="my-2">Our fit offers just for you</h3>

        <v-container>
          <v-row>
            <v-col
              v-for="(item, i) in items"
              :key="i"
              :style="{ animationDelay: i * 150 + 'ms' }"
              class="zoomIn"
              cols="4"
            >
              <v-card
                class="hover-scale-tiny force-top pa-2 rounded-18px"
                variant="outlined"
              >
                <v-img
                  :src="item.image"
                  aspect-ratio="1"
                  class="rounded-18px"
                ></v-img>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import USmartSelect from "../../ui/smart/select/USmartSelect.vue";

export default {
  name: "BClover",
  components: { USmartSelect },
  data: () => ({
    category: null,
    sex: null,
    age: null,

    samples: [
      // Shoes:
      {
        category: 1,
        sex: "male",
        age: 1,
        image: require("./assets/shoes-male-1.jpg"),
      },
      {
        category: 1,
        sex: "male",
        age: 2,
        image: require("./assets/shoes-male-2.jpg"),
      },
      {
        category: 1,
        sex: "male",
        age: 3,
        image: require("./assets/shoes-male-3.jpg"),
      },
      {
        category: 1,
        sex: "female",
        age: 1,
        image: require("./assets/shoes-female-1.jpg"),
      },
      {
        category: 1,
        sex: "female",
        age: 2,
        image: require("./assets/shoes-female-2.jpg"),
      },
      {
        category: 1,
        sex: "female",
        age: 3,
        image: require("./assets/shoes-female-3.jpg"),
      },
      // Shirts:
      {
        category: 3,
        sex: "male",
        age: 1,
        image: require("./assets/shirt-male-1.jpg"),
      },
      {
        category: 3,
        sex: "male",
        age: 2,
        image: require("./assets/shirt-male-2.jpg"),
      },
      {
        category: 3,
        sex: "male",
        age: 3,
        image: require("./assets/shirt-male-3.jpg"),
      },

      {
        category: 3,
        sex: "female",
        age: 1,
        image: require("./assets/shirt-female-1.jpg"),
      },
      {
        category: 3,
        sex: "female",
        age: 2,
        image: require("./assets/shirt-female-2.jpg"),
      },
      {
        category: 3,
        sex: "female",
        age: 3,
        image: require("./assets/shirt-female-3.jpg"),
      },

      // Hats:
      {
        category: 4,
        sex: "male",
        age: 1,
        image: require("./assets/hat-male-1.jpg"),
      },
      {
        category: 4,
        sex: "male",
        age: 2,
        image: require("./assets/hat-male-2.jpg"),
      },
      {
        category: 4,
        sex: "male",
        age: 3,
        image: require("./assets/hat-male-3.jpg"),
      },
      {
        category: 4,
        sex: "female",
        age: 2,
        image: require("./assets/hat-female-2.jpg"),
      },
      {
        category: 4,
        sex: "female",
        age: 3,
        image: require("./assets/hat-female-3.jpg"),
      },
    ],
  }),

  computed: {
    categories() {
      const out = [
        {
          id: 1,
          title: "Shoes",
          description:
            "Stylish shoes from our classic, slip ons, sneakers & more.",
          icon: "fa:fas fa-shoe-prints",
        },
        /* {
          id: 2,
          title: "Glasses",
          description: "Shop eyeglasses sunglasses & contacts.",
          icon: "fa:fas fa-glasses",
        },*/
        {
          id: 3,
          title: "Shirt",
          description:
            "Quality silkscreened t-shirts and hoodies in various models for men, women.",
          icon: "fa:fas fa-shirt",
        },
        {
          id: 4,
          title: "Hat",
          description: "Hats, caps & berets from around the world.",
          icon: "fa:fas fa-hat-cowboy-side",
        },
      ];

      return out;
    },

    ages() {
      return [
        { id: 1, title: "<6", description: "Babies and kids." },
        { id: 2, title: "7~18", description: "Teenagers." },
        { id: 3, title: "+18", description: "Adults." },
      ];
    },

    sexes() {
      return [
        {
          id: "male",
          title: "Male",
          icon: "male",
          description: "Men's clothing.",
        },
        {
          id: "female",
          title: "Female",
          icon: "female",
          description: "Ladies' clothes.",
        },
      ];
    },

    items() {
      if (!this.category || !this.sex || !this.age) return [];
      let out = this.samples.filter(
        (i) =>
          i.category === this.category &&
          i.sex === this.sex &&
          i.age === this.age,
      );
      const count = out.length;
      for (let i = 0; i < 6 - count; i++) {
        out.push({ image: require("./assets/clothes.svg") });
      }

      return out;
    },
  },
};
</script>

<style scoped></style>
