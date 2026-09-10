package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.Template;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TemplateRepository extends JpaRepository<Template, Long> {
}
