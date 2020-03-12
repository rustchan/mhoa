<template>
  <div>{{ name }}</div>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
      name: []
    };
  },
  created() {
    this.$http.get("/emp").then(data => {
      this.name = data.name;
    });
  }
};
</script>

<style scoped></style>
