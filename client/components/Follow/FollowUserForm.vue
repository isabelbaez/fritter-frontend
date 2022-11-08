<!-- Form for getting freets (all, from user) (inline style) -->

<template>
</template>

<script>
export default {
  name: 'FollowUserForm',
  methods: {
    async isFollowing(user) {
      const url = `/api/follows?author=${this.$store.state.username}`;
      try {
        const r = await fetch(url);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        //this.$store.commit('updateSearch', getRes);
        for (const following of res) {
          if (following.dstUserId === user) {
            console.log("plis");
            return true;
          }
        }
        console.log("here");
        return false;

      } catch (e) {
        //this.$store.commit('alert', e, 'error');
        return false;
      }
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
    }
  }
};
</script>
