<template>
  <header class="header navbar">
    <nav class="container header__nav">
      <nuxt-link :to="homeURL" aria-label="logo" class="header__img-wrapper">
        <svg
          class="img header__img"
          fill="none"
          height="18"
          viewBox="0 0 52 18"
          width="52"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.432 17L4.848 0.199999H10.368L14.784 17H11.52L10.608 13.304H4.608L3.696 17H0.432ZM5.352 10.376H9.864L7.824 2.192H7.392L5.352 10.376ZM20.2269 17.192C19.2989 17.192 18.4829 16.984 17.7789 16.568C17.0909 16.136 16.5549 15.544 16.1709 14.792C15.7869 14.04 15.5949 13.176 15.5949 12.2V5.096H18.6189V11.96C18.6189 12.856 18.8349 13.528 19.2669 13.976C19.7149 14.424 20.3469 14.648 21.1629 14.648C22.0909 14.648 22.8109 14.344 23.3229 13.736C23.8349 13.112 24.0909 12.248 24.0909 11.144V5.096H27.1149V17H24.1389V15.44H23.7069C23.5149 15.84 23.1549 16.232 22.6269 16.616C22.0989 17 21.2989 17.192 20.2269 17.192ZM29.28 17V5.096H32.256V6.44H32.688C32.864 5.96 33.152 5.608 33.552 5.384C33.968 5.16 34.448 5.048 34.992 5.048H36.432V7.736H34.944C34.176 7.736 33.544 7.944 33.048 8.36C32.552 8.76 32.304 9.384 32.304 10.232V17H29.28ZM42.3956 17.336C41.4356 17.336 40.5476 17.104 39.7316 16.64C38.9156 16.16 38.2596 15.464 37.7636 14.552C37.2676 13.64 37.0196 12.536 37.0196 11.24V10.856C37.0196 9.56 37.2676 8.456 37.7636 7.544C38.2596 6.632 38.9156 5.944 39.7316 5.48C40.5636 5 41.4516 4.76 42.3956 4.76C43.4836 4.76 44.3076 4.944 44.8676 5.312C45.4436 5.664 45.8676 6.072 46.1396 6.536H46.5716V5.096H49.5476V13.784C49.5476 14.264 49.7716 14.504 50.2196 14.504H51.1796V17H48.7796C48.2036 17 47.7236 16.84 47.3396 16.52C46.9716 16.2 46.7876 15.76 46.7876 15.2V15.176H46.3556C46.0836 15.768 45.6436 16.28 45.0356 16.712C44.4436 17.128 43.5636 17.336 42.3956 17.336ZM43.3076 14.696C44.2516 14.696 45.0276 14.4 45.6356 13.808C46.2596 13.2 46.5716 12.32 46.5716 11.168V10.928C46.5716 9.776 46.2596 8.904 45.6356 8.312C45.0116 7.704 44.2356 7.4 43.3076 7.4C42.3796 7.4 41.6036 7.704 40.9796 8.312C40.3556 8.904 40.0436 9.776 40.0436 10.928V11.168C40.0436 12.32 40.3556 13.2 40.9796 13.808C41.6036 14.4 42.3796 14.696 43.3076 14.696Z"
            fill="white"
          />
        </svg>
      </nuxt-link>
      <div v-if="!isAuth" class="header__info">
        <p class="header__title">
          Powered By:
          <a
            class="header__title-link"
            href="https://www.brightid.org/"
            rel="noreferer noopener"
            target="_blank"
          >
            Bright ID
          </a>
        </p>
      </div>
      <div v-else class="header__right">
        <button
          :class="[isPopupOpen && 'nav-button--open']"
          aria-label="Navigation button"
          class="nav-button"
          @click.stop="togglePopup"
        >
          <span class="nav-button__dot nav-button__dot--1"></span>
          <span class="nav-button__dot nav-button__dot--2">
            <span class="nav-button__close-icon">
              <svg
                fill="none"
                height="10"
                viewBox="0 0 10 10"
                width="10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  fill="#333333"
                  height="1"
                  transform="rotate(45 0.934143 0.830566)"
                  width="12"
                  x="0.934143"
                  y="0.830566"
                />
                <rect
                  fill="#333333"
                  height="1"
                  transform="rotate(-45 0.580597 9.31586)"
                  width="12"
                  x="0.580597"
                  y="9.31586"
                />
              </svg>
            </span>
          </span>
          <span class="nav-button__dot nav-button__dot--3"></span>
        </button>
        <div :class="[isPopupOpen && 'popup-menu--open']" class="popup-menu">
          <ul class="popup-menu__reduce">
            <li class="popup-menu__list">
              <nuxt-link :to="homeURL" class="menu-text popup-menu__text">
                Profile
              </nuxt-link>
            </li>
            <li class="popup-menu__list">
              <nuxt-link class="menu-text popup-menu__text" to="/connections/">
                Connections
              </nuxt-link>
            </li>
            <li class="popup-menu__list">
              <nuxt-link class="menu-text popup-menu__text" to="/energy/">
                Energy
              </nuxt-link>
            </li>
            <li class="popup-menu__list">
              <nuxt-link class="menu-text popup-menu__text" to="/contact-us/">
                Contact Us
              </nuxt-link>
            </li>
            <!--            <li class="popup-menu__list">-->
            <!--              <nuxt-link class="menu-text popup-menu__text" to="/activity/">-->
            <!--                Activity-->
            <!--              </nuxt-link>-->
            <!--            </li>-->
            <li class="popup-menu__list">
              <button
                class="menu-text popup-menu__text popup-menu__text--red"
                @click="logout"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import {TOAST_SUCCESS} from "~/utils/constants";

export default {
  data() {
    return {
      isPopupOpen: false,
    }
  },
  computed: {
    isAuth() {
      return this.$store.state.app.isAuth
    },
    homeURL() {
      return !this.isAuth ? '/' : '/profile/'
    },
  },

  async mounted() {
    const {default: NavbarPos} = await import('~/scripts/utils/navbarPos')

    this.navbarPos = new NavbarPos()
    this.navbarPos.init()

    document.body.addEventListener('click', this.closePopup)
  },

  methods: {
    openPopup() {
      this.isPopupOpen = true
    },
    closePopup() {
      this.isPopupOpen = false
    },
    togglePopup() {
      this.isPopupOpen ? this.closePopup() : this.openPopup()
    },
    logout() {
      this.$store.dispatch('login/logout')
      this.$router.push('/')
      this.$store.commit('toast/addToast', {
        text: 'You have successfully logged out',
        color: TOAST_SUCCESS,
      })
    },
  },
}
</script>
