<!-- Form for getting likes (all, from user) (inline style) -->

<template>
</template>

<script>

export default {
  name: 'GetLikesForm',
  methods: {

    async submit(username) {

      const url = `/api/freets?author=${username}&likes=${true}`;
      console.log(url);

      try {
        const r = await fetch(url);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        console.log(res);
        this.$store.commit('updateLikes', res);
      } catch (e) {
        this.$store.commit('refreshLikes', username);
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>
