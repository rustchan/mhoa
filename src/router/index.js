import Vue from "vue";
import VueRouter from "vue-router";
import cookie from "vue-cookies";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/home.vue")
  },
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
    path: "*",
    name: "404",
    redirect: "/"
  }
];

const router = new VueRouter({
  mode: "history",
  routes
});

router.beforeEach((to, from, next) => {
  //跳转https
  if (location.protocol !== "https:" && location.hostname !== "localhost") {
    location.href = "https://" + location.host + location.pathname;
  }
  switch (to.name) {
    case "login":
      next();
      break;
    case "wxlogin":
      next();
      break;
    default:
      if (cookie.get("token")) {
        next();
      } else {
        next("/login");
      }
  }
});

export default router;
