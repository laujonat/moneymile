import React from 'react';

import NavBar from '../ui/nav';
import UserInputForm from '../forms/user_input_form';
import FetchLocationForm from '../forms/fetch_location';
import MapStyle from './map_style';


class Map extends React.Component {
  constructor(props) {
    super(props);
    this.directionsServiceObject = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();

    this.state = {
      userLocation: null,
      userAddress: null,
      status: ''
    };

    this.getUserLocation = this.getUserLocation.bind(this);
    this.initializeMap = this.initializeMap.bind(this);
    this.centerMap = this.centerMap.bind(this);
    // this.parseAddressToLatLng = this.parseAddressToLatLng.bind(this);
    this.drawBoundaries = this.drawBoundaries.bind(this);
    this.newMarker = this.newMarker.bind(this);
  }

  componentDidMount() {
    this.initializeMap();
    this.setState({ status: "FETCHING CURRENT LOCATION..."})
    this.getUserLocation();
  }

  componentDidUpdate() {
    this.initializeMap();
  }

  initializeMap() {
    const sfCenter = { lat: 37.773972, lng: -122.431297 }
    const center = this.state.userLocation || sfCenter;

    const mapOptions = {
      center: center,
      zoom: 13,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      styles: MapStyle
    };

    this.map = new google.maps.Map(this.refs.renderedMap, mapOptions);
    this.marker = new google.maps.Marker({
          position: center,
          map: this.map,
        });
  }

  centerMap(locationLatLng) {
    this.setState({
      userLocation: locationLatLng
    })
  }

  // parseAddressToLatLng(address) {
  //   const geocoder = new google.maps.Geocoder;
  //   geocoder.geocode({ address: address }, (results, status) => {
  //     //include componentRestrictions? Restrict to areas lyft operates?
  //     if (status === 'OK') {
  //       const addressLatLng = {
  //         lat: results[0].geometry.location.lat(),
  //         lng: results[0].geometry.location.lng()
  //       }
  //       console.log("addy", addressLatLng);
  //       this.centerMap(addressLatLng)
  //     } else {
  //       console.log('did not work')
  //     }
  //   });
  // }

  getUserLocation() {
    const successCallback = (position) => {
      const parsedLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.setState({userLocation: parsedLocation})

      const geocoder = new google.maps.Geocoder;
      this.setState({ userLocation: parsedLocation });
      geocoder.geocode({ location: parsedLocation }, (results, status) => {
        //include componentRestrictions? Restrict to areas lyft operates?
        if (status === 'OK') {
          this.setState(
            { userAddress: results[0].formatted_address },
            console.log("should have recentered")
          )
        } else {
          console.log('did not work')
        }
      });
    };

    const errorCallback = (error) => {
      console.log(error);
      // this.setState({ status: `Couldn't find current location.. &#9785`})
      this.setState({ status: "SORRY, COULDN'T FIND YOU..."});
      setTimeout(function(){
        this.setState({userAddress: " "});
      }.bind(this), 3000);
    }

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
      timeout: 10000,
      enableHighAccuracy: true
    });
  }

  newMarker(pos) {
    new google.maps.Marker({
      position: pos,
      map: this.map,
      title: `${pos.lat()}, ${pos.lng()}`
    });
  }

  drawBoundaries(boundaries) {
    let boundariesArray = [];

    for (let i = 0; i < 18; i++) {
      boundariesArray.push(i);
    }

    boundariesArray = boundariesArray.map(index => boundaries[index]);

    boundariesArray.forEach((boundary, index) => {
      new google.maps.Marker({
        position: boundary,
        map: this.map,
        title: `${index}`
      });
    });

    const bermudaTriangle = new google.maps.Polygon({
         paths: boundariesArray,
         strokeColor: '#FF0000',
         strokeOpacity: 0.8,
         strokeWeight: 3,
         fillColor: '#FF0000',
         fillOpacity: 0.35
       });
    const bounds = new google.maps.LatLngBounds();
    boundariesArray.forEach((coord) => bounds.extend(coord));
    this.map.fitBounds(bounds);
    bermudaTriangle.setMap(this.map);
  }

  render() {
    let form;
    if (this.state.userAddress) {
      form = <UserInputForm
                currentAddress={this.state.userAddress}

                drawBoundaries={this.drawBoundaries}
                newMarker={this.newMarker}
                map={this.map}
              />;
    } else {
      form = <FetchLocationForm currentStatus={this.state.status} />
    }

    return (
      <div className="map-component">
        <div ref="renderedMap" id="map-container" />
        {form}
      </div>
    );
  }
}

export default Map;
