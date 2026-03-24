// @vitest-environment jsdom
// Tests for Fintutto World — Data Export (DSGVO)
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock supabase — use vi.hoisted so the mock factory can reference mockFrom
// ---------------------------------------------------------------------------
const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}))

vi.mock('../../supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

import { exportVisitorData, downloadExportedData, requestDataDeletion, type ExportedData } from '../data-export'

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createChain(resolveValue: unknown) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.single = vi.fn(() => Promise.resolve(resolveValue))
  chain.order = vi.fn(() => chain)
  chain.delete = vi.fn(() => chain)
  // Make thenable for Promise.all
  chain.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(resolveValue).then(resolve, reject)
  return chain
}

// ---------------------------------------------------------------------------
// exportVisitorData
// ---------------------------------------------------------------------------
describe('exportVisitorData', () => {
  it('should return exported data with all sections', async () => {
    const responses = [
      { data: { id: 'v1', name: 'Alice' } },       // fw_visitor_profiles (single)
      { data: [{ id: 'visit1' }] },                  // fw_visit_history
      { data: [{ id: 'int1' }] },                    // fw_poi_interactions
      { data: [] },                                    // fw_ai_dialogs
      { data: [{ id: 'fav1' }] },                    // fw_favorites
      { data: [] },                                    // fw_notifications
    ]
    let callIdx = 0
    mockFrom.mockImplementation(() => createChain(responses[callIdx++]))

    const result = await exportVisitorData('v1')
    expect(result.profile).toEqual({ id: 'v1', name: 'Alice' })
    expect(result.visits).toEqual([{ id: 'visit1' }])
    expect(result.interactions).toEqual([{ id: 'int1' }])
    expect(result.dialogs).toEqual([])
    expect(result.favorites).toEqual([{ id: 'fav1' }])
    expect(result.notifications).toEqual([])
    expect(result.exportedAt).toBeDefined()
  })

  it('should return null profile and empty arrays when no data exists', async () => {
    mockFrom.mockImplementation(() => createChain({ data: null }))

    const result = await exportVisitorData('nonexistent')
    expect(result.profile).toBeNull()
    expect(result.visits).toEqual([])
    expect(result.interactions).toEqual([])
    expect(result.dialogs).toEqual([])
    expect(result.favorites).toEqual([])
    expect(result.notifications).toEqual([])
  })

  it('should query all 6 tables', async () => {
    const tables: string[] = []
    mockFrom.mockImplementation((table: string) => {
      tables.push(table)
      return createChain({ data: null })
    })

    await exportVisitorData('v1')
    expect(tables).toEqual([
      'fw_visitor_profiles',
      'fw_visit_history',
      'fw_poi_interactions',
      'fw_ai_dialogs',
      'fw_favorites',
      'fw_notifications',
    ])
  })
})

// ---------------------------------------------------------------------------
// downloadExportedData
// ---------------------------------------------------------------------------
describe('downloadExportedData', () => {
  it('should create an anchor element and trigger download', () => {
    const clickSpy = vi.fn()
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')

    const data: ExportedData = {
      profile: { id: 'v1' },
      visits: [],
      interactions: [],
      dialogs: [],
      favorites: [],
      notifications: [],
      exportedAt: '2025-01-01T00:00:00Z',
    }

    downloadExportedData(data, 'test-export.json')
    expect(clickSpy).toHaveBeenCalled()
    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test')

    createElementSpy.mockRestore()
    revokeObjectURLSpy.mockRestore()
    createObjectURLSpy.mockRestore()
  })

  it('should use default filename when none provided', () => {
    let downloadAttr = ''
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      set href(_v: string) {},
      set download(v: string) { downloadAttr = v },
      get download() { return downloadAttr },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const data: ExportedData = {
      profile: null, visits: [], interactions: [], dialogs: [],
      favorites: [], notifications: [], exportedAt: '2025-06-15T00:00:00Z',
    }

    downloadExportedData(data)
    expect(downloadAttr).toContain('visitor-data-export-')
    createElementSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// requestDataDeletion
// ---------------------------------------------------------------------------
describe('requestDataDeletion', () => {
  it('should delete from all tables in order and return success', async () => {
    const deletedTables: string[] = []

    mockFrom.mockImplementation((table: string) => {
      const c: Record<string, unknown> = {}
      c.delete = () => {
        deletedTables.push(table)
        return c
      }
      c.eq = () => Promise.resolve({ error: null })
      return c
    })

    const result = await requestDataDeletion('v1')
    expect(result).toEqual({ success: true })
    expect(deletedTables).toEqual([
      'fw_notifications',
      'fw_favorites',
      'fw_ai_dialogs',
      'fw_poi_interactions',
      'fw_visit_history',
      'fw_visitor_profiles',
    ])
  })

  it('should return error if any table deletion fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      const c: Record<string, unknown> = {}
      c.delete = () => c
      c.eq = () => {
        if (table === 'fw_ai_dialogs') {
          return Promise.resolve({ error: { message: 'permission denied' } })
        }
        return Promise.resolve({ error: null })
      }
      return c
    })

    const result = await requestDataDeletion('v1')
    expect(result.success).toBe(false)
    expect(result.error).toContain('fw_ai_dialogs')
    expect(result.error).toContain('permission denied')
  })

  it('should stop deleting after first error', async () => {
    const deletedTables: string[] = []

    mockFrom.mockImplementation((table: string) => {
      const c: Record<string, unknown> = {}
      c.delete = () => {
        deletedTables.push(table)
        return c
      }
      c.eq = () => {
        if (table === 'fw_favorites') {
          return Promise.resolve({ error: { message: 'fail' } })
        }
        return Promise.resolve({ error: null })
      }
      return c
    })

    await requestDataDeletion('v1')
    // Should stop after fw_favorites (second table)
    expect(deletedTables).toEqual(['fw_notifications', 'fw_favorites'])
  })
})
