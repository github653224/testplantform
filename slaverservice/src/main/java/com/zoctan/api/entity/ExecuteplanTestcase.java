package com.zoctan.api.entity;

import javax.persistence.*;
import java.util.Date;

@Table(name = "executeplan_testcase")
public class ExecuteplanTestcase {
    /**
     * 主键Id
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 执行计划id
     */
    private Long executeplanid;

    /**
     * 发布单元
     */
    private String deployunitname;

    /**
     * API名
     */
    private String apiname;

    /**
     * 用例id
     */
    private Long testcaseid;

    /**
     * 用例名
     */
    private String testcasename;

    /**
     * 创建时间
     */
    @Column(name = "create_time")
    private Date createTime;

    /**
     * 上一次修改时间
     */
    @Column(name = "lastmodify_time")
    private Date lastmodifyTime;

    /**
     * 获取主键Id
     *
     * @return id - 主键Id
     */
    public Long getId() {
        return id;
    }

    /**
     * 设置主键Id
     *
     * @param id 主键Id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * 获取执行计划id
     *
     * @return executeplanid - 执行计划id
     */
    public Long getExecuteplanid() {
        return executeplanid;
    }

    /**
     * 设置执行计划id
     *
     * @param executeplanid 执行计划id
     */
    public void setExecuteplanid(Long executeplanid) {
        this.executeplanid = executeplanid;
    }

    /**
     * 获取发布单元
     *
     * @return deployunitname - 发布单元
     */
    public String getDeployunitname() {
        return deployunitname;
    }

    /**
     * 设置发布单元
     *
     * @param deployunitname 发布单元
     */
    public void setDeployunitname(String deployunitname) {
        this.deployunitname = deployunitname;
    }

    /**
     * 获取API名
     *
     * @return apiname - API名
     */
    public String getApiname() {
        return apiname;
    }

    /**
     * 设置API名
     *
     * @param apiname API名
     */
    public void setApiname(String apiname) {
        this.apiname = apiname;
    }

    /**
     * 获取用例id
     *
     * @return testcaseid - 用例id
     */
    public Long getTestcaseid() {
        return testcaseid;
    }

    /**
     * 设置用例id
     *
     * @param testcaseid 用例id
     */
    public void setTestcaseid(Long testcaseid) {
        this.testcaseid = testcaseid;
    }

    /**
     * 获取用例名
     *
     * @return testcasename - 用例名
     */
    public String getTestcasename() {
        return testcasename;
    }

    /**
     * 设置用例名
     *
     * @param testcasename 用例名
     */
    public void setTestcasename(String testcasename) {
        this.testcasename = testcasename;
    }

    /**
     * 获取创建时间
     *
     * @return create_time - 创建时间
     */
    public Date getCreateTime() {
        return createTime;
    }

    /**
     * 设置创建时间
     *
     * @param createTime 创建时间
     */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /**
     * 获取上一次修改时间
     *
     * @return lastmodify_time - 上一次修改时间
     */
    public Date getLastmodifyTime() {
        return lastmodifyTime;
    }

    /**
     * 设置上一次修改时间
     *
     * @param lastmodifyTime 上一次修改时间
     */
    public void setLastmodifyTime(Date lastmodifyTime) {
        this.lastmodifyTime = lastmodifyTime;
    }
}