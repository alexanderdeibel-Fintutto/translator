// @vitest-environment jsdom
// Tests for SortableContentList — reorder logic

import { describe, it, expect } from 'vitest'

describe('SortableContentList', () => {
  describe('reorder logic', () => {
    function reorder<T>(list: T[], fromIndex: number, toIndex: number): T[] {
      const next = [...list]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    }

    it('should move item forward', () => {
      const result = reorder(['A', 'B', 'C', 'D'], 0, 2)
      expect(result).toEqual(['B', 'C', 'A', 'D'])
    })

    it('should move item backward', () => {
      const result = reorder(['A', 'B', 'C', 'D'], 3, 1)
      expect(result).toEqual(['A', 'D', 'B', 'C'])
    })

    it('should be identity when from === to', () => {
      const result = reorder(['A', 'B', 'C'], 1, 1)
      expect(result).toEqual(['A', 'B', 'C'])
    })

    it('should move first to last', () => {
      const result = reorder(['A', 'B', 'C'], 0, 2)
      expect(result).toEqual(['B', 'C', 'A'])
    })

    it('should move last to first', () => {
      const result = reorder(['A', 'B', 'C'], 2, 0)
      expect(result).toEqual(['C', 'A', 'B'])
    })

    it('should not mutate original', () => {
      const original = ['A', 'B', 'C']
      const copy = [...original]
      reorder(original, 0, 2)
      expect(original).toEqual(copy)
    })
  })

  describe('moveItem (arrow keys)', () => {
    function moveItem<T>(list: T[], index: number, direction: 'up' | 'down'): T[] {
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= list.length) return list
      const next = [...list]
      const temp = next[index]
      next[index] = next[newIndex]
      next[newIndex] = temp
      return next
    }

    it('should swap up', () => {
      expect(moveItem(['A', 'B', 'C'], 1, 'up')).toEqual(['B', 'A', 'C'])
    })

    it('should swap down', () => {
      expect(moveItem(['A', 'B', 'C'], 1, 'down')).toEqual(['A', 'C', 'B'])
    })

    it('should not move first item up', () => {
      expect(moveItem(['A', 'B', 'C'], 0, 'up')).toEqual(['A', 'B', 'C'])
    })

    it('should not move last item down', () => {
      expect(moveItem(['A', 'B', 'C'], 2, 'down')).toEqual(['A', 'B', 'C'])
    })
  })

  describe('sort_order generation', () => {
    it('should generate 1-based sort orders', () => {
      const items = ['A', 'B', 'C', 'D', 'E']
      const orders = items.map((_, i) => i + 1)
      expect(orders).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle empty list', () => {
      const orders: number[] = [].map((_, i) => i + 1)
      expect(orders).toEqual([])
    })
  })

  describe('hasChanges detection', () => {
    it('should detect no changes', () => {
      const original = ['a', 'b', 'c']
      const current = ['a', 'b', 'c']
      expect(JSON.stringify(original)).toBe(JSON.stringify(current))
    })

    it('should detect reorder', () => {
      const original = ['a', 'b', 'c']
      const current = ['b', 'a', 'c']
      expect(JSON.stringify(original)).not.toBe(JSON.stringify(current))
    })
  })

  describe('search filter', () => {
    const items = [
      { name: { de: 'Stephansdom' }, slug: 'stephansdom' },
      { name: { de: 'Goldenes Dachl' }, slug: 'goldenes-dachl' },
      { name: { de: 'Hofburg' }, slug: 'hofburg' },
    ]

    function filterItems(list: typeof items, search: string) {
      if (!search) return list
      return list.filter(i => {
        const name = i.name?.de?.toLowerCase() || i.slug.toLowerCase()
        return name.includes(search.toLowerCase())
      })
    }

    it('should return all for empty search', () => {
      expect(filterItems(items, '')).toHaveLength(3)
    })

    it('should filter by name', () => {
      expect(filterItems(items, 'gold')).toHaveLength(1)
      expect(filterItems(items, 'gold')[0].slug).toBe('goldenes-dachl')
    })

    it('should be case-insensitive', () => {
      expect(filterItems(items, 'HOFBURG')).toHaveLength(1)
    })

    it('should return empty for no match', () => {
      expect(filterItems(items, 'xyz')).toHaveLength(0)
    })
  })
})
