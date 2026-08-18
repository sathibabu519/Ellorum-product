import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  it('renders the Comments component inside #app', () => {
    const wrapper = shallowMount(App, {
      stubs: { Comments: true },
    })

    expect(wrapper.find('#app').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'Comments' }).exists()).toBe(true)
  })

  it('is named "App"', () => {
    expect(App.name).toBe('App')
  })
})
