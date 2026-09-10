package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Service.ProblemGeneratorService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/template")
public class TemplateController {

    private final ProblemGeneratorService problemGeneratorService;

    public TemplateController(ProblemGeneratorService problemGeneratorService) {
        this.problemGeneratorService = problemGeneratorService;
    }

    @PostMapping("/generate")
    public Problem generate(@RequestBody Map<String, Object> body) {
        Long templateId = Long.valueOf(body.get("template_id").toString());
        boolean useAiParaphrase = body.containsKey("use_ai_paraphrase")
                && Boolean.parseBoolean(body.get("use_ai_paraphrase").toString());

        return problemGeneratorService.generateVariant(templateId, useAiParaphrase);
    }
}