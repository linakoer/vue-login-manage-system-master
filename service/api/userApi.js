const express = require('express');
const router = express.Router();
const mysql = require('mysql2'); // 使用 mysql2
const XLSX = require('xlsx');
const multer = require('multer');
const fs = require('fs'); // 引入 fs 模块
const path = require('path'); // 引入 path 模块
const upload = multer({ dest: 'uploads/' }); // 临时存储上传的文件
const models = require('../db/db');
const conn = mysql.createConnection(models.mysql);

const jsonWrite = function (res, ret) {
    if (typeof ret === 'undefined') {
        res.send('err');
    } else {
        console.log(ret);
        res.send(ret);
    }
};
const dateStr = function (str) {
    return new Date(str.slice(0, 7));
};

// 增加用户接口
router.post('/addUser', (req, res) => {
    var sql = 'insert into user (username, account, password, repeatPass, email, phone, card, birth, sex) values (?,?,?,?,?,?,?,?,?)';
    var params = req.body;
    console.log(params);
    console.log(params.birth);
    conn.query(sql, [params.name, params.account, params.pass, params.checkPass,
                    params.email, params.phone, params.card, dateStr(params.birth), params.sex], function(err, result) {
        if (err) {
            console.log(err);
        }
        if (result) {
            jsonWrite(res, result);
        }
    })
});

//查找用户接口
router.post('/login', (req, res) => {
    var sql_name = 'select * from user';
    var params = req.body;

    var username = JSON.stringify(params);
    let userstr = username.replace(/[\\[\]"{}()|^$?"+]/g, '');
    let strArr = userstr.split(/:|,/);

    username = strArr[1];
    userpassword = strArr[3];

    if (username) {
        sql_name += " where username ='"+ username +"'";
        // console.log(sql_name);
    }
    conn.query(sql_name, username, function(err, result) {
        if (err) {
            console.log(err);
        }
        // console.log(result);
        if (result[0] === undefined) {
            res.send('-1')   //查询不出username，data 返回-1
        } else {
            var resultArray = result[0];
            // console.log(resultArray);
            // console.log(keywords);
            if(resultArray.password === userpassword) {
                jsonWrite(res, result);
            } else {
                res.send('0')   //username
            }
        }
    })
});

//获取用户信息
router.get('/getUser', (req, res) => {
    var sql_name = 'select * from user';
    var params = req.body;
    console.log(params);
    if (params.name) {
        sql_name += "where username ='"+ params.name +"'";
    }
    conn.query(sql_name, params.name, function(err, result) {
        if (err) {
            console.log(err);
        }
        // console.log(result);
        if (result[0] === undefined) {
            res.send('-1')   //查询不出username，data 返回-1
        } else {
            jsonWrite(res, result);
        }
    })
});

// 添加一个新路由来处理Excel文件上传
router.post('/uploadStudents', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send({ error: 'No file uploaded' });
        }

        // 验证文件扩展名
        const validFileExtensions = ['.xlsx', '.xls'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!validFileExtensions.includes(fileExtension)) {
            return res.status(400).send({ error: 'Invalid file format. Only .xlsx and .xls files are allowed.' });
        }

        // 读取文件内容
        const filePath = file.path;
        const buffer = fs.readFileSync(filePath); // 使用 fs.readFileSync 读取文件内容

        // 确保 buffer 不是 undefined
        if (!buffer || buffer.length === 0) {
            return res.status(400).send({ error: 'File is empty or invalid' });
        }

        // 读取并解析Excel文件
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 跳过非数据行（假设前6行为非数据行）
        const nonDataRowCount = 6;
        const studentData = json.slice(nonDataRowCount).map(row => ({
            student_id: row[1],
            name: row[2],
            assignment_score: parseFloat(row[3] || 0),
            lab_report_score: parseFloat(row[4] || 0),
            homework1_score: parseFloat(row[5] || 0),
            homework2_score: parseFloat(row[6] || 0),
            homework3_score: parseFloat(row[7] || 0),
            homework4_score: parseFloat(row[8] || 0)
        })).filter(item => item.student_id !== undefined && item.student_id !== ""); // 过滤掉可能的空行

        // 插入或更新学生数据
        for (const record of studentData) {
            const { student_id, name, assignment_score, lab_report_score, homework1_score, homework2_score, homework3_score, homework4_score } = record;

            // 检查是否已存在该学生
            const [rows] = await conn.promise().query('SELECT * FROM students WHERE student_id = ?', [student_id]);

            if (rows.length > 0) {
                // 更新现有学生的数据
                await conn.promise().query(
                    'UPDATE students SET name = ?, assignment_score = ?, lab_report_score = ?, homework1_score = ?, homework2_score = ?, homework3_score = ?, homework4_score = ? WHERE student_id = ?',
                    [name, assignment_score, lab_report_score, homework1_score, homework2_score, homework3_score, homework4_score, student_id]
                );
            } else {
                // 插入新学生数据
                await conn.promise().query(
                    'INSERT INTO students (student_id, name, assignment_score, lab_report_score, homework1_score, homework2_score, homework3_score, homework4_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [student_id, name, assignment_score, lab_report_score, homework1_score, homework2_score, homework3_score, homework4_score]
                );
            }
        }

        // 删除临时文件
        fs.unlinkSync(filePath);

        res.status(200).json({ message: '数据提交成功' });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ error: '数据提交失败，请检查网络连接或文件格式' });
    }
});

// 获取所有学生的成绩数据
router.get('/students', async (req, res) => {
    try {
        const [rows] = await conn.promise().query('SELECT * FROM students');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// 更新单个学生的成绩
router.put('/students/:student_id', async (req, res) => {
    const { student_id } = req.params;
    const { assignment_score, lab_report_score, homework1_score, homework2_score, homework3_score, homework4_score } = req.body;

    try {
        // 更新学生的各项成绩，不包括总分
        await conn.promise().query(
            'UPDATE students SET assignment_score = ?, lab_report_score = ?, homework1_score = ?, homework2_score = ?, homework3_score = ?, homework4_score = ? WHERE student_id = ?',
            [assignment_score, lab_report_score, homework1_score, homework2_score, homework3_score, homework4_score, student_id]
        );

        res.json({ message: '成绩更新成功' });
    } catch (error) {
        console.error('Error updating student score:', error);
        res.status(500).json({ error: '成绩更新失败' });
    }
});

// 增加学生接口
router.post('/addStudent', (req, res) => {
    const { student_id, name, assignment_score, lab_report_score, homework1_score, homework2_score, homework3_score, homework4_score } = req.body;

    // 验证必填字段
    if (!student_id || !name) {
        return res.status(400).json({ error: '学号和姓名是必填项' });
    }

    // 验证成绩是否为有效数字，并在0-100范围内
    const validateScore = (score) => !isNaN(score) && score >= 0 && score <= 100;
    if (![assignment_score, lab_report_score, homework1_score, homework2_score, homework3_score, homework4_score].every(validateScore)) {
        return res.status(400).json({ error: '请输入有效的成绩（0-100分）' });
    }

    // 插入新学生数据
    const insertQuery = 'INSERT INTO students (student_id, name, assignment_score, lab_report_score, homework1_score, homework2_score, homework3_score, homework4_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [student_id, name, assignment_score, lab_report_score, homework1_score, homework2_score, homework3_score, homework4_score];

    conn.query(insertQuery, values, (error, results) => {
        if (error) {
            console.error('Error adding student:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                // 如果是唯一键冲突（例如学号重复），返回400错误
                return res.status(400).json({ error: '该学号已存在，请使用其他学号' });
            }
            // 对于其他未知错误，返回500错误
            return res.status(500).json({ error: '新增学生失败，请检查输入并重试' });
        }

        // 检查是否有受影响的行
        if (results.affectedRows > 0) {
            // 返回成功响应，包括新学生的ID
            jsonWrite(res, {
                message: '新增学生成功',
            });
        } else {
            // 如果没有受影响的行，返回500错误
            jsonWrite(res, { error: '新增学生失败，请检查输入并重试' });
        }
    });
});

// 批量删除学生接口
router.post('/deleteStudents', (req, res) => {
    const { studentIds } = req.body;

    // 验证 studentIds 是否为非空数组
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ error: '请提供有效的学生ID列表' });
    }

    // 构建批量删除查询
    const deleteQuery = 'DELETE FROM students WHERE student_id IN (?)';
    const values = [studentIds];

    conn.query(deleteQuery, values, (error, results) => {
        if (error) {
            console.error('Error deleting students:', error);
            return res.status(500).json({ error: '删除失败，请检查输入并重试' });
        }

        // 检查是否有受影响的行
        if (results.affectedRows > 0) {
            // 返回成功响应
            res.status(200).json({
                message: '删除成功',
                affectedRows: results.affectedRows,
            });
        } else {
            // 如果没有受影响的行，返回404错误
            res.status(404).json({ error: '未找到要删除的学生' });
        }
    });
});

module.exports = router;
