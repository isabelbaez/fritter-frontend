<!-- A basic navigation bar component -->
<!-- Example of a component which is included on all pages (via App.vue) -->
<!-- This navbar takes advantage of both flex and grid layouts for positioning elements; feel free to redesign as you see fit! -->

<template>
  <nav>
    <div class="right">
      <GetUsersForm
        ref="getUsersForm"
        value="content"
        placeholder="🔍 Search for users"
        button="🔄 Search Users"
      />
    </div>
    <section v-if="$store.state.isSearching">
      <article
        v-for="user in $store.state.searchUsers.users"
        :key="user"
        :class="user">
        {{user}}
      </article>
      <button @click="stopSearch">
          Close
      </button>
    </section>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in $store.state.alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </nav>
</template>

<script>
import GetUsersForm from '@/components/Search/GetUsersForm.vue';

export default {
  name: 'SearchBar',
  components: {GetUsersForm}, 
  methods: {    
    stopSearch() {
      /**
       * Updates freet to have the submitted draft content.
       */
      this.$store.commit('stopSearch');
    }
  },
  mounted() {
    this.$refs.getUsersForm.submit();
  },
};
</script>

<style scoped>
nav {
    padding: 1vw 2vw;
    background-color: #ccc;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
}

.title {
    font-size: 32px;
    margin: 0 5px;
}

img {
    height: 32px;
}

.left {
	display: flex;
	align-items: center;
}

.right {
    font-size: 20px;
    display: grid;
    gap: 16px;
    grid-auto-flow: column;
    align-items: center;
}

.right a {
    margin-left: 5px;
}

.alerts {
    width: 25%;
}
</style>
