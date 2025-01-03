import { Control, LatLng, LayerGroup, Map, Polyline, TileLayer } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { VisualizeControl } from './controls/VisualizeControl'
import './index.css'
import { MotionTagDataParser } from './parser/motionTagDataParser'

const parser = new MotionTagDataParser()

const map: Map = new Map('map', {
	zoom: 7,
	center: new LatLng(51.4, 10.0), // Center of germany
})

const osmTileMap = new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
})

const visualizeControl = new VisualizeControl({})
const layerControl = new Control.Layers({}, {}, {});

osmTileMap.addTo(map)
visualizeControl.addTo(map)
layerControl.addTo(map)

const layerGroups: {[key:string]: LayerGroup} = {};

export async function setData(d: string) {
	const start = Date.now()

	await parser.parse(d)

	console.log('Parsing data took', Date.now() - start + 'ms')

	// parser.getStays().forEach((stay) => {
	// 	new Marker(stay.position)
	// })

	for (let movement of parser.getMovements()) {
		const shortName = movement.mode.substring(6)
		if (!Object.keys(layerGroups).find((v) => v === movement.mode.substring(6))) {
			layerGroups[shortName] = new LayerGroup([], {});
			layerGroups[shortName].addTo(map);
			layerControl.addOverlay(layerGroups[shortName], shortName);
		}
		new Polyline(movement.path, {
			color: getColorForMode(shortName),
			weight: 5,
		}).addTo(layerGroups[shortName])
	}
}

function getColorForMode(shortName: string) {
	// Not every Mode is currently mapped
	switch (shortName) {
		case 'Hiking':
		case 'Walk':
			return '#dfba06'
		case 'LightRail':
			return '#37ab9e'
		case 'RegionalTrain':
			return '#da73a0'
		case 'Train':
			return '#cd3841'
		case 'Ecar':
		case 'Car':
			return '#d48004'
		case 'Subway':
			return '#3d8eb4'
		case 'Tram':
			return '#2dabc4'
		case 'Bicycle':
			return '#8da433'
		case 'Airplane':
			return '#e8b100'
		case 'Bus':
			return '#5178ab'
		case 'Boat':
			return '#6d6db0'
		case 'Cablecar':
		case 'KickScooter':
		default:
			console.log('No color for:', shortName)
			return '#4c8b9c'
	}
}
