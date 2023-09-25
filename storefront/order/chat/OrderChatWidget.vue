<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- █████████████████████ Chat Messages █████████████████████ -->

  <div>
    <div v-if="chat" class="widget-box -large mb-5">
      <widget-header
        :title="$t('global.commons.messages')"
        icon="3p"
      ></widget-header>
      <v-subheader>
        {{
          isAdmin
            ? "Here, you have the ability to directly exchange messages with customers."
            : "Here, you have the ability to directly communicate with the seller by sending messages."
        }}
      </v-subheader>
      <order-chat-message
        v-for="(message, i) in chat"
        :key="i"
        class="my-2 c-bubble"
        :shop="shop"
        :basket="basket"
        :is-admin="isAdmin"
        :message="message"
        has-delete
      >
      </order-chat-message>
    </div>

    <div class="widget-box -large mb-5">
      <widget-header
        :title="$t('global.actions.add_new_message')"
        icon="add_comment"
      ></widget-header>
      <v-subheader></v-subheader>

      <div class="d-flex align-center mt-3">
        <v-avatar :size="32" class="avatar-gradient -thin -user me-2">
          <v-img v-if="USER_ID()" :src="getUserAvatar(USER_ID())" />
          <v-icon v-else>account_circle</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <b>{{ user ? user.name : $t("global.commons.guest") }}</b>
          <small class="d-block">{{ $t("global.commons.now") }}</small>
        </div>
      </div>

      <v-textarea
        :rows="3"
        auto-grow
        :label="$t('global.commons.message')"
        v-model="body_input"
        :counter="1024"
      ></v-textarea>

      <div class="widget-buttons">
        <v-btn
          color="primary"
          dark
          x-large
          depressed
          @click="addChat"
          :loading="busy_add"
          :class="{ disabled: !body_input }"
        >
          <v-icon class="me-1">add</v-icon>
          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import OrderChatMessage from "./OrderChatMessage.vue";

export default {
  name: "OrderChatWidget",

  components: {
    OrderChatMessage,
  },

  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },

    isAdmin: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    busy_add: false,
    body_input: null,
  }),

  computed: {
    user() {
      return this.USER();
    },
    chat() {
      return this.basket.chat;
    },
  },

  watch: {},

  created() {},

  methods: {
    addChat() {
      this.busy_add = true;

      axios
        .post(
          !this.isAdmin
            ? window.XAPI.POST_CUSTOMER_BASKET_CHAT_ADD_MESSAGE(
                this.shop.name,
                this.basket.id
              )
            : window.API.POST_BASKET_CHAT_ADD_MESSAGE(
                this.shop.id,
                this.basket.id
              ),
          {
            body: this.body_input,
          }
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.body_input = null;
            this.basket.chat = data.chat;
            this.showSuccessAlert(null, "Message has been added successfully.");
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = null;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.c-bubble {
  background-color: #fff;
  border-radius: 18px;
  text-align: start;
  padding: 8px 12px;
}
</style>
