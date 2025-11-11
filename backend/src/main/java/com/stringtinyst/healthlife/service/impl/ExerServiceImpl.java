package com.stringtinyst.healthlife.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.stringtinyst.healthlife.mapper.ExerMapper;
import com.stringtinyst.healthlife.pojo.Exer;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.service.ExerService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExerServiceImpl implements ExerService {
  @Autowired private ExerMapper exerMapper;

  @Override
  public PageBean page(
      Integer page,
      Integer pageSize,
      String userID,
      LocalDate startDate,
      LocalDate endDate,
      String exerciseType) {
    PageHelper.startPage(page, pageSize);
    List<Exer> exerList = exerMapper.list(userID, startDate, endDate, exerciseType);
    Page<Exer> p = (Page<Exer>) exerList;
    PageBean pageBean = new PageBean(p.getTotal(), p.getResult());
    return pageBean;
  }

  @Override
  public void addExer(Exer exer) {
    exerMapper.insertExer(exer);
  }

  @Override
  public int searchExerItemID(Exer exer) {
    return exerMapper.searchExerItemID(exer);
  }

  @Override
  public Exer getByExerItemID(int exerciseItemID) {
    return exerMapper.getByExerItemID(exerciseItemID);
  }

  @Override
  public void updateExer(Exer exer) {
    exerMapper.updateExer(exer);
  }

  @Override
  public void deleteExer(int exerciseItemID) {
    exerMapper.deleteExer(exerciseItemID);
  }
}
