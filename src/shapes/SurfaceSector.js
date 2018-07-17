/*
 * Copyright 2003-2006, 2009, 2017, United States Government, as represented by the Administrator of the
 * National Aeronautics and Space Administration. All rights reserved.
 *
 * The NASAWorldWind/WebWorldWind platform is licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @exports SurfaceSector
 */
define([
        '../error/ArgumentError',
        '../geom/Location',
        '../util/Logger',
        '../shapes/ShapeAttributes',
        '../shapes/SurfaceShape'
    ],
    function (ArgumentError,
              Location,
              Logger,
              ShapeAttributes,
              SurfaceShape) {
        "use strict";

        /**
         * Constructs a surface sector.
         * @alias SurfaceSector
         * @constructor
         * @augments SurfaceShape
         * @classdesc Represents a sector draped over the terrain surface. The sector is specified as a rectangular
         * region in geographic coordinates.
         * <p>
         * SurfaceSector uses the following attributes from its associated shape attributes bundle:
         * <ul>
         *         <li>Draw interior</li>
         *         <li>Draw outline</li>
         *         <li>Interior color</li>
         *         <li>Outline color</li>
         *         <li>Outline width</li>
         *         <li>Outline stipple factor</li>
         *         <li>Outline stipple pattern</li>
         * </ul>
         * @param {Sector} sector This surface sector's sector.
         * @param {ShapeAttributes} attributes The attributes to apply to this shape. May be null, in which case
         * attributes must be set directly before the shape is drawn.
         * @throws {ArgumentError} If the specified boundaries are null or undefined.
         */
        var SurfaceSector = function (sector, attributes) {
            if (!sector) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "SurfaceSector", "constructor", "missingSector"));
            }

            SurfaceShape.call(this, attributes);

            /**
             * This shape's sector.
             * @type {Sector}
             */
            this._sector = sector;
        };

        SurfaceSector.prototype = Object.create(SurfaceShape.prototype);

        Object.defineProperties(SurfaceSector.prototype, {
            /**
             * This shape's sector.
             * @memberof SurfaceSector.prototype
             * @type {Sector}
             */
            sector: {
                get: function() {
                    return this._sector;
                },
                set: function(value) {
                    this.stateKeyInvalid = true;
                    this.resetBoundaries();
                    this._sector = value;
                }
            }
        });

        // Internal use only. Intentionally not documented.
        SurfaceSector.staticStateKey = function(shape) {
            var shapeStateKey = SurfaceShape.staticStateKey(shape);

            return shapeStateKey;
        };

        // Internal use only. Intentionally not documented.
        SurfaceSector.prototype.computeStateKey = function() {
            return SurfaceSector.staticStateKey(this);
        };

        // Internal. Intentionally not documented.
        SurfaceSector.prototype.computeBoundaries = function(dc) {
            var sector = this._sector;

            this._boundaries = new Array(4);

            this._boundaries[0] = new Location(sector.minLatitude, sector.minLongitude);
            this._boundaries[1] = new Location(sector.maxLatitude, sector.minLongitude);
            this._boundaries[2] = new Location(sector.maxLatitude, sector.maxLongitude);
            this._boundaries[3] = new Location(sector.minLatitude, sector.maxLongitude);
        };

        // Internal use only. Intentionally not documented.
        SurfaceSector.prototype.getReferencePosition = function () {
            // Assign the first position as the reference position.
            if (this._boundaries.length > 0){
                return new Location(this.sector.centroidLatitude(), this.sector.centroidLongitude());
            } else {
                return null;
            }
        };

        // Internal use only. Intentionally not documented.
        SurfaceSector.prototype.moveTo = function (globe, position) {
            if (this._boundaries.length > 0) {
                this._boundaries = this.computeShiftedLocations(globe, this.getReferencePosition(), position,
                    this._boundaries);
                this.sector = new WorldWind.Sector(
                    this._boundaries[0].latitude,
                    this._boundaries[1].latitude,
                    this._boundaries[1].longitude,
                    this._boundaries[2].longitude
                );
            }
        };

        return SurfaceSector;
    });
