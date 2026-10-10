package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.Template;
import com.testModule.TestModule.Model.Topic;
import com.testModule.TestModule.Repository.ProblemRepository;
import com.testModule.TestModule.Repository.TemplateRepository;
import com.testModule.TestModule.Repository.TopicRepository;
import com.testModule.TestModule.dto.TemplateWriteRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
public class TemplateCommandService {

    private static final int MAX_NAME_LENGTH = 255;
    private static final int MAX_COLLECTION_SIZE = 1000;
    private static final Set<Integer> SUPPORTED_LANGUAGE_IDS = Set.of(62, 71);

    private final TemplateRepository templateRepository;
    private final TopicRepository topicRepository;
    private final ProblemRepository problemRepository;

    public TemplateCommandService(
            TemplateRepository templateRepository,
            TopicRepository topicRepository,
            ProblemRepository problemRepository
    ) {
        this.templateRepository = templateRepository;
        this.topicRepository = topicRepository;
        this.problemRepository = problemRepository;
    }

    @Transactional
    public Template create(TemplateWriteRequest request) {
        Template template = new Template();
        apply(template, request);
        return templateRepository.save(template);
    }

    @Transactional
    public Template update(Long id, TemplateWriteRequest request) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy template."));
        apply(template, request);
        return templateRepository.save(template);
    }

    @Transactional
    public void delete(Long id) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy template."));
        List<Problem> linked = problemRepository.findByTemplate_Id(id);
        for (Problem problem : linked) {
            problem.setTemplate(null);
        }
        problemRepository.saveAll(linked);
        templateRepository.delete(template);
    }

    private void apply(Template template, TemplateWriteRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu dữ liệu template.");
        }

        String name = requireText(request.name(), "Tên bài tập mẫu");
        if (name.length() < 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên bài tập mẫu phải có ít nhất 3 ký tự.");
        }
        if (name.length() > MAX_NAME_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên bài tập mẫu quá dài.");
        }

        String topicName = requireText(request.topic(), "Chủ đề");
        String level = requireText(request.level(), "Trình độ");
        String statement = requireText(request.statementPattern(), "Mô tả bài tập mẫu");
        String solution = requireText(request.referenceSolutionCode(), "Lời giải mẫu");

        if (request.generatorType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa chọn loại dữ liệu sinh ngẫu nhiên.");
        }
        if (request.languageId() == null || !SUPPORTED_LANGUAGE_IDS.contains(request.languageId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngôn ngữ lời giải phải là Java hoặc Python.");
        }

        template.setName(name);
        template.setTopic(findOrCreateTopic(topicName));
        template.setLevel(level);
        template.setGeneratorType(request.generatorType());
        template.setStatementPattern(statement);
        template.setReferenceSolutionCode(solution);
        template.setLanguageId(request.languageId());
        applyBounds(template, request);
    }

    private void applyBounds(Template template, TemplateWriteRequest request) {
        switch (request.generatorType()) {
            case TWO_INTEGERS -> {
                requireRange(request.minValue(), request.maxValue(), "Giá trị phần tử", Integer.MIN_VALUE, Integer.MAX_VALUE);
                template.setMinValue(request.minValue());
                template.setMaxValue(request.maxValue());
                template.setMinN(null);
                template.setMaxN(null);
            }
            case INTEGER_ARRAY -> {
                requireRange(request.minN(), request.maxN(), "Số lượng phần tử", 1, MAX_COLLECTION_SIZE);
                requireRange(request.minValue(), request.maxValue(), "Giá trị phần tử", Integer.MIN_VALUE, Integer.MAX_VALUE);
                template.setMinN(request.minN());
                template.setMaxN(request.maxN());
                template.setMinValue(request.minValue());
                template.setMaxValue(request.maxValue());
            }
            case STRING_BASIC -> {
                requireRange(request.minN(), request.maxN(), "Độ dài chuỗi", 1, MAX_COLLECTION_SIZE);
                template.setMinN(request.minN());
                template.setMaxN(request.maxN());
                template.setMinValue(null);
                template.setMaxValue(null);
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại dữ liệu sinh ngẫu nhiên không được hỗ trợ.");
        }
    }

    private Topic findOrCreateTopic(String name) {
        return topicRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Topic topic = new Topic();
            topic.setName(name);
            topic.setColorTag("#3B82F6");
            return topicRepository.save(topic);
        });
    }

    private static String requireText(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " không được để trống.");
        }
        return value.trim();
    }

    private static void requireRange(Integer min, Integer max, String label, int lowest, int highest) {
        if (min == null || max == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " cần cả giá trị nhỏ nhất và lớn nhất.");
        }
        if (min < lowest || max > highest) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " nằm ngoài khoảng cho phép.");
        }
        if (min > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + ": giá trị nhỏ nhất không được lớn hơn giá trị lớn nhất.");
        }
    }
}
