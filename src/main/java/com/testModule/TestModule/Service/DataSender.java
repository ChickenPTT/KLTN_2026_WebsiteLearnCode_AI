package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.Template;
import com.testModule.TestModule.Model.TestCaseEntity;
import com.testModule.TestModule.Model.Topic;
import com.testModule.TestModule.Repository.ProblemRepository;
import com.testModule.TestModule.Repository.TemplateRepository;
import com.testModule.TestModule.Repository.TopicRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSender implements CommandLineRunner {

    private final ProblemRepository problemRepository;
    private final TopicRepository topicRepository;
    private final TemplateRepository templateRepository;
    public DataSender(ProblemRepository problemRepository, TopicRepository topicRepository, TemplateRepository templateRepository) {
        this.problemRepository = problemRepository;
        this.topicRepository = topicRepository;
        this.templateRepository = templateRepository;
    }

    @Override
    public void run(String... args) {

        // Seed Problem mẫu — chỉ chạy nếu bảng problems đang trống
        if (problemRepository.count() == 0) {
            Problem sumProblem = new Problem();
            sumProblem.setStatement("Đọc 2 số nguyên cách nhau bởi dấu cách, in ra tổng của chúng.");
            sumProblem.setLanguageId(71);
            sumProblem.setTopic("basic");
            sumProblem.setLevel("easy");

            TestCaseEntity t1 = new TestCaseEntity();
            t1.setInput("3 5"); t1.setExpectedOutput("8"); t1.setProblem(sumProblem);
            TestCaseEntity t2 = new TestCaseEntity();
            t2.setInput("10 20"); t2.setExpectedOutput("30"); t2.setProblem(sumProblem);
            TestCaseEntity t3 = new TestCaseEntity();
            t3.setInput("-1 1"); t3.setExpectedOutput("0"); t3.setProblem(sumProblem);
            sumProblem.setTestCases(List.of(t1, t2, t3));
            problemRepository.save(sumProblem);

            Problem sortProblem = new Problem();
            sortProblem.setStatement("Cho mảng gồm n số nguyên. Sắp xếp tăng dần. "
                    + "Input: dòng 1 là n, dòng 2 là n số nguyên cách nhau bởi dấu cách. "
                    + "Output: mảng đã sắp xếp, cách nhau bởi dấu cách.");
            sortProblem.setLanguageId(71);
            sortProblem.setTopic("array");
            sortProblem.setLevel("easy");

            TestCaseEntity s1 = new TestCaseEntity();
            s1.setInput("5\n3 1 4 1 5"); s1.setExpectedOutput("1 1 3 4 5"); s1.setProblem(sortProblem);
            TestCaseEntity s2 = new TestCaseEntity();
            s2.setInput("3\n9 8 7"); s2.setExpectedOutput("7 8 9"); s2.setProblem(sortProblem);
            sortProblem.setTestCases(List.of(s1, s2));
            problemRepository.save(sortProblem);

            System.out.println("Đã nạp " + problemRepository.count() + " bài mẫu vào database.");
        }

        if (templateRepository.count() == 0) {
            Topic arrayTopic = new Topic();
            arrayTopic.setName("Mảng");
            arrayTopic.setColorTag("#3B82F6");
            topicRepository.save(arrayTopic);

            Template sortTemplate = new Template();
            sortTemplate.setName("Sắp xếp mảng tăng dần");
            sortTemplate.setTopic(arrayTopic);
            sortTemplate.setLevel("easy");
            sortTemplate.setGeneratorType(Template.GeneratorType.INTEGER_ARRAY);
            sortTemplate.setMinN(3);
            sortTemplate.setMaxN(8);
            sortTemplate.setMinValue(-50);
            sortTemplate.setMaxValue(50);
            sortTemplate.setStatementPattern(
                    "Cho một mảng gồm n số nguyên. Hãy sắp xếp mảng theo thứ tự tăng dần. "
                            + "Input: dòng 1 là n, dòng 2 là n số nguyên cách nhau bởi dấu cách. "
                            + "Output: mảng đã sắp xếp, cách nhau bởi dấu cách."
            );
            sortTemplate.setReferenceSolutionCode(
                    "n = int(input())\n"
                            + "arr = list(map(int, input().split()))\n"
                            + "arr.sort()\n"
                            + "print(' '.join(map(str, arr)))"
            );
            sortTemplate.setLanguageId(71);
            templateRepository.save(sortTemplate);

            System.out.println("Đã nạp 1 topic và 1 template mẫu vào database.");
        }
    }
}