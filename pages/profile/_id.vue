<template>
  <div data-route="profile">
    <private-profile
      v-if="isPrivate"
      ref="private"
      :brightness="brightness"
      :date="getDate"
      :four-unrated="fourUnrated"
      :is-loading="isLoading"
      :profile="profile"
      @share="onShare"
      @updateNickname="updateNickname"
    />
    <public-profile
      v-if="!isPrivate"
      ref="public"
      :brightness="brightness"
      :date="getDate"
      :four-unrated="fourUnrated"
      :is-loading="isLoading"
      :profile="profile"
      @share="onShare"
    />
    <nuxt-link
      v-if="!isAuth && isPublicRouteQuery"
      class="profile__login-cta"
      to="/"
    >
      Please, login in Aura app to see more
    </nuxt-link>
  </div>
</template>

<script>
import transition from '~/mixins/transition'
import PrivateProfile from '~/components/profile/PrivateProfile.vue'
import PublicProfile from '~/components/profile/PublicProfile.vue'
import {getConnection, getProfile} from '~/scripts/api/connections.service'
import {TOAST_ERROR} from "~/utils/constants";

export default {
  components: {
    PrivateProfile,
    PublicProfile,
  },
  mixins: [transition],

  data() {
    return {
      isPrivate: true,
      isOwn: false,
      profile: {},
      isLoading: true,
    }
  },

  head() {
    return {
      title: `Aura | ${this.profile?.name || this.profile?.id || 'Unknown'}`,
    }
  },

  computed: {
    brightness() {
      return this.profile?.rating / 10
    },
    fourUnrated() {
      return this.$store.getters['profile/fourUnrated']
    },
    brightId() {
      return this.$route.params.id
    },
    isPublicRouteQuery() {
      return this.$route.query?.account === 'public'
    },
    getDate() {
      const difDate = {}
      const today = new Date()
      if (!this.profile?.brightIdDate) {
        return
      }
      const reg = new Date(this.profile.brightIdDate)

      const todayDate = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
      }

      const regDate = {
        year: reg.getFullYear(),
        month: reg.getMonth() + 1,
        day: reg.getDate(),
      }

      Object.keys(todayDate).forEach(key => {
        difDate[key] = todayDate[key] - regDate[key]
      })

      if (difDate.year >= 1) {
        return difDate.year + ' year(s)'
      }

      if (difDate.year < 1 && difDate.month >= 1) {
        return difDate.month + ' month(s)'
      }

      return '< 1 month'
    },
    isAuth() {
      return this.$store.state.app.isAuth
    },
  },

  watch: {
    isPrivate() {
      const accType = this.isPrivate ? 'private' : 'public'
      this.$router.push({query: {account: accType}})
    },
  },

  async mounted() {
    this.isLoading = true

    if (!this.brightId) {
      this.$router.push('/profile/' + localStorage.getItem('brightId'))
      return
    }

    if (this.brightId === localStorage.getItem('brightId')) {
      this.isPrivate = false
      this.isOwn = true
      await this.loadOwnProfile()
      return
    }

    await this.loadConnectionProfile()
  },
  beforeDestroy() {
    const queries = this.$route.query
    if (queries.account) {
      delete queries.account
    }
    this.$router.push({query: {...queries}})
  },

  methods: {
    async loadConnectionProfile() {
      try {
        !this.isPublicRouteQuery &&
        (await this.$store.dispatch('connections/getConnectionsData'))
        await this.$store.dispatch('profile/getProfileData')
        const connections = this.$store.getters['profile/connections']

        this.profile = connections.find(con => con.id === this.brightId)

        const res = await getProfile(this.brightId, this.isPublicRouteQuery)
        this.profile = {...this.profile, ...res.data}
        const connectionRes = await getConnection(this.brightId)
        this.isPrivate = !this.isPublicRouteQuery
        if (connectionRes?.previousRating) {
          this.profile.previousRating = connectionRes.previousRating.rating
        }
      } catch (error) {
        console.log(error)
        this.$store.commit('toast/addToast', {text: 'Error', color: TOAST_ERROR})
      } finally {
        this.isLoading = false
      }
    },
    async loadOwnProfile() {
      try {
        await this.$store.dispatch('profile/getProfileData')

        this.profile = this.$store.getters['profile/profileData']
      } catch (error) {
        console.log(error)
        this.$store.commit('toast/addToast', {text: 'Error', color: TOAST_ERROR})
      } finally {
        this.isLoading = false
      }
    },

    updateNickname(value) {
      this.profile.nickname = value
    },

    async onShare() {
      const {copyToClipboard} = await import(
        '~/scripts/utils/copyToClipboard'
        )
      const URL = this.isPublicRouteQuery
        ? location.href
        : location.href + '?account=public'

      copyToClipboard(URL)
      this.$store.commit('toast/addToast', {
        text: 'Link was coppied to your clipboard',
        color: 'primary',
      })
    },
  },
}
</script>
