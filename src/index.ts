import { Control, LatLng, LayerGroup, Map, Polyline, TileLayer } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { VisualizeControl } from './controls/VisualizeControl'
import { DailyDistanceHeatMap } from './heatMap'
import './index.css'
import { MotionTagDataParser } from './parser/motionTagDataParser'

const parser = new MotionTagDataParser()
const dailyDistance = new DailyDistanceHeatMap("#heat")

dailyDistance.drawGrid(2024);

const map: Map = new Map('map', {
	zoom: 7,
	center: new LatLng(51.4, 10.0), // Center of germany
})

const osmTileMap = new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
})

const visualizeControl = new VisualizeControl({})
const layerControl = new Control.Layers({}, {}, {})

osmTileMap.addTo(map)
visualizeControl.addTo(map)
layerControl.addTo(map)

const layerGroups: { [key: string]: LayerGroup } = {}

export async function setData(d: string) {
	const start = Date.now()

	await parser.parse(d)

	console.log('Parsing data took', Date.now() - start + 'ms')
	
	dailyDistance.drawData(Object.values(parser.getDistanceHeatMap()))

	// parser.getStays().forEach((stay) => {
	// 	new Marker(stay.position)
	// })

	for (let movement of parser.getMovements()) {
		if (!Object.keys(layerGroups).find((v) => v === movement.mode)) {
			layerGroups[movement.mode] = new LayerGroup([], {})
			layerGroups[movement.mode].addTo(map)
			layerControl.addOverlay(layerGroups[movement.mode], movement.mode)
		}
		new Polyline(movement.path, {
			color: MotionTagDataParser.getColorForMode(movement.mode),
			weight: 5,
		}).addTo(layerGroups[movement.mode])
	}
}


