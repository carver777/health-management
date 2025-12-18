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
import com.stringtinyst.healthlife.pojo.Body;
import com.stringtinyst.healthlife.pojo.PageBean;
import com.stringtinyst.healthlife.service.BodyService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BodyController.class)
class BodyControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private BodyService bodyService;
  @MockitoBean private LoginCheckInterceptor loginCheckInterceptor;

  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() throws Exception {
    objectMapper = new ObjectMapper().findAndRegisterModules();
    when(loginCheckInterceptor.preHandle(any(), any(), any())).thenReturn(true);
  }

  @Test
  @DisplayName("查询 Body 列表返回分页数据")
  void listBodyMetrics() throws Exception {
    Body sample =
        new Body(
            1, "u1", new BigDecimal("180"), new BigDecimal("75"), LocalDate.parse("2024-01-01"));
    when(bodyService.page(eq(1), eq(10), eq("u1"), Mockito.isNull(), Mockito.isNull()))
        .thenReturn(new PageBean(1L, List.of(sample)));

    mockMvc
        .perform(get("/body-metrics").param("userID", "u1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data.total").value(1))
        .andExpect(jsonPath("$.data.rows[0].userID").value("u1"));
  }

  @Test
  @DisplayName("新增 Body 记录返回生成的 ID")
  void addBodyMetric() throws Exception {
    when(bodyService.searchbodyID(any(Body.class))).thenReturn(123);

    String payload =
        objectMapper.writeValueAsString(
            new Body(
                0,
                "u2",
                new BigDecimal("170"),
                new BigDecimal("65"),
                LocalDate.parse("2024-02-02")));

    mockMvc
        .perform(post("/body-metrics").contentType(MediaType.APPLICATION_JSON).content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data").value(123));
  }
}
