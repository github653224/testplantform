<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true">
        <el-form-item>
          <el-button
            type="success"
            size="mini"
            icon="el-icon-refresh"
            v-if="hasPermission('executeplan:list')"
            @click.native.prevent="getexecuteplanList"
          >刷新</el-button>
          <el-button
            type="success"
            size="mini"
            v-if="hasPermission('executeplan:list')"
            @click.native.prevent="showplanbatchDialog"
          >运行</el-button>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            v-if="hasPermission('executeplan:add')"
            @click.native.prevent="showAddexecuteplanDialog"
          >添加执行计划</el-button>
        </el-form-item>

        <span v-if="hasPermission('executeplan:search')">
          <el-form-item>
            <el-input v-model="search.executeplanname" @keyup.enter.native="searchBy" placeholder="执行计划名"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchBy" :loading="btnLoading">查询</el-button>
          </el-form-item>
        </span>
      </el-form>
    </div>
    <el-table
      ref="fileTable"
      :data="executeplanList"
      @row-click="handleClickTableRow"
      @selection-change="handleSelectionChange"
      v-loading.body="listLoading"
      element-loading-text="loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        type="selection"
        width="40">
      </el-table-column>
      <el-table-column label="编号" align="center" width="50">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"></span>
        </template>
      </el-table-column>
      <el-table-column label="执行计划名" align="center" prop="executeplanname" width="100"/>
      <el-table-column label="envid" align="center" v-if="show" prop="envid" width="50"/>
      <el-table-column label="状态" align="center" prop="status" width="50"/>
      <el-table-column label="执行环境" align="center" prop="enviromentname" width="120"/>
      <el-table-column label="类型" align="center" prop="usetype" width="60"/>
      <el-table-column label="描述" align="center" prop="memo" width="100"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">{{ unix2CurrentTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="最后修改时间" align="center" prop="lastmodifyTime" width="160">
        <template slot-scope="scope">{{ unix2CurrentTime(scope.row.lastmodifyTime) }}
        </template>
      </el-table-column>

      <el-table-column label="管理" align="center"
                       v-if="hasPermission('executeplan:update')  || hasPermission('executeplan:delete')">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            v-if="hasPermission('executeplan:update') && scope.row.id !== id"
            @click.native.prevent="showUpdateexecuteplanDialog(scope.$index)"
          >修改计划</el-button>
          <el-button
            type="primary"
            size="mini"
            v-if="hasPermission('executeplan:update') && scope.row.id !== id"
            @click.native.prevent="showTestCaseDialog(scope.$index)"
          >装载用例</el-button>
          <el-button
            type="danger"
            size="mini"
            v-if="hasPermission('executeplan:delete') && scope.row.id !== id"
            @click.native.prevent="removeexecuteplan(scope.$index)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="listQuery.page"
      :page-size="listQuery.size"
      :total="total"
      :page-sizes="[10, 20, 30, 40]"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        status-icon
        class="small-space"
        label-position="left"
        label-width="100px"
        style="width: 300px; margin-left:50px;"
        :model="tmpexecuteplan"
        ref="tmpexecuteplan"
      >
        <el-form-item label="计划名" prop="executeplanname" required>
          <el-input
            type="text"
            prefix-icon="el-icon-edit"
            auto-complete="off"
            v-model="tmpexecuteplan.executeplanname"
          />
        </el-form-item>
        <el-form-item label="类型" prop="usetype" required>
          <el-select v-model="tmpexecuteplan.usetype" placeholder="类型">
            <el-option label="功能" value="功能" />
            <el-option label="性能" value="性能" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行环境" prop="enviromentname"  required>
          <el-select v-model="tmpexecuteplan.enviromentname" placeholder="执行环境" @change="enviromentselectChanged($event)">
            <el-option label="请选择" value="''" style="display: none" />
            <div v-for="(envname, index) in enviromentnameList" :key="index">
              <el-option :label="envname.enviromentname" :value="envname.enviromentname" required/>
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="memo">
          <el-input
            type="text"
            prefix-icon="el-icon-message"
            auto-complete="off"
            v-model="tmpexecuteplan.memo"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click.native.prevent="dialogFormVisible = false">取消</el-button>
        <el-button
          type="success"
          v-if="dialogStatus === 'add'"
          :loading="btnLoading"
          @click.native.prevent="addexecuteplan"
        >保存
        </el-button>
        <el-button
          type="success"
          v-if="dialogStatus === 'update'"
          :loading="btnLoading"
          @click.native.prevent="updateexecuteplan"
        >修改</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="loadcase" :visible.sync="casedialogFormVisible">
      <div class="filter-container" >
        <el-form :inline="true" :model="searchcase" ref="searchcase" >
          <span v-if="hasPermission('apicases:search')">
          <el-form-item label="发布单元:" prop="deployunitname" required>
            <el-select v-model="searchcase.deployunitname" placeholder="发布单元" @change="selectChanged($event)">
              <el-option label="请选择" value />
              <div v-for="(depname, index) in deployunitList" :key="index">
                <el-option :label="depname.deployunitname" :value="depname.deployunitname" required/>
              </div>
            </el-select>
          </el-form-item>
          <el-form-item label="API:">
            <el-select v-model="searchcase.apiname" placeholder="api名">
              <el-option label="请选择" value />
              <div v-for="(api, index) in apiList" :key="index">
                <el-option :label="api.apiname" :value="api.apiname"/>
              </div>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchcaseBy" :loading="btnLoading">查询</el-button>
          </el-form-item>
        </span>
        </el-form>
      </div>
      <el-table
        ref="caseTable"
        :data="testcaselastList"
        @row-click="casehandleClickTableRow"
        @selection-change="casehandleSelectionChange"
        v-loading.body="listLoading"
        element-loading-text="loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="编号" align="center" width="60">
          <template slot-scope="scope">
            <span v-text="getIndex(scope.$index)"></span>
          </template>
        </el-table-column>

        <el-table-column type="selection" prop="status" width="50"/>
        <el-table-column label="apiid" v-if="show" align="center" prop="apiid" width="120"/>
        <el-table-column label="deployunitid" v-if="show" align="center" prop="deployunitid" width="120"/>
        <el-table-column label="用例名" align="center" prop="casename" width="120"/>
        <el-table-column label="发布单元" align="center" prop="deployunitname" width="120"/>
        <el-table-column label="API" align="center" prop="apiname" width="120"/>
        <el-table-column label="期望值" align="center" prop="expect" width="120"/>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="casehandleSizeChange"
        @current-change="casehandleCurrentChange"
        :current-page="caselistQuery.page"
        :page-size="caselistQuery.size"
        :total="casetotal"
        :page-sizes="[10, 20, 30, 40]"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native.prevent="casedialogFormVisible = false">取消</el-button>
        <el-button
          type="success"
          :loading="btnLoading"
          @click.native.prevent="addexecuteplantestcase"
        >装载</el-button>
        <el-button
          type="warning"
          :loading="btnLoading"
          @click.native.prevent="removeexecuteplantestcase"
        >取消装载</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="loadbatch" :visible.sync="batchdialogFormVisible">
      <div class="filter-container" >
        <el-form :inline="true" :model="tmpplanbatch" ref="tmpplanbatch" >
          <el-form-item label="批次"  prop="batchname" required>
            <el-input
              type="text"
              placeholder="例如2020-10-21-tag-101"
              prefix-icon="el-icon-edit"
              auto-complete="off"
              v-model="tmpplanbatch.batchname"
            />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native.prevent="batchdialogFormVisible = false">取消</el-button>
        <el-button
          type="success"
          :loading="btnLoading"
          @click.native.prevent="savebatchandexecuteplancase"
        >提交</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
  import {
    getapicasesList as getapicasesList,
    search as getapicases
  } from '@/api/assets/apicases'
  import { search as getapiList } from '@/api/deployunit/api'
  import { getdepunitList as getdepunitList } from '@/api/deployunit/depunit'
  import { addexecuteplanbatch as addexecuteplanbatch } from '@/api/executecenter/executeplanbatch'
  import { searchcases as searchtestplancases, addexecuteplantestcase, removeexecuteplantestcase } from '@/api/executecenter/executeplantestcase'
  import { checkplancondition as checkplancondition, getexecuteplanList as getexecuteplanList, search, addexecuteplan, updateexecuteplan, removeexecuteplan, executeplan, updateexecuteplanstatus } from '@/api/executecenter/executeplan'
  import { unix2CurrentTime } from '@/utils'
  import { getenviromentallList as getenviromentallList } from '@/api/enviroment/testenviroment'

  export default {
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'gray',
          deleted: 'danger'
        }
        return statusMap[status]
      }
    },
    data() {
      return {
        tmpexecuteplanname: '',
        tmpcasedeployunitname: null,
        tmpcaseapiname: null,
        tmpcaseexecuteplanid: null,
        tmpcasecasetype: null,
        show: false,
        enviromentnameList: [], // 环境列表
        apiList: [], // api列表
        deployunitList: [], // 发布单元列表
        multipleSelection: [], // 执行计划表格被选中的内容
        casemultipleSelection: [], // 用例表格被选中的内容
        executeplanList: [], // 执行计划列表
        testcaseList: [], // 用例列表
        testcaselastList: [], // 经过用例列表和已装载的用例组合出的结果列表
        executeplancaseList: [], // 执行计划装载用例列表
        executeplancaseexistList: [], // 查询执行计划已存在的用例列表
        executeplancaseremovetList: [], // 查询执行计划需要删除存在的用例列表
        executeplanstopList: [], // 停止执行计划列表
        tmpplanbatchList: [], // 计划批次列表
        listLoading: false, // 数据加载等待动画
        caselistLoading: false, // 用例列表页面数据加载等待动画
        total: 0, // 数据总数
        casetotal: 0, // 用例数据总数
        apiQuery: {
          page: 1, // 页码
          size: 30, // 每页数量
          deployunitname: '' // 获取字典表入参
        },
        listQuery: {
          page: 1, // 页码
          size: 10, // 每页数量
          listLoading: true,
          executeplanname: ''
        },
        caselistQuery: {
          page: 1, // 页码
          size: 10, // 每页数量
          listLoading: true,
          deployunitname: null,
          apiname: null,
          executeplanid: null,
          casetype: null
        },
        dialogStatus: 'add',
        dialogFormVisible: false,
        casedialogFormVisible: false,
        batchdialogFormVisible: false,
        loadcase: '装载用例',
        loadbatch: '添加批次',
        textMap: {
          updateRole: '修改执行计划',
          update: '修改执行计划',
          add: '添加执行计划'
        },
        btnLoading: false, // 按钮等待动画
        casebtnLoading: false, // 按钮等待动画
        tmpexecuteplan: {
          id: '',
          executeplanname: '',
          enviromentname: '',
          envid: '',
          status: '',
          usetype: '',
          ip: '',
          memo: ''
        },
        tmpplanbatch: {
          executeplanid: '',
          batchname: ''
        },
        tmpplanenv: {
          id: '',
          envid: '',
          enviromentname: ''
        },
        tmpapicases: {
          id: '',
          casename: '',
          deployunitname: '',
          apiname: '',
          casejmxname: '',
          casecontent: '',
          expect: '',
          level: '',
          memo: '',
          creator: 'admin'
        },
        search: {
          page: 1,
          size: 10,
          executeplanname: null
        },
        searchcase: {
          page: 1,
          size: 10,
          deployunitname: null,
          apiname: null,
          executeplanid: null,
          casetype: null
        }
      }
    },

    created() {
      this.getexecuteplanList()
      this.getapiList()
      this.getdepunitList()
      this.getenviromentallList()
    },

    methods: {
      unix2CurrentTime,
      /**
       * 停止执行计划
       */
      stopexecuteplanList() {
        for (let i = 0; i < this.multipleSelection.length; i++) {
          if (this.multipleSelection[i].status === 'waiting' || this.multipleSelection[i].status === 'new' || this.multipleSelection[i].status === 'finish' || this.multipleSelection[i].status === 'stop') {
            this.multipleSelection.splice(i)
          }
        }
        if (this.multipleSelection.length === 0) {
          this.$message.error('未选择执行计划,或者只有运行中才可以停止')
        } else {
          for (let i = 0; i < this.multipleSelection.length; i++) {
            this.executeplanstopList.push({
              'id': this.multipleSelection[i].id,
              'status': 'stop'
            })
          }
          updateexecuteplanstatus(this.executeplanstopList).then(() => {
            this.$message.success('已停止执行计划')
            this.btnLoading = false
          }).catch(res => {
            this.$message.error('停止计划执行失败')
            this.btnLoading = false
          })
        }
        this.getexecuteplanList()
      },
      /**
       * 添加执行计划批次
       */
      savebatchandexecuteplancase() {
        this.$refs.tmpplanbatch.validate(valid => {
          if (valid) {
            this.btnLoading = true
            addexecuteplanbatch(this.tmpplanbatch).then(() => {
              this.executeplancase()
              this.batchdialogFormVisible = false
              this.btnLoading = false
            }).catch(res => {
              this.btnLoading = false
            })
          }
        })
      },
      /**
       * 添加执行计划批次并且执行计划用例
       */
      // savebatchandexecuteplancase() {
      // this.addexecuteplanbatch()
      // this.executeplancase()
      // this.batchdialogFormVisible = false
      // },
      /**
       * 执行执行计划
       */
      executeplancase() {
        this.tmpplanbatchList = []
        this.$refs.tmpplanbatch.validate(valid => {
          if (valid && this.isUniqueDetail(this.tmpplanbatch)) {
            for (let i = 0; i < this.multipleSelection.length; i++) {
              if (this.multipleSelection[i].status === 'running') {
                this.multipleSelection.splice(i)
              }
            }
            if (this.multipleSelection.length === 0) {
              this.$message.error('未选择执行计划,或者所选计划已经在执行中')
            } else {
              if (this.multipleSelection.length > 1) {
                this.$message.error('不支持多执行计划一起提交，单个提交')
              } else {
                for (let i = 0; i < this.multipleSelection.length; i++) {
                  this.tmpplanbatchList.push({
                    'planid': this.multipleSelection[0].id,
                    'batchname': this.tmpplanbatch.batchname
                  })
                }
                executeplan(this.tmpplanbatchList).then(() => {
                  this.$message.success('计划即将开始执行')
                  this.btnLoading = false
                }).catch(res => {
                  this.$message.error('计划执行失败')
                  this.btnLoading = false
                })
              }
            }
            this.getexecuteplanList()
          }
        })
      },

      handleClickTableRow(row, event, column) {
        // console.log(row)
        // console.log(column)
        // this.$refs.fileTable.toggleRowSelection(row)
      },
      handleSelectionChange(rows) {
        // console.log(rows)
        this.multipleSelection = rows
        console.log('00000000000000000000000000')
        console.log(this.multipleSelection)
      },

      casehandleClickTableRow(row, event, column) {
        console.log(row)
      },

      casehandleSelectionChange(rows) {
        this.casemultipleSelection = rows
        // console.log(this.casemultipleSelection)
      },

      /**
       * 获取执行计划列表
       */
      getexecuteplanList() {
        this.listLoading = true
        getexecuteplanList(this.listQuery).then(response => {
          this.executeplanList = response.data.list
          this.total = response.data.total
          this.listLoading = false
        }).catch(res => {
          this.$message.error('加载字典列表失败')
        })
      },
      searchBy() {
        this.btnLoading = true
        this.listLoading = true
        this.search.page = this.listQuery.page
        this.search.size = this.listQuery.size
        search(this.search).then(response => {
          this.executeplanList = response.data.list
          this.total = response.data.total
        }).catch(res => {
          this.$message.error('搜索失败')
        })
        this.tmpexecuteplanname = this.search.executeplanname
        this.listLoading = false
        this.btnLoading = false
      },

      searchBypageing() {
        this.btnLoading = true
        this.listLoading = true
        this.listQuery.execplanname = this.tmpexecplanname
        search(this.listQuery).then(response => {
          this.executeplanList = response.data.list
          this.total = response.data.total
        }).catch(res => {
          this.$message.error('搜索失败')
        })
        this.listLoading = false
        this.btnLoading = false
      },

      /**
       * 改变每页数量
       * @param size 页大小
       */
      handleSizeChange(size) {
        this.listQuery.size = size
        this.listQuery.page = 1
        this.searchBypageing()
      },
      /**
       * 改变页码
       * @param page 页号
       */
      handleCurrentChange(page) {
        this.listQuery.page = page
        this.searchBypageing()
      },
      /**
       * 表格序号
       * 可参考自定义表格序号
       * http://element-cn.eleme.io/#/zh-CN/component/table#zi-ding-yi-suo-yin
       * @param index 数据下标
       * @returns 表格序号
       */
      getIndex(index) {
        return (this.listQuery.page - 1) * this.listQuery.size + index + 1
      },

      /**
       * 环境下拉框活的环境id
       */
      enviromentselectChanged(e) {
        for (let i = 0; i < this.enviromentnameList.length; i++) {
          if (this.enviromentnameList[i].enviromentname === e) {
            this.tmpexecuteplan.envid = this.enviromentnameList[i].id
          }
          console.log(this.enviromentnameList[i].id)
        }
      },

      /**
       * 发布单元下拉选择事件获取发布单元id  e的值为options的选值
       */
      selectChanged(e) {
        this.apiList = null
        this.apiQuery.deployunitname = e
        getapiList(this.apiQuery).then(response => {
          this.apiList = response.data.list
          console.log(this.apiList)
          this.casetotal = response.data.total
        }).catch(res => {
          this.$message.error('加载api列表失败')
        })
      },
      /**
       * 获取api列表
       */
      getapiList() {
        this.caselistLoading = true
        getapiList(this.listQuery).then(response => {
          this.apiList = response.data.list
          this.casetotal = response.data.total
          this.caselistLoading = false
        }).catch(res => {
          this.$message.error('加载api列表失败')
        })
      },

      /**
       * 获取环境列表
       */
      getenviromentallList() {
        getenviromentallList().then(response => {
          this.enviromentnameList = response.data
        }).catch(res => {
          this.$message.error('加载环境列表失败')
        })
      },

      /**
       * 获取发布单元列表
       */
      getdepunitList() {
        this.caselistLoading = true
        getdepunitList(this.listQuery).then(response => {
          this.deployunitList = response.data.list
          // this.casetotal = response.data.total
          // this.caselistLoading = false
        }).catch(res => {
          this.$message.error('加载发布单元列表失败')
        })
      },

      /**
       * 获取用例列表
       */
      getcaseList() {
        this.caselistLoading = true
        getapicasesList(this.listQuery).then(response => {
          this.apicasesList = response.data.list
          this.casetotal = response.data.total
          this.caselistLoading = false
        }).catch(res => {
          this.$message.error('加载用例列表失败')
        })
      },

      /**
       * 获取发布单元和api的用例
       */
      searchcaseBy() {
        this.searchtestplanexistcase()
        // this.searchcaseBydepandapi()
        // this.gettestcaselastList()
      },

      async gettestcaselastList() {
        console.log(this.testcaseList.length)
        console.log(this.executeplancaseexistList.length)
        for (let i = 0; i < this.testcaseList.length; i++) {
          for (let j = 0; j < this.executeplancaseexistList.length; j++) {
            if (this.testcaseList[i].id === this.executeplancaseexistList[j].testcaseid) {
              this.testcaselastList.push({
                'checkstats': true,
                'deployunitname': this.testcaseList[i].deployunitname,
                'apiname': this.testcaseList[i].apiname,
                'casename': this.testcaseList[i].casename,
                'expect': this.testcaseList[i].expect
              })
            } else {
              this.testcaselastList.push({
                'checkstats': false,
                'deployunitname': this.testcaseList[i].deployunitname,
                'apiname': this.testcaseList[i].apiname,
                'casename': this.testcaseList[i].casename,
                'expect': this.testcaseList[i].expect
              })
            }
          }
        }
        console.log(this.testcaselastList)
      },

      /**
       * 获取发布单元和api的用例
       */
      async searchcaseBydepandapi() {
        this.$refs.searchcase.validate(valid => {
          if (valid) {
            this.casebtnLoading = true
            this.caselistLoading = true
            this.searchcase.page = this.caselistQuery.page
            this.searchcase.size = this.caselistQuery.size
            getapicases(this.searchcase).then(response => {
              this.testcaseList = response.data.list
              console.log(this.testcaseList.length)
              this.casetotal = response.data.total
            }).catch(res => {
              this.$message.error('搜索失败')
            })
            this.caselistLoading = false
            this.casebtnLoading = false
          }
        })
      },

      /**
       * 获取执行计划下发布单元和api已的用例,如果是已装载过的，会带上装载状态
       */
      searchtestplanexistcase() {
        this.testcaselastList = []
        this.$refs.searchcase.validate(valid => {
          if (valid) {
            this.searchcase.executeplanid = this.tmpexecuteplan.id
            this.searchcase.casetype = this.tmpexecuteplan.usetype
            this.searchcase.page = this.caselistQuery.page
            this.searchcase.size = this.caselistQuery.size
            searchtestplancases(this.searchcase).then(response => {
              this.testcaselastList = response.data.list
              this.casetotal = response.data.total
              this.$nextTick(() => {
                for (let i = 0; i < this.testcaselastList.length; i++) {
                  if (this.testcaselastList[i].status === true) {
                    this.$refs.caseTable.toggleRowSelection(this.testcaselastList[i], true)
                  }
                }
              })
            }).catch(res => {
              this.$message.error('获取已装载的用例失败')
            })
          }
        })
        this.tmpcasedeployunitname = this.searchcase.deployunitname
        this.tmpcaseapiname = this.searchcase.apiname
        this.tmpcaseexecuteplanid = this.searchcase.executeplanid
        this.tmpcasecasetype = this.searchcase.casetype
      },

      searchcaseBypageing() {
        this.btnLoading = true
        this.listLoading = true
        this.caselistQuery.deployunitname = this.tmpcasedeployunitname
        this.caselistQuery.apiname = this.tmpcaseapiname
        this.caselistQuery.executeplanid = this.tmpcaseexecuteplanid
        this.caselistQuery.casetype = this.tmpcasecasetype

        search(this.listQuery).then(response => {
          this.testcaselastList = response.data.list
          this.total = response.data.total
        }).catch(res => {
          this.$message.error('搜索失败')
        })
        this.listLoading = false
        this.btnLoading = false
      },

      /**
       * 改变每页数量
       * @param size 页大小
       */
      casehandleSizeChange(size) {
        this.caselistQuery.size = size
        this.caselistQuery.page = 1
        this.searchcaseBypageing()
      },
      /**
       * 改变页码
       * @param page 页号
       */
      casehandleCurrentChange(page) {
        this.caselistQuery.page = page
        this.searchcaseBypageing()
      },
      /**
       * 表格序号
       * 可参考自定义表格序号
       * http://element-cn.eleme.io/#/zh-CN/component/table#zi-ding-yi-suo-yin
       * @param index 数据下标
       * @returns 表格序号
       */
      casegetIndex(index) {
        return (this.caselistQuery.page - 1) * this.caselistQuery.size + index + 1
      },
      /**
       * 显示添加执行计划对话框
       */
      showAddexecuteplanDialog() {
        // 显示新增对话框
        this.dialogFormVisible = true
        this.dialogStatus = 'add'
        this.tmpexecuteplan.id = ''
        this.tmpexecuteplan.executeplanname = ''
        this.tmpexecuteplan.status = 'new'
        this.tmpexecuteplan.memo = ''
        this.tmpexecuteplan.usetype = ''
        this.tmpexecuteplan.enviromentname = ''
      },

      /**
       * 显示添加执行计划批次对话框
       */
      showplanbatchDialog() {
        // 显示新增对话框
        console.log('11111111111')
        console.log(this.multipleSelection.length)
        for (let i = 0; i < this.multipleSelection.length; i++) {
          if (this.multipleSelection[i].status === 'running') {
            this.multipleSelection.splice(i)
          }
        }
        console.log('222222222222')
        console.log(this.multipleSelection.length)
        if (this.multipleSelection.length === 0) {
          this.$message.error('未选择执行计划,或者所选计划已经在执行中')
        } else {
          if (this.multipleSelection.length > 1) {
            this.$message.error('不支持多执行计划一起提交，单个提交')
          } else {
            this.tmpplanenv.id = this.multipleSelection[0].id
            this.tmpplanenv.envid = this.multipleSelection[0].envid
            this.tmpplanenv.enviromentname = this.multipleSelection[0].enviromentname
            checkplancondition(this.tmpplanenv).then(() => {
              console.log('3333333333333333333')
              this.batchdialogFormVisible = true
              this.tmpplanbatch.executeplanid = this.multipleSelection[0].id
              this.tmpplanbatch.batchname = ''
            }).catch(res => {
              // this.$message.error('执行失败')
            })
          }
        }
      },
      /**
       * 添加执行计划
       */
      addexecuteplan() {
        this.$refs.tmpexecuteplan.validate(valid => {
          if (valid) {
            this.btnLoading = true
            addexecuteplan(this.tmpexecuteplan).then(() => {
              this.$message.success('添加成功')
              this.getexecuteplanList()
              this.dialogFormVisible = false
              this.btnLoading = false
            }).catch(res => {
              this.$message.error('添加失败')
              this.btnLoading = false
            })
          }
        })
      },
      /**
       * 显示修改执行计划对话框
       * @param index 执行计划下标
       */
      showUpdateexecuteplanDialog(index) {
        this.dialogFormVisible = true
        this.dialogStatus = 'update'
        this.tmpexecuteplan.id = this.executeplanList[index].id
        this.tmpexecuteplan.executeplanname = this.executeplanList[index].executeplanname
        this.tmpexecuteplan.status = this.executeplanList[index].status
        this.tmpexecuteplan.usetype = this.executeplanList[index].usetype
        this.tmpexecuteplan.memo = this.executeplanList[index].memo
        this.tmpexecuteplan.enviromentname = this.executeplanList[index].enviromentname

        for (let i = 0; i < this.enviromentnameList.length; i++) {
          if (this.enviromentnameList[i].enviromentname === this.tmpexecuteplan.enviromentname) {
            this.tmpexecuteplan.envid = this.enviromentnameList[i].id
          }
        }
      },

      /**
       * 装载执行计划的用例
       */
      addexecuteplantestcase() {
        this.executeplancaseList = []
        if (this.casemultipleSelection.length === 0) {
          this.$message.error('请选择装载的用例')
        } else {
          for (let i = 0; i < this.casemultipleSelection.length; i++) {
            this.executeplancaseList.push({
              'executeplanid': this.tmpexecuteplan.id,
              'deployunitid': this.casemultipleSelection[i].deployunitid,
              'apiid': this.casemultipleSelection[i].apiid,
              'deployunitname': this.casemultipleSelection[i].deployunitname,
              'apiname': this.casemultipleSelection[i].apiname,
              'testcaseid': this.casemultipleSelection[i].id,
              'casename': this.casemultipleSelection[i].casename
            })
          }
          addexecuteplantestcase(this.executeplancaseList).then(() => {
            this.$message.success('装载成功')
          }).catch(res => {
            this.$message.error('装载失败')
          })
        }
      },

      /**
       * 删除装载的用例
       */
      removeexecuteplantestcase() {
        this.executeplancaseremovetList = []
        if (this.testcaselastList.length === this.casemultipleSelection.length) {
          this.$message.error('未找到需要取消装载的用例')
        } else {
          for (let i = 0; i < this.testcaselastList.length; i++) {
            var findflag = false
            for (let j = 0; j < this.casemultipleSelection.length; j++) {
              if (this.testcaselastList[i].id === this.casemultipleSelection[j].id) {
                findflag = true
                break
              }
            }
            // 表示未选中的记录，需要删除
            this.testcaselastList[i].id
            if (!findflag) {
              this.executeplancaseremovetList.push({
                'executeplanid': this.tmpexecuteplan.id,
                'deployunitname': this.testcaselastList[i].deployunitname,
                'apiname': this.testcaselastList[i].apiname,
                'testcaseid': this.testcaselastList[i].id,
                'casename': this.testcaselastList[i].casename
              })
            }
          }
          console.log(this.executeplancaseremovetList)
          removeexecuteplantestcase(this.executeplancaseremovetList).then(() => {
            this.$message.success('取消装载用例成功')
          }).catch(res => {
            this.$message.error('取消装载用例失败')
          })
        }
      },
      /**
       * 显示用例对话框
       * @param index 执行计划下标
       */
      showTestCaseDialog(index) {
        this.casedialogFormVisible = true
        this.tmpexecuteplan.id = this.executeplanList[index].id
        this.tmpexecuteplan.executeplanname = this.executeplanList[index].executeplanname
        this.tmpexecuteplan.status = this.executeplanList[index].status
        this.tmpexecuteplan.usetype = this.executeplanList[index].usetype
        this.tmpexecuteplan.memo = this.executeplanList[index].memo
        this.searchcase.deployunitname = null
        this.searchcase.apiname = null
        this.testcaselastList = []
        this.casetotal = 0
      },
      /**
       * 更新执行计划
       */
      updateexecuteplan() {
        this.$refs.tmpexecuteplan.validate(valid => {
          if (valid) {
            updateexecuteplan(this.tmpexecuteplan).then(() => {
              this.$message.success('更新成功')
              this.getexecuteplanList()
              this.dialogFormVisible = false
            }).catch(res => {
              this.$message.error('更新失败')
              this.btnLoading = false
            })
          }
        })
      },
      /**
       * 删除字典
       * @param index 执行计划下标
       */
      removeexecuteplan(index) {
        this.$confirm('删除该执行计划？', '警告', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          const id = this.executeplanList[index].id
          removeexecuteplan(id).then(() => {
            this.$message.success('删除成功')
            this.getexecuteplanList()
          })
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },

      /**
       * 执行计划资料是否唯一
       * @param 执行计划
       */
      isUniqueDetail(executeplan) {
        for (let i = 0; i < this.executeplanList.length; i++) {
          if (this.executeplanList[i].id !== executeplan.id) { // 排除自己
            if (this.executeplanList[i].executeplanname === executeplan.executeplanname) {
              this.$message.error('执行计划名已存在')
              return false
            }
          }
        }
        return true
      }
    }
  }
</script>
