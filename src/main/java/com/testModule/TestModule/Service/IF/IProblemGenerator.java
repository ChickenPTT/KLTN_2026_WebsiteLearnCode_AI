package com.testModule.TestModule.Service.IF;

import com.testModule.TestModule.Model.Problem;

public interface IProblemGenerator {
        public Problem generateVariant(Long templateId, boolean useAiParaphrase);
 }
