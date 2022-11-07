<!-- Form for getting freets (all, from user) (inline style) -->
<template></template>
<script>
export default {
  name: 'GetFeedForm',
  methods: {
    async submit() {
      const url = this.$store.state.username ? `/api/freets?feed=true` : '/api/freets';
      try {
        const r = await fetch(url);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.$store.commit('updateFreets', res);
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>