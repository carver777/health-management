package com.stringtinyst.healthlife.service;

import com.stringtinyst.healthlife.pojo.Body;
import com.stringtinyst.healthlife.pojo.PageBean;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.time.LocalDate;


public interface BodyService {
    Body getByUserID(String userID);

    void addBody(Body body);

    PageBean page(Integer page, Integer pageSize,String userID, LocalDate begin, LocalDate end);

    Body getByBodyID(int bodyMetricID);

    void updateBody(Body body);

    int searchbodyID(Body body);

    void deleteBody(int bodyMetricID);
}
