import './style.css'
import {MousePosition, OverviewMap, ScaleLine, ZoomToExtent} from 'ol/control'
import {defaults as default_onteraction} from 'ol/interaction'
import {Feature, Map, View} from 'ol'
import {Cluster, OSM, Vector, XYZ} from 'ol/source'
import Draw, {createBox} from 'ol/interaction/Draw'

import TileLayer from 'ol/layer/Tile'
import {LineString, Point, Polygon} from 'ol/geom'
import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import VectorLayer from 'ol/layer/Vector'
import Stroke from 'ol/style/Stroke'
import GeoJSON from 'ol/format/GeoJSON'
import Text from 'ol/style/Text'
import Icon from 'ol/style/Icon'
import {Coordinate} from 'ol/coordinate'

const DEFAULT_PROJECTION = 'EPSG:4326'

// Flag0 : 前置知识 : 地图容器 核心概念
// 1. 一个Map由多个Layer组成 : 一个Layer表示一个图层
// 2. 一个Layer对应一个source数据源
// 3. 一个Source由多个Feature组成
// 4. 一个Feature = Geometry + Style

// 1.创建一个图层  , 使用默认地图作为图层
const OSMlayer = new TileLayer({
  source: new OSM(), //OSM()是OpenStreetMap地图数据
})
OSMlayer.setVisible(true)

// 试试高德地图
const GaudLayer = new TileLayer({
  source: new XYZ({
    url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
    wrapX: false,
  }),
})
GaudLayer.setVisible(false)

/**
// Flag 不同坐标系的解决办法
  注册不同坐标系之间的转化规则(用于后期自定义自己的坐标系), 使用proj4来进行常规坐标系转化
  proj4.defs函数用于定义新的坐标系 : proj4的默认缺省没有 3395
  proj4.defs('EPSG:3395', '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs')
  //openLayer也没有 3395 坐标系,所以需要增加转化规则
  addCoordinateTransforms(
    'EPSG:4326',
    'EPSG:3395',
    function (coordinate) {
      return proj4('EPSG:4326', 'EPSG:3395', coordinate)
    },
    function (coordinate) {
      return proj4('EPSG:3395', 'EPSG:4326', coordinate)
    }
  )
  addCoordinateTransforms(
    'EPSG:3857',
    'EPSG:3395',
    function (coordinate) {
      return proj4('EPSG:3857', 'EPSG:3395', coordinate)
    },
    function (coordinate) {
      return proj4('EPSG:3395', 'EPSG:3857', coordinate)
    }
  )
*/

//Flag 初始化地图
const map = new Map({
  target: 'map',
  layers: [GaudLayer, OSMlayer],

  //Flag view就是用户加载的视角
  view: new View({
    center: [118.793767, 32.020157],
    zoom: 15, //没有设置resolution时的变焦级别 范围是 0~22
    projection: DEFAULT_PROJECTION,
  }),

  // 设置交互
  interactions: default_onteraction({
    doubleClickZoom: false, //禁用双击放大
  }),
})
let now_point = null

//Flag 监听用户事件
map.on('click', ({coordinate}) => {
  // 2.创建一个自定义Feature , 当前的Feature是一个点 ,
  const feature1 = new Feature({
    // Feature所在位置
    geometry: new Point(coordinate),
  })
  //创建Feature样式 : 一个红心点
  const point_sty = new Style({
    image: new Circle({
      radius: 5,
      fill: new Fill({
        color: '#ff2d51',
      }),
      stroke: new Stroke({
        width: 2,
        color: '#333',
      }),
    }),
  })
  //嵌入点样式
  feature1.setStyle(point_sty)
  //2.1 将Feature添加到矢量数据源
  let source = new Vector({
    features: [feature1],
  })
  map.removeLayer(now_point)
  //2.2 将source添加进去Layer中  , 这里使用VectorLayer
  const layer = new VectorLayer({source})
  now_point = layer
  //2.3 最后添加进地图里面
  map.addLayer(layer)
})

{
  //Flag 3.加载geojson数据<格式固定>
  const GEOJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [118, 33],
        },
      },
    ],
  }
  //3.1 将geojson中的数据进行读取(只读features)
  const gjson_source = new Vector({
    features: new GeoJSON().readFeatures(GEOJSON),
  })
  const jlayer = new VectorLayer({
    maxZoom: 10,
    minZoom: 7,
    source: gjson_source,
  })
  //3.2 为gjson的数据添加样式
  jlayer.setStyle(
    new Style({
      image: new Icon({
        scale: 0.5,
        src: 'http://localhost:10086/static/img/project_green.b8873f4e.png',
      }),
    })
  )
  map.addLayer(jlayer)
}

{
  //Flag 4. 加载<面>线和<面> 区域
  const GJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          //线要素数据
          type: 'LineString',
          coordinates: [
            [118, 33],
            [119, 33],
          ],
        },
      },
    ],
  }
  const source = new Vector({
    features: [
      // 线
      new Feature({
        geometry: new LineString([
          [118, 33],
          [120, 34],
        ]),
      }),
      // 面
      new Feature({
        geometry: new Polygon([
          [
            [106, 33],
            [108.03955078125, 32.2313896627376],
            [108.25927734375, 33.15594830078649],
            [108, 34],
            [106, 33],
          ],
        ]),
      }),
    ],
  })
  const layer = new VectorLayer({source})
  layer.setStyle(
    new Style({
      stroke: new Stroke({
        width: 2,
        color: '#ff2d51',
      }),
    })
  )

  map.addLayer(layer)
}

{
  /** 
  //Flag 集群
  集群 : 一个用于聚合矢量数据的图层源。它可以将相邻的要素聚合成一个要素，以减少在地图上显示的大量要素时造成的性能问题。  
  使用场景 :   
  显示大量要素：在地图上显示大量要素时，使用 Cluster 可以提高性能并避免地图过载。  
  显示热点：使用 Cluster 可以在地图上显示要素的热点区域。  
  概览数据：使用 Cluster 可以在地图上显示数据的概览，以便用户快速了解数据的分布情况。  
   */
  const source = new Vector({
    features: [
      new Feature({geometry: new Point([117, 30])}),
      new Feature({geometry: new Point([118, 30])}),
      new Feature({geometry: new Point([119, 30])}),
      new Feature({geometry: new Point([120, 30])}),
      new Feature({geometry: new Point([121, 30])}),
      new Feature({geometry: new Point([122, 30])}),
      new Feature({geometry: new Point([123, 30])}),
    ],
  })

  //cluster 也是 source 的一种
  const cluster = new Cluster({distance: 100, /*设置合并的像素距离*/ source})

  const layer = new VectorLayer({
    source: cluster,
    style: feture => {
      return new Style({
        image: new Circle({
          radius: 3,
          fill: new Fill({
            color: '#222',
          }),
          stroke: new Stroke({
            color: '#888',
          }),
        }),
        text: new Text({
          text: '点',
          offsetY: 10,
        }),
      })
    },
  })
  map.addLayer(layer)
}

{
  // Flag 实现漫游动画效果
  map.on('dblclick', ({coordinate}) => {
    // 漫游效果是通过控制view来实现的
    const view = map.getView()
    // view.animate 来实现有动画效果的漫游
    view.animate({
      center: coordinate,
      zoom: view.getZoom() + 1,
    })
  })
}

{
  // Flag 实现交互效果(用户框选/测距)
  const draws = []
  //设置围栏 : 即让用户选定一块区域
  const draw = new Draw({
    source: new Vector({wrapX: false}),
    geometryFunction: createBox(),
    type: 'Circle',
  })
  //draw是属于Interaction<交互>的一种
  draw.on('drawend', evt => {
    // 画完之后并不会生成图像,需要你自己进行绑定
    const feature = evt.feature
    const draw_layer = new VectorLayer({
      source: new Vector({
        features: [feature],
      }),
    })
    map.addLayer(draw_layer)
    draws.push(draw_layer)
  })
  map.addInteraction(draw)

  map.on('dblclick', () => {
    console.log('右键')
    draws.forEach(item => map.removeLayer(item))
    draws.length = 0
  })
}

{
  //Flag 实现轨迹绘制
  // 使用 LineString 和 Point 来进行轨迹绘制 ==> 使用Point来作为历史轨迹 , 然后用LineString连接起来
  // 获取/绘制 历史轨迹
  const MOCK_DATA = [
    [108.945951, 34.465262],
    [109.04724, 34.262504],
    [108.580321, 34.076162],
    [110.458983, 35.071209],
    [105.734862, 35.49272],
    [104.458983, 35.071209],
    [103.734862, 35.49272],
  ]
  let before: Coordinate

  MOCK_DATA.forEach(coord => {
    // 每个地方都是一个点
    const layer = new VectorLayer({
      minZoom: 5,
      maxZoom: 11,
      source: new Vector({
        features: [
          new Feature({
            geometry: new Point(coord),
            properties: {like: 'point'},
          }),
          ...(before
            ? [
                new Feature({
                  geometry: new LineString([before, coord]),
                  properties: {like: 'line'},
                }),
              ]
            : []),
        ],
      }),
      // 将style设置为一个函数可以避免相同style问题 将不同的区分属性放到properties中
      style: feature => {
        if (feature.get('properties').like == 'point') {
          return new Style({
            image: new Circle({
              radius: 4,
              fill: new Fill({color: '#e3e3'}),
              stroke: new Stroke({color: '#fff'}),
            }),
          })
        } else {
          return new Style({
            stroke: new Stroke({color: '#222', width: 2}),
          })
        }
      },
    })
    before = coord
    map.addLayer(layer)
  })

  setInterval(() => {
    const coord = [
      MOCK_DATA.at(-1).at(0) + Math.random() / 10,
      MOCK_DATA.at(-1).at(1) + Math.random() / 10,
    ]
    MOCK_DATA.push(coord)
    const layer = new VectorLayer({
      source: new Vector({
        features: [
          new Feature({
            geometry: new Point(coord),
            properties: {like: 'point'},
          }),
          ...(before
            ? [
                new Feature({
                  geometry: new LineString([before, coord]),
                  properties: {like: 'line'},
                }),
              ]
            : []),
        ],
      }),
      style: feature => {
        if (feature.get('properties').like == 'point') {
          return new Style({
            image: new Circle({
              radius: 4,
              fill: new Fill({color: '#e3e3'}),
              stroke: new Stroke({color: '#fff'}),
            }),
          })
        } else {
          return new Style({
            stroke: new Stroke({color: '#222', width: 2}),
          })
        }
      },
    })
    before = coord
    map.addLayer(layer)
  }, 5000)

  {
    // Flag 实现导航跟踪效果
    const now_position = [118.793767, 32.020157]
    // 加上追踪动画,模拟导航效果
    const geometry = new Point(now_position)

    const car = new VectorLayer({
      source: new Vector({
        features: [new Feature({geometry})],
      }),
      style: new Style({
        image: new Icon({
          src: 'https://chzky-1312081881.cos.ap-nanjing.myqcloud.com/note/car.png',
          scale: 1 / 2,
          rotation: 0.4,
        }),
      }),
    })
    map.addLayer(car)

    setInterval(() => {
      const formerly_position = [...now_position]
      now_position[1] = now_position[1] + 0.001
      now_position[0] = now_position[0] + 0.00001

      const the_line_point_layer = new VectorLayer({
        source: new Vector({
          features: [
            new Feature({
              geometry: new Point(formerly_position),
              properties: {like: 'point'},
            }),
            new Feature({
              geometry: new LineString([formerly_position, now_position]),
              properties: {like: 'line'},
            }),
          ],
        }),
        style: feature => {
          if (feature.get('properties').like == 'point') {
            return new Style({
              image: new Circle({
                radius: 4,
                fill: new Fill({color: '#e3e3'}),
                stroke: new Stroke({color: '#fff'}),
              }),
            })
          } else {
            return new Style({
              stroke: new Stroke({color: '#222', width: 2}),
            })
          }
        },
      })

      const animate = () => {}
      {
        //车的移动动画
        car.on('postrender', animate) // 添加动画
        geometry.setCoordinates(now_position) // 更新位置
        car.un('postrender', animate) // 消除动画
      }

      map.addLayer(the_line_point_layer)
    }, 1000)
  }
}

// Flag : 前置知识 : 坐标系
/** ## 坐标系知识
### `EPSG:4326` : 
世界大地坐标系. 它是一种地理坐标系，使用经度、纬度和高度来定义地球上的位置。也就是我们常说的经纬度坐标系
EPSG:4326 坐标系的定义如下：
+ 椭球体：WGS84
+ 原点：地球质心
+ 单位：度
+ 范围：
  + 经度：-180° to 180°
  + 纬度：-90° to 90°
  + 高度：-100000 m to 100000 m

### `EPSG:3395` :
世界墨卡托投影坐标系,是一种正轴等距投影，将地球投影到一个<平面矩形>上。该投影的中心位于赤道和本初子午线，投影比例在赤道处为1。相当于将圆形地图进行平铺,方便显示在2D页面上  
3395坐标系常用于全球地图和Web地图应用中，因为它具有以下优点：
投影比例在所有方向上都保持一致，因此不会造成形状失真。
适用于大范围区域的映射，因为它可以最小化距离和面积的失真。
易于计算和使用。
3395坐标系的单位为米，其范围为：
          北：20026376.39
西：-15496570.74      东：15496570.74
          南：-20026376.39

3395坐标系与其他常用坐标系的转换关系如下： 3395与4326（WGS84地理坐标系）：可以通过proj4进行转换

### `EPSG:3857`
也是一种世界墨卡托投影坐标系.常用于Web地图中,和EPSG:3395的区别是投影比例因子不一致 :   
EPSG:3857使用的是WGS84椭球体，投影比例因子为1。 EPSG:3395使用的是GRS80椭球体，投影比例因子为0.9996。  
EPSG:3857的范围为：
        北：18764656.23
西：-20026376.39      东：20026376.39
        南：-15496570.74


### 坐标系使用建议
+ 如果您需要在<全球范围>内使用地图，建议使用EPSG:3857坐标系。
+ 如果您需要在<特定国家或地区>使用地图，建议使用该国家或地区的局部坐标系，例如EPSG:3395。
+ 如果您需要进行<高精度>的测量，建议使用EPSG:3395坐标系。
+ 如果是为了更好可视化,建议使用EPSG:4326
*/

// Flag : 控件

// Flag: 刻度尺控件
const my_scale = new ScaleLine({
  target: 'scale',
  units: 'metric', //公里制
})
map.addControl(my_scale)

// Flag: 坐标系显示控件
const my_position = new MousePosition({
  target: 'position',
  placeholder: '暂无坐标',
  projection: DEFAULT_PROJECTION, //坐标系
  coordinateFormat: coord => `${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}`,
})
map.addControl(my_position)

// Flag: 视图跳转控件 -->改变显示区域
const my_extent = new ZoomToExtent({
  tipLabel: '跳转',
  // extent 必须是一个区域范围而不是一个中心点
  extent: [114, 32, 120, 40],
  target: 'jump',
})

map.addControl(my_extent)

// Flag: 预览图控件 , 相当于加载了一个新的地图
const my_preview = new OverviewMap({
  target: 'preview1',
  collapsible: false,
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [118, 32],
    projection: DEFAULT_PROJECTION,
  }),
})
map.addControl(my_preview)
document.getElementById('preview1').addEventListener('click', () => {
  OSMlayer.setVisible(true)
  GaudLayer.setVisible(false)
})

const my_preview1 = new OverviewMap({
  target: 'preview2',
  collapsible: false,
  layers: [
    new TileLayer({
      source: new XYZ({
        url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
        wrapX: false,
      }),
    }),
  ],
  view: new View({
    center: [118, 32],
    projection: DEFAULT_PROJECTION,
  }),
})
map.addControl(my_preview1)
document.getElementById('preview2').addEventListener('click', () => {
  GaudLayer.setVisible(true)
  OSMlayer.setVisible(false)
})
