package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.Topic;
import com.testModule.TestModule.Repository.TopicRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicRepository topicRepository;

    public TopicController(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    @GetMapping
    public List<Topic> listTopics() {
        return topicRepository.findAll(Sort.by("name"));
    }
}
