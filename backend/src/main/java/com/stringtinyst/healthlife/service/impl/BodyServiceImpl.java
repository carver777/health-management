package com.stringtinyst.healthlife.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.stringtinyst.healthlife.mapper.BodyMapper;
import com.stringtinyst.healthlife.pojo.Body;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.service.BodyService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BodyServiceImpl implements BodyService {
  @Autowired private BodyMapper bodyMapper;

  @Override
  public Body getByUserID(String userID) {
    return bodyMapper.getByUserID(userID);
  }

  @Override
  public void addBody(Body body) {
    //        body.setRecordDate(LocalDate.now());
    bodyMapper.insertBody(body);
  }

  @Override
  public PageBean page(
      Integer page, Integer pageSize, String userID, LocalDate begin, LocalDate end) {
    PageHelper.startPage(page, pageSize);

    List<Body> bodyList = bodyMapper.list(userID, begin, end);
    Page<Body> p = (Page<Body>) bodyList;
    PageBean pageBean = new PageBean(p.getTotal(), p.getResult());
    return pageBean;
  }

  @Override
  public Body getByBodyID(int bodyMetricID) {
    return bodyMapper.getByBodyID(bodyMetricID);
  }

  @Override
  public void updateBody(Body body) {
    bodyMapper.updateBody(body);
  }

  @Override
  public int searchbodyID(Body body) {
    return bodyMapper.searchbodyID(body);
  }

  @Override
  public void deleteBody(int bodyMetricID) {
    bodyMapper.removeBody(bodyMetricID);
  }
}
