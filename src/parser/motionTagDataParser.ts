import { LatLng } from "leaflet";
import { LineString, Point, WkbGeometryReader } from "./wkbGeometryParser";

export class MotionTagDataParser {
	private static STAY_HEAT_INTENSITY = 1;
	private static MOVE_HEAT_INTENSITY = 0.1;

	private stays: Stay[] = []
	private movements: Movement[] = []
	private heatMap: [number, number, number][] = []

	public async parse(data: string): Promise<void> {
		for (let line of data.split('\n').slice(1)) {
			let values = line.split(';')
			if (values.length != 24) {
				console.warn("Unexpected CSV line:", line)
				continue;
			}
			let entry: Entry = {
				id: values[0],
				started_at: values[3],
				finished_at: values[5],
			}

			if (values[2] == 'Stay') {
				const reader = WkbGeometryReader.fromHexString(values[11])
				const geometry = reader.readAll<Point>();

				if (geometry.type != 'Point') {
					console.warn("Unexpected CSV line:", line)
					continue;
				}

				this.stays.push({ ...entry, purpose: values[10], position: new LatLng(geometry.y, geometry.x) })
				this.heatMap.push([geometry.y, geometry.x, MotionTagDataParser.STAY_HEAT_INTENSITY])
			} else {

				const reader = WkbGeometryReader.fromHexString(values[11])
				const geometry = reader.readAll<LineString>();

				if (geometry.type != 'LineString') {
					console.warn("Unexpected CSV line:", line)
					continue;
				}

				const path = (geometry.points).map((point) => {
					this.heatMap.push([point.y, point.x, MotionTagDataParser.MOVE_HEAT_INTENSITY])

					return new LatLng(point.y, point.x)
				})

				this.movements.push({ ...entry, mode: values[9], length: parseInt(values[7]), path: path })
			}
		}

		return;
	}

	public getStays(): Stay[] {
		return this.stays;
	}

	public getMovements(): Movement[] {
		return this.movements;
	}

	public getHeatMap(): [number, number, number][] {
		return this.heatMap;
	}
}


export interface Entry {
	id: string
	started_at: string
	finished_at: string
}

export interface Stay extends Entry {
	purpose: string
	position: LatLng
}

export interface Movement extends Entry {
	mode: string
	length: number
	path: LatLng[]
}

