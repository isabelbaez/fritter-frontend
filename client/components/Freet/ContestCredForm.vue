<!-- Reusable component representing a form in a block style -->
<!-- This is just an example; feel free to define any reusable components you want! -->

<template>
  <article class="all">
    <p class="title">Contesting Freet</p>
    <article>

      <div  class="question">

      <p class="intro"> Freet's credibility score should be: </p>

      <button class="inFavor" v-if="inFavor === undefined || inFavor === true" @click="setPosCred"> Higher</button>
      <button class="Against" v-if="inFavor === undefined || inFavor === false" @click="setNegCred"> Lower</button>

    </div>

    <section class="sources" v-if="inFavor !== undefined">
      <article class="addedSources" v-for="source in listedSources">
        <p>{{ source }}</p>
        <button class="delButton" @click="delSource(source)"> Delete Source</button>
      </article>

      <div class="add">
      <div>
        <label for="sources">Add A Source:</label>
        <input class="input"
          id="sources"
          name="Sources"
          ref="sources"
        />
      </div>

      <button class="addButton" @click="addSource"> Add</button>
    </div>
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
    <button class="post" @click="submit">
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
    },
    close: {
      type: Function,
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
      this.close();
    }
  }
};
</script>

<style scoped>


.title {
  font-family: Arial, Helvetica, sans-serif;
  text-decoration: none;
  font-weight: bold;
  font-size: 25px;
}

.all {
  background-color: white;
}

.addButton {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: medium;
  color:white;
  border-radius: 20px;
  border: 3px solid rgb(255, 174, 0);
  background-color: rgb(255, 174, 0);
}

.delButton {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: medium;
  color:white;
  border-radius: 20px;
  height: 10%;
  margin-top: 2%;
  margin-left: 5%;
  border: 3px solid red;
  background-color: red;
}

/* .addedSource{
  backgroundcolor:grey;
  border-radius: 20px;
} */

.post {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: medium;
  color:white;
  border-radius: 20px;
  border: 5px solid rgb(255, 174, 0);
  background-color: rgb(255, 174, 0);
  margin-top: 5px;
  margin-left: 80%;
}

.input{
  border-radius: 10px;
  border: 0px;
  background-color: rgb(227, 227, 227);
  height: 25px;
  font-size: medium;
  padding: 10px;
}

.add{
  display: flex;
  justify-content: left;
}

.addedSources {
  display: flex;
  background-color:rgb(227, 227, 227);
  border-radius: 30px;
  justify-content: space-between;
  padding-left: 2%;
  padding-right: 2%;
  margin-bottom: 2%;
}

form {
  border: 1px solid #111;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 14px;
  position: relative;
}

.intro {
  font-size: large;
  font-weight: normal;
}

.question {
  display: block;
  justify-content: space-evenly;
  width: 100%;
}

.inFavor{
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: medium;
  color:white;
  border-radius: 20px;
  border: 5px solid green;
  background-color: green;
  margin-top: 1%;
  margin-right: 5%;
}

.Against{
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: medium;
  color:white;
  border-radius: 20px;
  border: 5px solid red;
  background-color: red;
  margin-top: 1%;
  margin-right: 5%;
}
.sources {
  margin-top: 5%;
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
