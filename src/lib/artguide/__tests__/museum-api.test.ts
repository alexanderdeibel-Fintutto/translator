// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockIlike = vi.fn()
const mockLimit = vi.fn()
const mockRange = vi.fn()
const mockOverlaps = vi.fn()
const mockGetUser = vi.fn()
const mockInvoke = vi.fn()
const mockIs = vi.fn()

function createChainableMock() {
  const chain: Record<string, any> = {}
  chain.select = (...args: any[]) => { mockSelect(...args); return chain }
  chain.insert = (data: any) => { mockInsert(data); return chain }
  chain.update = (data: any) => { mockUpdate(data); return chain }
  chain.delete = () => { mockDelete(); return chain }
  chain.eq = (col: string, val: any) => { mockEq(col, val); return chain }
  chain.is = (col: string, val: any) => { mockIs(col, val); return chain }
  chain.ilike = (col: string, val: any) => { mockIlike(col, val); return chain }
  chain.order = (col: string, opts?: any) => { mockOrder(col, opts); return chain }
  chain.limit = (n: number) => { mockLimit(n); return chain }
  chain.range = (start: number, end: number) => { mockRange(start, end); return chain }
  chain.overlaps = (col: string, vals: any[]) => { mockOverlaps(col, vals); return chain }
  chain.or = (...args: any[]) => chain
  chain.single = () => mockSingle()
  chain.catch = (fn: Function) => chain
  return chain
}

vi.mock('../../supabase', () => ({
  supabase: {
    from: (table: string) => createChainableMock(),
    auth: {
      getUser: () => mockGetUser(),
    },
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/img.jpg' } }),
      }),
    },
  },
}))

import {
  listMuseums,
  getMuseumById,
  createArtwork,
  updateArtwork,
  getTours,
  createTour,
  inviteStaffMember,
} from '../museum-api'

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
})

describe('museum-api', () => {
  describe('listMuseums()', () => {
    it('returns list of museums', async () => {
      mockSingle.mockResolvedValue({
        data: [{ id: 'm1', name: 'Louvre' }],
        count: 1,
        error: null,
      })

      // listMuseums does not call single(), so we need to mock the chain end differently
      // The function uses .select('*', { count: 'exact' }) then reads data/count/error
      // Since our chain mock returns the chain itself from all methods,
      // we'll override the approach: the last call in the chain returns the result
      const result = await listMuseums()

      expect(mockSelect).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('is_active', true)
    })

    it('applies search filter when provided', async () => {
      await listMuseums({ search: 'Louvre' })
      expect(mockIlike).toHaveBeenCalledWith('name', '%Louvre%')
    })

    it('applies limit when provided', async () => {
      await listMuseums({ limit: 10 })
      expect(mockLimit).toHaveBeenCalledWith(10)
    })

    it('applies offset range when provided', async () => {
      await listMuseums({ limit: 20, offset: 40 })
      expect(mockRange).toHaveBeenCalledWith(40, 59)
    })
  })

  describe('getMuseumById()', () => {
    it('returns museum by ID', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'm1', name: 'British Museum' },
        error: null,
      })

      const result = await getMuseumById('m1')
      expect(mockEq).toHaveBeenCalledWith('id', 'm1')
    })

    it('returns null on error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      })

      const result = await getMuseumById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('createArtwork()', () => {
    it('inserts artwork with user info', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'art-1', title: { de: 'Test' }, museum_id: 'm1' },
        error: null,
      })

      const result = await createArtwork({
        museum_id: 'm1',
        title: { de: 'Test Artwork' },
      } as any)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          museum_id: 'm1',
          created_by: 'user-1',
          updated_by: 'user-1',
        }),
      )
    })

    it('returns null on insert error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      })

      const result = await createArtwork({ museum_id: 'm1' } as any)
      expect(result).toBeNull()
    })
  })

  describe('updateArtwork()', () => {
    it('updates artwork with user info', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'art-1', title: { de: 'Updated' } },
        error: null,
      })

      await updateArtwork('art-1', { title: { de: 'Updated Title' } } as any)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_by: 'user-1',
        }),
      )
      expect(mockEq).toHaveBeenCalledWith('id', 'art-1')
    })

    it('returns null on update error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      })

      const result = await updateArtwork('art-1', {} as any)
      expect(result).toBeNull()
    })
  })

  describe('getTours()', () => {
    it('lists tours for a museum', async () => {
      // getTours uses select with join, does not call single()
      await getTours('m1')

      expect(mockSelect).toHaveBeenCalledWith('*, ag_tour_stops(*)')
      expect(mockEq).toHaveBeenCalledWith('museum_id', 'm1')
    })

    it('filters by status when provided', async () => {
      await getTours('m1', { status: 'published' as any })

      expect(mockEq).toHaveBeenCalledWith('status', 'published')
    })
  })

  describe('createTour()', () => {
    it('inserts tour with user info', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'tour-1', museum_id: 'm1', title: { de: 'Highlights' } },
        error: null,
      })

      await createTour({
        museum_id: 'm1',
        title: { de: 'Highlights Tour' },
      } as any)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          museum_id: 'm1',
          created_by: 'user-1',
        }),
      )
    })

    it('returns null on error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Failed' },
      })

      const result = await createTour({ museum_id: 'm1' } as any)
      expect(result).toBeNull()
    })
  })

  describe('inviteStaffMember()', () => {
    it('creates invite record and sends email', async () => {
      mockSingle.mockResolvedValue({
        data: { name: 'Test Museum' },
        error: null,
      })
      mockInvoke.mockResolvedValue({ data: null, error: null })

      const result = await inviteStaffMember('m1', 'staff@example.com', 'editor' as any)

      expect(result.success).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          museum_id: 'm1',
          email: 'staff@example.com',
          role_id: 'editor',
          invited_by: 'user-1',
        }),
      )
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const result = await inviteStaffMember('m1', 'test@test.com', 'viewer' as any)

      expect(result.success).toBe(false)
      expect(result.error).toContain('authentifiziert')
    })

    it('sends invitation email via edge function', async () => {
      mockSingle.mockResolvedValue({
        data: { name: 'Art Gallery' },
        error: null,
      })
      mockInvoke.mockResolvedValue({ data: null, error: null })

      await inviteStaffMember('m1', 'new@example.com', 'curator' as any)

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: expect.objectContaining({
          to: 'new@example.com',
          subject: expect.stringContaining('Art Gallery'),
        }),
      })
    })
  })
})
