// @vitest-environment jsdom
// Tests for museum-api.ts — inviteStaffMember email integration
import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockInsert,
  mockInvoke,
  mockGetUser,
  mockSelect,
  mockEq,
  mockSingle,
} = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockInvoke: vi.fn(),
  mockGetUser: vi.fn(),
  mockSelect: vi.fn(),
  mockEq: vi.fn(),
  mockSingle: vi.fn(),
}))

vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      if (table === 'ag_museum_invites') {
        return { insert: mockInsert }
      }
      if (table === 'ag_museums') {
        return {
          select: (...args: unknown[]) => {
            mockSelect(...args)
            return {
              eq: (...eArgs: unknown[]) => {
                mockEq(...eArgs)
                return { single: mockSingle }
              },
            }
          },
        }
      }
      return { insert: vi.fn(), select: vi.fn() }
    },
    functions: {
      invoke: mockInvoke,
    },
  },
}))

import { inviteStaffMember } from '../museum-api'

describe('inviteStaffMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
    mockInsert.mockResolvedValue({ error: null })
    mockSingle.mockResolvedValue({ data: { name: 'Kunsthalle Berlin' } })
    mockInvoke.mockResolvedValue({ data: { success: true }, error: null })
  })

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const result = await inviteStaffMember('museum-1', 'test@example.com', 'editor')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Nicht authentifiziert')
  })

  it('returns error when invite insert fails', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'Duplicate' } })

    const result = await inviteStaffMember('museum-1', 'test@example.com', 'editor')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Duplicate')
  })

  it('creates invite and sends email on success', async () => {
    const result = await inviteStaffMember('museum-1', 'new@example.com', 'viewer')

    expect(result.success).toBe(true)

    // Verify invite was inserted
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      museum_id: 'museum-1',
      email: 'new@example.com',
      role_id: 'viewer',
      invited_by: 'admin-1',
    }))

    // Verify museum name was fetched
    expect(mockSelect).toHaveBeenCalledWith('name')

    // Verify email was sent
    expect(mockInvoke).toHaveBeenCalledWith('send-email', expect.objectContaining({
      body: expect.objectContaining({
        to: 'new@example.com',
        subject: expect.stringContaining('Kunsthalle Berlin'),
      }),
    }))
  })

  it('succeeds even if email sending fails', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('Email service down'))

    const result = await inviteStaffMember('museum-1', 'test@example.com', 'editor')
    expect(result.success).toBe(true) // non-blocking
  })

  it('includes role and museum_id in email body', async () => {
    await inviteStaffMember('museum-1', 'curator@museum.de', 'curator')

    const emailCall = mockInvoke.mock.calls[0]
    const emailBody = emailCall[1].body.body
    expect(emailBody).toContain('curator')
    expect(emailBody).toContain('Kunsthalle Berlin')
    expect(emailBody).toContain('museum_id=museum-1')
  })
})
