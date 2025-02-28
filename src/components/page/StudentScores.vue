<template>
    <div class="student-scores">
        <!-- 面包屑导航 -->
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-menu"></i> 个人中心</el-breadcrumb-item>
                <el-breadcrumb-item>学生成绩管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <div style="margin-bottom: 20px;">
            <el-button type="danger" @click="deleteSelectedStudents" :disabled="!selectedStudents.length">删除选定学生</el-button>
            <el-button type="primary" @click="showAddStudentDialog = true">新增学生</el-button>
        </div>

        <el-table
            :data="paginatedStudents"
            style="width: 100%"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="index" label="序号" width="80"></el-table-column>
            <el-table-column prop="student_id" label="学号" width="120"></el-table-column>
            <el-table-column prop="name" label="姓名" width="120"></el-table-column>
            <el-table-column prop="assignment_score" label="大作业 (60%)" width="120">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.assignment_score"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="lab_report_score" label="实验报告 (10%)" width="120">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.lab_report_score"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="homework1_score" label="平时作业 第一次 (5%)" width="160">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.homework1_score"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="homework2_score" label="平时作业 第二次 (5%)" width="160">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.homework2_score"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="homework3_score" label="平时作业 第三次 (10%)" width="160">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.homework3_score"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="homework4_score" label="平时作业 第四次 (10%)" width="160">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.homework4_score"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="final_score" label="总评成绩 (100%)" width="120"></el-table-column>
            <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                    <el-button size="mini" @click="saveStudentScores(scope.row)">保存</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 统计信息面板 -->
        <div class="statistics-panel" style="margin: 20px 0;">
            <h3>班级成绩统计</h3>
            <ul>
                <li>总评成绩平均分: {{ statistics.averageScore }}</li>
                <li>最高分: {{ statistics.highestScore }} (学生学号: {{ statistics.topStudent.student_id }}, 学生姓名：{{ statistics.topStudent.name }})</li>
                <li>最低分: {{ statistics.lowestScore }} (学生学号: {{ statistics.bottomStudent.student_id }}, 学生姓名：{{ statistics.bottomStudent.name }})</li>
                <li>分差: {{ statistics.scoreRange }}</li>
                <li>不及格人数: {{ statistics.failCount }}</li>
                <li>90分以上人数: {{ statistics.excellentCount }}</li>
                <li v-for="(count, key) in statistics.gradeDistribution" :key="key">
                    {{ key }} 分数段人数: {{ count.count }}, 平均分: {{ count.average }}
                </li>
            </ul>
        </div>

        <el-pagination
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="prev, pager, next"
            :total="students.length"
            style="margin-top: 20px; text-align: center;"
        ></el-pagination>

        <!-- 新增学生弹窗 -->
        <el-dialog title="新增学生" :visible.sync="showAddStudentDialog" width="30%">
            <el-form :model="newStudent" label-width="120px">
                <el-form-item label="学号">
                    <el-input v-model="newStudent.student_id" placeholder="请输入学号"></el-input>
                </el-form-item>
                <el-form-item label="姓名">
                    <el-input v-model="newStudent.name" placeholder="请输入姓名"></el-input>
                </el-form-item>
                <el-form-item label="大作业 (60%)">
                    <el-input v-model="newStudent.assignment_score" placeholder="请输入大作业成绩"></el-input>
                </el-form-item>
                <el-form-item label="实验报告 (10%)">
                    <el-input v-model="newStudent.lab_report_score" placeholder="请输入实验报告成绩"></el-input>
                </el-form-item>
                <el-form-item label="平时作业 第一次 (5%)">
                    <el-input v-model="newStudent.homework1_score" placeholder="请输入第一次平时作业成绩"></el-input>
                </el-form-item>
                <el-form-item label="平时作业 第二次 (5%)">
                    <el-input v-model="newStudent.homework2_score" placeholder="请输入第二次平时作业成绩"></el-input>
                </el-form-item>
                <el-form-item label="平时作业 第三次 (10%)">
                    <el-input v-model="newStudent.homework3_score" placeholder="请输入第三次平时作业成绩"></el-input>
                </el-form-item>
                <el-form-item label="平时作业 第四次 (10%)">
                    <el-input v-model="newStudent.homework4_score" placeholder="请输入第四次平时作业成绩"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
        <el-button @click="showAddStudentDialog = false">取 消</el-button>
        <el-button type="primary" @click="addNewStudent">确 定</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            students: [],
            currentPage: 1,
            pageSize: 8,
            selectedStudents: [], // 用于存储选中的学生
            showAddStudentDialog: false, // 控制新增学生弹窗的显示状态
            newStudent: {
                student_id: '',
                name: '',
                assignment_score: 0,
                lab_report_score: 0,
                homework1_score: 0,
                homework2_score: 0,
                homework3_score: 0,
                homework4_score: 0,
            },
            loading: false, // 用于显示加载状态
            statistics: {
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                scoreRange: 0,
                topStudent: { student_id: '0', name: '0' },
                bottomStudent: { student_id: '0', name: '0' },
                failCount: 0,
                excellentCount: 0,
                gradeDistribution: {
                    '90+': { count: 0, sum: 0, average: 0 },
                    '80+': { count: 0, sum: 0, average: 0 },
                    '70+': { count: 0, sum: 0, average: 0 },
                    '60+': { count: 0, sum: 0, average: 0 },
                    '不及格': { count: 0, sum: 0, average: 0 }
                }
            },
        };
    },
    computed: {
        paginatedStudents() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.students.slice(start, end);
        },
    },
    created() {
        this.fetchStudents();
    },
    methods: {
        calculateStatistics() {
            if (!this.students.length) return;

            const scores = this.students.map(student => parseFloat(student.final_score));
            const averageScore = scores.reduce((acc, curr) => acc + curr, 0) / scores.length;
            const highestScore = Math.max(...scores);
            const lowestScore = Math.min(...scores);
            const scoreRange = highestScore - lowestScore;
            const topStudent = this.students.find(student => parseFloat(student.final_score) === highestScore);
            const bottomStudent = this.students.find(student => parseFloat(student.final_score) === lowestScore);
            const failCount = this.students.filter(student => parseFloat(student.final_score) < 60).length;
            const excellentCount = this.students.filter(student => parseFloat(student.final_score) >= 90).length;

            const gradeDistribution = {
                '90+': { count: 0, sum: 0 },
                '80+': { count: 0, sum: 0 },
                '70+': { count: 0, sum: 0 },
                '60+': { count: 0, sum: 0 },
                '不及格': { count: 0, sum: 0 }
            };

            this.students.forEach(student => {
                const score = parseFloat(student.final_score);
                let key = '';
                if (score >= 90) key = '90+';
                else if (score >= 80) key = '80+';
                else if (score >= 70) key = '70+';
                else if (score >= 60) key = '60+';
                else key = '不及格';

                gradeDistribution[key].count++;
                gradeDistribution[key].sum += score;
            });

            Object.keys(gradeDistribution).forEach(key => {
                if (gradeDistribution[key].count > 0) {
                    gradeDistribution[key].average = (gradeDistribution[key].sum / gradeDistribution[key].count).toFixed(2);
                } else {
                    gradeDistribution[key].average = 'N/A';
                }
            });

            this.statistics = {
                averageScore: averageScore.toFixed(2),
                highestScore: highestScore.toFixed(2),
                lowestScore: lowestScore.toFixed(2),
                scoreRange: scoreRange.toFixed(2),
                topStudent,
                bottomStudent,
                failCount,
                excellentCount,
                gradeDistribution
            };
        },
        async fetchStudents() {
            this.loading = true;
            try {
                const response = await axios.get('/api/user/students'); // 确保URL正确
                this.students = response.data;
            } catch (error) {
                console.error('Error fetching students:', error);
                this.$message.error('获取学生成绩失败，请稍后再试。');
            } finally {
                this.loading = false;
            }
            // 只有在成功获取数据后才计算统计信息
            this.calculateStatistics();
        },
        async saveStudentScores(student) {
            this.loading = true;
            try {
                await axios.put(`/api/user/students/${student.student_id}`, {
                    assignment_score: student.assignment_score,
                    lab_report_score: student.lab_report_score,
                    homework1_score: student.homework1_score,
                    homework2_score: student.homework2_score,
                    homework3_score: student.homework3_score,
                    homework4_score: student.homework4_score,
                });

                // 重新获取数据以更新总分和其他可能变化的数据
                await this.fetchStudents();
                // 更新统计信息
                this.calculateStatistics();
                this.$message({
                    message: '成绩更新成功',
                    type: 'success'
                });
            } catch (error) {
                console.error('Error updating student score:', error);
                this.$message.error('成绩更新失败，请检查输入并重试。');
            } finally {
                this.loading = false;
            }
        },
        handlePageChange(page) {
            this.currentPage = page;
        },
        handleSelectionChange(selection) {
            this.selectedStudents = selection;
        },
        async deleteSelectedStudents() {
            if (!this.selectedStudents.length) return;

            try {
                // 弹出确认对话框
                await this.$confirm('此操作将永久删除选定的学生, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                // 准备批量删除的请求数据
                const studentIds = this.selectedStudents.map(student => student.student_id);

                // 发送批量删除请求
                const response = await axios.post('/api/user/deleteStudents', { studentIds });

                // 检查响应状态码
                if (![200, 201].includes(response.status)) {
                    throw new Error('删除失败，请检查输入并重试。');
                }

                // 重新获取数据
                await this.fetchStudents();
                // 更新统计信息
                this.calculateStatistics();
                this.$message({
                    message: '删除成功',
                    type: 'success'
                });
            } catch (error) {
                if (error === 'cancel') {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                } else {
                    console.error('Error deleting students:', error);
                    if (error.response) {
                        // 处理有响应的错误（如4xx, 5xx）
                        this.$message.error(error.response.data.error || '删除失败。');
                    } else {
                        // 处理无响应的错误（如网络错误）
                        this.$message.error('网络请求失败，请检查网络连接。');
                    }
                }
            }
        },
        async addNewStudent() {
            this.loading = true;
            try {
                // 验证必填字段
                if (!this.newStudent.student_id || !this.newStudent.name) {
                    this.$message.error('学号和姓名是必填项');
                    return;
                }

                // 验证成绩是否为有效数字，并在0-100范围内
                const validateScore = (score) => !isNaN(score) && score >= 0 && score <= 100;
                const scores = [
                    this.newStudent.assignment_score,
                    this.newStudent.lab_report_score,
                    this.newStudent.homework1_score,
                    this.newStudent.homework2_score,
                    this.newStudent.homework3_score,
                    this.newStudent.homework4_score
                ];

                if (!scores.every(validateScore)) {
                    this.$message.error('请输入有效的成绩（0-100分）');
                    return;
                }

                // 发送POST请求添加新学生
                const response = await axios.post('/api/user/addStudent', {
                    student_id: this.newStudent.student_id,
                    name: this.newStudent.name,
                    assignment_score: parseFloat(this.newStudent.assignment_score),
                    lab_report_score: parseFloat(this.newStudent.lab_report_score),
                    homework1_score: parseFloat(this.newStudent.homework1_score),
                    homework2_score: parseFloat(this.newStudent.homework2_score),
                    homework3_score: parseFloat(this.newStudent.homework3_score),
                    homework4_score: parseFloat(this.newStudent.homework4_score),
                });

                // 检查响应状态码
                if (![200, 201].includes(response.status)) {
                    throw new Error('新增学生失败，请检查输入并重试。');
                }

                // 重新获取数据并关闭弹窗
                await this.fetchStudents();
                this.showAddStudentDialog = false;
                this.resetNewStudentForm();
                // 更新统计信息
                this.calculateStatistics();
                this.$message({
                    message: '新增学生成功',
                    type: 'success'
                });
            } catch (error) {
                console.error('Error adding new student:', error);
                if (error.response) {
                    // 处理有响应的错误（如4xx, 5xx）
                    this.$message.error(error.response.data.error || '新增学生失败。');
                } else {
                    // 处理无响应的错误（如网络错误）
                    this.$message.error('网络请求失败，请检查网络连接。');
                }
            } finally {
                this.loading = false;
            }
        },
        resetNewStudentForm() {
            // 重置新增学生的表单
            this.newStudent = {
                student_id: '',
                name: '',
                assignment_score: 0,
                lab_report_score: 0,
                homework1_score: 0,
                homework2_score: 0,
                homework3_score: 0,
                homework4_score: 0,
            };
        }
    }
};
</script>

<style scoped>
.el-table {
    margin-bottom: 20px;
}
</style>
