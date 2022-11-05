<!-- Form for getting likes (all, from user) (inline style) -->

<template>
</template>

<script>

export default {
  name: 'GetRefreetsForm',
  methods: {

    async submit(username) {
      const url = `/api/freets?author=${username}&refreets=${true}`;

      try {
        const r = await fetch(url);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.$store.commit('updateRefreets', res);
      } catch (e) {
        this.$store.commit('refreshRefreets', username);
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>
