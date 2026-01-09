import * as XLSX from 'xlsx'

export interface ExcelColumn {
  header: string
  key: string
  width?: number
}

export class ExcelExporter {
  /**
   * Export data to Excel file
   * @param data - Array of objects to export
   * @param columns - Column definitions
   * @param filename - Output filename (without extension)
   * @param sheetName - Name of the worksheet
   */
  static exportToExcel(
    data: any[],
    columns: ExcelColumn[],
    filename: string,
    sheetName: string = 'Sheet1'
  ): void {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()

    // Prepare data for Excel
    const excelData = data.map(row => {
      const mappedRow: any = {}
      columns.forEach(col => {
        mappedRow[col.header] = row[col.key]
      })
      return mappedRow
    })

    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const colWidths = columns.map(col => ({
      wch: col.width || 15
    }))
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Generate and download file
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  /**
   * Export simple data array to Excel
   * @param data - Array of arrays (rows and columns)
   * @param filename - Output filename
   * @param sheetName - Name of the worksheet
   */
  static exportSimple(
    data: any[][],
    filename: string,
    sheetName: string = 'Sheet1'
  ): void {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  /**
   * Read Excel file
   * @param file - File object to read
   * @returns Promise with parsed data
   */
  static async readExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(reader.error)
      reader.readAsBinaryString(file)
    })
  }
}
