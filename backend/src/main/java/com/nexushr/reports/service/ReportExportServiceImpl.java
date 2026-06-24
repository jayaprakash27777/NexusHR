package com.nexushr.reports.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.nexushr.reports.dto.ReportData;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class ReportExportServiceImpl implements ReportExportService {

    private final String UPLOAD_DIR = "uploads/reports/";

    public ReportExportServiceImpl() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not create reports directory", e);
        }
    }

    @Override
    public String exportToCsv(ReportData data, String filenamePrefix) {
        String filename = generateFilename(filenamePrefix, "csv");
        Path filePath = Paths.get(UPLOAD_DIR, filename);

        try (FileWriter writer = new FileWriter(filePath.toFile())) {
            // Write headers
            writer.write(String.join(",", escapeSpecialCharacters(data.getHeaders())) + "\n");
            
            // Write rows
            for (List<String> row : data.getRows()) {
                writer.write(String.join(",", escapeSpecialCharacters(row)) + "\n");
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to write CSV file", e);
        }

        return "/uploads/reports/" + filename;
    }

    @Override
    public String exportToExcel(ReportData data, String filenamePrefix) {
        String filename = generateFilename(filenamePrefix, "xlsx");
        Path filePath = Paths.get(UPLOAD_DIR, filename);

        try (Workbook workbook = new XSSFWorkbook();
             FileOutputStream fos = new FileOutputStream(filePath.toFile())) {

            Sheet sheet = workbook.createSheet(data.getTitle() != null ? data.getTitle() : "Report");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            // Write headers
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < data.getHeaders().size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(data.getHeaders().get(i));
                cell.setCellStyle(headerStyle);
            }

            // Write rows
            int rowNum = 1;
            for (List<String> rowData : data.getRows()) {
                Row row = sheet.createRow(rowNum++);
                for (int i = 0; i < rowData.size(); i++) {
                    row.createCell(i).setCellValue(rowData.get(i) != null ? rowData.get(i) : "");
                }
            }

            for (int i = 0; i < data.getHeaders().size(); i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(fos);

        } catch (IOException e) {
            throw new RuntimeException("Failed to write Excel file", e);
        }

        return "/uploads/reports/" + filename;
    }

    @Override
    public String exportToPdf(ReportData data, String filenamePrefix) {
        String filename = generateFilename(filenamePrefix, "pdf");
        Path filePath = Paths.get(UPLOAD_DIR, filename);

        try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
            Document document = new Document();
            PdfWriter.getInstance(document, fos);
            document.open();

            // Title
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Paragraph title = new Paragraph(data.getTitle() != null ? data.getTitle() : "System Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Table
            PdfPTable table = new PdfPTable(data.getHeaders().size());
            table.setWidthPercentage(100);

            // Headers
            Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD);
            for (String header : data.getHeaders()) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            // Rows
            Font rowFont = new Font(Font.HELVETICA, 10, Font.NORMAL);
            for (List<String> row : data.getRows()) {
                for (String cellData : row) {
                    PdfPCell cell = new PdfPCell(new Phrase(cellData != null ? cellData : "", rowFont));
                    table.addCell(cell);
                }
            }

            document.add(table);
            document.close();

        } catch (Exception e) {
            throw new RuntimeException("Failed to write PDF file", e);
        }

        return "/uploads/reports/" + filename;
    }

    private String generateFilename(String prefix, String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return prefix.toLowerCase().replace(" ", "_") + "_" + timestamp + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;
    }

    private List<String> escapeSpecialCharacters(List<String> data) {
        return data.stream()
                .map(s -> s == null ? "" : s)
                .map(s -> {
                    String escapedData = s.replaceAll("\\R", " ");
                    if (s.contains(",") || s.contains("\"") || s.contains("'")) {
                        escapedData = escapedData.replace("\"", "\"\"");
                        escapedData = "\"" + escapedData + "\"";
                    }
                    return escapedData;
                }).toList();
    }
}
