import Vue from 'vue'
import VueContextMenu from './../src/index.vue'
import App from './normal.vue'
Vue.use(VueContextMenu.register)
export default new Vue(App)