// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('utils', () => {
  describe('cn (class name merging)', () => {
    it('should return a single class unchanged', () => {
      expect(cn('p-4')).toBe('p-4')
    })

    it('should merge multiple classes', () => {
      const result = cn('p-4', 'text-red-500')
      expect(result).toContain('p-4')
      expect(result).toContain('text-red-500')
    })

    it('should handle conflicting Tailwind classes by keeping the last one', () => {
      // tailwind-merge should keep p-4 (last wins)
      const result = cn('p-2', 'p-4')
      expect(result).toBe('p-4')
    })

    it('should merge conflicting margin classes', () => {
      const result = cn('m-2', 'm-4')
      expect(result).toBe('m-4')
    })

    it('should merge conflicting text color classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('should filter out undefined values', () => {
      const result = cn('p-4', undefined, 'text-sm')
      expect(result).toContain('p-4')
      expect(result).toContain('text-sm')
    })

    it('should filter out null values', () => {
      const result = cn('p-4', null, 'text-sm')
      expect(result).toContain('p-4')
      expect(result).toContain('text-sm')
    })

    it('should filter out false values', () => {
      const result = cn('p-4', false, 'text-sm')
      expect(result).toContain('p-4')
      expect(result).toContain('text-sm')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const isDisabled = false
      const result = cn('base', isActive && 'active', isDisabled && 'disabled')
      expect(result).toContain('base')
      expect(result).toContain('active')
      expect(result).not.toContain('disabled')
    })

    it('should return empty string for no arguments', () => {
      expect(cn()).toBe('')
    })

    it('should return empty string for empty string input', () => {
      expect(cn('')).toBe('')
    })

    it('should handle array inputs', () => {
      const result = cn(['p-4', 'text-sm'])
      expect(result).toContain('p-4')
      expect(result).toContain('text-sm')
    })

    it('should handle mixed non-conflicting classes', () => {
      const result = cn('flex', 'items-center', 'gap-2', 'p-4')
      expect(result).toContain('flex')
      expect(result).toContain('items-center')
      expect(result).toContain('gap-2')
      expect(result).toContain('p-4')
    })

    it('should handle object syntax from clsx', () => {
      const result = cn({ 'p-4': true, 'text-sm': false, 'font-bold': true })
      expect(result).toContain('p-4')
      expect(result).not.toContain('text-sm')
      expect(result).toContain('font-bold')
    })
  })
})
