package com.testModule.TestModule.Repository;


import com.testModule.TestModule.Model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TopicRepository extends JpaRepository<Topic, Long> {
}
