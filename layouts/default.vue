<template>
  <div id="app">
    <app-toast />
    <ui-loader />
    <app-header />
    <Nuxt />
  </div>
</template>

<script>
import UiLoader from '~/components/UiLoader.vue'
import AppHeader from '~/components/AppHeader.vue'
import AppToast from '~/components/AppToast.vue'

export default {
  components: { UiLoader, AppHeader, AppToast },

  async mounted() {
    const { default: supportsWebP } = await import('supports-webp')

    if (await supportsWebP) {
      this.$store.commit('app/setIsWebp', true)
    } else {
      this.$store.commit('app/setIsWebp', false)
    }

    const { winSizes } = await import('~/scripts/utils/winSizes')
    const { resize } = await import('@emotionagency/utils')
    resize.on(winSizes)

    const isAuth = JSON.parse(localStorage.getItem('isAuth') || '[]')

    if (isAuth.value) {
      this.$store.commit('app/setIsAuth', true)
      const brightId = localStorage.getItem('brightId')
      if (this.$route.name === 'index') {
        this.$router.push('/profile/' + brightId)
      }
    } else {
      this.$store.commit('app/setIsAuth', false)

      if (this.$route.query?.account !== 'public') {
        this.$router.push('/')
      }
    }
  },
}
</script>