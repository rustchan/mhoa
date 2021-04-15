<template>
  <div></div>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
      name: []
    };
  },
  methods: {
    load() {
      this.$http.get("/index").then(data => {
        console.log(data);
      });
    }
  },
  created() {
    this.load();
  }
};
</script>
