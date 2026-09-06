package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.TestCaseEntity;
import com.testModule.TestModule.Repository.ProblemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSender implements CommandLineRunner {

    private final ProblemRepository problemRepository;

    public DataSender(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    @Override
    public void run(String... args ){
        if(problemRepository.count() > 0){
            return;
        }
//      Tong 2 so
        Problem sumProblem = new Problem();
        sumProblem.setStatement("Đọc 2 số nguyên cách nhau bởi dấu cách, in ra tổng của chúng.");
        sumProblem.setLanguageId(71);
        sumProblem.setTopic("basic");
        sumProblem.setLevel("easy");

        TestCaseEntity tc1 = new TestCaseEntity();
        tc1.setInput("3 5");
        tc1.setExpectedOutput("8");
        tc1.setProblem(sumProblem);

        TestCaseEntity tc2 = new TestCaseEntity();
        tc2.setInput("10 20");
        tc2.setExpectedOutput("30");
        tc2.setProblem(sumProblem);

        TestCaseEntity tc3 = new TestCaseEntity();
        tc3.setInput("-1 1");
        tc3.setExpectedOutput("0");
        tc3.setProblem(sumProblem);

        sumProblem.setTestCases(List.of(tc1, tc2, tc3));
        problemRepository.save(sumProblem);

//      Array
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
}