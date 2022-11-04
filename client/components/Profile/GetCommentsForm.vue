<!-- Form for getting likes (all, from user) (inline style) -->

<template>
</template>

<script>

export default {
  name: 'GetCommentsForm',
  methods: {

    async submit() {

      const url = `/api/freets?author=${this.$store.state.username}&comments=${true}`;

      try {
        const r = await fetch(url);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        console.log(res);
        this.$store.commit('updateComments', res);
      } catch (e) {
        this.$store.commit('refreshComments');
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>