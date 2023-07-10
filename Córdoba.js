// Coordenadas para Córdoba, Argentina
var cordobaCoords = [-64.936, -31.987];

// Crear un punto a partir de las coordenadas
var cordobaPoint = ee.Geometry.Point(cordobaCoords);

// Crear un buffer de 100 km alrededor del punto
var buffer = cordobaPoint.buffer(400000);

// Función para aplicar el estilo a los puntos
var aplicarEstilo = function(punto) {
  var geometry = ee.Geometry.Point([0, 0]); // Crear una geometría ficticia
  var feature = ee.Feature(geometry, punto);
  return feature.set('style', {
    color: punto.color,
    fillColor: punto.color,
    opacity: 1,
    fillOpacity: 1,
    radius: 4
  });
};

// Lista de puntos con estilo y etiquetas
var puntosConEstilo = [
  { nombre: 'Cerro Champaquí', altura: 2884, color: 'FF0000' },
  { nombre: 'Cerro Los Gigantes', altura: 2374, color: '00FF00' },
  { nombre: 'Cerro Uritorco', altura: 1949, color: '0000FF' },
];

// Crear una colección de características con estilo
var puntosEstilizados = ee.FeatureCollection(puntosConEstilo.map(aplicarEstilo));

// Función para agregar los puntos estilizados al mapa
var agregarPuntosAlMapa = function(feature) {
  var estilo = feature.get('style');
  return ee.Algorithms.Feature(feature.geometry(), estilo);
};

// Mapear la función de agregar puntos al mapa sobre la colección de puntos estilizados
var puntosMapeados = puntosEstilizados.map(agregarPuntosAlMapa);

// Crear una leyenda
var leyendaPanel = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px'
  }
});

// Agregar elementos a la leyenda
puntosConEstilo.forEach(function(punto) {
  var etiqueta = punto.nombre + ' - Altura: ' + punto.altura + ' metros';

  var colorBox = ui.Label({
    style: {
      backgroundColor: punto.color,
      padding: '8px',
      margin: '0 5px',
      fontWeight: 'bold'
    }
  });

  var etiquetaLabel = ui.Label(etiqueta, { fontWeight: 'bold' });

  var panelItem = ui.Panel({
    widgets: [colorBox, etiquetaLabel],
    layout: ui.Panel.Layout.Flow('horizontal')
  });

  leyendaPanel.add(panelItem);
});

// Agregar la leyenda al mapa
Map.add(leyendaPanel);

// Agregar los puntos estilizados al mapa
Map.addLayer(puntosMapeados, {}, 'Puntos con Estilo');

// Centrar el mapa en el buffer
Map.centerObject(buffer, 8.5);

// Filtrar y mostrar imágenes Landsat
var landsatCollection = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
  .filterBounds(buffer)
  .filterDate('2021-01-01', '2022-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 20))
  .sort('CLOUD_COVER')
  .select(['B4', 'B3', 'B2']);

var landsatComposite = landsatCollection.median();
var visParams = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000
};

// Clip la imagen al buffer y agregarla al mapa
Map.addLayer(landsatComposite.clip(buffer), visParams, 'Landsat 8');

// Resaltar los puntos en el mapa
var champaqui = ee.Geometry.Point([-64.936, -31.987]);
var uritorco = ee.Geometry.Point([-64.477, -30.845]);
var gigantes = ee.Geometry.Point([-64.805, -31.419]);

Map.addLayer(champaqui, { color: 'red' }, 'Cerro Champaquí');
Map.addLayer(uritorco, { color: 'blue' }, 'Cerro Uritorco');
Map.addLayer(gigantes, { color: 'green' }, 'Cerro Los Gigantes');

// Mostrar las coordenadas de los puntos
print('Coordenadas Cerro Champaquí:', champaqui);
print('Coordenadas Cerro Uritorco:', uritorco);
print('Coordenadas Cerro Los Gigantes:', gigantes);

//fallas


var geometry9 = /* color: #ff0000 */geometry13,
    geometry10 = /* color: #ff0000 */geometry12,
    geometry11 = /* color: #ff0000 */geometry11,
    geometry12 = /* color: #ff0000 */geometry10,
    geometry14 = /* color: #ff0000 */geometry9,
    geometry4 = /* color: #ff0000 */geometry7,
    geometry13 = /* color: #ff0000 */geometry6,
    geometry15 = /* color: #ff0000 */geometry5,
    geometry16 = /* color: #ff0000 */geometry4,
    geometry17 = /* color: #ff0000 */geometry3,
    geometry21 = /* color: #ff0000 */geometry2,
    geometry28 = /* color: #ff0000 */geometry8,
    geometry = /* color: #ff0000 */geometry;

//DEM
    
var dataset = ee.ImageCollection('COPERNICUS/DEM/GLO30');
var elevation = dataset.select('DEM');

// Filtrar el rango de 400 a 2900 metros
var minElevation = 800;
var maxElevation = 2900;
var elevationRange = elevation.map(function(image) {
  return image.clamp(minElevation, maxElevation);
});

// Visualización del rango de 400 a 2900 metros con opacidad al 30%
var elevationVis = {
  min: minElevation,
  max: maxElevation,
  palette: ['#372914', '#86481e', '#965f00', '#fffae5', '#FF0000', '#FF1493', '#FF69B4', '#FFC0CB', '#0c7409', '#00FF00', '#00FF7F', '#00FFFF', '#1E90FF', '#0000FF', '#8A2BE2', '#4B0082', '#800080'] , 
  opacity: 0.30 // 30% de opacidad (70% de transparencia)
};

Map.addLayer(elevationRange, elevationVis, 'DEM (400-2900m)');

// Mostrar el ancho del río
// Mostrar el ancho del río
var hydroDataset = ee.Image("MERIT/Hydro/v1_0_1");
 // Generate a palette of 500 'blue' strings
var palette = ['#966217'];
for (var i = 0; i < 500; i++) {
  palette.push('blue');
}
 var hydroVisualization = {
  bands: ['viswth'],
  min: 0.75,
  max: 100,
  palette: palette,
  opacity: 0.05
};
 Map.addLayer(hydroDataset, hydroVisualization, "River width");
