package com.nexushr.ai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

/**
 * Mock AI provider that returns rule-based insights without requiring
 * any external API key. Replace with OpenAiProvider, GeminiProvider, etc.
 * by implementing the AiProvider interface and marking it @Primary.
 */
@Slf4j
@Component
public class MockAiProvider implements AiProvider {

    private final Random random = new Random();

    private static final List<String> WORKFORCE_INSIGHTS = List.of(
            "Based on current attendance patterns, the Engineering department shows consistently high engagement with 94% attendance rate. Consider recognizing top performers.",
            "Analysis indicates that 3 employees in the Finance department have not taken any leave in the past quarter. This may indicate workload concerns or potential burnout risk.",
            "The average tenure in the Sales department is below the organization average. Consider implementing retention programs such as mentorship or career development plans.",
            "Performance review data suggests that employees who received regular 1-on-1 meetings showed 23% higher performance scores. Recommend increasing manager check-in frequency.",
            "Salary benchmarking analysis shows the Engineering team's compensation is 8% below market median. This may contribute to attrition risk for senior engineers.",
            "Leave utilization patterns show a significant spike in casual leaves around quarter-end. This may correlate with project deadline stress. Consider workload redistribution.",
            "Cross-departmental collaboration metrics indicate that teams with diverse skill sets show 15% higher project delivery rates. Consider cross-functional project assignments.",
            "Employee satisfaction proxy indicators (attendance consistency, leave balance usage, performance trajectory) suggest overall organizational health score of 78/100."
    );

    private static final List<String> ATTRITION_INSIGHTS = List.of(
            "High attrition risk detected: Employee has shown declining attendance pattern over the past 3 months combined with below-average performance ratings.",
            "Moderate attrition risk: Employee's compensation is significantly below market rate for their role and experience level. Consider salary adjustment.",
            "Low-moderate risk: Employee has been in the same role for 3+ years without promotion. Consider career growth discussion.",
            "Risk factors identified: Recent increase in unplanned leaves, reduced participation in team activities, and stagnant performance scores."
    );

    private static final List<String> RECOMMENDATIONS = List.of(
            "Implement a structured onboarding buddy program to improve new hire retention by an estimated 25%.",
            "Consider quarterly skill-development workshops aligned with industry trends to boost employee engagement.",
            "Data suggests introducing flexible work arrangements could reduce absenteeism by 15-20%.",
            "Recommend establishing an internal job posting system to facilitate career mobility and reduce external attrition.",
            "Analysis shows that team-building activities correlate with a 12% improvement in cross-team collaboration metrics.",
            "Consider implementing a peer recognition platform to improve workplace morale and engagement scores."
    );

    @Override
    public String generateInsight(String prompt) {
        log.debug("[MockAI] Generating insight for prompt: {}", prompt.substring(0, Math.min(100, prompt.length())));

        if (prompt.toLowerCase().contains("attrition") || prompt.toLowerCase().contains("retention")) {
            return ATTRITION_INSIGHTS.get(random.nextInt(ATTRITION_INSIGHTS.size()));
        }
        if (prompt.toLowerCase().contains("recommend")) {
            return RECOMMENDATIONS.get(random.nextInt(RECOMMENDATIONS.size()));
        }
        return WORKFORCE_INSIGHTS.get(random.nextInt(WORKFORCE_INSIGHTS.size()));
    }

    @Override
    public double predictAttritionRisk(String employeeDataJson) {
        log.debug("[MockAI] Predicting attrition risk");
        // Simulate a risk score based on simple heuristics
        // In production, this would call an ML model or LLM
        return 0.1 + (random.nextDouble() * 0.6); // Returns 0.1 to 0.7
    }

    @Override
    public String getProviderName() {
        return "MockAI (Rule-Based)";
    }
}
