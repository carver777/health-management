package com.stringtinyst.healthlife.controller;

import com.stringtinyst.healthlife.pojo.Body;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.pojo.Result;
import com.stringtinyst.healthlife.service.BodyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/body-metrics")
public class BodyController {

    @Autowired
    private BodyService bodyService;

    @GetMapping
    public Result page(@RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize,
                       @RequestParam String userID,
                       @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                       @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate){
        PageBean pageBean = bodyService.page(page, pageSize,userID,startDate,endDate);
        return Result.success(pageBean);
    }

    @GetMapping("/{bodyMetricID}")
    public Result getBodyMetric(@PathVariable int bodyMetricID) {
        Body body = bodyService.getByBodyID(bodyMetricID);
        return Result.success(body);
    }

    @PostMapping
    public Result addBody(@RequestBody Body body) {
        bodyService.addBody(body);
        int bodyMetricID = bodyService.searchbodyID(body);
        return Result.success(bodyMetricID);
    }

    @PutMapping("/{bodyMetricID}")
    public Result updateBody(@PathVariable int bodyMetricID, @RequestBody Body body) {
        body.setBodyMetricID(bodyMetricID);
        bodyService.updateBody(body);
        return Result.success();
    }

    @DeleteMapping("/{bodyMetricID}")
    public Result deleteBody(@PathVariable int bodyMetricID) {
        bodyService.deleteBody(bodyMetricID);
        return Result.success();
    }
}
