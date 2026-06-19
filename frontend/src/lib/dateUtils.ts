export function formatDistanceToNow(date: Date | string | number, options?: { addSuffix?: boolean }): string {
  const time = new Date(date).getTime()
  const now = Date.now()
  const diffInSeconds = Math.abs(Math.floor((now - time) / 1000))
  const isPast = time < now

  let amount = 0
  let unit = ''

  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    amount = Math.floor(diffInSeconds / 60)
    unit = 'minute'
  } else if (diffInSeconds < 86400) {
    amount = Math.floor(diffInSeconds / 3600)
    unit = 'hour'
  } else if (diffInSeconds < 2592000) {
    amount = Math.floor(diffInSeconds / 86400)
    unit = 'day'
  } else if (diffInSeconds < 31536000) {
    amount = Math.floor(diffInSeconds / 2592000)
    unit = 'month'
  } else {
    amount = Math.floor(diffInSeconds / 31536000)
    unit = 'year'
  }

  const plural = amount === 1 ? '' : 's'
  const text = `${amount} ${unit}${plural}`

  if (options?.addSuffix) {
    return isPast ? `${text} ago` : `in ${text}`
  }
  return text
}
