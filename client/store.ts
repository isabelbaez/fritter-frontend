import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

/**
 * Storage for data that needs to be accessed from various compoentns.
 */
const store = new Vuex.Store({
  state: {
    filter: null, // Username to filter shown freets by (null = show all)
    freets: [], // All freets created in the app
    likes: [],
    refreets: [],
    username: null, // Username of the logged in user
    alerts: {} // global success/error messages encountered during submissions to non-visible forms
  },
  mutations: {
    alert(state, payload) {
      /**
       * Add a new message to the global alerts.
       */
      Vue.set(state.alerts, payload.message, payload.status);
      setTimeout(() => {
        Vue.delete(state.alerts, payload.message);
      }, 3000);
    },
    setUsername(state, username) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.username = username;
    },
    updateFilter(state, filter) {
      /**
       * Update the stored freets filter to the specified one.
       * @param filter - Username of the user to fitler freets by
       */
      state.filter = filter;
    },
    updateFreets(state, freets) {
      /**
       * Update the stored freets to the provided freets.
       * @param freets - Freets to store
       */
      state.freets = freets;
    },
    updateLikes(state, likes) {
      /**
       * Update the stored likes to the provided likes.
       * @param likes - Likes to store
       */
      state.likes = likes;
    },
    async refreshLikes(state) {
      /**
       * Request the server for the currently available freets.
       */
      const url = `/api/freets?author=${state.username}&likes=true`;
      const res = await fetch(url).then(async r => r.json());
      console.log(res);
      state.likes = res;
    },
    updateRefreets(state, refreets) {
      /**
       * Update the stored likes to the provided likes.
       * @param refreets - Likes to store
       */
      state.refreets = refreets;
    },
    async refreshRefreets(state) {
      /**
       * Request the server for the currently available freets.
       */
      const url = `/api/freets?author=${state.username}&refreets=true`;
      const res = await fetch(url).then(async r => r.json());
      console.log(res);
      state.refreets = res;
    },
    async refreshFreets(state) {
      /**
       * Request the server for the currently available freets.
       */
      const url = state.filter ? `/api/users/${state.filter}/freets` : '/api/freets';
      const res = await fetch(url).then(async r => r.json());
      state.freets = res;
    }
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
