package com.nexushr.reports.service;

import com.nexushr.attendance.model.Attendance;
import com.nexushr.attendance.repository.AttendanceRepository;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.leave.model.LeaveRequest;
import com.nexushr.leave.repository.LeaveRequestRepository;
import com.nexushr.payroll.model.Payroll;
import com.nexushr.payroll.repository.PayrollRepository;
import com.nexushr.recruitment.model.JobApplication;
import com.nexushr.recruitment.repository.JobApplicationRepository;
import com.nexushr.reports.dto.ReportData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportDataServiceImpl implements ReportDataService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRepository payrollRepository;
    private final JobApplicationRepository jobApplicationRepository;

    @Override
    public ReportData getReportData(String reportType, Map<String, Object> filters) {
        switch (reportType.toUpperCase()) {
            case "EMPLOYEE":
                return getEmployeeReportData(filters);
            case "ATTENDANCE":
                return getAttendanceReportData(filters);
            case "LEAVE":
                return getLeaveReportData(filters);
            case "PAYROLL":
                return getPayrollReportData(filters);
            case "RECRUITMENT":
                return getRecruitmentReportData(filters);
            default:
                throw new IllegalArgumentException("Unknown report type: " + reportType);
        }
    }

    private ReportData getEmployeeReportData(Map<String, Object> filters) {
        List<Employee> employees = employeeRepository.findAll(); // Simplified for now, real implementation would apply filters
        
        List<String> headers = List.of("ID", "First Name", "Last Name", "Email", "Department", "Job Title", "Status", "Hire Date");
        List<List<String>> rows = new ArrayList<>();

        for (Employee e : employees) {
            rows.add(List.of(
                    e.getId().toString(),
                    e.getFirstName() != null ? e.getFirstName() : "",
                    e.getLastName() != null ? e.getLastName() : "",
                    e.getEmail() != null ? e.getEmail() : "",
                    e.getDepartment() != null ? e.getDepartment().getName() : "",
                    e.getDesignation() != null ? e.getDesignation() : "",
                    e.getStatus() != null ? e.getStatus().name() : "",
                    e.getJoiningDate() != null ? e.getJoiningDate().toString() : ""
            ));
        }

        return new ReportData("Employee Directory Report", headers, rows);
    }

    private ReportData getAttendanceReportData(Map<String, Object> filters) {
        List<Attendance> attendances = attendanceRepository.findAll();
        
        List<String> headers = List.of("Date", "Employee ID", "Clock In", "Clock Out", "Status", "Notes");
        List<List<String>> rows = new ArrayList<>();

        for (Attendance a : attendances) {
            rows.add(List.of(
                    a.getDate().toString(),
                    a.getEmployee().getId().toString(),
                    a.getCheckInTime() != null ? a.getCheckInTime().toString() : "",
                    a.getCheckOutTime() != null ? a.getCheckOutTime().toString() : "",
                    a.getStatus() != null ? a.getStatus().name() : "",
                    a.getNotes() != null ? a.getNotes() : ""
            ));
        }

        return new ReportData("Attendance Logs Report", headers, rows);
    }

    private ReportData getLeaveReportData(Map<String, Object> filters) {
        List<LeaveRequest> leaves = leaveRequestRepository.findAll();
        
        List<String> headers = List.of("Employee ID", "Leave Type", "Start Date", "End Date", "Status", "Reason");
        List<List<String>> rows = new ArrayList<>();

        for (LeaveRequest l : leaves) {
            rows.add(List.of(
                    l.getEmployee().getId().toString(),
                    l.getLeaveType() != null ? l.getLeaveType().name() : "",
                    l.getStartDate().toString(),
                    l.getEndDate().toString(),
                    l.getStatus() != null ? l.getStatus().name() : "",
                    l.getReason() != null ? l.getReason() : ""
            ));
        }

        return new ReportData("Leave Requests Report", headers, rows);
    }

    private ReportData getPayrollReportData(Map<String, Object> filters) {
        List<Payroll> payrolls = payrollRepository.findAll();
        
        List<String> headers = List.of("Employee ID", "Month/Year", "Gross Salary", "Net Salary", "Status", "Processed At");
        List<List<String>> rows = new ArrayList<>();

        for (Payroll p : payrolls) {
            rows.add(List.of(
                    p.getEmployee().getId().toString(),
                    p.getMonth() + "/" + p.getYear(),
                    p.getGrossSalary() != null ? p.getGrossSalary().toString() : "",
                    p.getNetSalary() != null ? p.getNetSalary().toString() : "",
                    p.getStatus() != null ? p.getStatus().name() : "",
                    p.getProcessedAt() != null ? p.getProcessedAt().toString() : ""
            ));
        }

        return new ReportData("Payroll Report", headers, rows);
    }

    private ReportData getRecruitmentReportData(Map<String, Object> filters) {
        List<JobApplication> applications = jobApplicationRepository.findAll();
        
        List<String> headers = List.of("Job Posting ID", "Candidate Name", "Candidate Email", "Status", "Applied At");
        List<List<String>> rows = new ArrayList<>();

        for (JobApplication a : applications) {
            rows.add(List.of(
                    a.getJobPosting().getId().toString(),
                    a.getCandidate().getFirstName() + " " + a.getCandidate().getLastName(),
                    a.getCandidate().getEmail(),
                    a.getStatus() != null ? a.getStatus().name() : "",
                    a.getCreatedAt() != null ? a.getCreatedAt().toString() : ""
            ));
        }

        return new ReportData("Recruitment Pipeline Report", headers, rows);
    }
}
