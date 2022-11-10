<!-- Page for account sign-in and registration -->
<!-- User should be NOT authenticated in order to see this page -->

<template>
  <main class="page">
    <section>
      <header>
        <h2>New to Fritter?</h2>
      </header>
      <RegisterForm />
    </section>
    <section>
      <header>
        <h2>Have an account?</h2>
      </header>
      <LoginForm />
    </section>
  </main>
</template>

<script>
import RegisterForm from '@/components/Login/RegisterForm.vue';
import LoginForm from '@/components/Login/LoginForm.vue';

export default {
  name: 'LoginPage',
  components: {
    RegisterForm,
    LoginForm
  }
};
</script>

<style>
.page{
  margin-left: 20%;
}
</style>
