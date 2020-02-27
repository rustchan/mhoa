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
  let token = cookie.get("token");
  if(to.name === "login") {
    next();
  } else {
    if(token) {
      next();
    } else {
      next("/login");
    }
  }
});

export default router;
