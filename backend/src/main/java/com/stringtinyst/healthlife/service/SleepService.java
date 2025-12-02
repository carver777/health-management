package com.stringtinyst.healthlife.service;

import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.pojo.Sleep;
import java.time.LocalDate;

public interface SleepService {
  void addSleep(Sleep sleep);

  PageBean page(
      Integer page, Integer pageSize, String userID, LocalDate startDate, LocalDate endDate);

  Sleep getBySleepItemID(int sleepItemID);

  void updateSleep(Sleep sleep);

  void deleteSleep(int sleepItemID);
}
