<!-- Reusable component representing a form in a block style -->
<!-- This is just an example; feel free to define any reusable components you want! -->

<template>
  <article>
    <h3>Credibility Filtering</h3>
    

      <label for="credOptions">I want to see:</label>

      <form name="credOptions">

        <label for="unScored"> Freets with no credibility score</label>
        <input type="checkbox" id="unScored" name="unScored" ref="unScored">

        <label for="highScored"> Freets with a high credibility score (3.5+)</label>
        <input type="checkbox" id="highScored" name="highScored" ref="highScored">

        <label for="lowScored"> Freets with a low credibility score (-3.5)</label>
        <input type="checkbox" id="lowScored" name="lowScored" ref="lowScored">
    </form>
    <button @click="setCredFilter">Apply</button>
  </article>
</template>

<script>
export default {
  name: 'CredFilterForm',
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
    async setCredFilter() {
      /**
        * Submits a form with the specified options from data().
        */

      const options = {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({unscored: this.$refs["unScored"].checked, highScored: this.$refs["highScored"].checked, lowScored: this.$refs["lowScored"].checked })
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
