package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.Template;
import com.testModule.TestModule.Repository.TemplateRepository;
import com.testModule.TestModule.Service.ProblemGeneratorService;
import com.testModule.TestModule.Service.TemplateCommandService;
import com.testModule.TestModule.dto.ProblemView;
import com.testModule.TestModule.dto.TemplateWriteRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/template")
public class TemplateController {

    private final ProblemGeneratorService problemGeneratorService;
    private final TemplateRepository templateRepository;
    private final TemplateCommandService templateCommandService;

    public TemplateController(
            ProblemGeneratorService problemGeneratorService,
            TemplateRepository templateRepository,
            TemplateCommandService templateCommandService
    ) {
        this.problemGeneratorService = problemGeneratorService;
        this.templateRepository = templateRepository;
        this.templateCommandService = templateCommandService;
    }

//    Danh sach template de chon khi sinh de
    @GetMapping
    public List<Template> listTemplates() {
        return templateRepository.findAll(Sort.by("id"));
    }

    @PostMapping("/generate")
    public ProblemView generate(@RequestBody Map<String, Object> body) {
        if (body == null || body.get("template_id") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu template_id.");
        }
        Long templateId = Long.valueOf(body.get("template_id").toString());
        boolean useAiParaphrase = body.containsKey("use_ai_paraphrase")
                && Boolean.parseBoolean(body.get("use_ai_paraphrase").toString());

        Problem problem = problemGeneratorService.generateVariant(templateId, useAiParaphrase);
        return ProblemView.from(problem);
    }

    @PostMapping
    public Template create(@RequestBody TemplateWriteRequest body) {
        return templateCommandService.create(body);
    }

    @PutMapping("/{id}")
    public Template update(@PathVariable Long id, @RequestBody TemplateWriteRequest body) {
        return templateCommandService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        templateCommandService.delete(id);
    }
}
