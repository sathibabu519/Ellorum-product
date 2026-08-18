import { shallowMount } from '@vue/test-utils'
import Comments from '@/components/Comments.vue'

const STUBS = [
  'b-form-input',
  'b-form-select',
  'b-container',
  'b-card-group',
  'b-card',
  'b-card-text',
]

function mountComments() {
  return shallowMount(Comments, {
    stubs: STUBS,
    mocks: { $apollo: { queries: {} } },
  })
}

describe('Comments.vue', () => {
  it('renders with the expected default data', () => {
    const wrapper = mountComments()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.comments).toEqual([])
    expect(wrapper.vm.comments_data).toEqual([])
    expect(wrapper.vm.photos_data).toEqual([])
    expect(wrapper.vm.search).toEqual({ filter: null, text: '' })
    expect(wrapper.vm.options).toEqual([
      { value: null, text: 'Sort By' },
      { value: 'a', text: 'Ascending' },
      { value: 'd', text: 'descending' },
    ])
  })

  describe('combined_data', () => {
    it('merges comment data with the matching photo by id', () => {
      const wrapper = mountComments()
      wrapper.setData({
        comments: {
          data: [
            { id: '1', name: 'Alpha', body: 'first' },
            { id: '2', name: 'Beta', body: 'second' },
          ],
        },
        photos_data: {
          data: [
            { id: '1', thumbnailUrl: 'http://img/1' },
            { id: '2', thumbnailUrl: 'http://img/2' },
          ],
        },
      })

      const combined = wrapper.vm.combined_data()

      expect(combined).toEqual([
        { id: '1', name: 'Alpha', body: 'first', thumbnailUrl: 'http://img/1' },
        { id: '2', name: 'Beta', body: 'second', thumbnailUrl: 'http://img/2' },
      ])
    })

    it('keeps the comment untouched when no photo matches', () => {
      const wrapper = mountComments()
      wrapper.setData({
        comments: { data: [{ id: '9', name: 'Nine', body: 'body' }] },
        photos_data: { data: [{ id: '1', thumbnailUrl: 'http://img/1' }] },
      })

      const combined = wrapper.vm.combined_data()

      expect(combined).toEqual([{ id: '9', name: 'Nine', body: 'body' }])
    })
  })

  describe('search_text', () => {
    const sample = [
      { id: '1', name: 'Apple' },
      { id: '2', name: 'Banana' },
      { id: '3', name: 'Cherry' },
    ]

    it('filters comments case-insensitively by name', () => {
      const wrapper = mountComments()
      wrapper.setData({ comments_data: sample, search: { filter: null, text: 'an' } })

      wrapper.vm.search_text()

      expect(wrapper.vm.comments).toEqual([{ id: '2', name: 'Banana' }])
    })

    it('returns every comment when the search text is empty', () => {
      const wrapper = mountComments()
      wrapper.setData({ comments_data: sample, search: { filter: null, text: '' } })

      wrapper.vm.search_text()

      expect(wrapper.vm.comments).toEqual(sample)
    })

    it('returns no comments when nothing matches', () => {
      const wrapper = mountComments()
      wrapper.setData({ comments_data: sample, search: { filter: null, text: 'zzz' } })

      wrapper.vm.search_text()

      expect(wrapper.vm.comments).toEqual([])
    })
  })

  describe('input_text', () => {
    const unsorted = () => [
      { id: '2', name: 'Banana' },
      { id: '1', name: 'Apple' },
      { id: '3', name: 'Cherry' },
    ]

    it('sorts ascending by name when the filter is "a"', () => {
      const wrapper = mountComments()
      wrapper.setData({ search: { filter: 'a', text: '' } })

      wrapper.vm.input_text(unsorted())

      expect(wrapper.vm.comments.map((c) => c.name)).toEqual([
        'Apple',
        'Banana',
        'Cherry',
      ])
    })

    it('sorts descending by name when the filter is "d"', () => {
      const wrapper = mountComments()
      wrapper.setData({ search: { filter: 'd', text: '' } })

      wrapper.vm.input_text(unsorted())

      expect(wrapper.vm.comments.map((c) => c.name)).toEqual([
        'Cherry',
        'Banana',
        'Apple',
      ])
    })

    it('leaves comments unchanged when the filter is unset', () => {
      const wrapper = mountComments()
      wrapper.setData({ search: { filter: null, text: '' } })

      wrapper.vm.input_text(unsorted())

      expect(wrapper.vm.comments).toEqual([])
    })
  })

  describe('sort', () => {
    it('sorts the filtered comments when a search text is present', () => {
      const wrapper = mountComments()
      wrapper.setData({
        comments: [
          { id: '2', name: 'Banana' },
          { id: '1', name: 'Apple' },
        ],
        comments_data: [{ id: '5', name: 'Zeta' }],
        search: { filter: 'a', text: 'a' },
      })

      wrapper.vm.sort('a')

      expect(wrapper.vm.comments.map((c) => c.name)).toEqual(['Apple', 'Banana'])
    })

    it('sorts the full data set when there is no search text', () => {
      const wrapper = mountComments()
      wrapper.setData({
        comments: [{ id: '9', name: 'Ignored' }],
        comments_data: [
          { id: '2', name: 'Banana' },
          { id: '1', name: 'Apple' },
        ],
        search: { filter: 'a', text: '' },
      })

      wrapper.vm.sort('')

      expect(wrapper.vm.comments.map((c) => c.name)).toEqual(['Apple', 'Banana'])
    })
  })

  describe('apollo query result handler', () => {
    it('stores photos/comments and merges them into comments', () => {
      const wrapper = mountComments()
      const data = {
        comments: {
          data: [
            { id: '1', name: 'Alpha', body: 'first' },
            { id: '2', name: 'Beta', body: 'second' },
          ],
        },
        photos: {
          data: [
            { id: '1', thumbnailUrl: 'http://img/1' },
            { id: '2', thumbnailUrl: 'http://img/2' },
          ],
        },
      }

      Comments.apollo.comments.result.call(wrapper.vm, { data })

      expect(wrapper.vm.photos_data).toEqual(data.photos)
      expect(wrapper.vm.comments_data).toEqual([
        { id: '1', name: 'Alpha', body: 'first', thumbnailUrl: 'http://img/1' },
        { id: '2', name: 'Beta', body: 'second', thumbnailUrl: 'http://img/2' },
      ])
      expect(wrapper.vm.comments).toEqual(wrapper.vm.comments_data)
    })

    it('declares the expected apollo query variables', () => {
      expect(Comments.apollo.comments.variables).toEqual({
        options: { paginate: { page: 1, limit: 50 } },
      })
      expect(Comments.apollo.comments.manual).toBe(true)
    })
  })
})
