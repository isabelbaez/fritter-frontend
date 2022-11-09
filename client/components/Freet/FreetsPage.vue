<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2>Welcome @{{ $store.state.username }}</h2>
        <SearchBar />

      </header>

      <ThreadForm v-if="isThread"/>
      <FreetForm v-else/>

      <button v-if="isThread" @click="makeFreet"> Convert Into Single Freet</button>
      <button v-else @click="makeThread"> Convert Into Thread</button>
      
    </section>
    <section v-else>
      <header>
        <h2>Welcome to Fritter!</h2>
      </header>
      <article>
        <h3>
          <router-link to="/login">
            Sign in
          </router-link>
          to create, edit, and delete freets.
        </h3>
      </article>
    </section>
    <section>
      <header>
        <div class="left">
          <h2>
            Viewing all freets
            <span v-if="$store.state.filter">
              by @{{ $store.state.filter }}
            </span>
          </h2>
        </div>
        <div class="right">
          <GetFeedForm
            ref="getFeedForm"/>
            <button v-if="credFilterEnabled" @click="disableCredFilter"> Disable Credibility Filter</button>
            <button v-else @click="enableCredFilter"> Enable Credibility Filter</button>

        <CredFilterForm v-if="credFilterEnabled"/>
        </div>
      </header>
      <section
        v-if="$store.state.freets.length"
      >
        <FreetComponent
          v-for="freet in $store.state.freets"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <article
        v-else
      >
        <h3>No freets found.</h3>
      </article>
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import FreetForm from '@/components/Freet/FreetForm.vue';
import ThreadForm from '@/components/StructuredThreads/ThreadForm.vue';
import GetFeedForm from '@/components/Feed/GetFeedForm.vue';
import SearchBar from '@/components/Search/SearchBar.vue';
import CredFilterForm from '@/components/Feed/CredFilterForm.vue';

export default {
  name: 'FreetPage',
  components: {FreetComponent, GetFeedForm, FreetForm, SearchBar, CredFilterForm, ThreadForm},
  mounted() {
    this.$refs.getFeedForm.submit();
  },
  data() {
    return {
      credFilterEnabled: false,
      isThread: false,
    }
  },
  methods: {
    makeThread() {
      this.isThread = true;
    },
    makeFreet() {
      this.isThread = false;
    },
    enableCredFilter() {
      this.credFilterEnabled = true;
    },
    async disableCredFilter() {
      this.credFilterEnabled = false;

      const options = {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({unscored: true, highScored: true, lowScored: true})
      };
      try {
        console.log(options);
        const r = await fetch('/api/feeds/', options);
        if (!r.ok) {
          // If response is not okay, we throw an error and enter the catch block
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');
        // const message = 'Successfully created a freet!';
        // this.alerts.push(message, 'success')
        // setTimeout(() => this.$delete(this.alerts, message), 3000);

      } catch (e) {
        // this.alerts.push(e, 'error')
        // setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
  }
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
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
