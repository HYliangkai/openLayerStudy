1. 数据(图层)如何分层展示?

   图层显示

   --> 图层使用`map.addLayer`来添加图层数据

   在不同缩放级别的地图显示不同的图层

   --> 控制layer的两个参数`maxZoom`|`minZoom`来达到控制缩放级别的内容显示



2. 定位的动画效果如何实现? 

   ---> 内置视图跳转控件 `ZoomToExtent` 实现跳转到某个位置



3. 如何实现 不同类型的地图切换的(不同的layer?)

   ---> `TileLayer.setVisible(boolean)` 来控制不同类型的地图的显隐



4. 如何实现点击地图某个位置然后出现一个点,然后地图就给出具体经纬度坐标

   ---> `map.on('click',(event:{coordinate})=>{})`事件获取



5. 如何实现航迹动画效果? 如果显示的数据类似导航效果要怎么实现
   ---> 历史轨迹
