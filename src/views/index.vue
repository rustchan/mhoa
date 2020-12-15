<template>
  <div>{{ agent }}</div>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
      agent: navigator.userAgent,
      name: []
    };
  },
  created() {}
};
</script>
