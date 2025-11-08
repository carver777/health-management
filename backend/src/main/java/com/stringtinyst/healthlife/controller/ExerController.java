package com.stringtinyst.healthlife.controller;

import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.pojo.Result;
import com.stringtinyst.healthlife.service.ExerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import com.stringtinyst.healthlife.pojo.Exer;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/exercise-items")
public class ExerController {
    @Autowired
    private ExerService exerService;

    @GetMapping
    public Result page(@RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize,
                       @RequestParam String userID,
                       @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                       @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
                       @RequestParam(required = false) String exerciseType) {
        PageBean pageBean = exerService.page(page, pageSize, userID,startDate, endDate, exerciseType);
        return Result.success(pageBean);
    }
        @GetMapping("/{exerciseItemID}")
    public Result getExerciseItem(@PathVariable int exerciseItemID) {
        Exer exer = exerService.getByExerItemID(exerciseItemID);
        return Result.success(exer);
    }
    
    @PostMapping
    public Result addExer(@RequestBody Exer exer) {
        exerService.addExer(exer);
        int exerItemID = exerService.searchExerItemID(exer);
        return Result.success(exerItemID);
    }
    
    @PutMapping("/{exerciseItemID}")
    public Result updateExer(@PathVariable int exerciseItemID, @RequestBody Exer exer) {
        exer.setExerciseItemID(exerciseItemID);
        exerService.updateExer(exer);
        return Result.success();
    }
    
    @DeleteMapping("/{exerciseItemID}")
    public Result deleteExer(@PathVariable int exerciseItemID) {
        exerService.deleteExer(exerciseItemID);
        return Result.success();
    }


}
