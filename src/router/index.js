import Vue from "vue";
import VueRouter from "vue-router";
import cookie from "vue-cookies";
import util from "@/util";

Vue.use(VueRouter);

//获取原型对象上的push函数
const originalPush = VueRouter.prototype.push;
//修改原型对象中的push方法
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login.vue")
  },
  {
    path: "/wxlogin",
    name: "wxlogin",
    component: () => import("../views/wxlogin.vue")
  },
  {
    path: "/",
    name: "home",
    component: () => import("../views/home.vue"),
    children: [
      {
        path: "wxmpmenu",
        name: "wxmpmenu",
        component: () => import("../views/wxmpmenu.vue")
      },
      {
        path: "wxcorpmenu",
        name: "wxcorpmenu",
        component: () => import("../views/wxcorpmenu.vue")
      },
      {
        path: "devices",
        name: "devices",
        component: () => import("../views/devices.vue")
      },
      {
        path: "otas",
        name: "otas",
        component: () => import("../views/otas.vue")
      },
      {
        path: "ota",
        name: "ota",
        component: () => import("../views/ota.vue")
      },
      {
        path: "products",
        name: "products",
        component: () => import("../views/products.vue")
      },
      {
        path: "productdef",
        name: "productdef",
        component: () => import("../views/productdef.vue")
      },
      {
        path: "index",
        name: "index",
        component: () => import("../views/index.vue")
      },
      {
        path: "",
        name: "index",
        component: () => import("../views/index.vue")
      },
      {
        path: "material",
        name: "material",
        component: () => import("../views/material.vue")
      },
      {
        path: "*",
        name: "404",
        redirect: "/"
      }
    ]
  }
];

const router = new VueRouter({
  mode: "history",
  routes
});

router.beforeEach((to, from, next) => {
  //检验token有效
  let token = cookie.get("token");
  if (token) {
    let jwt = token.split(".");
    if (jwt.length === 3) {
      let exp = JSON.parse(window.atob(jwt[1])).exp;
      if (exp < new Date().getTime() / 1000) token = null;
    } else token = null;
    if (token == null) cookie.remove("token");
  }
  //过滤路由
  switch (to.name) {
    case "login":
      next();
      break;
    case "wxlogin":
      next();
      break;
    default:
      if (token) {
        next();
      } else {
        //微信授权登录
        let code = util.getVar("code");
        if (code !== "") {
          next("/wxlogin?code=" + code + "&path=" + location.pathname);
          break;
        }
        if (util.isWxWork()) util.wxAuth();
        else next("/login");
      }
      break;
  }
});

export default router;
