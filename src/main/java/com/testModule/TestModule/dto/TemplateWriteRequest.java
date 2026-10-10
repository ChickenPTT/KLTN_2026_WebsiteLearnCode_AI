package com.testModule.TestModule.dto;

import com.testModule.TestModule.Model.Template;

public record TemplateWriteRequest(
        String name,
        String topic,
        String level,
        Template.GeneratorType generatorType,
        Integer minN,
        Integer maxN,
        Integer minValue,
        Integer maxValue,
        String statementPattern,
        String referenceSolutionCode,
        Integer languageId
) {
}
