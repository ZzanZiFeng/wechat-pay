## 微信支付
### 超级个体
- 高度专业化的技能和知识
- 利用数字工具和平台
- 独立自主
- 全球范围的影响力
- 网络协作和众包

## 微信支付
- 常见有二种商户资格
  - 个人工商户
  - 公司

## 接入 微信支付
- 申请APPID 应用ID
  - 注册微信公众平台
  - 选择账号类型 建议选择服务号或小程序
  - 验证企业信息
  - 申请微信支付的功能的时候
  - 等待审核
  - 获取APPID，可以在后台找到这个APPID
- 申请商户号 MCH_ID
  - 注册微信支付商户平台
  - 选择账号类型 可以普通商户或服务商
  - 填写商户信息
  - 上传相关的证件和资料
  - 提交审核
  - 审核成功事可以在后台获取商户ID MCH_ID
  - 这个商户的ID是你的微信支付系统中的唯一标识，用于处理和管理所有的微信支付的交易
  - 然后再配置相关的API功能
- 让APPID和MCHID相关关联 
 - 在支付平台给商户号指定APPID
  - 登录商户平台
  - 访问开发配置
  - 配置API安全
  - 输入APPID
  - 保审核就可以了
 - 在微信公众号平台指定商户ID
   - 登录微信公众平台
   - 访问支付配置
   - 输入商户号
   - 保存、提交 审核就可以 
- 配置APIV3密钥   
  - 可以加强API的调用安全，用于生成签名和验证应答保证数据传输的安全性
    - 登录支付平台
    - 访问API安全
    - 生成密钥
    - 记住你的密钥
- 申请并下载商务证书
   - 登录支付平台
   - 访问API安全
   - 申请商户证书
   - 下载证书到本地在项目中使用

##  加解密安全
### 基本概念
- 明文
- 密文
- 密钥
- 加密
- 解密
- 加密算法 AES RSA DES  不同的加密算法有不同的密钥
 5+4=9
 9-4=5

 ### 对称加密非对称加密
 - 对称加密 加密和解密使用相同的密钥
   - 密钥共享
   - 加密速度快
   - 难点是分发的时候容易泄露
   - 常见的算法 AES(高级加密标准) DES(数据加密标准) 3DES(三重数据加密算法)
   - 微信支付中用的是AES-256-GCM进行对称加密数据的
- 非对称加密
  - 非对称加密密钥有一共，一个公钥，一个是私钥，这二个密钥在数学上相关的，但是不能通过一个算出另一个
  - 有公钥和私钥  公钥可以公共分享，用于加密，私钥是保密的，只有所有者才知道，用于解密
  - 安全性高 因为不需要通知网络传输密钥
  - 速度比较慢，不适合加密解密大量的数据
  - 常的算法 RSA ECC
- 非对称加密有两个作用
 - 加密信息
    - 使用公钥加密，使用私聊解密
  - 身份认证
    - 使用私钥生成签名 发送方使用私钥对信息进行数字签名
    - 接收方使用公钥解密签名，验证签名是否正确 
    - 可以保证身份和完整性
- 所以说为了保证安全性和速度，对称加密和非对称加密需要配合使用
   - 非对称加密可以安全的交接对称加密的密钥，一旦密钥完成交换了，后面的数据传输会使用对称加密来完成
- 摘要算法
 - 摘要算法也称为散列函数(Hash Function)
 - 主要作用是将任意长度的数据默认成为固定长度比较 短的的值 ，这个值称为散列值和摘要 
 - 特点
   - 确定性
   - 高效性 计算非常快
   - 不可逆 不能从摘要中反推输入
   - 冲突抵抗 不同的输入会产生不同的输出
 - 用途
   - 验证数据完整性 11 1 => 11->1   
   - 安全密码的存储 用户注册后，保存到数据库里的不同明文的密码，而是密码的摘要
   - 数字签名 散列函数可以用于数字签名，保证消息的真实性的完整性
 - 常见算法
   - MD5 128
   - SHA-1  160
   - SHA-256 产出256位的散列值 在微信支付中用的也是SHA-256

- 数字签名
  - 数字签名用来验证数据的完整性和真实性
  - 原理和过程
    - 数字签名基于非对称加密算法实现，涉及一个公钥和一个私钥
    - 1.签名生成
      - 有一个原始的字符串"hello",对它进行散列处理，生成一个唯一的摘要也就是哈希值 "h"
      - 对摘要h使用私钥进行加密，得到的加密结果就是数字签名k，然后就把信息发给对方
    - 2.签名验证
      - 解密摘要 把k用公钥进行解密得到摘要h,
      - 接收方使用同样的方式对原始信息进行散列处理，接收方也根据"hello"原始字符串计算一个摘要出来。
      然后和解密后得到的摘要进行对比，如果两个一样，则验证成功
  - 作用
    - 验证身份
    - 保证完整性
    - 不可否认性
- 数字证书
 - 数字证书是一种用于验证实体身份的电子文档
 - 它使用公钥基础设施，将公钥与身份信息相结合，提供一种安全验证方式，类似于人的身份证或护照
 - 证书的核心组件 类似于身份证
   - 证书持有者的身份信息 电子邮件地址 名称 组织 类似你的名字
   - 证书持有者的公钥 用于非对称加密的数字签名 类似于身份证号
   - 颁发机构 一般是CA等权威机构颁发的，身份证是由公安局颁发的
   - 有效期限 
   - 证书序列号 唯一的标识 证书的编写
   - 数字签名 证书颁发机构(CA)使用自己的私钥对证书进行签名，类似公安局的用自己的公章盖章
 - 具体的流程
   - 证书申请者自己生成密钥对（公钥和私钥）
   - 提交证书签名请求（CSR） 申请者自己创建证书签名请求，包括公钥和身份信息
   - CA机构处理请求，CA机构会验证申请者的身份信息，然后用CA的私钥对申请者的公钥进行签名
   - 颁发证书
   - CA机构是操作系统内置的
 - 应用场景 
   - 网站安全 应用在网站上就是HTTPS   

- RSA-SHA256
  - 在数字签名领域非常常见
  - 结合两种不同的技术，RSA负责加密 SHA256负责生成摘要或者哈希
  - RSA用来进行非对称加密 ，有公钥和私钥
  - SHA246是一种安全的HASH算法，用来生成摘要
  - 结合起来如何工作
    - 可以用来数字签名领域
    - 签名的过程
      - 在数据签名的时候，指的是先把消息使用SHA256生成消息的摘要，然后用RSA私钥加密该摘要生成签名
    - 验证过程
      - 收件人收到，使用相同的SHA256算法对原始消息生成摘要，然后使用发送者的公钥解密签名以获取摘要
      - 如果两者匹配则证明消息确认来自声称的发送者并且未被篡改
   - 收件人应该是先用公钥解密之后 才能用SHA256生成摘要吧
   - 发送方有消息和摘要还有签名，然后发送给接收方的是消息和签名
   - 接收方收到消息和签名，然后分别独立并行进行处理
     - 解密签名得到摘要
     - 重新使用SHA256算法根据消息生成摘要
   - 然后比较两个是不是一样的，
   - 有个问题，现在我们的签名信息包含随机字符串和时间戳。验证的时候如何获得这个随机字符串和时间戳去验证呢？
   - 因为我们要把随机串和时间戳也发给服务器  

- PEM
  - Privacy-Enhanced Mail是一种存储和发送加密数据的文本格式，用于保存加密的密钥和证书
  - ASCII编写
  - Base64编码
  - 标头和标尾 
  - 可以用于存储证书、公钥、私钥  

- AES_256_GCM
  - AES_256_GCM是一种对称加密算法
  - 包括以下几部分
    - AES (Advanced Encryption Standard) 是一种对称加密标准，加密和解密用的是同一个密钥
    - 256 位的密钥长度 指的是加密的密钥的长度
    - GCM (Galois Counter Mode)是一种操作模式，保证加密，保证数据的保密性，另一个是认证，验证数据完整性和真实性
    - 可以加密，也可以认证，适合网络传输
