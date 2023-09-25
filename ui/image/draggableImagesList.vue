<template>
  <draggable
    v-model="list"
    class="list-group list-group-flush"
    tag="ul"
    v-bind="dragOptions"
    @start="drag = true"
    @end="drag = false"
    @change="$emit('input', list)"
  >
    <transition-group type="transition" :name="!drag ? 'flip-list' : null">
      <li v-for="(item, index) in list" :key="item" class="list-group-item" :style="{'background-image': `url('${item}')`}">

        <v-btn
          class="delete-button"
          icon
          @click.stop="deleteItem(index)"
        >
          <v-icon color="red">
            close
          </v-icon>
        </v-btn>
      </li>
    </transition-group>

    <div class="py-2" slot="footer">
      <v-btn v-if="hasAdd" @click.stop="$emit('add-click')" depressed rounded>
        <v-icon>add</v-icon>
        Add
      </v-btn>
    </div>
  </draggable>
</template>

<script>
import draggable from "vuedraggable";
export default {
  name: "draggableImagesList",
  components: { draggable },
  props: {
    value: {},
    hasAdd: {
      default: true,
      type: Boolean
    }
  },

  data: () => ({
    drag: false,
    index: 0,
    list: []
  }),

  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },

  watch: {
    value() {
      this.list = this.value;
    }
  },

  created() {
    this.list = this.value;
  },
  methods: {
    deleteItem(index) {
      this.list.splice(index, 1);
      this.$emit("input", this.list);
    }
  }
};
</script>

<style scoped lang="scss">
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 32px;
  //background-color: #fafafa;
  border-radius: 16px;
  padding: 18px 8px;
  margin: 0;

  .list-group-item {
    cursor: move;
    background: #fff;
    background-position: center;
    height: 64px;
    position: relative;
    display: block;
    padding: 0.4em 0.2em 0.4em 2em;
    margin: 0.5em 12px;
    color: #444;
    text-decoration: none;
    -moz-border-radius: 0.3em;
    -webkit-border-radius: 0.3em;
    border-radius: 2em;
    border: #fff solid;

    &::before {
      content: "⇅";
      position: absolute;
      left: -1em;
      top: 50%;
      margin-top: -1em;
      background: -webkit-gradient(
        linear,
        left top,
        right bottom,
        from(#0097a7),
        to(#0288d1)
      );
      background: linear-gradient(to right bottom, #0097a7, #0288d1);
      height: 2em;
      width: 2em;
      line-height: 1.4em;
      border: 0.3em solid #fff;
      text-align: center;
      font-weight: bold;
      -moz-border-radius: 2em;
      -webkit-border-radius: 2em;
      border-radius: 2em;
      color: #fff;
    }

    transition: all  0.5s !important;

    &:hover {
      transform: translateY(-2px);
      background-color: #fff !important;
      z-index: 3;
    }
    .delete-button {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translate(0, -50%);
      margin: 0;
      background-color: #fff;
    }
  }
}

  .for-rtl{
    .list-group {
      .list-group-item {
        .delete-button {
          left: 8px;
          right: unset;
        }
      }
    }
  }
</style>
