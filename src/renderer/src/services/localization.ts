import LocalizedStrings from 'react-localization'

export const strings = new LocalizedStrings({
  en: {
    backHome: 'Back Homepage',
    settings: 'Settings',
    caInstalled: 'ApiTune CA Certificate Installed',
    caNotTrust: 'ApiTune CA Certificate Not Trusted',
    trustCa: 'Trust ApiTune CA',
    requireRoot: 'Require root privileges',
    exportCa: 'Export CA File',
    update: 'Update',
    ca: 'CA',
    proxyPort: 'Proxy Port',
    themes: 'Themes',
    language: 'Language',
    apiRules: 'API Rules',
    network: 'Network',
    test: 'Test',
    addRuleToCreateTest: 'Add rule to create a test',
    testAll: 'All',
    testFailed: 'Failed',
    testPassed: 'Passed',
    testResults: 'Test Results',
    reqDetails: 'Request Details',
    somethingWrong: 'Oops! Something went wrong with your operation.',
    clearLog: 'Clear Log',
    filter: 'Filter',
    ruleMatched: 'Rule Matched',
    all: 'All',
    pause: 'Pause',
    resume: 'Resume',
    protocol: 'Protocol',
    host: 'Host',
    path: 'Path',
    status: 'Status',
    matchedRules: 'MatchedRules',
    method: 'Method',
    cannotPreview: 'Can not preview this type, you can see the results in response body',
    general: 'General',
    requestUrl: 'Request URL',
    requestMethod: 'Request Method',
    remoteAddress: 'Remote Address',
    requestHeaders: 'Request Headers',
    requestParameters: 'Request Parameters',
    requestBody: 'Request Body',
    responseHeaders: 'Response Headers',
    responseBody: 'Response Body',
    request: 'Request',
    response: 'Response',
    preview: 'Preview',
    statusCode: 'Status Code',
    noTestResults: 'No Test Results',
    createNewTest: 'Create new rule to test api result',
    rule: 'Rule',
    enableGroup: 'Enable Group',
    disableGroup: 'Disable Group',
    enableRule: 'Enable Rule',
    disableRule: 'Disable Rule',
    disableTooltip: 'The rule group is disabled. Please enable it first.',
    addRule: 'Add Rule',
    rename: 'Rename',
    delete: 'Delete',
    addGroup: 'Add Group',
    goGroupList: 'Go Group List',
    edit: 'Edit',
    new: 'New',
    ruleGroupName: 'Rule Group Name',
    group: 'group',
    deleteTitle: 'Are you sure delete "{0}"?',
    deleteDesc: 'Your will not be able to recover this {0}!',
    yes: 'Yes',
    no: 'No',
    groupName: 'Group Name',
    groupEnabled: 'Group Enabled',
    updatedOn: 'Updated on',
    actions: 'Actions',
    ruleName: 'Rule Name',
    description: 'Description',
    ruleEnabled: 'Rule Enabled',
    myWorkspace: 'My Workspace',
    proxyServerListeningOn: 'Proxy server listening on',
    requestModify: 'Request Modify',
    responseModify: 'Response Modify',
    rewriteRequest: 'Rewrite Request',
    modifyReqHeaders: 'Modify Request Headers',
    modifyReqBody: 'Modify Request Body',
    addReqFunction: 'Add Request Function',
    addReqSpeedLimit: 'Add Request Speed Limit',
    modifyResStatus: 'Modify Response Status',
    modifyResHeaders: 'Modify Response Headers',
    modifyResBody: 'Modify Response Body',
    addResFunction: 'Add Response Function',
    addResDelay: 'Add Response Delay',
    editRule: 'Edit Rule',
    createNewRule: 'Create New Rule',
    save: 'Save',
    enabled: 'Enabled',
    disabled: 'Disabled',
    ruleInfo: 'Rule Info',
    matchRules: 'Match Rules',
    url: 'URL',
    contains: 'Contains',
    equals: 'Equals',
    matchesRegex: 'Matches (Regex)',
    isRequired: '{0} is required',
    addRuleName: 'Add Rule Name',
    addRuleDescription: 'Add Rule Description (Optional)',
    matchValue: 'Match Value',
    testMatchValue: 'Test Match Value',
    reqMethodsFilter: 'Request Methods Filter',
    selectMethods: 'Select methods (leave empty to match all)',
    addRules: 'Add Rules',
    removeRule: 'Remove Rule',
    snippets: 'Snippets',
    rules: 'Rules',
    testAndScripts: 'Test&Script',
    ruleNotFound: 'Rule not found',
    youCanModify: 'You can modify {0} here,',
    contextVarYouCanUse: 'Context variables you can use:',
    codeExamples: 'Code Examples',
    changeTarget: 'change {0}',
    changeByReqParams: 'Change response data by request params',
    koaContext: 'Koa Context',
    requestInfo: 'Request Info',
    reqParamsDesc: 'Request parameters, you can get GET or POST params here',
    modifyBody: 'Modify {0} Body',
    bodyRuleRequired: 'Body Rule is required',
    funcRequired: 'Function is required',
    modifyFunction: 'Modify {0} Body with Javascript',
    modifyHeaders: 'Modify {0} Headers',
    add: 'Add',
    override: 'Override',
    remove: 'Remove',
    addNewHeaderRule: 'Add New Header Rule',
    headerNameRequired: 'Header name is required',
    headerValueRquired: 'Header value is required',
    repDelayTime: 'Response Delay time',
    delayRequired: 'Delay time is required',
    inputResDelayTime: 'Please input response delay time',
    repStatus: 'Response Status',
    rewriteTo: 'Rewrite to',
    rewriteUrlRequired: 'Rewrite url is required',
    invalidUrl: 'Invalid url',
    inputRewriteUrl: 'Please input rewrite url',
    speedLimit: 'Speed Limit',
    speedLimitRequired: 'Speed limit is required',
    inputSpeedLimit: 'Please input speed limit',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    syncing: 'Start syncing rule data',
    synced: 'Rule data synced',
    syncedDiffDetected: 'Synced rule data is different from local rule data, do you want to sync?',
    syncedDiffDesc: 'Local rule data will be overwritten by synced rule data',
    syncUseServer: 'Use server data',
    syncUseLocal: 'Use local data'
  },
  zh: {
    backHome: '返回首页',
    settings: '设置',
    caInstalled: 'ApiTune CA 证书已安装',
    caNotTrust: 'ApiTune CA 证书未受信任',
    trustCa: '信任 ApiTune CA',
    requireRoot: '需要 root 权限',
    exportCa: '导出 CA 文件',
    update: '更新',
    ca: '证书',
    proxyPort: '代理端口',
    themes: '主题',
    language: '语言',
    apiRules: 'API 规则',
    network: '网络',
    test: '测试',
    addRuleToCreateTest: '添加规则以创建测试用例',
    testAll: '全部用例',
    testFailed: '失败用例',
    testPassed: '通过用例',
    testResults: '测试结果',
    reqDetails: '请求详情',
    somethingWrong: '哎呀！您的操作出了点问题。',
    clearLog: '清空日志',
    filter: '过滤',
    ruleMatched: '已匹配规则',
    all: '全部',
    pause: '暂停',
    resume: '继续',
    protocol: '协议',
    host: '域名',
    path: '路径',
    status: '状态',
    matchedRules: '匹配规则',
    method: '方法',
    cannotPreview: '无法预览此类型，您可以在响应body中查看结果',
    general: '概要',
    requestUrl: '请求 URL',
    requestMethod: '请求方法',
    remoteAddress: '远程地址',
    requestHeaders: '请求头',
    requestParameters: '请求参数',
    requestBody: '请求体',
    responseHeaders: '响应头',
    responseBody: '响应体',
    request: '请求',
    response: '响应',
    preview: '预览',
    statusCode: '状态码',
    noTestResults: '没有测试结果',
    createNewTest: '创建新规则以测试 API 结果',
    rule: '规则',
    enableGroup: '启用分组',
    disableGroup: '禁用分组',
    enableRule: '启用规则',
    disableRule: '禁用规则',
    disableTooltip: '规则分组已禁用，请先启用',
    addRule: '添加规则',
    rename: '重命名',
    delete: '删除',
    addGroup: '添加分组',
    goGroupList: '前往分组列表',
    edit: '编辑',
    new: '新建',
    group: '分组',
    ruleGroupName: '规则组名称',
    deleteTitle: '确定要删除 "{0}" 吗？',
    deleteDesc: '您将无法恢复此规则{0}！',
    yes: '是',
    no: '否',
    groupName: '分组名称',
    groupEnabled: '分组是否启用',
    updatedOn: '更新时间',
    actions: '操作',
    ruleName: '规则名称',
    description: '描述',
    ruleEnabled: '规则是否启用',
    myWorkspace: '我的工作区',
    proxyServerListeningOn: '代理服务器监听地址',
    requestModify: '修改请求',
    responseModify: '修改响应',
    rewriteRequest: '重写请求',
    modifyReqHeaders: '修改请求头',
    modifyReqBody: '修改请求体',
    addReqFunction: '添加请求函数',
    addReqSpeedLimit: '添加请求速度限制',
    modifyResStatus: '修改响应状态',
    modifyResHeaders: '修改响应头',
    modifyResBody: '修改响应体',
    addResFunction: '添加响应函数',
    addResDelay: '添加响应延迟',
    editRule: '编辑规则',
    createNewRule: '创建新规则',
    save: '保存',
    enabled: '启用',
    disabled: '禁用',
    ruleInfo: '规则信息',
    matchRules: '匹配规则',
    url: 'URL',
    contains: '包含',
    equals: '等于',
    matchesRegex: '匹配 (正则)',
    isRequired: '{0}是必填项',
    addRuleName: '添加规则名称',
    addRuleDescription: '添加规则描述 (可选)',
    matchValue: '匹配值',
    testMatchValue: '测试匹配值',
    reqMethodsFilter: '请求方法过滤',
    selectMethods: '选择方法 (留空匹配所有)',
    addRules: '添加规则',
    removeRule: '删除规则',
    snippets: '代码片段',
    rules: '规则',
    testAndScripts: '测试&脚本',
    ruleNotFound: '未找到规则',
    youCanModify: '您可以在这里修改{0}',
    contextVarYouCanUse: '您可以使用的上下文变量',
    codeExamples: '代码示例',
    changeTarget: '修改{0}',
    changeByReqParams: '通过请求参数修改响应数据',
    koaContext: 'Koa 上下文',
    requestInfo: '请求信息',
    reqParamsDesc: '请求参数，您可以在这里获取 GET 或 POST 参数',
    modifyBody: '修改{0}体',
    bodyRuleRequired: 'Body 规则是必填项',
    funcRequired: '函数是必填项',
    modifyFunction: '使用 Javascript 修改{0}体',
    modifyHeaders: '修改{0}头',
    add: '添加',
    override: '覆盖',
    remove: '删除',
    addNewHeaderRule: '添加新的头部规则',
    headerNameRequired: '头部名称是必填项',
    headerValueRquired: '头部值是必填项',
    repDelayTime: '响应延迟时间',
    delayRequired: '延迟时间是必填项',
    inputResDelayTime: '请输入响应延迟时间',
    repStatus: '响应状态',
    rewriteTo: '重写为',
    rewriteUrlRequired: '重写 URL 是必填项',
    invalidUrl: '无效的 URL',
    inputRewriteUrl: '请输入重写 URL',
    signIn: '登录',
    signOut: '登出',
    syncing: '开始同步规则数据',
    synced: '规则数据已同步',
    syncedDiffDetected: '同步的规则数据与本地规则数据不同，是否同步？',
    syncedDiffDesc: '本地规则数据将被同步的规则数据覆盖',
    syncUseServer: '使用服务器数据',
    syncUseLocal: '使用本地数据'
  }
})
