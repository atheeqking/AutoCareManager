import { expect, it } from 'vitest'
import { matchesFilter } from './serviceCaseStatus'

const now = new Date('2026-11-17T15:00:00')
const base = { status: 'IN_SERVICE', priority: 'NORMAL' }

it('high priority shows only open high or critical cases', () => {
  expect(matchesFilter({ ...base, priority: 'CRITICAL' }, 'HIGH_PRIORITY', now)).toBe(true)
  expect(matchesFilter({ ...base, priority: 'HIGH' }, 'HIGH_PRIORITY', now)).toBe(true)
  expect(matchesFilter({ ...base, priority: 'NORMAL' }, 'HIGH_PRIORITY', now)).toBe(false)
  expect(matchesFilter({ status: 'COMPLETED', priority: 'HIGH' }, 'HIGH_PRIORITY', now)).toBe(false)
})

it("today's walk-ins excludes appointments and earlier days", () => {
  const walkIn = { ...base, visitType: 'WALK_IN', checkInTime: '2026-11-17T09:30:00' }
  expect(matchesFilter(walkIn, 'TODAY_WALK_INS', now)).toBe(true)
  expect(matchesFilter({ ...walkIn, visitType: 'APPOINTMENT' }, 'TODAY_WALK_INS', now)).toBe(false)
  expect(
    matchesFilter({ ...walkIn, checkInTime: '2026-11-16T09:30:00' }, 'TODAY_WALK_INS', now),
  ).toBe(false)
})

it('status and active filters still work', () => {
  expect(matchesFilter(base, 'IN_SERVICE', now)).toBe(true)
  expect(matchesFilter(base, 'ACTIVE', now)).toBe(true)
  expect(matchesFilter({ ...base, status: 'CANCELLED' }, 'ACTIVE', now)).toBe(false)
})
