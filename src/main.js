
import Vue from 'vue'
import App from './App'
import router from './router'
import css from '@/assets/css/main.css'

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
