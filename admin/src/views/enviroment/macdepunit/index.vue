<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true">
        <el-form-item>
          <el-button
            type="success"
            size="mini"
            icon="el-icon-refresh"
            v-if="hasPermission('macdepunit:list')"
            @click.native.prevent="getmacdepunitList"
          >刷新</el-button>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            v-if="hasPermission('macdepunit:add')"
            @click.native.prevent="showAddmacdepunitDialog"
          >添加环境部署</el-button>
        </el-form-item>

        <span v-if="hasPermission('macdepunit:search')">
          <el-form-item>
            <el-input v-model="search.enviromentname" @keyup.enter.native="searchBy" placeholder="测试环境名"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="search.deployunitname" @keyup.enter.native="searchBy" placeholder="发布单元,组件名"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchBy"  :loading="btnLoading">查询</el-button>
          </el-form-item>
        </span>
      </el-form>
    </div>
    <el-table
      :data="macdepunitList"
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
      <el-table-column label="测试环境" align="center" prop="enviromentname" width="120"/>
      <el-table-column label="服务器" align="center" prop="machinename" width="100"/>
      <el-table-column label="组件名" align="center" prop="deployunitname" width="120"/>
      <el-table-column label="组件类型" align="center" prop="assembletype" width="80"/>
      <el-table-column label="访问域名" align="center" prop="domain" width="120"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">{{ unix2CurrentTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="最后修改时间" align="center" prop="lastmodifyTime" width="160">
        <template slot-scope="scope">{{ unix2CurrentTime(scope.row.lastmodifyTime) }}
        </template>
      </el-table-column>

      <el-table-column label="管理" align="center"
                       v-if="hasPermission('macdepunit:update')  || hasPermission('macdepunit:delete')">
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            v-if="hasPermission('macdepunit:update') && scope.row.id !== id"
            @click.native.prevent="showUpdatemacdepunitDialog(scope.$index)"
          >修改</el-button>
          <el-button
            type="danger"
            size="mini"
            v-if="hasPermission('macdepunit:delete') && scope.row.id !== id"
            @click.native.prevent="removemacdepunit(scope.$index)"
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
        style="width: 400px; margin-left:50px;"
        :model="tmpmacdepunit"
        ref="tmpmacdepunit"
      >
        <el-form-item label="测试环境" prop="enviromentname" required >
          <el-select v-model="tmpmacdepunit.enviromentname"  placeholder="测试环境名" @change="selectChangedEN($event)">
            <el-option label="请选择" value="''" style="display: none" />
            <div v-for="(envname, index) in enviromentnameList" :key="index">
              <el-option :label="envname.enviromentname" :value="envname.enviromentname" required/>
            </div>
          </el-select>
        </el-form-item>

        <el-form-item label="服务器" prop="machinename" required >
          <el-select v-model="tmpmacdepunit.machinename" placeholder="服务器" @change="selectChangedMN($event)">
            <el-option label="请选择" value="''" style="display: none" />
            <div v-for="(macname, index) in machinenameList" :key="index">
              <el-option :label="`${macname.machinename} ：${macname.ip}`" :value="macname.machinename" required/>
            </div>
          </el-select>
        </el-form-item>

        <el-form-item label="组件类型" prop="assembletype" required >
          <el-select v-model="tmpmacdepunit.assembletype" placeholder="组件类型" @change="selectChangedAandD($event)">
            <el-option label="组件" value="组件"></el-option>
            <el-option label="发布单元" value="发布单元"></el-option>
          </el-select>
        </el-form-item>

        <div v-if="deployunitVisible">
          <el-form-item label="发布单元" prop="deployunitname" required >
            <el-select v-model="tmpmacdepunit.deployunitname" placeholder="发布单元" @change="selectChangedDU($event)">
              <el-option label="请选择" value="''" style="display: none" />
              <div v-for="(depunit, index) in deployUnitList" :key="index">
                <el-option :label="depunit.deployunitname" :value="depunit.deployunitname" required/>
              </div>
            </el-select>
          </el-form-item>

          <el-form-item label="访问方式" prop="visittype" required >
            <el-select v-model="tmpmacdepunit.visittype" placeholder="访问方式" @change="selectChangedVisittype($event)">
              <el-option label="ip" value="ip"></el-option>
              <el-option label="域名" value="域名"></el-option>
            </el-select>
          </el-form-item>

          <div v-if="domianVisible">
            <el-form-item label="访问域名" prop="domain" required>
              <el-input v-model="tmpmacdepunit.domain"  placeholder="访问域名" required></el-input>
            </el-form-item>
          </div>
        </div>

        <div v-if="assembleVisible">
          <el-form-item label="组件" prop="deployunitname" required >
            <el-select v-model="tmpmacdepunit.deployunitname" placeholder="组件" @change="selectChangedAS($event)">
              <el-option label="请选择" value="''" style="display: none" />
              <div v-for="(assemble, index) in assembleList" :key="index">
                <el-option :label="assemble.assemblename" :value="assemble.assemblename" required/>
              </div>
            </el-select>
          </el-form-item>
        </div>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native.prevent="dialogFormVisible = false">取消</el-button>
        <el-button
          type="danger"
          v-if="dialogStatus === 'add'"
          @click.native.prevent="$refs['tmpmacdepunit'].resetFields()"
        >重置</el-button>
        <el-button
          type="success"
          v-if="dialogStatus === 'add'"
          :loading="btnLoading"
          @click.native.prevent="addmacdepunit"
        >添加</el-button>
        <el-button
          type="success"
          v-if="dialogStatus === 'update'"
          :loading="btnLoading"
          @click.native.prevent="updatemacdepunit"
        >修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { getmacdepunitList as getmacdepunitList, search, addmacdepunit, updatemacdepunit, removemacdepunit } from '@/api/enviroment/macdepunit'
  import { getmachineLists as getmachineLists } from '@/api/assets/machine'
  import { getenviromentallList as getenviromentallList } from '@/api/enviroment/testenviroment'
  import { getdepunitLists as getdepunitLists } from '@/api/deployunit/depunit'
  import { unix2CurrentTime } from '@/utils'
  import { getassembleallnameList as getassembleallnameList } from '@/api/enviroment/enviromentassemble'

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
        tmpenviromentname: '',
        tmpdeployunitname: '',
        assembleList: [], // 环境组件列表
        macdepunitList: [], // 环境服务器列表
        enviromentnameList: [], // 环境列表
        machinenameList: [], // 服务器列表
        deployUnitList: [], // 服务器列表
        listLoading: false, // 数据加载等待动画
        total: 0, // 数据总数
        listQuery: {
          page: 1, // 页码
          size: 10, // 每页数量
          listLoading: true,
          enviromentname: '',
          deployunitname: ''
        },
        dialogStatus: 'add',
        deployunitVisible: false,
        assembleVisible: false,
        domianVisible: false,
        dialogFormVisible: false,
        textMap: {
          updateRole: '修改环境服务器发布单元,组件',
          update: '修改环境服务器发布单元,组件',
          add: '添加环境服务器发布单元,组件'
        },
        btnLoading: false, // 按钮等待动画
        tmpmacdepunit: {
          id: '',
          envid: '',
          machineid: '',
          depunitid: '',
          assembleid: '',
          assembletype: '',
          enviromentname: '',
          machinename: '',
          deployunitname: '',
          domain: '',
          visittype: ''
        },
        search: {
          page: 1,
          size: 10,
          enviromentname: null,
          deployunitname: null
        }
      }
    },

    created() {
      this.getmacdepunitList()
      this.getenviromentallList()
      this.getmachineLists()
      this.getdepunitLists()
      this.getassembleLists()
    },

    methods: {
      unix2CurrentTime,

      selectChangedAandD(e) {
        if (e === '组件') {
          this.deployunitVisible = false
          this.assembleVisible = true
        }
        if (e === '发布单元') {
          this.assembleVisible = false
          this.deployunitVisible = true
          this.domianVisible = false
        }
        this.tmpmacdepunit.deployunitname = ''
        this.tmpmacdepunit.assembleid = ''
        this.tmpmacdepunit.depunitid = ''
      },

      /**
       * 发布单元访问方式下拉控制是否显示域名  e的值为options的选值
       */
      selectChangedVisittype(e) {
        if (e === '域名') {
          this.domianVisible = true
        }
        if (e === 'ip') {
          this.domianVisible = false
        }
      },

      /**
       * 环境下拉选择事件获取发布单元id  e的值为options的选值
       */
      selectChangedEN(e) {
        for (let i = 0; i < this.enviromentnameList.length; i++) {
          if (this.enviromentnameList[i].enviromentname === e) {
            this.tmpmacdepunit.envid = this.enviromentnameList[i].id
          }
          console.log(this.enviromentnameList[i].id)
        }
      },

      /**
       * 服务器下拉选择事件获取发布单元id  e的值为options的选值
       */
      selectChangedMN(e) {
        for (let i = 0; i < this.machinenameList.length; i++) {
          if (this.machinenameList[i].machinename === e) {
            this.tmpmacdepunit.machineid = this.machinenameList[i].id
          }
          console.log(this.machinenameList[i].id)
        }
      },

      /**
       * 发布单元下拉选择事件获取发布单元id  e的值为options的选值
       */
      selectChangedDU(e) {
        for (let i = 0; i < this.deployUnitList.length; i++) {
          if (this.deployUnitList[i].deployunitname === e) {
            this.tmpmacdepunit.depunitid = this.deployUnitList[i].id
          }
        }
        this.tmpmacdepunit.assembleid = ''
      },

      /**
       * 组件下拉选择事件获取组件id  e的值为options的选值
       */
      selectChangedAS(e) {
        for (let i = 0; i < this.assembleList.length; i++) {
          if (this.assembleList[i].assemblename === e) {
            this.tmpmacdepunit.assembleid = this.assembleList[i].id
          }
        }
        this.tmpmacdepunit.depunitid = ''
      },

      /**
       * 获取服务器环境列表
       */
      getmacdepunitList() {
        this.listLoading = true
        getmacdepunitList(this.listQuery).then(response => {
          this.macdepunitList = response.data.list
          this.total = response.data.total
          this.listLoading = false
        }).catch(res => {
          this.$message.error('加载测试环境服务器列表失败')
        })
      },

      /**
       * 获取环境列表
       */
      getenviromentallList() {
        getenviromentallList().then(response => {
          this.enviromentnameList = response.data
        }).catch(res => {
          this.$message.error('加载测试环境列表失败')
        })
      },

      /**
       * 获取服务器列表
       */
      getmachineLists() {
        getmachineLists().then(response => {
          this.machinenameList = response.data
        }).catch(res => {
          this.$message.error('加载服务器列表失败')
        })
      },

      /**
       * 获取发布单元列表
       */
      getdepunitLists() {
        getdepunitLists().then(response => {
          this.deployUnitList = response.data
          console.log(this.deployunitList)
        }).catch(res => {
          this.$message.error('加载发布单元列表失败')
        })
      },

      /**
       * 获取环境组件名列表
       */
      getassembleLists() {
        getassembleallnameList().then(response => {
          this.assembleList = response.data
        }).catch(res => {
          this.$message.error('加载组件名列表失败')
        })
      },

      searchBy() {
        this.btnLoading = true
        this.listLoading = true
        search(this.search).then(response => {
          this.macdepunitList = response.data.list
          this.total = response.data.total
        }).catch(res => {
          this.$message.error('搜索失败')
        })
        this.tmpenviromentname = this.search.enviromentname
        this.tmpdeployunitname = this.search.deployunitname
        this.listLoading = false
        this.btnLoading = false
      },

      searchBypageing() {
        this.btnLoading = true
        this.listLoading = true
        this.listQuery.enviromentname = this.tmpenviromentname
        this.listQuery.deployunitname = this.tmpdeployunitname
        search(this.listQuery).then(response => {
          this.macdepunitList = response.data.list
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
       * 显示添加测试环境对话框
       */
      showAddmacdepunitDialog() {
        // 显示新增对话框
        this.dialogFormVisible = true
        this.dialogStatus = 'add'
        this.tmpmacdepunit.id = ''
        this.tmpmacdepunit.envid = ''
        this.tmpmacdepunit.machineid = ''
        this.tmpmacdepunit.assembleid = ''
        this.tmpmacdepunit.depunitid = ''
        this.tmpmacdepunit.machinename = ''
        this.tmpmacdepunit.enviromentname = ''
        this.tmpmacdepunit.deployunitname = ''
        this.tmpmacdepunit.assembletype = ''
        this.tmpmacdepunit.domain = ''
        this.tmpmacdepunit.visittype = ''
        this.deployunitVisible = false
        this.assembleVisible = false
        this.domianVisible = false
      },
      /**
       * 添加测试环境
       */
      addmacdepunit() {
        this.$refs.tmpmacdepunit.validate(valid => {
          if (valid) {
            this.btnLoading = true
            addmacdepunit(this.tmpmacdepunit).then(() => {
              this.$message.success('添加成功')
              this.getmacdepunitList()
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
       * 显示修改测试环境对话框
       * @param index 测试环境下标
       */
      showUpdatemacdepunitDialog(index) {
        this.dialogFormVisible = true
        this.dialogStatus = 'update'
        this.tmpmacdepunit.id = this.macdepunitList[index].id
        this.tmpmacdepunit.envid = this.macdepunitList[index].envid
        this.tmpmacdepunit.machineid = this.macdepunitList[index].machineid
        this.tmpmacdepunit.depunitid = this.macdepunitList[index].depunitid
        this.tmpmacdepunit.machinename = this.macdepunitList[index].machinename
        this.tmpmacdepunit.enviromentname = this.macdepunitList[index].enviromentname
        this.tmpmacdepunit.deployunitname = this.macdepunitList[index].deployunitname
        this.tmpmacdepunit.assembletype = this.macdepunitList[index].assembletype
        this.tmpmacdepunit.domain = this.macdepunitList[index].domain
        this.tmpmacdepunit.assembleid = this.macdepunitList[index].assembleid
        this.tmpmacdepunit.visittype = this.macdepunitList[index].visittype
        if (this.tmpmacdepunit.assembletype === '组件') {
          this.deployunitVisible = false
          this.assembleVisible = true
        }
        if (this.tmpmacdepunit.assembletype === '发布单元') {
          this.assembleVisible = false
          this.deployunitVisible = true
        }
        if (this.tmpmacdepunit.visittype === 'ip') {
          this.domianVisible = false
        }
        if (this.tmpmacdepunit.visittype === '域名') {
          this.domianVisible = true
        }
      },
      /**
       * 更新测试环境
       */
      updatemacdepunit() {
        this.$refs.tmpmacdepunit.validate(valid => {
          if (valid) {
            if (this.tmpmacdepunit.visittype === 'ip') {
              this.tmpmacdepunit.domain = ''
            }
            if (this.tmpmacdepunit.assembletype === '组件') {
              this.tmpmacdepunit.visittype = ''
              this.tmpmacdepunit.depunitid = ''
              this.tmpmacdepunit.domain = ''
            }
            if (this.tmpmacdepunit.assembletype === '发布单元') {
              this.tmpmacdepunit.assembleid = ''
            }
            updatemacdepunit(this.tmpmacdepunit).then(() => {
              this.$message.success('更新成功')
              this.getmacdepunitList()
              this.dialogFormVisible = false
            }).catch(res => {
              this.$message.error('更新失败')
            })
          }
        })
      },
      /**
       * 删除测试环境
       * @param index 测试环境下标
       */
      removemacdepunit(index) {
        this.$confirm('删除该测试环境？', '警告', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }).then(() => {
          const id = this.macdepunitList[index].id
          removemacdepunit(id).then(() => {
            this.$message.success('删除成功')
            this.getmacdepunitList()
          })
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },

      /**
       * 测试环境是否唯一
       * @param 测试环境
       */
      isUniqueDetail(macdepunit) {
        for (let i = 0; i < this.macdepunitList.length; i++) {
          if (this.macdepunitList[i].id !== macdepunit.id) { // 排除自己
            if (this.macdepunitList[i].enviromentname === macdepunit.enviromentname) {
              if (this.macdepunitList[i].machinename === macdepunit.machinename) {
                if (this.macdepunitList[i].deployunitname === macdepunit.deployunitname) {
                  this.$message.error('服务器发布单元已存在')
                  return false
                }
              }
            }
          }
        }
        return true
      }
    }
  }
</script>
