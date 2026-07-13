import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppIcon from '@/components/common/AppIcon.vue'

describe('AppIcon', () => {
  it('renders an svg with two lines for the plus icon', () => {
    const wrapper = mount(AppIcon, { props: { name: 'plus' } })

    expect(wrapper.element.tagName).toBe('svg')
    expect(wrapper.findAll('line')).toHaveLength(2)
  })

  it('swaps markup when the name prop changes', async () => {
    const wrapper = mount(AppIcon, { props: { name: 'sun' } })
    expect(wrapper.findAll('line').length).toBeGreaterThan(0)
    expect(wrapper.find('path').exists()).toBe(false)

    await wrapper.setProps({ name: 'moon' })

    expect(wrapper.find('path').exists()).toBe(true)
    expect(wrapper.findAll('line')).toHaveLength(0)
  })
})
