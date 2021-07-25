<template>
  <div style="" ref="test" >
    <vue-context-menu>
        <h1>test</h1>
    </vue-context-menu>
  </div>
</template>

<script>
import VueContextMenu from './../src/index.vue'
export default {
  components: {VueContextMenu},
  data() {
    return {
      lists: [],
    }
  },
  mounted() {
    // Vue.prototype.$contextMenu({
    //   target: this.$refs.test
    // })
  },
}
</script>
