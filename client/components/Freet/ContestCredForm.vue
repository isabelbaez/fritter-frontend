<!-- Reusable component representing a form in a block style -->
<!-- This is just an example; feel free to define any reusable components you want! -->

<template>
  <article>
    <h3>Contesting Freet</h3>
    <article>

      This Freet's credibility score should be

      <button v-if="inFavor === undefined || inFavor === true" @click="setPosCred"> Higher</button>
      <button v-if="inFavor === undefined || inFavor === false" @click="setNegCred"> Lower</button>

      <section class="sources">
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
      Contest Credibility
    </button>
  </article>
</template>

<script>

export default {
  name: 'FreetForm',
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    /**
     * Options for submitting this form.
     */
    return {
      listedSources: [],
      alerts: {}, // Displays success/error messages encountered during form submission
      callback: null, // Function to run after successful form submission
      inFavor: undefined
    };
  },
  methods: {
    async setPosCred() {
      this.inFavor = true;
    },
    async setNegCred() {
      this.inFavor = false;
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
    async submit(freetId) {
      /**
        * Submits a form with the specified options from data().
        */

      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      };

      let sources = '';
      for (const source of this.listedSources) {
        sources += source + ',';
      }

      if (this.inFavor) {
        options.body = JSON.stringify({freetId: this.freet._id , inFavor: true, sources: sources});
      } else {
        options.body = JSON.stringify({freetId: this.freet._id , sources: sources});
      }

      this.$refs["sources"].value = '';
      this.listedSources = [];

      try {
        const r = await fetch('/api/contestCredibility', options);
        if (!r.ok) {
          // If response is not okay, we throw an error and enter the catch block
          const res = await r.json();
          throw new Error(res.error);v
        }

        this.$store.commit('refreshFreets');
        this.$store.commit('refreshLikes', this.$store.state.username);
        this.$store.commit('refreshRefreets', this.$store.state.username);
        this.$store.commit('refreshComments', this.$store.state.username);
        
        const message = 'Successfully submitted contest!';
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
