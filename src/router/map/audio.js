import Catalog from 'VIEWS/catalog'
import Detail  from 'VIEWS/detail'
import Player  from 'VIEWS/player'

export default [
    {
        name: 'acatalog',
        path: '/tingshu/catalog',
        component: Catalog
    },{
    	name: 'detail',
    	path: '/tingshu/detail',
    	component: Detail
    },{
        name: 'player',
        path: '/tingshu/player',
        component: Player
    }
]
