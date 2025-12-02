package com.stringtinyst.healthlife.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.stringtinyst.healthlife.mapper.SleepMapper;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.pojo.Sleep;
import com.stringtinyst.healthlife.service.SleepService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SleepServiceImpl implements SleepService {

  @Autowired private SleepMapper sleepMapper;

  @Override
  public void addSleep(Sleep sleep) {
    sleepMapper.insertSleep(sleep);
  }

  @Override
  public PageBean page(
      Integer page, Integer pageSize, String userID, LocalDate startDate, LocalDate endDate) {
    PageHelper.startPage(page, pageSize);
    List<Sleep> sleepList = sleepMapper.list(userID, startDate, endDate);
    Page<Sleep> sleepPage = (Page<Sleep>) sleepList;
    return new PageBean(sleepPage.getTotal(), sleepPage.getResult());
  }

  @Override
  public Sleep getBySleepItemID(int sleepItemID) {
    return sleepMapper.getBySleepItemID(sleepItemID);
  }

  @Override
  public void updateSleep(Sleep sleep) {
    sleepMapper.updateSleep(sleep);
  }

  @Override
  public void deleteSleep(int sleepItemID) {
    sleepMapper.deleteSleep(sleepItemID);
  }
}
