import regeneratorRuntime from 'regenerator-runtime/runtime'
import Vue from 'vue'
import App from './App.vue'
import { createProvider } from './vue-apollo'

if (typeof window !== 'undefined') {
  window.regeneratorRuntime = regeneratorRuntime
}
if (typeof global !== 'undefined') {
  global.regeneratorRuntime = regeneratorRuntime
}
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

Vue.config.productionTip = false

new Vue({
  apolloProvider: createProvider(),
  render: (h) => h(App),
}).$mount('#app')
