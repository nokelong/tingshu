import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Player from '@/components/Player'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Player',
      component: Player
    }
  ]
})
