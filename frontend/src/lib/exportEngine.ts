/**
 * Universal Export Engine
 * 
 * Supports exporting JSON array data to CSV.
 * (In a full enterprise environment, this would also support Excel via xlsx and PDF via jspdf)
 */

export function exportToCSV<T>(data: T[], filename: string) {
  if (!data || !data.length) return

  // Extract headers
  const headers = Object.keys(data[0] as object)
  
  // Convert data to CSV string
  const csvRows = []
  
  // Add headers
  csvRows.push(headers.join(','))
  
  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = (row as any)[header]
      // Escape quotes and wrap in quotes if there's a comma
      const escaped = ('' + val).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }
  
  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  
  // Trigger download
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function triggerPrint() {
  window.print()
}
