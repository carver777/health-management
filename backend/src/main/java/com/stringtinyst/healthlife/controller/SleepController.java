package com.stringtinyst.healthlife.controller;

import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.pojo.Result;
import com.stringtinyst.healthlife.pojo.Sleep;
import com.stringtinyst.healthlife.service.SleepService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/sleep-items")
public class SleepController {

  @Autowired private SleepService sleepService;

  @GetMapping
  public Result page(
      @RequestParam(defaultValue = "1") Integer page,
      @RequestParam(defaultValue = "10") Integer pageSize,
      @RequestParam String userID,
      @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
    PageBean pageBean = sleepService.page(page, pageSize, userID, startDate, endDate);
    return Result.success(pageBean);
  }

  @GetMapping("/{sleepItemID}")
  public Result getSleepItem(@PathVariable int sleepItemID) {
    Sleep sleep = sleepService.getBySleepItemID(sleepItemID);
    return Result.success(sleep);
  }

  @PostMapping
  public Result addSleep(@Valid @RequestBody Sleep sleep) {
    log.info("Adding sleep record for user: {}", sleep.getUserID());
    sleepService.addSleep(sleep);
    return Result.success(sleep.getSleepItemID());
  }

  @PutMapping("/{sleepItemID}")
  public Result updateSleep(@PathVariable int sleepItemID, @Valid @RequestBody Sleep sleep) {
    sleep.setSleepItemID(sleepItemID);
    sleepService.updateSleep(sleep);
    return Result.success();
  }

  @DeleteMapping("/{sleepItemID}")
  public Result deleteSleep(@PathVariable int sleepItemID) {
    sleepService.deleteSleep(sleepItemID);
    return Result.success();
  }
}
