# manage-system #
基于Vue.js 2.x系列 + Element UI + Node.js + Mysql的后台管理系统解决方案。

## 准备工作 ##

需在本地安装 Node.js

## 功能 ##
- [x] Element UI
- [x] 登录/注销
- [x] 上传成绩表
- [x] 学生成绩管理
- [x] mysql
- [x] 图形验证码


## 目录结构介绍 ##

	|-- build                            // webpack配置文件
	|-- config                           // 项目打包路径
	|-- src                              // 源码目录
    ├─service                            // 服务端
    │   │-- app.js                       // express 入口文件
    │   |-- api                          // 接口
    │       │-- userApi.js               // 接口映射文件
    │   |-- db                           // 数据库
    │       |-- db.js                    // 连接数据库
	|   |-- components                   // 组件
	|       |-- common                   // 公共组件
	|           |-- Header.vue           // 公共头部
	|           |-- Home.vue           	 // 公共路由入口
	|           |-- Sidebar.vue          // 公共左边栏
	|		|-- page                   	 // 主要路由页面
	|           |-- ExcelUpload.vue      // 上传成绩表
	|           |-- StudentScores.vue    // 学生成绩管理
	|           |-- Identify.vue         // 图形验证码
	|           |-- Login.vue            // 登录
	|           |-- Readme.vue           // 简介
	|           |-- Register.vue         // 注册组件
    |           |-- Success.vue          // 修改成功
	|   |-- App.vue                      // 页面入口文件
	|   |-- main.js                      // 程序入口文件，加载各种公共组件
	|-- .babelrc                         // ES6语法编译配置
	|-- .editorconfig                    // 代码编写规格
	|-- .gitignore                       // 忽略的文件
	|-- index.html                       // 入口html文件
	|-- package.json                     // 项目及工具的依赖配置文件
	|-- README.md                        // 说明


## 安装步骤 ##

	https://github.com/sakila1012/vue-login-manage-system.git     // 把项目下载到本地
	cd manage-system    // 进入项目目录
	npm install         // 安装项目依赖，等待安装完成之后

## excel上传需知 ##

	// 请使用数据库和成绩表文件夹中的表格进行成绩上传

## 服务端开发 ##

	// 开启后端服务器
	cd service
	node app

## 构建生产 ##

	// 执行构建命令，生成的dist文件夹放在服务器下即可访问
	npm run build
