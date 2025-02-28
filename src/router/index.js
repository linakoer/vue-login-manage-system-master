import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/readme',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            children:[
                {
                    path: '/',
                    component: resolve => require(['../components/page/Readme.vue'], resolve)
                },
                {
                    path: '/success',
                    component: resolve => require(['../components/page/Success.vue'], resolve)
                },
                {
                    path: '/excelUpload',// 添加路径属性
                    component: resolve => require(['../components/page/ExcelUpload.vue'], resolve)
                },
                {
                    path: '/studentScores',// 添加路径属性
                    component: resolve => require(['../components/page/StudentScores.vue'], resolve)
                }
            ]
        },
        {
            path: '/register',
            component: resolve => require(['../components/page/Register.vue'], resolve)
        },
        {
            path: '/register-success',
            component: resolve => require(['../components/page/RegisterSuccess.vue'], resolve)
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve)
        },
    ]
})
