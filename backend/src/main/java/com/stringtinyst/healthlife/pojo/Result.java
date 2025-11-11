package com.stringtinyst.healthlife.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Unified response result wrapper class */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {
  private Integer code; // 1 success, 0 failure
  private String msg; // message
  private Object data; // data

  public static Result success(Object data) {
    return new Result(1, "success", data);
  }

  public static Result success() {
    return new Result(1, "success", null);
  }

  public static Result error(String msg) {
    return new Result(0, msg, null);
  }
}
