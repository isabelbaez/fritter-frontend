<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
  <router-link
    v-if="freet.threadId !== 'Disabled'"
    :to="`/structuredThreads/${freet.threadId}`">
    Open Thread
  </router-link>

  <router-link
    v-else
    :to="`/freet/${freet._id}`">
    Open Tweet
  </router-link>

    <header>
      <h3 class="author">
        <router-link
          :to="`/profile/${freet.author}`"
          @click.native="refreshProfile(freet.author)"
          param = user
          >
          @{{ freet.author }}
        </router-link>
      </h3>

      <div class="directory" v-if="freet.threadId !== 'Disabled'">

      <button @click="toggleDirectory()">
        {{1}}/{{threadFreets.length}}
      </button>

      <div class="directory" v-if="showingDirectory">
        <router-link v-for="dirFreet in threadFreets"
          :to="`/freet/${dirFreet._id}`">
          {{threadFreets.indexOf(dirFreet) + 1}}
          {{freet.content.slice(0, 20)}}...
        </router-link>
        <div class="directory"></div>
      </div>
      </div>
      
      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button @click="deleteFreet">
          🗑️ Delete
        </button>
      </div>
      <button @click="likeFreet">
          ❤️ Like
      </button>
      <button @click="unlikeFreet">
          💔 Unlike
      </button>
      <button @click="refreetFreet">
          🔁 Refreet
      </button>
      <button @click="unrefreetFreet">
          ✖️ Remove Refreet
      </button>
      <button @click="showCreateComment">
          💬 Comment
      </button>
    </header>
    <p
      class="content"
    >
      {{ freet.content }}
    </p>
    <p class="credScore" v-if="freet.credibilityScore">
      Credibility Score: {{freet.credibilityScore}}
    </p>

    <div v-if="freet.author !== $store.state.username && freet.credibilityScore">

    <button v-if="contestingCred" @click="unsetContestingCred">
        Dismiss Contest
    </button>

    <button v-else @click="setContestingCred">
        Contest Score
    </button>

    <ContestCredForm
      v-if="contestingCred"
      :freet="freet"
      ref="contestCredForm"
    />
    </div>


    <p class="info">
      Posted at {{ freet.dateCreated}}
      Likes: {{ freet.likes.length}}
      <button @click="showLikes" v-if="!showingLikes">
          Show Likes
      </button>
      <button @click="hideLikes" v-if="showingLikes">
          Hide Likes
      </button>

      Refreets: {{ freet.refreets.length}}
      <button @click="showRefreets" v-if="!showingRefreets">
          Show Refreets
      </button>
      <button @click="hideRefreets" v-if="showingRefreets">
          Hide Refreets
      </button>

      Comments: {{ freet.comments.length}}
    </p>
    <p
      v-if="showingLikes"
      class="likes"
    > 
    {{ freet.likes }}
    </p>
    <p
      v-if="showingRefreets"
      class="refreets"
    > 
    {{ freet.refreets }}
    </p>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
    <section class="createComment" v-if="creatingComment">
      <textarea id="content" name="content" @input="content = $event.target.value"></textarea>
      <!-- <input type="submit" value="Post"> -->
      <button type="submit" @click="postComment">
        Post
      </button>
    </section>

    <!-- <section
        v-if="freet.comments.length"
      >
        <CommentComponent
          v-for="comment in freet.comments"
          :key="comment.id"
          :comment="comment"
        />
    </section> -->

  </article>
</template>

<script>
import CommentComponent from '@/components/Comment/CommentComponent.vue';
import ContestCredForm from '@/components/Freet/ContestCredForm.vue';

export default {
  name: 'FreetComponent',
  components: {CommentComponent, ContestCredForm},
  async mounted() {
    if (this.freet.threadId !== "Disabled") {
      const threadUrl = `/api/structuredThreads?threadId=${this.freet.threadId}`;
      try {
        const tr = await fetch(threadUrl);
        const tres = await tr.json();
        if (!tr.ok) {
          throw new Error(tres.error);
        }
        console.log(tres);
        this.threadFreets = tres.content;
      } catch (e) {
      }
    }
  },
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showingLikes: false, // Whether or not currently showing the freet's likes
      showingRefreets: false, // Whether or not currently showing the freet's refreets
      creatingComment: false,
      contestingCred: false,
      showingDirectory: false,
      threadFreets: undefined,
      draft: this.freet.content, // Potentially-new content for this freet
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
    refreshProfile(user) {
      this.$store.commit('refreshLikes', user);
      this.$store.commit('refreshRefreets', user);
      this.$store.commit('refreshComments', user);
    },
    toggleDirectory() {
      /**
       * Updates freet to have the submitted draft content.
       */
      this.showingDirectory = !this.showingDirectory;
    },
    setContestingCred() {
      this.contestingCred = true;
    },
    unsetContestingCred() {
      this.contestingCred = false;
    },
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    showCreateComment() {
      /**
       * Updates freet to have the submitted draft content.
       */
      this.creatingComment = true;
    },
    showLikes() {
      /**
       * Updates freet to have the submitted draft content.
       */
      this.showingLikes = true;
    },
    hideLikes() {
      /**
       * Updates freet to have the submitted draft content.
       */
      this.showingLikes = false;
    },
    showRefreets() {
      /**
       * Updates freet to have the submitted draft content.
       */
      this.showingRefreets = true;
    },
    hideRefreets() {
      /**
       * Updates freet to have the submitted draft content.
       */
      this.showingRefreets = false;
    },
    postComment() {
      /**
       * Updates freet to have the submitted draft content.
       */

      console.log(this.content );

      const params = {
        method: 'POST',
        message: 'Successfully posted comment!',
        body: JSON.stringify({parentId: this.freet._id, content: this.content}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.commentRequest(params);
    },
    contestCred() {
      /**
       * Updates freet to have the submitted draft content.
       */

      console.log(this.content );

      const params = {
        method: 'POST',
        message: 'Successfully posted comment!',
        body: JSON.stringify({parentId: this.freet._id, content: this.content}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.contestRequest(params);
    },
    likeFreet() {
      /**
       * Updates freet to have the submitted draft content.
       */

      const params = {
        method: 'POST',
        message: 'Successfully liked freet!',
        body: JSON.stringify({parentId: this.freet._id}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.likeRequest(params);
    },
    unlikeFreet() {
      /**
       * Updates freet to have the submitted draft content.
       */
      const params = {
        method: 'DELETE',
        message: 'Successfully unliked freet!',
        body: JSON.stringify({parentId: this.freet._id}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.likeRequest(params);
    },
    refreetFreet() {
      /**
       * Updates freet to have the submitted draft content.
       */

      const params = {
        method: 'POST',
        message: 'Successfully refreeted freet!',
        body: JSON.stringify({parentId: this.freet._id}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.refreetRequest(params);
    },
    unrefreetFreet() {
      /**
       * Updates freet to have the submitted draft content.
       */
      const params = {
        method: 'DELETE',
        message: 'Successfully removed refreet from freet!',
        body: JSON.stringify({parentId: this.freet._id}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.refreetRequest(params);
    },
    async request(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFreets');
        this.$store.commit('refreshLikes', this.$store.state.username);
        this.$store.commit('refreshRefreets', this.$store.state.username);
        this.$store.commit('refreshComments', this.$store.state.username);

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    async likeRequest(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */

      console.log(params.method);
      if (params.method === "DELETE") {

        const options = {
          method: params.method
        };

        try {
          const r = await fetch(`/api/likes/${this.freet._id}`, options);
          if (!r.ok) {
            const res = await r.json();
            throw new Error(res.error);
          }
          this.$store.commit('refreshFreets');
          this.$store.commit('refreshLikes', this.$store.state.username);
          this.$store.commit('refreshRefreets', this.$store.state.username);
          this.$store.commit('refreshComments', this.$store.state.username);

          console.log(this.$store.state.likes);

          params.callback();
        } catch (e) {
          this.$set(this.alerts, e, 'error');
          setTimeout(() => this.$delete(this.alerts, e), 3000);
        }
      } else {
        const options = {
          method: params.method, body: params.body, headers: {'Content-Type': 'application/json'}
        };

        try {

        const r = await fetch(`/api/likes`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
          }
          this.$store.commit('refreshFreets');
          this.$store.commit('refreshLikes', this.$store.state.username);
          this.$store.commit('refreshRefreets', this.$store.state.username);
          this.$store.commit('refreshComments', this.$store.state.username);

          console.log(this.$store.state.likes);

          params.callback();
        } catch (e) {
          this.$set(this.alerts, e, 'error');
          setTimeout(() => this.$delete(this.alerts, e), 3000);
        }
      }
    },
    async refreetRequest(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */

      console.log(params.method);
      if (params.method === "DELETE") {

        const options = {
          method: params.method
        };

        try {
          const r = await fetch(`/api/refreets/${this.freet._id}`, options);
          if (!r.ok) {
            const res = await r.json();
            throw new Error(res.error);
          }
          this.$store.commit('refreshFreets');
          this.$store.commit('refreshLikes', this.$store.state.username);
          this.$store.commit('refreshRefreets', this.$store.state.username);
          this.$store.commit('refreshComments', this.$store.state.username);

          params.callback();
        } catch (e) {
          this.$set(this.alerts, e, 'error');
          setTimeout(() => this.$delete(this.alerts, e), 3000);
        }
      } else {
        const options = {
          method: params.method, body: params.body, headers: {'Content-Type': 'application/json'}
        };

        try {

        const r = await fetch(`/api/refreets`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
          }
          this.$store.commit('refreshFreets');
          this.$store.commit('refreshLikes', this.$store.state.username);
          this.$store.commit('refreshRefreets', this.$store.state.username);
          this.$store.commit('refreshComments', this.$store.state.username);

          params.callback();
        } catch (e) {
          this.$set(this.alerts, e, 'error');
          setTimeout(() => this.$delete(this.alerts, e), 3000);
        }
      }
    },
    async commentRequest(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */

      const options = {
        method: params.method, body: params.body, headers: {'Content-Type': 'application/json'}
      };

      try {

      const r = await fetch(`/api/comments`, options);
      if (!r.ok) {
        const res = await r.json();
        throw new Error(res.error);
        }
        this.$store.commit('refreshFreets');
        this.$store.commit('refreshLikes', this.$store.state.username);
        this.$store.commit('refreshRefreets', this.$store.state.username);
        this.$store.commit('refreshComments', this.$store.state.username);

        console.log(this.$store.state.likes);

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
  }
};
</script>

<style scoped>
.freet {
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}
</style>
