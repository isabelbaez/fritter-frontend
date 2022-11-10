<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="comment"
  >
    <header class="commentHeader">
      <div class="mainInfo">
      <p class="author">
        <router-link
          class="authorLink"
          :to="`/profile/${comment.author}`"
          @click.native="refreshProfile(comment.author)"
          param = user
          >
          @{{ comment.author }}
        </router-link>
      </p>

      <p class="date">
      Posted at {{ comment.dateCreated}}
      </p>

    </div>

      <div
        v-if="$store.state.username === comment.author"
        class="actions"
      >
        <button @click="deleteComment">
          🗑️ Delete
        </button>
      </div>
    </header>
    <p
      class="content"
    >
      {{ comment.content }}
    </p>
    <p class="info">

      <button @click="showCreateComment">
          💬 Comment
      </button>
      Comments: {{ comment.comments.length}}

      <button v-if="liked" @click="unlikeComment">
          💔 Unlike
      </button>

      <button v-else @click="likeComment">
          ❤️ Like
      </button>

      <button @click="showLikes" v-if="!showingLikes">
          Show Likes: {{ comment.likes.length}}
      </button>
      <button @click="hideLikes" v-if="showingLikes">
          Hide Likes
      </button>
    </p>
    <p
      v-if="showingLikes"
      class="likes"
    > 
    {{ comment.likes }}
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

    <section
        v-if="comment.comments.length"
      >
        <CommentComponent
          v-for="comment in comment.comments"
          :key="comment.id"
          :comment="comment"
        />
    </section>

  </article>
</template>

<script>
export default {
  name: 'CommentComponent',
  props: {
    // Data from the stored freet
    comment: {
      type: Object,
      required: true
    },
    refresh: {
      type: Function
    }
  },
  mounted() {
    if (this.comment.likes.includes(this.$store.state.username)) {
      this.liked = true;
    }
  },
  data() {
    return {
      showingLikes: false, // Whether or not currently showing the freet's likes
      creatingComment: false,
      liked: false,
      draft: this.comment.content, // Potentially-new content for this freet
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
    refreshProfile(user) {
      this.$store.commit('refreshLikes', user);
      this.$store.commit('refreshRefreets', user);
      this.$store.commit('refreshComments', user);
    },
    deleteComment() {
      /**
       * Deletes this comment.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted comment!', status: 'success'
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
    postComment() {
      /**
       * Updates freet to have the submitted draft content.
       */

      console.log(this.content );

      const params = {
        method: 'POST',
        message: 'Successfully posted comment!',
        body: JSON.stringify({parentId: this.comment._id, content: this.content}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.commentRequest(params);
    },
    likeComment() {
      /**
       * Updates freet to have the submitted draft content.
       */

      const params = {
        method: 'POST',
        message: 'Successfully liked comment!',
        body: JSON.stringify({parentId: this.comment._id}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.likeRequest(params);
    },
    unlikeComment() {
      /**
       * Updates freet to have the submitted draft content.
       */
      const params = {
        method: 'DELETE',
        message: 'Successfully unliked comment!',
        body: JSON.stringify({parentId: this.comment._id}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
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
        const r = await fetch(`/api/comments/${this.comment._id}`, options);
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
      this.refresh();
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
          const r = await fetch(`/api/likes/${this.comment._id}`, options);
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
        this.liked = false;
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
        this.liked = true;
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

      console.log(params.method);
      if (params.method === "DELETE") {

        const options = {
          method: params.method
        };

        try {
          const r = await fetch(`/api/likes/${this.comment._id}`, options);
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
      }
      this.refresh();
    },
  }
};
</script>

<style scoped>
.comment {
    border: 0.5px solid rgb(228, 228, 228);
    padding: 20px;
    padding-left: 5%;
    position: relative;
    border-radius: 3px;
    margin: 3px;
    font-family: Arial, Helvetica, sans-serif;
}

.mainInfo {
  display: block;
  justify-content:space-between;
  width: 70%;
}
.author {
  font-family: Arial, Helvetica, sans-serif;
  margin-left: 0px;
  text-decoration: none;
  font-weight: bold;
  font-size: 100%;
}

.info {
  font-size: medium;
}

.content {
  font-size: larger;
}

.actions {
  justify-content:right;
}

.date {
  font-size: medium;
}

/* .actions {
  margin-right: 0px;
  padding-left: 90%;
} */

.commentHeader {
  display: flex;
  justify-content:space-between;
}

.authorLink:link {
  color:black;
  text-decoration: none;
}

.authorLink:visited{
  color:black;
  text-decoration: none;
}

</style>
