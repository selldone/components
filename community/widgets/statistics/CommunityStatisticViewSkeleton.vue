<template>
  <v-container>

    <v-skeleton-loader class="mx-auto" type="table-heading"></v-skeleton-loader>

    <v-row>
      <v-col v-for="i in 4" :key="i" cols="6" sm="4" md="3">
        <v-skeleton-loader
          class="mx-auto"
          type="article, text@2"
        ></v-skeleton-loader>
      </v-col>

      <v-col cols="12"><hr /></v-col>

      <v-col v-for="item in 8" :key="item.key" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader
          class="mx-auto"
          type="table-heading"
        ></v-skeleton-loader>
      </v-col>
    </v-row>


  </v-container>
</template>

<script>
export default {
  name: "CommunityStatisticViewSkeleton",
  components: {},
  props: {},

  data() {
    return {};
  },

  created() {},

  computed: {},
  methods: {},
};
</script>

<style scoped></style>
