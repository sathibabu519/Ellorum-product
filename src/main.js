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

new Vue({
  apolloProvider: createProvider(),
  render: (h) => h(App),
}).$mount('#app')
