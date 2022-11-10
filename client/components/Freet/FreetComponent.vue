<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >

    <header class="freetHeader">
      <div class="mainInfo">
      <p class="author">
        <router-link
          class="authorLink"
          :to="`/profile/${freet.author}`"
          @click.native="refreshProfile(freet.author)"
          param = user
          >
          @{{ freet.author }}
        </router-link>
      </p>

      <p class="date">
      Posted at {{ freet.dateCreated}}
      </p>
    </div>

      <div class="directory" v-if="freet.threadId !== 'Disabled'">

        <button class="dirButton" @click="toggleDirectory()">
          {{getThreadIndex()}}/{{threadFreets.length}}
        </button>

        <div class="directoryLoop" v-if="showingDirectory">
          <router-link v-for="dirFreet in threadFreets"
            :to="`/freet/${dirFreet._id}`">
            {{threadFreets.indexOf(dirFreet) + 1}}
            {{freet.content.slice(0, 20)}}...
          </router-link>
          <div class="directory"></div>
        </div>
      </div>

      <div v-if="$store.state.username === freet.author"
        class="actions">
        <button @click="deleteFreet">
          🗑️ Delete
        </button>
      </div>

    </header>

    <p
      class="content"
    >
      {{ freet.content }}
    </p>

    <div class="cred">
      <div class="credScore" v-if="freet.credibilityScore">
        <p class="credScoreRed" v-if="scoreRange === 'Red'">
          Credibility Score: {{freet.credibilityScore}}
        </p>
        <p class="credScoreOrange" v-if="scoreRange === 'Orange'">
          Credibility Score: {{freet.credibilityScore}}
        </p>
        <p class="credScoreYellow" v-if="scoreRange === 'Yellow'">
          Credibility Score: {{freet.credibilityScore}}
        </p>
        <p class="credScoreGreen" v-if="scoreRange === 'Green'">
          Credibility Score: {{freet.credibilityScore}}
        </p>
      </div>

      <div v-if="freet.author !== $store.state.username && freet.credibilityScore"
      class="contest">

      <button class="contestButton" @click="setContestingCred">
          Contest Score
      </button>

      <div class="modal-backdrop" v-if="contestingCred">
        <div class="entire">
          <button class="close" @click="unsetContestingCred">X</button>
          <ContestCredForm
            :freet="freet"
            ref="contestCredForm"
            :close="unsetContestingCred"
          /> 
      </div>
    </div>
      </div>
    </div>

    <p class="info">

      <button @click="showCreateComment">
          💬 Comment
      </button>
      Comments: {{ freet.comments.length}}

      <button v-if="liked" @click="unlikeFreet">
          💔 Unlike
      </button>

      <button v-else @click="likeFreet">
          ❤️ Like
      </button>

      <button @click="showLikes" v-if="!showingLikes">
          Show Likes: {{ freet.likes.length}}
      </button>
      <button @click="hideLikes" v-if="showingLikes">
          Hide Likes
      </button>

      <button v-if="refreeted" @click="unrefreetFreet">
          ✖️ Remove Refreet
      </button>

      <button v-else @click="refreetFreet">
          🔁 Refreet
      </button>

      <button @click="showRefreets" v-if="!showingRefreets">
          Show Refreets: {{ freet.refreets.length}}
      </button>
      <button @click="hideRefreets" v-if="showingRefreets">
          Hide Refreets
      </button>

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

  <router-link
    class="expand"
    v-if="freet.threadId !== 'Disabled'"
    :to="`/structuredThreads/${freet.threadId}`">
    Open Thread
  </router-link>

  <router-link
    class="expand"
    v-else
    :to="`/freet/${freet._id}`">
    Open Tweet
  </router-link>

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
        this.threadFreets = tres.content;
      } catch (e) {
      }
    }
    if (this.freet.likes.includes(this.$store.state.username)) {
      this.liked = true;
    }
    if (this.freet.refreets.includes(this.$store.state.username)) {
      this.refreeted = true;
    }
    if (this.freet.credibilityScore <= 2) {
      this.scoreRange = "Red";
    } else if (this.freet.credibilityScore <= 3) {
      this.scoreRange = "Orange";
    } else if (this.freet.credibilityScore < 4) {
      this.scoreRange = "Yellow";
    } else if (this.freet.credibilityScore <= 5) {
      this.scoreRange = "Green";
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
      scoreRange: undefined,
      liked: false,
      refreeted: false,
      threadFreets: [],
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
    async refresh() {
      if (this.freet.threadId !== "Disabled") {
        const threadUrl = `/api/structuredThreads?threadId=${this.freet.threadId}`;
        try {
          const tr = await fetch(threadUrl);
          const tres = await tr.json();
          if (!tr.ok) {
            throw new Error(tres.error);
          }
          this.threadFreets = tres.content;
        } catch (e) {
        }
      }
      if (this.freet.likes.includes(this.$store.state.username)) {
        this.liked = true;
      }
      if (this.freet.refreets.includes(this.$store.state.username)) {
        this.refreeted = true;
      }
      if (this.freet.credibilityScore <= 2) {
        this.scoreRange = "Red";
      } else if (this.freet.credibilityScore <= 3) {
        this.scoreRange = "Orange";
      } else if (this.freet.credibilityScore < 4) {
        this.scoreRange = "Yellow";
      } else if (this.freet.credibilityScore <= 5) {
        this.scoreRange = "Green";
      }
    },
    setContestingCred() {
      this.contestingCred = true;
    },
    getThreadIndex() {
      for (let i = 0; i < this.threadFreets.length; i++) {
        if (this.threadFreets[i]._id.toString() === this.freet._id.toString()) {
          return i + 1;
        }
      }
    },
    async unsetContestingCred() {
      this.contestingCred = false;
      console.log('here');
      await this.refresh();
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
        this.refreeted = false;
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
        this.refreeted = true;
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
    border: 0.5px solid rgb(228, 228, 228);
    padding: 20px;
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

.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 4;
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

.freetHeader {
  display: flex;
  justify-content:space-between;
}

.close {
  background-color: white;
  border: 1px solid white;
  font-weight: bolder;
  font-size: large;
  color:darkgray;
  padding-left: 98%;
}
.entire {
  background-color: white;
  width: 55%;
  border-radius: 10px;
  border: 20px solid white;
  padding: 0.5%;
}

.directory{
  padding-left: 10%;
}

.credScore{
  font-size: large;
}

.credScoreRed{
  color:red;
}
.credScoreOrange{
  color:darkorange;
}
.credScoreYellow{
  color:goldenrod;
}
.credScoreGreen{
  color:green;
}

.contestButton{
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: large;
  color:white;
  border-radius: 20px;
  border: 1px solid rgb(255, 174, 0);
  background-color: rgb(255, 174, 0);
}


.dirButton {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: large;
  color:white;
  border-radius: 20px;
  border: 1px solid rgb(255, 174, 0);
  background-color: rgb(255, 174, 0);
}

.cred {
  display: flex;
  width: 40%;
  justify-content:space-between;
  font-weight: bold;
}

.contest{
  padding-top: 6%;
}

.expand:link {
  color:deepskyblue;
  text-decoration: none;
}

.expand:visited{
  color:deepskyblue;
  text-decoration: none;
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
