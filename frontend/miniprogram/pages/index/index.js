// 引入八字计算器
const BaziCalculator = require('../../utils/baziCalculator')
const { request, ensureLogin } = require('../../utils/api')
const app = getApp()

// ── 省市区数据（内联，避免模块加载问题）──
const PROVINCES = [
  '北京市','天津市','上海市','重庆市',
  '河北省','山西省','辽宁省','吉林省','黑龙江省',
  '江苏省','浙江省','安徽省','福建省','江西省','山东省',
  '河南省','湖北省','湖南省','广东省','海南省',
  '四川省','贵州省','云南省','陕西省','甘肃省','青海省',
  '内蒙古自治区','广西壮族自治区','西藏自治区','宁夏回族自治区','新疆维吾尔自治区',
  '香港特别行政区','澳门特别行政区','台湾省'
]

const CITIES_MAP = {
  '北京市':['北京市'],
  '天津市':['天津市'],
  '上海市':['上海市'],
  '重庆市':['重庆市','万州区','涪陵区','渝中区','江北区','沙坪坝区','九龙坡区','南岸区','渝北区','巴南区','江津区','合川区','永川区'],
  '河北省':['石家庄市','唐山市','秦皇岛市','邯郸市','邢台市','保定市','张家口市','承德市','沧州市','廊坊市','衡水市'],
  '山西省':['太原市','大同市','阳泉市','长治市','晋城市','朔州市','晋中市','运城市','忻州市','临汾市','吕梁市'],
  '辽宁省':['沈阳市','大连市','鞍山市','抚顺市','本溪市','丹东市','锦州市','营口市','阜新市','辽阳市','盘锦市','铁岭市','朝阳市','葫芦岛市'],
  '吉林省':['长春市','吉林市','四平市','辽源市','通化市','白山市','松原市','白城市','延边朝鲜族自治州'],
  '黑龙江省':['哈尔滨市','齐齐哈尔市','鸡西市','鹤岗市','双鸭山市','大庆市','伊春市','佳木斯市','牡丹江市','黑河市','绥化市'],
  '江苏省':['南京市','无锡市','徐州市','常州市','苏州市','南通市','连云港市','淮安市','盐城市','扬州市','镇江市','泰州市','宿迁市'],
  '浙江省':['杭州市','宁波市','温州市','嘉兴市','湖州市','绍兴市','金华市','衢州市','舟山市','台州市','丽水市'],
  '安徽省':['合肥市','芜湖市','蚌埠市','淮南市','马鞍山市','淮北市','铜陵市','安庆市','黄山市','滁州市','阜阳市','宿州市','六安市','亳州市','池州市','宣城市'],
  '福建省':['福州市','厦门市','莆田市','三明市','泉州市','漳州市','南平市','龙岩市','宁德市'],
  '江西省':['南昌市','景德镇市','萍乡市','九江市','新余市','鹰潭市','赣州市','吉安市','宜春市','抚州市','上饶市'],
  '山东省':['济南市','青岛市','淄博市','枣庄市','东营市','烟台市','潍坊市','济宁市','泰安市','威海市','日照市','临沂市','德州市','聊城市','滨州市','菏泽市'],
  '河南省':['郑州市','开封市','洛阳市','平顶山市','安阳市','鹤壁市','新乡市','焦作市','濮阳市','许昌市','漯河市','三门峡市','南阳市','商丘市','信阳市','周口市','驻马店市'],
  '湖北省':['武汉市','黄石市','十堰市','宜昌市','襄阳市','鄂州市','荆门市','孝感市','荆州市','黄冈市','咸宁市','随州市','恩施土家族苗族自治州'],
  '湖南省':['长沙市','株洲市','湘潭市','衡阳市','邵阳市','岳阳市','常德市','张家界市','益阳市','郴州市','永州市','怀化市','娄底市','湘西土家族苗族自治州'],
  '广东省':['广州市','韶关市','深圳市','珠海市','汕头市','佛山市','江门市','湛江市','茂名市','肇庆市','惠州市','梅州市','汕尾市','河源市','阳江市','清远市','东莞市','中山市','潮州市','揭州市','云浮市'],
  '海南省':['海口市','三亚市','三沙市','儋州市','文昌市','琼海市','万宁市','东方市'],
  '四川省':['成都市','自贡市','攀枝花市','泸州市','德阳市','绵阳市','广元市','遂宁市','内江市','乐山市','南充市','眉山市','宜宾市','广安市','达州市','雅安市','巴中市','资阳市','阿坝藏族羌族自治州','甘孜藏族自治州','凉山彝族自治州'],
  '贵州省':['贵阳市','六盘水市','遵义市','安顺市','毕节市','铜仁市','黔西南布依族苗族自治州','黔东南苗族侗族自治州','黔南布依族苗族自治州'],
  '云南省':['昆明市','曲靖市','玉溪市','保山市','昭通市','丽江市','普洱市','临沧市','楚雄彝族自治州','红河哈尼族彝族自治州','文山壮族苗族自治州','西双版纳傣族自治州','大理白族自治州','德宏傣族景颇族自治州','怒江傈僳族自治州','迪庆藏族自治州'],
  '陕西省':['西安市','铜川市','宝鸡市','咸阳市','渭南市','延安市','汉中市','榆林市','安康市','商洛市'],
  '甘肃省':['兰州市','嘉峪关市','金昌市','白银市','天水市','武威市','张掖市','平凉市','酒泉市','庆阳市','定西市','陇南市','临夏回族自治州','甘南藏族自治州'],
  '青海省':['西宁市','海东市','海北藏族自治州','黄南藏族自治州','海南藏族自治州','果洛藏族自治州','玉树藏族自治州','海西蒙古族藏族自治州'],
  '内蒙古自治区':['呼和浩特市','包头市','乌海市','赤峰市','通辽市','鄂尔多斯市','呼伦贝尔市','巴彦淖尔市','乌兰察布市','兴安盟','锡林郭勒盟','阿拉善盟'],
  '广西壮族自治区':['南宁市','柳州市','桂林市','梧州市','北海市','防城港市','钦州市','贵港市','玉林市','百色市','贺州市','河池市','来宾市','崇左市'],
  '西藏自治区':['拉萨市','日喀则市','昌都市','林芝市','山南市','那曲市','阿里地区'],
  '宁夏回族自治区':['银川市','石嘴山市','吴忠市','固原市','中卫市'],
  '新疆维吾尔自治区':['乌鲁木齐市','克拉玛依市','吐鲁番市','哈密市','昌吉回族自治州','博尔塔拉蒙古自治州','巴音郭楞蒙古自治州','阿克苏地区','克孜勒苏柯尔克孜自治州','喀什地区','和田地区','伊犁哈萨克自治州','塔城地区','阿勒泰地区'],
  '香港特别行政区':['香港岛','九龙','新界'],
  '澳门特别行政区':['澳门半岛','氹仔','路环'],
  '台湾省':['台北市','新北市','桃园市','台中市','台南市','高雄市','基隆市','新竹市','嘉义市','新竹县','苗栗县','彰化县','南投县','云林县','嘉义县','屏东县','宜兰县','花莲县','台东县','澎湖县','金门县','连江县']
}

const DISTRICTS_MAP = {
  '北京市':['东城区','西城区','朝阳区','丰台区','石景山区','海淀区','门头沟区','房山区','通州区','顺义区','昌平区','大兴区','怀柔区','平谷区','密云区','延庆区'],
  '天津市':['和平区','河东区','河西区','南开区','河北区','红桥区','东丽区','西青区','津南区','北辰区','武清区','宝坻区','滨海新区','宁河区','静海区','蓟州区'],
  '上海市':['黄浦区','徐汇区','长宁区','静安区','普陀区','虹口区','杨浦区','闵行区','宝山区','嘉定区','浦东新区','金山区','松江区','青浦区','奉贤区','崇明区'],
  '重庆市':['渝中区','大渡口区','江北区','沙坪坝区','九龙坡区','南岸区','北碚区','渝北区','巴南区'],
  '石家庄市':['长安区','桥西区','新华区','裕华区','藁城区','鹿泉区','栾城区','井陉县','正定县','行唐县','灵寿县','赵县','辛集市','晋州市','新乐市'],
  '唐山市':['路南区','路北区','古冶区','开平区','丰南区','丰润区','曹妃甸区','滦州市','迁安市','遵化市'],
  '太原市':['小店区','迎泽区','杏花岭区','尖草坪区','万柏林区','晋源区','清徐县','阳曲县','娄烦县','古交市'],
  '大同市':['平城区','云冈区','云州区','新荣区','阳高县','天镇县','广灵县','灵丘县','浑源县','左云县'],
  '沈阳市':['和平区','沈河区','大东区','皇姑区','铁西区','苏家屯区','浑南区','沈北新区','于洪区','辽中区','康平县','法库县','新民市'],
  '大连市':['中山区','西岗区','沙河口区','甘井子区','旅顺口区','金州区','普兰店区','长海县','瓦房店市','庄河市'],
  '长春市':['南关区','宽城区','朝阳区','二道区','绿园区','双阳区','九台区','农安县','榆树市','德惠市','公主岭市'],
  '哈尔滨市':['道里区','道外区','南岗区','香坊区','平房区','松北区','呼兰区','阿城区','双城区','依兰县','方正县','宾县','巴彦县','尚志市','五常市'],
  '南京市':['玄武区','秦淮区','建邺区','鼓楼区','浦口区','栖霞区','雨花台区','江宁区','六合区','溧水区','高淳区'],
  '苏州市':['姑苏区','虎丘区','吴中区','相城区','吴江区','太仓市','常熟市','张家港市','昆山市'],
  '杭州市':['上城区','拱墅区','西湖区','滨江区','萧山区','余杭区','临平区','钱塘区','富阳区','临安区','桐庐县','淳安县','建德市'],
  '宁波市':['海曙区','江北区','北仑区','镇海区','鄞州区','奉化区','象山县','宁海县','余姚市','慈溪市'],
  '合肥市':['瑶海区','庐阳区','蜀山区','包河区','长丰县','肥东县','肥西县','庐江县','巢湖市'],
  '福州市':['鼓楼区','台江区','仓山区','马尾区','晋安区','长乐区','闽侯县','连江县','罗源县','闽清县','永泰县','福清市'],
  '厦门市':['思明区','海沧区','湖里区','集美区','同安区','翔安区'],
  '南昌市':['东湖区','西湖区','青云谱区','青山湖区','新建区','红谷滩区','南昌县','安义县','进贤县'],
  '济南市':['历下区','市中区','槐荫区','天桥区','历城区','长清区','章丘区','济阳区','莱芜区','钢城区','平阴县','商河县'],
  '青岛市':['市南区','市北区','黄岛区','崂山区','李沧区','城阳区','即墨区','胶州市','平度市','莱西市'],
  '郑州市':['中原区','二七区','管城回族区','金水区','上街区','惠济区','中牟县','巩义市','荥阳市','新密市','新郑市','登封市'],
  '武汉市':['江岸区','江汉区','硚口区','汉阳区','武昌区','青山区','洪山区','东西湖区','蔡甸区','江夏区','黄陂区','新洲区'],
  '长沙市':['芙蓉区','天心区','岳麓区','开福区','雨花区','望城区','长沙县','浏阳市','宁乡市'],
  '广州市':['荔湾区','越秀区','海珠区','天河区','白云区','黄埔区','番禺区','花都区','南沙区','从化区','增城区'],
  '深圳市':['罗湖区','福田区','南山区','宝安区','龙岗区','盐田区','龙华区','坪山区','光明区','大鹏新区'],
  '海口市':['秀英区','龙华区','琼山区','美兰区'],
  '成都市':['锦江区','青羊区','金牛区','武侯区','成华区','龙泉驿区','青白江区','新都区','温江区','双流区','郫都区','新津区','金堂县','大邑县','蒲江县','都江堰市','彭州市','邛崃市','崇州市','简阳市'],
  '贵阳市':['南明区','云岩区','花溪区','乌当区','白云区','观山湖区','开阳县','息烽县','修文县','清镇市'],
  '昆明市':['五华区','盘龙区','官渡区','西山区','东川区','呈贡区','晋宁区','富民县','宜良县','嵩明县','安宁市'],
  '西安市':['新城区','碑林区','莲湖区','灞桥区','未央区','雁塔区','阎良区','临潼区','长安区','高陵区','鄠邑区','蓝田县','周至县'],
  '兰州市':['城关区','七里河区','西固区','安宁区','红古区','永登县','皋兰县','榆中县'],
  '西宁市':['城东区','城中区','城西区','城北区','湟中区','大通回族土族自治县','湟源县'],
  '呼和浩特市':['回民区','玉泉区','赛罕区','新城区','土默特左旗','托克托县','和林格尔县','清水河县','武川县'],
  '南宁市':['兴宁区','青秀区','江南区','西乡塘区','良庆区','邕宁区','武鸣区','隆安县','马山县','上林县','宾阳县','横州市'],
  '拉萨市':['城关区','堆龙德庆区','达孜区','林周县','当雄县','尼木县','曲水县','墨竹工卡县'],
  '银川市':['兴庆区','西夏区','金凤区','永宁县','贺兰县','灵武市'],
  '乌鲁木齐市':['天山区','沙依巴克区','新市区','水磨沟区','头屯河区','达坂城区','米东区','乌鲁木齐县'],
  '香港岛':['中西区','湾仔区','东区','南区'],
  '九龙':['油尖旺区','深水埗区','九龙城区','黄大仙区','观塘区'],
  '新界':['荃湾区','屯门区','元朗区','北区','大埔区','沙田区','西贡区','离岛区','葵青区'],
  '澳门半岛':['花地玛堂区','圣安多尼堂区','大堂区','望德堂区','风顺堂区'],
  '台北市':['中正区','大同区','中山区','松山区','大安区','万华区','信义区','士林区','北投区','内湖区','南港区','文山区']
}

const CITY_LONGITUDE = {
  '北京市':116.4,'天津市':117.2,'上海市':121.5,'重庆市':106.5,
  '石家庄市':114.5,'唐山市':118.2,'秦皇岛市':119.6,'邯郸市':114.5,'保定市':115.5,'张家口市':114.9,'承德市':117.9,'沧州市':116.8,'廊坊市':116.7,'衡水市':115.7,
  '太原市':112.5,'大同市':113.3,'阳泉市':113.6,'长治市':113.1,'运城市':111.0,'临汾市':111.5,'吕梁市':111.1,
  '沈阳市':123.4,'大连市':121.6,'鞍山市':123.0,'丹东市':124.4,'锦州市':121.1,'营口市':122.2,'阜新市':121.7,
  '长春市':125.3,'吉林市':126.6,'四平市':124.4,'松原市':124.8,'白城市':122.8,
  '哈尔滨市':126.6,'齐齐哈尔市':123.9,'大庆市':125.0,'佳木斯市':130.4,'牡丹江市':129.6,
  '南京市':118.8,'无锡市':120.3,'徐州市':117.2,'苏州市':120.6,'南通市':120.9,'扬州市':119.4,'镇江市':119.5,
  '杭州市':120.2,'宁波市':121.5,'温州市':120.7,'绍兴市':120.6,'金华市':119.6,
  '合肥市':117.3,'芜湖市':118.4,'安庆市':117.1,'黄山市':118.3,
  '福州市':119.3,'厦门市':118.1,'泉州市':118.7,'漳州市':117.7,
  '南昌市':115.9,'赣州市':114.9,'九江市':116.0,
  '济南市':117.0,'青岛市':120.4,'烟台市':121.4,'潍坊市':119.1,'临沂市':118.4,
  '郑州市':113.7,'洛阳市':112.5,'开封市':114.3,'南阳市':112.5,'信阳市':114.1,
  '武汉市':114.3,'宜昌市':111.3,'襄阳市':112.1,'荆州市':112.2,
  '长沙市':113.0,'株洲市':113.1,'衡阳市':112.6,'张家界市':110.5,
  '广州市':113.3,'深圳市':114.1,'珠海市':113.6,'汕头市':116.7,'佛山市':113.1,'东莞市':113.8,'中山市':113.4,
  '海口市':110.3,'三亚市':109.5,
  '成都市':104.1,'绵阳市':104.7,'宜宾市':104.6,'南充市':106.1,
  '贵阳市':106.7,'遵义市':106.9,
  '昆明市':102.7,'曲靖市':103.8,'丽江市':100.2,
  '西安市':108.9,'宝鸡市':107.2,'汉中市':107.0,'榆林市':109.7,
  '兰州市':103.8,'天水市':105.7,'酒泉市':98.5,
  '西宁市':101.8,
  '呼和浩特市':111.7,'包头市':110.0,'赤峰市':118.9,'鄂尔多斯市':109.8,
  '南宁市':108.4,'柳州市':109.4,'桂林市':110.3,
  '拉萨市':91.1,'日喀则市':88.9,
  '银川市':106.3,
  '乌鲁木齐市':87.6,'喀什地区':75.9,'和田地区':79.9,
  '香港岛':114.2,'九龙':114.2,'新界':114.1,
  '澳门半岛':113.6,'氹仔':113.6,
  '台北市':121.5,'台中市':120.7,'台南市':120.2,'高雄市':120.3
}

function getRegionCities(province) {
  return CITIES_MAP[province] || []
}
function getRegionDistricts(city) {
  return DISTRICTS_MAP[city] || ['市辖区']
}
function getRegionLongitudeByCity(city) {
  return CITY_LONGITUDE[city] || 116.4
}

// regionUtil 工具对象，供页面方法统一调用
const regionUtil = {
  getProvinces() {
    return PROVINCES
  },
  getCities(province) {
    return getRegionCities(province)
  },
  getDistricts(city) {
    return getRegionDistricts(city)
  },
  getCityLongitude(city) {
    return getRegionLongitudeByCity(city)
  }
}

// ── 农历转公历（lunar2solar）──
// 数据格式：每个数组元素对应一个农历年（从1900年开始）
// 每个元素为 [闰月序号(0=无闰月), 月1天数, 月2天数, ..., 月12天数(或13个月), 春节公历月, 春节公历日]
// 月天数：29=小月，30=大月；若有闰月则在对应月后插入一个额外的月天数
// 此数据覆盖 1900-2100 年
const LUNAR_DATA = (function() {
  // 每年数据：[闰月(0=无), m1..m12或m1..m13, 春节月, 春节日]
  // 若闰月=N，则m(N+1)之前插入了闰月天数
  // 共14项（无闰月）或15项（有闰月）
  // 格式：紧凑16进制字串，每个月用1位(0=29,1=30)，春节用月+日两字节
  // 以下为经典查表数据（1900-2100）
  // lunarInfo 每项: [leapMonth, ...monthDays(12 or 13), sfMonth, sfDay]
  // monthDays: 0->29天，1->30天，长度=12(无闰)或13(有闰)
  const raw = [
    // 1900
    [8,1,0,1,0,1,0,1,1,0,0,1,0,1, 1,31],
    // 1901
    [0,0,1,0,1,0,1,0,1,1,0,1,0, 2,19],
    // 1902
    [5,0,1,0,0,1,0,1,0,1,1,0,1,0, 2, 8],
    // 1903
    [0,1,0,1,0,0,1,0,1,0,1,1,0, 1,29],
    // 1904
    [2,1,0,1,1,0,0,1,0,1,0,1,0,1, 2,16],
    // 1905
    [0,1,0,1,0,1,0,0,1,0,1,0,1, 2, 4],
    // 1906
    [4,1,0,1,1,0,1,0,0,1,0,1,0,1, 1,25],
    // 1907
    [0,0,1,0,1,1,0,1,0,1,0,1,0, 2,13],
    // 1908
    [0,1,0,0,1,0,1,1,0,1,0,1,1, 2, 2],
    // 1909
    [2,0,1,0,0,1,0,1,0,1,0,1,1,0, 1,22],
    // 1910
    [0,1,0,1,0,0,1,0,1,0,1,0,1, 2,10],
    // 1911
    [6,0,1,0,1,1,0,0,1,0,1,0,1,0, 1,30],
    // 1912
    [0,1,0,1,0,1,0,1,0,1,0,0,1, 2,18],
    // 1913
    [0,1,1,0,1,0,1,1,0,1,0,0,1, 2, 6],
    // 1914
    [5,0,1,0,1,0,1,1,0,1,1,0,0,1, 1,26],
    // 1915
    [0,0,1,0,1,0,1,0,1,1,0,1,0, 2,14],
    // 1916
    [0,1,0,0,1,0,1,0,1,1,0,1,1, 2, 3],
    // 1917
    [2,0,1,0,0,1,0,0,1,0,1,1,0,1, 1,23],
    // 1918
    [0,1,0,1,0,0,1,0,0,1,0,1,0, 2,11],
    // 1919
    [7,1,0,1,1,0,1,0,0,1,0,1,0,1, 2, 1],
    // 1920
    [0,0,1,0,1,1,0,1,0,0,1,0,1, 2,20],
    // 1921
    [0,0,1,0,1,0,1,1,0,1,0,1,0, 2, 8],
    // 1922
    [5,1,0,0,1,0,1,0,1,1,0,1,0,1, 1,28],
    // 1923
    [0,0,1,0,0,1,0,1,0,1,1,0,1, 2,16],
    // 1924
    [0,0,1,1,0,0,1,0,1,0,1,1,0, 2, 5],
    // 1925
    [4,1,0,1,0,1,0,0,1,0,1,0,1,1, 1,24],
    // 1926
    [0,0,1,0,1,0,1,0,0,1,0,1,0, 2,13],
    // 1927
    [0,1,1,0,1,0,1,0,0,1,0,1,0, 2, 2],
    // 1928
    [2,1,1,0,1,0,1,1,0,0,1,0,0,1, 1,23],
    // 1929
    [0,1,0,1,1,0,1,0,1,0,1,0,0, 2,10],
    // 1930
    [6,1,0,1,0,1,1,0,1,0,1,0,1,0, 1,30],
    // 1931
    [0,0,1,0,1,0,1,1,0,1,0,1,0, 2,17],
    // 1932
    [0,1,0,0,1,0,1,0,1,1,0,1,1, 2, 6],
    // 1933
    [5,0,1,0,0,1,0,1,0,1,0,1,1,0, 1,26],
    // 1934
    [0,1,0,1,0,0,1,0,1,0,0,1,1, 2,14],
    // 1935
    [0,0,1,1,0,1,0,0,1,0,1,0,1, 2, 4],
    // 1936
    [3,1,0,1,0,1,1,0,0,1,0,1,0,1, 1,24],
    // 1937
    [0,0,1,0,1,0,1,1,0,1,0,1,0, 2,11],
    // 1938
    [7,1,0,0,1,0,1,0,1,1,0,1,0,1, 1,31],
    // 1939
    [0,0,1,0,0,1,0,1,0,1,1,0,1, 2,19],
    // 1940
    [0,0,1,1,0,0,1,0,1,0,1,0,1, 2, 8],
    // 1941
    [6,0,1,0,1,1,0,0,1,0,1,0,1,0, 1,27],
    // 1942
    [0,1,0,1,0,1,0,1,0,0,1,0,1, 2,15],
    // 1943
    [0,0,1,0,1,1,0,1,0,0,1,0,1, 2, 5],
    // 1944
    [4,1,0,1,0,1,0,1,1,0,0,1,0,0, 1,25],
    // 1945
    [0,1,0,1,0,1,0,1,1,0,1,0,1, 2,13],
    // 1946
    [0,0,1,0,0,1,0,1,0,1,1,0,1, 2, 2],
    // 1947
    [2,1,0,1,0,0,1,0,1,0,1,0,1,0, 1,22],
    // 1948
    [0,1,1,0,1,0,0,1,0,0,1,0,1, 2,10],
    // 1949
    [7,0,1,1,0,1,0,0,1,0,1,0,1,0, 1,29],
    // 1950
    [0,1,0,1,1,0,1,0,1,0,1,0,1, 2,17],
    // 1951
    [0,0,1,0,1,0,1,1,0,1,0,1,0, 2, 6],
    // 1952
    [5,1,0,0,1,0,1,0,1,1,0,1,0,1, 1,27],
    // 1953
    [0,0,1,0,0,1,0,1,0,1,1,0,1, 2,14],
    // 1954
    [0,0,1,1,0,0,1,0,1,0,1,1,0, 2, 3],
    // 1955
    [3,1,0,1,0,1,0,0,1,0,1,0,1,0, 1,24],
    // 1956
    [0,1,0,1,1,0,1,0,0,1,0,1,0, 2,12],
    // 1957
    [8,0,1,0,1,1,0,1,0,1,0,1,0,0, 1,31],
    // 1958
    [0,1,0,1,0,1,1,0,1,0,1,0,1, 2,18],
    // 1959
    [0,0,1,0,1,0,1,0,1,1,0,1,0, 2, 8],
    // 1960
    [6,1,0,0,1,0,1,0,1,0,1,1,0,1, 1,28],
    // 1961
    [0,0,1,0,0,1,0,1,0,1,0,1,1, 2,15],
    // 1962
    [0,0,1,1,0,0,1,0,0,1,0,1,1, 2, 5],
    // 1963
    [4,1,0,1,0,1,0,1,0,0,1,0,1,0, 1,25],
    // 1964
    [0,1,1,0,1,0,1,0,1,0,0,1,0, 2,13],
    // 1965
    [0,1,1,0,1,1,0,1,0,1,0,0,1, 2, 2],
    // 1966
    [3,0,1,0,1,1,0,1,0,1,0,1,0,0, 1,21],
    // 1967
    [0,1,0,1,0,1,0,1,1,0,1,0,1, 2, 9],
    // 1968
    [7,0,1,0,0,1,0,1,0,1,1,0,1,1, 1,30],
    // 1969
    [0,0,1,0,0,1,0,0,1,0,1,1,0, 2,17],
    // 1970
    [0,1,0,1,0,0,1,0,0,1,0,1,0, 2, 6],
    // 1971
    [5,1,1,0,1,0,0,1,0,1,0,1,0,1, 1,27],
    // 1972
    [0,0,1,1,0,1,0,1,0,1,0,1,0, 2,15],
    // 1973
    [0,1,0,1,0,1,0,1,0,1,0,1,0, 2, 3],
    // 1974
    [4,1,0,1,1,0,1,0,1,0,1,0,1,0, 1,23],
    // 1975
    [0,0,1,0,1,1,0,1,0,1,0,0,1, 2,11],
    // 1976
    [8,0,1,0,1,0,1,1,0,1,0,1,0,0, 1,31],
    // 1977
    [0,1,0,1,0,1,0,1,1,0,1,0,1, 2,18],
    // 1978
    [0,0,1,0,1,0,0,1,1,0,1,0,1, 2, 7],
    // 1979
    [6,1,0,1,0,1,0,0,1,0,1,1,0,1, 1,28],
    // 1980
    [0,0,1,0,1,0,1,0,0,1,0,1,1, 2,16],
    // 1981
    [0,0,1,0,1,0,1,0,0,1,0,1,0, 2, 5],
    // 1982
    [4,1,0,1,1,0,0,1,0,0,1,0,1,0, 1,25],
    // 1983
    [0,1,1,0,1,0,1,0,1,0,0,1,0, 2,13],
    // 1984
    [10,1,1,0,1,0,1,1,0,1,0,1,0,1, 2, 2],
    // 1985
    [0,0,1,0,1,0,1,0,1,1,0,1,0, 2,20],
    // 1986
    [0,1,0,0,1,0,0,1,0,1,1,0,1, 2, 9],
    // 1987
    [6,1,0,1,0,1,0,0,1,0,1,0,1,1, 1,29],
    // 1988
    [0,0,1,0,1,0,1,0,0,1,0,1,0, 2,17],
    // 1989
    [0,0,1,1,0,1,0,1,0,0,1,0,1, 2, 6],
    // 1990
    [5,0,1,0,1,1,0,1,0,1,0,0,1,0, 1,27],
    // 1991
    [0,1,0,1,0,1,1,0,1,0,1,0,1, 2,15],
    // 1992
    [0,0,1,0,0,1,1,0,1,0,1,0,1, 2, 4],
    // 1993
    [3,1,0,1,0,0,1,0,1,1,0,1,0,1, 1,23],
    // 1994
    [0,0,1,0,1,0,0,1,0,1,1,0,1, 2,10],
    // 1995
    [8,0,1,0,1,1,0,0,1,0,1,0,1,1, 1,31],
    // 1996
    [0,0,0,1,0,1,0,1,0,1,0,1,0, 2,19],
    // 1997
    [0,1,0,0,1,0,1,0,1,0,1,0,1, 2, 7],
    // 1998
    [5,1,0,1,0,1,0,1,0,1,0,1,0,0, 1,28],
    // 1999
    [0,1,1,0,1,0,1,0,1,0,1,0,1, 2,16],
    // 2000
    [0,0,1,1,0,1,0,1,0,1,0,0,1, 2, 5],
    // 2001
    [4,1,0,1,0,1,1,0,1,0,1,0,0,1, 1,24],
    // 2002
    [0,0,1,0,1,0,1,1,0,1,0,1,0, 2,12],
    // 2003
    [0,1,0,0,1,0,1,0,1,1,0,1,0, 2, 1],
    // 2004
    [2,1,0,1,0,0,1,0,1,0,1,1,0,1, 1,22],
    // 2005
    [0,0,1,0,1,0,0,1,0,1,0,1,1, 2, 9],
    // 2006
    [7,0,1,0,1,0,1,0,0,1,0,1,0,1, 1,29],
    // 2007
    [0,1,0,1,0,1,0,1,0,0,1,0,1, 2,18],
    // 2008
    [0,0,1,0,1,1,0,1,0,1,0,0,1, 2, 7],
    // 2009
    [5,1,0,0,1,0,1,1,0,1,0,1,0,1, 1,26],
    // 2010
    [0,0,1,0,0,1,0,1,1,0,1,0,1, 2,14],
    // 2011
    [0,0,1,0,0,1,0,1,0,1,1,0,1, 2, 3],
    // 2012
    [4,1,0,1,0,0,1,0,0,1,0,1,1,0, 1,23],
    // 2013
    [0,1,1,0,1,0,0,1,0,0,1,0,1, 2,10],
    // 2014
    [9,0,1,1,0,1,0,1,0,0,1,0,0,1, 1,31],
    // 2015
    [0,1,0,1,1,0,1,0,1,0,0,1,0, 2,19],
    // 2016
    [0,0,1,0,1,1,0,1,0,1,0,1,0, 2, 8],
    // 2017
    [6,1,0,0,1,0,1,1,0,1,0,1,0,1, 1,28],
    // 2018
    [0,0,1,0,0,1,0,1,1,0,1,0,1, 2,16],
    // 2019
    [0,0,1,0,0,1,0,1,0,1,1,0,1, 2, 5],
    // 2020
    [4,1,0,1,0,0,1,0,0,1,0,1,1,0, 1,25],
    // 2021
    [0,1,1,0,1,0,0,1,0,0,1,0,1, 2,12],
    // 2022
    [0,0,1,1,0,1,0,1,0,1,0,0,1, 2, 1],
    // 2023
    [2,1,0,1,0,1,1,0,1,0,1,0,0,1, 1,22],
    // 2024
    [0,0,1,0,1,0,1,1,0,1,0,1,0, 2,10],
    // 2025
    [6,1,0,0,1,0,1,0,1,1,0,1,0,1, 1,29],
    // 2026
    [0,0,1,0,0,1,0,1,0,1,1,0,1, 2,17],
    // 2027
    [0,0,1,1,0,0,1,0,1,0,1,0,1, 2, 6],
    // 2028
    [5,0,1,0,1,1,0,0,1,0,1,0,1,0, 1,26],
    // 2029
    [0,1,0,1,0,1,0,1,0,0,1,0,1, 2,13],
    // 2030
    [0,1,0,1,1,0,1,0,1,0,0,1,0, 2, 3],
    // 2031
    [3,1,0,1,0,1,1,0,1,0,1,0,0,1, 1,23],
    // 2032
    [0,0,1,0,1,0,1,1,0,1,0,1,0, 2,11],
    // 2033
    [11,1,0,0,1,0,1,0,1,1,0,1,0,1, 1,31],
    // 2034
    [0,0,1,0,0,1,0,1,0,1,1,0,1, 2,19],
    // 2035
    [0,0,1,1,0,0,1,0,0,1,1,0,1, 2, 8],
    // 2036
    [6,1,0,1,0,1,0,1,0,0,1,0,1,0, 1,28],
    // 2037
    [0,1,1,0,1,0,1,0,1,0,0,1,0, 2,15],
    // 2038
    [0,1,0,1,1,0,1,0,1,0,1,0,0, 2, 4],
    // 2039
    [5,1,0,1,0,1,1,0,1,0,1,0,1,0, 1,24],
    // 2040
    [0,1,0,0,1,0,1,1,0,1,0,1,0, 2,12],
    // 2041
    [0,1,0,0,1,0,1,0,1,1,0,1,0, 2, 1],
    // 2042
    [2,1,1,0,0,1,0,1,0,1,0,1,1,0, 1,22],
    // 2043
    [0,0,1,1,0,0,1,0,1,0,1,0,1, 2, 9],
    // 2044
    [7,0,1,0,1,1,0,0,1,0,1,0,1,0, 1,30],
    // 2045
    [0,1,0,1,0,1,0,1,0,0,1,0,1, 2,17],
    // 2046
    [0,0,1,0,1,1,0,1,0,1,0,0,1, 2, 6],
    // 2047
    [5,1,0,0,1,0,1,1,0,1,0,1,0,0, 1,26],
    // 2048
    [0,1,0,1,0,1,0,1,1,0,1,0,1, 2,14],
    // 2049
    [0,0,1,0,1,0,0,1,1,0,1,0,1, 2, 2],
    // 2050
    [3,1,0,1,0,1,0,0,1,0,1,1,0,1, 1,23]
  ]
  return raw
})()

/**
 * 获取农历某年的月份天数列表（含闰月）
 * 返回 [{month, isLeap, days}, ...]
 */
function getLunarMonthDays(lunarYear) {
  const idx = lunarYear - 1900
  if (idx < 0 || idx >= LUNAR_DATA.length) return null
  const data = LUNAR_DATA[idx]
  const leapMonth = data[0]
  // 月份数据从 index 1 开始，到 data.length-3 结束（最后两项为春节月日）
  const monthData = data.slice(1, data.length - 2)
  const result = []
  let mNum = 1
  let leapInserted = false
  for (let i = 0; i < monthData.length; i++) {
    const days = monthData[i] === 1 ? 30 : 29
    if (!leapInserted && leapMonth > 0 && mNum - 1 === leapMonth) {
      // 当前位置是闰月（插入在正月 leapMonth 之后）
      result.push({ month: leapMonth, isLeap: true, days })
      leapInserted = true
      // 下一项才是下一个正月
      mNum++
      i++ // 跳过已作为闰月消费的这一位，继续处理下一位
      if (i < monthData.length) {
        result.push({ month: mNum, isLeap: false, days: monthData[i] === 1 ? 30 : 29 })
        mNum++
      }
    } else {
      result.push({ month: mNum, isLeap: false, days })
      mNum++
    }
  }
  return result
}

/**
 * 获取农历某年春节（正月初一）的公历日期
 * 返回 {year, month, day}
 */
function getSpringFestival(lunarYear) {
  const idx = lunarYear - 1900
  if (idx < 0 || idx >= LUNAR_DATA.length) return null
  const data = LUNAR_DATA[idx]
  return {
    year: lunarYear,
    month: data[data.length - 2],
    day: data[data.length - 1]
  }
}

/**
 * 农历转公历
 * @param {number} lunarYear  农历年（如2000）
 * @param {number} lunarMonth 农历月（1-12）
 * @param {number} lunarDay   农历日（1-30）
 * @param {boolean} isLeap    是否闰月
 * @returns {{year,month,day}|null} 对应公历日期，或 null 表示超出范围/参数错误
 */
function lunar2solar(lunarYear, lunarMonth, lunarDay, isLeap) {
  isLeap = !!isLeap
  const sf = getSpringFestival(lunarYear)
  if (!sf) return null

  // 从春节当天（正月初一）开始累加天数
  let offsetDays = 0

  const months = getLunarMonthDays(lunarYear)
  if (!months) return null

  let found = false
  for (const m of months) {
    if (m.month === lunarMonth && m.isLeap === isLeap) {
      // 目标月份：加上目标日之前的天数
      offsetDays += lunarDay - 1
      found = true
      break
    }
    offsetDays += m.days
  }

  if (!found) return null

  // 以春节公历日期为起点，加 offsetDays
  const base = new Date(sf.year, sf.month - 1, sf.day)
  base.setDate(base.getDate() + offsetDays)

  return {
    year: base.getFullYear(),
    month: base.getMonth() + 1,
    day: base.getDate()
  }
}

Page({
  data: {
    // 表单数据
    formData: {
      name: '',
      gender: 'male',
      calendarType: 'solar', // solar: 阳历, lunar: 农历
      date: '',
      time: '',
      region: [],
      useTrueSolarTime: false
    },

    // 地区数据（三级联动）
    regionData: [[], [], []],
    regionIndex: [0, 0, 0],
    selectedRegion: '',

    // 时辰显示
    shichen: '',

    // 命盘数据
    chartData: null,

    // 历史记录
    historyCharts: [],

    // 状态
    isLoading: false,
    canGenerate: false
  },

  onLoad() {
    console.log('排盘页面加载')
    this.baziCalculator = new BaziCalculator()
    this.initRegionData()
    this.loadHistoryCharts()
    this.initDefaultData()
  },

  onShow() {
    // 页面显示时刷新历史记录
    this.loadHistoryCharts()
  },

  /**
   * 初始化默认数据
   */
  initDefaultData() {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().split(' ')[0].substring(0, 5)

    this.setData({
      'formData.date': date,
      'formData.time': time
    })

    this.updateShichen(now.getHours())
    this.checkCanGenerate()
  },

  /**
   * 姓名输入
   */
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  /**
   * 性别选择
   */
  onGenderChange(e) {
    this.setData({
      'formData.gender': e.detail.value
    })
  },

  /**
   * 历法选择
   */
  onCalendarTypeChange(e) {
    this.setData({
      'formData.calendarType': e.detail.value
    })
  },

  /**
   * 日期选择
   */
  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
    this.checkCanGenerate()
  },

  /**
   * 时间选择
   */
  onTimeChange(e) {
    const time = e.detail.value
    this.setData({
      'formData.time': time
    })

    // 更新时辰显示
    const hour = parseInt(time.split(':')[0])
    this.updateShichen(hour)
    this.checkCanGenerate()
  },

  /**
   * 更新时辰显示
   */
  updateShichen(hour) {
    const shichenMap = [
      '子时 (23:00-01:00)', '丑时 (01:00-03:00)', '寅时 (03:00-05:00)',
      '卯时 (05:00-07:00)', '辰时 (07:00-09:00)', '巳时 (09:00-11:00)',
      '午时 (11:00-13:00)', '未时 (13:00-15:00)', '申时 (15:00-17:00)',
      '酉时 (17:00-19:00)', '戌时 (19:00-21:00)', '亥时 (21:00-23:00)'
    ]

    const shichenIndex = Math.floor((hour + 1) / 2) % 12
    this.setData({
      shichen: shichenMap[shichenIndex]
    })
  },

  /**
   * 初始化地区三级联动数据
   */
  initRegionData() {
    const provinces = regionUtil.getProvinces()
    const cities = regionUtil.getCities(provinces[0])
    const districts = regionUtil.getDistricts(cities[0] || '')
    this.setData({
      regionData: [provinces, cities, districts],
      regionIndex: [0, 0, 0]
    })
  },

  /**
   * 地区选择（列切换联动）
   */
  onRegionColumnChange(e) {
    const { column, value } = e.detail
    const { regionData, regionIndex } = this.data
    const newIndex = [...regionIndex]
    newIndex[column] = value

    if (column === 0) {
      // 省份变化 → 更新城市和区县
      const cities = regionUtil.getCities(regionData[0][value])
      const districts = regionUtil.getDistricts(cities[0] || '')
      newIndex[1] = 0
      newIndex[2] = 0
      this.setData({
        'regionData[1]': cities,
        'regionData[2]': districts,
        regionIndex: newIndex
      })
    } else if (column === 1) {
      // 城市变化 → 更新区县
      const districts = regionUtil.getDistricts(regionData[1][value])
      newIndex[2] = 0
      this.setData({
        'regionData[2]': districts,
        regionIndex: newIndex
      })
    } else {
      this.setData({ regionIndex: newIndex })
    }
  },

  /**
   * 地区选择确认
   */
  onRegionChange(e) {
    const values = e.detail.value
    const { regionData } = this.data
    const province = regionData[0][values[0]] || ''
    const city = regionData[1][values[1]] || ''
    const district = regionData[2][values[2]] || ''
    const selectedRegion = [province, city, district].filter(Boolean).join(' ')
    this.setData({
      'formData.region': values,
      selectedRegion,
      regionIndex: values
    })
  },

  /**
   * 真太阳时校正开关
   */
  onTrueSolarTimeChange(e) {
    this.setData({
      'formData.useTrueSolarTime': e.detail.value
    })
  },

  /**
   * 检查是否可以生成命盘
   */
  checkCanGenerate() {
    const { date, time } = this.data.formData
    const canGenerate = date && time

    this.setData({
      canGenerate
    })
  },

  /**
   * 生成命盘
   */
  async generateChart() {
    if (!this.data.canGenerate) {
      wx.showToast({
        title: '请完善出生信息',
        icon: 'none'
      })
      return
    }

    this.setData({ isLoading: true })

    try {
      const { formData } = this.data

      // 解析日期时间
      const [year, month, day] = formData.date.split('-').map(Number)
      const [hour, minute] = formData.time.split(':').map(Number)

      // 准备出生信息
      const birthInfo = {
        name: formData.name,
        gender: formData.gender,
        year,
        month,
        day,
        hour,
        minute,
        calendarType: formData.calendarType,
        useTrueSolarTime: formData.useTrueSolarTime,
        longitude: this.getRegionLongitude(formData.region)
      }

      // 如果是农历，需要转换为阳历
      if (formData.calendarType === 'lunar') {
        const isLeapMonth = formData.isLeapMonth || false
        const solar = lunar2solar(year, month, day, isLeapMonth)
        if (!solar) {
          wx.showToast({
            title: '农历日期超出支持范围（1900-2050年）',
            icon: 'none'
          })
          this.setData({ isLoading: false })
          return
        }
        birthInfo.year = solar.year
        birthInfo.month = solar.month
        birthInfo.day = solar.day
      }

      // 生成命盘
      const chartData = this.baziCalculator.generateChart(birthInfo)

      this.setData({
        chartData,
        isLoading: false
      })

      // 保存到历史记录
      this.saveToHistory(chartData)

      wx.showToast({
        title: '排盘成功',
        icon: 'success'
      })

    } catch (error) {
      console.error('排盘失败：', error)
      this.setData({ isLoading: false })

      wx.showToast({
        title: '排盘失败，请重试',
        icon: 'none'
      })
    }
  },

  /**
   * 获取地区经度（用于真太阳时校正）
   */
  getRegionLongitude(region) {
    const { regionData } = this.data
    if (region && region.length >= 2) {
      const city = regionData[1][region[1]]
      if (city) return regionUtil.getCityLongitude(city)
    }
    return 116.4 // 默认北京经度
  },

  /**
   * 显示示例命盘
   */
  showSampleChart() {
    const sampleBirthInfo = {
      name: '张三',
      gender: 'male',
      year: 1990,
      month: 6,
      day: 15,
      hour: 14,
      minute: 30,
      calendarType: 'solar',
      useTrueSolarTime: false,
      longitude: 116.4
    }

    const chartData = this.baziCalculator.generateChart(sampleBirthInfo)

    this.setData({
      chartData
    })

    wx.showToast({
      title: '示例命盘已生成',
      icon: 'success'
    })
  },

  /**
   * AI智能解读
   */
  getAIAnalysis() {
    if (!this.data.chartData) {
      wx.showToast({
        title: '请先生成命盘',
        icon: 'none'
      })
      return
    }

    // 通过 globalData 传递数据，避免 URL 参数大小限制
    app.globalData.currentChart = this.data.chartData
    wx.navigateTo({
      url: '/pages/analysis/analysis'
    })
  },

  /**
   * 保存命盘
   */
  async saveChart() {
    if (!this.data.chartData) {
      wx.showToast({
        title: '请先生成命盘',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '保存中...' })

    const loggedIn = await ensureLogin()
    if (loggedIn) {
      try {
        await request('/api/charts', 'POST', {
          name: this.data.chartData.birthInfo.name || `命盘_${new Date().toLocaleDateString()}`,
          birthInfo: this.data.chartData.birthInfo,
          chartData: this.data.chartData
        })
        wx.hideLoading()
        wx.showToast({ title: '保存成功', icon: 'success' })
        this.loadHistoryCharts()
        return
      } catch (error) {
        console.error('API保存失败，降级到本地存储：', error)
        wx.hideLoading()
      }
    } else {
      wx.hideLoading()
    }

    // 降级到本地存储
    try {
      const charts = wx.getStorageSync('savedCharts') || []
      const newChart = {
        id: Date.now(),
        ...this.data.chartData,
        createTime: new Date().toLocaleString()
      }
      charts.unshift(newChart)
      if (charts.length > 50) charts.splice(50)
      wx.setStorageSync('savedCharts', charts)
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.loadHistoryCharts()
    } catch (error) {
      console.error('保存失败：', error)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  /**
   * 分享命盘
   */
  shareChart() {
    if (!this.data.chartData) {
      wx.showToast({
        title: '请先生成命盘',
        icon: 'none'
      })
      return
    }

    const { chartData } = this.data
    const shareText = `${chartData.birthInfo.name || '我'}的八字命盘：\n${chartData.baziString}\n\n使用八字排盘小程序查看详细解读`

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })

    wx.showToast({
      title: '可以分享给好友了',
      icon: 'success'
    })
  },

  /**
   * 加载历史记录
   */
  async loadHistoryCharts() {
    const token = wx.getStorageSync('token')
    if (token) {
      try {
        const data = await request('/api/charts?limit=5')
        this.setData({ historyCharts: data.charts || [] })
        return
      } catch (error) {
        console.error('从API加载历史失败，降级本地存储：', error)
      }
    }
    // 降级到本地存储
    try {
      const charts = wx.getStorageSync('savedCharts') || []
      this.setData({ historyCharts: charts.slice(0, 5) })
    } catch (error) {
      console.error('加载历史记录失败：', error)
    }
  },

  /**
   * 保存到历史记录
   */
  saveToHistory(chartData) {
    try {
      const charts = wx.getStorageSync('historyCharts') || []
      const newChart = {
        id: Date.now(),
        ...chartData,
        createTime: new Date().toLocaleString()
      }

      // 检查是否已存在相同命盘
      const existIndex = charts.findIndex(chart => chart.baziString === chartData.baziString)
      if (existIndex !== -1) {
        charts.splice(existIndex, 1)
      }

      charts.unshift(newChart)

      // 最多保存20个历史记录
      if (charts.length > 20) {
        charts.splice(20)
      }

      wx.setStorageSync('historyCharts', charts)
      this.loadHistoryCharts()

    } catch (error) {
      console.error('保存历史记录失败：', error)
    }
  },

  /**
   * 加载历史命盘
   */
  loadHistoryChart(e) {
    const chart = e.currentTarget.dataset.chart

    this.setData({
      chartData: chart,
      'formData.name': chart.birthInfo.name || '',
      'formData.gender': chart.birthInfo.gender || 'male'
    })

    wx.showToast({
      title: '已加载历史命盘',
      icon: 'success'
    })
  },

  /**
   * 删除命盘记录
   */
  deleteChart(e) {
    const chartId = e.currentTarget.dataset.id

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个命盘记录吗？',
      success: async (res) => {
        if (res.confirm) {
          // MongoDB ObjectId 是24位十六进制字符串
          const isApiChart = typeof chartId === 'string' && /^[0-9a-f]{24}$/i.test(chartId)
          if (isApiChart) {
            try {
              await request(`/api/charts/${chartId}`, 'DELETE')
            } catch (error) {
              console.error('API删除失败：', error)
            }
          } else {
            // 本地存储删除
            try {
              let charts = wx.getStorageSync('savedCharts') || []
              charts = charts.filter(chart => chart.id !== chartId)
              wx.setStorageSync('savedCharts', charts)
              let history = wx.getStorageSync('historyCharts') || []
              history = history.filter(chart => chart.id !== chartId)
              wx.setStorageSync('historyCharts', history)
            } catch (err) {
              console.error('本地删除失败：', err)
            }
          }
          this.loadHistoryCharts()
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  /**
   * 对比命盘
   */
  compareChart(e) {
    const chart = e.currentTarget.dataset.chart

    if (!this.data.chartData) {
      wx.showToast({
        title: '请先生成一个命盘',
        icon: 'none'
      })
      return
    }

    app.globalData.compareCharts = {
      chart1: this.data.chartData,
      chart2: chart
    }
    wx.navigateTo({ url: '/pages/compare/compare' })
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    return {
      title: '八字排盘 - 专业命理服务',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share-banner.png'
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '八字排盘小程序',
      query: 'from=timeline',
      imageUrl: '/assets/images/share-banner.png'
    }
  }
})