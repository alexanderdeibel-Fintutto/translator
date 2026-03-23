// @vitest-environment jsdom
// Tests for curator-permissions — role hierarchy, defaults, permission checks

import { describe, it, expect } from 'vitest'
import {
  ROLE_DEFAULTS,
  ROLE_HIERARCHY,
  roleLevel,
  isRoleAtLeast,
  checkPermission,
  isDomainAllowed,
  isContentTypeAllowed,
  ROLE_LABELS,
  PERMISSION_LABELS,
} from '../curator-permissions'
import type { CuratorRole, Permission, CuratorRoleRecord } from '../curator-permissions'

function makeRole(overrides: Partial<CuratorRoleRecord> = {}): CuratorRoleRecord {
  return {
    id: 'test-id',
    user_id: 'user-1',
    museum_id: 'museum-1',
    role: 'editor',
    can_create: true,
    can_edit: true,
    can_delete: false,
    can_publish: false,
    can_manage_workflow: false,
    can_manage_users: false,
    can_import: true,
    can_export: true,
    can_use_ai: true,
    allowed_domains: null,
    allowed_content_types: null,
    ...overrides,
  }
}

describe('curator-permissions', () => {
  describe('ROLE_HIERARCHY', () => {
    it('should have 5 roles in order', () => {
      expect(ROLE_HIERARCHY).toEqual(['viewer', 'editor', 'publisher', 'manager', 'admin'])
    })
  })

  describe('roleLevel', () => {
    it('should return 0 for viewer', () => {
      expect(roleLevel('viewer')).toBe(0)
    })

    it('should return 4 for admin', () => {
      expect(roleLevel('admin')).toBe(4)
    })

    it('should increase monotonically', () => {
      for (let i = 1; i < ROLE_HIERARCHY.length; i++) {
        expect(roleLevel(ROLE_HIERARCHY[i])).toBeGreaterThan(roleLevel(ROLE_HIERARCHY[i - 1]))
      }
    })
  })

  describe('isRoleAtLeast', () => {
    it('should return true for same role', () => {
      expect(isRoleAtLeast('editor', 'editor')).toBe(true)
    })

    it('should return true for higher role', () => {
      expect(isRoleAtLeast('admin', 'viewer')).toBe(true)
      expect(isRoleAtLeast('publisher', 'editor')).toBe(true)
    })

    it('should return false for lower role', () => {
      expect(isRoleAtLeast('viewer', 'editor')).toBe(false)
      expect(isRoleAtLeast('editor', 'publisher')).toBe(false)
    })
  })

  describe('ROLE_DEFAULTS', () => {
    it('should have defaults for all 5 roles', () => {
      expect(Object.keys(ROLE_DEFAULTS)).toHaveLength(5)
    })

    it('viewer should only be able to view', () => {
      const d = ROLE_DEFAULTS.viewer
      expect(d.view).toBe(true)
      expect(d.create).toBe(false)
      expect(d.edit).toBe(false)
      expect(d.delete).toBe(false)
      expect(d.publish).toBe(false)
      expect(d.use_ai).toBe(false)
    })

    it('editor should be able to create and edit', () => {
      const d = ROLE_DEFAULTS.editor
      expect(d.create).toBe(true)
      expect(d.edit).toBe(true)
      expect(d.delete).toBe(false)
      expect(d.publish).toBe(false)
    })

    it('publisher should be able to publish', () => {
      expect(ROLE_DEFAULTS.publisher.publish).toBe(true)
      expect(ROLE_DEFAULTS.publisher.delete).toBe(false)
    })

    it('manager should be able to delete and manage workflow', () => {
      expect(ROLE_DEFAULTS.manager.delete).toBe(true)
      expect(ROLE_DEFAULTS.manager.manage_workflow).toBe(true)
      expect(ROLE_DEFAULTS.manager.manage_users).toBe(false)
    })

    it('admin should have all permissions', () => {
      const d = ROLE_DEFAULTS.admin
      for (const val of Object.values(d)) {
        expect(val).toBe(true)
      }
    })

    it('should grant progressively more permissions', () => {
      const roles: CuratorRole[] = ['viewer', 'editor', 'publisher', 'manager', 'admin']
      let prevCount = 0
      for (const role of roles) {
        const trueCount = Object.values(ROLE_DEFAULTS[role]).filter(v => v === true).length
        expect(trueCount).toBeGreaterThanOrEqual(prevCount)
        prevCount = trueCount
      }
    })
  })

  describe('checkPermission', () => {
    it('admin should always return true', () => {
      const role = makeRole({ role: 'admin' })
      expect(checkPermission(role, 'delete')).toBe(true)
      expect(checkPermission(role, 'manage_users')).toBe(true)
    })

    it('view should always return true for any role', () => {
      const viewer = makeRole({ role: 'viewer', can_create: false, can_edit: false })
      expect(checkPermission(viewer, 'view')).toBe(true)
    })

    it('editor should not be able to publish', () => {
      const editor = makeRole({ role: 'editor', can_publish: false })
      expect(checkPermission(editor, 'publish')).toBe(false)
    })

    it('editor should be able to create', () => {
      const editor = makeRole({ role: 'editor', can_create: true })
      expect(checkPermission(editor, 'create')).toBe(true)
    })

    it('should respect custom permission overrides', () => {
      const custom = makeRole({ role: 'editor', can_delete: true })
      expect(checkPermission(custom, 'delete')).toBe(true)
    })
  })

  describe('isDomainAllowed', () => {
    it('should allow all when allowed_domains is null', () => {
      const role = makeRole({ allowed_domains: null })
      expect(isDomainAllowed(role, 'artguide')).toBe(true)
      expect(isDomainAllowed(role, 'cityguide')).toBe(true)
    })

    it('should filter when allowed_domains is set', () => {
      const role = makeRole({ allowed_domains: ['artguide', 'cityguide'] })
      expect(isDomainAllowed(role, 'artguide')).toBe(true)
      expect(isDomainAllowed(role, 'eventguide')).toBe(false)
    })

    it('should deny all with empty array', () => {
      const role = makeRole({ allowed_domains: [] })
      expect(isDomainAllowed(role, 'artguide')).toBe(false)
    })
  })

  describe('isContentTypeAllowed', () => {
    it('should allow all when null', () => {
      const role = makeRole({ allowed_content_types: null })
      expect(isContentTypeAllowed(role, 'artwork')).toBe(true)
    })

    it('should filter when set', () => {
      const role = makeRole({ allowed_content_types: ['artwork', 'landmark'] })
      expect(isContentTypeAllowed(role, 'artwork')).toBe(true)
      expect(isContentTypeAllowed(role, 'restaurant')).toBe(false)
    })
  })

  describe('labels', () => {
    it('should have DE and EN labels for all roles', () => {
      const roles: CuratorRole[] = ['viewer', 'editor', 'publisher', 'manager', 'admin']
      for (const role of roles) {
        expect(ROLE_LABELS[role].de).toBeTruthy()
        expect(ROLE_LABELS[role].en).toBeTruthy()
      }
    })

    it('should have DE and EN labels for all permissions', () => {
      const perms: Permission[] = ['view', 'create', 'edit', 'delete', 'publish', 'manage_workflow', 'manage_users', 'import', 'export', 'use_ai']
      for (const perm of perms) {
        expect(PERMISSION_LABELS[perm].de).toBeTruthy()
        expect(PERMISSION_LABELS[perm].en).toBeTruthy()
      }
    })

    it('should not use German special characters in DE labels', () => {
      const specialChars = /[äöüßÄÖÜ]/
      for (const label of Object.values(ROLE_LABELS)) {
        expect(label.de).not.toMatch(specialChars)
      }
      for (const label of Object.values(PERMISSION_LABELS)) {
        expect(label.de).not.toMatch(specialChars)
      }
    })
  })
})
