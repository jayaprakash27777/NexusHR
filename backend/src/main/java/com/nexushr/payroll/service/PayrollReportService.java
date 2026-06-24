package com.nexushr.payroll.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.nexushr.payroll.model.Payroll;
import com.nexushr.payroll.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollReportService {

    private final PayrollRepository payrollRepository;

    private static final String[] COLUMNS = {
            "Employee ID", "Employee Name", "Department", "Designation",
            "Basic Salary", "HRA", "DA", "Allowances", "Bonus", "Gross Salary",
            "PF", "ESI", "Tax", "Other Deductions", "Total Deductions", "Net Salary", "Currency", "Status"
    };

    public byte[] generateCsvReport(int month, int year) {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year);
        StringBuilder sb = new StringBuilder();

        // Header
        sb.append(String.join(",", COLUMNS)).append("\n");

        for (Payroll p : payrolls) {
            sb.append(escapeCsv(p.getEmployee().getEmployeeId())).append(",")
                    .append(escapeCsv(p.getEmployee().getFullName())).append(",")
                    .append(escapeCsv(p.getEmployee().getDepartment() != null ? p.getEmployee().getDepartment().getName() : "")).append(",")
                    .append(escapeCsv(p.getEmployee().getDesignation() != null ? p.getEmployee().getDesignation() : "")).append(",")
                    .append(p.getBasicSalary()).append(",")
                    .append(p.getHra()).append(",")
                    .append(p.getDa()).append(",")
                    .append(p.getOtherAllowances()).append(",")
                    .append(p.getBonus()).append(",")
                    .append(p.getGrossSalary()).append(",")
                    .append(p.getPfDeduction()).append(",")
                    .append(p.getEsiDeduction()).append(",")
                    .append(p.getIncomeTax().add(p.getProfessionalTax())).append(",")
                    .append(p.getOtherDeductions()).append(",")
                    .append(p.getTotalDeductions()).append(",")
                    .append(p.getNetSalary()).append(",")
                    .append(escapeCsv(p.getCurrency())).append(",")
                    .append(p.getStatus().name()).append("\n");
        }
        return sb.toString().getBytes();
    }

    public byte[] generateBankFile(int month, int year) {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year);
        StringBuilder sb = new StringBuilder();

        // Bank File Header
        sb.append("Employee ID,Employee Name,Bank Name,Account Number,IFSC Code,Net Salary,Currency,Status\n");

        for (Payroll p : payrolls) {
            sb.append(escapeCsv(p.getEmployee().getEmployeeId())).append(",")
                    .append(escapeCsv(p.getEmployee().getFullName())).append(",")
                    .append(escapeCsv(p.getEmployee().getBankName())).append(",")
                    .append(escapeCsv(p.getEmployee().getBankAccountNumber())).append(",")
                    .append(escapeCsv(p.getEmployee().getIfscCode())).append(",")
                    .append(p.getNetSalary()).append(",")
                    .append(escapeCsv(p.getCurrency())).append(",")
                    .append(p.getStatus().name()).append("\n");
        }
        return sb.toString().getBytes();
    }

    public byte[] generateExcelReport(int month, int year) {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Payroll " + month + "-" + year);

            // Header Font
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            for (int i = 0; i < COLUMNS.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(COLUMNS[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Payroll p : payrolls) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(p.getEmployee().getEmployeeId());
                row.createCell(1).setCellValue(p.getEmployee().getFullName());
                row.createCell(2).setCellValue(p.getEmployee().getDepartment() != null ? p.getEmployee().getDepartment().getName() : "");
                row.createCell(3).setCellValue(p.getEmployee().getDesignation() != null ? p.getEmployee().getDesignation() : "");
                row.createCell(4).setCellValue(p.getBasicSalary().doubleValue());
                row.createCell(5).setCellValue(p.getHra().doubleValue());
                row.createCell(6).setCellValue(p.getDa().doubleValue());
                row.createCell(7).setCellValue(p.getOtherAllowances().doubleValue());
                row.createCell(8).setCellValue(p.getBonus().doubleValue());
                row.createCell(9).setCellValue(p.getGrossSalary().doubleValue());
                row.createCell(10).setCellValue(p.getPfDeduction().doubleValue());
                row.createCell(11).setCellValue(p.getIncomeTax().add(p.getProfessionalTax()).doubleValue());
                row.createCell(12).setCellValue(p.getOtherDeductions().doubleValue());
                row.createCell(13).setCellValue(p.getTotalDeductions().doubleValue());
                row.createCell(14).setCellValue(p.getNetSalary().doubleValue());
                row.createCell(15).setCellValue(p.getStatus().name());
            }

            for (int i = 0; i < COLUMNS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating Excel: ", e);
            throw new RuntimeException("Failed to generate Excel report");
        }
    }

    public byte[] generatePdfReport(int month, int year) {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year);
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(33, 37, 41));
            String monthName = Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH);

            Paragraph title = new Paragraph("Monthly Payroll Report - " + monthName + " " + year, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(10);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{10, 15, 12, 10, 8, 8, 8, 8, 10, 11});

            String[] pdfColumns = {"Emp ID", "Name", "Dept", "Basic", "Allow", "Bonus", "Gross", "Deduct", "Net Pay", "Status"};
            
            Font headFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            for (String col : pdfColumns) {
                PdfPCell cell = new PdfPCell(new Phrase(col, headFont));
                cell.setBackgroundColor(new Color(13, 110, 253));
                cell.setPadding(6);
                table.addCell(cell);
            }

            Font dataFont = new Font(Font.HELVETICA, 9, Font.NORMAL);
            for (Payroll p : payrolls) {
                table.addCell(new Phrase(p.getEmployee().getEmployeeId(), dataFont));
                table.addCell(new Phrase(p.getEmployee().getFullName(), dataFont));
                table.addCell(new Phrase(p.getEmployee().getDepartment() != null ? p.getEmployee().getDepartment().getName() : "", dataFont));
                table.addCell(new Phrase(p.getBasicSalary().toString(), dataFont));
                table.addCell(new Phrase(p.getHra().add(p.getDa()).add(p.getOtherAllowances()).toString(), dataFont));
                table.addCell(new Phrase(p.getBonus().toString(), dataFont));
                table.addCell(new Phrase(p.getGrossSalary().toString(), dataFont));
                table.addCell(new Phrase(p.getTotalDeductions().toString(), dataFont));
                table.addCell(new Phrase(p.getNetSalary().toString(), dataFont));
                table.addCell(new Phrase(p.getStatus().name(), dataFont));
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF: ", e);
            throw new RuntimeException("Failed to generate PDF report");
        }
    }

    private String escapeCsv(String data) {
        if (data == null) return "";
        if (data.contains(",") || data.contains("\"") || data.contains("\n")) {
            data = data.replace("\"", "\"\"");
            return "\"" + data + "\"";
        }
        return data;
    }
}
