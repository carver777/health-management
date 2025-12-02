package com.stringtinyst.healthlife.pojo;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageBean {
  private Long total; // 总记录数
  private List rows; // 数据列表
}
