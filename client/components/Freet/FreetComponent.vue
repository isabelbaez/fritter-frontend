<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <h3 class="author">
        @{{ freet.author }}
      </h3>
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
    </header>
    <p
      class="content"
    >
      {{ freet.content }}
    </p>
    <p class="info">
      Posted at {{ freet.dateCreated}}
      Likes: {{ freet.likes.length}}
      <button @click="showLikes" v-if="!showingLikes">
          Show Likes
      </button>
      <button @click="hideLikes" v-if="showingLikes">
          Hide Likes
      </button>
    </p>
    <p
      v-if="showingLikes"
      class="likes"
    > 
    {{ freet.likes }}
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
  </article>
</template>

<script>
export default {
  name: 'FreetComponent',
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showingLikes: false, // Whether or not this freet is in edit mode
      draft: this.freet.content, // Potentially-new content for this freet
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
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
    likeFreet() {
      /**
       * Updates freet to have the submitted draft content.
       */

      console.log(this.freet.likes);
      const params = {
        method: 'POST',
        message: 'Successfully liked freet!',
        body: JSON.stringify({parentId: this.freet._id}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      console.log("here");
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
      console.log("here");
      this.likeRequest(params);
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

          params.callback();
        } catch (e) {
          this.$set(this.alerts, e, 'error');
          setTimeout(() => this.$delete(this.alerts, e), 3000);
        }
      }
    }
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
