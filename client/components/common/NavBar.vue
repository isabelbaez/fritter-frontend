<!-- A basic navigation bar component -->
<!-- Example of a component which is included on all pages (via App.vue) -->
<!-- This navbar takes advantage of both flex and grid layouts for positioning elements; feel free to redesign as you see fit! -->

<template>
  <nav>
    <div class="left">
      <img class="logo" src="../../public/logo.png">
      <h1 class="title">
        Fritter
      </h1>
    </div>
    <div class="right">

      <router-link class="router" to="/">
        Home
      </router-link>

      <router-link class="router" 
        v-if="$store.state.username"
        to="/account"
      >
        Account
      </router-link>

      <router-link class="router" 
        v-else
        to="/login"
      >
        Login
      </router-link>

      <router-link class="router" 
        v-if="$store.state.username"
        @click.native="refreshProfile($store.state.username)"
        :to="`/profile/${$store.state.username}`"
      >
        Profile 
      </router-link>
      <router-link class="router" 
        v-else
        to="/login"
      >
        Login
      </router-link>
      
    </div>
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
import InlineForm from '@/components/common/InlineForm.vue';

export default {
  name: 'GetUsersForm',
  mixins: [InlineForm],
  methods: {
    refreshProfile(user) {
      this.$store.commit('refreshLikes', user);
      this.$store.commit('refreshRefreets', user);
      this.$store.commit('refreshComments', user);
    }
  }
};
</script>

<style scoped>
nav {
    padding: 1vw 2vw;
    font-family: Arial, Helvetica, sans-serif;
    background-color: white;
    border-right: 0.5px solid rgb(228, 228, 228);
    height: 100%;
    width: 25%;
    position: fixed;
    z-index: 2;
}

.title {
    font-size: 60px;
    margin: 0 5px;
}

img {
    height: 32px;
}

.left {
	display: flex;
	align-items: center;
  height: 20%;
}

.right {
    font-size: 25px;
    display: block;
    justify-content: space-evenly;
    width: 10%;
    align-self: center;
    padding-left: 35%;
    padding-top: 20%;
    margin-left: 0%;
}

.router {
  padding: 100%;
  text-decoration: none;
}

.router:link {
  color: black;
}

.router:visited {
  color: black;
}

.router:hover {
  color: black;
  text-decoration:underline;
}

.logo {
  width: 80px;
  height: 89px
}

.alerts {
    width: 25%;
}
</style>
