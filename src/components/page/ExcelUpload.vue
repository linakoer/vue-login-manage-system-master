<template>
    <div>
        <!-- 面包屑导航 -->
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-plus"></i> 个人中心</el-breadcrumb-item>
                <el-breadcrumb-item>Excel上传</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <!-- 页面标题和说明 -->
        <div class="content-title">支持拖拽或点击上传Excel文件</div>

        <!-- 文件上传区域 -->
        <div class="upload-area">
            <el-upload
                class="upload-demo"
                ref="upload"
                :before-upload="handleBeforeUpload"
                :on-change="handleChange"
                action=""
                :show-file-list="false"
                accept=".xlsx, .xls"
                drag
            >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传 .xlsx 或 .xls 文件</div>
            </el-upload>

            <!-- 提交到数据库按钮 -->
            <el-button
                type="success"
                @click="submitToDatabase"
                :disabled="tableData.length === 0"
                style="margin-top: 20px;"
            >
                提交到数据库
            </el-button>
            <h3>成绩单预览</h3>
        </div>

        <!-- 表格展示区域 -->
        <div v-if="tableData.length > 0" class="table-container">
            <el-table
                :data="tableData"
                style="width: 100%; margin-top: 20px;"
                border
            >
                <el-table-column prop="序号" label="序号" width="80"></el-table-column>
                <el-table-column prop="学号" label="学号" width="120"></el-table-column>
                <el-table-column prop="姓名" label="姓名" width="120"></el-table-column>
                <el-table-column prop="大作业" label="大作业" width="120"></el-table-column>
                <el-table-column prop="实验报告" label="实验报告" width="120"></el-table-column>
                <el-table-column prop="第一次" label="第一次平时作业" width="150"></el-table-column>
                <el-table-column prop="第二次" label="第二次平时作业" width="150"></el-table-column>
                <el-table-column prop="第三次" label="第三次平时作业" width="150"></el-table-column>
                <el-table-column prop="第四次" label="第四次平时作业" width="150"></el-table-column>
                <el-table-column prop="总评成绩" label="总评成绩" width="120"></el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
import * as XLSX from 'xlsx';
import axios from 'axios';

export default {
    data() {
        return {
            tableData: [], // 表格数据
            file: null, // 保存上传的文件
        };
    },
    methods: {
        handleBeforeUpload(file) {
            this.file = file; // 保存文件对象
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, {header: 1});

                // 假设前几行为非数据行（如标题、说明等），需要跳过
                const nonDataRowCount = 6;
                this.tableData = json.slice(nonDataRowCount).map(row => {
                    return {
                        序号: row[0],
                        学号: row[1],
                        姓名: row[2],
                        大作业: parseFloat(row[3] || 0),
                        实验报告: parseFloat(row[4] || 0),
                        第一次: parseFloat(row[5] || 0),
                        第二次: parseFloat(row[6] || 0),
                        第三次: parseFloat(row[7] || 0),
                        第四次: parseFloat(row[8] || 0),
                        总评成绩: this.calculateTotalScore(row)
                    };
                }).filter(item => item.序号 !== undefined && item.序号 !== ""); // 过滤掉可能的空行
            };
            reader.readAsArrayBuffer(file);
            return false; // 返回false阻止默认的上传行为
        },
        calculateTotalScore(row) {
            return (
                parseFloat(row[3] || 0) * 0.6 + // 大作业 60%
                parseFloat(row[4] || 0) * 0.1 + // 实验报告 10%
                parseFloat(row[5] || 0) * 0.05 + // 平时作业第一次 5%
                parseFloat(row[6] || 0) * 0.05 + // 平时作业第二次 5%
                parseFloat(row[7] || 0) * 0.1 + // 平时作业第三次 10%
                parseFloat(row[8] || 0) * 0.1   // 平时作业第四次 10%
            ).toFixed(2); // 保留两位小数
        },
        submitToDatabase() {
            if (!this.file) {
                this.$message.error('请先选择一个文件');
                return;
            }

            const formData = new FormData();
            formData.append('file', this.file);

            axios.post('/api/user/uploadStudents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(response => {
                    this.$message({
                        message: '数据提交成功',
                        type: 'success'
                    });
                    this.tableData = []; // 清空表格数据
                    this.$refs.upload.clearFiles(); // 清除文件列表
                })
                .catch(error => {
                    this.$message.error('数据提交失败，请检查网络连接或文件格式');
                    console.error('Error submitting data:', error);
                });
        }
    }
};
</script>

<style scoped>
.content-title {
    font-weight: 400;
    line-height: 50px;
    margin: 10px 0;
    font-size: 22px;
    color: #1f2f3d;
}

.upload-excel {
    width: 360px;
}

.no-data-tip {
    margin-top: 10px;
    padding: 10px;
    border: 1px dashed #ccc;
    color: #999;
    text-align: center;
}
</style>
