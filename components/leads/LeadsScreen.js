import React, {Component} from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import {GlobalStyles} from '../layout/GlobalStyles';
import {Api} from '../data/Api';
import LeadsList from './LeadsList';
import LeadsMap from './LeadsMap';

let isList = false;

export default class LeadsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {data: [], markers: [], isList: false};
    this.mapRef = null;
  }

  passMapRef(ref) {
    this.mapRef = ref;
  }

  setIsList(b) {
    isList = !isList;
    this.setState({ isList: isList });
    this.fetchData();
  }

  componentDidMount() {
    var that = this;
    this.props.navigation.setParams({ setIsList: this.setIsList.bind(this) });
    Api.getAuthCredentials()
      .then((credentials) => {
        that.fetchData();
      })
      .catch((error) => {
        console.log('Failed to authenticate:' + error)
      });
  }

  fetchData() {
    var that = this;
    this.props.leadApiFn()
      .then((response) => {
        const filtered = response.records.filter(r => {
          return r.Address != null
            && r.Address.latitude != null
            && r.Address.longitude != null;
        });

        markers = filtered.map(r => ({
          id: r.Id,
          latlng: {
            latitude: r.Address.latitude,
            longitude: r.Address.longitude
          },
          title: `${r.FirstName} ${r.LastName}`,
          description: `${r.Address.street},
            ${r.Address.city}
            ${r.Address.country}`,
        }));
        markerIds = markers.map(r => r.id);

        that.setState({data: filtered, markers})
        if (this.mapRef) {
          this.mapRef.fitToSuppliedMarkers(markerIds, true);
        }
      });
  }

  render() {
    const listView = <LeadsList data={this.state.data} />;
    const mapView = <LeadsMap passMapRef={this.passMapRef.bind(this)} style={styles.mapView} data={this.state.data} markers={this.state.markers} />;
    let view;
    if (isList) {
      view = listView;
    } else {
      view = mapView;
    }

    return (
      <View style={GlobalStyles.container}>{view}</View>
    );
  }
}

const styles = StyleSheet.create({
  mapView: {
    flex: 1
  }
});