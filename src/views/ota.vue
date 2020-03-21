<template>
  <div>
    oatid={{ otaid }}
    <Button type="primary" @click="go">后退</Button>
  </div>
</template>

<script>
export default {
  name: "ota",
  data() {
    return {
      otaid: 0
    };
  },
  methods: {
    go() {
      this.$router.go(-1);
    }
  },
  created() {
    this.otaid = this.$route.params.otaid;
    //this.$router.push("otas");
  }
};
</script>
