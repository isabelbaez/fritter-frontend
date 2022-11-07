<!-- Reusable component representing a form in a block style -->
<!-- This is just an example; feel free to define any reusable components you want! -->

<template>
  <article>
    <h3>Create A Freet</h3>
    <article>
      <div>
        <label for="content">Content:</label>
        <textarea
          id="content"
          ref="content"
          name="Content"
          value="contentValue"
        />
      </div>

      <button v-if="credScoreEnabled" @click="disableCredScore"> Disable Credibility Score</button>
      <button v-else @click="enableCredScore"> Enable Credibility Score</button>

      <section class="sources" v-if="credScoreEnabled">
      <article v-for="source in listedSources">
        <p>{{ source }}</p>
        <button @click="delSource(source)"> Delete Source</button>
      </article>

      <div>
        <label for="sources">Add A Source:</label>
        <input
          id="sources"
          name="Sources"
          ref="sources"
        />
      </div>

      <button @click="addSource"> New Source</button>
    </section>

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
    <button @click="submit">
      Create Freet
    </button>
  </article>
</template>

<script>

export default {
  name: 'FreetForm',
  data() {
    /**
     * Options for submitting this form.
     */
    return {
      listedSources: undefined,
      alerts: {}, // Displays success/error messages encountered during form submission
      callback: null, // Function to run after successful form submission
      credScoreEnabled: false
    };
  },
  methods: {
    async enableCredScore() {
      this.listedSources = [];
      this.credScoreEnabled = true;
    },
    async disableCredScore() {
      this.listedSources = undefined;
      this.credScoreEnabled = false;
    },
    async addSource() {
      const source = this.$refs["sources"].value;
      this.$refs["sources"].value = '';
      this.listedSources.push(source);
    },
    async delSource(source) {
      const newSources = [];
      for (const listSource of this.listedSources) {
        if (listSource !== source) {
          newSources.push(listSource);
        }
      }
      this.listedSources = newSources;
    },
    async submit() {
      /**
        * Submits a form with the specified options from data().
        */

      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      };

      if (this.listedSources) {
        let sources = '';
        for (const source of this.listedSources) {
          sources += source + ',';
        }
        options.body = JSON.stringify({content: this.$refs["content"].value , sources: sources});

        this.$refs["sources"].value = '';
        this.listedSources = [];
      } else {
        options.body = JSON.stringify({content: this.$refs["content"].value});
      }

      this.$refs["content"].value = '';

      try {
        const r = await fetch('/api/freets', options);
        if (!r.ok) {
          // If response is not okay, we throw an error and enter the catch block
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');
        const message = 'Successfully created a freet!';
        //this.alerts.push(message, 'success')
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
form {
  border: 1px solid #111;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 14px;
  position: relative;
}

article > div {
  display: flex;
  flex-direction: column;
}

form > article p {
  margin: 0;
}

form h3,
form > * {
  margin: 0.3em 0;
}

form h3 {
  margin-top: 0;
}

textarea {
   font-family: inherit;
   font-size: inherit;
}
</style>
