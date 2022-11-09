<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <main>
  <router-link
    :to="`/`">
    Go Back Home
  </router-link>

  <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>

    <div v-for="freet in threadFreets"
      :key="freet.id"
      :freet="freet">

    <article
    class="freet"
    >   
    
    <router-link
    :to="`/freet/${freet._id}`">
    Open Tweet
    </router-link>

    <header>
      <h3 class="author">
        <router-link
          :to="`/profile/${freet.author}`"
          @click.native="refreshProfile(freet.author)">
          @{{freet.author }}
        </router-link>
      </h3>

      <h3 class="index">
        {{threadFreets.indexOf(freet) + 1}}/{{threadFreets.length}}
      </h3>

      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button @click="deleteFreet(freet._id)">
          🗑️ Delete
        </button>
      </div>
      <button @click="likeFreet(freet._id)">
          ❤️ Like
      </button>
      <button @click="unlikeFreet(freet._id)">
          💔 Unlike
      </button>
      <button @click="refreetFreet(freet._id)">
          🔁 Refreet
      </button>
      <button @click="unrefreetFreet(freet._id)">
          ✖️ Remove Refreet
      </button>
      <button @click="showCreateComment(threadFreets.indexOf(freet))">
          💬 Comment
      </button>
    </header>
    <p
      class="content"
    >
      {{ freet.content }}
    </p>

    <p class="info">
      Posted at {{ freet.dateCreated}}
      Likes: {{ freet.likes.length}}
      <button @click="toggleLikes(threadFreets.indexOf(freet))" v-if="!showingLikes[threadFreets.indexOf(freet)]">
          Show Likes
      </button>
      <button @click="toggleLikes(threadFreets.indexOf(freet))" v-if="showingLikes[threadFreets.indexOf(freet)]">
          Hide Likes
      </button>

      Refreets: {{ freet.refreets.length}}
      <button @click="toggleRefreets(threadFreets.indexOf(freet))" v-if="!showingRefreets[threadFreets.indexOf(freet)]">
          Show Refreets
      </button>
      <button @click="toggleRefreets(threadFreets.indexOf(freet))" v-if="showingRefreets[threadFreets.indexOf(freet)]">
          Hide Refreets
      </button>

      Comments: {{ freet.comments.length}}
      <button @click="toggleComments(threadFreets.indexOf(freet))" v-if="!showingComments[threadFreets.indexOf(freet)]">
          Show Comments
      </button>
      <button @click="toggleComments(threadFreets.indexOf(freet))" v-if="showingComments[threadFreets.indexOf(freet)]">
          Hide Comments
      </button>
    </p>
    <p
      v-if="showingLikes[threadFreets.indexOf(freet)]"
      class="likes"
    > 
    {{ freet.likes }}
    </p>
    <p
      v-if="showingRefreets[threadFreets.indexOf(freet)]"
      class="refreets"
    > 
    {{ freet.refreets }}
    </p>
    <section class="createComment" v-if="creatingComment[threadFreets.indexOf(freet)]">
      <textarea id="content" name="content" @input="content = $event.target.value"></textarea>
      <!-- <input type="submit" value="Post"> -->
      <button type="submit" @click="postComment(freet._id)">
        Post
      </button>
    </section>

    <section
        v-if="freet.comments.length && showingComments[threadFreets.indexOf(freet)]"
      >
        <CommentComponent
          v-for="comment in freet.comments"
          :key="comment.id"
          :comment="comment"
        />
    </section>
  </article>
</div>
</main>
</template>

<script>
import CommentComponent from '@/components/Comment/CommentComponent.vue';

export default {
  name: 'ThreadDetails',
  components: {CommentComponent},
  async mounted() {
    const threadUrl = `/api/structuredThreads?threadId=${this.$route.params.threadId}`;
    try {
      const tr = await fetch(threadUrl);
      const tres = await tr.json();
      if (!tr.ok) {
        throw new Error(tres.error);
      }
      console.log(tres);
      this.threadFreets = tres.content;

      for (const freet of this.threadFreets) {
        this.creatingComment.push(false);
        this.showingLikes.push(false);
        this.showingRefreets.push(false);
        this.showingComments.push(false);
      }
      console.log(this.threadFreets);
    } catch (e) {
    }
  },
  data() {
    return {
      showingLikes: [], // Whether or not currently showing the freet's likes
      showingRefreets: [], // Whether or not currently showing the freet's refreets
      showingComments: [],
      creatingComment: [],
      threadFreets: [],
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
    refreshProfile(user) {
      this.$store.commit('refreshLikes', user);
      this.$store.commit('refreshRefreets', user);
      this.$store.commit('refreshComments', user);
    },
    async refresh() {
      const threadUrl = `/api/structuredThreads?threadId=${this.$route.params.threadId}`;
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
    },
    deleteFreet(freetId) {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        },
        freetId: freetId
      };
      this.request(params);
    },
    showCreateComment(index) {
      /**
       * Updates freet to have the submitted draft content.
       */
      const newBools = [];

      for (let i = 0; i < this.creatingComment.length; i++) {
        if (i === index) {
          newBools.push(true);
        } else {
          newBools.push(this.creatingComment[i]);
        }
      }

      this.creatingComment = newBools;
    },
    toggleLikes(index) {
      /**
       * Updates freet to have the submitted draft content.
       */

      const newLikes = [];
      for (let i = 0; i < this.showingLikes.length; i++) {
        if (i === index) {
          newLikes.push(!this.showingLikes[i]);
        } else {
          newLikes.push(this.showingLikes[i]);
        }
      }
      this.showingLikes = newLikes;
    },
    toggleRefreets(index) {
      /**
       * Updates freet to have the submitted draft content.
       */
      const newRefreets = [];
      for (let i = 0; i < this.showingRefreets.length; i++) {
        if (i === index) {
          newRefreets.push(!this.showingRefreets[i]);
        } else {
          newRefreets.push(this.showingRefreets[i]);
        }
      }
      this.showingRefreets = newRefreets;
    },
    toggleComments(index) {
      /**
       * Updates freet to have the submitted draft content.
       */
      const newComments = [];
      for (let i = 0; i < this.showingComments.length; i++) {
        if (i === index) {
          newComments.push(!this.showingComments[i]);
        } else {
          newComments.push(this.showingComments[i]);
        }
      }
      this.showingComments = newComments;
    },
    postComment(freetId) {
      /**
       * Updates freet to have the submitted draft content.
       */
      const params = {
        method: 'POST',
        message: 'Successfully posted comment!',
        freetId: freetId,
        body: JSON.stringify({parentId: freetId, content: this.content}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.commentRequest(params);
    },
    likeFreet(freetId) {
      /**
       * Updates freet to have the submitted draft content.
       */

      const params = {
        method: 'POST',
        message: 'Successfully liked freet!',
        freetId: freetId,
        body: JSON.stringify({parentId: freetId}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.likeRequest(params);
    },
    unlikeFreet(freetId) {
      /**
       * Updates freet to have the submitted draft content.
       */
      console.log(freetId);
      const params = {
        method: 'DELETE',
        message: 'Successfully unliked freet!',
        freetId: freetId,
        body: JSON.stringify({parentId: freetId}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.likeRequest(params);
      console.log("requestDone");
    },
    refreetFreet(freetId) {
      /**
       * Updates freet to have the submitted draft content.
       */

      const params = {
        method: 'POST',
        message: 'Successfully refreeted freet!',
        freetId: freetId,
        body: JSON.stringify({parentId: freetId}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.refreetRequest(params);
    },
    unrefreetFreet(freetId) {
      /**
       * Updates freet to have the submitted draft content.
       */
      const params = {
        method: 'DELETE',
        message: 'Successfully removed refreet from freet!',
        body: JSON.stringify({parentId: freetId}),
        freetId: freetId,
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
        const r = await fetch(`/api/freets/${params.freetId}`, options);
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

      if (params.method === "DELETE") {
        const options = {
          method: params.method
        };
        try {
          console.log(params.freetId);
          const r = await fetch(`/api/likes/${params.freetId.toString()}`, options);
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
      this.refresh();
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
          const r = await fetch(`/api/refreets/${params.freetId}`, options);
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
      this.refresh();
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
        this.refresh();
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
