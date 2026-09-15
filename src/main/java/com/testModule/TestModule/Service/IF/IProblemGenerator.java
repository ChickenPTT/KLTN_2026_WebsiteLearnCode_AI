package com.testModule.TestModule.Service.IF;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.Template;

public interface IProblemGenerator {
        public Problem generateVariant(Long templateId, boolean useAiParaphrase);
        public String generateInput(Template template);
}
