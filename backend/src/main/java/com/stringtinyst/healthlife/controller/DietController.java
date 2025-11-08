package com.stringtinyst.healthlife.controller;

import com.stringtinyst.healthlife.pojo.Diet;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.pojo.Result;
import com.stringtinyst.healthlife.service.DietService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/diet-items")
public class DietController {
    @Autowired
    private DietService dietService;

    @GetMapping
    public Result page(@RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize,
                       @RequestParam String userID,
                       @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                       @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
                       @RequestParam(required = false) String mealType){
        PageBean pageBean = dietService.page(page, pageSize,userID,startDate,endDate,mealType);
        return Result.success(pageBean);
    }
    @GetMapping("/{dietItemID}")
    public Result getDietItem(@PathVariable int dietItemID) {
        log.info("Fetching diet item with ID: {}", dietItemID);
        Diet diet = dietService.getByDietItemByID(dietItemID);
        return Result.success(diet);
    }
    
    @PostMapping
    public Result addDiet(@RequestBody Diet diet) {
        log.info("Adding new diet item for user: {}", diet.getUserID());
        dietService.addDiet(diet);
        int dietItemID = dietService.searchdietItemID(diet);
        return Result.success(dietItemID);
    }
    
    /**
     * Update a diet item
     */
    @PutMapping("/{dietItemID}")
    public Result updateDiet(@PathVariable int dietItemID, @RequestBody Diet diet) {
        log.info("Updating diet item with ID: {}", dietItemID);
        diet.setDietItemID(dietItemID);
        dietService.updateDiet(diet);
        return Result.success();
    }
    
    @DeleteMapping("/{dietItemID}")
    public Result deleteDiet(@PathVariable int dietItemID) {
        log.info("Deleting diet item with ID: {}", dietItemID);
        dietService.deleteDiet(dietItemID);
        return Result.success();
    }
}
