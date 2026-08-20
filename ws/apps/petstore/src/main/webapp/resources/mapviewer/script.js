/*
 * Copyright 2006 Sun Microsystems, Inc.  All rights reserved.
 * You may not modify, use, reproduce, or distribute this
 * software except in compliance with the terms of the License at:
 *
 *   http://developer.sun.com/berkeley_license.html
 *
 * $Id: script.js,v 1.1 2006/11/02 00:16:54 basler Exp $
 */


/* =============================================================================
   Blueprints AJAX Components -- MapViewerComponent Functions
   ========================================================================== */  


/**
 * Define our component container object (if necessary).
 */
if (bpui_undefined("mapviewer", bpui)) {

  bpui.mapviewer = {


    /**
     * The version number of this script.
     */
    version : {
      major: 0,
      minor: 1,
      patch: 0,
      flag: "",
      toString: function() {
        with (bpui.mapviewer.version) {
          return major + "." + minor + "." + patch + flag;
        }
      }
    }

  }

}


/**
 * Add the specified map control to the specified map.
 *
 * @param map Map to which to add a map control
 * @param control Map control to be added
 */
bpui.mapviewer.addControl = function(map, control) {

  map.addControl(control);

}


/**
 * Add a marker at the specified point to the specified map
 * with the specified HTML markup exposed (as balloon help)
 * when the marker is clicked by the user.
 *
 * @param map Map instance to receive the point
 * @param latitude Latitude of the location to be marked
 * @param longitude Longitude of the location to be marked
 * @param markup HTML markup for a pop-up over the location,
 *  or null for no pop-up
 */
bpui.mapviewer.addMarker = function(map, latitude, longitude, markup) {

  var marker = bpui.mapviewer.createMarker(latitude, longitude);
  map.addOverlay(marker);
  if (markup) {
    GEvent.addListener(marker, 'click', function() {
      marker.openInfoWindowHtml(markup);
    });
  }

}


/**
 * Clear all markers on the specified map.
 *
 * @param map Map instance to be cleared of markers
 */
bpui.mapviewer.clearMarkers = function(map) {

  map.clearOverlays();

}


/**
 * Close the info window on the specified map if it is open.
 *
 * @param map Map on which to close the info window
 */
bpui.mapviewer.closeInfoWindowHtml = function(map) {

  map.closeInfoWindow();

}


/**
 * Create and return a new map instance.
 *
 * @param id DOM identifier of the <div> element to receive the map output
 * @param latitude Latitude the new map should be centered on
 * @param longitude Longitude the new map should be centered on
 * @param zoomLevel Zoom level (1-9)
 *
 * @return The new map instance
 */
bpui.mapviewer.createMap = function(id, latitude, longitude, zoomLevel) {

  var map = new GMap(document.getElementById(id));
  map.centerAndZoom(bpui.mapviewer.createPoint(latitude, longitude), zoomLevel);
  return map;

}


/**
 * Create and return a small Map Control instance with pan and zoom widgets.
 */
bpui.mapviewer.createMapControl = function() {

  return new GSmallMapControl();

}


/**
 * Create and return a new marker instance.
 *
 * @param latitude Latitude of the new marker
 * @param longitude Longitude of the new marker
 *
 * @return The new marker instance
 */
bpui.mapviewer.createMarker = function(latitude, longitude) {

  return new GMarker(bpui.mapviewer.createPoint(latitude, longitude));

}


/**
 * Create and return a new point instance.
 *
 * @param latitude Latitude of the newly created point
 * @param longitude Longitude of the newly created point
 *
 * @return The new point instance
 */
bpui.mapviewer.createPoint = function (latitude, longitude) {

  return new GPoint(longitude, latitude);

}


/**
 * Create and return a Type Control instance that allows the
 * user to switch map types.
 */
bpui.mapviewer.createTypeControl = function() {

  return new GMapTypeControl();

}


/**
 * Return the latitude on which this map is centered
 *
 * @param map Map for which to return the center latitude
 *
 * @return Latitude this map is centered on
 */
bpui.mapviewer.getCenterLatitude = function(map) {

  return map.getCenterLatLng().y;

}


/**
 * Return the longitude on which this map is centered
 *
 * @param map Map for which to return the center longitude
 *
 * @return Longitude this map is centered on
 */
bpui.mapviewer.getCenterLongitude = function(map) {

  return map.getCenterLatLng().x;

}


/**
 * Return the height of the specified map, in degrees of latitude.
 *
 * @param map Map to be analyzed
 *
 * @return Height, measured in degrees of latitude
 */
bpui.mapviewer.getHeight = function(map) {

  return map.getSpanLatLng().height;

}


/**
 * Return the width of the specified map, in degrees of longitude.
 *
 * @param map Map to be analyzed
 *
 * @return Width, measured in degrees of longitude
 */
bpui.mapviewer.getWidth = function(map) {

  return map.getSpanLatLng().width;

}


/**
 * Return the current zoom level of the specified map.
 *
 * @param map Map for which to return the zoom level
 *
 * @return Zoom level of the specified map
 */
bpui.mapviewer.getZoomLevel = function(map) {

  return map.getZoomLevel();

}


/**
 * Open an HTML information window to the specified map, displaying
 * the specified markup.  The info window will be centered over the
 * specified latitude and longitude.
 *
 * @param map Map instance to receive the information window
 * @param latitude Latitude to point the info window at
 * @param longitude Longitude to point the info window at
 * @param markup HTML markup to be displayed in the information window
 */
bpui.mapviewer.openInfoWindowHtml = function(map, latitude, longitude, markup) {

  map.openInfoWindowHtml(bpui.mapviewer.createPoint(latitude, longitude), markup);

}


/**
 * Remove the specified map control from the specified map.
 *
 * @param map Map from which to remove a map control
 * @param control Map control to be removed
 */
bpui.mapviewer.removeControl = function(map, control) {

  map.removeControl(control);

}


/**
 * Remove the specified marker from the specified map.
 *
 * @param map Map from which to remove a marker
 * @param marker Marker to be removed
 */
bpui.mapviewer.removeMarker = function(map, marker) {

  map.removeOverlay(marker);

}


/**
 * Set the center point for the specified map
 *
 * @param map Map to be centered
 * @param latitude New center point latitude
 * @param longitude New center point longitude
 * @param pan Flag indicating whether the map should fluidly
 *  pan to the new center point if it is within the viewport
 */
bpui.mapviewer.setCenter = function(map, latitude, longitude, pan) {

  if (pan) {
    map.recenterOrPanToLatLng(bpui.mapviewer.createPoint(latitude, longitude));
  } else {
    map.centerAtLatLng(bpui.mapviewer.createPoint(latitude, longitude));
  }

}


/**
 * Enable or disable dragging of the specified map.
 *
 * @param map Map on which dragging is to be modified
 * @param flag New state of dragging (true or false)
 */
bpui.mapviewer.setDragging = function(map, flag) {

  if (flag) {
    map.enableDragging();
  } else {
    map.disableDragging();
  }

}


/**
 * Zoom the specified map to the specified zoom level.
 *
 * @param map The map instance to be zoomed
 * @param zoomLevel The new zoom level (1-9)
 */
bpui.mapviewer.setZoomLevel = function(map, zoomLevel) {

  map.zoomTo(zoomLevel);

}


/**
 * Zoom in one level, if possible.
 *
 * @param map The map instance to be zoomed
 */
bpui.mapviewer.zoomIn = function(map) {

  var zoomLevel = bpui.mapviewer.getZoomLevel(map);
  if (zoomLevel > 1) {
    zoomLevel--;
  }
  bpui.mapviewer.setZoomLevel(map, zoomLevel);

}


/**
 * Zoom out one level, if possible.
 *
 * @param map The map instance to be zoomed
 */
bpui.mapviewer.zoomOut = function(map) {

  var zoomLevel = bpui.mapviewer.getZoomLevel(map);
  if (zoomLevel < 9) {
    zoomLevel++;
  }
  bpui.mapviewer.setZoomLevel(map, zoomLevel);

}
