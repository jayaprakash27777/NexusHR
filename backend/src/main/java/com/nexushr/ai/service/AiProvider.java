package com.nexushr.ai.service;

/**
 * Swappable AI provider interface.
 * Implement this interface to integrate real AI (OpenAI, Gemini, etc.)
 * Currently uses MockAiProvider which generates rule-based insights.
 */
public interface AiProvider {

    /**
     * Generate a text insight/recommendation based on a prompt.
     * @param prompt the analytics prompt
     * @return AI-generated text response
     */
    String generateInsight(String prompt);

    /**
     * Predict attrition risk score (0.0 to 1.0) based on employee data.
     * @param employeeDataJson JSON string with employee metrics
     * @return risk score between 0.0 (no risk) and 1.0 (high risk)
     */
    double predictAttritionRisk(String employeeDataJson);

    /**
     * @return the name of this AI provider
     */
    String getProviderName();
}
