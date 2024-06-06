import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../view/Login'
import Register from '../view/Register'
import Home from '../view/Home'
// 安装路由
Vue.use(VueRouter);

// 配置导出路由
export default new VueRouter({
    routes: [{
            path: "/",
            redirect: "/home/chat"
        },
        {
            name: "Login",
            path: '/login',
            component: Login
        },
        {
            name: "Register",
            path: '/register',
            component: Register
        },
        {
            name: "Home",
            path: '/home',
            component: Home,
            children: [{
                    name: "Chat",
                    path: "/home/chat",
                    component: () =>
                        import ("../view/Chat"),
                },
                {
                    name: "Friends",
                    path: "/home/friend",
                    component: () =>
                        import ("../view/Friend"),
                },
                {
                    name: "Group",
                    path: "/home/group",
                    component: () =>
                        import ("../view/Group"),
                },
                {
                    name: "Search",
                    path: '/home/search',
                    component: () =>
                        import ("../view/Search"),
                    meta: {
                        keepAlive: true
                    }
                }
            ]
        },
    ]

});