package com.nexushr.config;

import com.nexushr.attendance.model.Attendance;
import com.nexushr.attendance.model.AttendanceStatus;
import com.nexushr.attendance.repository.AttendanceRepository;
import com.nexushr.auth.model.Role;
import com.nexushr.auth.model.User;
import com.nexushr.auth.model.UserRole;
import com.nexushr.auth.model.UserRoleKey;
import com.nexushr.auth.repository.RoleRepository;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.department.model.Department;
import com.nexushr.department.repository.DepartmentRepository;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.model.EmployeeStatus;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.leave.model.LeaveBalance;
import com.nexushr.leave.model.LeaveType;
import com.nexushr.leave.repository.LeaveBalanceRepository;
import com.nexushr.payroll.model.Payroll;
import com.nexushr.payroll.model.PayrollStatus;
import com.nexushr.payroll.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PayrollRepository payrollRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        LocalDate today = LocalDate.now();
        Random random = new Random();

        // One-time backfill script for new mandatory fields
        List<Employee> allEmployees = employeeRepository.findAll();
        boolean needsUpdate = false;
        for (Employee emp : allEmployees) {
            if (emp.getEmploymentType() == null || emp.getPanNumber() == null) {
                needsUpdate = true;
                emp.setEmploymentType(com.nexushr.employee.model.EmploymentType.FULL_TIME);
                emp.setPanNumber("ABCDE" + (1000 + random.nextInt(9000)) + "F");
                emp.setPfNumber("MH/BAN/" + (10000 + random.nextInt(90000)) + "/" + (100 + random.nextInt(900)));
                emp.setEsiNumber("31" + (10000000 + random.nextInt(90000000)));
                emp.setUanNumber("100" + (100000000 + random.nextInt(900000000)));
                emp.setPermanentAddress("123 Permanent St, Apt " + random.nextInt(100) + ", City, State, 10001");
                emp.setBankName(new String[]{"HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank"}[random.nextInt(5)]);
                emp.setBankAccountNumber(String.format("%012d", random.nextLong(100000000000L)));
                
                if (emp.getUser() != null) {
                    emp.getUser().setMfaEnabled(random.nextBoolean());
                    emp.getUser().setLastSeenAt(LocalDateTime.now().minusHours(random.nextInt(48)));
                    userRepository.save(emp.getUser());
                }
            }
        }
        if (needsUpdate) {
            log.info("Backfilling existing employees with new mandatory fields...");
            employeeRepository.saveAll(allEmployees);
        }

        if (employeeRepository.count() > 10 && attendanceRepository.count() < employeeRepository.count() * 60) {
            log.info("Regenerating attendance for all employees (90 days)...");
            attendanceRepository.deleteAllInBatch();
            List<Employee> employees = employeeRepository.findAll().stream().distinct().toList();
            for (Employee employee : employees) {
                // 5. Generate Attendance for Last 90 Days
                LocalDate startDate = today.minusDays(90);
                for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
                    if (date.getDayOfWeek().getValue() <= 5) { // Weekday
                        int chance = random.nextInt(100);
                        AttendanceStatus status;
                        if (chance < 80) status = AttendanceStatus.PRESENT;
                        else if (chance < 85) status = AttendanceStatus.WORK_FROM_HOME;
                        else if (chance < 90) status = AttendanceStatus.HALF_DAY;
                        else if (chance < 95) status = AttendanceStatus.ON_LEAVE;
                        else status = AttendanceStatus.ABSENT;

                        LocalDateTime checkIn = null;
                        LocalDateTime checkOut = null;
                        BigDecimal workHours = BigDecimal.ZERO;

                        if (status == AttendanceStatus.PRESENT || status == AttendanceStatus.WORK_FROM_HOME) {
                            checkIn = date.atTime(8 + random.nextInt(2), random.nextInt(60));
                            if (date.isBefore(today)) {
                                checkOut = checkIn.plusHours(8).plusMinutes(random.nextInt(60));
                                workHours = BigDecimal.valueOf(8.5);
                            }
                        } else if (status == AttendanceStatus.HALF_DAY) {
                            checkIn = date.atTime(8 + random.nextInt(2), random.nextInt(60));
                            if (date.isBefore(today)) {
                                checkOut = checkIn.plusHours(4).plusMinutes(random.nextInt(30));
                                workHours = BigDecimal.valueOf(4.0);
                            }
                        }

                        Attendance attendance = Attendance.builder()
                                .employee(employee)
                                .date(date)
                                .checkInTime(checkIn)
                                .checkOutTime(checkOut)
                                .status(status)
                                .workHours(workHours)
                                .build();
                        attendanceRepository.save(attendance);
                    }
                }
            }
            log.info("Finished regenerating 90 days attendance.");
        }

        if (employeeRepository.count() > 10) {
            log.info("Database already seeded with employees. Skipping seeder.");
            return;
        }
        
        log.info("Starting Database Seeder... Generating 60 Employees");
        String defaultPassword = passwordEncoder.encode("1234");

        // Ensure roles exist
        Role employeeRole = roleRepository.findByName("ROLE_EMPLOYEE").orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_EMPLOYEE").description("Standard Employee").build()));
        Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN").orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_SUPER_ADMIN").description("Super Admin").isSystem(true).build()));
        Role hrDirectorRole = roleRepository.findByName("ROLE_HR_DIRECTOR").orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_HR_DIRECTOR").description("HR Director").isSystem(true).build()));
        Role financeManagerRole = roleRepository.findByName("ROLE_FINANCE_MANAGER").orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_FINANCE_MANAGER").description("Finance Manager").isSystem(true).build()));
        Role deptManagerRole = roleRepository.findByName("ROLE_DEPARTMENT_MANAGER").orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_DEPARTMENT_MANAGER").description("Dept Manager").isSystem(true).build()));
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").description("Admin").isSystem(true).build()));
        Role hrExecutiveRole = roleRepository.findByName("ROLE_HR_EXECUTIVE").orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_HR_EXECUTIVE").description("HR Executive").isSystem(true).build()));
        Role teamLeadRole = roleRepository.findByName("ROLE_TEAM_LEAD").orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_TEAM_LEAD").description("Team Lead").isSystem(true).build()));
        Role auditorRole = roleRepository.findByName("ROLE_AUDITOR").orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_AUDITOR").description("Auditor").isSystem(true).build()));

        // Ensure departments exist
        List<Department> departments = departmentRepository.findAll();
        if (departments.isEmpty()) {
            departments.add(departmentRepository.save(Department.builder().name("Engineering").code("ENG").active(true).build()));
            departments.add(departmentRepository.save(Department.builder().name("Human Resources").code("HR").active(true).build()));
            departments.add(departmentRepository.save(Department.builder().name("Sales").code("SAL").active(true).build()));
            departments.add(departmentRepository.save(Department.builder().name("Marketing").code("MKT").active(true).build()));
            departments.add(departmentRepository.save(Department.builder().name("Finance").code("FIN").active(true).build()));
        }

        String[] firstNames = {"John", "Jane", "Michael", "Sarah", "David", "Emily", "James", "Emma", "William", "Olivia", "Robert", "Sophia", "Joseph", "Isabella", "Thomas", "Mia", "Charles", "Charlotte", "Daniel", "Amelia"};
        String[] lastNames = {"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"};
        String[] designations = {"Software Engineer", "HR Specialist", "Sales Representative", "Marketing Analyst", "Financial Advisor", "Product Manager", "QA Tester", "Data Scientist", "UX Designer", "Accountant"};

        List<Employee> generatedEmployees = new ArrayList<>();
        YearMonth currentYm = YearMonth.now();

        for (int i = 1; i <= 60; i++) {
            String firstName = firstNames[random.nextInt(firstNames.length)];
            String lastName = lastNames[random.nextInt(lastNames.length)];
            String email = firstName.toLowerCase() + "." + lastName.toLowerCase() + i + "@nexushr.com";
            
            if (i == 1) email = "superadmin@nexushr.com";
            if (i == 2) email = "admin@nexushr.com";
            if (i == 3) email = "hrdirector@nexushr.com";
            if (i == 4) email = "hrexecutive@nexushr.com";
            if (i == 5) email = "financemanager@nexushr.com";
            if (i == 6) email = "deptmanager@nexushr.com";
            if (i == 7) email = "teamlead@nexushr.com";
            if (i == 8) email = "auditor@nexushr.com";
            if (i == 9) email = "employee1@nexushr.com";
            if (i == 10) email = "employee2@nexushr.com";
            
            // 1. Create User
            User user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(defaultPassword)
                    .phone("555-01" + String.format("%02d", i))
                    .active(true)
                    .emailVerified(true)
                    .build();
            user = userRepository.save(user);

            Role assignedRole;
            String assignedDesignation;
            Department assignedDept = departments.get(random.nextInt(departments.size()));

            if (i == 1) {
                assignedRole = superAdminRole;
                assignedDesignation = "CEO";
            } else if (i == 2) {
                assignedRole = adminRole;
                assignedDesignation = "Admin";
            } else if (i == 3) {
                assignedRole = hrDirectorRole;
                assignedDesignation = "HR Director";
                assignedDept = departments.stream().filter(d -> d.getCode().equals("HR")).findFirst().orElse(assignedDept);
            } else if (i == 4) {
                assignedRole = hrExecutiveRole;
                assignedDesignation = "HR Executive";
                assignedDept = departments.stream().filter(d -> d.getCode().equals("HR")).findFirst().orElse(assignedDept);
            } else if (i == 5) {
                assignedRole = financeManagerRole;
                assignedDesignation = "Finance Manager";
                assignedDept = departments.stream().filter(d -> d.getCode().equals("FIN")).findFirst().orElse(assignedDept);
            } else if (i == 6) {
                assignedRole = deptManagerRole;
                assignedDesignation = "Department Head";
            } else if (i == 7) {
                assignedRole = teamLeadRole;
                assignedDesignation = "Team Lead";
            } else if (i == 8) {
                assignedRole = auditorRole;
                assignedDesignation = "Auditor";
            } else if (i == 9 || i == 10) {
                assignedRole = employeeRole;
                assignedDesignation = "Software Engineer";
            } else {
                assignedRole = employeeRole;
                assignedDesignation = designations[random.nextInt(designations.length)];
            }

            UserRoleKey key = new UserRoleKey(user.getId(), assignedRole.getId());
            UserRole userRole = UserRole.builder().id(key).user(user).role(assignedRole).build();
            user.getUserRoles().add(userRole);
            user = userRepository.save(user);

            // 3. Create Employee
            BigDecimal salary = BigDecimal.valueOf(50000 + random.nextInt(70000));
            if (i <= 10) salary = salary.add(BigDecimal.valueOf(50000));
            
            // Random join date within last 2 years, make sure 5 are from this month
            LocalDate joinDate;
            if (i <= 5) {
                joinDate = currentYm.atDay(1); // new hire
            } else {
                joinDate = today.minusDays(random.nextInt(700) + 30);
            }

            Employee employee = Employee.builder()
                    .employeeId("EMP-" + String.format("%04d", i))
                    .user(user)
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .phone(user.getPhone())
                    .gender(random.nextBoolean() ? "Male" : "Female")
                    .department(assignedDept)
                    .designation(assignedDesignation)
                    .salary(salary)
                    .joiningDate(joinDate)
                    .status(EmployeeStatus.ACTIVE)
                    .employmentType(com.nexushr.employee.model.EmploymentType.FULL_TIME)
                    .panNumber("ABCDE" + (1000 + random.nextInt(9000)) + "F")
                    .pfNumber("MH/BAN/" + (10000 + random.nextInt(90000)) + "/" + (100 + random.nextInt(900)))
                    .esiNumber("31" + (10000000 + random.nextInt(90000000)))
                    .uanNumber("100" + (100000000 + random.nextInt(900000000)))
                    .permanentAddress("123 Permanent St, Apt " + random.nextInt(100) + ", City, State, 10001")
                    .bankName(new String[]{"HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank"}[random.nextInt(5)])
                    .bankAccountNumber(String.format("%012d", random.nextLong(100000000000L)))
                    .build();
            employee = employeeRepository.save(employee);
            generatedEmployees.add(employee);

            // 4. Generate Leave Balances
            LeaveBalance annual = LeaveBalance.builder().employee(employee).year(today.getYear()).leaveType(LeaveType.CASUAL_LEAVE).totalDays(BigDecimal.valueOf(20)).usedDays(BigDecimal.valueOf(random.nextInt(5))).build();
            leaveBalanceRepository.save(annual);

            LeaveBalance sick = LeaveBalance.builder().employee(employee).year(today.getYear()).leaveType(LeaveType.SICK_LEAVE).totalDays(BigDecimal.valueOf(10)).usedDays(BigDecimal.valueOf(random.nextInt(3))).build();
            leaveBalanceRepository.save(sick);

            // 5. Generate Attendance for Last 90 Days
            LocalDate startDate = today.minusDays(90);
            for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
                if (date.getDayOfWeek().getValue() <= 5) { // Weekday
                    int chance = random.nextInt(100);
                    AttendanceStatus status;
                    if (chance < 80) status = AttendanceStatus.PRESENT;
                    else if (chance < 85) status = AttendanceStatus.WORK_FROM_HOME;
                    else if (chance < 90) status = AttendanceStatus.HALF_DAY;
                    else if (chance < 95) status = AttendanceStatus.ON_LEAVE;
                    else status = AttendanceStatus.ABSENT;

                    LocalDateTime checkIn = null;
                    LocalDateTime checkOut = null;
                    BigDecimal workHours = BigDecimal.ZERO;

                    if (status == AttendanceStatus.PRESENT || status == AttendanceStatus.WORK_FROM_HOME) {
                        checkIn = date.atTime(8 + random.nextInt(2), random.nextInt(60));
                        if (date.isBefore(today)) {
                            checkOut = checkIn.plusHours(8).plusMinutes(random.nextInt(60));
                            workHours = BigDecimal.valueOf(8.5);
                        }
                    } else if (status == AttendanceStatus.HALF_DAY) {
                        checkIn = date.atTime(8 + random.nextInt(2), random.nextInt(60));
                        if (date.isBefore(today)) {
                            checkOut = checkIn.plusHours(4).plusMinutes(random.nextInt(30));
                            workHours = BigDecimal.valueOf(4.0);
                        }
                    }

                    Attendance attendance = Attendance.builder()
                            .employee(employee)
                            .date(date)
                            .checkInTime(checkIn)
                            .checkOutTime(checkOut)
                            .status(status)
                            .workHours(workHours)
                            .build();
                    attendanceRepository.save(attendance);
                }
            }

            // 6. Generate Payroll for Last 3 Months
            for (int m = 1; m <= 3; m++) {
                YearMonth pastYm = currentYm.minusMonths(m);
                BigDecimal base = employee.getSalary().divide(BigDecimal.valueOf(12), 2, java.math.RoundingMode.HALF_UP);
                BigDecimal tax = base.multiply(BigDecimal.valueOf(0.20));
                BigDecimal net = base.subtract(tax);
                
                Payroll payroll = Payroll.builder()
                        .employee(employee)
                        .month(pastYm.getMonthValue())
                        .year(pastYm.getYear())
                        .basicSalary(base)
                        .grossSalary(base)
                        .otherAllowances(BigDecimal.ZERO)
                        .totalDeductions(tax)
                        .incomeTax(tax)
                        .netSalary(net)
                        .status(PayrollStatus.PAID)
                        .paidAt(pastYm.atEndOfMonth().atStartOfDay())
                        .build();
                payrollRepository.save(payroll);
            }
        }

        // Randomly assign a manager to some employees
        for (int i = 10; i < 60; i++) {
            Employee emp = generatedEmployees.get(i);
            Employee manager = generatedEmployees.get(random.nextInt(10)); // first 10 are managers
            emp.setManager(manager);
            employeeRepository.save(emp);
        }

        log.info("Successfully Seeded 60 Employees with relational data.");
    }
}
