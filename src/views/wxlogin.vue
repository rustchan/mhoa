<template>
  <div></div>
</template>
<script>
export default {
  name: "wxlogin",
  created() {
    this.$http
      .post(
        "/wxlogin",
        this.$qs.stringify({
          code: this.$route.query.code
        })
      )
      .then(data => {
        if (data.token) {
          this.$cookies.set("token", data.token, 0);
          this.$Message.success("登录成功");
          let path = this.$route.query.path;
          if (path) this.$router.push(path);
          else this.$router.push("/");
        }
      })
      .catch(() => {
        this.$router.push("/login");
      });
  }
};
</script>
