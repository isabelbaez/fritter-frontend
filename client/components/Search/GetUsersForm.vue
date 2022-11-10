<!-- Form for getting freets (all, from user) (inline style) -->
<template>
  <form @submit.prevent="submit">
    <input class="input"
      v-model="value"
      type="text"
      :placeholder="'Search for users'"
    >
    <button class="searchButton"
      type="submit"
    >
      Search
    </button>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </form>
</template>

<script>

export default {
  name: 'GetUsersForm',
  data() {
    return {value: '', alerts: {}};
  },
  methods: {
    async submit() {

      const url = '/api/search';

      try {
        if (this.value) {
          this.$store.commit('search');
          const options = {
            method: "PUT",
            body: JSON.stringify({content: this.value}),
            headers: {'Content-Type': 'application/json'}
          };
          console.log(options);
          const rPut = await fetch(url,options);
          const putRes = await rPut.json();
          if (!rPut.ok) {
            throw new Error(putRes.error);
          }
        }

        const optionsGet = {
          method: "GET"
        };
        const rGet = await fetch(url,optionsGet);
        const getRes = await rGet.json();
        if (!rGet.ok) {
          throw new Error(getRes.error);
        }

        this.$store.commit('updateSearch', getRes);

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style>

.searchButton{
  background-color: rgb(255, 174, 0);;
  border: 0px;
  color: white;
  border-radius: 10px;
  height: 25px;
  font-size: medium;
  font-weight: bolder;
}

.input{
  border-radius: 10px;
  border: 0px;
  background-color: rgb(227, 227, 227);
  height: 25px;
  font-size: medium;
  padding: 10px;
}
</style>
