package com.stringtinyst.healthlife.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stringtinyst.healthlife.interceptor.LoginCheckInterceptor;
import com.stringtinyst.healthlife.pojo.Exer;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.service.ExerService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ExerController.class)
class ExerControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private ExerService exerService;
  @MockitoBean private LoginCheckInterceptor loginCheckInterceptor;

  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() throws Exception {
    objectMapper = new ObjectMapper().findAndRegisterModules();
    when(loginCheckInterceptor.preHandle(any(), any(), any())).thenReturn(true);
  }

  @Test
  @DisplayName("查询 Exercise 列表返回分页数据")
  void listExerciseItems() throws Exception {
    Exer sample = new Exer(5, "u1", java.time.LocalDate.parse("2024-03-01"), "run", 30, 200);
    when(exerService.page(eq(1), eq(10), eq("u1"), any(), any(), any()))
        .thenReturn(new PageBean(1L, List.of(sample)));

    mockMvc
        .perform(get("/exercise-items").param("userID", "u1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data.total").value(1))
        .andExpect(jsonPath("$.data.rows[0].exerciseType").value("run"));
  }

  @Test
  @DisplayName("新增 Exercise 记录返回生成的 ID")
  void addExerciseItem() throws Exception {
    when(exerService.searchExerItemID(any(Exer.class))).thenReturn(321);

    String payload =
        objectMapper.writeValueAsString(
            new Exer(0, "u2", java.time.LocalDate.parse("2024-03-02"), "bike", 45, 350));

    mockMvc
        .perform(post("/exercise-items").contentType(MediaType.APPLICATION_JSON).content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data").value(321));
  }
}
