import regeneratorRuntime from 'regenerator-runtime/runtime'
import Vue from 'vue'
import App from './App.vue'
import { createProvider } from './vue-apollo'
import { exposeGlobal } from './utils/runtime'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

exposeGlobal('regeneratorRuntime', regeneratorRuntime)

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

Vue.config.productionTip = false

Vue.config.errorHandler = (error, vm, info) => {
  // eslint-disable-next-line no-console
  console.error(
    `[vue] error in ${info} of <${(vm && vm.$options.name) || 'anonymous'}>`,
    error,
  )
}

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // eslint-disable-next-line no-console
    console.error('[app] unhandled promise rejection', event.reason)
  })
  window.addEventListener('error', (event) => {
    // eslint-disable-next-line no-console
    console.error('[app] uncaught error', event.error || event.message)
  })
}

new Vue({
  apolloProvider: createProvider(),
  render: (h) => h(App),
}).$mount('#app')
