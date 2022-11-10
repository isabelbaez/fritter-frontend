Default page that also displays freets

<template>
  <main class="principal">
    <div class="profileHeader">
      <div class="banner">
      "   "
      </div>
    <div class="left">
        <h2 class="profileName">
            {{$route.params.username}}
          </h2>
          <FollowUserForm
            ref="followUserForm"/>

          <div v-if="$route.params.username !== $store.state.username">

          <button v-if="isFollowing" @click="unfollowUser()">Unfollow</button>
          <button v-else @click="followUser()">Follow</button>

          </div>
          </div>
      </div>
  <main class="profile">
    <section>
      <div class="right">
          <GetLikesForm
            ref="getLikesForm"
          />
        </div>
      <header>
        <div class="left">
          <h2>
            User Likes
          </h2>
          </div>
      </header>
      <section
        v-if="$store.state.likes.length"
      >
        <FreetComponent
          v-for="freet in $store.state.likes"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <article
        v-else
      >
        <h3>No likes found.</h3>
      </article>
    </section>
    <section>
      <div class="right">
          <GetRefreetsForm
            ref="getRefreetsForm"
          />
        </div>
      <header>
        <div class="left">
          <h2>
            User Refreets
          </h2>
          </div>
      </header>
      <section
        v-if="$store.state.refreets.length"
      >
        <FreetComponent
          v-for="freet in $store.state.refreets"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <article
        v-else
      >
        <h3>No refreets found.</h3>
      </article>
    </section>
    <section>
      <div class="right">
          <GetCommentsForm
            ref="getCommentsForm"
          />
        </div>
      <header>
        <div class="left">
          <h2>
            User Comments
          </h2>
          </div>
      </header>
      <section
        v-if="$store.state.comments.length"
      >
        <FreetComponent
          v-for="freet in $store.state.comments"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <article
        v-else
      >
        <h3>No comments found.</h3>
      </article>
    </section>
  </main>
</main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import GetLikesForm from '@/components/Profile/GetLikesForm.vue';
import GetRefreetsForm from '@/components/Profile/GetRefreetsForm.vue';
import GetCommentsForm from '@/components/Profile/GetCommentsForm.vue';
import FollowUserForm from '@/components/Follow/FollowUserForm.vue';

export default {
  name: 'ProfilePage',
  components: {FreetComponent, GetLikesForm, GetRefreetsForm, GetCommentsForm, FollowUserForm},
  data() {
    return {
      isFollowing: false,
    }
  },
  mounted() {
    this.$refs.getLikesForm.submit(this.$route.params.username);
    this.$refs.getRefreetsForm.submit(this.$route.params.username);
    this.$refs.getCommentsForm.submit(this.$route.params.username);

    if (this.$refs.followUserForm.isFollowing(this.$route.params.username)) {
      this.isFollowing = true;
    }
    //this.$refs.followUserForm.submit(this.$route.params.username);
  }, 
  methods: {
    followUser() {
      this.$refs.followUserForm.followUser(this.$route.params.username);
      this.isFollowing = true;
    },
    unfollowUser() {
      this.$refs.followUserForm.unfollowUser(this.$route.params.username);
      this.isFollowing = false;
    }
  }
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

.profileName {
  font-size: 50px;
  padding-left: 30%;
  height: 40px;
}

.banner{
  background-color: coral;
  width: 100%;
  height: 150px;
}

.profileHeader{
  position: fixed;
  width: 100%;
  z-index: 1;
  background-color: white;
}
.principal{
  font-family: Arial, Helvetica, sans-serif;
}
.profile {
  margin-left: 25%;
  padding-top: 20%;
}

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    margin-right: 10px;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
