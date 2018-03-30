import Vue from 'vue'
import Router from 'vue-router'
import routesMap from './map/' // 路由映射
import Catalog from 'VIEWS/catalog'
// import hooks from './hooks/' // 路由钩子

Vue.use(Router)

const router = new Router({
	mode: 'history', //生产环境使用history模式
    routes: [   
	    {
	      path: '/tingshu',	     
	      name: 'catalog',
	      component: Catalog
	    },
        ...routesMap
    ]
})

// hooks(router);

export default router;

