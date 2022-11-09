<!-- Reusable component representing a form in a block style -->
<!-- This is just an example; feel free to define any reusable components you want! -->

<template>
  <article>
    <h3>Create A Thread</h3>
    <article>

      <div v-for="index in numberOfFreets" :key="index">
        <label for="content">Content:</label>
        <textarea
          id="content"
          ref="content"
          name="Content"
          value="contentValue"
        />
        <button v-if="index === numberOfFreets" @click="deleteFreet()"> Delete </button>
      </div>

      <button @click="addFreet"> + </button>

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
      Create Thread
    </button>
  </article>
</template>

<script>

export default {
  name: 'ThreadForm',
  data() {
    /**
     * Options for submitting this form.
     */
    return {
      listedSources: undefined,
      alerts: {}, // Displays success/error messages encountered during form submission
      callback: null, // Function to run after successful form submission
      credScoreEnabled: false,
      numberOfFreets: 1
    };
  },
  methods: {
    async addFreet() {
      this.numberOfFreets += 1;
    },
    async deleteFreet() {
      this.numberOfFreets -= 1;
    },
    async submit() {
      /**
        * Submits a form with the specified options from data().
        */

      const content = [];
      for (const contentRef of this.$refs["content"]) {
        content.push(contentRef.value);
      }
      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({content: content})
      };

      this.numberOfFreets = 1;
      this.$refs["content"].value = '';

      try {
        const r = await fetch('/api/structuredThreads', options);
        if (!r.ok) {
          // If response is not okay, we throw an error and enter the catch block
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');
        this.$store.commit('refreshLikes', this.$store.state.username);
        this.$store.commit('refreshRefreets', this.$store.state.username);
        this.$store.commit('refreshComments', this.$store.state.username);
        
        const message = 'Successfully created a thread!';
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
