/** Extracts the backend's `message` field from an Axios error, or returns the fallback. */
export function apiErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: string } } } | null)?.response?.data
    ?.message
  return message || fallback
}

export function apiErrorStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status
}
