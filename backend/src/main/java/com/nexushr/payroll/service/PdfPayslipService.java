package com.nexushr.payroll.service;

import com.nexushr.payroll.model.Payroll;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;

@Slf4j
@Service
public class PdfPayslipService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(33, 37, 41));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(33, 37, 41));
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(73, 80, 87));
    private static final Font BOLD_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(33, 37, 41));
    private static final Font NET_FONT = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(25, 135, 84));
    private static final Color HEADER_BG = new Color(13, 110, 253);
    private static final Color LIGHT_BG = new Color(248, 249, 250);

    public byte[] generatePayslip(Payroll payroll) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Company Header
            Paragraph company = new Paragraph("NexusHR Pvt. Ltd.", TITLE_FONT);
            company.setAlignment(Element.ALIGN_CENTER);
            document.add(company);

            Paragraph address = new Paragraph("Electronic City, Bangalore, Karnataka 560100", NORMAL_FONT);
            address.setAlignment(Element.ALIGN_CENTER);
            document.add(address);

            document.add(Chunk.NEWLINE);

            // Payslip Title
            String monthName = Month.of(payroll.getMonth()).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            Paragraph title = new Paragraph("PAYSLIP - " + monthName + " " + payroll.getYear(), HEADER_FONT);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(Chunk.NEWLINE);

            // Employee Details
            PdfPTable empTable = new PdfPTable(4);
            empTable.setWidthPercentage(100);
            empTable.setWidths(new float[]{25, 25, 25, 25});

            addDetailCell(empTable, "Employee ID", payroll.getEmployee().getEmployeeId());
            addDetailCell(empTable, "Employee Name", payroll.getEmployee().getFullName());
            addDetailCell(empTable, "Department",
                    payroll.getEmployee().getDepartment() != null
                            ? payroll.getEmployee().getDepartment().getName() : "N/A");
            addDetailCell(empTable, "Designation",
                    payroll.getEmployee().getDesignation() != null
                            ? payroll.getEmployee().getDesignation() : "N/A");
            document.add(empTable);

            document.add(Chunk.NEWLINE);

            // Salary Breakdown Table
            PdfPTable salaryTable = new PdfPTable(2);
            salaryTable.setWidthPercentage(100);
            salaryTable.setWidths(new float[]{60, 40});

            // Earnings Header
            addSectionHeader(salaryTable, "EARNINGS", 2);
            addSalaryRow(salaryTable, "Basic Salary", formatCurrency(payroll.getBasicSalary()), false);
            addSalaryRow(salaryTable, "House Rent Allowance (HRA)", formatCurrency(payroll.getHra()), false);
            addSalaryRow(salaryTable, "Dearness Allowance (DA)", formatCurrency(payroll.getDa()), false);
            addSalaryRow(salaryTable, "Other Allowances", formatCurrency(payroll.getOtherAllowances()), false);
            addSalaryRow(salaryTable, "Bonus", formatCurrency(payroll.getBonus()), false);
            addSalaryRow(salaryTable, "GROSS SALARY", formatCurrency(payroll.getGrossSalary()), true);

            // Deductions Header
            addSectionHeader(salaryTable, "DEDUCTIONS", 2);
            addSalaryRow(salaryTable, "Provident Fund (PF - 12%)", formatCurrency(payroll.getPfDeduction()), false);
            addSalaryRow(salaryTable, "Professional Tax", formatCurrency(payroll.getProfessionalTax()), false);
            addSalaryRow(salaryTable, "Income Tax (TDS)", formatCurrency(payroll.getIncomeTax()), false);
            addSalaryRow(salaryTable, "Other Deductions", formatCurrency(payroll.getOtherDeductions()), false);
            addSalaryRow(salaryTable, "TOTAL DEDUCTIONS", formatCurrency(payroll.getTotalDeductions()), true);

            document.add(salaryTable);

            document.add(Chunk.NEWLINE);

            // Net Salary
            PdfPTable netTable = new PdfPTable(2);
            netTable.setWidthPercentage(100);
            netTable.setWidths(new float[]{60, 40});

            PdfPCell netLabel = new PdfPCell(new Phrase("NET SALARY", NET_FONT));
            netLabel.setBorder(Rectangle.TOP | Rectangle.BOTTOM);
            netLabel.setPadding(10);
            netLabel.setBackgroundColor(new Color(212, 237, 218));
            netTable.addCell(netLabel);

            PdfPCell netValue = new PdfPCell(new Phrase(formatCurrency(payroll.getNetSalary()), NET_FONT));
            netValue.setBorder(Rectangle.TOP | Rectangle.BOTTOM);
            netValue.setPadding(10);
            netValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            netValue.setBackgroundColor(new Color(212, 237, 218));
            netTable.addCell(netValue);

            document.add(netTable);

            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);

            // Footer
            Paragraph footer = new Paragraph(
                    "This is a computer-generated payslip and does not require a signature.",
                    new Font(Font.HELVETICA, 8, Font.ITALIC, new Color(108, 117, 125)));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating payslip PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate payslip PDF", e);
        }
    }

    private void addDetailCell(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, BOLD_FONT));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        labelCell.setBackgroundColor(LIGHT_BG);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, NORMAL_FONT));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        valueCell.setBackgroundColor(LIGHT_BG);
        table.addCell(valueCell);
    }

    private void addSectionHeader(PdfPTable table, String text, int colspan) {
        PdfPCell cell = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 11, Font.BOLD, Color.WHITE)));
        cell.setColspan(colspan);
        cell.setBackgroundColor(HEADER_BG);
        cell.setPadding(8);
        cell.setBorder(Rectangle.BOX);
        table.addCell(cell);
    }

    private void addSalaryRow(PdfPTable table, String label, String amount, boolean isBold) {
        Font font = isBold ? BOLD_FONT : NORMAL_FONT;

        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(Rectangle.BOTTOM);
        labelCell.setBorderColor(new Color(222, 226, 230));
        labelCell.setPadding(6);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(amount, font));
        valueCell.setBorder(Rectangle.BOTTOM);
        valueCell.setBorderColor(new Color(222, 226, 230));
        valueCell.setPadding(6);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }

    private String formatCurrency(java.math.BigDecimal amount) {
        return "₹ " + String.format("%,.2f", amount);
    }
}
