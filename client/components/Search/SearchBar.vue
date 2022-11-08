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
        <router-link
          v-if="$store.state.username"
          :to="`/profile/${user}`"
          @click.native="refreshProfile(user)"
          param = user
          >
          {{user}} 
        </router-link>

        <button v-if="isFollowing(user)" @click="unfollowUser(user)">Unfollow</button>
        <button v-else @click="followUser(user)">Follow</button>

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
    refreshProfile(user) {
      this.$store.commit('refreshLikes', user);
      this.$store.commit('refreshRefreets', user);
      this.$store.commit('refreshComments', user);
    },
    stopSearch() {
      /**
       * Updates freet to have the submitted draft content.
       */
      this.$store.commit('stopSearch');
    }, 
    async followUser(user) {
      const url = '/api/follows';
      try {
        //this.$store.commit('search');
        const options = {
          method: "POST",
          body: JSON.stringify({dstUser: user.toString()}),
          headers: {'Content-Type': 'application/json'},
          message: 'Successfully followed user!',
          callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000)}
        };
        const rPut = await fetch(url,options);
        const putRes = await rPut.json();
        if (!rPut.ok) {
          throw new Error(putRes.error);
        }
        //this.$store.commit('updateSearch', getRes);
        const message = 'Successfully followed user!';
        //const payload = {message, 'success'};
        this.$store.commit('alert', message, 'success');

      } catch (e) {
        this.$store.commit('alert', e, 'error');
      }
      this.refreshFollows();
    },
    async unfollowUser(user) {
      const url = `/api/follows/${user}`;
      try {
        //this.$store.commit('search');
        const options = {
          method: "DELETE",
        };
        console.log(options);
        const rPut = await fetch(url,options);
        const putRes = await rPut.json();
        if (!rPut.ok) {
          throw new Error(putRes.error);
        }
        //this.$store.commit('updateSearch', getRes);
        const message = 'Successfully followed user!';
        //const payload = {message, 'success'};
        this.$store.commit('alert', message, 'success');

      } catch (e) {
        this.$store.commit('alert', e, 'error');
      }
      this.refreshFollows();
    },
    isFollowing(user) {
      return this.following.includes(user);
    },
    async refreshFollows() {
      const url = `/api/follows?author=${this.$store.state.username}`;
      try {
        const r = await fetch(url);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        const following = [];
        for (const follow of res) {
          following.push(follow.dstUserId);
        }
        this.following = following;
      } catch (e) {
        //this.$store.commit('alert', e, 'error');
      }
    }
  },
  data() {
    return {
      following: [],
    }
  },
  async mounted() {
    this.$refs.getUsersForm.submit();
    //const following = this.$refs.followUserForm.getFollowing(this.$store.state.user);

    const url = `/api/follows?author=${this.$store.state.username}`;
    try {
      const r = await fetch(url);
      const res = await r.json();
      if (!r.ok) {
        throw new Error(res.error);
      }
      const following = [];
      for (const follow of res) {
        following.push(follow.dstUserId);
      }
      this.following = following;
    } catch (e) {
      //this.$store.commit('alert', e, 'error');
    }
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
