<template>
  <div style="" ref="test" >
    <vue-context-menu>
        <h1>test</h1>
    </vue-context-menu>
  </div>
</template>

<script>
import Vue from 'vue'
import VueContextMenu from './../src/index.vue'
export default {
  components: {VueContextMenu},
  data() {
    return {
      lists: [],
    }
  },
  mounted() {
    console.log(this.$el.__vue__)
    // Vue.prototype.$contextMenu({
    //   target: this.$refs.test
    // })
  },
}
</script>
