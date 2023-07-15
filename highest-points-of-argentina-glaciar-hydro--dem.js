// La aplicación proporcionada utiliza Google Earth Engine y JavaScript para crear una aplicación geoespacial interactiva que muestra imágenes satelitales puntos con estilo y leyendas, así como capas adicionales como datos de glaciares, estructuras geológicas, un modelo de elevación digital (DEM) y datos hidrográficos. A continuación, describiremos detalladamente cómo funciona el código y qué representa cada sección:

//Definición de una ubicación y creación de un buffer: El código comienza definiendo las coordenadas para la región de San Juan, Argentina, y luego crea un buffer alrededor de esas coordenadas utilizando el método buffer para generar un área circular con un radio de 600,000 metros, que es aproximadamente equivalente a 600 km.

//Filtrado de una colección de imágenes satelitales: Se utiliza la colección de imágenes Landsat-8 (LC08) para filtrar las imágenes que se encuentran dentro del área del buffer, en un rango de fechas específico y con una cobertura de nubes inferior al 10%. Luego se seleccionan las bandas correspondientes (B4, B3, B2) y se crea una imagen compuesta utilizando el método median para obtener una imagen representativa de la colección.

//Parámetros de visualización de la imagen compuesta: Se definen los parámetros de visualización (visParams) que especifican las bandas a mostrar y los valores mínimo y máximo para la escala de colores.

//Centrado del mapa y adición de la imagen compuesta: El mapa se centra en el área del buffer utilizando el método Map.centerObject, y luego se agrega la imagen compuesta al mapa utilizando el método Map.addLayer. La imagen se recorta al área del buffer utilizando el método clip para mostrar solo los datos dentro de esa región.



var geometry = ee.Geometry.Point(-69.7867, -29.1310); // Coordenadas para San Juan, Argentina
var buffer = geometry.buffer(600000); // Crear un buffer de 600 km alrededor de la geometría del punto
var collection = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
  .filterBounds(buffer) // Usar el buffer para filtrar la colección de imágenes
  .filterDate('2019-12-01', '2023-03-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 10))
  .sort('CLOUD_COVER')
  .select(['B4', 'B3', 'B2']);
var composite = collection.median();
var visParams = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000
};
Map.centerObject(buffer, 7); // Centrar el mapa en el buffer
Map.addLayer(composite.clip(buffer), visParams, 'Landsat 8'); // Recortar la imagen al buffer y agregar al mapa


//Creación de puntos con estilo y etiquetas: Se define una lista de puntos con información adicional, como el nombre, la altura y el color. Cada punto se representa como un objeto en JavaScript.

//Función para aplicar el estilo a los puntos: Se crea una función llamada aplicarEstilo que toma un punto como argumento y aplica un estilo específico. Esta función crea una geometría ficticia y la combina con la información del punto y el estilo correspondiente.

//Creación de una colección de características con estilo: Se utiliza el método map para aplicar la función aplicarEstilo a cada punto de la lista y crear una colección de características (ee.FeatureCollection) con el estilo aplicado.

//Función para agregar los puntos estilizados al mapa: Se define una función llamada agregarPuntosAlMapa que extrae el estilo de cada característica y crea una nueva característica con ese estilo aplicado. Esta función se utiliza en conjunto con el método map para aplicarla a la colección de puntos estilizados y obtener una nueva colección de puntos con el estilo aplicado.

//Agregar los puntos estilizados al mapa: Se utiliza el método Map.addLayer para agregar la colección de puntos estilizados al mapa.

// Crear puntos con estilo y etiquetas
var puntosConEstilo = [
  { nombre: 'Cerro Aconcagua', altura: 6962, color: 'FF0000' },
  { nombre: 'Nevado Ojos Del Salado', altura: 6891, color: '0a0a0a'},
  { nombre: 'Monte Pissis', altura: 6795, color: 'e3ff00' },
  { nombre: 'Cerro Mercedario', altura: 6770, color: "blue" },


];

// Crear una función para aplicar el estilo a los puntos
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

// Crear una lista de características con estilo
var puntosEstilizados = ee.FeatureCollection(
  puntosConEstilo.map(function(punto) {
    return aplicarEstilo(punto);
  })
);

// Definir una función para agregar los puntos estilizados al mapa
var agregarPuntosAlMapa = function(feature) {
  var estilo = feature.get('style');
  return ee.Algorithms.Feature(feature.geometry(), estilo);
};

// Mapear la función de agregar puntos al mapa sobre la colección de puntos estilizados
var puntosMapeados = puntosEstilizados.map(agregarPuntosAlMapa);

// Mostrar los puntos en el mapa
Map.addLayer(puntosMapeados, {}, 'Puntos con Estilo');

//Creación de una leyenda: Se crea un panel de la interfaz de usuario (ui.Panel) para mostrar una leyenda en la esquina inferior derecha del mapa.

//Agregar elementos a la leyenda: Se itera sobre la lista de puntos con estilo y se crea un panel para cada punto que incluye un cuadro de color y una etiqueta con el nombre y la altura del punto.

//Agregar la leyenda al mapa: Se utiliza el método Map.add para agregar el panel de la leyenda al mapa.


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

//Agregar capa de datos de glaciares: Se utiliza el dataset GLIMS para visualizar los glaciares en la región. Se crea una imagen utilizando el método ee.Image().float().paint y se agrega al mapa con una paleta de colores y una opacidad definidas.

//Resaltar puntos específicos en el mapa: Se crean geometrías para resaltar puntos como el Cerro Aconcagua, Cerro Mercedario, Nevado Ojos Del Salado y Monte Pissis utilizando el método ee.Geometry.Point. Estos puntos se agregan al mapa con colores específicos utilizando el método Map.addLayer.

//glims

var dataset = ee.FeatureCollection('GLIMS/20210914');
var visParams = {
  palette: ['gray', 'cyan', 'blue'],
  min: 0.0,
  max: 10.0,
  opacity: 0.5,
};
var image = ee.Image().float().paint(dataset, 'area');

Map.addLayer(image, visParams, 'GLIMS/20210914');
Map.addLayer(dataset, null, 'for Inspector', false);



//Estas líneas de código importan las capas vectoriales "Estructuras2_5M" y "UnidadesGeologicas" desde un proyecto en Google Earth Engine. Estas capas contienen información geoespacial sobre estructuras y unidades geológicas en la región de interés.



 // Resaltar el Cerro Aconcagua.
var aconcagua = ee.Geometry.Point([-70.01195, -32.6531]);
Map.addLayer(aconcagua, {color: 'red'}, 'Cerro Aconcagua');
 // Resaltar el Cerro Mercedario.
var mercedario = ee.Geometry.Point([-70.11309, -31.97929]);
Map.addLayer(mercedario, {color: "blue"}, 'Cerro Mercedario');

var nevado = ee.Geometry.Point([-68.54147, -27.10963]);
Map.addLayer(nevado, {color: 'black'}, 'Nevado Ojos Del Salado');

var pissis = ee.Geometry.Point([-68.79921, -27.7552]);
Map.addLayer(pissis, {color: 'yellow'}, 'Monte Pissis');



//Crear capa de DEM y agregar al mapa: Se utiliza el dataset de DEM de Copernicus para obtener un modelo de elevación digital y se filtran los valores dentro del rango de 800 a 6000 metros. Luego, se agrega la capa de DEM al mapa utilizando el método Map.addLayer.


//DEM
    
var dataset = ee.ImageCollection('COPERNICUS/DEM/GLO30');
var elevation = dataset.select('DEM');

// Filtrar el rango de 400 a 2900 metros
var minElevation = 800;
var maxElevation = 6000;
var elevationRange = elevation.map(function(image) {
  return image.clamp(minElevation, maxElevation);
});

// Visualización del rango de 400 a 2900 metros con opacidad al 30%
var elevationVis = {
  min: minElevation,
  max: maxElevation,
  palette: ['#321911', '#42341d', '#534729', '#645934', '#756f40', '#867d4c', '#978a58', '#a89865', '#b8a672', '#c7b47f', '#d6c28c', '#e5cf9a', '#D8BFD8','#006400', '#228B22', '#32CD32', '#7FFF00', '#8B008B', '#9932CC', '#800080', '#9370DB', '#8A2BE2', '#BA55D3', '#9370DB', '#D8BFD8'], 
  opacity: 0.30 // 30% de opacidad (70% de transparencia)
};

Map.addLayer(elevationRange, elevationVis, 'DEM (400-2900m)');

// Agregar capa de ancho de río: Se utiliza el dataset de datos hidrográficos (MERIT/Hydro) para mostrar el ancho de los ríos en la región. Se define una paleta de colores y se agrega la capa al mapa.
// Mostrar el ancho del río
var hydroDataset = ee.Image("MERIT/Hydro/v1_0_1");
 // Generate a palette of 500 'blue' strings
var palette = ['#966217'];
for (var i = 0; i < 1000; i++) {
  palette.push('blue');
}
 var hydroVisualization = {
  bands: ['viswth'],
  min: 0.05,
  max: 100,
  palette: palette,
  opacity: 0.10
};
 Map.addLayer(hydroDataset, hydroVisualization, "River width");

////Agregar capa de estructuras geológicas: Se agrega una capa vectorial de estructuras geológicas utilizando el dataset correspondiente, y se define la opacidad de la capa agregada.

//Agregar capa de fallas geológicas: Hay un bloque de código incompleto en relación con las fallas geológicas, pero se puede inferir que se está trabajando con geometrías de fallas utilizando el mismo enfoque utilizado para los puntos anteriores.
//capa vectorial estructuras.
var table = ee.FeatureCollection("projects/ee-juannnmanuelll/assets/Estructuras2_5M");

Map.addLayer(table, {}, 'Estructuras').setOpacity(0.5);
Map.addLayer(table2, {}, 'Unidades').setOpacity(0.3);


//final


// Agregar una leyenda al mapa
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

// Crear leyenda título
var legendTitle = ui.Label({
  value: 'Altitud (metros)',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});

// Agregar la leyenda al panel
legend.add(legendTitle);

// Crear los estilos de la leyenda
var palette = elevationVis.palette;
var min = elevationVis.min;
var max = elevationVis.max;

// Calcular los intervalos de altura para la leyenda
var heightInterval = (max - min) / palette.length;

// Loop a través de la paleta y agregar etiquetas
for (var i = 0; i < palette.length; i++) {
  var color = palette[i];
  var lowerBound = Math.round(min + i * heightInterval);
  var upperBound = Math.round(min + (i + 1) * heightInterval);

  var legendLabel = ui.Label({
    value: lowerBound + ' - ' + upperBound,
    style: {
      color: color,
      margin: '0 0 4px 0'
    }
  });

  legend.add(legendLabel);
}

// Añadir la leyenda al mapa
Map.add(legend);

//cargar assets 

var table = ee.FeatureCollection("projects/ee-juannnmanuelll/assets/Estructuras2_5M"),
    table2 = ee.FeatureCollection("projects/ee-juannnmanuelll/assets/UnidadesGeologicas");
