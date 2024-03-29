package com.zoctan.api.service.impl;

import com.alibaba.fastjson.JSON;
import com.zoctan.api.core.exception.ServiceException;
import com.zoctan.api.core.service.AbstractService;
import com.zoctan.api.core.service.HttpHeader;
import com.zoctan.api.core.service.HttpParamers;
import com.zoctan.api.core.service.Httphelp;
import com.zoctan.api.dto.TestplanCase;
import com.zoctan.api.dto.Testplanandbatch;
import com.zoctan.api.entity.*;
import com.zoctan.api.mapper.*;
import com.zoctan.api.service.ExecuteplanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tk.mybatis.mapper.entity.Condition;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author SeasonFan
 * @date 2020/09/27
 */
@Service
@Transactional(rollbackFor = Exception.class)
public class ExecuteplanServiceImpl extends AbstractService<Executeplan> implements ExecuteplanService {
    @Resource
    private ExecuteplanMapper executeplanMapper;
    @Autowired
    private ExecuteplanTestcaseMapper executeplanTestcaseMapper;
    @Autowired
    private ExecuteplanbatchMapper executeplanbatchMapper;
    @Autowired
    private DictionaryMapper dictionaryMapper;
    @Autowired
    private SlaverMapper slaverMapper;


    @Override
    public List<Executeplan> findexplanWithName(Map<String, Object> params) {
        return this.executeplanMapper.findexplanWithName(params);
    }

    @Override
    public int ifexist(Condition con) {
        return countByCondition(con);
    }

    @Override
    public List<Executeplan> getallexplan() {
        return executeplanMapper.getallexplan();
    }

    @Override
    public List<Executeplan> getallexplanbytype(String usetype) {
        return executeplanMapper.getallexplanbytype(usetype);
    }

    @Override
    public Integer getexecuteplannum() {
        return executeplanMapper.getexecuteplannum();
    }

    @Override
    public void executeplancase(List<Testplanandbatch> testplanlist) {
        for (Testplanandbatch plan : testplanlist) {
            Long execplanid = plan.getPlanid();
            String batchname=plan.getBatchname();
            Executeplanbatch epb=executeplanbatchMapper.getbatchidbyplanidandbatchname(execplanid,batchname);
            // 检查plan当前的状态，如果状态为new，stop，finish继续执行
            Executeplan ep = executeplanMapper.findexplanWithid(execplanid);
            if (!ep.getStatus().equals(new String("running"))) {
                //executeplanMapper.updatetestplanstatus(testplanid,"waiting");
                List<ExecuteplanTestcase> caselist = executeplanTestcaseMapper.findcasebytestplanid(execplanid);
                System.out.println(caselist);
                List<TestplanCase> execcasedata = new ArrayList<TestplanCase>();
                HttpHeader header = new HttpHeader();
                HttpParamers paramers = HttpParamers.httpPostParamers();
                String serverurl="";
                Long slaverid=new Long(0);
                String slavername="";
                List<Dictionary> dic = dictionaryMapper.findDicNameValueWithCode("dispatchservice");
                if(dic.size()==0) //表示没有调度服务，直接调用单机slaver
                {
                    System.out.println("字典表未配置dispatchservice，则为单slaver模式，根据计划类型获取slaver");
                    String plantype=ep.getUsetype();
                    List<Slaver> slaverlist=slaverMapper.findslaverWithType(plantype);
                    if(slaverlist.size()==0)
                    {
                        throw new ServiceException("未找到类型为："+plantype+"的执行机，请先完成部署slaver");
                    }
                    else
                    {
                        // 取符合类型的slaver第一个，防止配置了多个
                        serverurl ="http://"+slaverlist.get(0).getIp()+":"+slaverlist.get(0).getPort()+"/exectestplancase/exec";
                        System.out.println("slaver server url is："+serverurl);
                        slaverid=slaverlist.get(0).getId();
                        slavername=slaverlist.get(0).getSlavername();
                    }
                }
                else
                {
                    // 调度服务地址
                    System.out.println("字典表配置dispatchservice，通过dispatchservice调度执行");
                    serverurl = dic.get(0).getDicitmevalue();
                }
                for (ExecuteplanTestcase testcase : caselist
                        ) {
                    TestplanCase tc = new TestplanCase();
                    tc.setExecplanid(execplanid);
                    tc.setPlanname(ep.getExecuteplanname());
                    tc.setTestcaseid(testcase.getTestcaseid());
                    tc.setBatchid(epb.getId());
                    tc.setBatchname(batchname);
                    tc.setCasename(testcase.getCasename());
                    tc.setSlaverid(slaverid);
                    tc.setSlavername((slavername));
                    tc.setCasejmxname(testcase.getCasejmxname());
                    tc.setDeployunitname(testcase.getDeployunitname());
                    tc.setExpect(testcase.getExpect());
                    execcasedata.add(tc);
                }
                String params = JSON.toJSONString(execcasedata);
                System.out.println("request json is:" + params);
                System.out.println("request url  is:" + serverurl);
                try {
                    String respon= Httphelp.doPost(serverurl, params, header, 10, 10);
                } catch (Exception e) {
                    throw new ServiceException(e.getMessage());
                }
            }
        }
    }

    @Override
    public void updatetestplanstatus(Long id, String status) {
        this.executeplanMapper.updatetestplanstatus(id, status);
    }

    @Override
    public Executeplan findexplanWithid(Long id) {
        return null;
    }

    @Override
    public void updateexecuteplanname(Executeplan params) {
        this.executeplanMapper.updateexecuteplanname(params);
    }
}
