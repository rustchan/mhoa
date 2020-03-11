import Vue from "vue";
import VueRouter from "vue-router";
import cookie from "vue-cookies";

Vue.use(VueRouter);

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
        path: "device",
        name: "device",
        component: () => import("../views/device.vue")
      },
      {
        path: "firmware",
        name: "firmware",
        component: () => import("../views/firmware.vue")
      },
      {
        path: "product",
        name: "product",
        component: () => import("../views/product.vue")
      },
      {
        path: "",
        name: "index",
        component: () => import("../views/index.vue")
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
  //跳转https
  if (
    location.protocol !== "https:" &&
    location.hostname !== "localhost" &&
    location.hostname !== "127.0.0.1"
  ) {
    location.href = "https://" + location.host + location.pathname;
  }
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
        next("/login");
      }
  }
});

export default router;
