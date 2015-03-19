
# 聊天室

[![Build Status](https://secure.travis-ci.org/Automattic/socket.io.svg)](http://travis-ci.org/Automattic/socket.io)
![NPM version](https://badge.fury.io/js/socket.io.svg)
![Downloads](http://img.shields.io/npm/dm/socket.io.svg?style=flat)

## 使用方法

目前需要本机安装node.js 环境并且安装mongodb

进入目录

首先进入mongod 所在目录我们假定实在d盘下面mongodb文件夹

mongod --dbpath=d:\mongodata  (可以自己定义路径)

直接运行 node app.js  当然也可以使用 pm2 管理你的应用,在运行前需要启动mongodb 服务



## 基本功能:

`````text

 - `用户欢迎`

 - `在线用户列表`

 - `在线用户列表详情信息显示 通过数据库需要本机安装mongodb并且修改setting.js`

 - `聊天信息`

 - `聊天室列表`

 - `用户注册登录`

 - `聊天室公告推送`