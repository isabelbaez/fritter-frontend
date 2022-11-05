<!-- Form for getting freets (all, from user) (inline style) -->

<script>
import InlineForm from '@/components/common/InlineForm.vue';

export default {
  name: 'GetUsersForm',
  mixins: [InlineForm],
  methods: {
    async submit() {

      const url = '/api/search';

      try {
        if (this.value) {
          this.$store.commit('search');
          const options = {
            method: "PUT",
            body: JSON.stringify({content: this.value}),
            headers: {'Content-Type': 'application/json'}
          };
          console.log(options);
          const rPut = await fetch(url,options);
          const putRes = await rPut.json();
          if (!rPut.ok) {
            throw new Error(putRes.error);
          }
        }

        const optionsGet = {
          method: "GET"
        };
        const rGet = await fetch(url,optionsGet);
        const getRes = await rGet.json();
        if (!rGet.ok) {
          throw new Error(getRes.error);
        }

        this.$store.commit('updateSearch', getRes);

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>
