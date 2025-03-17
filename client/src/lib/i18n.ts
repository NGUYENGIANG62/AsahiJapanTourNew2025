import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const enTranslations = {
  common: {
    appName: 'AsahiJapanTours',
    login: 'Login',
    logout: 'Logout',
    home: 'Home',
    back: 'Back',
    next: 'Next',
    calculate: 'Calculate Total',
    previous: 'Previous',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    admin: 'Admin',
    user: 'User',
    yes: 'Yes',
    no: 'No',
    of: 'of',
    showing: 'Showing',
    actions: 'Actions',
    currency: 'Currency',
    and: 'and',
    overview: 'Overview',
    refresh: 'Refresh',
    details: 'Details',
    included: 'Included',
    notIncluded: 'Not Included',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    profit: 'Service Fee',
    login_error: 'Invalid ID or password. Please try again.',
    login_success: 'Login successful',
    not_authenticated: 'You need to login to access this page',
    welcomeMessage: 'Welcome to AsahiJapanTours.com',
    welcomeDescription: 'Thank you for choosing our service. We are committed to bringing you the best Japan travel experience!',
    preferredLocations: 'Preferred Locations',
    tourFor: 'Tour for',
    pricePerPerson: 'Price per person',
    tourExceedsDuration: 'Your selected days ({days} days) exceeds the standard tour duration ({standardDays} days). Please enter your preferred locations in the "Preferred Locations" field.',
    startMessage: 'Thank you for your interest in our tour service. Start by selecting dates for your trip!'
  },
  auth: {
    id: 'ID',
    password: 'Password',
    enterCredentials: 'Enter your credentials to access the system',
    enterId: 'Enter your ID',
    enterPassword: 'Enter your password'
  },
  admin: {
    dashboard: 'Admin Dashboard',
    tourManagement: 'Tour Management',
    vehicleManagement: 'Vehicle Management',
    hotelManagement: 'Hotel Management',
    guideManagement: 'Guide Management',
    userManagement: 'User Management',
    companySettings: 'Company Settings',
    googleSheetsSync: 'Google Sheets Sync',
    addNewTour: 'Add New Tour',
    addNewVehicle: 'Add New Vehicle',
    addNewHotel: 'Add New Hotel',
    addNewGuide: 'Add New Guide',
    tourName: 'Tour Name',
    code: 'Code',
    location: 'Location',
    duration: 'Duration',
    basePrice: 'Price (JPY)',
    description: 'Description',
    imageUrl: 'Image URL',
    seats: 'Seats',
    vehicleName: 'Vehicle Name',
    pricePerDay: 'Price Per Day',
    driverCostPerDay: 'Driver Cost Per Day',
    hotelName: 'Hotel Name',
    stars: 'Stars',
    singleRoomPrice: 'Single Room Price',
    doubleRoomPrice: 'Double Room Price',
    tripleRoomPrice: 'Triple Room Price',
    breakfastPrice: 'Breakfast Price',
    guideName: 'Guide Name',
    languages: 'Languages',
    profitMargin: 'Profit Margin (%)',
    taxRate: 'Tax Rate (%)',
    mealCostLunch: 'Lunch Cost (JPY)',
    mealCostDinner: 'Dinner Cost (JPY)',
    changePassword: 'Change Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordChanged: 'Password has been changed successfully',
    seasonName: 'Season Name',
    startMonth: 'Start Month',
    endMonth: 'End Month',
    priceMultiplier: 'Price Multiplier',
    seasonDescription: 'Season Description'
  },
  calculator: {
    steps: {
      dates: 'Dates',
      services: 'Services',
      participants: 'Participants',
      accommodation: 'Accommodation',
      summary: 'Summary'
    },
    selectTourDates: 'Select Tour Dates',
    startDate: 'Start Date',
    endDate: 'End Date',
    seasonInfo: 'Season Information',
    selectServices: 'Select Services',
    selectTour: 'Select Tour',
    selectVehicle: 'Select Vehicle',
    numberOfParticipants: 'Number of Participants',
    hotelSelection: 'Hotel Selection',
    selectHotel: 'Select Hotel',
    roomType: 'Room Type',
    singleRoom: 'Single Room',
    doubleRoom: 'Double Room',
    tripleRoom: 'Triple Room',
    includeBreakfast: 'Include Breakfast',
    mealSelection: 'Meal Selection',
    includeLunch: 'Include Lunch',
    includeDinner: 'Include Dinner',
    guideSelection: 'Tour Guide Selection',
    includeGuide: 'Include Tour Guide',
    selectGuide: 'Select Guide',
    summary: {
      yourTour: 'Your Tour Summary',
      tourDetails: 'Tour Details',
      dateRange: 'Date Range',
      duration: 'Duration',
      participants: 'Participants',
      tourCost: 'Tour Cost',
      vehicleCost: 'Vehicle Cost',
      driverCost: 'Driver Cost',
      accommodationCost: 'Accommodation Cost',
      mealsCost: 'Meals Cost',
      guideCost: 'Guide Cost',
      subtotal: 'Subtotal',
      tax: 'Tax ({{rate}}%)',
      serviceFee: 'Service Fee ({{rate}}%)',
      totalPrice: 'Total Price',
      days: 'days',
      people: 'people',
      includesTax: '(includes tax)',
      priceBeforeTax: '(price before tax)',
      selectedOptions: 'Selected Options',
      inclusions: 'Inclusions',
      noGuideSelected: 'No guide selected',
      noHotelSelected: 'No hotel selected',
      sendTourRequest: 'Send Tour Request',
      provideContactInfo: 'Please provide your contact information',
      sending: 'Sending...',
      sendRequest: 'Send Request',
      directContactInfo: 'Direct Contact Information',
      contactUsPrompt: 'Please contact us directly for quick consultation',
      understood: 'Understood'
    }
  },
  languages: {
    en: 'English',
    ja: 'Japanese',
    zh: 'Chinese',
    ko: 'Korean',
    vi: 'Vietnamese'
  },
  months: {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
  },
  sync: {
    title: 'Google Sheets Synchronization',
    status: 'Sync Status',
    lastSyncTime: 'Last Synchronized',
    connectionStatus: 'Connection Status',
    connected: 'Connected',
    notConnected: 'Not Connected',
    fromSheets: 'Import from Google Sheets',
    toSheets: 'Export to Google Sheets',
    never: 'Never synchronized',
    help: 'Synchronization Help',
    fromSheetsTitle: 'Import from Google Sheets',
    fromSheetsDescription: 'Import data from Google Sheets to update tours, vehicles, hotels, guides, and seasons in the application.',
    toSheetsTitle: 'Export to Google Sheets',
    toSheetsDescription: 'Export all data from the application to Google Sheets for external editing or backup.',
    note: 'Important Note',
    noteDescription: 'Always ensure you have a stable internet connection when synchronizing data. Incomplete synchronization may result in data inconsistencies.',
    fromSheetsSuccess: 'Data successfully imported from Google Sheets',
    toSheetsSuccess: 'Data successfully exported to Google Sheets',
    errorFetchingStatus: 'Error fetching synchronization status'
  }
};

// Japanese translations
const jaTranslations = {
  common: {
    appName: 'あさひジャパンツアーズ',
    login: 'ログイン',
    logout: 'ログアウト',
    home: 'ホーム',
    back: '戻る',
    next: '次へ',
    calculate: '合計計算',
    previous: '前へ',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    add: '追加',
    search: '検索',
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    success: '成功',
    admin: '管理者',
    user: 'ユーザー',
    yes: 'はい',
    no: 'いいえ',
    of: '/',
    showing: '表示中',
    actions: 'アクション',
    currency: '通貨',
    and: 'と',
    overview: '概要',
    details: '詳細',
    included: '含む',
    notIncluded: '含まない',
    total: '合計',
    subtotal: '小計',
    tax: '税金',
    profit: 'サービス料',
    login_error: 'IDまたはパスワードが無効です。もう一度お試しください。',
    login_success: 'ログイン成功',
    not_authenticated: 'このページにアクセスするにはログインが必要です',
    refresh: '更新',
    welcomeMessage: 'あさひジャパンツアーズへようこそ',
    welcomeDescription: '当社のサービスをご利用いただきありがとうございます。最高の日本旅行体験をお届けすることをお約束します！',
    preferredLocations: '希望の訪問地',
    tourFor: 'ツアー対象',
    pricePerPerson: '一人あたりの料金',
    tourExceedsDuration: '選択された日数（{days}日）が標準ツアー期間（{standardDays}日）を超えています。「希望の訪問地」欄に希望する場所を入力してください。',
    startMessage: '当社のツアーサービスにご興味をお持ちいただきありがとうございます。旅行の日程を選択することから始めましょう！'
  },
  auth: {
    id: 'ID',
    password: 'パスワード',
    enterCredentials: 'システムにアクセスするための認証情報を入力してください',
    enterId: 'IDを入力してください',
    enterPassword: 'パスワードを入力してください'
  },
  admin: {
    dashboard: '管理者ダッシュボード',
    tourManagement: 'ツアー管理',
    vehicleManagement: '車両管理',
    hotelManagement: 'ホテル管理',
    guideManagement: 'ガイド管理',
    userManagement: 'ユーザー管理',
    companySettings: '会社設定',
    googleSheetsSync: 'Google シート同期',
    addNewTour: '新しいツアーを追加',
    addNewVehicle: '新しい車両を追加',
    addNewHotel: '新しいホテルを追加',
    addNewGuide: '新しいガイドを追加',
    tourName: 'ツアー名',
    code: 'コード',
    location: '場所',
    duration: '期間',
    basePrice: '価格 (円)',
    description: '説明',
    imageUrl: '画像URL',
    seats: '座席数',
    vehicleName: '車両名',
    pricePerDay: '1日あたりの価格',
    driverCostPerDay: '運転手の1日あたりのコスト',
    hotelName: 'ホテル名',
    stars: '星',
    singleRoomPrice: 'シングルルーム価格',
    doubleRoomPrice: 'ダブルルーム価格',
    tripleRoomPrice: 'トリプルルーム価格',
    breakfastPrice: '朝食価格',
    guideName: 'ガイド名',
    languages: '言語',
    profitMargin: '利益率 (%)',
    taxRate: '税率 (%)',
    mealCostLunch: 'ランチコスト (円)',
    mealCostDinner: 'ディナーコスト (円)',
    changePassword: 'パスワード変更',
    newPassword: '新しいパスワード',
    confirmPassword: 'パスワード確認',
    passwordChanged: 'パスワードが正常に変更されました',
    seasonName: 'シーズン名',
    startMonth: '開始月',
    endMonth: '終了月',
    priceMultiplier: '価格乗数',
    seasonDescription: 'シーズンの説明'
  },
  calculator: {
    steps: {
      dates: '日付',
      services: 'サービス',
      participants: '参加者',
      accommodation: '宿泊',
      summary: '概要'
    },
    selectTourDates: 'ツアー日程を選択',
    startDate: '開始日',
    endDate: '終了日',
    seasonInfo: 'シーズン情報',
    selectServices: 'サービスを選択',
    selectTour: 'ツアーを選択',
    selectVehicle: '車両を選択',
    numberOfParticipants: '参加者数',
    hotelSelection: 'ホテル選択',
    selectHotel: 'ホテルを選択',
    roomType: '部屋タイプ',
    singleRoom: 'シングルルーム',
    doubleRoom: 'ダブルルーム',
    tripleRoom: 'トリプルルーム',
    includeBreakfast: '朝食を含む',
    mealSelection: '食事選択',
    includeLunch: 'ランチを含む',
    includeDinner: 'ディナーを含む',
    guideSelection: 'ガイド選択',
    includeGuide: 'ガイドを含む',
    selectGuide: 'ガイドを選択',
    summary: {
      yourTour: 'ツアー概要',
      tourDetails: 'ツアー詳細',
      dateRange: '日程',
      duration: '期間',
      participants: '参加者',
      tourCost: 'ツアー代金',
      vehicleCost: '車両代金',
      driverCost: '運転手代金',
      accommodationCost: '宿泊代金',
      mealsCost: '食事代金',
      guideCost: 'ガイド代金',
      subtotal: '小計',
      tax: '税金 ({{rate}}%)',
      serviceFee: 'サービス料 ({{rate}}%)',
      totalPrice: '合計金額',
      days: '日',
      people: '人',
      includesTax: '(税込)',
      priceBeforeTax: '(税抜き価格)',
      selectedOptions: '選択オプション',
      inclusions: '含まれるもの',
      noGuideSelected: 'ガイド選択なし',
      noHotelSelected: 'ホテル選択なし',
      sendTourRequest: 'ツアーリクエストを送信',
      provideContactInfo: 'お問い合わせ情報をご提供ください',
      sending: '送信中...',
      sendRequest: 'リクエスト送信',
      directContactInfo: '直接連絡先情報',
      contactUsPrompt: '迅速な相談のために直接お問い合わせください',
      understood: '理解しました'
    }
  },
  languages: {
    en: '英語',
    ja: '日本語',
    zh: '中国語',
    ko: '韓国語',
    vi: 'ベトナム語'
  },
  months: {
    1: '1月',
    2: '2月',
    3: '3月',
    4: '4月',
    5: '5月',
    6: '6月',
    7: '7月',
    8: '8月',
    9: '9月',
    10: '10月',
    11: '11月',
    12: '12月'
  },
  sync: {
    title: 'Google シート同期',
    status: '同期状態',
    lastSyncTime: '最終同期',
    connectionStatus: '接続状態',
    connected: '接続中',
    notConnected: '未接続',
    fromSheets: 'Google シートからインポート',
    toSheets: 'Google シートへエクスポート',
    never: '同期履歴なし',
    help: '同期ヘルプ',
    fromSheetsTitle: 'Google シートからインポート',
    fromSheetsDescription: 'Google シートからデータをインポートして、アプリケーション内のツアー、車両、ホテル、ガイド、シーズンを更新します。',
    toSheetsTitle: 'Google シートへエクスポート',
    toSheetsDescription: 'アプリケーションからすべてのデータを Google シートにエクスポートして、外部編集やバックアップを行います。',
    note: '重要なお知らせ',
    noteDescription: 'データを同期する際には、安定したインターネット接続を確保してください。不完全な同期はデータの不整合を引き起こす可能性があります。',
    fromSheetsSuccess: 'Google シートからデータが正常にインポートされました',
    toSheetsSuccess: 'データが Google シートに正常にエクスポートされました',
    errorFetchingStatus: '同期状態の取得中にエラーが発生しました'
  }
};

// Chinese translations
const zhTranslations = {
  common: {
    appName: '旭日本旅行',
    login: '登录',
    logout: '登出',
    home: '主页',
    back: '返回',
    next: '下一步',
    calculate: '计算总价',
    previous: '上一步',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    loading: '加载中...',
    error: '发生错误',
    success: '成功',
    admin: '管理员',
    user: '用户',
    yes: '是',
    no: '否',
    of: '/',
    showing: '显示',
    actions: '操作',
    currency: '货币',
    and: '和',
    overview: '概览',
    details: '详情',
    included: '已包含',
    notIncluded: '未包含',
    total: '总计',
    subtotal: '小计',
    tax: '税',
    profit: '服务费',
    login_error: 'ID或密码无效。请重试。',
    login_success: '登录成功',
    not_authenticated: '您需要登录才能访问此页面',
    refresh: '刷新',
    welcomeMessage: '欢迎来到旭日本旅行网站',
    welcomeDescription: '感谢您选择我们的服务。我们致力于为您提供最佳的日本旅行体验！',
    preferredLocations: '首选地点',
    tourFor: '旅行团为',
    pricePerPerson: '每人价格',
    tourExceedsDuration: '您选择的天数（{days}天）超过了标准旅行团的持续时间（{standardDays}天）。请在"首选地点"字段中输入您想要访问的地点。',
    startMessage: '感谢您对我们旅行团服务的兴趣。请先为您的旅行选择日期！'
  },
  auth: {
    id: 'ID',
    password: '密码',
    enterCredentials: '输入您的凭据以访问系统',
    enterId: '输入您的ID',
    enterPassword: '输入您的密码'
  },
  admin: {
    dashboard: '管理仪表板',
    tourManagement: '行程管理',
    vehicleManagement: '车辆管理',
    hotelManagement: '酒店管理',
    guideManagement: '导游管理',
    userManagement: '用户管理',
    companySettings: '公司设置',
    googleSheetsSync: 'Google表格同步',
    addNewTour: '添加新行程',
    addNewVehicle: '添加新车辆',
    addNewHotel: '添加新酒店',
    addNewGuide: '添加新导游',
    tourName: '行程名称',
    code: '代码',
    location: '地点',
    duration: '时长',
    basePrice: '价格 (日元)',
    description: '描述',
    imageUrl: '图片URL',
    seats: '座位数',
    vehicleName: '车辆名称',
    pricePerDay: '每日价格',
    driverCostPerDay: '司机每日成本',
    hotelName: '酒店名称',
    stars: '星级',
    singleRoomPrice: '单人间价格',
    doubleRoomPrice: '双人间价格',
    tripleRoomPrice: '三人间价格',
    breakfastPrice: '早餐价格',
    guideName: '导游名称',
    languages: '语言',
    profitMargin: '利润率 (%)',
    taxRate: '税率 (%)',
    mealCostLunch: '午餐成本 (日元)',
    mealCostDinner: '晚餐成本 (日元)',
    changePassword: '更改密码',
    newPassword: '新密码',
    confirmPassword: '确认密码',
    passwordChanged: '密码已成功更改',
    seasonName: '季节名称',
    startMonth: '开始月份',
    endMonth: '结束月份',
    priceMultiplier: '价格乘数',
    seasonDescription: '季节描述'
  },
  calculator: {
    steps: {
      dates: '日期',
      services: '服务',
      participants: '参与者',
      accommodation: '住宿',
      summary: '摘要'
    },
    selectTourDates: '选择行程日期',
    startDate: '开始日期',
    endDate: '结束日期',
    seasonInfo: '季节信息',
    selectServices: '选择服务',
    selectTour: '选择行程',
    selectVehicle: '选择车辆',
    numberOfParticipants: '参与者数量',
    hotelSelection: '酒店选择',
    selectHotel: '选择酒店',
    roomType: '房间类型',
    singleRoom: '单人间',
    doubleRoom: '双人间',
    tripleRoom: '三人间',
    includeBreakfast: '包含早餐',
    mealSelection: '餐食选择',
    includeLunch: '包含午餐',
    includeDinner: '包含晚餐',
    guideSelection: '导游选择',
    includeGuide: '包含导游',
    selectGuide: '选择导游',
    summary: {
      yourTour: '您的行程摘要',
      tourDetails: '行程详情',
      dateRange: '日期范围',
      duration: '时长',
      participants: '参与者',
      tourCost: '行程费用',
      vehicleCost: '车辆费用',
      driverCost: '司机费用',
      accommodationCost: '住宿费用',
      mealsCost: '餐食费用',
      guideCost: '导游费用',
      subtotal: '小计',
      tax: '税 ({{rate}}%)',
      serviceFee: '服务费 ({{rate}}%)',
      totalPrice: '总价',
      days: '天',
      people: '人',
      includesTax: '(含税)',
      priceBeforeTax: '(税前价格)',
      selectedOptions: '已选选项',
      inclusions: '包含内容',
      noGuideSelected: '未选择导游',
      noHotelSelected: '未选择酒店',
      sendTourRequest: '发送行程请求',
      provideContactInfo: '请提供您的联系信息',
      sending: '发送中...',
      sendRequest: '发送请求',
      directContactInfo: '直接联系信息',
      contactUsPrompt: '请直接联系我们获取快速咨询',
      understood: '已了解'
    }
  },
  languages: {
    en: '英语',
    ja: '日语',
    zh: '中文',
    ko: '韩语',
    vi: '越南语'
  },
  months: {
    1: '一月',
    2: '二月',
    3: '三月',
    4: '四月',
    5: '五月',
    6: '六月',
    7: '七月',
    8: '八月',
    9: '九月',
    10: '十月',
    11: '十一月',
    12: '十二月'
  },
  sync: {
    title: 'Google表格同步',
    status: '同步状态',
    lastSyncTime: '上次同步',
    connectionStatus: '连接状态',
    connected: '已连接',
    notConnected: '未连接',
    fromSheets: '从Google表格导入',
    toSheets: '导出到Google表格',
    never: '从未同步',
    help: '同步帮助',
    fromSheetsTitle: '从Google表格导入',
    fromSheetsDescription: '从Google表格导入数据以更新应用程序中的行程、车辆、酒店、导游和季节信息。',
    toSheetsTitle: '导出到Google表格',
    toSheetsDescription: '将应用程序中的所有数据导出到Google表格以进行外部编辑或备份。',
    note: '重要提示',
    noteDescription: '同步数据时，请确保有稳定的互联网连接。不完整的同步可能导致数据不一致。',
    fromSheetsSuccess: '已成功从Google表格导入数据',
    toSheetsSuccess: '已成功将数据导出到Google表格',
    errorFetchingStatus: '获取同步状态时出错'
  }
};

// Korean translations
const koTranslations = {
  common: {
    appName: '아사히재팬투어',
    login: '로그인',
    logout: '로그아웃',
    home: '홈',
    back: '뒤로',
    next: '다음',
    calculate: '총액 계산',
    previous: '이전',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    add: '추가',
    search: '검색',
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    success: '성공',
    admin: '관리자',
    user: '사용자',
    yes: '예',
    no: '아니오',
    of: '/',
    showing: '보기',
    actions: '작업',
    currency: '통화',
    and: '및',
    overview: '개요',
    details: '세부 정보',
    included: '포함됨',
    notIncluded: '포함되지 않음',
    total: '총계',
    subtotal: '소계',
    tax: '세금',
    profit: '서비스 요금',
    login_error: '잘못된 ID 또는 비밀번호입니다. 다시 시도하세요.',
    login_success: '로그인 성공',
    not_authenticated: '이 페이지에 접근하려면 로그인이 필요합니다',
    refresh: '새로고침',
    welcomeMessage: '아사히재팬투어에 오신 것을 환영합니다',
    welcomeDescription: '저희 서비스를 선택해 주셔서 감사합니다. 최고의 일본 여행 경험을 제공해 드리겠습니다!',
    preferredLocations: '희망 방문지',
    tourFor: '투어 대상',
    pricePerPerson: '1인당 가격',
    tourExceedsDuration: '선택하신 일수({days}일)가 기본 투어 기간({standardDays}일)을 초과합니다. "희망 방문지" 필드에 방문하고 싶은 장소를 입력해 주세요.',
    startMessage: '저희 투어 서비스에 관심을 가져주셔서 감사합니다. 여행 날짜를 선택하여 시작해 보세요!'
  },
  auth: {
    id: 'ID',
    password: '비밀번호',
    enterCredentials: '시스템에 접근하기 위한 자격 증명을 입력하세요',
    enterId: 'ID를 입력하세요',
    enterPassword: '비밀번호를 입력하세요'
  },
  admin: {
    dashboard: '관리자 대시보드',
    tourManagement: '투어 관리',
    vehicleManagement: '차량 관리',
    hotelManagement: '호텔 관리',
    guideManagement: '가이드 관리',
    userManagement: '사용자 관리',
    companySettings: '회사 설정',
    googleSheetsSync: 'Google 스프레드시트 동기화',
    addNewTour: '새 투어 추가',
    addNewVehicle: '새 차량 추가',
    addNewHotel: '새 호텔 추가',
    addNewGuide: '새 가이드 추가',
    tourName: '투어 이름',
    code: '코드',
    location: '위치',
    duration: '기간',
    basePrice: '가격 (엔)',
    description: '설명',
    imageUrl: '이미지 URL',
    seats: '좌석 수',
    vehicleName: '차량 이름',
    pricePerDay: '일일 가격',
    driverCostPerDay: '운전기사 일일 비용',
    hotelName: '호텔 이름',
    stars: '별점',
    singleRoomPrice: '싱글룸 가격',
    doubleRoomPrice: '더블룸 가격',
    tripleRoomPrice: '트리플룸 가격',
    breakfastPrice: '아침 식사 가격',
    guideName: '가이드 이름',
    languages: '언어',
    profitMargin: '이익률 (%)',
    taxRate: '세율 (%)',
    mealCostLunch: '점심 비용 (엔)',
    mealCostDinner: '저녁 비용 (엔)',
    changePassword: '비밀번호 변경',
    newPassword: '새 비밀번호',
    confirmPassword: '비밀번호 확인',
    passwordChanged: '비밀번호가 성공적으로 변경되었습니다',
    seasonName: '시즌 이름',
    startMonth: '시작 월',
    endMonth: '종료 월',
    priceMultiplier: '가격 승수',
    seasonDescription: '시즌 설명'
  },
  calculator: {
    steps: {
      dates: '날짜',
      services: '서비스',
      participants: '참가자',
      accommodation: '숙박',
      summary: '요약'
    },
    selectTourDates: '투어 날짜 선택',
    startDate: '시작 날짜',
    endDate: '종료 날짜',
    seasonInfo: '시즌 정보',
    selectServices: '서비스 선택',
    selectTour: '투어 선택',
    selectVehicle: '차량 선택',
    numberOfParticipants: '참가자 수',
    hotelSelection: '호텔 선택',
    selectHotel: '호텔 선택',
    roomType: '객실 유형',
    singleRoom: '싱글룸',
    doubleRoom: '더블룸',
    tripleRoom: '트리플룸',
    includeBreakfast: '아침 식사 포함',
    mealSelection: '식사 선택',
    includeLunch: '점심 포함',
    includeDinner: '저녁 포함',
    guideSelection: '가이드 선택',
    includeGuide: '가이드 포함',
    selectGuide: '가이드 선택',
    summary: {
      yourTour: '투어 요약',
      tourDetails: '투어 세부 정보',
      dateRange: '날짜 범위',
      duration: '기간',
      participants: '참가자',
      tourCost: '투어 비용',
      vehicleCost: '차량 비용',
      driverCost: '운전기사 비용',
      accommodationCost: '숙박 비용',
      mealsCost: '식사 비용',
      guideCost: '가이드 비용',
      subtotal: '소계',
      tax: '세금 ({{rate}}%)',
      serviceFee: '서비스 요금 ({{rate}}%)',
      totalPrice: '총 가격',
      days: '일',
      people: '명',
      includesTax: '(세금 포함)',
      priceBeforeTax: '(세전 가격)',
      selectedOptions: '선택된 옵션',
      inclusions: '포함 사항',
      noGuideSelected: '가이드 선택 안됨',
      noHotelSelected: '호텔 선택 안됨',
      sendTourRequest: '투어 요청 보내기',
      provideContactInfo: '연락처 정보를 제공해 주세요',
      sending: '전송 중...',
      sendRequest: '요청 보내기',
      directContactInfo: '직접 연락처 정보',
      contactUsPrompt: '빠른 상담을 위해 직접 연락해 주세요',
      understood: '이해했습니다'
    }
  },
  languages: {
    en: '영어',
    ja: '일본어',
    zh: '중국어',
    ko: '한국어',
    vi: '베트남어'
  },
  months: {
    1: '1월',
    2: '2월',
    3: '3월',
    4: '4월',
    5: '5월',
    6: '6월',
    7: '7월',
    8: '8월',
    9: '9월',
    10: '10월',
    11: '11월',
    12: '12월'
  },
  sync: {
    title: 'Google 스프레드시트 동기화',
    status: '동기화 상태',
    lastSyncTime: '마지막 동기화',
    connectionStatus: '연결 상태',
    connected: '연결됨',
    notConnected: '연결되지 않음',
    fromSheets: 'Google 스프레드시트에서 가져오기',
    toSheets: 'Google 스프레드시트로 내보내기',
    never: '동기화 내역 없음',
    help: '동기화 도움말',
    fromSheetsTitle: 'Google 스프레드시트에서 가져오기',
    fromSheetsDescription: 'Google 스프레드시트에서 데이터를 가져와 애플리케이션의 투어, 차량, 호텔, 가이드 및 시즌 정보를 업데이트합니다.',
    toSheetsTitle: 'Google 스프레드시트로 내보내기',
    toSheetsDescription: '애플리케이션의 모든 데이터를 Google 스프레드시트로 내보내 외부 편집이나 백업을 할 수 있습니다.',
    note: '중요 알림',
    noteDescription: '데이터 동기화 시 안정적인 인터넷 연결이 필요합니다. 불완전한 동기화는 데이터 불일치를 초래할 수 있습니다.',
    fromSheetsSuccess: 'Google 스프레드시트에서 데이터를 성공적으로 가져왔습니다',
    toSheetsSuccess: '데이터를 Google 스프레드시트로 성공적으로 내보냈습니다',
    errorFetchingStatus: '동기화 상태를 가져오는 중 오류가 발생했습니다'
  }
};

// Vietnamese translations
const viTranslations = {
  common: {
    appName: 'AsahiJapanTours',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    home: 'Trang chủ',
    back: 'Quay lại',
    next: 'Tiếp theo',
    calculate: 'Tính tổng',
    previous: 'Trước đó',
    cancel: 'Hủy',
    save: 'Lưu',
    delete: 'Xóa',
    edit: 'Sửa',
    add: 'Thêm',
    search: 'Tìm kiếm',
    loading: 'Đang tải...',
    error: 'Đã xảy ra lỗi',
    success: 'Thành công',
    admin: 'Quản trị viên',
    user: 'Người dùng',
    yes: 'Có',
    no: 'Không',
    of: '/',
    showing: 'Hiển thị',
    actions: 'Hành động',
    currency: 'Tiền tệ',
    and: 'và',
    overview: 'Tổng quan',
    details: 'Chi tiết',
    included: 'Đã bao gồm',
    notIncluded: 'Chưa bao gồm',
    total: 'Tổng cộng',
    subtotal: 'Tạm tính',
    tax: 'Thuế',
    profit: 'Phí dịch vụ',
    login_error: 'ID hoặc mật khẩu không hợp lệ. Vui lòng thử lại.',
    login_success: 'Đăng nhập thành công',
    not_authenticated: 'Bạn cần đăng nhập để truy cập trang này',
    refresh: 'Làm mới',
    welcomeMessage: 'Chào mừng đến với AsahiJapanTours.com',
    welcomeDescription: 'Cảm ơn bạn đã chọn dịch vụ của chúng tôi. Chúng tôi cam kết mang đến cho bạn trải nghiệm du lịch Nhật Bản tuyệt vời nhất!',
    preferredLocations: 'Địa điểm mong muốn',
    tourFor: 'Tour cho',
    pricePerPerson: 'Giá cho mỗi người',
    tourExceedsDuration: 'Số ngày bạn chọn ({days} ngày) vượt quá số ngày tiêu chuẩn của tour ({standardDays} ngày). Vui lòng nhập địa điểm bạn muốn đến trong phần "Địa điểm mong muốn".',
    startMessage: 'Cảm ơn bạn đã quan tâm đến dịch vụ tour của chúng tôi. Hãy bắt đầu bằng việc chọn ngày cho chuyến đi của bạn!'
  },
  auth: {
    id: 'ID',
    password: 'Mật khẩu',
    enterCredentials: 'Nhập thông tin đăng nhập để truy cập hệ thống',
    enterId: 'Nhập ID của bạn',
    enterPassword: 'Nhập mật khẩu của bạn'
  },
  admin: {
    dashboard: 'Bảng điều khiển quản trị',
    tourManagement: 'Quản lý tour',
    vehicleManagement: 'Quản lý phương tiện',
    hotelManagement: 'Quản lý khách sạn',
    guideManagement: 'Quản lý hướng dẫn viên',
    userManagement: 'Quản lý người dùng',
    companySettings: 'Cài đặt công ty',
    googleSheetsSync: 'Đồng bộ Google Sheets',
    addNewTour: 'Thêm tour mới',
    addNewVehicle: 'Thêm phương tiện mới',
    addNewHotel: 'Thêm khách sạn mới',
    addNewGuide: 'Thêm hướng dẫn viên mới',
    tourName: 'Tên tour',
    code: 'Mã',
    location: 'Địa điểm',
    duration: 'Thời gian',
    basePrice: 'Giá (JPY)',
    description: 'Mô tả',
    imageUrl: 'URL hình ảnh',
    seats: 'Số ghế',
    vehicleName: 'Tên phương tiện',
    pricePerDay: 'Giá mỗi ngày',
    driverCostPerDay: 'Chi phí tài xế mỗi ngày',
    hotelName: 'Tên khách sạn',
    stars: 'Số sao',
    singleRoomPrice: 'Giá phòng đơn',
    doubleRoomPrice: 'Giá phòng đôi',
    tripleRoomPrice: 'Giá phòng ba',
    breakfastPrice: 'Giá bữa sáng',
    guideName: 'Tên hướng dẫn viên',
    languages: 'Ngôn ngữ',
    profitMargin: 'Tỷ suất lợi nhuận (%)',
    taxRate: 'Thuế suất (%)',
    mealCostLunch: 'Chi phí bữa trưa (JPY)',
    mealCostDinner: 'Chi phí bữa tối (JPY)',
    changePassword: 'Đổi mật khẩu',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu',
    passwordChanged: 'Mật khẩu đã được thay đổi thành công',
    seasonName: 'Tên mùa',
    startMonth: 'Tháng bắt đầu',
    endMonth: 'Tháng kết thúc',
    priceMultiplier: 'Hệ số giá',
    seasonDescription: 'Mô tả mùa'
  },
  calculator: {
    steps: {
      dates: 'Ngày',
      services: 'Dịch vụ',
      participants: 'Người tham gia',
      accommodation: 'Chỗ ở',
      summary: 'Tóm tắt'
    },
    selectTourDates: 'Chọn ngày tour',
    startDate: 'Ngày bắt đầu',
    endDate: 'Ngày kết thúc',
    seasonInfo: 'Thông tin mùa',
    selectServices: 'Chọn dịch vụ',
    selectTour: 'Chọn tour',
    selectVehicle: 'Chọn phương tiện',
    numberOfParticipants: 'Số người tham gia',
    hotelSelection: 'Lựa chọn khách sạn',
    selectHotel: 'Chọn khách sạn',
    roomType: 'Loại phòng',
    singleRoom: 'Phòng đơn',
    doubleRoom: 'Phòng đôi',
    tripleRoom: 'Phòng ba',
    includeBreakfast: 'Bao gồm bữa sáng',
    mealSelection: 'Lựa chọn bữa ăn',
    includeLunch: 'Bao gồm bữa trưa',
    includeDinner: 'Bao gồm bữa tối',
    guideSelection: 'Lựa chọn hướng dẫn viên',
    includeGuide: 'Bao gồm hướng dẫn viên',
    selectGuide: 'Chọn hướng dẫn viên',
    summary: {
      yourTour: 'Tóm tắt tour của bạn',
      tourDetails: 'Chi tiết tour',
      dateRange: 'Phạm vi ngày',
      duration: 'Thời gian',
      participants: 'Người tham gia',
      tourCost: 'Chi phí tour',
      vehicleCost: 'Chi phí phương tiện',
      driverCost: 'Chi phí tài xế',
      accommodationCost: 'Chi phí chỗ ở',
      mealsCost: 'Chi phí bữa ăn',
      guideCost: 'Chi phí hướng dẫn viên',
      subtotal: 'Tạm tính',
      tax: 'Thuế ({{rate}}%)',
      serviceFee: 'Phí dịch vụ ({{rate}}%)',
      totalPrice: 'Tổng giá',
      days: 'ngày',
      people: 'người',
      includesTax: '(đã bao gồm thuế)',
      priceBeforeTax: '(giá trước thuế)',
      selectedOptions: 'Tùy chọn đã chọn',
      inclusions: 'Dịch vụ đã bao gồm',
      noGuideSelected: 'Không chọn hướng dẫn viên',
      noHotelSelected: 'Không chọn khách sạn',
      sendTourRequest: 'Gửi yêu cầu tư vấn tour',
      provideContactInfo: 'Vui lòng cung cấp thông tin liên hệ của bạn',
      sending: 'Đang gửi...',
      sendRequest: 'Gửi yêu cầu',
      directContactInfo: 'Thông tin liên hệ trực tiếp',
      contactUsPrompt: 'Vui lòng liên hệ trực tiếp với chúng tôi để được tư vấn nhanh chóng',
      understood: 'Đã hiểu'
    }
  },
  languages: {
    en: 'Tiếng Anh',
    ja: 'Tiếng Nhật',
    zh: 'Tiếng Trung',
    ko: 'Tiếng Hàn',
    vi: 'Tiếng Việt'
  },
  months: {
    1: 'Tháng 1',
    2: 'Tháng 2',
    3: 'Tháng 3',
    4: 'Tháng 4',
    5: 'Tháng 5',
    6: 'Tháng 6',
    7: 'Tháng 7',
    8: 'Tháng 8',
    9: 'Tháng 9',
    10: 'Tháng 10',
    11: 'Tháng 11',
    12: 'Tháng 12'
  },
  sync: {
    title: 'Đồng bộ Google Sheets',
    status: 'Trạng thái Đồng bộ',
    lastSyncTime: 'Lần đồng bộ cuối',
    connectionStatus: 'Trạng thái kết nối',
    connected: 'Đã kết nối',
    notConnected: 'Chưa kết nối',
    fromSheets: 'Nhập từ Google Sheets',
    toSheets: 'Xuất đến Google Sheets',
    never: 'Chưa từng đồng bộ',
    help: 'Trợ giúp Đồng bộ',
    fromSheetsTitle: 'Nhập từ Google Sheets',
    fromSheetsDescription: 'Nhập dữ liệu từ Google Sheets để cập nhật thông tin tour, phương tiện, khách sạn, hướng dẫn viên và mùa trong ứng dụng.',
    toSheetsTitle: 'Xuất đến Google Sheets',
    toSheetsDescription: 'Xuất tất cả dữ liệu từ ứng dụng đến Google Sheets để chỉnh sửa bên ngoài hoặc sao lưu.',
    note: 'Lưu ý Quan trọng',
    noteDescription: 'Luôn đảm bảo bạn có kết nối internet ổn định khi đồng bộ dữ liệu. Đồng bộ không hoàn chỉnh có thể dẫn đến sự không nhất quán dữ liệu.',
    fromSheetsSuccess: 'Dữ liệu đã được nhập thành công từ Google Sheets',
    toSheetsSuccess: 'Dữ liệu đã được xuất thành công đến Google Sheets',
    errorFetchingStatus: 'Lỗi khi lấy trạng thái đồng bộ'
  }
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslations
    },
    ja: {
      translation: jaTranslations
    },
    zh: {
      translation: zhTranslations
    },
    ko: {
      translation: koTranslations
    },
    vi: {
      translation: viTranslations
    }
  },
  lng: 'en', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
