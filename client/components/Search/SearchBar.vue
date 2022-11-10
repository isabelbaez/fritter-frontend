<!-- A basic navigation bar component -->
<!-- Example of a component which is included on all pages (via App.vue) -->
<!-- This navbar takes advantage of both flex and grid layouts for positioning elements; feel free to redesign as you see fit! -->

<template>
  <nav>
    <div class="userForm">
      <GetUsersForm
        ref="getUsersForm"
        value="content"
      />
    </div>

    <article class="users" v-if="$store.state.isSearching">
      <button class="closeButton" @click="stopSearch">
          X
      </button>
      <article
        v-for="user in $store.state.searchUsers.users"
        :key="user"
        :class="user">
        <router-link
          :to="`/profile/${user}`"
          @click.native="refreshProfile(user)"
          param = user
          >
          {{user}} 
        </router-link>

        <div v-if="$store.state.username !== user">
          <button v-if="isFollowing(user)" @click="unfollowUser(user)">Unfollow</button>
          <button v-else @click="followUser(user)">Follow</button>
      </div>

      </article>
    </article>
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
  methods: {
    notYou(user) {
      return (user !== this.$store.state.user);
    }
  }
};
</script>

<style scoped>
nav {
    background-color: white;
    display: block;
    justify-content: space-between;
    position: relative;
    padding-bottom: 10%;
}

.userForm {
  padding-top: 20%;
}

.closeButton {
  background-color: white;
  color:darkgray;
  border: 0px;
  margin-left: 98%;
  font-size: medium;
  font-weight: bolder;
}

.users {
   background-color: white;
   box-shadow: 5px 5px 5px 5px#888888;
   border-radius: 10px;
   padding: 10%;
   width: 100%;
   height: 300px;
}

.alerts {
    width: 25%;
}
</style>
