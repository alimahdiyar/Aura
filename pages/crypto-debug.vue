<template>
  <section class="contact-us">
    <div class="container contact-us__wrapper" style="padding-top: 30px;">
      <AppInput
        v-model="password"
        placeholder="password"
        style="margin: 10px 0px 10px 0px;"
      ></AppInput>
      <AppInput
        v-model="d1"
        placeholder="data to encrypt"
        style="margin: 0px 0px 10px 0px;"
        type="textarea"
      ></AppInput>
      <p>Encrypted Data:<br/>{{ encrypted }}</p>
      <AppInput
        v-model="password"
        placeholder="password"
        style="margin: 20px 0px 10px 0px;"
      ></AppInput>
      <AppInput
        v-model="d2"
        placeholder="data to decrypt"
        style="margin: 0px 0px 10px 0px;"
        type="textarea"
      ></AppInput>
      <p>Decrypted Data:<br/>{{ decrypted }}</p>
      <AppInput
        v-model="d3"
        placeholder="data to encrypt with private key (must be loggeed in)"
        style="margin: 30px 0px 10px 0px;"
        type="textarea"
      ></AppInput>
      <p>Encrypted:<br/>{{ encryptedWithPrivateKey }}</p>
    </div>
  </section>
</template>

<script>
import {decryptData, encryptData, encryptStringWithPrivateKey} from "~/scripts/utils/crypto";

export default {
  data: function () {
    return {
      password: '',
      d1: '',
      d2: '',
      d3: '',
    };
  },
  computed: {
    encrypted() {
      return encryptData(this.d1, this.password)
    },
    decrypted() {
      return decryptData(this.d2, this.password)
    },
    encryptedWithPrivateKey() {
      return process.client && encryptStringWithPrivateKey(this.d3)
    }
  }
}
</script>

<style scoped>

</style>
