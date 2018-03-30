import Auth from 'UTILS/auth'

// 权限拦截
const authInterceptor = (to, from, next ) =>{   
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (Auth.checkLogin()) { //已登录
            next();
        } else {
            Auth.goLogin();
        }         
    } else {
        next()
    }
}

export default authInterceptor
