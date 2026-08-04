#!/usr/bin/env python3
"""Convert the simple KML geometries used by Dashi Navi to GeoJSON."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import xml.etree.ElementTree as ET


KML_NAMESPACE = "http://www.opengis.net/kml/2.2"
NS = {"kml": KML_NAMESPACE}


def parse_coordinates(element: ET.Element | None) -> list[list[float]]:
    if element is None or not element.text:
        raise ValueError("座標のない図形があります。")

    coordinates: list[list[float]] = []
    for token in element.text.split():
        parts = token.split(",")
        if len(parts) < 2:
            raise ValueError(f"不正な座標です: {token}")
        longitude, latitude = float(parts[0]), float(parts[1])
        if not -180 <= longitude <= 180 or not -90 <= latitude <= 90:
            raise ValueError(f"緯度経度の範囲が不正です: {token}")
        coordinates.append([longitude, latitude])

    if not coordinates:
        raise ValueError("座標のない図形があります。")
    return coordinates


def polygon_geometry(polygon: ET.Element) -> dict[str, object]:
    outer = parse_coordinates(
        polygon.find(
            "./kml:outerBoundaryIs/kml:LinearRing/kml:coordinates", NS
        )
    )
    if outer[0] != outer[-1]:
        outer.append(outer[0])

    rings = [outer]
    for inner in polygon.findall(
        "./kml:innerBoundaryIs/kml:LinearRing/kml:coordinates", NS
    ):
        ring = parse_coordinates(inner)
        if ring[0] != ring[-1]:
            ring.append(ring[0])
        rings.append(ring)

    return {"type": "Polygon", "coordinates": rings}


def placemark_geometries(placemark: ET.Element) -> list[dict[str, object]]:
    geometries: list[dict[str, object]] = []

    for polygon in placemark.findall(".//kml:Polygon", NS):
        geometries.append(polygon_geometry(polygon))

    for line in placemark.findall(".//kml:LineString", NS):
        geometries.append(
            {
                "type": "LineString",
                "coordinates": parse_coordinates(line.find("./kml:coordinates", NS)),
            }
        )

    for point in placemark.findall(".//kml:Point", NS):
        coordinates = parse_coordinates(point.find("./kml:coordinates", NS))
        geometries.append({"type": "Point", "coordinates": coordinates[0]})

    return geometries


def convert(input_path: Path, feature_name: str) -> dict[str, object]:
    root = ET.parse(input_path).getroot()
    features: list[dict[str, object]] = []

    for placemark in root.findall(".//kml:Placemark", NS):
        for geometry in placemark_geometries(placemark):
            features.append(
                {
                    "type": "Feature",
                    "properties": {"name": feature_name},
                    "geometry": geometry,
                }
            )

    if not features:
        raise ValueError(f"KMLに対応図形がありません: {input_path}")

    return {"type": "FeatureCollection", "features": features}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--feature-name", required=True)
    args = parser.parse_args()

    geojson = convert(args.input, args.feature_name)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(geojson, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"{args.output}: {len(geojson['features'])} features")


if __name__ == "__main__":
    main()
