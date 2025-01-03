// Ref.: https://libgeos.org/specifications/wkb/

export class WkbGeometryReader {
	// Geometry Types
	public static Point = 0x00000001
	private static LineString = 0x00000002
	private static Polygon = 0x00000003
	private static MultiPoint = 0x00000004
	private static MultiLineString = 0x00000005
	private static MultiPolygon = 0x00000006
	private static GeometryCollection = 0x00000007

	// Modifiers
	private static WithZ = 0x80000000
	private static WithM = 0x40000000
	public static WithSRID = 0x20000000

	private bytes: Uint8Array
	private dataView: DataView
	private cursor = 0

	private littleEndian = false

	constructor(bytes: Uint8Array) {
		this.bytes = bytes
		this.dataView = new DataView(this.bytes.buffer)
		let byteOrder = this.readByte()
		if (byteOrder == 1) {
			this.littleEndian = true;
		} else {
			this.littleEndian = false;
		}
	}

	public static fromHexString(data: string): WkbGeometryReader {
		let chunk = data.split('').reduce((totalBytes, _, index, hexData) => {
			if (index % 2 == 0) {
				let num = parseInt(`${hexData[index]}${hexData[index + 1]}`, 16)
				totalBytes[index / 2] = num
				return totalBytes
			} else {
				return totalBytes
			}
		}, new Uint8Array(data.length / 2))

		return new WkbGeometryReader(chunk)
	}

	private readByte(): number {
		let byte = this.bytes[this.cursor]
		this.cursor += 1
		return byte
	}

	private readNBytes(n: number): number {
		let long = this.bytes[this.cursor]
		for (let i = 1; i < n; i++) {
			long <<= 8
			long |= this.bytes[this.cursor + i]
		}
		this.cursor += n
		return long
	}

	private readLong(): number {
		const long = this.dataView.getInt32(this.cursor, this.littleEndian);
		this.cursor += 4;
		return long;
	}

	private readDouble(): number {
		const float = this.dataView.getFloat64(this.cursor, this.littleEndian);
		this.cursor += 8;
		return float;
	}

	private readPoint(): Point {
		return {
			type: "Point",
			x: this.readDouble(),
			y: this.readDouble()
		};
	}

	private readLineString(): LineString {
		const numPoints = this.readLong();
		const points: Point[] = [];

		for (let i = 0; i < numPoints; i++) {
			points.push(this.readPoint());
		}

		return {type: "LineString", numPoints, points}
	}

	public readAll<T extends Geometry>(): T {
		let result: T = {} as T;
		const type = this.readLong()
		if ((type & 0xff0000000) == WkbGeometryReader.WithSRID)
			result.srid= this.readLong()

		switch (type & 0x000000FF) {
			case WkbGeometryReader.Point:
				result = {...result, ...this.readPoint()}
				break;
			case WkbGeometryReader.LineString:
				result = {...result, ...this.readLineString()}
				break;
			default:
				console.log('Unknown Geometry Type: ' + (type & 0x000000FF))
		}

		return result;
	}
}

export interface Geometry {
	type: string
	srid?: number
}

export interface Point extends Geometry {
	x: number
	y: number
	z?: number
}

export interface LineString extends Geometry {
	numPoints: number
	points: Point[]
}
