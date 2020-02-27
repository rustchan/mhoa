<template>
  <div id="loginform">
    <div class="logo"></div>
    <Form ref="loginform" class="login">
      <FormItem prop="user">
        <Input
          type="text"
          v-model="loginform.user"
          placeholder="工号/手机号/邮箱"
        >
          <Icon type="md-person" slot="prepend" size="16"></Icon>
        </Input>
      </FormItem>
      <FormItem prop="pass">
        <Input
          type="password"
          v-model="loginform.pass"
          placeholder="登录密码"
          @on-enter="login"
        >
          <Icon type="md-lock" slot="prepend" size="16"></Icon>
        </Input>
      </FormItem>
      <FormItem>
        <Button
          type="primary"
          @click="login"
          size="large"
          :loading="logining"
          style="min-width: 40%;"
          >登录</Button
        >
        <Button
          type="info"
          @click="wxlogin"
          size="large"
          :loading="wxlogining"
          style="float: right;"
          >企业微信登录</Button
        >
      </FormItem>
    </Form>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      loginform: {
        user: "",
        pass: ""
      }
    };
  },
  methods: {
    login() {}
  }
};
</script>

<style scoped>
#loginform {
  background-image: url("../assets/login.jpg");
  background-size: contain;
  height: 100%;
  padding-top: 80px;
}
.logo {
  margin: 80px auto;
  width: 100px;
  height: 100px;
  background-image: url("../assets/logo.png");
}
form {
  width: 300px;
  margin: 0px auto;
}
#wxlogin {
  text-align: center;
}
</style>
